import { Habit, UserProfile } from '../types';
import { getDynamicInitialHabits } from '../data/initialData';
import { getTodayISO, calculateStreakInfo } from './dateUtils';

export const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3tfo-XODcZNUl9o0yt1dl9w_NDGa332mDsAavn5N7GH0PTAdTXIHjbAGrAw7Pvqrb5Yyps7yMf13uuDYNZqAdF37XAv6Zx_hrccSfjT3LZJ7VKDpHgkG5rcTa-nHLSRmBL3RvyXnuV3ak5am2-aXPoCfrD8rT0hWl-xilB2lyvpJGxE5AWuVkV7QzkMCIyXXZlohDU0Q7ESQjLKv1eRbt3lMjRZ9vcA3TO5YRB4_4gH5yodFvqmAB';

export const PRESET_AVATARS = [
  {
    id: 'sarah-default',
    label: 'Sarah (Default)',
    url: DEFAULT_AVATAR,
  },
  {
    id: 'avatar-1',
    label: 'Botanical Fox',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Minimalist Smile',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Creative Spark',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Zen Meditator',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Illustrative Luna',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Luna&backgroundColor=b6e3f4,c0aede,d1d4f9',
  },
  {
    id: 'avatar-6',
    label: 'Illustrative Felix',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffd5dc,ffdfbf',
  },
];

export const DEFAULT_USER: UserProfile = {
  id: 'usr-katrin',
  name: 'Sarah Amanda',
  email: 'katrin2361@gmail.com',
  avatarUrl: DEFAULT_AVATAR,
  level: 4,
  levelTitle: 'Master Konsistensi',
  xp: 850,
  maxXp: 1000,
};

const STORAGE_KEY_CURRENT_USER = 'habitpulse_current_user_email';
const STORAGE_KEY_ACCOUNTS = 'habitpulse_registered_accounts';
const HABITS_KEY_PREFIX = 'habitpulse_habits_';

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Get all registered accounts
 */
export function getRegisteredAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      // Initialize with default user
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify([DEFAULT_USER]));
      return [DEFAULT_USER];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error reading accounts from localStorage', e);
  }
  return [DEFAULT_USER];
}

/**
 * Save an account to registered accounts
 */
export function saveAccount(user: UserProfile): void {
  try {
    const accounts = getRegisteredAccounts();
    const cleanEmail = sanitizeEmail(user.email);
    const existingIdx = accounts.findIndex((a) => sanitizeEmail(a.email) === cleanEmail);
    if (existingIdx >= 0) {
      accounts[existingIdx] = user;
    } else {
      accounts.push(user);
    }
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving account to localStorage', e);
  }
}

/**
 * Get current active user
 */
export function getCurrentUser(): UserProfile {
  try {
    const currentEmail = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    const accounts = getRegisteredAccounts();
    if (currentEmail) {
      const match = accounts.find((a) => sanitizeEmail(a.email) === sanitizeEmail(currentEmail));
      if (match) return match;
    }
  } catch (e) {
    console.error('Error reading current user', e);
  }
  return DEFAULT_USER;
}

/**
 * Set active user
 */
export function setCurrentUser(user: UserProfile): void {
  try {
    saveAccount(user);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, sanitizeEmail(user.email));
  } catch (e) {
    console.error('Error setting current user', e);
  }
}

/**
 * Sync habit list with the real current date:
 * - Update completedToday state from historyMap[todayISO]
 * - Recalculate streak using real-time consecutive date checks
 * - If streak is broken by an empty day, extinguish flame (streak = 0)
 */
export function syncHabitsWithCurrentDate(habits: Habit[]): Habit[] {
  const todayISO = getTodayISO();

  return habits.map((habit) => {
    // Check if habit has legacy numeric historyMap (e.g. '1', '2')
    const sampleKey = habit.historyMap ? Object.keys(habit.historyMap)[0] : '';
    const isLegacyNumeric = sampleKey && !sampleKey.includes('-');

    if (isLegacyNumeric || !habit.historyMap) {
      // Regenerate dynamic baseline for this habit if it was legacy
      const dynamicDefaults = getDynamicInitialHabits();
      const match = dynamicDefaults.find((d) => d.id === habit.id);
      if (match) {
        return match;
      }
    }

    const historyMap = habit.historyMap || {};
    const isCompletedToday = Boolean(historyMap[todayISO]);
    const streakInfo = calculateStreakInfo(historyMap, todayISO);
    const totalDays = Object.values(historyMap).filter(Boolean).length;

    return {
      ...habit,
      completedToday: isCompletedToday,
      streak: streakInfo.streak,
      bestStreak: Math.max(habit.bestStreak || 0, streakInfo.streak),
      totalCompletedDays: totalDays > 0 ? totalDays : habit.totalCompletedDays,
    };
  });
}

/**
 * Get habits for a specific user email
 */
export function getHabitsForEmail(email: string): Habit[] {
  const cleanEmail = sanitizeEmail(email);
  const key = `${HABITS_KEY_PREFIX}${cleanEmail}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const synced = syncHabitsWithCurrentDate(parsed);
        // Persist synced state
        saveHabitsForEmail(cleanEmail, synced);
        return synced;
      }
      if (Array.isArray(parsed) && parsed.length === 0) {
        return [];
      }
    }
  } catch (e) {
    console.error('Error reading habits for email:', email, e);
  }

  // Generate fresh dynamic habits relative to today
  const dynamicInitial = getDynamicInitialHabits();
  saveHabitsForEmail(cleanEmail, dynamicInitial);
  return dynamicInitial;
}

/**
 * Save habits for a specific user email
 */
export function saveHabitsForEmail(email: string, habits: Habit[]): void {
  const cleanEmail = sanitizeEmail(email);
  const key = `${HABITS_KEY_PREFIX}${cleanEmail}`;
  try {
    localStorage.setItem(key, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits for email:', email, e);
  }
}

/**
 * Reset habits for a specific user email
 * mode 'empty': wipes all habits (fresh 0 habits)
 * mode 'default': restores initial dummy habits
 */
export function resetHabitsForEmail(email: string, mode: 'empty' | 'default'): Habit[] {
  const cleanEmail = sanitizeEmail(email);
  const key = `${HABITS_KEY_PREFIX}${cleanEmail}`;
  const newHabits = mode === 'empty' ? [] : getDynamicInitialHabits();
  try {
    localStorage.setItem(key, JSON.stringify(newHabits));
  } catch (e) {
    console.error('Error resetting habits for email:', email, e);
  }
  return newHabits;
}

/**
 * Login or register user with email, name, and optional avatar
 */
export function loginOrRegister(email: string, name?: string, avatarUrl?: string): UserProfile {
  const cleanEmail = sanitizeEmail(email);
  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => sanitizeEmail(a.email) === cleanEmail);

  if (existing) {
    const updated: UserProfile = {
      ...existing,
      name: name?.trim() ? name.trim() : existing.name,
      avatarUrl: avatarUrl || existing.avatarUrl,
    };
    setCurrentUser(updated);
    return updated;
  }

  // Derive a friendly display name if not provided
  const derivedName = name?.trim()
    ? name.trim()
    : cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email: cleanEmail,
    name: derivedName,
    avatarUrl:
      avatarUrl ||
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=ffd5dc,ffdfbf`,
    level: 1,
    levelTitle: 'Pemula Bersemangat',
    xp: 120,
    maxXp: 300,
  };

  setCurrentUser(newUser);
  return newUser;
}
