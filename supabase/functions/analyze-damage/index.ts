// Damage Detection — Claude vision via Anthropic SDK with structured tool output.
// Used by AIDamageDetection.tsx for pre-/post-rental equipment inspection.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY ?? '' });

// Maximum photos per request. Claude vision allows up to 100, but cost and
// latency dominate before then; cap at 8 to keep one analysis cheap and snappy.
const MAX_PHOTOS = 8;

// Per-photo and total-payload caps on the base64 string length. Count-only
// limits aren't enough — a single oversized photo can blow up token cost,
// upstream timeouts, and Edge Function memory. 6 MB base64 ≈ 4.5 MB decoded
// per image; 25 MB total leaves headroom under the Supabase Edge Function
// body limit while bounding worst-case Claude input tokens.
const MAX_PHOTO_BASE64_BYTES = 6 * 1024 * 1024;
const MAX_TOTAL_BASE64_BYTES = 25 * 1024 * 1024;

type DamageType = 'scratch' | 'dent' | 'crack' | 'stain' | 'missing-part' | 'wear' | 'other';
type Severity = 'minor' | 'moderate' | 'major';
type MediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

interface DetectedDamage {
  id: string;
  type: DamageType;
  severity: Severity;
  location: string;
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedCost: number;
  description: string;
}

interface AnalyzeRequest {
  photos: string[];
  equipmentTitle?: string;
  type?: 'pre-rental' | 'post-rental';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return json({ error: 'ANTHROPIC_API_KEY not configured on Edge Functions', damages: [] }, 503);
    }

    const { photos, equipmentTitle, type }: AnalyzeRequest = await req.json();

    if (!Array.isArray(photos) || photos.length === 0) {
      return json({ error: 'No photos provided', damages: [] }, 400);
    }

    const limitedPhotos = photos.slice(0, MAX_PHOTOS);

    let totalBytes = 0;
    const imageBlocks = limitedPhotos.map((dataUrl, idx) => {
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
      if (!match) {
        throw new Error(`Photo ${idx + 1} is not a base64 data URL of a supported image type`);
      }
      const base64 = match[2];
      if (base64.length > MAX_PHOTO_BASE64_BYTES) {
        throw new Error(
          `Photo ${idx + 1} is ${Math.round(base64.length / 1024 / 1024)} MB ` +
            `(limit ${MAX_PHOTO_BASE64_BYTES / 1024 / 1024} MB). ` +
            `Reduce image resolution or compression before retrying.`
        );
      }
      totalBytes += base64.length;
      if (totalBytes > MAX_TOTAL_BASE64_BYTES) {
        throw new Error(
          `Combined photo payload exceeds ${MAX_TOTAL_BASE64_BYTES / 1024 / 1024} MB ` +
            `after photo ${idx + 1}. Send fewer photos or compress them before retrying.`
        );
      }
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: match[1] as MediaType,
          data: base64,
        },
      };
    });

    const contextLines: string[] = [];
    if (equipmentTitle) contextLines.push(`Equipment: ${equipmentTitle}`);
    if (type) contextLines.push(`Inspection: ${type === 'pre-rental' ? 'before the rental starts' : 'after the rental ends'}`);
    const contextBlock = contextLines.length > 0 ? `${contextLines.join('\n')}\n\n` : '';

    const prompt = `${contextBlock}Analyze the attached photo(s) of rental equipment for visible damage.

Call the report_damage tool ONCE per distinct piece of damage. If the equipment appears undamaged, do not call the tool at all.

Be conservative. Only report damage you can clearly see in the image. Do NOT invent damage that is not visible. Normal wear that does not affect function should be reported with severity "minor" and estimatedCost 0.

Severity guidance:
- minor: cosmetic, no functional impact (scratches, surface stains, normal wear)
- moderate: noticeable, may affect appearance or partial function (dents, deep stains, worn grips)
- major: affects safety or core function (cracks, missing parts, broken components)

boundingBox uses percentages of the photo dimensions where {x, y} is the top-left corner of the damage and (0, 0) is the top-left of the photo.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [
        {
          name: 'report_damage',
          description: 'Report a single piece of visible damage found in the photo(s).',
          input_schema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['scratch', 'dent', 'crack', 'stain', 'missing-part', 'wear', 'other'],
              },
              severity: { type: 'string', enum: ['minor', 'moderate', 'major'] },
              location: {
                type: 'string',
                description: 'Short human-readable description of where on the equipment the damage is, e.g. "front panel, upper-right" or "handle grip".',
              },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              boundingBox: {
                type: 'object',
                properties: {
                  x: { type: 'number', minimum: 0, maximum: 100 },
                  y: { type: 'number', minimum: 0, maximum: 100 },
                  width: { type: 'number', minimum: 0, maximum: 100 },
                  height: { type: 'number', minimum: 0, maximum: 100 },
                },
                required: ['x', 'y', 'width', 'height'],
              },
              estimatedCost: {
                type: 'integer',
                minimum: 0,
                description: 'USD estimated repair cost (whole dollars). Use 0 for normal wear that does not need repair.',
              },
              description: { type: 'string', description: 'One short sentence explaining the damage.' },
            },
            required: ['type', 'severity', 'location', 'confidence', 'boundingBox', 'estimatedCost', 'description'],
          },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: prompt }],
        },
      ],
    } as Parameters<typeof anthropic.messages.create>[0]);

    const damages: DetectedDamage[] = [];
    let i = 0;
    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'report_damage') {
        const input = block.input as Omit<DetectedDamage, 'id'>;
        damages.push({ id: `${Date.now()}-${i++}`, ...input });
      }
    }

    return json({ damages });
  } catch (error) {
    console.error('analyze-damage error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message, damages: [] }, 500);
  }
});
