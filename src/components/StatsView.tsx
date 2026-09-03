import React, { useState } from 'react';
import { Habit, AchievementBadge } from '../types';
import { getCurrentWeekDates, formatIndonesianMonthYear } from '../utils/dateUtils';

interface StatsViewProps {
  habits: Habit[];
  badges: AchievementBadge[];
  onUpdateHabitTime?: (habitId: string, newTime: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ habits, badges, onUpdateHabitTime }) => {
  const [timePeriod, setTimePeriod] = useState<'minggu' | 'bulan' | 'semua'>('minggu');
  const [updatedReminderToast, setUpdatedReminderToast] = useState<string | null>(null);

  const activeHabitsCount = habits.length;
  const totalCheckins = habits.reduce((acc, h) => acc + (h.totalCompletedDays || 0), 0);
  const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak || h.streak), 0) : 0;
  const highestActiveStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0;

  // Habits with active flame vs extinguished
  const activeFlameHabits = habits.filter((h) => h.streak > 0);
  const extinguishedHabits = habits.filter((h) => h.streak === 0);

  // Dynamic weekly performance for current week
  const weekDays = getCurrentWeekDates();
  const weekDayData = weekDays.map((w) => {
    const completedCount = habits.filter((h) => h.historyMap?.[w.dateISO]).length;
    const rate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    return {
      ...w,
      completedCount,
      rate,
    };
  });

  // Average weekly completion rate
  const pastOrTodayDays = weekDayData.filter((w) => !w.isFuture);
  const avgWeeklyRate =
    pastOrTodayDays.length > 0
      ? Math.round(
          pastOrTodayDays.reduce((acc, curr) => acc + curr.rate, 0) / pastOrTodayDays.length
        )
      : 0;

  const handleAdjustTime = () => {
    const exerciseHabit = habits.find((h) => h.title.toLowerCase().includes('olahraga'));
    if (exerciseHabit && onUpdateHabitTime) {
      onUpdateHabitTime(exerciseHabit.id, '06:30');
    }
    setUpdatedReminderToast('Waktu olahraga berhasil diubah ke 06:30 WIB!');
    setTimeout(() => setUpdatedReminderToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {updatedReminderToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#006c49] text-white px-4 py-2 rounded-full text-[12px] font-bold shadow-lg animate-bounce">
          {updatedReminderToast}
        </div>
      )}

      {/* Header & Segmented Time Filter */}
      <section className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#0b1c30]">Evaluasi & Statistik</h1>
            <p className="text-[13px] text-[#3c4a42]">Lacak ritme disiplin & pantau api streak harian</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#10b981]/15 flex items-center justify-center text-[#006c49]">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="bg-[#e5eeff] p-1 rounded-full flex items-center justify-between shadow-xs mt-1">
          <button
            type="button"
            onClick={() => setTimePeriod('minggu')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold transition-all text-center select-none ${
              timePeriod === 'minggu'
                ? 'bg-[#006c49] text-white shadow-xs'
                : 'text-[#3c4a42] hover:text-[#0b1c30]'
            }`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod('bulan')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold transition-all text-center select-none ${
              timePeriod === 'bulan'
                ? 'bg-[#006c49] text-white shadow-xs'
                : 'text-[#3c4a42] hover:text-[#0b1c30]'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod('semua')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[12px] font-bold transition-all text-center select-none ${
              timePeriod === 'semua'
                ? 'bg-[#006c49] text-white shadow-xs'
                : 'text-[#3c4a42] hover:text-[#0b1c30]'
            }`}
          >
            Semua Waktu
          </button>
        </div>
      </section>

      {/* Key Metrics Summary (2x2 Grid) */}
      <section className="grid grid-cols-2 gap-3">
        {/* Metric 1: Tingkat Keberhasilan */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
              Tingkat Sukses
            </span>
            <div className="w-7 h-7 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-[#006c49] leading-tight">
              {avgWeeklyRate}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#006c49]">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="text-[10px] font-bold">Rerata minggu ini</span>
            </div>
          </div>
          <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full bg-[#006c49]/5 pointer-events-none"></div>
        </div>

        {/* Metric 2: Streak Terbaik & Api Status */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
              Api Streak Aktif
            </span>
            <div className="w-7 h-7 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#9d4300]">
              <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#0b1c30] flex items-center gap-1">
              <span>{highestActiveStreak} Hari</span>
              <span className="text-xl">🔥</span>
            </div>
            <span className="text-[11px] text-[#6c7a71] block">
              Rekor: {bestStreak} Hari
            </span>
          </div>
        </div>

        {/* Metric 3: Total Ceklis */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
              Total Ceklis
            </span>
            <div className="w-7 h-7 rounded-full bg-[#005ac2]/10 flex items-center justify-center text-[#005ac2]">
              <span className="material-symbols-outlined text-[16px]">done_all</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#0b1c30]">
              {totalCheckins}
            </div>
            <span className="text-[12px] text-[#6c7a71]">Rutinitas Tuntas</span>
          </div>
        </div>

        {/* Metric 4: Kebiasaan Aktif */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
              Status Kebiasaan
            </span>
            <div className="w-7 h-7 rounded-full bg-[#dce9ff] flex items-center justify-center text-[#0b1c30]">
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#0b1c30]">{activeHabitsCount}</div>
            <span className="text-[11px] text-[#6c7a71]">
              {activeFlameHabits.length} Api Aktif • {extinguishedHabits.length} Padam
            </span>
          </div>
        </div>
      </section>

      {/* Dynamic Weekly Performance Bar Chart (Real-time Dates) */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[16px] font-bold text-[#0b1c30]">Performa Mingguan Kalender</span>
            <span className="text-[12px] text-[#6c7a71]">
              {formatIndonesianMonthYear(new Date())} • Rata-rata: {avgWeeklyRate}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#006c49]/10 text-[#006c49]">
            <span className="material-symbols-outlined text-[14px]">flag</span>
            <span className="text-[10px] font-bold">Target 80%</span>
          </div>
        </div>

        {/* Chart Canvas Area with Target Line */}
        <div className="relative w-full h-44 pt-4 pb-1 flex flex-col justify-end">
          {/* Target Average 80% guideline */}
          <div className="absolute inset-x-0 bottom-24 flex items-center z-10 pointer-events-none">
            <div className="w-full h-px border-t border-dashed border-[#bbcabf]"></div>
            <span className="absolute right-0 -top-2.5 text-[10px] text-[#6c7a71] bg-white px-1 rounded font-semibold">
              Target 80%
            </span>
          </div>

          {/* 7 Bars Container Dynamically Generated from current week */}
          <div className="grid grid-cols-7 gap-2 items-end h-32 w-full z-20">
            {weekDayData.map((day) => {
              const heightPct = day.isFuture ? 10 : Math.max(8, day.rate);

              return (
                <div
                  key={day.dateISO}
                  title={`${day.dayName} (${day.dayNum}): ${day.rate}% (${day.completedCount}/${habits.length})`}
                  className={`flex flex-col items-center h-full justify-end group cursor-pointer ${
                    day.isFuture ? 'opacity-40' : ''
                  }`}
                >
                  <div
                    className={`text-[10px] mb-1 font-bold ${
                      day.isToday
                        ? 'text-[#fd761a]'
                        : 'text-[#6c7a71] opacity-0 group-hover:opacity-100 transition-opacity'
                    }`}
                  >
                    {day.isFuture ? '-' : `${day.rate}%`}
                  </div>

                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg transition-all relative ${
                      day.isToday
                        ? 'bg-gradient-to-t from-[#006c49] to-[#10b981] shadow-md ring-2 ring-[#006c49]'
                        : day.rate >= 80
                        ? 'bg-[#006c49] shadow-xs'
                        : day.isFuture
                        ? 'bg-[#e5eeff]'
                        : 'bg-[#006c49]/60'
                    }`}
                  >
                    {day.isToday && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#fd761a] animate-pulse"></span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] mt-2 ${
                      day.isToday
                        ? 'text-[#006c49] font-black underline decoration-2 decoration-[#fd761a]'
                        : 'font-semibold text-[#0b1c30]'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[9px] text-[#6c7a71] leading-none">{day.dayNum}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Streak Fire Rules & Extinguished Insights */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#006c49]">psychology</span>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">Analisis Streak & Rekomendasi</h2>
        </div>

        {/* Extinguished flames alert */}
        {extinguishedHabits.length > 0 ? (
          <div className="bg-[#ffdad6]/60 p-4 rounded-xl flex items-start gap-3 relative overflow-hidden border border-[#ffdad6]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#ba1a1a] flex-shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">mode_heat_off</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider">
                  Api Streak Padam ({extinguishedHabits.length} Kebiasaan)
                </span>
                <span className="text-[10px] font-bold text-[#ba1a1a]">Hari Kosong Terlewat</span>
              </div>
              <div className="text-[14px] font-bold text-[#0b1c30] mt-0.5 truncate">
                {extinguishedHabits.map((h) => h.title).join(', ')}
              </div>
              <p className="text-[12px] text-[#5c2400] mt-1 leading-relaxed">
                Runtutan streak terputus karena ada hari yang tidak dikerjakan kemarin. Jangan putus asa, selesaikan kebiasaan ini hari ini untuk memantik api streak baru!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#006c49]/10 p-4 rounded-xl flex items-start gap-3 relative overflow-hidden border border-[#006c49]/15">
            <div className="w-10 h-10 rounded-full bg-[#006c49] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider">
                  Semua Api Membara 🔥
                </span>
                <span className="text-[10px] font-bold text-[#006c49]">Konsistensi Tinggi</span>
              </div>
              <p className="text-[12px] text-[#3c4a42] mt-1 leading-relaxed">
                Tidak ada hari yang kosong! Seluruh rutinitasmu memiliki streak aktif. Lanjutkan disiplin ini hari demi hari.
              </p>
            </div>
          </div>
        )}

        {/* Orange Highlight: Time adjustment recommendation */}
        <div className="bg-[#ffdbca]/50 p-4 rounded-xl flex items-start gap-3 relative overflow-hidden border border-[#fd761a]/20">
          <div className="w-10 h-10 rounded-full bg-[#fd761a] flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-[#5c2400] uppercase tracking-wider">
                Saran Optimalisasi Waktu
              </span>
              <span className="text-[10px] font-bold text-[#9d4300]">Tips Rutinitas</span>
            </div>
            <div className="text-[14px] font-bold text-[#0b1c30] mt-0.5 truncate">
              Jadwalkan Olahraga di Pagi Hari
            </div>
            <p className="text-[12px] text-[#3c4a42] mt-1 leading-relaxed">
              Jadwal sore hari rawan terlewat karena kesibukan harian. Mengubah waktu ke jam 06:30 pagi terbukti meningkatkan peluang api streak bertahan hingga 90%.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdjustTime}
                className="px-3 py-1 bg-[#5c2400] text-white rounded-full text-[11px] font-bold hover:bg-[#341100] transition-colors inline-flex items-center gap-1 shadow-xs active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                Ubah Olahraga ke Pagi (06:30)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#006c49]">emoji_events</span>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Lencana Pencapaian</h2>
          </div>
          <span className="text-[12px] font-bold text-[#006c49]">{badges.length} Diraih</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white p-3 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col items-center text-center gap-1.5"
            >
              <div className="w-10 h-10 rounded-full bg-[#10b981]/15 text-[#006c49] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
              </div>
              <span className="text-[12px] font-bold text-[#0b1c30] leading-tight line-clamp-1">
                {badge.title}
              </span>
              <span className="text-[10px] text-[#6c7a71] line-clamp-1">{badge.subtitle}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
