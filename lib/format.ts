// small display formatting helpers shared across screens

// time of day greeting shared by the home and profile headers, rendered
// uppercase with a trailing comma to match the mono header style
export function greetingForNow(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'GOOD MORNING,';
  if (hour < 17) return 'GOOD AFTERNOON,';
  return 'GOOD EVENING,';
}

// "THURSDAY, JULY 17" date line shared by the home and profile headers
export function formatHeaderDate(d: Date = new Date()): string {
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const mon = d.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  return `${day}, ${mon} ${d.getDate()}`;
}

// how many mg of caffeine the strongest tea (Caffeine_Level 1.0) carries
// per cup. matcha-strength tea lands around 65-70mg against coffee's ~95mg,
// tune here if the numbers feel off
const MG_AT_FULL_LEVEL = 68;

// turns the abstract 0-1 caffeine level into a real milligram estimate,
// rounded to the nearest 5mg so it doesn't pretend to be lab-precise
export function formatCaffeineMg(level: number): string {
  if (level <= 0) return 'Caffeine-free';

  const mg = Math.round((level * MG_AT_FULL_LEVEL) / 5) * 5;
  if (mg <= 0) return 'Barely any caffeine';

  return `≈ ${mg} mg caffeine`;
}
