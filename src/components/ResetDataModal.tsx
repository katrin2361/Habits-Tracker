import React, { useState } from 'react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (mode: 'empty' | 'default') => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [selectedMode, setSelectedMode] = useState<'empty' | 'default'>('empty');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 border border-[#e5eeff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[28px]">restart_alt</span>
        </div>

        <div className="text-center flex flex-col gap-1">
          <h3 className="text-[18px] font-bold text-[#0b1c30]">Reset Data Kebiasaan</h3>
          <p className="text-[12px] text-[#6c7a71] leading-relaxed">
            Pilih cara reset data yang diinginkan untuk akun aktif Anda:
          </p>
        </div>

        {/* Option Choices */}
        <div className="flex flex-col gap-2.5">
          <div
            onClick={() => setSelectedMode('empty')}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              selectedMode === 'empty'
                ? 'border-[#ba1a1a] bg-[#ffdad6]/20 ring-2 ring-[#ba1a1a]/20'
                : 'border-[#e5eeff] bg-white hover:bg-[#eff4ff]'
            }`}
          >
            <input
              type="radio"
              name="resetMode"
              checked={selectedMode === 'empty'}
              onChange={() => setSelectedMode('empty')}
              className="mt-0.5 accent-[#ba1a1a]"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0b1c30]">
                Kosongkan Semua Data (0 Kebiasaan)
              </span>
              <span className="text-[11px] text-[#6c7a71] mt-0.5 leading-snug">
                Hapus semua data dummy agar Anda dapat mulai mengisi kebiasaan pribadi dari nol bersih.
              </span>
            </div>
          </div>

          <div
            onClick={() => setSelectedMode('default')}
            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              selectedMode === 'default'
                ? 'border-[#006c49] bg-[#e5eeff] ring-2 ring-[#006c49]/20'
                : 'border-[#e5eeff] bg-white hover:bg-[#eff4ff]'
            }`}
          >
            <input
              type="radio"
              name="resetMode"
              checked={selectedMode === 'default'}
              onChange={() => setSelectedMode('default')}
              className="mt-0.5 accent-[#006c49]"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0b1c30]">
                Kembalikan ke Contoh Dummy Bawaan
              </span>
              <span className="text-[11px] text-[#6c7a71] mt-0.5 leading-snug">
                Muat ulang 4 kebiasaan bawaan lengkap dengan data sampel streak dan statistik.
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#fff8f6] rounded-xl border border-[#ffdad6] text-[#ba1a1a] text-[11px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0">info</span>
          <span>
            Perubahan ini akan langsung disimpan ke penyimpanan email akun Anda.
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-bold hover:bg-[#dce9ff]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset(selectedMode);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] text-white text-[13px] font-bold hover:bg-[#93000a] transition-colors shadow-xs"
          >
            Ya, Terapkan Reset
          </button>
        </div>
      </div>
    </div>
  );
};
