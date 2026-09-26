import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { env } from '../config/env.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export const TZ = env.timezone;
export { dayjs };

/** "YYYY-MM-DD" (in the business timezone) -> dayjs at 00:00 local. */
export const parseLocalDate = (dateStr) => dayjs.tz(dateStr, 'YYYY-MM-DD', TZ);

/** epoch ms for date + "HH:mm" in the business timezone. */
export const localToMs = (dateStr, hhmm) => dayjs.tz(`${dateStr} ${hhmm}`, 'YYYY-MM-DD HH:mm', TZ).valueOf();

export const formatLocal = (ms, fmt = 'HH:mm') => dayjs(ms).tz(TZ).format(fmt);

/** Today's date string in the business timezone. */
export const todayStr = (now = new Date()) => dayjs(now).tz(TZ).format('YYYY-MM-DD');

export const addDaysStr = (dateStr, n) => parseLocalDate(dateStr).add(n, 'day').format('YYYY-MM-DD');

export const isValidDateStr = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && parseLocalDate(s).format('YYYY-MM-DD') === s;

export const MIN = 60 * 1000;
