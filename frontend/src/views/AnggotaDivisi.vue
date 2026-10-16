<template>
  <div class="min-h-screen flex flex-col">
    <Topbar />
    <main class="flex-1 max-w-[1000px] w-full mx-auto px-6 py-7">
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="font-display font-semibold text-navy text-2xl">
            Anggota Divisi
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Staff pada divisi {{ auth.divisionName }}
          </p>
        </div>
        <button class="btn-primary" @click="showModal = true">
          ＋ Tambah Staff
        </button>
      </div>

      <div class="card overflow-hidden">
        <div v-if="loading" class="py-16 text-center text-gray-400 text-sm">
          Memuat anggota...
        </div>
        <div
          v-else-if="members.length === 0"
          class="py-16 text-center text-gray-400 text-sm"
        >
          Belum ada staff pada divisi ini.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[620px]">
            <thead class="bg-navy">
              <tr>
                <th class="th">Nama</th>
                <th class="th">Username</th>
                <th class="th">Bergabung</th>
                <th class="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in members"
                :key="member.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="td font-medium text-gray-800">{{ member.nama }}</td>
                <td class="td text-gray-500">{{ member.username }}</td>
                <td class="td text-gray-500">
                  {{ formatDate(member.created_at) }}
                </td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openPassword(member)">
                      Atur Password
                    </button>
                    <button class="btn-sm-del" @click="confirmDelete(member)">
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

    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="w-full max-w-md card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">Tambah Staff</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 text-gray-400"
              @click="showModal = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="form-label">Nama Lengkap</label
              ><input v-model="form.nama" class="form-control" />
            </div>
            <div>
              <label class="form-label">Username</label
              ><input v-model="form.username" class="form-control" />
            </div>
            <div>
              <label class="form-label">Password</label
              ><input
                v-model="form.password"
                type="password"
                class="form-control"
              />
            </div>
            <div
              v-if="error"
              class="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-2.5"
            >
              {{ error }}
            </div>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button class="btn-secondary" @click="showModal = false">
              Batal</button
            ><button
              class="btn-primary"
              :disabled="saving"
              @click="createStaff"
            >
              {{ saving ? "Menyimpan..." : "Tambahkan" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="passwordModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="passwordModal = false"
      >
        <div class="w-full max-w-md card overflow-hidden">
          <div class="px-6 py-5">
            <h2 class="font-display font-semibold text-navy">Atur Password</h2>
            <p class="text-sm text-gray-500 mt-2">{{ passwordTarget?.nama }}</p>
            <input
              v-model="newPassword"
              type="password"
              class="form-control mt-4"
              placeholder="Minimal 6 karakter"
            />
            <div v-if="passwordError" class="text-sm text-danger mt-3">
              {{ passwordError }}
            </div>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button class="btn-secondary" @click="passwordModal = false">
              Batal</button
            ><button class="btn-primary" @click="savePassword">Simpan</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="deleteModal"
        class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="deleteModal = false"
      >
        <div class="w-full max-w-sm card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">
              Hapus Akun Staff
            </h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
              @click="deleteModal = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-600 leading-relaxed">
            Akun <strong class="text-gray-800">{{ deleteTarget?.nama }}</strong>
            beserta jadwal yang dibuatnya akan dihapus permanen.
            <p v-if="deleteError" class="text-danger mt-3">{{ deleteError }}</p>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button
              class="btn-secondary"
              :disabled="deleting"
              @click="deleteModal = false"
            >
              Batal
            </button>
            <button
              class="btn-danger"
              :disabled="deleting"
              @click="deleteMember"
            >
              {{ deleting ? "Menghapus..." : "Ya, Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { authAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import Topbar from "@/components/Topbar.vue";

const auth = useAuthStore();
const members = ref([]);
const loading = ref(false);
const showModal = ref(false);
const form = ref({ nama: "", username: "", password: "" });
const error = ref("");
const saving = ref(false);
const passwordModal = ref(false);
const passwordTarget = ref(null);
const newPassword = ref("");
const passwordError = ref("");
const deleteModal = ref(false);
const deleteTarget = ref(null);
const deleteError = ref("");
const deleting = ref(false);

const fetchMembers = async () => {
  loading.value = true;
  try {
    members.value = (await authAPI.getDivisionMembers()).data;
  } finally {
    loading.value = false;
  }
};
const createStaff = async () => {
  error.value = "";
  if (!form.value.nama || !form.value.username || !form.value.password) {
    error.value = "Semua kolom wajib diisi.";
    return;
  }
  saving.value = true;
  try {
    await authAPI.createUser({ ...form.value, role: "staff" });
    form.value = { nama: "", username: "", password: "" };
    showModal.value = false;
    await fetchMembers();
  } catch (err) {
    error.value = err.response?.data?.message || "Gagal membuat akun staff.";
  } finally {
    saving.value = false;
  }
};
const openPassword = (member) => {
  passwordTarget.value = member;
  newPassword.value = "";
  passwordError.value = "";
  passwordModal.value = true;
};
const savePassword = async () => {
  passwordError.value = "";
  if (newPassword.value.length < 6) {
    passwordError.value = "Password minimal 6 karakter.";
    return;
  }
  try {
    await authAPI.updateUserPassword(passwordTarget.value.id, {
      password: newPassword.value,
    });
    passwordModal.value = false;
  } catch (err) {
    passwordError.value =
      err.response?.data?.message || "Gagal memperbarui password.";
  }
};
const confirmDelete = (member) => {
  deleteTarget.value = member;
  deleteError.value = "";
  deleteModal.value = true;
};
const deleteMember = async () => {
  deleting.value = true;
  deleteError.value = "";
  try {
    await authAPI.deleteUser(deleteTarget.value.id);
    deleteModal.value = false;
    deleteTarget.value = null;
    await fetchMembers();
  } catch (err) {
    deleteError.value =
      err.response?.data?.message || "Gagal menghapus akun staff.";
  } finally {
    deleting.value = false;
  }
};
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("id-ID") : "-";
onMounted(fetchMembers);
</script>
