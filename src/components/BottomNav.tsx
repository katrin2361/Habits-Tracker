import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'hari-ini' as TabType, label: 'Hari Ini', icon: 'event_available' },
    { id: 'tambah' as TabType, label: 'Tambah', icon: 'add_circle' },
    { id: 'statistik' as TabType, label: 'Statistik', icon: 'bar_chart' },
    { id: 'riwayat' as TabType, label: 'Riwayat', icon: 'check_circle' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#f8f9ff]/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(11,28,48,0.05)] border-t border-[#e2e8f0]/60">
      <div className="flex justify-around items-center h-16 max-w-[480px] mx-auto px-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 h-12 transition-all relative group select-none ${
                isActive ? 'text-[#006c49] font-bold' : 'text-[#6c7a71] hover:text-[#0b1c30]'
              }`}
            >
              {/* Active top dot indicator */}
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#006c49] animate-pulse" />
              )}
              <span className={`material-symbols-outlined text-[24px] transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
