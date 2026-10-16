<template>
  <div class="min-h-screen flex flex-col">
    <Topbar />
    <main class="flex-1 max-w-[1200px] w-full mx-auto px-6 py-7">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="font-display font-semibold text-navy text-2xl">
            Kelola Jadwal
          </h1>
          <p class="text-sm text-gray-500 mt-1">{{ scopeLabel }}</p>
        </div>
        <button class="btn-primary" @click="openAdd">＋ Tambah Jadwal</button>
      </div>

      <div class="card overflow-hidden">
        <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
          Memuat jadwal...
        </div>
        <div
          v-else-if="schedules.length === 0"
          class="py-16 text-center text-gray-400 text-sm"
        >
          Belum ada jadwal yang dapat dikelola.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px]">
            <thead class="bg-navy">
              <tr>
                <th class="th">Agenda</th>
                <th class="th">Ruangan</th>
                <th class="th">Tanggal</th>
                <th class="th">Waktu</th>
                <th class="th">Penginput</th>
                <th class="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="schedule in schedules"
                :key="schedule.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="td font-medium text-gray-800">
                  {{ schedule.agenda }}
                </td>
                <td class="td text-gray-500">{{ schedule.nama_ruangan }}</td>
                <td class="td text-gray-500">
                  {{ formatDate(schedule.tanggal) }}
                </td>
                <td class="td text-gray-500">
                  {{ schedule.jam_mulai }} – {{ schedule.jam_selesai }}
                </td>
                <td class="td text-gray-500">{{ schedule.nama_penginput }}</td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openEdit(schedule)">
                      Edit</button
                    ><button
                      class="btn-sm-del"
                      @click="removeSchedule(schedule)"
                    >
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
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
              <p v-if="deleteError" class="text-danger mt-3">
                {{ deleteError }}
              </p>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
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
