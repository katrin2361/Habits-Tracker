import React, { useState } from 'react';
import { Habit, CategoryType } from '../types';
import { triggerConfetti } from '../utils/confetti';
import {
  getCurrentWeekDates,
  formatIndonesianDate,
  formatIndonesianMonthYear,
  getTodayISO,
  WeekDayItem,
} from '../utils/dateUtils';

interface TodayViewProps {
  habits: Habit[];
  userName?: string;
  onToggleHabit: (id: string, e: React.MouseEvent, dateISO?: string) => void;
  onSelectHabitForDetail: (habit: Habit) => void;
  onGoToAdd: () => void;
  onResetToDefault?: () => void;
  onRefreshDaily?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  habits,
  userName = 'Sarah',
  onToggleHabit,
  onSelectHabitForDetail,
  onGoToAdd,
  onResetToDefault,
  onRefreshDaily,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayISO = getTodayISO();
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);

  const weekDays: WeekDayItem[] = getCurrentWeekDates();
  const isViewingToday = selectedDateISO === todayISO;

  // Selected date object
  const selectedDateObj =
    weekDays.find((w) => w.dateISO === selectedDateISO)?.dateObj || new Date();

  // Habits completed for the selected date
  const completedCount = habits.filter(
    (h) => h.historyMap && h.historyMap[selectedDateISO]
  ).length;
  const pendingCount = habits.filter(
    (h) => !h.historyMap || !h.historyMap[selectedDateISO]
  ).length;

  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const circumference = 201.06;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  // Count habits with extinguished flames (streak === 0)
  const extinguishedHabits = habits.filter((h) => h.streak === 0);

  // Filter habits by category and completion status
  const displayedHabits = habits.filter((h) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      h.category.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCategory) return false;

    const isDone = Boolean(h.historyMap?.[selectedDateISO]);
    if (statusFilter === 'pending') return !isDone;
    if (statusFilter === 'completed') return isDone;
    return true;
  });

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return habits.length;
    return habits.filter((h) => h.category.toLowerCase() === cat.toLowerCase()).length;
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefreshDaily) {
      onRefreshDaily();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleCheckboxClick = (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const habit = habits.find((h) => h.id === habitId);
    const isCurrentlyCompleted = Boolean(habit?.historyMap?.[selectedDateISO]);

    if (!isCurrentlyCompleted) {
      triggerConfetti(e.currentTarget as HTMLElement);
    }
    onToggleHabit(habitId, e, selectedDateISO);
  };

  return (
    <div className="flex flex-col w-full space-y-5 pb-6 animate-in fade-in duration-300">
      {/* Real-time Greeting & Today's Live Date Header */}
      <section className="flex flex-col space-y-2 pt-2">
        {/* Real-time Date Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#006c49] text-[12px] font-bold shadow-2xs border border-[#10b981]/25">
            <span className="material-symbols-outlined text-[15px] animate-spin-slow">
              today
            </span>
            <span>{formatIndonesianDate(new Date(), true)}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping"></span>
          </div>

          <span className="text-[11px] font-bold text-[#6c7a71] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#dce9ff]">
            Real-time Tracker
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[26px] font-extrabold text-[#0b1c30] tracking-tight">
                Halo, {userName}!
              </h1>
              <span className="text-[20px] animate-bounce">✨</span>
            </div>
            <p className="text-[13px] text-[#3c4a42]">
              {isViewingToday
                ? 'Target harian otomatis diperbarui hari ini. Jangan biarkan api padam!'
                : `Melihat data rutinitas: ${formatIndonesianDate(selectedDateObj, true)}`}
            </p>
          </div>

          {!isViewingToday && (
            <button
              type="button"
              onClick={() => setSelectedDateISO(todayISO)}
              className="px-3 py-1.5 rounded-full bg-[#006c49] text-white text-[11px] font-bold hover:bg-[#005236] transition-all shadow-xs flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              <span>Ke Hari Ini</span>
            </button>
          )}
        </div>
      </section>

      {/* Daily Live Update Status Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#e5eeff] shadow-[0_2px_12px_rgba(11,28,48,0.04)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#10b981]/15 text-[#006c49] flex items-center justify-center shrink-0 shadow-2xs">
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
              update
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold text-[#0b1c30]">
                {isViewingToday ? 'Rutinitas Ter-Update Hari Ini' : 'Rutinitas Tanggal Terpilih'}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            </div>
            <span className="text-[11px] text-[#6c7a71] truncate">
              {pendingCount === 0
                ? 'Semua kegiatan tuntas diceklis untuk hari ini 🎉'
                : `${pendingCount} kegiatan harian siap diceklis (${completedCount} tuntas)`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          title="Segarkan data kegiatan harian"
          className="px-3 py-1.5 rounded-xl bg-[#eff4ff] text-[#006c49] text-[11px] font-bold hover:bg-[#dce9ff] transition-all flex items-center gap-1 shrink-0 active:scale-95 border border-[#dce9ff]"
        >
          <span className={`material-symbols-outlined text-[15px] ${isRefreshing ? 'animate-spin' : ''}`}>
            autorenew
          </span>
          <span className="hidden sm:inline">Segarkan</span>
        </button>
      </div>

      {/* Extinguished Streak Flame Alert Banner (when any habit has an empty day) */}
      {extinguishedHabits.length > 0 && isViewingToday && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#ffdad6]/60 border border-[#ffdad6] text-[#341100] shadow-xs animate-in fade-in">
          <div className="w-9 h-9 rounded-xl bg-white text-[#ba1a1a] flex items-center justify-center shrink-0 shadow-2xs">
            <span className="material-symbols-outlined text-[22px]">mode_heat_off</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0 text-[12px]">
            <span className="font-extrabold text-[#ba1a1a] text-[13px] flex items-center gap-1">
              <span>Peringatan: {extinguishedHabits.length} Api Streak Padam 💨</span>
            </span>
            <p className="text-[#5c2400] mt-0.5 leading-snug">
              Ada kebiasaan dengan hari kosong yang terlewat kemarin. Selesaikan dan centang hari ini untuk menyalakan kembali api streak baru!
            </p>
          </div>
        </div>
      )}

      {/* Progress Summary Hero Card */}
      <section className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_20px_-4px_rgba(11,28,48,0.06)] border border-[#e5eeff]/80">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-[#10b981]/10 pointer-events-none blur-2xl"></div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#006c49] uppercase tracking-wider">
              {isViewingToday ? 'Progress Hari Ini' : 'Progress Tanggal Terpilih'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-[32px] font-extrabold text-[#0b1c30] leading-none">
                {completedCount}
              </span>
              <span className="text-[18px] font-semibold text-[#6c7a71]">
                / {totalCount} Selesai
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdbca]/50 text-[#341100] w-fit">
              <span className="material-symbols-outlined text-[15px] text-[#9d4300]">
                {percentage === 100 ? 'celebration' : 'tips_and_updates'}
              </span>
              <span className="text-[12px] font-semibold truncate">
                {totalCount === 0
                  ? 'Belum ada kebiasaan aktif'
                  : percentage === 100
                  ? 'Semua target tuntas! Api membara!'
                  : `${totalCount - completedCount} kebiasaan lagi untuk target sempurna!`}
              </span>
            </div>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center flex-shrink-0 w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                className="text-[#e5eeff]"
                cx="40"
                cy="40"
                fill="transparent"
                r="32"
                stroke="currentColor"
                strokeWidth="7"
              />
              <circle
                className="text-[#10b981] transition-all duration-700 ease-out"
                cx="40"
                cy="40"
                fill="transparent"
                r="32"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                strokeWidth="7"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[16px] font-extrabold text-[#0b1c30] leading-none">
                {percentage}%
              </span>
              <span className="text-[9px] font-bold text-[#6c7a71] uppercase tracking-tighter mt-0.5">
                Target
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time 7-Day Mini Calendar Strip (Current Week Dynamic) */}
      <section className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-bold text-[#0b1c30]">
              {formatIndonesianMonthYear(selectedDateObj)}
            </span>
            <span className="text-[11px] font-medium text-[#6c7a71]">• Minggu Ini</span>
          </div>
          <span className="text-[11px] font-bold text-[#006c49] bg-[#e5eeff] px-2 py-0.5 rounded-full">
            Real-time Aktif
          </span>
        </div>

        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {weekDays.map((item) => {
            const isSelected = selectedDateISO === item.dateISO;
            // Check completed status for that specific date
            const completedOnThisDay =
              habits.length > 0 && habits.filter((h) => h.historyMap?.[item.dateISO]).length;
            const isAllCompleted = habits.length > 0 && completedOnThisDay === habits.length;

            return (
              <button
                key={item.dateISO}
                type="button"
                onClick={() => setSelectedDateISO(item.dateISO)}
                className={`flex flex-col items-center justify-between flex-1 py-2 px-1 min-w-[44px] h-[78px] rounded-xl transition-all select-none relative ${
                  item.isToday
                    ? isSelected
                      ? 'bg-[#006c49] text-white shadow-md -translate-y-0.5 ring-2 ring-[#006c49]'
                      : 'bg-[#10b981] text-white shadow-sm ring-2 ring-[#006c49]/40'
                    : isSelected
                    ? 'bg-[#dce9ff] text-[#0b1c30] border-2 border-[#006c49] shadow-xs'
                    : 'bg-white text-[#0b1c30] shadow-xs border border-[#e5eeff]/70 hover:bg-[#eff4ff]'
                }`}
              >
                {/* Today Badge indicator */}
                {item.isToday && (
                  <span
                    className={`absolute -top-1.5 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                      isSelected ? 'bg-[#6ffbbe] text-[#002113]' : 'bg-white text-[#006c49]'
                    }`}
                  >
                    Hari Ini
                  </span>
                )}

                <span
                  className={`text-[11px] font-bold ${
                    item.isToday
                      ? 'text-white'
                      : isSelected
                      ? 'text-[#006c49]'
                      : 'text-[#6c7a71]'
                  }`}
                >
                  {item.dayName}
                </span>

                <span
                  className={`text-[17px] font-black ${
                    item.isToday || isSelected ? 'text-white' : 'text-[#0b1c30]'
                  } ${!item.isToday && isSelected ? '!text-[#0b1c30]' : ''}`}
                >
                  {item.dayNum}
                </span>

                {/* Day status dot or checkmark */}
                {isAllCompleted ? (
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      item.isToday || isSelected ? 'text-white' : 'text-[#006c49]'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : completedOnThisDay > 0 ? (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.isToday ? 'bg-white' : 'bg-[#10b981]'
                    }`}
                    title={`${completedOnThisDay} selesai`}
                  ></div>
                ) : item.isToday ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#dce9ff]"></div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Category Filter Pills */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Semua Kategori', colorDot: '' },
          { id: 'kesehatan', label: 'Kesehatan', colorDot: 'bg-[#71a1ff]' },
          { id: 'produktivitas', label: 'Produktivitas', colorDot: 'bg-[#fd761a]' },
          { id: 'spiritual', label: 'Spiritual', colorDot: 'bg-[#10b981]' },
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all shadow-xs active:scale-95 ${
                isActive
                  ? 'bg-[#006c49] text-white shadow-sm'
                  : 'bg-white text-[#3c4a42] border border-[#e5eeff] hover:bg-[#eff4ff]'
              }`}
            >
              {cat.colorDot && (
                <span className={`w-2 h-2 rounded-full ${cat.colorDot}`}></span>
              )}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e5eeff] text-[#6c7a71]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      {/* Checklist Status Filter Segmented Control */}
      <section className="bg-[#e5eeff]/75 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 select-none ${
            statusFilter === 'all'
              ? 'bg-[#006c49] text-white shadow-xs'
              : 'text-[#3c4a42] hover:text-[#0b1c30]'
          }`}
        >
          <span>Semua</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white/80 text-[#6c7a71]'
            }`}
          >
            {habits.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 select-none ${
            statusFilter === 'pending'
              ? 'bg-[#005ac2] text-white shadow-xs'
              : 'text-[#3c4a42] hover:text-[#0b1c30]'
          }`}
        >
          <span>Siap Diceklis</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              statusFilter === 'pending'
                ? 'bg-white/20 text-white'
                : 'bg-[#eff4ff] text-[#005ac2]'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 select-none ${
            statusFilter === 'completed'
              ? 'bg-[#006c49] text-white shadow-xs'
              : 'text-[#3c4a42] hover:text-[#0b1c30]'
          }`}
        >
          <span>Selesai</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              statusFilter === 'completed'
                ? 'bg-white/20 text-white'
                : 'bg-[#10b981]/20 text-[#006c49]'
            }`}
          >
            {completedCount}
          </span>
        </button>
      </section>

      {/* Habit Checklist Cards Section */}
      <section className="flex flex-col space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#0b1c30]">
              {isViewingToday ? 'Rutinitas Hari Ini' : 'Daftar Tugas Tanggal Ini'}
            </h2>
            <span className="text-[11px] font-semibold text-[#006c49] bg-[#10b981]/15 px-2 py-0.5 rounded-full">
              {displayedHabits.length} Ditampilkan
            </span>
          </div>

          <span className="text-[11px] text-[#6c7a71]">
            {isViewingToday ? 'Otomatis Real-time' : formatIndonesianDate(selectedDateObj, false)}
          </span>
        </div>

        {/* Celebratory Banner when all are completed for today */}
        {isViewingToday && totalCount > 0 && pendingCount === 0 && (
          <div className="p-4 rounded-2xl bg-[#006c49]/10 border border-[#006c49]/20 flex items-center gap-3.5 shadow-2xs animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-[#006c49] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">celebration</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-[#006c49]">
                Semua Kegiatan Hari Ini Tuntas Diceklis! 🎉
              </span>
              <span className="text-[11px] text-[#3c4a42] leading-snug">
                Luar biasa! Seluruh {totalCount} kegiatan keseharian telah selesai hari ini. Api streak kamu tetap berkobar 🔥
              </span>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5eeff] text-center flex flex-col items-center gap-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#e5eeff] text-[#006c49] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Daftar Kebiasaan Bersih</h3>
              <p className="text-[12px] text-[#6c7a71] max-w-[280px]">
                Semua data dummy telah dikosongkan. Mulai catat rutinitas pribadi pertamamu!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onGoToAdd}
                className="px-4 py-2 bg-[#006c49] text-white rounded-full text-[12px] font-bold hover:bg-[#005236] shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Tambah Kebiasaan</span>
              </button>
              {onResetToDefault && (
                <button
                  type="button"
                  onClick={onResetToDefault}
                  className="px-3.5 py-2 bg-[#eff4ff] text-[#006c49] rounded-full text-[12px] font-bold hover:bg-[#dce9ff]"
                >
                  Muat Contoh Bawaan
                </button>
              )}
            </div>
          </div>
        ) : displayedHabits.length === 0 ? (
          <div className="bg-white rounded-xl p-5 border border-[#e5eeff] text-center text-[#6c7a71] text-[13px] flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#006c49]">task_alt</span>
            <span>
              {statusFilter === 'pending'
                ? 'Hebat! Tidak ada kegiatan yang belum diceklis. Semua sudah tuntas!'
                : statusFilter === 'completed'
                ? 'Belum ada kegiatan yang diceklis untuk status ini.'
                : `Tidak ada kebiasaan dalam kategori "${selectedCategory}".`}
            </span>
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="mt-1 px-3 py-1 bg-[#eff4ff] text-[#006c49] rounded-full text-[11px] font-bold"
              >
                Tampilkan Semua
              </button>
            )}
          </div>
        ) : (
          displayedHabits.map((habit) => {
            const isCompletedForDate = Boolean(habit.historyMap?.[selectedDateISO]);

            const getAccentBarColor = () => {
              switch (habit.category) {
                case 'Kesehatan':
                  return 'bg-[#71a1ff]';
                case 'Produktivitas':
                  return 'bg-[#fd761a]';
                case 'Spiritual':
                  return 'bg-[#10b981]';
                case 'Keuangan':
                  return 'bg-[#ffd700]';
                default:
                  return 'bg-[#006c49]';
              }
            };

            const getCategoryBadgeClass = () => {
              switch (habit.category) {
                case 'Kesehatan':
                  return 'bg-[#eff4ff] text-[#005ac2]';
                case 'Produktivitas':
                  return 'bg-[#ffdbca]/70 text-[#9d4300]';
                case 'Spiritual':
                  return 'bg-[#10b981]/15 text-[#006c49]';
                default:
                  return 'bg-[#e5eeff] text-[#006c49]';
              }
            };

            const isStreakActive = habit.streak > 0;

            return (
              <div
                key={habit.id}
                onClick={() => onSelectHabitForDetail(habit)}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 cursor-pointer border select-none ${
                  isCompletedForDate
                    ? 'bg-[#eff4ff]/80 border-[#bbcabf]/30 shadow-xs opacity-90'
                    : 'bg-white border-[#e5eeff] shadow-[0_4px_16px_-2px_rgba(11,28,48,0.06)] hover:border-[#10b981]/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1 pr-2">
                  {/* Vertical Category Line */}
                  <div
                    className={`w-1.5 h-12 rounded-full flex-shrink-0 mt-0.5 ${getAccentBarColor()}`}
                  ></div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryBadgeClass()}`}
                      >
                        {habit.category}
                      </span>

                      {/* Explicit Daily Status Badge (Siap Diceklis vs Selesai) */}
                      {isCompletedForDate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/15 text-[#006c49] border border-[#10b981]/25">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          <span>Tuntas{habit.completedTime ? ` (${habit.completedTime})` : ''}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#005ac2] border border-[#bbd3ff]">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          <span>Siap Diceklis Hari Ini</span>
                        </span>
                      )}

                      {/* Streak Flame Status Badge */}
                      {isStreakActive ? (
                        <div
                          className="flex items-center gap-1 text-[#9d4300] bg-[#ffdbca]/40 px-2 py-0.5 rounded-full border border-[#ffdbca]"
                          title={`${habit.streak} hari berturut-turut aktif`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            local_fire_department
                          </span>
                          <span className="text-[11px] font-extrabold">
                            {habit.streak} Hari 🔥
                          </span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1 text-[#ba1a1a] bg-[#ffdad6]/60 px-2 py-0.5 rounded-full border border-[#ffdad6]"
                          title="Api padam karena ada hari yang terlewat/kosong. Centang hari ini untuk menyalakan kembali api streak!"
                        >
                          <span className="material-symbols-outlined text-[13px] text-[#6c7a71]">
                            mode_heat_off
                          </span>
                          <span className="text-[10px] font-extrabold">
                            Api Padam 💨
                          </span>
                        </div>
                      )}
                    </div>

                    <p
                      className={`text-[16px] font-bold mt-1 truncate ${
                        isCompletedForDate
                          ? 'line-through text-[#6c7a71]'
                          : 'text-[#0b1c30]'
                      }`}
                    >
                      {habit.title}
                    </p>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[#6c7a71] text-[12px] flex-wrap">
                      <span className="material-symbols-outlined text-[13px]">
                        {habit.category === 'Spiritual'
                          ? 'bedtime'
                          : habit.isUrgent
                          ? 'alarm'
                          : 'schedule'}
                      </span>
                      <span>
                        {habit.time} {habit.timezone}
                      </span>

                      {/* When streak is 0, give encouragement */}
                      {!isStreakActive && !isCompletedForDate && isViewingToday && (
                        <span className="text-[#9d4300] font-semibold text-[11px]">
                          • Nyalakan api hari ini!
                        </span>
                      )}

                      {habit.isUrgent && !isCompletedForDate && (
                        <span className="text-[#ba1a1a] font-bold text-[11px] animate-pulse">
                          • Segera
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Large Accessible Check Button */}
                <button
                  type="button"
                  aria-label={
                    isCompletedForDate
                      ? 'Tandai Belum Selesai'
                      : 'Centang Selesai'
                  }
                  onClick={(e) => handleCheckboxClick(habit.id, e)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm active:scale-90 ${
                    isCompletedForDate
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#dce9ff] text-[#6c7a71] hover:bg-[#10b981]/20 hover:text-[#006c49]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isCompletedForDate ? 'check' : 'radio_button_unchecked'}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </section>

      {/* Real-time Streak Rules Explainability Card */}
      <section className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]">
        <div className="w-8 h-8 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#9d4300] shrink-0 mt-0.5 shadow-2xs">
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
        </div>
        <div className="flex flex-col min-w-0 text-[12px]">
          <span className="font-bold text-[#0b1c30]">Aturan Runtutan Api Streak Real-time:</span>
          <p className="text-[#3c4a42] mt-0.5 leading-relaxed">
            Setiap tanggal harian akan diperbarui otomatis sesuai kalender asli. Jika ada <strong>1 hari yang kosong (terlewat)</strong>, api streak akan <strong>otomatis padam (kembali ke 0)</strong>. Selesaikan target setiap hari agar apimu tidak padam!
          </p>
        </div>
      </section>

      {/* Floating Action Button (Tambah Kebiasaan) */}
      <div className="sticky bottom-4 right-0 flex justify-end pointer-events-none z-30 pt-2">
        <button
          type="button"
          onClick={onGoToAdd}
          aria-label="Tambah Kebiasaan Baru"
          className="pointer-events-auto flex items-center gap-2 pl-4 pr-5 h-12 rounded-full bg-[#006c49] text-white shadow-lg hover:bg-[#005236] hover:shadow-xl active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span className="text-[14px] font-bold whitespace-nowrap">
            Tambah Kebiasaan
          </span>
        </button>
      </div>
    </div>
  );
};
