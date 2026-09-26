const range = (days, start, end, breaks = []) => days.map((day) => ({ day, isOpen: true, start, end, breaks }));
const closed = (days) => days.map((day) => ({ day, isOpen: false, start: '10:00', end: '18:00', breaks: [] }));
const sortDays = (arr) => arr.sort((a, b) => a.day - b.day);

/** Sensible default weekly schedule per category (0 = Sunday … 6 = Saturday, Friday closed/short). */
export function defaultWorkingHours(categorySlug) {
  switch (categorySlug) {
    case 'gym':
      return sortDays([...range([0, 1, 2, 3, 4, 6], '08:00', '23:00'), ...range([5], '14:00', '22:00')]);
    case 'barber':
      return sortDays([...range([0, 1, 2, 3, 4, 6], '10:00', '22:00', [{ start: '15:00', end: '15:30' }]), ...range([5], '14:00', '22:00')]);
    case 'clinic':
      return sortDays([...range([0, 1, 2, 3, 4], '10:00', '18:00', [{ start: '14:00', end: '14:30' }]), ...range([6], '10:00', '14:00'), ...closed([5])]);
    default:
      return sortDays([...range([0, 1, 2, 3, 4, 6], '10:00', '18:00'), ...closed([5])]);
  }
}
