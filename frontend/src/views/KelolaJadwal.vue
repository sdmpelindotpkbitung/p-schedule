<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Topbar />
    
    <main class="flex-1 max-w-[1200px] w-full mx-auto px-6 py-7">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display font-bold text-navy text-3xl drop-shadow-sm">
            Kelola Jadwal
          </h1>
          <p class="text-sm font-medium text-gray-700 mt-1 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/40 w-fit">
            {{ scopeLabel }}
          </p>
        </div>
        <button class="btn-primary w-full sm:w-auto flex justify-center shrink-0" @click="openAdd">
          <span class="text-lg leading-none mr-1">＋</span> Tambah Jadwal
        </button>
      </div>

      <div class="glass-card overflow-hidden fade-in">
        <div v-if="loading" class="py-16 text-center text-gray-600 font-medium">
          <span class="animate-pulse">⏳ Memuat jadwal...</span>
        </div>
        
        <div
          v-else-if="schedules.length === 0"
          class="py-16 text-center"
        >
          <div class="text-5xl mb-4 drop-shadow-md">📅</div>
          <div class="text-gray-600 font-medium text-lg">
            Belum ada jadwal yang dapat dikelola.
          </div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px]">
            <thead class="bg-navy/90 backdrop-blur-md">
              <tr>
                <th class="th rounded-tl-xl">Agenda</th>
                <th class="th">Ruangan</th>
                <th class="th">Tanggal</th>
                <th class="th">Waktu</th>
                <th class="th">Penginput</th>
                <th class="th rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="schedule in schedules"
                :key="schedule.id"
                class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0"
              >
                <td class="td font-bold text-gray-800">
                  {{ schedule.agenda }}
                </td>
                <td class="td font-medium text-gray-700">{{ schedule.nama_ruangan }}</td>
                <td class="td text-gray-700 font-medium">
                  {{ formatDate(schedule.tanggal) }}
                </td>
                <td class="td font-mono text-sm text-gray-600 font-semibold">
                  <span class="bg-white/50 px-2 py-1 rounded-md border border-white/40">
                    {{ schedule.jam_mulai }} – {{ schedule.jam_selesai }}
                  </span>
                </td>
                <td class="td text-gray-700 font-medium">{{ schedule.nama_penginput }}</td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openEdit(schedule)">
                      Edit
                    </button>
                    <button class="btn-sm-del" @click="removeSchedule(schedule)">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <ScheduleModal
      v-model="showModal"
      :schedule="editTarget"
      :rooms="rooms"
      @saved="fetchSchedules"
      @conflict="onConflict"
    />
    
    <ConflictWarning
      v-model="showConflict"
      :conflict="conflictData.conflict"
      :jam-mulai="conflictData.jam_mulai"
      :jam-selesai="conflictData.jam_selesai"
    />

    <transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md"
        @click.self="showDeleteConfirm = false"
      >
        <transition name="slide-up">
          <div
            v-if="showDeleteConfirm"
            class="w-full max-w-sm glass-card overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/40">
              <h2 class="font-display font-bold text-navy text-xl">Hapus Jadwal</h2>
              <button
                class="w-8 h-8 rounded-full border border-white/60 bg-white/50 flex items-center justify-center text-navy font-bold hover:bg-white/80 transition"
                @click="showDeleteConfirm = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 text-sm text-gray-700 font-medium leading-relaxed">
              Jadwal
              <strong class="text-gray-900 font-bold">{{ deleteTarget?.agenda }}</strong>
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              <p v-if="deleteError" class="text-red-500 font-bold mt-3 bg-red-50 p-2 rounded-lg border border-red-200">
                {{ deleteError }}
              </p>
            </div>
            <div class="px-6 py-4 border-t border-white/40 flex justify-end gap-2.5">
              <button
                class="btn-secondary"
                :disabled="deleting"
                @click="showDeleteConfirm = false"
              >
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
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { jadwalAPI, ruanganAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import Topbar from "@/components/Topbar.vue";
import ScheduleModal from "@/components/ScheduleModal.vue";
import ConflictWarning from "@/components/ConflictWarning.vue";

const auth = useAuthStore();
const schedules = ref([]);
const rooms = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editTarget = ref(null);
const showConflict = ref(false);
const conflictData = ref({});
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);
const deleteError = ref("");

const scopeLabel = computed(() =>
  auth.isBigAdmin
    ? "Seluruh jadwal dalam sistem"
    : auth.isPic
      ? `Jadwal Divisi ${auth.divisionName}`
      : "Jadwal yang Anda buat",
);

const fetchSchedules = async () => {
  loading.value = true;
  try {
    schedules.value = (await jadwalAPI.getManaged()).data;
  } finally {
    loading.value = false;
  }
};

const openAdd = () => {
  editTarget.value = null;
  showModal.value = true;
};

const openEdit = (schedule) => {
  editTarget.value = schedule;
  showModal.value = true;
};

const removeSchedule = async (schedule) => {
  deleteTarget.value = schedule;
  deleteError.value = "";
  showDeleteConfirm.value = true;
};

const doDelete = async () => {
  deleting.value = true;
  deleteError.value = "";
  try {
    await jadwalAPI.delete(deleteTarget.value.id);
    showDeleteConfirm.value = false;
    deleteTarget.value = null;
    await fetchSchedules();
  } catch (error) {
    deleteError.value =
      error.response?.data?.message || "Gagal menghapus jadwal.";
  } finally {
    deleting.value = false;
  }
};

const onConflict = (data) => {
  conflictData.value = data;
  showConflict.value = true;
};

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

onMounted(async () => {
  rooms.value = (await ruanganAPI.getAll()).data;
  await fetchSchedules();
});
</script>

<style scoped>
/* ── Transisi ── */
.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

/* ── Glassmorphism Card ── */
.glass-card {
  @apply bg-white/75 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl;
}

/* ── Table Styling ── */
.th {
  @apply px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-widest border-b border-white/20;
}
.td {
  @apply px-5 py-4 text-sm align-middle;
}

/* ── Buttons ── */
.btn-sm-edit {
  @apply text-xs font-bold px-4 py-2 rounded-lg bg-blue-50/80 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm;
}
.btn-sm-del {
  @apply text-xs font-bold px-4 py-2 rounded-lg bg-red-50/80 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm;
}
.btn-primary {
  @apply font-bold px-6 py-2.5 rounded-xl bg-navy/90 text-white shadow-lg shadow-navy/30 hover:bg-navy hover:scale-105 transition-all backdrop-blur-sm border border-navy/50;
}
.btn-secondary {
  @apply font-bold px-6 py-2.5 rounded-xl bg-white/60 text-gray-700 shadow-sm hover:bg-white/80 transition-all border border-white/60 backdrop-blur-sm;
}
.btn-danger {
  @apply font-bold px-6 py-2.5 rounded-xl bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all backdrop-blur-sm border border-red-500/50;
}
</style>