import React, { useState, useEffect } from 'react';
import { TabType, Habit, AchievementBadge, UserProfile } from './types';
import { INITIAL_BADGES } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/TodayView';
import { AddHabitView } from './components/AddHabitView';
import { StatsView } from './components/StatsView';
import { DetailView } from './components/DetailView';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { LoginModal } from './components/LoginModal';
import { ChangeAvatarModal } from './components/ChangeAvatarModal';
import { ResetDataModal } from './components/ResetDataModal';
import {
  getCurrentUser,
  setCurrentUser,
  getHabitsForEmail,
  saveHabitsForEmail,
  resetHabitsForEmail,
  syncHabitsWithCurrentDate,
} from './utils/authStorage';
import { getTodayISO, calculateStreakInfo } from './utils/dateUtils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('hari-ini');
  
  // User Profile State (persisted per email)
  const [currentUser, setUserState] = useState<UserProfile>(() => getCurrentUser());

  // Habits State (isolated & persisted for the logged-in email)
  const [habits, setHabits] = useState<Habit[]>(() =>
    getHabitsForEmail(currentUser.email)
  );

  const [selectedHabitId, setSelectedHabitId] = useState<string>('h1');
  const [badges] = useState<AchievementBadge[]>(INITIAL_BADGES);

  // Modals state
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synchronize habits to localStorage for current active email
  useEffect(() => {
    saveHabitsForEmail(currentUser.email, habits);
  }, [habits, currentUser.email]);

  // Active Daily Date Watcher:
  // Automatically detects date rollovers (e.g. midnight or returning the next day)
  // and re-syncs habits so that everyday activities are fresh, updated, and ready
  // to be checked off for the new day.
  useEffect(() => {
    let lastCheckedDate = getTodayISO();

    const checkDateRollover = () => {
      const currentToday = getTodayISO();
      if (currentToday !== lastCheckedDate) {
        lastCheckedDate = currentToday;
        setHabits((prev) => syncHabitsWithCurrentDate(prev));
        showToast('Hari baru telah tiba! Kegiatan keseharian telah diperbarui untuk diceklis hari ini ✨');
      }
    };

    // Check periodically every 10 seconds
    const interval = setInterval(checkDateRollover, 10000);

    // Also check whenever user brings tab to front or focuses window
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDateRollover();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkDateRollover);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkDateRollover);
    };
  }, []);

  const handleRefreshDaily = () => {
    setHabits((prev) => syncHabitsWithCurrentDate(prev));
    showToast('Kegiatan keseharian hari ini berhasil diperbarui & siap diceklis!');
  };

  // Handle Login / Switch Account
  const handleLoginSuccess = (newUser: UserProfile) => {
    setUserState(newUser);
    setCurrentUser(newUser);
    // Load habits exclusively for this email
    const loadedHabits = getHabitsForEmail(newUser.email);
    setHabits(loadedHabits);
    if (loadedHabits.length > 0) {
      setSelectedHabitId(loadedHabits[0].id);
    }
    showToast(`Berhasil masuk sebagai ${newUser.name} (${newUser.email})`);
  };

  // Handle Profile Update (e.g., Name change)
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUserState(updatedUser);
    setCurrentUser(updatedUser);
    showToast('Nama profil berhasil diperbarui!');
  };

  // Handle Photo / Avatar change
  const handleSaveAvatar = (newAvatarUrl: string) => {
    const updatedUser = {
      ...currentUser,
      avatarUrl: newAvatarUrl,
    };
    setUserState(updatedUser);
    setCurrentUser(updatedUser);
    showToast('Foto profil berhasil diubah!');
  };

  // Handle Reset Dummy Data
  const handleConfirmReset = (mode: 'empty' | 'default') => {
    const updatedHabits = resetHabitsForEmail(currentUser.email, mode);
    setHabits(updatedHabits);
    if (updatedHabits.length > 0) {
      setSelectedHabitId(updatedHabits[0].id);
    }
    showToast(
      mode === 'empty'
        ? 'Semua data dummy berhasil dikosongkan (0 kebiasaan).'
        : 'Data dummy bawaan berhasil dipulihkan.'
    );
  };

  // Overall streak: Highest active streak among all habits (or 0 if all extinguished)
  const overallStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0;

  const handleToggleHabit = (id: string, e?: React.MouseEvent, targetDateISO?: string) => {
    const todayISO = getTodayISO();
    const dateISO = targetDateISO || todayISO;

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isCurrentlyDone = Boolean(h.historyMap && h.historyMap[dateISO]);
          const newStatus = !isCurrentlyDone;
          const newHistoryMap = {
            ...(h.historyMap || {}),
            [dateISO]: newStatus,
          };

          const isToday = dateISO === todayISO;
          const streakInfo = calculateStreakInfo(newHistoryMap, todayISO);
          const currentHour = new Date().getHours().toString().padStart(2, '0');
          const currentMin = new Date().getMinutes().toString().padStart(2, '0');
          const totalDays = Object.values(newHistoryMap).filter(Boolean).length;

          // Announce flame state change to the user
          if (isToday && newStatus && streakInfo.streak > 0 && h.streak === 0) {
            showToast(`Api streak menyala kembali! 🔥 (1 Hari)`);
          } else if (isToday && !newStatus && streakInfo.streak === 0 && h.streak > 0) {
            showToast(`Api streak padam 💨`);
          }

          return {
            ...h,
            historyMap: newHistoryMap,
            completedToday: isToday ? newStatus : Boolean(newHistoryMap[todayISO]),
            completedTime: isToday && newStatus ? `${currentHour}:${currentMin}` : h.completedTime,
            streak: streakInfo.streak,
            bestStreak: Math.max(h.bestStreak || 0, streakInfo.streak),
            totalCompletedDays: totalDays,
          };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (newHabit: Habit) => {
    const todayISO = getTodayISO();
    const initialHistory = newHabit.historyMap || { [todayISO]: false };
    const streakInfo = calculateStreakInfo(initialHistory, todayISO);
    const enrichedHabit: Habit = {
      ...newHabit,
      historyMap: initialHistory,
      completedToday: Boolean(initialHistory[todayISO]),
      streak: streakInfo.streak,
      bestStreak: Math.max(newHabit.bestStreak || 0, streakInfo.streak),
      totalCompletedDays: Object.values(initialHistory).filter(Boolean).length,
    };

    setHabits((prev) => [enrichedHabit, ...prev]);
    setSelectedHabitId(enrichedHabit.id);
    setCurrentTab('hari-ini');
    showToast(`Kebiasaan "${enrichedHabit.title}" berhasil ditambahkan!`);
  };

  const handleUpdateHabit = (updated: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    showToast('Perubahan kebiasaan berhasil disimpan.');
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCurrentTab('hari-ini');
    showToast('Kebiasaan berhasil dihapus.');
  };

  const handleUpdateHabitTime = (habitId: string, newTime: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, time: newTime } : h))
    );
  };

  const handleSelectHabitForDetail = (habit: Habit) => {
    setSelectedHabitId(habit.id);
    setCurrentTab('riwayat');
  };

  const activeSelectedHabit = habits.find((h) => h.id === selectedHabitId) || habits[0];

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col selection:bg-[#006c49]/20 antialiased font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0b1c30] text-white px-4 py-2.5 rounded-full shadow-lg text-[12px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-[#6ffbbe] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        overallStreak={overallStreak}
        currentUser={currentUser}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onSelectTab={setCurrentTab}
      />

      {/* Main Container */}
      <main className="flex flex-col relative w-full px-4 pt-16 pb-24 max-w-[480px] mx-auto min-h-screen">
        {currentTab === 'hari-ini' && (
          <TodayView
            habits={habits}
            userName={currentUser.name}
            onToggleHabit={handleToggleHabit}
            onSelectHabitForDetail={handleSelectHabitForDetail}
            onGoToAdd={() => setCurrentTab('tambah')}
            onResetToDefault={() => handleConfirmReset('default')}
            onRefreshDaily={handleRefreshDaily}
          />
        )}

        {currentTab === 'tambah' && (
          <AddHabitView
            onAddHabit={handleAddHabit}
            onCancel={() => setCurrentTab('hari-ini')}
          />
        )}

        {currentTab === 'statistik' && (
          <StatsView
            habits={habits}
            badges={badges}
            onUpdateHabitTime={handleUpdateHabitTime}
          />
        )}

        {currentTab === 'riwayat' && activeSelectedHabit && (
          <DetailView
            habit={activeSelectedHabit}
            onBack={() => setCurrentTab('hari-ini')}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
            onUpdateHabit={handleUpdateHabit}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Notifications Drawer/Modal */}
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        habits={habits}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        currentUser={currentUser}
        streak={overallStreak}
        totalHabits={habits.length}
        completedCount={habits.filter((h) => h.completedToday).length}
        onUpdateUser={handleUpdateUser}
        onOpenLogin={() => {
          setProfileOpen(false);
          setLoginOpen(true);
        }}
        onOpenReset={() => {
          setProfileOpen(false);
          setResetModalOpen(true);
        }}
        onOpenChangeAvatar={() => {
          setProfileOpen(false);
          setAvatarModalOpen(true);
        }}
      />

      {/* Login & Switch Account Modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Change Avatar Photo Modal */}
      <ChangeAvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={currentUser.avatarUrl}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Reset Dummy Data Modal */}
      <ResetDataModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
