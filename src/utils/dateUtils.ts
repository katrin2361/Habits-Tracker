/**
 * Utility functions for real-time Indonesian date formatting,
 * daily habit tracking, and streak calculation.
 */

export const DAYS_SHORT_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const DAYS_FULL_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Format Date to 'YYYY-MM-DD' using local timezone
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse 'YYYY-MM-DD' into local Date at 00:00:00
 */
export function parseDateISO(isoStr: string): Date {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns today's ISO string 'YYYY-MM-DD'
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Shift a date ISO by +/- N days
 */
export function getShiftedDateISO(baseISO: string, daysShift: number): string {
  const d = parseDateISO(baseISO);
  d.setDate(d.getDate() + daysShift);
  return formatDateISO(d);
}

/**
 * Format date into Indonesian string, e.g. "Kamis, 3 September 2026"
 */
export function formatIndonesianDate(date: Date = new Date(), includeDayName = true): string {
  const dayName = DAYS_FULL_ID[date.getDay()];
  const dayNum = date.getDate();
  const monthName = MONTHS_ID[date.getMonth()];
  const year = date.getFullYear();

  if (includeDayName) {
    return `${dayName}, ${dayNum} ${monthName} ${year}`;
  }
  return `${dayNum} ${monthName} ${year}`;
}

/**
 * Format month and year in Indonesian, e.g. "September 2026"
 */
export function formatIndonesianMonthYear(date: Date = new Date()): string {
  return `${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Day Item for the 7-day strip
 */
export interface WeekDayItem {
  dateObj: Date;
  dateISO: string;
  dayName: string; // 'Sen', 'Sel', etc.
  dayNum: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Generates the 7 days of the current week (Senin to Minggu)
 */
export function getCurrentWeekDates(referenceDate: Date = new Date()): WeekDayItem[] {
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const dayOfWeek = ref.getDay(); // 0 is Sunday, 1 is Monday ...
  // Distance to Monday (Senin): if Sunday (0), distance is 6. If Mon (1), distance is 0.
  const distanceToMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - distanceToMonday);

  const todayISO = getTodayISO();
  const result: WeekDayItem[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = formatDateISO(d);

    const isToday = iso === todayISO;
    const isPast = iso < todayISO;
    const isFuture = iso > todayISO;

    result.push({
      dateObj: d,
      dateISO: iso,
      dayName: DAYS_SHORT_ID[d.getDay()],
      dayNum: d.getDate(),
      isToday,
      isPast,
      isFuture,
    });
  }

  return result;
}

/**
 * Streak Calculation Details
 *
 * Rules requested by user:
 * "jika ada hari yang kosong, maka runtutan streak api maka akan padam"
 *
 * - If today is completed: streak is active (1 + consecutive completed days backwards from yesterday)
 * - If today is NOT completed yet:
 *     - If yesterday was completed: streak holds (still alive, waiting for today's check-in)
 *     - If yesterday was ALSO NOT completed: There is an empty/missed day! STREAK DIES (STREAK = 0, API PADAM).
 */
export interface StreakInfo {
  streak: number;
  isFlameActive: boolean; // true if streak > 0
  isExtinguished: boolean; // true if streak === 0
  statusText: string;
  description: string;
}

export function calculateStreakInfo(
  historyMap: Record<string, boolean> = {},
  todayISO: string = getTodayISO()
): StreakInfo {
  const yesterdayISO = getShiftedDateISO(todayISO, -1);

  const completedToday = Boolean(historyMap[todayISO]);
  const completedYesterday = Boolean(historyMap[yesterdayISO]);

  if (completedToday) {
    // Count today + backwards
    let count = 1;
    let checkDate = yesterdayISO;
    while (historyMap[checkDate]) {
      count++;
      checkDate = getShiftedDateISO(checkDate, -1);
    }

    return {
      streak: count,
      isFlameActive: true,
      isExtinguished: false,
      statusText: `${count} Hari 🔥`,
      description: `Luar biasa! Target hari ini tuntas, api streak terus menyala selama ${count} hari berturut-turut!`,
    };
  }

  if (completedYesterday) {
    // Yesterday completed, waiting for today
    let count = 1;
    let checkDate = getShiftedDateISO(yesterdayISO, -1);
    while (historyMap[checkDate]) {
      count++;
      checkDate = getShiftedDateISO(checkDate, -1);
    }

    return {
      streak: count,
      isFlameActive: true,
      isExtinguished: false,
      statusText: `${count} Hari (Menunggu Hari Ini)`,
      description: `Momentum masih terjaga dari kemarin. Selesaikan target hari ini agar api streak tidak padam!`,
    };
  }

  // Both today and yesterday are NOT completed -> Empty day detected -> API PADAM!
  return {
    streak: 0,
    isFlameActive: false,
    isExtinguished: true,
    statusText: 'Api Padam 💨',
    description: `Runtutan streak terputus karena ada hari yang terlewat. Centang target hari ini untuk menyalakan kembali api semangatmu!`,
  };
}
