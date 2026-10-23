<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Topbar />

    <!-- Padding dan jarak disesuaikan: lebih rapat di HP (px-4 py-5), normal di Desktop (sm:px-6 sm:py-7) -->
    <main class="flex-1 max-w-[1000px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-7 overflow-hidden">
      
      <!-- ═══ HEADER HALAMAN ═══ -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <h1 class="font-display font-bold text-navy text-2xl sm:text-3xl drop-shadow-sm">
            Anggota Divisi
          </h1>
          <p class="text-xs sm:text-sm font-medium text-gray-700 mt-1 bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/40 w-fit">
            Staff pada divisi {{ auth.divisionName }}
          </p>
        </div>
        <!-- Tombol akan memanjang 100% di HP, dan menyesuaikan isi di Desktop -->
        <button class="btn-primary w-full sm:w-auto flex items-center justify-center shrink-0 text-sm sm:text-base py-2 sm:py-2.5" @click="showModal = true">
          <span class="text-base sm:text-lg leading-none mr-1.5">＋</span> Tambah Staff
        </button>
      </div>

      <!-- ═══ KOTAK TABEL ═══ -->
      <div class="glass-card overflow-hidden fade-in">
        <div v-if="loading" class="py-16 text-center text-gray-600 font-medium text-sm sm:text-base">
          <span class="animate-pulse">⏳ Memuat anggota...</span>
        </div>

        <div v-else-if="members.length === 0" class="py-16 text-center">
          <div class="text-5xl mb-4 drop-shadow-md">👥</div>
          <div class="text-gray-600 font-medium text-base sm:text-lg">
            Belum ada staff pada divisi ini.
          </div>
        </div>

        <!-- Tabel dengan scroll horizontal khusus HP -->
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[620px]">
            <thead class="bg-navy/90 backdrop-blur-md">
              <tr>
                <th class="th rounded-tl-xl">Nama</th>
                <th class="th">Username</th>
                <th class="th">Bergabung</th>
                <th class="th rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in members"
                :key="member.id"
                class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0"
              >
                <td class="td font-bold text-gray-800">{{ member.nama }}</td>
                <td class="td font-medium text-gray-700">{{ member.username }}</td>
                <td class="td text-gray-700 font-medium text-sm">
                  {{ formatDate(member.created_at) }}
                </td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openPassword(member)">Atur Password</button>
                    <button class="btn-sm-del" @click="confirmDelete(member)">Hapus</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- ── Tambah Staff Modal ── -->
    <transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md" @click.self="showModal = false">
        <transition name="slide-up">
          <div v-if="showModal" class="w-full max-w-md glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/40">
              <h2 class="font-display font-bold text-navy text-lg sm:text-xl">Tambah Staff</h2>
              <button class="w-8 h-8 rounded-full border border-white/60 bg-white/50 flex items-center justify-center text-navy font-bold hover:bg-white/80 transition" @click="showModal = false">✕</button>
            </div>
            <div class="px-5 sm:px-6 py-5 space-y-4">
              <div>
                <label class="form-label font-bold text-gray-700 text-sm">Nama Lengkap</label>
                <input v-model="form.nama" class="form-control glass-input text-sm" placeholder="Contoh: Budi Santoso" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700 text-sm">Username</label>
                <input v-model="form.username" class="form-control glass-input text-sm" placeholder="Contoh: budi.s" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700 text-sm">Password</label>
                <input v-model="form.password" type="password" class="form-control glass-input text-sm" placeholder="Minimal 6 karakter" />
              </div>
              <transition name="fade">
                <div v-if="error" class="text-xs sm:text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  {{ error }}
                </div>
              </transition>
            </div>
            <div class="px-5 sm:px-6 py-4 border-t border-white/40 flex justify-end gap-2.5">
              <button class="btn-secondary text-sm" @click="showModal = false">Batal</button>
              <button class="btn-primary text-sm" :disabled="saving" @click="createStaff">{{ saving ? "Menyimpan..." : "Tambahkan" }}</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Atur Password Modal ── -->
    <transition name="fade">
      <div v-if="passwordModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md" @click.self="passwordModal = false">
        <transition name="slide-up">
          <div v-if="passwordModal" class="w-full max-w-md glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/40">
              <div>
                <p class="text-[10px] sm:text-[11px] uppercase tracking-widest text-blue-600 font-bold">Pemulihan Akun</p>
                <h2 class="font-display font-bold text-navy text-lg sm:text-xl">Atur Password</h2>
              </div>
              <button class="w-8 h-8 rounded-full border border-white/60 bg-white/50 flex items-center justify-center text-navy font-bold hover:bg-white/80 transition" @click="passwordModal = false">✕</button>
            </div>
            <div class="px-5 sm:px-6 py-5 space-y-4">
              <p class="text-xs sm:text-sm text-gray-600 font-medium">
                Atur password baru untuk <strong class="text-gray-900">{{ passwordTarget?.nama }}</strong>.
              </p>
              <input v-model="newPassword" type="password" class="form-control glass-input text-sm" placeholder="Minimal 6 karakter" @keyup.enter="savePassword" />
              <transition name="fade">
                <div v-if="passwordError" class="text-xs sm:text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  {{ passwordError }}
                </div>
              </transition>
            </div>
            <div class="px-5 sm:px-6 py-4 border-t border-white/40 flex justify-end gap-2.5">
              <button class="btn-secondary text-sm" @click="passwordModal = false">Batal</button>
              <button class="btn-primary text-sm" @click="savePassword">Simpan</button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Hapus Akun Confirm ── -->
    <transition name="fade">
      <div v-if="deleteModal" class="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md" @click.self="deleteModal = false">
        <transition name="slide-up">
          <div v-if="deleteModal" class="w-full max-w-sm glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/40">
              <h2 class="font-display font-bold text-navy text-lg sm:text-xl">Hapus Akun Staff</h2>
              <button class="w-8 h-8 rounded-full border border-white/60 bg-white/50 flex items-center justify-center text-navy font-bold hover:bg-white/80 transition" @click="deleteModal = false">✕</button>
            </div>
            <div class="px-5 sm:px-6 py-5 text-sm text-gray-700 font-medium leading-relaxed">
              Akun <strong class="text-gray-900 font-bold">{{ deleteTarget?.nama }}</strong> beserta jadwal yang dibuatnya akan dihapus permanen.
              <transition name="fade">
                <p v-if="deleteError" class="text-red-500 font-bold mt-3 bg-red-50 p-2 rounded-lg border border-red-200 text-xs sm:text-sm">
                  {{ deleteError }}
                </p>
              </transition>
            </div>
            <div class="px-5 sm:px-6 py-4 border-t border-white/40 flex justify-end gap-2.5">
              <button class="btn-secondary text-sm" :disabled="deleting" @click="deleteModal = false">Batal</button>
              <button class="btn-danger text-sm" :disabled="deleting" @click="deleteMember">{{ deleting ? "Menghapus..." : "Ya, Hapus" }}</button>
            </div>
          </div>
        </transition>
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

/* ── Glassmorphism ── */
.glass-card {
  @apply bg-white/75 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl;
}
.glass-modal {
  @apply bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl;
}
.glass-input {
  @apply bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5;
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