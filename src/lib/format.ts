const dates = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });

export const formatDate = (date: Date) => dates.format(date);

// the machine-readable half of a <time>, a plain yyyy-mm-dd
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

// a comfortable reading pace, and code blocks count like anything else
export function readingTime(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
