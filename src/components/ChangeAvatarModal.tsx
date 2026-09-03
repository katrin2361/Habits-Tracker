import React, { useState, useRef } from 'react';
import { PRESET_AVATARS } from '../utils/authStorage';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 3MB for base64 storage in localStorage)
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 3MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Silakan pilih file format gambar (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setSelectedAvatar(customUrl.trim());
    }
  };

  const handleConfirmSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-[#e5eeff]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#006c49] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </span>
            <h3 className="text-[16px] font-bold text-[#0b1c30]">Ubah Foto Profil</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9ff] text-[#6c7a71] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Preview */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative">
            <img
              src={selectedAvatar}
              alt="Pratinjau Foto Profil"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#006c49]/20 shadow-md bg-[#eff4ff]"
              onError={(e) => {
                // fallback if invalid URL
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
              }}
            />
            <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#006c49] text-white shadow-xs text-[14px] flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </span>
          </div>
          <span className="text-[11px] text-[#6c7a71] mt-2 font-medium">
            Pratinjau Tampilan Foto Profil
          </span>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-1.5 rounded-lg text-[12px] font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-[#006c49] shadow-xs'
                : 'text-[#6c7a71] hover:text-[#0b1c30]'
            }`}
          >
            Pilihan Avatar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-1.5 rounded-lg text-[12px] font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-[#006c49] shadow-xs'
                : 'text-[#6c7a71] hover:text-[#0b1c30]'
            }`}
          >
            Unggah Foto
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-1.5 rounded-lg text-[12px] font-bold transition-all ${
              activeTab === 'url'
                ? 'bg-white text-[#006c49] shadow-xs'
                : 'text-[#6c7a71] hover:text-[#0b1c30]'
            }`}
          >
            Link / URL
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold text-[#3c4a42]">
              Pilih dari Koleksi Avatar:
            </span>
            <div className="grid grid-cols-4 gap-2.5 max-h-[180px] overflow-y-auto p-1">
              {PRESET_AVATARS.map((item) => {
                const isSelected = selectedAvatar === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvatar(item.url)}
                    className={`relative rounded-xl p-1 border flex flex-col items-center gap-1 transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[#006c49] bg-[#e5eeff] ring-2 ring-[#006c49]/30'
                        : 'border-[#e5eeff] bg-white hover:bg-[#eff4ff]'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-12 h-12 rounded-full object-cover bg-white"
                    />
                    <span className="text-[9px] font-bold text-[#3c4a42] truncate w-full text-center">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#006c49]/40 hover:border-[#006c49] bg-[#eff4ff]/60 hover:bg-[#eff4ff] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="w-10 h-10 rounded-full bg-[#006c49]/10 text-[#006c49] flex items-center justify-center mb-1.5">
                <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              </span>
              <span className="text-[13px] font-bold text-[#0b1c30]">
                Klik untuk Memilih Foto
              </span>
              <span className="text-[11px] text-[#6c7a71] mt-0.5">
                Mendukung file JPG, PNG, atau WebP (maks. 3MB)
              </span>
            </div>
            {uploadError && (
              <p className="text-[11px] text-[#ba1a1a] font-semibold text-center">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Tab 3: URL */}
        {activeTab === 'url' && (
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-[#3c4a42]">
              Tautan Gambar Online (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 px-3 py-2 border rounded-xl text-[13px] bg-[#eff4ff] focus:bg-white focus:outline-none focus:border-[#006c49]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 bg-[#e5eeff] text-[#006c49] rounded-xl text-[12px] font-bold hover:bg-[#dce9ff]"
              >
                Terapkan
              </button>
            </div>
            <span className="text-[11px] text-[#6c7a71]">
              Pastikan tautan dapat diakses secara publik.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#e5eeff]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-bold hover:bg-[#dce9ff]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-[13px] font-bold hover:bg-[#005236] shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Simpan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
