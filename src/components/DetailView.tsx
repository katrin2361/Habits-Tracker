import React, { useState } from 'react';
import { Habit } from '../types';
import { triggerConfetti } from '../utils/confetti';
import {
  formatIndonesianDate,
  formatIndonesianMonthYear,
  getTodayISO,
  calculateStreakInfo,
} from '../utils/dateUtils';

interface DetailViewProps {
  habit: Habit;
  onBack: () => void;
  onToggleHabit: (id: string, e: React.MouseEvent, dateISO?: string) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateHabit: (updatedHabit: Habit) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  habit,
  onBack,
  onToggleHabit,
  onDeleteHabit,
  onUpdateHabit,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>(habit.notes || '');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(habit.reminderEnabled);
  const [editTitle, setEditTitle] = useState<string>(habit.title);
  const [editTime, setEditTime] = useState<string>(habit.time);

  // Month navigation
  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const todayISO = getTodayISO();
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

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    onUpdateHabit({
      ...habit,
      notes: noteText.trim(),
    });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateHabit({
      ...habit,
      title: editTitle.trim() || habit.title,
      time: editTime || habit.time,
    });
    setIsEditing(false);
  };

  const handleToggleDate = (dateISO: string, e: React.MouseEvent) => {
    if (dateISO > todayISO) return; // cannot toggle future
    const currentlyDone = Boolean(habit.historyMap?.[dateISO]);
    if (!currentlyDone) {
      triggerConfetti(e.currentTarget as HTMLElement);
    }
    onToggleHabit(habit.id, e, dateISO);
  };

  const handleToggleToday = (e: React.MouseEvent) => {
    handleToggleDate(todayISO, e);
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

  return (
    <div className="flex flex-col w-full pb-8 space-y-5 animate-in fade-in duration-300">
      {/* Sub-Header / Navigasi Aksi */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke Beranda"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors text-[12px] font-bold shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            aria-label="Edit Kebiasaan"
            title="Edit Kebiasaan"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff] transition-colors active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            aria-label="Hapus Kebiasaan"
            title="Hapus Kebiasaan"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] transition-colors active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Edit Mode Inline Drawer */}
      {isEditing && (
        <div className="p-4 rounded-xl bg-white border border-[#10b981] shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#006c49]">Edit Nama & Jadwal</span>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-[#6c7a71] text-[12px]"
            >
              Batal
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#6c7a71]">Nama Kebiasaan</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-[14px] font-medium outline-none focus:border-[#006c49]"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[11px] font-bold text-[#6c7a71]">Waktu Pengingat</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-[14px] outline-none focus:border-[#006c49]"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="self-end px-4 py-2 bg-[#006c49] text-white rounded-lg text-[12px] font-bold hover:bg-[#005236]"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Identitas Kebiasaan Card */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-xs border border-[#e5eeff]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#006c49] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[28px]">{habit.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e5eeff] text-[#006c49] w-fit">
                {habit.category}
              </span>
              <h1 className="text-[20px] font-extrabold text-[#0b1c30] mt-0.5">
                {habit.title}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[12px] font-bold text-[#006c49] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#dce9ff]">
              {habit.frequency}
            </span>
          </div>
        </div>

        <p className="text-[13px] text-[#3c4a42] leading-relaxed mt-1">
          {habit.description}
        </p>

        {/* Quick Check-in CTA Button for Today */}
        <div className="mt-1 pt-3 border-t border-[#e5eeff] bg-[#eff4ff]/60 rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
              Status Hari Ini ({formatIndonesianDate(new Date(), false)})
            </span>
            <span
              className={`text-[13px] font-extrabold ${
                habit.completedToday ? 'text-[#006c49]' : 'text-[#6c7a71]'
              }`}
            >
              {habit.completedToday
                ? `Sudah Selesai (${habit.completedTime || 'Tercatat'})`
                : 'Belum Dicentang'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleToday}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold shadow-xs active:scale-95 transition-all ${
              habit.completedToday
                ? 'bg-[#006c49] text-white'
                : 'bg-[#10b981] text-white hover:bg-[#006c49]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {habit.completedToday ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span>{habit.completedToday ? 'Tuntas' : 'Centang Hari Ini'}</span>
          </button>
        </div>
      </div>

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
            <span className="text-[11px] font-bold text-[#ffdbca]">
              {isStreakActive ? 'Momentum Terjaga' : 'Hari Kosong Terdeteksi'}
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

            return (
              <div
                key={dateISO}
                onClick={(e) => !isFuture && handleToggleDate(dateISO, e)}
                title={
                  isFuture
                    ? `${dayNum}: Tanggal mendatang`
                    : isToday
                    ? `${dayNum}: Hari Ini (${isCompleted ? 'Selesai' : 'Belum selesai'})`
                    : `${dayNum}: ${isCompleted ? 'Selesai' : 'Kosong / Terlewat'}`
                }
                className={`h-9 flex items-center justify-center select-none ${
                  isFuture ? 'cursor-not-allowed text-[#6c7a71]/40' : 'cursor-pointer'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-90 relative ${
                    isToday
                      ? isCompleted
                        ? 'bg-[#006c49] text-white ring-2 ring-[#10b981] font-black'
                        : 'bg-[#10b981] text-white ring-2 ring-[#006c49] font-black'
                      : isCompleted
                      ? 'bg-[#006c49] text-white'
                      : isFuture
                      ? 'bg-[#eff4ff]/60 text-[#6c7a71]/40'
                      : 'bg-[#e5eeff] text-[#6c7a71] hover:bg-[#dce9ff]'
                  }`}
                >
                  {dayNum}
                  {isToday && (
                    <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#fd761a]"></span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6c7a71] pt-2 border-t border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#006c49]"></span> Selesai
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#e5eeff]"></span> Kosong / Lewat
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#10b981] ring-1 ring-[#006c49]"></span> Hari Ini
            </span>
          </div>
          <span className="font-semibold text-[#006c49]">Klik tanggal untuk ubah status</span>
        </div>
      </div>

      {/* Catatan Refleksi & Komentar */}
      <div className="rounded-xl bg-white p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#006c49]">edit_note</span>
            <h2 className="text-[14px] font-bold text-[#0b1c30]">Catatan & Refleksi</h2>
          </div>
          {noteSaved && (
            <span className="text-[11px] font-bold text-[#006c49] animate-fade-in">
              ✓ Tersimpan
            </span>
          )}
        </div>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Tulis refleksi harian atau catatan strategi konsistensimu..."
          rows={3}
          className="w-full text-[13px] text-[#0b1c30] p-3 rounded-lg border border-[#e5eeff] bg-[#eff4ff]/40 focus:bg-white focus:border-[#006c49] outline-none resize-none"
        />
        <button
          type="button"
          onClick={handleSaveNote}
          className="self-end px-3 py-1.5 bg-[#006c49] text-white rounded-lg text-[12px] font-bold hover:bg-[#005236] transition-colors shadow-xs active:scale-95"
        >
          Simpan Catatan
        </button>
      </div>

      {/* Modal Konfirmasi Hapus Kebiasaan */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl flex flex-col gap-3 border border-[#e5eeff]">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[18px] font-bold text-[#0b1c30]">Hapus Kebiasaan?</h3>
              <p className="text-[13px] text-[#6c7a71]">
                Apakah Anda yakin ingin menghapus "<strong>{habit.title}</strong>"? Seluruh catatan riwayat dan streak akan dihapus permanen.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#3c4a42] hover:bg-[#eff4ff]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteHabit(habit.id);
                }}
                className="px-4 py-2 rounded-xl text-[13px] font-bold bg-[#ba1a1a] text-white hover:bg-[#93000a] shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
