/**
 * Launch-time feature gating.
 *
 * Some UI surfaces ship as interactive *previews* — they look complete but
 * simulate their behavior (setTimeout delays, hardcoded/Math.random data)
 * rather than hitting a real backend. They are hidden for the v1.0 launch so
 * users only encounter flows that genuinely work, and brought back in a later
 * release once each has a real implementation.
 *
 * Flip to `true` (or wire to an env var) to re-expose them.
 *
 * Currently gates:
 *  - The "Premium Features" showcase (FeatureShowcase) floating button + modal
 *    (insurance quote, group booking, AI search, smart pricing, split payment…)
 *  - The "Smart Scheduler" navigation entries (SchedulingOptimizer)
 */
export const SHOW_PREVIEW_FEATURES = false;
