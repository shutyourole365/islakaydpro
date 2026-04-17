import { useState, useRef, useEffect } from 'react';
import {
  Hammer,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ── Types ──────────────────────────────────────────────────────────────────

interface EquipmentItem {
  name: string;
  category: string;
  quantity: number;
  durationDays: number;
  estimatedDailyRate: number;
  purpose: string;
  priority: 'essential' | 'recommended' | 'optional';
  matchedListing?: {
    id: string;
    title: string;
    daily_rate: number;
    images: string[];
    owner: { full_name: string };
  };
}

interface ProjectPlan {
  projectSummary: string;
  timeline: string;
  equipmentList: EquipmentItem[];
  totalEstimatedCost: number;
  tips: string[];
  warnings: string[];
}

interface ProjectPlannerProps {
  onClose: () => void;
  onBrowseEquipment: (query: string) => void;
}

// ── Step 1 — Project Description ───────────────────────────────────────────

const PROJECT_TEMPLATES = [
  { label: '🏠 Home Renovation', prompt: 'I want to renovate my bathroom/kitchen' },
  { label: '🌿 Landscaping', prompt: 'I need to clear and landscape my backyard' },
  { label: '🏗️ Construction', prompt: 'I\'m building a deck/pergola' },
  { label: '🎉 Event', prompt: 'I\'m hosting an outdoor event for 50 people' },
  { label: '📸 Photography', prompt: 'I\'m filming a short film / photo shoot' },
  { label: '🚚 Moving', prompt: 'I\'m moving house and need equipment' },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function ProjectPlanner({ onClose, onBrowseEquipment }: ProjectPlannerProps) {
  const [step, setStep] = useState<'describe' | 'details' | 'planning' | 'results'>('describe');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [budget, setBudget] = useState('');
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === 'describe') textareaRef.current?.focus();
  }, [step]);

  const handleTemplate = (prompt: string) => {
    setDescription(prompt);
    textareaRef.current?.focus();
  };

  const handleDescribeNext = () => {
    if (description.trim().length < 10) {
      setError('Tell me a bit more about your project.');
      return;
    }
    setError('');
    setStep('details');
  };

  const handleGenerate = async () => {
    setStep('planning');
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const prompt = buildProjectPrompt({ description, location, startDate, durationDays, budget });

      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          provider: 'anthropic',
          stream: false,
        }),
      });

      if (!response.ok) throw new Error('AI service unavailable');

      const data = await response.json();
      const parsed = parseAIPlan(data.content, durationDays);
      await matchListings(parsed);
      setPlan(parsed);
      setStep('results');
    } catch (e) {
      setError('Could not generate your plan. Please try again.');
      setStep('details');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Project Planner</h2>
              <p className="text-xs text-teal-100">Tell me your project — I'll figure out the gear</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex">
          {['describe', 'details', 'planning', 'results'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 transition-colors ${
                ['describe', 'details', 'planning', 'results'].indexOf(step) >= i
                  ? 'bg-teal-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1 — Describe */}
          {step === 'describe' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">What's the project?</h3>
                <p className="text-sm text-gray-500">The more detail you give, the better the equipment list.</p>
              </div>

              {/* Templates */}
              <div className="flex flex-wrap gap-2">
                {PROJECT_TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => handleTemplate(t.prompt)}
                    className="px-3 py-1.5 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors border border-teal-200 dark:border-teal-800"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleDescribeNext(); }}
                placeholder="e.g. I'm building a 6x4m deck in my backyard. The ground is mostly flat but I need to do some levelling first. Planning to pour concrete footings..."
                rows={5}
                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />

              {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 'details' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">A few more details</h3>
                <p className="text-sm text-gray-500">Optional — but helps with cost estimates and availability.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <MapPin className="w-3 h-3 inline mr-1" />Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Perth, WA"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Calendar className="w-3 h-3 inline mr-1" />Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" />Duration (days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={e => setDurationDays(e.target.value)}
                    placeholder="e.g. 7"
                    min="1"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <DollarSign className="w-3 h-3 inline mr-1" />Budget (AUD)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="e.g. 500"
                    min="0"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Project summary */}
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">Your project:</p>
                <p className="text-sm text-teal-900 dark:text-teal-100 line-clamp-3">{description}</p>
              </div>

              {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
            </div>
          )}

          {/* Step 3 — Planning (loading) */}
          {step === 'planning' && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Hammer className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-yellow-900" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Planning your project...</p>
                <p className="text-sm text-gray-500">Kayd is analysing your project and finding the right gear</p>
              </div>
              <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
            </div>
          )}

          {/* Step 4 — Results */}
          {step === 'results' && plan && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl border border-teal-100 dark:border-teal-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-teal-900 dark:text-teal-100 mb-1">Project Plan Ready</p>
                    <p className="text-sm text-teal-700 dark:text-teal-300">{plan.projectSummary}</p>
                    {plan.timeline && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{plan.timeline}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cost estimate */}
              {plan.totalEstimatedCost > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Total</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${plan.totalEstimatedCost.toLocaleString()} AUD
                  </span>
                </div>
              )}

              {/* Equipment list */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />Equipment List ({plan.equipmentList.length} items)
                </h4>
                <div className="space-y-3">
                  {plan.equipmentList.map((item, i) => (
                    <EquipmentCard
                      key={i}
                      item={item}
                      onSearch={() => onBrowseEquipment(item.name)}
                    />
                  ))}
                </div>
              </div>

              {/* Tips */}
              {plan.tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">💡 Tips</h4>
                  {plan.tips.map((tip, i) => (
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-teal-300">{tip}</p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {plan.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 space-y-1">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />Heads up
                  </h4>
                  {plan.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-amber-700 dark:text-amber-300">{w}</p>
                  ))}
                </div>
              )}

              {/* Browse CTA */}
              <button
                onClick={() => onBrowseEquipment(description)}
                className="w-full py-3 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Browse All Available Equipment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {(step === 'describe' || step === 'details') && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
            {step === 'details' ? (
              <button
                onClick={() => setStep('describe')}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={step === 'describe' ? handleDescribeNext : handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {step === 'describe' ? (
                <>Next<ChevronRight className="w-4 h-4" /></>
              ) : (
                <><Sparkles className="w-4 h-4" />Generate Plan</>
              )}
            </button>
          </div>
        )}

        {step === 'results' && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-white dark:bg-gray-900">
            <button
              onClick={() => { setStep('describe'); setPlan(null); }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />New Project
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Equipment Card ─────────────────────────────────────────────────────────

function EquipmentCard({ item, onSearch }: { item: EquipmentItem; onSearch: () => void }) {
  const priorityColors = {
    essential: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    recommended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    optional: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  const estimatedTotal = item.estimatedDailyRate * item.durationDays * item.quantity;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[item.priority]}`}>
              {item.priority}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.purpose}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />×{item.quantity}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{item.durationDays}d
            </span>
            {estimatedTotal > 0 && (
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                <DollarSign className="w-3 h-3" />~${estimatedTotal.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {item.matchedListing ? (
          <button
            onClick={onSearch}
            className="shrink-0 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          >
            View <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onSearch}
            className="shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
          >
            <Search className="w-3 h-3" />Find
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildProjectPrompt(params: {
  description: string;
  location: string;
  startDate: string;
  durationDays: string;
  budget: string;
}) {
  return `You are a project planning expert for a tool and equipment rental platform in Australia.

A user has described their project. Analyse it and return a structured JSON equipment plan.

PROJECT DESCRIPTION:
${params.description}

${params.location ? `LOCATION: ${params.location}` : ''}
${params.durationDays ? `PROJECT DURATION: ${params.durationDays} days` : ''}
${params.budget ? `BUDGET: $${params.budget} AUD total` : ''}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "projectSummary": "One sentence summary of the project",
  "timeline": "Suggested timeline breakdown e.g. Day 1-2: prep, Day 3-5: build",
  "equipmentList": [
    {
      "name": "Equipment name",
      "category": "Category",
      "quantity": 1,
      "durationDays": 3,
      "estimatedDailyRate": 150,
      "purpose": "What this equipment is used for in this project",
      "priority": "essential"
    }
  ],
  "tips": ["Tip 1", "Tip 2"],
  "warnings": ["Warning if any licences or safety gear needed"]
}

Rules:
- priority must be one of: essential, recommended, optional
- estimatedDailyRate in AUD, realistic Australian rental market rates
- durationDays for that specific equipment (may differ from total project duration)
- Include 3-8 equipment items
- tips: 2-4 practical tips for this specific project
- warnings: only include if there are genuine safety/licence requirements, otherwise empty array
- Return ONLY the JSON object, nothing else`;
}

function parseAIPlan(content: string, projectDays: string): ProjectPlan {
  try {
    // Strip any markdown fences
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const raw = JSON.parse(cleaned);

    const days = parseInt(projectDays) || 1;

    const equipmentList: EquipmentItem[] = (raw.equipmentList || []).map((item: EquipmentItem) => ({
      name: item.name || 'Equipment',
      category: item.category || 'General',
      quantity: item.quantity || 1,
      durationDays: item.durationDays || days,
      estimatedDailyRate: item.estimatedDailyRate || 0,
      purpose: item.purpose || '',
      priority: (['essential', 'recommended', 'optional'].includes(item.priority) ? item.priority : 'recommended') as EquipmentItem['priority'],
    }));

    const totalEstimatedCost = equipmentList.reduce(
      (sum, item) => sum + item.estimatedDailyRate * item.durationDays * item.quantity,
      0
    );

    return {
      projectSummary: raw.projectSummary || '',
      timeline: raw.timeline || '',
      equipmentList,
      totalEstimatedCost,
      tips: raw.tips || [],
      warnings: raw.warnings || [],
    };
  } catch {
    // Fallback if JSON parse fails
    return {
      projectSummary: 'Project plan generated.',
      timeline: '',
      equipmentList: [],
      totalEstimatedCost: 0,
      tips: [content],
      warnings: [],
    };
  }
}

async function matchListings(plan: ProjectPlan): Promise<void> {
  // Try to match each equipment item to a real listing in the DB
  for (const item of plan.equipmentList) {
    try {
      const { data } = await supabase
        .from('equipment')
        .select('id, title, daily_rate, images, owner:profiles(full_name)')
        .eq('is_active', true)
        .ilike('title', `%${item.name.split(' ')[0]}%`)
        .limit(1)
        .single();

      if (data) {
        item.matchedListing = data as unknown as EquipmentItem['matchedListing'];
      }
    } catch {
      // No match — that's fine
    }
  }
}
