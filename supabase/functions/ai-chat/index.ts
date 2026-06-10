// AI Chat Handler — Anthropic SDK with streaming
// Upgraded: claude-opus-4-6 + npm:@anthropic-ai/sdk + SSE streaming

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  context?: {
    equipmentId?: string;
    categoryId?: string;
    location?: string;
    userId?: string;
  };
  provider?: 'openai' | 'anthropic';
  stream?: boolean;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY ?? '' });

const SYSTEM_PROMPT = `You are Kayd, an intelligent AI assistant for Islakayd - a premium equipment rental marketplace. Your role is to help users find, compare, and book rental equipment.

## Your Capabilities:
1. **Equipment Search**: Help users find the right equipment for their projects
2. **Price Comparison**: Compare prices and help users get the best deals
3. **Booking Assistance**: Guide users through the booking process
4. **Recommendations**: Suggest equipment based on project requirements
5. **General Questions**: Answer questions about rentals, policies, and platform features

## Guidelines:
- Be friendly, helpful, and conversational
- Keep responses concise but informative (aim for 2-4 short paragraphs)
- Use emojis sparingly to add personality (1-2 per response max)
- When suggesting equipment, include relevant details like price range and key features
- If you don't have specific information, provide general guidance and suggest the user browse the catalog
- Always prioritize user safety and encourage reading equipment manuals

## Available Categories:
- Construction Equipment (excavators, loaders, bulldozers)
- Power Tools (drills, saws, sanders)
- Photography & Video (cameras, lenses, lighting)
- Audio & DJ Equipment (speakers, mixers, microphones)
- Landscaping (mowers, trimmers, blowers)
- Event Equipment (tents, tables, chairs, lighting)
- Vehicles (trucks, trailers, vans)
- Medical Equipment (wheelchairs, hospital beds)

## Platform Features:
- Instant booking with secure payments
- Verified owners with reviews
- Delivery and pickup options
- Insurance protection available
- 24/7 customer support

When users ask about specific equipment or projects, provide helpful recommendations. If they seem ready to book, encourage them to browse the available listings.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const { messages, context, provider = 'anthropic', stream = false } = body;

    // Build context-enriched system prompt
    let enhancedSystemPrompt = SYSTEM_PROMPT;

    if (context?.equipmentId) {
      const { data: equipment } = await supabase
        .from('equipment')
        .select('title, description, daily_rate, features, specifications, category:categories(name)')
        .eq('id', context.equipmentId)
        .single();

      if (equipment) {
        enhancedSystemPrompt += `\n\n## Current Equipment Context:
