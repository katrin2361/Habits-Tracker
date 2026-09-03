import { Habit, AchievementBadge } from '../types';
import { getTodayISO, getShiftedDateISO, calculateStreakInfo } from '../utils/dateUtils';

/**
 * Generate a history map relative to today (offset 0 = today, -1 = yesterday, etc.)
 */
function createHistoryMap(offsetsCompleted: number[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  const todayISO = getTodayISO();

  // Populate last 40 days as false by default
  for (let i = 0; i <= 40; i++) {
    const iso = getShiftedDateISO(todayISO, -i);
    map[iso] = false;
  }

  // Set specified completed offsets to true
  for (const offset of offsetsCompleted) {
    const iso = getShiftedDateISO(todayISO, -offset);
    map[iso] = true;
  }

  return map;
}

export function getDynamicInitialHabits(): Habit[] {
  const todayISO = getTodayISO();

  // Habit 1: Hidrasi Air 2L -> Streak 14 hari aktif (termasuk hari ini)
  const h1Offsets: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, // 14 days consecutive
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
  ];
  const h1History = createHistoryMap(h1Offsets);
  const h1Streak = calculateStreakInfo(h1History, todayISO).streak;

  // Habit 2: Baca Buku 15 Menit -> Streak 8 hari aktif (kemarin selesai, hari ini belum)
  const h2Offsets: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, // 8 days consecutive until yesterday
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25
  ];
  const h2History = createHistoryMap(h2Offsets);
  const h2Streak = calculateStreakInfo(h2History, todayISO).streak;

  // Habit 3: Olahraga Ringan -> Kemarin KOSONG/TERLEWAT (Empty Day) -> Streak = 0 (Api Padam!)
  // Sesuai permintaan user: "jika ada hari yang kosong, maka runtutan streak api maka akan padam"
  const h3Offsets: number[] = [
    // 0 (today): false
    // 1 (yesterday): false (hari kosong!)
    2, 3, 4, 5, // sebelumnya sempat 4 hari berturut-turut, tapi kemarin kosong jadi padam
    8, 9, 11, 12, 13, 14, 16, 17, 18, 20, 21
  ];
  const h3History = createHistoryMap(h3Offsets);
  const h3Streak = calculateStreakInfo(h3History, todayISO).streak; // will be 0

  // Habit 4: Meditasi Malam -> Streak 21 hari aktif (termasuk hari ini)
  const h4Offsets: number[] = [];
  for (let i = 0; i <= 20; i++) {
    h4Offsets.push(i);
  }
  for (let i = 22; i <= 38; i++) {
    h4Offsets.push(i);
  }
  const h4History = createHistoryMap(h4Offsets);
  const h4Streak = calculateStreakInfo(h4History, todayISO).streak; // will be 21

  return [
    {
      id: 'h1',
      title: 'Minum Air 2 Liter',
      category: 'Kesehatan',
      time: '07:00',
      timezone: 'WIB',
      streak: h1Streak,
      bestStreak: 18,
      completedToday: Boolean(h1History[todayISO]),
      completedTime: '08:15',
      icon: 'water_drop',
      accentColor: 'blue',
      description: 'Hidrasi optimal menjaga konsentrasi, metabolisme tubuh, dan stamina sepanjang hari kerja.',
      reason: 'Agar tubuh tetap segar dan fokus sepanjang hari',
      frequency: 'Harian',
      activeDays: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
      reminderEnabled: true,
      completionRate: 93,
      totalCompletedDays: Object.values(h1History).filter(Boolean).length,
      notes: 'Membawa tumbler 1L ke kantor, minum habis jam 15:00',
      historyMap: h1History,
    },
    {
      id: 'h2',
      title: 'Membaca Buku 15 Menit',
      category: 'Produktivitas',
      time: '12:30',
      timezone: 'WIB',
      streak: h2Streak,
      bestStreak: 14,
      completedToday: Boolean(h2History[todayISO]),
      icon: 'menu_book',
      accentColor: 'coral',
      description: 'Membaca minimal 1 bab atau 15 menit buku non-fiksi untuk pengembangan diri.',
      reason: 'Memperluas wawasan dan membangun pola pikir bertumbuh',
      frequency: 'Harian',
      activeDays: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
      reminderEnabled: true,
      completionRate: 85,
      totalCompletedDays: Object.values(h2History).filter(Boolean).length,
      historyMap: h2History,
    },
    {
      id: 'h3',
      title: 'Olahraga Ringan / Stretching',
      category: 'Kesehatan',
      time: '16:30',
      timezone: 'WIB',
      streak: h3Streak, // 0 (Api Padam karena kemarin kosong!)
      bestStreak: 12,
      completedToday: Boolean(h3History[todayISO]),
      icon: 'fitness_center',
      accentColor: 'violet',
      description: 'Gerakan peregangan leher, punggung, dan kardio ringan untuk melemaskan otot kerja.',
      reason: 'Mencegah sakit punggung dan menjaga kelenturan badan',
      frequency: 'Harian',
      activeDays: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
      reminderEnabled: true,
      isUrgent: true,
      completionRate: 68,
      totalCompletedDays: Object.values(h3History).filter(Boolean).length,
      historyMap: h3History,
    },
    {
      id: 'h4',
      title: 'Meditasi & Refleksi Malam',
      category: 'Spiritual',
      time: '21:00',
      timezone: 'WIB',
      streak: h4Streak,
      bestStreak: 21,
      completedToday: Boolean(h4History[todayISO]),
      completedTime: '21:15',
      icon: 'self_improvement',
      accentColor: 'emerald',
      description: 'Latihan pernapasan sadar 10 menit dan menuliskan 3 rasa syukur sebelum tidur.',
      reason: 'Ketenangan batin dan memperkuat ketenangan tidur malam.',
      frequency: 'Harian',
      activeDays: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
      reminderEnabled: true,
      completionRate: 100,
      totalCompletedDays: Object.values(h4History).filter(Boolean).length,
      historyMap: h4History,
    },
  ];
}

export const INITIAL_HABITS: Habit[] = getDynamicInitialHabits();

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'b1',
    title: 'Konsisten 7 Hari',
    subtitle: 'Mingguan Sempurna',
    icon: 'local_fire_department',
    status: 'Aktif',
    colorType: 'orange',
  },
  {
    id: 'b2',
    title: 'Pejuang Pagi',
    subtitle: 'Sebelum 07:00',
    icon: 'wb_sunny',
    status: 'Aktif',
    colorType: 'green',
  },
  {
    id: 'b3',
    title: 'Zen Master',
    subtitle: '21 Hari Meditasi',
    icon: 'self_improvement',
    status: 'Baru!',
    colorType: 'blue',
  },
];
