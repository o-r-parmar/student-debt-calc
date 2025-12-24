import { format, addMonths } from 'date-fns';

/**
 * Generate term label with full date range
 * e.g., "Fall 2024 (Sept 2024 - Dec 2024)"
 */
export function getTermLabel(
  termName: string,
  startMonth: number,
  endMonth: number,
  programStartDate: Date
): string {
  const start = addMonths(programStartDate, startMonth);
  const end = addMonths(programStartDate, endMonth);

  const startFormatted = format(start, 'MMM yyyy');
  const endFormatted = format(end, 'MMM yyyy');

  return `${termName} (${startFormatted} - ${endFormatted})`;
}

/**
 * Generate short term label
 * e.g., "Sept 2024 - Dec 2024"
 */
export function getShortTermLabel(
  startMonth: number,
  endMonth: number,
  programStartDate: Date
): string {
  const start = addMonths(programStartDate, startMonth);
  const end = addMonths(programStartDate, endMonth);

  const startFormatted = format(start, 'MMM yyyy');
  const endFormatted = format(end, 'MMM yyyy');

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Get year from month index
 */
export function getYearFromMonth(monthIndex: number): number {
  return Math.floor(monthIndex / 12) + 1;
}

/**
 * Get all months for a specific year
 */
export function getMonthsForYear(year: number, totalMonths: number): number[] {
  const startMonth = (year - 1) * 12;
  const endMonth = Math.min(year * 12, totalMonths);
  return Array.from({ length: endMonth - startMonth }, (_, i) => startMonth + i);
}
