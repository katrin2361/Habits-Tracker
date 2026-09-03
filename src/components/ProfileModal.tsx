import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  streak: number;
  totalHabits: number;
  completedCount: number;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenLogin: () => void;
  onOpenReset: () => void;
  onOpenChangeAvatar: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  streak,
  totalHabits,
  completedCount,
  onUpdateUser,
  onOpenLogin,
  onOpenReset,
  onOpenChangeAvatar,
}) => {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(currentUser.name);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    onUpdateUser({
      ...currentUser,
      name: nameInput.trim(),
    });
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-[#e5eeff] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#006c49] bg-[#10b981]/15 px-2.5 py-0.5 rounded-full">
            Profil & Akun Pengguna
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9ff] text-[#6c7a71] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Profile Card with Photo Change & Name Edit */}
        <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
          <div className="flex items-start gap-3.5">
            {/* Avatar with Change Photo Button */}
            <div className="relative group cursor-pointer" onClick={onOpenChangeAvatar}>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#006c49] shadow-sm bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuB3tfo-XODcZNUl9o0yt1dl9w_NDGa332mDsAavn5N7GH0PTAdTXIHjbAGrAw7Pvqrb5Yyps7yMf13uuDYNZqAdF37XAv6Zx_hrccSfjT3LZJ7VKDpHgkG5rcTa-nHLSRmBL3RvyXnuV3ak5am2-aXPoCfrD8rT0hWl-xilB2lyvpJGxE5AWuVkV7QzkMCIyXXZlohDU0Q7ESQjLKv1eRbt3lMjRZ9vcA3TO5YRB4_4gH5yodFvqmAB';
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChangeAvatar();
                }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006c49] text-white flex items-center justify-center shadow-xs border border-white hover:bg-[#005236]"
                title="Ubah Foto Profil"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
              </button>
            </div>

            {/* Name, Email, Level */}
            <div className="flex flex-col min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-2 py-1 text-[14px] font-bold border rounded-lg bg-white focus:outline-none focus:border-[#006c49]"
                    placeholder="Nama Anda"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="px-2.5 py-1 bg-[#006c49] text-white rounded-lg text-[12px] font-bold"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(currentUser.name);
                      setIsEditingName(false);
                    }}
                    className="p-1 text-[#6c7a71] hover:text-[#0b1c30]"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-[17px] font-bold text-[#0b1c30] truncate">
                    {currentUser.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(currentUser.name);
                      setIsEditingName(true);
                    }}
                    className="text-[#006c49] hover:bg-[#dce9ff] p-1 rounded-md text-[11px] font-bold flex items-center gap-0.5"
                    title="Edit Nama"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Edit</span>
                  </button>
                </div>
              )}

              <span className="text-[12px] text-[#6c7a71] truncate">
                {currentUser.email}
              </span>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-[#006c49] bg-[#10b981]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">military_tech</span>
                  Level {currentUser.level} • {currentUser.levelTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#dce9ff] flex items-center justify-between text-[11px]">
            <span className="text-[#6c7a71] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#006c49]">cloud_done</span>
              Data tersimpan per email
            </span>
            <button
              type="button"
              onClick={onOpenChangeAvatar}
              className="text-[#006c49] font-bold hover:underline"
            >
              Ganti Foto Profil
            </button>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="flex flex-col gap-1.5 bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-[#3c4a42]">Level Progress (Level {currentUser.level})</span>
            <span className="text-[#006c49]">
              {currentUser.xp} / {currentUser.maxXp} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#dce9ff] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#006c49] to-[#10b981] rounded-full"
              style={{
                width: `${Math.min(100, Math.round((currentUser.xp / currentUser.maxXp) * 100))}%`,
              }}
            ></div>
          </div>
          <span className="text-[10px] text-[#6c7a71]">
            {currentUser.maxXp - currentUser.xp} XP lagi untuk membuka lencana berikutnya!
          </span>
        </div>

        {/* Stats Summary 3 columns */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-[#eff4ff] flex flex-col items-center">
            <span className="text-[18px] font-black text-[#9d4300]">{streak} 🔥</span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase mt-0.5">
              Streak Aktif
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#eff4ff] flex flex-col items-center">
            <span className="text-[18px] font-black text-[#006c49]">
              {completedCount * 14}
            </span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase mt-0.5">
              Total Ceklis
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#eff4ff] flex flex-col items-center">
            <span className="text-[18px] font-black text-[#0b1c30]">{totalHabits}</span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase mt-0.5">
              Kebiasaan
            </span>
          </div>
        </div>

        {/* Account Management & Reset Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Button: Ganti / Masuk Akun Lain */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full py-2.5 rounded-xl bg-[#e5eeff] text-[#006c49] hover:bg-[#dce9ff] font-bold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">switch_account</span>
            <span>Masuk / Ganti Akun Email Lain</span>
          </button>

          {/* Button: Reset Semua Data Dummy */}
          <button
            type="button"
            onClick={onOpenReset}
            className="w-full py-2.5 rounded-xl bg-[#ffdad6]/70 text-[#ba1a1a] hover:bg-[#ffdad6] font-bold text-[13px] transition-colors flex items-center justify-center gap-2 border border-[#ffdad6]"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset Semua Data Dummy</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#006c49] text-white font-bold text-[13px] hover:bg-[#005236] transition-colors shadow-xs"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
