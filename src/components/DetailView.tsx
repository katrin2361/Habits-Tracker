import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import {
  formatIndonesianDate,
  formatIndonesianMonthYear,
  getTodayISO,
  calculateStreakInfo,
  parseDateISO,
} from '../utils/dateUtils';

interface DetailViewProps {
  habit: Habit;
  onBack?: () => void;
  onToggleHabit?: (id: string, e: React.MouseEvent, dateISO?: string) => void;
  onDeleteHabit?: (id: string) => void;
  onUpdateHabit: (updatedHabit: Habit) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  habit,
  onUpdateHabit,
}) => {
  const todayISO = getTodayISO();

  // Selected date in the calendar for inspecting daily history and notes
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);
  const [dailyNoteText, setDailyNoteText] = useState<string>(() => {
    return habit.dailyNotes?.[todayISO] ?? habit.notes ?? '';
  });
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Synchronize note text when habit changes or selected date changes
  useEffect(() => {
    const existing =
      habit.dailyNotes?.[selectedDateISO] ?? (selectedDateISO === todayISO ? habit.notes ?? '' : '');
    setDailyNoteText(existing);
  }, [habit.id, selectedDateISO, todayISO]);

  // Month navigation
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const isStreakActive = habit.streak > 0;
  const streakInfo = calculateStreakInfo(habit.historyMap || {}, todayISO);

  const handlePrevMonth = () => {
    setCalendarDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  // When clicking a date in calendar: do NOT toggle checklist, just inspect that date & load its daily notes
  const handleSelectDate = (dateISO: string) => {
    setSelectedDateISO(dateISO);
    const existingNote =
      habit.dailyNotes?.[dateISO] ?? (dateISO === todayISO ? habit.notes ?? '' : '');
    setDailyNoteText(existingNote);
    setNoteSaved(false);
  };

  const handleSaveDailyNote = () => {
    const trimmed = dailyNoteText.trim();
    const updatedDailyNotes: Record<string, string> = {
      ...(habit.dailyNotes || {}),
      [selectedDateISO]: trimmed,
    };
    const updatedHabit: Habit = {
      ...habit,
      dailyNotes: updatedDailyNotes,
      notes: selectedDateISO === todayISO ? trimmed : habit.notes,
    };
    onUpdateHabit(updatedHabit);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  // Build calendar matrix for calendarDate
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Count completions this month
  let completedCountInMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (habit.historyMap?.[iso]) {
      completedCountInMonth++;
    }
  }

  // Selected date info for the daily inspection panel
  const selectedDateObj = parseDateISO(selectedDateISO);
  const formattedSelectedDate = formatIndonesianDate(selectedDateObj, true);
  const isSelectedToday = selectedDateISO === todayISO;
  const isSelectedFuture = selectedDateISO > todayISO;
  const isSelectedCompleted = Boolean(habit.historyMap && habit.historyMap[selectedDateISO]);

  return (
    <div className="flex flex-col w-full pb-8 space-y-5 animate-in fade-in duration-300 pt-1">
      {/* Hero Streak Counter (Reflects Flame Status) */}
      <div
        className={`relative overflow-hidden rounded-2xl text-white shadow-lg p-5 transition-all ${
          isStreakActive
            ? 'bg-gradient-to-br from-[#fd761a] via-[#9d4300] to-[#341100]'
            : 'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1e293b]'
        }`}
      >
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isStreakActive
                  ? 'bg-white/20 backdrop-blur-md text-white'
                  : 'bg-[#ffdad6]/20 text-[#ffb4ab]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isStreakActive ? 'local_fire_department' : 'mode_heat_off'}
              </span>
              {isStreakActive ? 'Streak Berjalan' : 'Api Streak Padam'}
            </span>
            <span className="text-[12px] font-bold text-white/95 bg-black/25 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="material-symbols-outlined text-[15px]">{habit.icon}</span>
              <span>{habit.title}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[36px] text-white font-black tracking-tight leading-none">
              {habit.streak}
            </span>
            <span className="text-[18px] font-bold text-[#ffdbca]">Hari Beruntun</span>
            <span className="text-2xl ml-1">{isStreakActive ? '🔥' : '💨'}</span>
          </div>

          <p className="text-[13px] text-white/90 leading-snug">
            {streakInfo.description}
          </p>

          <div className="mt-1 pt-2 border-t border-white/20 bg-black/15 rounded-lg p-2.5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb690] text-[20px]">
              {isStreakActive ? 'military_tech' : 'info'}
            </span>
            <p className="text-[12px] text-[#ffdbca] leading-tight">
              {isStreakActive ? (
                <>
                  Rekor terbaikmu: <strong className="text-white font-bold">{habit.bestStreak} Hari</strong>. Pertahankan setiap hari!
                </>
              ) : (
                <>
                  Runtutan padam karena ada hari yang terlewat. Centang hari ini untuk memulai <strong>1 Hari 🔥</strong> baru!
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Kartu Statistik Spesifik Kebiasaan */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3.5 shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span
              className={`material-symbols-outlined text-[22px] ${
                isStreakActive ? 'text-[#9d4300]' : 'text-[#6c7a71]'
              }`}
            >
              {isStreakActive ? 'local_fire_department' : 'mode_heat_off'}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                isStreakActive
                  ? 'bg-[#ffdbca] text-[#9d4300]'
                  : 'bg-[#ffdad6] text-[#ba1a1a]'
              }`}
            >
              {isStreakActive ? 'Aktif 🔥' : 'Padam 💨'}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-[20px] font-extrabold text-[#0b1c30]">
              {habit.streak} Hari
            </div>
            <div className="text-[11px] text-[#6c7a71]">Streak Saat Ini</div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3.5 shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#006c49]">
            <span className="material-symbols-outlined text-[22px]">emoji_events</span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase">Rekor</span>
          </div>
          <div className="mt-2.5">
            <div className="text-[20px] font-extrabold text-[#0b1c30]">
              {habit.bestStreak || habit.streak} Hari
            </div>
            <div className="text-[11px] text-[#6c7a71]">Streak Terbaik</div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3.5 shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#005ac2]">
            <span className="material-symbols-outlined text-[22px]">pie_chart</span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase">Rasio</span>
          </div>
          <div className="mt-2.5">
            <div className="text-[20px] font-extrabold text-[#0b1c30]">
              {habit.completionRate}%
            </div>
            <div className="text-[11px] text-[#6c7a71]">Tingkat Keberhasilan</div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-3.5 shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#10b981]">
            <span className="material-symbols-outlined text-[22px]">event_available</span>
            <span className="text-[10px] text-[#6c7a71] font-bold uppercase">Total</span>
          </div>
          <div className="mt-2.5">
            <div className="text-[20px] font-extrabold text-[#0b1c30]">
              {habit.totalCompletedDays} Hari
            </div>
            <div className="text-[11px] text-[#6c7a71]">Total Selesai</div>
          </div>
        </div>
      </div>

      {/* Kalender Riwayat Selesai (Dynamic Real-Time Calendar) */}
      <div className="rounded-xl bg-white p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Riwayat Kalender Harian</h2>
            <span className="text-[12px] text-[#6c7a71]">
              {formatIndonesianMonthYear(calendarDate)} • {completedCountInMonth}/{daysInMonth} Hari Tuntas
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan Sebelumnya"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan Berikutnya"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Nama Hari */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#6c7a71] pt-1">
          <span>MIN</span>
          <span>SEN</span>
          <span>SEL</span>
          <span>RAB</span>
          <span>KAM</span>
          <span>JUM</span>
          <span>SAB</span>
        </div>

        {/* Grid Kalender Tanggal Dinamis */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-[12px] font-bold pt-1">
          {/* Offset hari bulan sebelumnya */}
          {Array.from({ length: firstDayWeekIndex }, (_, i) => {
            const dayNum = prevMonthTotalDays - firstDayWeekIndex + 1 + i;
            return (
              <div
                key={`prev-${dayNum}`}
                className="h-9 flex items-center justify-center text-[#6c7a71]/30 select-none text-[11px]"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Hari dalam bulan ini */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1;
            const dateISO = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateISO === todayISO;
            const isFuture = dateISO > todayISO;
            const isCompleted = Boolean(habit.historyMap && habit.historyMap[dateISO]);
            const isSelected = dateISO === selectedDateISO;
            const hasNote = Boolean(habit.dailyNotes?.[dateISO] || (dateISO === todayISO && habit.notes));

            return (
              <div
                key={dateISO}
                onClick={() => handleSelectDate(dateISO)}
                title={
                  isFuture
                    ? `${dayNum}: Tanggal mendatang (Klik untuk lihat catatan)`
                    : isToday
                    ? `${dayNum}: Hari Ini (${isCompleted ? 'Selesai' : 'Belum selesai'})`
                    : `${dayNum}: ${isCompleted ? 'Selesai' : 'Kosong / Terlewat'}${hasNote ? ' • Ada catatan' : ''}`
                }
                className="h-10 flex items-center justify-center select-none cursor-pointer"
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-all relative ${
                    isSelected
                      ? 'ring-2 ring-[#006c49] ring-offset-2 scale-110 z-10 font-black shadow-md'
                      : 'hover:scale-105 active:scale-95'
                  } ${
                    isToday
                      ? isCompleted
                        ? 'bg-[#006c49] text-white ring-1 ring-[#10b981]'
                        : 'bg-[#10b981] text-white ring-1 ring-[#006c49]'
                      : isCompleted
                      ? 'bg-[#006c49] text-white'
                      : isFuture
                      ? 'bg-[#eff4ff]/60 text-[#6c7a71]/60'
                      : 'bg-[#e5eeff] text-[#6c7a71] hover:bg-[#dce9ff]'
                  }`}
                >
                  {dayNum}
                  {isToday && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#fd761a]"></span>
                  )}
                  {hasNote && (
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#fd761a] ring-2 ring-white"
                      title="Ada catatan harian"
                    ></span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#6c7a71] pt-2 border-t border-[#e5eeff] gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#006c49]"></span> Selesai
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#e5eeff]"></span> Kosong / Lewat
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#10b981] ring-1 ring-[#006c49]"></span> Hari Ini
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fd761a]"></span> Ada Catatan
            </span>
          </div>
          <span className="font-semibold text-[#006c49] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">touch_app</span>
            <span>Klik tanggal untuk melihat riwayat & catatan</span>
          </span>
        </div>
      </div>

      {/* Panel Riwayat & Catatan Harian Berdasarkan Tanggal Terpilih */}
      <div className="rounded-2xl bg-white p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-4">
        {/* Header Tanggal Terpilih */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006c49]/10 text-[#006c49] flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-extrabold text-[#0b1c30]">
                  Riwayat Tanggal: {formattedSelectedDate}
                </h2>
                {isSelectedToday ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#006c49]">
                    Hari Ini
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#005ac2]">
                    Tanggal Terpilih
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6c7a71] mt-0.5">
                Informasi riwayat harian dan catatan refleksi khusus untuk tanggal ini
              </p>
            </div>
          </div>

          {!isSelectedToday && (
            <button
              type="button"
              onClick={() => handleSelectDate(todayISO)}
              className="text-[11px] font-bold text-[#006c49] bg-[#eff4ff] hover:bg-[#dce9ff] px-3 py-1.5 rounded-full border border-[#dce9ff] transition-all flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[14px]">today</span>
              <span>Lihat Hari Ini</span>
            </button>
          )}
        </div>

        {/* Status Card untuk Tanggal Terpilih */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition-all ${
            isSelectedCompleted
              ? 'bg-[#006c49]/10 border-[#006c49]/20'
              : isSelectedFuture
              ? 'bg-[#eff4ff]/60 border-[#dce9ff]'
              : isSelectedToday
              ? 'bg-[#eff4ff] border-[#bbd3ff]'
              : 'bg-[#ffdad6]/60 border-[#ffdad6]'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isSelectedCompleted
                ? 'bg-[#006c49] text-white'
                : isSelectedFuture
                ? 'bg-[#6c7a71]/20 text-[#6c7a71]'
                : isSelectedToday
                ? 'bg-[#005ac2] text-white'
                : 'bg-[#ba1a1a] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSelectedCompleted
                ? 'check_circle'
                : isSelectedFuture
                ? 'event'
                : isSelectedToday
                ? 'schedule'
                : 'mode_heat_off'}
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={`text-[13px] font-extrabold ${
                isSelectedCompleted
                  ? 'text-[#006c49]'
                  : isSelectedFuture
                  ? 'text-[#6c7a71]'
                  : isSelectedToday
                  ? 'text-[#005ac2]'
                  : 'text-[#ba1a1a]'
              }`}
            >
              {isSelectedCompleted
                ? 'Selesai Tuntas ✓'
                : isSelectedFuture
                ? 'Tanggal Mendatang'
                : isSelectedToday
                ? 'Belum Selesai Hari Ini'
                : 'Kosong / Terlewat 💨'}
            </span>
            <span className="text-[11px] text-[#3c4a42] leading-snug">
              {isSelectedCompleted
                ? isSelectedToday && habit.completedTime
                  ? `Kegiatan berhasil dituntaskan hari ini pukul ${habit.completedTime} WIB.`
                  : 'Kegiatan ini tercatat telah diselesaikan dengan sukses pada tanggal ini.'
                : isSelectedFuture
                ? 'Tanggal ini belum berlangsung. Siapkan dirimu untuk menjaga konsistensi.'
                : isSelectedToday
                ? 'Kegiatan belum diceklis hari ini. Buka halaman utama "Hari Ini" untuk mencentang.'
                : 'Kegiatan tidak diceklis pada tanggal ini (hari kosong).'}
            </span>
          </div>
        </div>

        {/* Catatan Harian (Daily Notes) Editor */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-[#e5eeff]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[19px] text-[#006c49]">edit_note</span>
              <h3 className="text-[13px] font-bold text-[#0b1c30]">
                Catatan Harian ({formatIndonesianDate(parseDateISO(selectedDateISO), false)})
              </h3>
            </div>
            {noteSaved && (
              <span className="text-[11px] font-bold text-[#006c49] animate-fade-in flex items-center gap-1 bg-[#10b981]/15 px-2.5 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[13px]">check</span>
                <span>Tersimpan!</span>
              </span>
            )}
          </div>

          <textarea
            value={dailyNoteText}
            onChange={(e) => {
              setDailyNoteText(e.target.value);
              setNoteSaved(false);
            }}
            placeholder={`Tulis catatan, refleksi, kendala, atau evaluasi harian untuk tanggal ${formatIndonesianDate(
              parseDateISO(selectedDateISO),
              false
            )}...`}
            rows={3}
            className="w-full text-[13px] text-[#0b1c30] p-3.5 rounded-xl border border-[#e5eeff] bg-[#eff4ff]/30 focus:bg-white focus:border-[#006c49] outline-none resize-none transition-all placeholder:text-[#6c7a71]/60"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-[#6c7a71]">
              💡 Catatan ini terikat langsung pada tanggal ini dan tersimpan di riwayat kalender
            </span>
            <button
              type="button"
              onClick={handleSaveDailyNote}
              className="self-end sm:self-auto px-4 py-2 bg-[#006c49] text-white rounded-xl text-[12px] font-bold hover:bg-[#005236] transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Simpan Catatan Tanggal Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