The user is viewing: ${equipment.title}
Category: ${equipment.category?.name}
Daily Rate: $${equipment.daily_rate}
Features: ${equipment.features?.join(', ')}
Description: ${equipment.description}`;
      }
    }

    if (context?.location) {
      enhancedSystemPrompt += `\n\nUser's location: ${context.location}`;
    }

    const { data: featuredEquipment } = await supabase
      .from('equipment')
      .select('title, daily_rate, rating, category:categories(name)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(5);

    if (featuredEquipment && featuredEquipment.length > 0) {
      enhancedSystemPrompt += `\n\n## Featured Equipment Available:\n${featuredEquipment
        .map((e) => `- ${e.title} (${e.category?.name}) - $${e.daily_rate}/day, ${e.rating}⭐`)
        .join('\n')}`;
    }

    // Normalize messages: Claude uses a top-level system param, not a system role message
    const claudeMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Build system as an array so we can cache the static part.
    // SYSTEM_PROMPT is large and never changes — cache it for ~90% token savings.
    // Dynamic context (equipment, location) is appended uncached.
    const systemBlocks: Anthropic.TextBlockParam[] = [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // @ts-ignore — cache_control is a beta field not yet in the type defs
        cache_control: { type: 'ephemeral' },
      },
    ];
    if (enhancedSystemPrompt !== SYSTEM_PROMPT) {
      systemBlocks.push({
        type: 'text',
        text: enhancedSystemPrompt.slice(SYSTEM_PROMPT.length),
      });
    }

    // --- STREAMING path (SSE) ---
    if (stream && ANTHROPIC_API_KEY) {
      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            const s = anthropic.messages.stream({
              model: 'claude-opus-4-6',
              max_tokens: 1024,
              system: systemBlocks,
              messages: claudeMessages,
            } as Parameters<typeof anthropic.messages.stream>[0]);

            let fullText = '';

            for await (const event of s) {
              if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
              ) {
                fullText += event.delta.text;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`
                  )
                );
              }
            }

            const suggestions = generateSuggestions(messages[messages.length - 1].content, fullText);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'done', suggestions })}\n\n`
              )
            );
          } catch (err) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // --- NON-STREAMING path (JSON) ---
    let response: string;

    if (ANTHROPIC_API_KEY && (provider === 'anthropic' || !OPENAI_API_KEY)) {
      const msg = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: systemBlocks,
        messages: claudeMessages,
      } as Parameters<typeof anthropic.messages.create>[0]);
      response = msg.content[0].type === 'text' ? msg.content[0].text : '';
    } else if (OPENAI_API_KEY) {
      response = await callOpenAI(messages, enhancedSystemPrompt);
    } else {
      response = generateFallbackResponse(messages[messages.length - 1].content);
    }

    const suggestions = generateSuggestions(messages[messages.length - 1].content, response);

    return new Response(
      JSON.stringify({ content: response, suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        content: "I'm having trouble processing your request right now. Please try again in a moment.",
        suggestions: ['Browse equipment', 'View categories', 'Contact support'],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

async function callOpenAI(messages: Message[], systemPrompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return `💰 Equipment prices on Islakayd vary by type and rental duration:

**Power Tools**: $25-100/day
**Photography Gear**: $50-250/day
**Heavy Equipment**: $200-800/day
**Event Supplies**: $100-500/day

Pro tip: Weekly and monthly rentals often include discounts up to 30%! What type of equipment are you looking for?`;
  }

  if (lowerMessage.includes('book') || lowerMessage.includes('reserve') || lowerMessage.includes('rent')) {
    return `📅 Booking on Islakayd is quick and easy!

1. Find the equipment you need
2. Select your rental dates
3. Complete secure checkout
4. Pick up or arrange delivery

Most owners confirm within 2 hours. Would you like help finding specific equipment?`;
  }

  if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
    return `📸 We have great photography gear available! Popular rentals include:

• Sony A7IV Full Frame Kit - from $125/day
• Canon R5 Professional - from $150/day
• Lighting & Grip packages

What kind of shoot are you planning? I can recommend the perfect setup!`;
  }

  if (lowerMessage.includes('excavator') || lowerMessage.includes('construction') || lowerMessage.includes('heavy')) {
    return `🚜 Heavy equipment is one of our most popular categories!

• Mini Excavators (1-3 ton) - from $250/day
• Full-size Excavators - from $400/day
• Backhoe Loaders, Skid Steers available

All come with safety equipment and manuals. What size project are you working on?`;
  }

  if (lowerMessage.includes('wedding') || lowerMessage.includes('event') || lowerMessage.includes('party')) {
    return `🎉 We have everything for your event!

• Tents (all sizes) - from $300/day
• Tables, chairs, linens
• Lighting & sound systems
• Setup services available

How many guests are you expecting? I can help build the perfect package!`;
  }

  return `👋 I'm here to help you find the perfect equipment!

You can ask me about:
• Finding equipment for your project
• Comparing prices and features
• How booking and payments work
• Delivery and pickup options

What are you looking to rent today?`;
}

function generateSuggestions(userMessage: string, response: string): string[] {
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();

  if (lowerMessage.includes('price') || lowerResponse.includes('price')) {
    return ['Show cheapest options', 'Compare weekly rates', 'View premium equipment'];
  }
  if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
    return ['Wedding photography gear', 'Video production kit', 'See all cameras'];
  }
  if (lowerMessage.includes('construction') || lowerMessage.includes('excavator')) {
    return ['Mini excavators', 'View all heavy equipment', 'Get delivery quote'];
  }
  if (lowerMessage.includes('event') || lowerMessage.includes('wedding')) {
    return ['Tent packages', 'DJ equipment', 'See event bundles'];
  }
  if (lowerMessage.includes('book') || lowerMessage.includes('how')) {
    return ['Browse equipment', 'View my bookings', 'Contact support'];
  }

  return ['Browse all equipment', 'Popular rentals', 'How it works', 'Contact support'];
}
