import React from 'react';
import { TabType, UserProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  overallStreak: number;
  currentUser: UserProfile;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  overallStreak,
  currentUser,
  onOpenNotifications,
  onOpenProfile,
  onSelectTab
}) => {
  const getSubtext = () => {
    switch (currentTab) {
      case 'hari-ini':
        return 'Hari Ini';
      case 'tambah':
        return 'Tambah Kebiasaan';
      case 'statistik':
        return 'Statistik';
      case 'riwayat':
        return 'Detail & Riwayat';
      default:
        return 'Hari Ini';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#f8f9ff]/85 backdrop-blur-xl pt-safe shadow-[0_1px_12px_rgba(11,28,48,0.04)]">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-[480px] mx-auto w-full">
        {/* Left: Logo & Subtitle */}
        <div 
          onClick={() => onSelectTab('hari-ini')}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer select-none group"
        >
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1X2ozvB34UobVs-tu5XsqiGi8Q8m4cEgYIR4iL4UIvAkUao8zOORzuLGH2ZiiwKvXxEnXy3qMY-rN33vSz4ZSnViBbzeR0PCPihspJwmCfKeeX1EUlTMtv6bpaMH6yZSh6EeUw9Wcjjc9TLFRD73GHpEpCa3bpkJKV-hsoxvMztCd9ADZdehhXjPwM3FhQ8hK-bye_Cq4bFo43YhhjfahMpsu1QLMtY6sTFBYbOMFm0jgdfyVIZl0vVGA"
            alt="Habit Tracker Logo"
            className="h-8 w-auto object-contain flex-shrink-0 transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[18px] text-[#006c49] tracking-tight font-extrabold truncate leading-tight">
              Habit Tracker
            </span>
            <span className="text-[10px] text-[#3c4a42] uppercase tracking-wider font-bold truncate">
              {getSubtext()}
            </span>
          </div>
        </div>

        {/* Right: Streak, Notification, Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Flame streak badge */}
          {overallStreak > 0 ? (
            <div 
              onClick={() => onSelectTab('statistik')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fd761a]/15 text-[#9d4300] cursor-pointer hover:bg-[#fd761a]/25 transition-colors select-none active:scale-95"
              title="Api Streak Aktif"
            >
              <span className="material-symbols-outlined text-[#9d4300] text-[18px]">
                local_fire_department
              </span>
              <span className="text-[13px] font-extrabold">
                {overallStreak} 🔥
              </span>
            </div>
          ) : (
            <div 
              onClick={() => onSelectTab('statistik')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#ba1a1a] border border-[#ffdad6] cursor-pointer hover:bg-[#dce9ff] transition-colors select-none active:scale-95"
              title="Api Padam: Ada hari kosong yang terlewat"
            >
              <span className="material-symbols-outlined text-[16px]">
                mode_heat_off
              </span>
              <span className="text-[11px] font-black">
                Padam 💨
              </span>
            </div>
          )}

          {/* Notifications button */}
          <button
            aria-label="Notifikasi"
            onClick={onOpenNotifications}
            className="w-10 h-10 flex items-center justify-center text-[#3c4a42] hover:text-[#0b1c30] transition-colors relative rounded-full active:bg-[#dce9ff]/60"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fd761a] ring-2 ring-[#f8f9ff] animate-pulse"></span>
          </button>

          {/* Profile Avatar */}
          <button
            aria-label={`Profil ${currentUser.name}`}
            onClick={onOpenProfile}
            className="relative flex items-center justify-center active:scale-90 transition-transform"
          >
            <img
              src={currentUser.avatarUrl}
              alt={`Foto ${currentUser.name}`}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#006c49]/30 hover:ring-[#006c49] transition-all bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuB3tfo-XODcZNUl9o0yt1dl9w_NDGa332mDsAavn5N7GH0PTAdTXIHjbAGrAw7Pvqrb5Yyps7yMf13uuDYNZqAdF37XAv6Zx_hrccSfjT3LZJ7VKDpHgkG5rcTa-nHLSRmBL3RvyXnuV3ak5am2-aXPoCfrD8rT0hWl-xilB2lyvpJGxE5AWuVkV7QzkMCIyXXZlohDU0Q7ESQjLKv1eRbt3lMjRZ9vcA3TO5YRB4_4gH5yodFvqmAB';
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
