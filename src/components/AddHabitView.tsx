import React, { useState } from 'react';
import { Habit, CategoryType, AccentColor, FrequencyType } from '../types';

interface AddHabitViewProps {
  onAddHabit: (newHabit: Habit) => void;
  onCancel: () => void;
}

export const AddHabitView: React.FC<AddHabitViewProps> = ({ onAddHabit, onCancel }) => {
  const [name, setName] = useState<string>('Minum Air 2L');
  const [reason, setReason] = useState<string>('');
  const [category, setCategory] = useState<CategoryType>('Kesehatan');
  const [icon, setIcon] = useState<string>('water_drop');
  const [accentColor, setAccentColor] = useState<AccentColor>('emerald');
  const [frequency, setFrequency] = useState<FrequencyType>('Harian');
  const [activeDays, setActiveDays] = useState<string[]>(['S', 'S', 'R', 'K', 'J', 'S', 'M']);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [time, setTime] = useState<string>('07:00');
  const [showToast, setShowToast] = useState<boolean>(false);

  const categories: { type: CategoryType; label: string; desc: string; icon: string }[] = [
    { type: 'Kesehatan', label: 'Kesehatan', desc: 'Air, Fisik, Nutrisi', icon: 'favorite' },
    { type: 'Produktivitas', label: 'Produktivitas', desc: 'Fokus & Belajar', icon: 'menu_book' },
    { type: 'Keuangan', label: 'Keuangan', desc: 'Tabungan & Cuan', icon: 'account_balance_wallet' },
    { type: 'Spiritual', label: 'Spiritual', desc: 'Relaksasi & Doa', icon: 'self_improvement' },
  ];

  const iconsList = ['water_drop', 'fitness_center', 'menu_book', 'timer', 'paid', 'potted_plant'];

  const colorSwatches: { id: AccentColor; label: string; bgClass: string; textClass: string }[] = [
    { id: 'emerald', label: 'Hijau Emerald', bgClass: 'bg-[#10b981]', textClass: 'text-white' },
    { id: 'blue', label: 'Biru Terang', bgClass: 'bg-[#71a1ff]', textClass: 'text-[#001a42]' },
    { id: 'violet', label: 'Ungu', bgClass: 'bg-[#005ac2]', textClass: 'text-white' },
    { id: 'amber', label: 'Amber', bgClass: 'bg-[#9d4300]', textClass: 'text-white' },
    { id: 'coral', label: 'Oranye Karang', bgClass: 'bg-[#fd761a]', textClass: 'text-white' },
    { id: 'pink', label: 'Merah Muda', bgClass: 'bg-[#ffdad6]', textClass: 'text-[#93000a]' },
  ];

  const daysLabel = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

  const toggleDay = (dayIndex: number) => {
    const dayStr = `${daysLabel[dayIndex]}-${dayIndex}`;
    // simple toggle
    if (activeDays.includes(dayStr)) {
      setActiveDays(activeDays.filter((d) => d !== dayStr));
    } else {
      setActiveDays([...activeDays, dayStr]);
    }
  };

  const getPreviewIconBoxClass = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-[#6ffbbe]/50 text-[#002113]';
      case 'blue':
        return 'bg-[#d8e2ff] text-[#001a42]';
      case 'violet':
        return 'bg-[#71a1ff]/30 text-[#005ac2]';
      case 'amber':
        return 'bg-[#ffdbca] text-[#341100]';
      case 'coral':
        return 'bg-[#fd761a]/25 text-[#9d4300]';
      case 'pink':
        return 'bg-[#ffdad6] text-[#ba1a1a]';
      default:
        return 'bg-[#6ffbbe]/50 text-[#002113]';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: 'h-' + Date.now(),
      title: name.trim(),
      category,
      time: time || '07:00',
      timezone: 'WIB',
      streak: 0,
      bestStreak: 0,
      completedToday: false,
      icon,
      accentColor,
      description: reason ? reason.trim() : `Rutinitas harian untuk kategori ${category}.`,
      reason: reason.trim(),
      frequency,
      activeDays: ['S', 'S', 'R', 'K', 'J', 'S', 'M'],
      reminderEnabled,
      completionRate: 0,
      totalCompletedDays: 0,
      historyMap: {},
    };

    setShowToast(true);
    setTimeout(() => {
      onAddHabit(newHabit);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <section className="flex flex-col gap-1.5 pt-2">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-[#6ffbbe]/40 text-[#005236]">
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add_task
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide">
            Langkah Pertama
          </span>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#0b1c30] tracking-tight">
          Buat Kebiasaan Baru
        </h1>
        <p className="text-[14px] text-[#3c4a42]">
          Tentukan rutinitas kecil yang konsisten untuk perubahan besar dalam hidupmu.
        </p>
      </section>

      {/* Live Mini Preview Card */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#3c4a42] uppercase tracking-wider">
            Pratinjau Kartu Rutinitas
          </span>
          <span className="text-[11px] font-bold text-[#006c49] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            Live Preview
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-[0_4px_16px_-2px_rgba(11,28,48,0.06)] border border-[#e5eeff] flex items-center justify-between gap-3 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors shadow-xs ${getPreviewIconBoxClass()}`}
            >
              <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[16px] font-bold text-[#0b1c30] truncate">
                  {name.trim() || 'Nama Kebiasaan'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#005ac2]">
                  {category}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {reminderEnabled ? (
                  <span className="text-[12px] text-[#6c7a71] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {time} WIB
                  </span>
                ) : (
                  <span className="text-[12px] text-[#6c7a71]">Tanpa Pengingat</span>
                )}
                <span className="w-1 h-1 rounded-full bg-[#bbcabf]"></span>
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#ffdbca]/50 text-[#9d4300]">
                  <span
                    className="material-symbols-outlined text-[13px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                  <span className="text-[11px] font-extrabold">0 Hari</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#6c7a71] flex-shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">check</span>
          </div>
        </div>
      </section>

      {/* Input Form Module */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Step 1: Habit Name & Why */}
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-[0_4px_16px_-2px_rgba(11,28,48,0.04)] border border-[#e5eeff]">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="habitNameInput"
              className="text-[14px] font-bold text-[#0b1c30] flex items-center gap-1"
            >
              <span>Nama Kebiasaan</span>
              <span className="text-[#ba1a1a] font-bold">*</span>
            </label>
            <input
              id="habitNameInput"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Jalan Kaki 5.000 Langkah, Minum Air 2L..."
              className="w-full bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#6c7a71]/60 text-[15px] font-medium px-4 py-3 rounded-lg border border-[#dce9ff] focus:outline-none focus:bg-white focus:border-[#006c49] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="habitReasonInput" className="text-[14px] font-bold text-[#0b1c30]">
                Alasan & Motivasi
              </label>
              <span className="text-[11px] text-[#6c7a71]">Opsional</span>
            </div>
            <textarea
              id="habitReasonInput"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan mengapa ini penting untukmu, misal: agar tubuh tetap segar dan fokus sepanjang hari..."
              className="w-full bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#6c7a71]/60 text-[13px] px-4 py-2.5 rounded-lg border border-[#dce9ff] focus:outline-none focus:bg-white focus:border-[#006c49] transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Step 2: Category Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#0b1c30]">Pilih Kategori</label>
          <div className="grid grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = category === cat.type;
              return (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setCategory(cat.type)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left shadow-xs border select-none active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#006c49] text-white border-[#006c49] shadow-md'
                      : 'bg-white text-[#0b1c30] border-[#e5eeff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/15 text-white' : 'bg-[#e5eeff] text-[#006c49]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-bold truncate leading-tight">
                      {cat.label}
                    </span>
                    <span
                      className={`text-[11px] truncate ${
                        isSelected ? 'text-white/80' : 'text-[#6c7a71]'
                      }`}
                    >
                      {cat.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Icon & Color Theme Personalization */}
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-[0_4px_16px_-2px_rgba(11,28,48,0.04)] border border-[#e5eeff]">
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#0b1c30]">Pilih Ikon</label>
            <div className="grid grid-cols-6 gap-2">
              {iconsList.map((ic) => {
                const isSelected = icon === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`h-11 rounded-lg flex items-center justify-center transition-all select-none active:scale-95 ${
                      isSelected
                        ? 'bg-[#006c49] text-white shadow-sm ring-2 ring-[#006c49]/30'
                        : 'bg-[#eff4ff] text-[#3c4a42] hover:bg-[#e5eeff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{ic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#e5eeff]">
            <label className="text-[14px] font-bold text-[#0b1c30]">Warna Aksen</label>
            <div className="flex items-center justify-between gap-2">
              {colorSwatches.map((swatch) => {
                const isSelected = accentColor === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    aria-label={swatch.label}
                    onClick={() => setAccentColor(swatch.id)}
                    className={`w-9 h-9 rounded-full ${swatch.bgClass} flex items-center justify-center transition-transform active:scale-90 ${
                      isSelected ? 'ring-2 ring-offset-2 ring-[#006c49] shadow-md scale-105' : ''
                    }`}
                  >
                    {isSelected && (
                      <span className={`material-symbols-outlined text-[18px] ${swatch.textClass}`}>
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Frequency & Schedule */}
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-[0_4px_16px_-2px_rgba(11,28,48,0.04)] border border-[#e5eeff]">
          <label className="text-[14px] font-bold text-[#0b1c30]">Frekuensi Rutinitas</label>
          <div className="grid grid-cols-3 gap-1 bg-[#eff4ff] p-1 rounded-lg">
            {(['Harian', 'Hari Tertentu', 'Target / Minggu'] as FrequencyType[]).map((f) => {
              const isActive = frequency === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 px-1 text-center rounded-md text-[12px] font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#006c49] shadow-xs'
                      : 'text-[#6c7a71] hover:text-[#0b1c30]'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[12px] text-[#6c7a71]">Pilih hari aktif pelaksanaan:</span>
            <div className="grid grid-cols-7 gap-1.5">
              {daysLabel.map((d, index) => {
                const key = `${d}-${index}`;
                const isActive = activeDays.includes(key) || activeDays.length === 7;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`h-10 rounded-lg text-[13px] font-bold flex items-center justify-center shadow-xs transition-transform active:scale-95 ${
                      isActive
                        ? 'bg-[#10b981] text-white'
                        : 'bg-[#eff4ff] text-[#6c7a71] border border-[#dce9ff]'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 5: Local Notifications & Time Picker */}
        <div className="flex flex-col gap-3 bg-white rounded-xl p-4 shadow-[0_4px_16px_-2px_rgba(11,28,48,0.04)] border border-[#e5eeff]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#e5eeff] text-[#006c49] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  notifications_active
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold text-[#0b1c30] leading-tight">
                  Pengingat Harian
                </span>
                <span className="text-[12px] text-[#6c7a71] truncate">
                  Notifikasi suara & banner perangkat
                </span>
              </div>
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#dce9ff] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
            </label>
          </div>

          {reminderEnabled && (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e5eeff]">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#eff4ff]">
                <span className="text-[13px] font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#006c49]">alarm</span>
                  Waktu Notifikasi
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-white text-[#0b1c30] text-[15px] font-bold px-3 py-1 rounded-md shadow-xs border border-[#dce9ff] focus:outline-none focus:border-[#006c49]"
                  />
                  <span className="text-[11px] font-bold text-[#6c7a71]">WIB</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6c7a71] leading-relaxed">
                Notifikasi lokal akan dijadwalkan otomatis di perangkat Anda sesuai jam di atas tanpa perlu koneksi internet.
              </p>
            </div>
          )}
        </div>

        {/* Motivational Tip Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
          <span
            className="material-symbols-outlined text-[#9d4300] text-[22px] flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-[#0b1c30]">Aturan 2 Menit</span>
            <p className="text-[12px] text-[#6c7a71] mt-0.5">
              Mulai dengan langkah yang begitu mudah dilakukan sampai Anda tidak bisa menolaknya.
            </p>
          </div>
        </div>

        {/* Step 6: CTA Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-[#006c49] hover:bg-[#005236] text-white text-[15px] font-bold shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Simpan Kebiasaan Baru</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full h-11 rounded-full text-[#6c7a71] hover:text-[#0b1c30] text-[13px] font-semibold flex items-center justify-center transition-colors active:bg-[#e5eeff]"
          >
            Batalkan
          </button>
        </div>
      </form>

      {/* Success Toast Modal */}
      {showToast && (
        <div className="fixed bottom-20 inset-x-4 max-w-[448px] mx-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#213145] text-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">done</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold">Kebiasaan Berhasil Dibuat!</span>
              <span className="text-[12px] text-white/80 truncate">
                Rutinitas siap dilacak hari ini.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
