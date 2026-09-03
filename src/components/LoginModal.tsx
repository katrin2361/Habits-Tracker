import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  getRegisteredAccounts,
  loginOrRegister,
  PRESET_AVATARS,
} from '../utils/authStorage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [emailInput, setEmailInput] = useState<string>(currentUser.email);
  const [nameInput, setNameInput] = useState<string>(currentUser.name);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatarUrl);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [accounts] = useState<UserProfile[]>(() => getRegisteredAccounts());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanName = nameInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Masukkan format alamat email yang valid.');
      return;
    }

    if (!cleanName) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }

    const loggedInUser = loginOrRegister(cleanEmail, cleanName, selectedAvatar);
    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleSelectExistingAccount = (account: UserProfile) => {
    const loggedInUser = loginOrRegister(account.email, account.name, account.avatarUrl);
    onLoginSuccess(loggedInUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-[#e5eeff] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#006c49] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
            </span>
            <div className="flex flex-col">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Masuk / Ganti Akun</h3>
              <span className="text-[10px] text-[#6c7a71]">
                Data kebiasaan disimpan per email
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9ff] text-[#6c7a71] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Existing Accounts Switcher */}
        {accounts.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6c7a71]">
              Akun Tersimpan di Perangkat
            </span>
            <div className="flex flex-col gap-1.5">
              {accounts.map((acc) => {
                const isActive =
                  acc.email.toLowerCase() === currentUser.email.toLowerCase();
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectExistingAccount(acc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
                      isActive
                        ? 'border-[#006c49] bg-[#e5eeff]/70 ring-1 ring-[#006c49]/30'
                        : 'border-[#e5eeff] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#006c49]/20"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                          {acc.name}
                        </span>
                        <span className="text-[11px] text-[#6c7a71] truncate">
                          {acc.email}
                        </span>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-[#006c49] text-white text-[10px] font-bold">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[12px] font-bold text-[#006c49]">Pilih</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-[#e5eeff] w-full"></div>
          <span className="bg-white px-3 text-[11px] text-[#6c7a71] font-bold absolute">
            atau gunakan email baru
          </span>
        </div>

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#3c4a42]">
              Alamat Email Pengguna <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#6c7a71]">
                mail
              </span>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="contoh: nama@domain.com"
                className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-[13px] font-medium bg-[#eff4ff] focus:bg-white focus:outline-none focus:border-[#006c49]"
              />
            </div>
            <span className="text-[10px] text-[#6c7a71]">
              Data kebiasaan dan streak akan disimpan secara eksklusif untuk email ini.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[#3c4a42]">
              Nama Lengkap (Tampil di Dashboard) <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#6c7a71]">
                badge
              </span>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Nama Anda (misal: Sarah Amanda, Alex, dll.)"
                className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-[13px] font-medium bg-[#eff4ff] focus:bg-white focus:outline-none focus:border-[#006c49]"
              />
            </div>
            <span className="text-[10px] text-[#6c7a71]">
              Nama ini akan muncul pada sapaan Dashboard utama (contoh: "Halo, {nameInput || '...'}! ✨").
            </span>
          </div>

          {/* Quick Avatar Chooser */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-[12px] font-bold text-[#3c4a42]">
              Pilih Avatar Cepat
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_AVATARS.slice(0, 5).map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`w-10 h-10 rounded-full flex-shrink-0 p-0.5 border-2 transition-transform active:scale-95 ${
                    selectedAvatar === av.url
                      ? 'border-[#006c49] scale-105'
                      : 'border-transparent hover:border-[#dce9ff]'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-bold hover:bg-[#dce9ff]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-[13px] font-bold hover:bg-[#005236] shadow-sm flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Masuk Akun</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
