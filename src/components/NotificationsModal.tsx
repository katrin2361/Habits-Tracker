import React from 'react';
import { Habit } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, habits }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#fd761a]/15 text-[#fd761a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </span>
            <h3 className="text-[17px] font-bold text-[#0b1c30]">Pengingat & Alarm</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f8f9ff] text-[#6c7a71] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-[13px] text-[#3c4a42]">
          Jadwal pengingat otomatis untuk menjaga ritme kebiasaanmu hari ini:
        </p>

        <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                habit.completedToday 
                  ? 'bg-[#eff4ff]/60 border-[#bbcabf]/30 opacity-75' 
                  : 'bg-white border-[#e5eeff] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-[#e5eeff] text-[#006c49] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">{habit.icon}</span>
                </span>
                <div className="flex flex-col min-w-0">
                  <span className={`text-[13px] font-bold truncate ${habit.completedToday ? 'line-through text-[#6c7a71]' : 'text-[#0b1c30]'}`}>
                    {habit.title}
                  </span>
                  <span className="text-[11px] text-[#6c7a71] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">alarm</span>
                    {habit.time} {habit.timezone} • {habit.category}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                habit.completedToday 
                  ? 'bg-[#10b981]/15 text-[#006c49]' 
                  : 'bg-[#fd761a]/15 text-[#9d4300]'
              }`}>
                {habit.completedToday ? 'Selesai ✓' : 'Segera'}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#006c49] text-white font-bold text-[13px] hover:bg-[#005236] transition-colors shadow-sm"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
