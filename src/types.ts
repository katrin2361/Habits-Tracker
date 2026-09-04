export type TabType = 'hari-ini' | 'tambah' | 'statistik' | 'riwayat';

export type CategoryType = 'Kesehatan' | 'Produktivitas' | 'Keuangan' | 'Spiritual';

export type AccentColor = 'emerald' | 'blue' | 'violet' | 'amber' | 'coral' | 'pink';

export type FrequencyType = 'Harian' | 'Hari Tertentu' | 'Target / Minggu';

export interface Habit {
  id: string;
  title: string;
  category: CategoryType;
  time: string; // e.g., '07:00'
  timezone: string; // e.g., 'WIB'
  streak: number; // e.g., 14
  bestStreak: number;
  completedToday: boolean;
  completedTime?: string;
  icon: string; // Material symbol name or emoji
  accentColor: AccentColor;
  description?: string;
  reason?: string;
  frequency: FrequencyType;
  activeDays: string[]; // ['S', 'S', 'R', 'K', 'J', 'S', 'M']
  reminderEnabled: boolean;
  notes?: string;
  dailyNotes?: Record<string, string>; // date-keyed notes e.g. { '2026-09-03': 'Refleksi harian...' }
  completionRate: number; // percentage, e.g., 93
  totalCompletedDays: number; // e.g., 56
  isUrgent?: boolean;
  historyMap: Record<string, boolean>; // e.g. { '2024-05-01': true }
}

export interface AchievementBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: 'Aktif' | 'Baru!' | 'Terkunci';
  colorType: 'orange' | 'green' | 'blue';
}

export interface WeeklyPerformanceDay {
  day: string; // 'Sen', 'Sel', etc.
  pct: number;
  isToday?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  levelTitle: string;
  xp: number;
  maxXp: number;
}
