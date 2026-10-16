<template>
  <div class="min-h-screen flex flex-col">
    <Topbar />

    <main class="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-7">
      <!-- Toolbar -->
      <!-- PERBAIKAN: flex-col agar di HP susunannya ke bawah, dan sm:flex-row untuk laptop -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        
        <!-- Grup Navigasi Bulan -->
        <!-- PERBAIKAN: overflow-x-auto agar tombol bulan aman jika layar sangat sempit -->
        <div class="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-accent hover:text-white hover:border-accent transition text-lg"
            @click="prevMonth"
          >
            ‹
          </button>
          <h1
            class="font-display font-semibold text-navy text-base sm:text-xl min-w-[130px] sm:min-w-[180px] text-center shrink-0"
          >
            {{ monthLabel }}
          </h1>
          <button
            class="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-accent hover:text-white hover:border-accent transition text-lg"
            @click="nextMonth"
          >
            ›
          </button>
          <button
            class="text-[11px] sm:text-xs shrink-0 text-accent font-medium px-2.5 sm:px-3 py-1.5 rounded-lg border border-accent/30 hover:bg-accent-light transition ml-1"
            @click="goToday"
          >
            Hari Ini
          </button>
        </div>

        <!-- PERBAIKAN: w-full di HP agar tombol memanjang penuh, justify-center agar tulisan di tengah -->
        <button class="btn-primary w-full sm:w-auto flex justify-center shrink-0" @click="openAdd">
          <span class="text-lg leading-none mr-1">＋</span> Tambah Jadwal
        </button>
      </div>

      <!-- Legend -->
      <!-- PERBAIKAN: overflow-x-auto agar daftar ruangan bisa digeser ke samping -->
      <div class="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
        <div
          v-for="r in rooms"
          :key="r.id"
          class="flex items-center gap-1.5 text-xs text-gray-500 shrink-0"
        >
          <span
            class="w-2.5 h-2.5 rounded-sm shrink-0"
            :class="legendColor(r.id)"
          ></span>
          {{ r.nama }}
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="card overflow-hidden animate-pulse">
        <div class="h-10 bg-gray-200"></div>
        <div class="grid grid-cols-7">
          <div
            v-for="i in 35"
            :key="i"
            class="h-28 border-r border-b border-gray-100 p-2"
          >
            <div class="w-6 h-6 bg-gray-100 rounded-full mb-2"></div>
            <div class="h-4 bg-gray-100 rounded mb-1"></div>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <!-- PERBAIKAN UTAMA: Bungkus kalender dengan div overflow dan paksa lebar minimum -->
      <div v-else class="w-full pb-4">
        <CalendarGrid
          :cells="cells"
          :rooms="rooms"
          @dayClick="openDayPopover"
        />
      </div>
    </main>

    <!-- ── Day Schedule List ── -->
    <transition name="fade">
      <div
        v-if="showDayPopover"
        class="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showDayPopover = false"
      >
        <transition name="slide-up">
          <div
            v-if="showDayPopover"
            class="w-full max-w-lg card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <div>
                <p
                  class="text-[11px] uppercase tracking-widest text-accent font-semibold"
                >
                  Agenda Harian
                </p>
                <h2 class="font-display font-semibold text-navy">
                  {{ formatDate(selectedDay?.date) }}
                </h2>
              </div>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="showDayPopover = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 max-h-[60vh] overflow-y-auto">
              <div v-if="selectedDay?.events?.length" class="space-y-2">
                <button
                  v-for="event in selectedDay.events"
                  :key="event.id"
                  class="w-full text-left rounded-xl border border-gray-100 px-4 py-3 hover:border-accent/40 hover:bg-accent-light/40 transition"
                  @click="openDetailFromDay(event)"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="font-semibold text-sm text-gray-800 truncate">
                        {{ event.agenda }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ event.nama_ruangan }}
                      </p>
                      <p class="text-[11px] text-gray-400 mt-1">
                        Dibuat oleh {{ event.nama_penginput }}
                      </p>
                    </div>
                    <span
                      class="text-xs font-semibold text-accent whitespace-nowrap"
                    >
                      {{ event.jam_mulai }} – {{ event.jam_selesai }}
                    </span>
                  </div>
                </button>
              </div>
              <p v-else class="py-8 text-center text-sm text-gray-400">
                Belum ada kegiatan pada hari ini.
              </p>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Detail Modal ── -->
    <transition name="fade">
      <div
        v-if="showDetail"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="closeDetail"
      >
        <transition name="slide-up">
          <div v-if="showDetail" class="w-full max-w-md card overflow-hidden">
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <div>
                <p
                  class="text-[11px] uppercase tracking-widest text-accent font-semibold"
                >
                  Detail Acara
                </p>
                <h2 class="font-display font-semibold text-navy">
                  Jadwal Kegiatan
                </h2>
              </div>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="closeDetail"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-5" v-if="detailItem">
              <div class="rounded-xl bg-navy px-5 py-4 text-white">
                <p
                  class="text-[11px] text-white/55 uppercase tracking-widest mb-1"
                >
                  Agenda
                </p>
                <h3 class="font-display text-xl font-semibold leading-snug">
                  {{ detailItem.agenda }}
                </h3>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <p class="text-[11px] text-gray-400 font-medium mb-1">
                    Tanggal
                  </p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ formatDate(detailItem.tanggal) }}
                  </p>
                </div>
                <div
                  class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <p class="text-[11px] text-gray-400 font-medium mb-1">
                    Waktu
                  </p>
                  <p class="text-sm font-semibold text-gray-800">
                    {{ detailItem.jam_mulai }} – {{ detailItem.jam_selesai }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent-light px-4 py-3"
              >
                <div
                  class="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-accent shrink-0"
                >
                  ⌂
                </div>
                <div class="min-w-0">
                  <p class="text-[11px] text-accent/70 font-medium mb-0.5">
                    Tempat / Ruangan
                  </p>
                  <p class="text-sm font-semibold text-navy truncate">
                    {{ detailItem.nama_ruangan }}
                  </p>
                </div>
              </div>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
              <button class="btn-secondary" @click="closeDetail">Tutup</button>
              <template v-if="canEdit(detailItem)">
                <button class="btn-danger" @click="confirmDelete(detailItem)">
                  Hapus
                </button>
                <button class="btn-primary" @click="openEdit(detailItem)">
                  Edit
                </button>
              </template>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Delete Confirm ── -->
    <transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showDeleteConfirm = false"
      >
        <transition name="slide-up">
          <div
            v-if="showDeleteConfirm"
            class="w-full max-w-sm card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <h2 class="font-display font-semibold text-navy">Hapus Jadwal</h2>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="showDeleteConfirm = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 text-sm text-gray-600 leading-relaxed">
              Jadwal
              <strong class="text-gray-800">{{ deleteTarget?.agenda }}</strong>
              pada
              <strong class="text-gray-800">{{
                formatDate(deleteTarget?.tanggal)
              }}</strong>
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
              <button class="btn-secondary" @click="showDeleteConfirm = false">
                Batal
              </button>
              <button class="btn-danger" :disabled="deleting" @click="doDelete">
                {{ deleting ? "Menghapus..." : "Ya, Hapus" }}
              </button>
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

// ── Simple DetailRow inline component ────────────────────────
const DetailRow = {
  props: ["icon", "label", "value"],
  template: `
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center text-sm shrink-0">{{ icon }}</div>
      <div><p class="text-[11px] text-gray-400 font-medium mb-0.5">{{ label }}</p><p class="text-sm font-medium text-gray-800">{{ value }}</p></div>
    </div>`,
};

const auth = useAuthStore();

// ── Calendar state ────────────────────────────────────────────
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
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
  const daysInMonth = new Date(
    viewYear.value,
    viewMonth.value + 1,
    0,
  ).getDate();
  const daysInPrev = new Date(viewYear.value, viewMonth.value, 0).getDate();
  const arr = [];

  for (let i = firstDay - 1; i >= 0; i--)
    arr.push({
      day: daysInPrev - i,
      currentMonth: false,
      isToday: false,
      date: null,
      events: [],
    });

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
    arr.push({
      day: d,
      currentMonth: false,
      isToday: false,
      date: null,
      events: [],
    });

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

const openAdd = () => {
  editTarget.value = null;
  selectedDate.value = "";
  showModal.value = true;
};
const openEdit = (s) => {
  detailItem.value = null;
  showDetail.value = false;
  editTarget.value = s;
  showModal.value = true;
};
const openDetail = (evt) => {
  detailItem.value = evt;
  showDetail.value = true;
};
const closeDetail = () => {
  showDetail.value = false;
  if (selectedDay.value?.events?.length) showDayPopover.value = true;
};
const openDayPopover = (cell) => {
  if (!cell?.currentMonth) return;
  selectedDay.value = {
    ...cell,
    events: [...cell.events].sort((a, b) =>
      a.jam_mulai.localeCompare(b.jam_mulai),
    ),
  };
  showDayPopover.value = true;
};
const openDetailFromDay = (event) => {
  showDayPopover.value = false;
  openDetail(event);
};

const confirmDelete = (s) => {
  showDetail.value = false;
  deleteTarget.value = s;
  showDeleteConfirm.value = true;
};

const doDelete = async () => {
  deleting.value = true;
  try {
    await jadwalAPI.delete(deleteTarget.value.id);
    showDeleteConfirm.value = false;
    fetchJadwal();
  } finally {
    deleting.value = false;
  }
};

const onSaved = () => fetchJadwal();
const onConflict = (data) => {
  conflictData.value = data;
  showConflict.value = true;
};

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

const LEGEND_COLORS = [
  "",
  "bg-accent",
  "bg-success",
  "bg-warn",
  "bg-purple-500",
];
const legendColor = (id) => LEGEND_COLORS[id] || LEGEND_COLORS[1];
</script>
