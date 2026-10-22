<template>
  <!-- Menghapus warna background gelap, kembali ke tampilan bersih bawaan -->
  <div class="h-screen w-full flex flex-col font-sans overflow-hidden fade-in">
    
    <!-- ═══ HEADER TERPUSAT (TOPBAR) ═══ -->
    <Topbar />

    <!-- ═══ MAIN CONTENT (FIT TO SCREEN) ═══ -->
    <main class="flex-1 flex flex-col w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-4 min-h-0 relative z-10">
      
      <!-- Toolbar -->
      <div class="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        
        <!-- Grup Navigasi Bulan -->
        <div class="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto bg-white/80 p-1.5 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-navy font-bold hover:bg-navy hover:text-white transition text-lg"
            @click="prevMonth"
          >
            ‹
          </button>
          <h1
            class="font-display font-bold text-navy text-sm sm:text-lg min-w-[130px] sm:min-w-[170px] text-center shrink-0 uppercase tracking-wide drop-shadow-sm"
          >
            {{ monthLabel }}
          </h1>
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-navy font-bold hover:bg-navy hover:text-white transition text-lg"
            @click="nextMonth"
          >
            ›
          </button>
          <button
            class="text-[11px] sm:text-xs shrink-0 text-navy font-bold px-3 py-1.5 rounded-lg border border-navy/30 bg-blue-50 hover:bg-navy hover:text-white transition ml-1"
            @click="goToday"
          >
            Hari Ini
          </button>
        </div>

        <button class="btn-primary w-full sm:w-auto flex justify-center shrink-0 shadow-md shadow-navy/20" @click="openAdd">
          <span class="text-lg leading-none mr-1">＋</span> Tambah Jadwal
        </button>
      </div>

      <!-- Legend Ruangan -->
      <div class="shrink-0 flex items-center gap-4 mb-3 overflow-x-auto bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-sm w-fit max-w-full custom-scrollbar">
        <div
          v-for="r in rooms"
          :key="r.id"
          class="flex items-center gap-2 text-xs font-bold text-navy shrink-0"
        >
          <span
            class="w-3 h-3 rounded-full shadow-sm shrink-0 border border-gray-100"
            :class="legendColor(r.id)"
          ></span>
          {{ r.nama }}
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="flex-1 glass-calendar-wrapper animate-pulse flex flex-col">
        <div class="h-10 bg-gray-100/50 border-b border-gray-200 shrink-0"></div>
        <div class="flex-1 grid grid-cols-7">
          <div v-for="i in 35" :key="i" class="border-r border-b border-gray-100/50 p-2">
            <div class="w-6 h-6 bg-gray-200/50 rounded-full mb-2"></div>
            <div class="h-4 bg-gray-100/50 rounded mb-1"></div>
          </div>
        </div>
      </div>

      <!-- ═══ CALENDAR WRAPPER DENGAN HIASAN TERLIHAT JELAS ═══ -->
      <div v-else class="flex-1 min-h-0 w-full flex flex-col relative glass-calendar-wrapper group">
        
        <!-- LAYER BAWAH: Kalender Interaktif -->
        <CalendarGrid
          class="flex-1 h-full overflow-hidden relative z-10"
          :cells="cells"
          :rooms="rooms"
          @dayClick="openDayPopover"
        />

        <!-- LAYER ATAS: Overlay Dekorasi Logistik Pelabuhan Khusus Di Dalam Kalender -->
        <div class="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          
          <!-- Pola Titik Matrix untuk kesan industrial -->
          <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(#0f2a4a 1.5px, transparent 1.5px); background-size: 24px 24px;"></div>
          
          <!-- Hiasan 1: Truk Kontainer (Kiri Bawah) -->
          <svg class="absolute -bottom-6 -left-6 w-[350px] h-[350px] text-navy opacity-[0.06]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20,8h-3V4H3C1.9,4,1,4.9,1,6v11h2c0,1.66,1.34,3,3,3s3-1.34,3-3h6c0,1.66,1.34,3,3,3s3-1.34,3-3h2v-5L20,8z M6,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S6.55,18,6,18z M18,18c-0.55,0-1-0.45-1-1s0.45-1,1-1s1,0.45,1,1S18.55,18,18,18z M17,12h-2v-2h2V12z M17.5,9.5V8h1.8l1.4,1.5H17.5z"/>
          </svg>

          <!-- Hiasan 2: Kapal Kargo (Kanan Atas) -->
          <svg class="absolute -top-10 -right-10 w-[450px] h-[450px] text-navy opacity-[0.05] -rotate-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
          </svg>

          <!-- Hiasan 3: Jangkar Pelabuhan (Tengah Bawah) -->
          <svg class="absolute bottom-4 left-[50%] -translate-x-1/2 w-[250px] h-[250px] text-navy opacity-[0.04]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 5v4.07C7.39 11.55 4.5 14.88 4.5 19c0 .55.45 1 1 1s1-.45 1-1c0-2.76 2.24-5 5-5v3.11c-1.6 1.1-2.5 3-2.5 5 0 2.76 2.24 5 5 5s5-2.24 5-5c0-2-.9-3.9-2.5-5V14c2.76 0 5 2.24 5 5 0 .55.45 1 1 1s1-.45 1-1c0-4.12-2.89-7.45-6.5-7.93V7h-1z"/>
          </svg>
        </div>
      </div>
    </main>

    <!-- ── Day Schedule List ── -->
    <transition name="fade">
      <div v-if="showDayPopover" class="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showDayPopover = false">
        <transition name="slide-up">
          <div v-if="showDayPopover" class="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/60">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div>
                <p class="text-[11px] uppercase tracking-widest text-navy/70 font-bold">Agenda Harian</p>
                <h2 class="font-display font-bold text-navy text-xl">{{ formatDate(selectedDay?.date) }}</h2>
              </div>
              <button class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 transition" @click="showDayPopover = false">✕</button>
            </div>
            <div class="px-6 py-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div v-if="selectedDay?.events?.length" class="space-y-3">
                <button v-for="event in selectedDay.events" :key="event.id" class="w-full text-left rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-navy/40 hover:bg-blue-50/50 transition shadow-sm" @click="openDetailFromDay(event)">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="font-bold text-sm text-gray-800 truncate">{{ event.agenda }}</p>
                      <p class="text-xs font-semibold text-gray-500 mt-1">🏢 {{ event.nama_ruangan }}</p>
                      <p class="text-[11px] text-gray-400 mt-1 italic">Dibuat oleh {{ event.nama_penginput }}</p>
                    </div>
                    <span class="text-xs font-bold text-white bg-navy px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap">{{ event.jam_mulai }} – {{ event.jam_selesai }}</span>
                  </div>
                </button>
              </div>
              <p v-else class="py-8 text-center text-sm font-medium text-gray-500">Belum ada kegiatan pada hari ini.</p>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Detail Modal ── -->
    <transition name="fade">
      <div v-if="showDetail" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="closeDetail">
        <transition name="slide-up">
          <div v-if="showDetail" class="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/60">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div>
                <p class="text-[11px] uppercase tracking-widest text-navy/70 font-bold">Detail Acara</p>
                <h2 class="font-display font-bold text-navy text-xl">Jadwal Kegiatan</h2>
              </div>
              <button class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 transition" @click="closeDetail">✕</button>
            </div>
            <div class="px-6 py-5 space-y-5" v-if="detailItem">
              <div class="rounded-xl bg-navy/95 shadow-md px-5 py-4 text-white border border-navy">
                <p class="text-[11px] text-white/70 uppercase tracking-widest mb-1 font-semibold">Agenda</p>
                <h3 class="font-display text-xl font-bold leading-snug">{{ detailItem.agenda }}</h3>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3">
                  <p class="text-[11px] text-gray-500 font-bold mb-1">Tanggal</p>
                  <p class="text-sm font-bold text-gray-800">{{ formatDate(detailItem.tanggal) }}</p>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3">
                  <p class="text-[11px] text-gray-500 font-bold mb-1">Waktu</p>
                  <p class="text-sm font-bold text-gray-800">{{ detailItem.jam_mulai }} – {{ detailItem.jam_selesai }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm px-4 py-3">
                <div class="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-blue-700 shrink-0 font-bold shadow-sm border border-blue-50">⌂</div>
                <div class="min-w-0">
                  <p class="text-[11px] text-blue-600/80 font-bold mb-0.5">Tempat / Ruangan</p>
                  <p class="text-sm font-bold text-navy truncate">{{ detailItem.nama_ruangan }}</p>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 bg-gray-50/50">
              <button class="btn-secondary" @click="closeDetail">Tutup</button>
              <template v-if="canEdit(detailItem)">
                <button class="btn-danger" @click="confirmDelete(detailItem)">Hapus</button>
                <button class="btn-primary" @click="openEdit(detailItem)">Edit</button>
              </template>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Delete Confirm ── -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showDeleteConfirm = false">
        <transition name="slide-up">
          <div v-if="showDeleteConfirm" class="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/60">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 class="font-display font-bold text-navy text-xl">Hapus Jadwal</h2>
              <button class="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100 transition" @click="showDeleteConfirm = false">✕</button>
            </div>
            <div class="px-6 py-5 text-sm text-gray-600 font-medium leading-relaxed">
              Jadwal <strong class="text-gray-900 font-bold">{{ deleteTarget?.agenda }}</strong> pada <strong class="text-gray-900 font-bold">{{ formatDate(deleteTarget?.tanggal) }}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </div>
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 bg-gray-50/50">
              <button class="btn-secondary" @click="showDeleteConfirm = false">Batal</button>
              <button class="btn-danger" :disabled="deleting" @click="doDelete">{{ deleting ? "Menghapus..." : "Ya, Hapus" }}</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Schedule Modal ── -->
    <ScheduleModal
      v-model="showModal"
      :schedule="editTarget"
      :rooms="rooms"
      :default-date="selectedDate"
      @saved="onSaved"
      @conflict="onConflict"
    />

    <!-- ── Conflict Warning ── -->
    <ConflictWarning
      v-model="showConflict"
      :conflict="conflictData.conflict"
      :jam-mulai="conflictData.jam_mulai"
      :jam-selesai="conflictData.jam_selesai"
    />

    <!-- ✨ POP-UP NOTIFIKASI SUKSES ✨ -->
    <transition name="slide-up">
      <div v-if="showToast" class="fixed bottom-10 right-10 z-[300] bg-green-500/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-bold border border-green-400">
        <div class="w-8 h-8 bg-white text-green-500 rounded-full flex items-center justify-center text-xl shadow-sm">✓</div>
        {{ toastMessage }}
      </div>
    </transition>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { jadwalAPI, ruanganAPI } from "@/services/api";
import Topbar from "@/components/Topbar.vue";
import CalendarGrid from "@/components/CalendarGrid.vue";
import ScheduleModal from "@/components/ScheduleModal.vue";
import ConflictWarning from "@/components/ConflictWarning.vue";

const auth = useAuthStore();

// ── Calendar state ────────────────────────────────────────────
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const monthLabel = computed(
  () => `${MONTH_NAMES[viewMonth.value]} ${viewYear.value}`,
);

const prevMonth = () => {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else viewMonth.value--;
  fetchJadwal();
};
const nextMonth = () => {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else viewMonth.value++;
  fetchJadwal();
};
const goToday = () => {
  viewYear.value = today.getFullYear();
  viewMonth.value = today.getMonth();
  fetchJadwal();
};

// ── Data ─────────────────────────────────────────────────────
const rooms = ref([]);
const jadwal = ref([]);
const loading = ref(false);

const fetchRooms = async () => {
  const res = await ruanganAPI.getAll();
  rooms.value = res.data;
};

const fetchJadwal = async () => {
  loading.value = true;
  try {
    const bulan = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, "0")}`;
    const res = await jadwalAPI.getAll({ bulan });
    jadwal.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchRooms();
  await fetchJadwal();
});

// ── Build calendar cells ──────────────────────────────────────
const cells = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay();
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  const daysInPrev = new Date(viewYear.value, viewMonth.value, 0).getDate();
  const arr = [];

  for (let i = firstDay - 1; i >= 0; i--)
    arr.push({ day: daysInPrev - i, currentMonth: false, isToday: false, date: null, events: [] });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday =
      today.getFullYear() === viewYear.value &&
      today.getMonth() === viewMonth.value &&
      today.getDate() === d;
    const events = jadwal.value
      .filter((s) => s.tanggal === dateStr)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
    arr.push({ day: d, currentMonth: true, isToday, date: dateStr, events });
  }

  const rem = 42 - arr.length;
  for (let d = 1; d <= rem; d++)
    arr.push({ day: d, currentMonth: false, isToday: false, date: null, events: [] });

  return arr;
});

// ── Modals ────────────────────────────────────────────────────
const showModal = ref(false);
const editTarget = ref(null);
const selectedDate = ref("");

const showDayPopover = ref(false);
const selectedDay = ref(null);

const showDetail = ref(false);
const detailItem = ref(null);

const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);

const showConflict = ref(false);
const conflictData = ref({});

const openAdd = () => { editTarget.value = null; selectedDate.value = ""; showModal.value = true; };
const openEdit = (s) => { detailItem.value = null; showDetail.value = false; editTarget.value = s; showModal.value = true; };
const openDetail = (evt) => { detailItem.value = evt; showDetail.value = true; };
const closeDetail = () => { showDetail.value = false; if (selectedDay.value?.events?.length) showDayPopover.value = true; };
const openDayPopover = (cell) => {
  if (!cell?.currentMonth) return;
  selectedDay.value = { ...cell, events: [...cell.events].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)) };
  showDayPopover.value = true;
};
const openDetailFromDay = (event) => { showDayPopover.value = false; openDetail(event); };
const confirmDelete = (s) => { showDetail.value = false; deleteTarget.value = s; showDeleteConfirm.value = true; };
const doDelete = async () => {
  deleting.value = true;
  try {
    await jadwalAPI.delete(deleteTarget.value.id);
    showDeleteConfirm.value = false;
    fetchJadwal();
  } finally { deleting.value = false; }
};

// ── State untuk Notifikasi Sukses ──
const showToast = ref(false);
const toastMessage = ref("");

const triggerToast = (msg) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3500); // Hilang otomatis setelah 3.5 detik
};

const onSaved = () => {
  triggerToast("Jadwal dan gambar berhasil disimpan!");
  fetchJadwal();
};
const onConflict = (data) => { conflictData.value = data; showConflict.value = true; };

const canEdit = (s) => {
  if (!s) return false;
  if (auth.isBigAdmin) return true;
  if (auth.isPic) return s.division_id === auth.user?.division_id;
  return s.user_id === auth.user?.id;
};

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (str) => {
  if (!str) return "-";
  const [y, m, d] = str.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
};

const LEGEND_COLORS = ["", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];
const legendColor = (id) => LEGEND_COLORS[id] || LEGEND_COLORS[1];


</script>

<style scoped>
/* ── Transisi Dasar ── */
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

/* ── Efek Kaca untuk Elemen ── */
.glass-calendar-wrapper {
  @apply bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-2xl overflow-hidden;
}

/* ── Modals & Buttons ── */
.btn-primary {
  @apply font-bold px-6 py-2.5 rounded-xl bg-navy/90 text-white hover:bg-navy hover:scale-105 transition-all border border-navy/50;
}
.btn-secondary {
  @apply font-bold px-6 py-2.5 rounded-xl bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-all border border-gray-300;
}
.btn-danger {
  @apply font-bold px-6 py-2.5 rounded-xl bg-red-600/90 text-white shadow-md shadow-red-500/20 hover:bg-red-700 hover:scale-105 transition-all border border-red-600;
}

/* ── Custom Scrollbar ── */
.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15, 42, 74, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(15, 42, 74, 0.4); }

/* ── Penyesuaian Tabel Kalender agar Pas Layar ── */
:deep(table) {
  height: 100% !important;
  width: 100% !important;
  background-color: transparent !important;
  table-layout: fixed; 
}
:deep(tbody tr) {
  height: calc(100% / 6) !important;
}
:deep(td > div) {
  height: 100% !important;
  overflow-y: auto !important;
}

/* Pastikan sel kalender transparan agar dekorasi SVG di belakangnya terlihat jelas */
:deep(td), :deep(th) {
  border-color: rgba(226, 232, 240, 0.6) !important; 
  background-color: transparent !important;
}

:deep(th) {
  background-color: #0f2a4a !important; 
  color: white !important;
  font-weight: bold !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 12px !important;
  border: none !important;
}

/* Hover Sel Kalender */
:deep(td:hover) {
  background-color: rgba(255, 255, 255, 0.5) !important;
}

/* Teks dan Label di dalam Kalender */
:deep(.text-gray-800), :deep(.text-gray-700) {
  color: #0f2a4a !important;
  font-weight: 800 !important;
}
:deep(.text-gray-400), :deep(.text-gray-500) {
  color: #64748b !important; 
  font-weight: 600 !important;
}
:deep(.text-xs.truncate) {
  font-weight: 700 !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.8);
}
</style>