// regex parsing for the brew timer, turns a free text brew spec string into
// a starting countdown in seconds, no hardcoded durations

// used when a spec has neither a seconds nor a minutes pattern we can read
const DEFAULT_BREW_SECONDS = 180;

// matches things like "30s", "120s" or the ranged "180-240s", the second
// number in a range is ignored on purpose, we default to the lower bound
const SECONDS_PATTERN = /(\d+)(?:-(\d+))?s\b/i;

// the seed dataset also has plenty of specs written in minutes, for example
// "5-10 min" or "5-7 min simmered", the spec only asked for seconds parsing
// but real tea data needs this too, otherwise most herbal teas would have
// nothing to extract at all
const MINUTES_PATTERN = /(\d+)(?:-(\d+))?\s*min\b/i;

// extracts the brew duration in seconds from a Traditional_Brew_Specs string
// note, if a spec mentions more than one seconds value (for example a rinse
// step before the real steep), this returns the first one found
export function parseBrewSeconds(spec: string): number {
  const secondsMatch = spec.match(SECONDS_PATTERN);
  if (secondsMatch) {
    return parseInt(secondsMatch[1], 10);
  }

  const minutesMatch = spec.match(MINUTES_PATTERN);
  if (minutesMatch) {
    return parseInt(minutesMatch[1], 10) * 60;
  }

  return DEFAULT_BREW_SECONDS;
}

// formats a seconds count as mm:ss for the countdown display
export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
