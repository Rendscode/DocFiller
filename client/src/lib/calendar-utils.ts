import { startOfWeek, endOfWeek, getWeek, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export function getCalendarWeekFromDate(date: string): number {
  return getWeek(parseISO(date), { weekStartsOn: 1, locale: de });
}

export function getWeekRange(date: string): { start: string; end: string } {
  const parsedDate = parseISO(date);
  const start = startOfWeek(parsedDate, { weekStartsOn: 1 });
  const end = endOfWeek(parsedDate, { weekStartsOn: 1 });
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd')
  };
}

export function formatWeekRange(startDate: string, endDate: string): string {
  const start = format(parseISO(startDate), 'dd.MM.yyyy', { locale: de });
  const end = format(parseISO(endDate), 'dd.MM.yyyy', { locale: de });
  return `${start} - ${end}`;
}

export function calculateTotalHours(hours: {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}): number {
  return Object.values(hours).reduce((sum, h) => sum + h, 0);
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return start <= end;
}
