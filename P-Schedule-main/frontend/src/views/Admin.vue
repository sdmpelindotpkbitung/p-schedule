<template>
  <div class="min-h-screen flex flex-col">
    <Topbar />

    <main class="flex-1 max-w-[1100px] w-full mx-auto px-6 py-7">
      <!-- Tab bar -->
      <div
        class="flex gap-0.5 bg-white border border-gray-200 rounded-xl p-1 w-full sm:w-fit mb-6 shadow-sm overflow-x-auto whitespace-nowrap"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all"
          :class="
            activeTab === tab.key
              ? 'bg-navy text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-700'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ═══ Tab: Semua Jadwal ═══ -->
      <div v-if="activeTab === 'jadwal'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-navy text-lg">
            Semua Jadwal
          </h2>
          <span class="text-xs text-gray-400"
            >{{ jadwal.length }} jadwal ditemukan</span
          >
        </div>
        <div class="card overflow-x-auto">
          <table class="w-full min-w-[700px]">
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
              <tr v-if="loadingJadwal">
                <td colspan="6" class="py-16 text-center text-gray-400 text-sm">
                  Memuat data...
                </td>
              </tr>
              <tr v-else-if="jadwal.length === 0">
                <td colspan="6" class="py-16 text-center">
                  <div class="text-4xl mb-3">📅</div>
                  <div class="text-gray-400 text-sm">
                    Belum ada jadwal tersimpan.
                  </div>
                </td>
              </tr>
              <tr
                v-for="s in jadwal"
                :key="s.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="td font-medium text-gray-800">{{ s.agenda }}</td>
                <td class="td">{{ s.nama_ruangan }}</td>
                <td class="td">{{ formatDate(s.tanggal) }}</td>
                <td class="td text-gray-500">
                  {{ s.jam_mulai }} – {{ s.jam_selesai }}
                </td>
                <td class="td">{{ s.nama_penginput }}</td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openEdit(s)">
                      Edit
                    </button>
                    <button class="btn-sm-del" @click="confirmDelete(s)">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Tab: Ruangan ═══ -->
      <div v-if="activeTab === 'ruangan'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-navy text-lg">
            Daftar Ruangan
          </h2>
          <button class="btn-primary" @click="openRoomModal">
            ＋ Tambah Ruangan
          </button>
        </div>
        <div class="card overflow-x-auto">
          <table class="w-full min-w-[500px]">
            <thead class="bg-navy">
              <tr>
                <th class="th">Nama Ruangan</th>
                <th class="th">Kapasitas</th>
                <th class="th">Keterangan</th>
                <th class="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rooms" :key="r.id" class="hover:bg-gray-50">
                <td class="td font-medium text-gray-800">{{ r.nama }}</td>
                <td class="td text-gray-500">{{ r.kapasitas }} orang</td>
                <td class="td text-gray-500">{{ r.keterangan || "-" }}</td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openRoomModal(r)">
                      Edit
                    </button>
                    <button class="btn-sm-del" @click="confirmDeleteRoom(r)">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Tab: Divisi ═══ -->
      <div v-if="activeTab === 'divisi'">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="font-display font-semibold text-navy text-lg">
              Daftar Divisi
            </h2>
            <p class="text-xs text-gray-400 mt-1">
              Divisi digunakan untuk mengelompokkan jadwal dan pengguna.
            </p>
          </div>
          <button class="btn-primary" @click="openDivisionModal()">
            ＋ Tambah Divisi
          </button>
        </div>
        <div class="card overflow-x-auto">
          <table class="w-full min-w-[400px]">
            <thead class="bg-navy">
              <tr>
                <th class="th">Nama Divisi</th>
                <th class="th">Kode</th>
                <th class="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="divisions.length === 0">
                <td colspan="3" class="py-12 text-center text-sm text-gray-400">
                  Belum ada divisi.
                </td>
              </tr>
              <tr
                v-for="division in divisions"
                :key="division.id"
                class="hover:bg-gray-50"
              >
                <td class="td font-medium text-gray-800">
                  {{ division.nama }}
                </td>
                <td class="td text-gray-500">{{ division.kode }}</td>
                <td class="td">
                  <div class="flex gap-2">
                    <button
                      class="btn-sm-edit"
                      @click="openDivisionModal(division)"
                    >
                      Edit</button
                    ><button
                      class="btn-sm-del"
                      @click="removeDivision(division)"
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

      <!-- ═══ Tab: Pengguna ═══ -->
      <div v-if="activeTab === 'pengguna'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-navy text-lg">
            Daftar Pengguna
          </h2>
          <button class="btn-primary" @click="showUserModal = true">
            ＋ Tambah Pengguna
          </button>
        </div>
        <div class="card overflow-x-auto">
          <table class="w-full min-w-[700px]">
            <thead class="bg-navy">
              <tr>
                <th class="th">Nama</th>
                <th class="th">Username</th>
                <th class="th">Role</th>
                <th class="th">Divisi</th>
                <th class="th">Dibuat</th>
                <th class="th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
                <td class="td font-medium text-gray-800">{{ u.nama }}</td>
                <td class="td text-gray-500">{{ u.username }}</td>
                <td class="td">
                  <span
                    class="badge"
                    :class="
                      u.role === 'big_admin'
                        ? 'bg-navy text-white'
                        : 'bg-accent-light text-accent'
                    "
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="td text-gray-500">{{ u.division_name || "-" }}</td>
                <td class="td text-gray-400 text-xs">
                  {{ formatDate(u.created_at?.slice(0, 10)) }}
                </td>
                <td class="td">
                  <div class="flex gap-2">
                    <button class="btn-sm-edit" @click="openPasswordModal(u)">
                      Atur Password
                    </button>
                    <button
                      v-if="u.id !== auth.user?.id"
                      class="btn-sm-del"
                      @click="confirmDeleteUser(u)"
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

    <!-- ── Edit Jadwal Modal ── -->
    <ScheduleModal
      v-model="showEditModal"
      :schedule="editTarget"
      :rooms="rooms"
      @saved="fetchJadwal"
      @conflict="onConflict"
    />

    <!-- ── Delete Jadwal Confirm ── -->
    <transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showDeleteConfirm = false"
      >
        <div class="w-full max-w-sm card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">Hapus Jadwal</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
              @click="showDeleteConfirm = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-600 leading-relaxed">
            Jadwal
            <strong class="text-gray-800">{{ deleteTarget?.agenda }}</strong>
            akan dihapus permanen.
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
      </div>
    </transition>

    <!-- ── Tambah Pengguna Modal ── -->
    <transition name="fade">
      <div
        v-if="showUserModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showUserModal = false"
      >
        <transition name="slide-up">
          <div
            v-if="showUserModal"
            class="w-full max-w-md card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <h2 class="font-display font-semibold text-navy">
                Tambah Pengguna Baru
              </h2>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="showUserModal = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="form-label"
                  >Nama Lengkap <span class="text-danger">*</span></label
                >
                <input
                  v-model="userForm.nama"
                  class="form-control"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label class="form-label"
                  >Username <span class="text-danger">*</span></label
                >
                <input
                  v-model="userForm.username"
                  class="form-control"
                  placeholder="Contoh: budi.santoso"
                />
              </div>
              <div>
                <label class="form-label"
                  >Password <span class="text-danger">*</span></label
                >
                <input
                  v-model="userForm.password"
                  type="password"
                  class="form-control"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label class="form-label">Role</label>
                <select v-model="userForm.role" class="form-control">
                  <option value="staff">Staff</option>
                  <option value="pic">PIC</option>
                </select>
              </div>
              <div>
                <label class="form-label"
                  >Divisi <span class="text-danger">*</span></label
                >
                <select v-model="userForm.division_id" class="form-control">
                  <option value="" disabled>Pilih divisi...</option>
                  <option
                    v-for="division in divisions"
                    :key="division.id"
                    :value="division.id"
                  >
                    {{ division.nama }}
                  </option>
                </select>
              </div>
              <transition name="fade">
                <div
                  v-if="userError"
                  class="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-2.5"
                >
                  {{ userError }}
                </div>
              </transition>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
              <button class="btn-secondary" @click="showUserModal = false">
                Batal
              </button>
              <button
                class="btn-primary"
                :disabled="savingUser"
                @click="doCreateUser"
              >
                {{ savingUser ? "Menyimpan..." : "Tambahkan" }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Atur Password Modal ── -->
    <transition name="fade">
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showPasswordModal = false"
      >
        <transition name="slide-up">
          <div
            v-if="showPasswordModal"
            class="w-full max-w-md card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <div>
                <p
                  class="text-[11px] uppercase tracking-widest text-accent font-semibold"
                >
                  Pemulihan Akun
                </p>
                <h2 class="font-display font-semibold text-navy">
                  Atur Password
                </h2>
              </div>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="showPasswordModal = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <p class="text-sm text-gray-500">
                Atur password baru untuk
                <strong class="text-gray-800">{{ passwordTarget?.nama }}</strong
                >.
              </p>
              <div>
                <label class="form-label"
                  >Password Baru <span class="text-danger">*</span></label
                >
                <input
                  v-model="passwordForm.password"
                  type="password"
                  class="form-control"
                  placeholder="Minimal 6 karakter"
                  @keyup.enter="savePassword"
                />
              </div>
              <div
                v-if="passwordError"
                class="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-2.5"
              >
                {{ passwordError }}
              </div>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
              <button class="btn-secondary" @click="showPasswordModal = false">
                Batal
              </button>
              <button
                class="btn-primary"
                :disabled="savingPassword"
                @click="savePassword"
              >
                {{ savingPassword ? "Menyimpan..." : "Simpan Password" }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Delete User Confirm ── -->
    <transition name="fade">
      <div
        v-if="showDeleteUserConfirm"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showDeleteUserConfirm = false"
      >
        <div class="w-full max-w-sm card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">Hapus Pengguna</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
              @click="showDeleteUserConfirm = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-600 leading-relaxed">
            Pengguna
            <strong class="text-gray-800">{{ deleteUserTarget?.nama }}</strong>
            akan dihapus beserta semua jadwalnya.
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button
              class="btn-secondary"
              @click="showDeleteUserConfirm = false"
            >
              Batal
            </button>
            <button
              class="btn-danger"
              :disabled="deletingUser"
              @click="doDeleteUser"
            >
              {{ deletingUser ? "Menghapus..." : "Ya, Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Tambah/Edit Ruangan Modal ── -->
    <transition name="fade">
      <div
        v-if="showRoomModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showRoomModal = false"
      >
        <transition name="slide-up">
          <div
            v-if="showRoomModal"
            class="w-full max-w-md card overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
              <h2 class="font-display font-semibold text-navy">
                {{ roomEditTarget ? "Edit Ruangan" : "Tambah Ruangan Baru" }}
              </h2>
              <button
                class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
                @click="showRoomModal = false"
              >
                ✕
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="form-label"
                  >Nama Ruangan <span class="text-danger">*</span></label
                >
                <input
                  v-model="roomForm.nama"
                  class="form-control"
                  placeholder="Contoh: Ruang Rapat Lantai 3"
                />
              </div>
              <div>
                <label class="form-label">Kapasitas</label>
                <input
                  v-model.number="roomForm.kapasitas"
                  type="number"
                  min="0"
                  class="form-control"
                  placeholder="Contoh: 20"
                />
              </div>
              <div>
                <label class="form-label">Keterangan</label>
                <textarea
                  v-model="roomForm.keterangan"
                  class="form-control"
                  rows="3"
                  placeholder="Fasilitas atau keterangan ruangan"
                ></textarea>
              </div>
              <div
                v-if="roomError"
                class="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-2.5"
              >
                {{ roomError }}
              </div>
            </div>
            <div
              class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
            >
              <button class="btn-secondary" @click="showRoomModal = false">
                Batal
              </button>
              <button
                class="btn-primary"
                :disabled="savingRoom"
                @click="saveRoom"
              >
                {{
                  savingRoom
                    ? "Menyimpan..."
                    : roomEditTarget
                      ? "Simpan Perubahan"
                      : "Tambahkan"
                }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Hapus Ruangan Confirm ── -->
    <transition name="fade">
      <div
        v-if="showDeleteRoomConfirm"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showDeleteRoomConfirm = false"
      >
        <div class="w-full max-w-sm card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">Hapus Ruangan</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition"
              @click="showDeleteRoomConfirm = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-600 leading-relaxed">
            Ruangan
            <strong class="text-gray-800">{{ deleteRoomTarget?.nama }}</strong>
            akan dihapus permanen.
          </div>
          <div v-if="roomDeleteError" class="px-6 text-sm text-danger">
            {{ roomDeleteError }}
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button
              class="btn-secondary"
              @click="showDeleteRoomConfirm = false"
            >
              Batal
            </button>
            <button
              class="btn-danger"
              :disabled="deletingRoom"
              @click="doDeleteRoom"
            >
              {{ deletingRoom ? "Menghapus..." : "Ya, Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Tambah/Edit Divisi Modal ── -->
    <transition name="fade">
      <div
        v-if="showDivisionModal"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
        @click.self="showDivisionModal = false"
      >
        <div class="w-full max-w-md card overflow-hidden">
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
            <h2 class="font-display font-semibold text-navy">
              {{ divisionEditTarget ? "Edit Divisi" : "Tambah Divisi" }}
            </h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              @click="showDivisionModal = false"
            >
              ✕
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="form-label">Nama Divisi</label
              ><input
                v-model="divisionForm.nama"
                class="form-control"
                placeholder="Contoh: Teknik"
              />
            </div>
            <div>
              <label class="form-label">Kode Divisi</label
              ><input
                v-model="divisionForm.kode"
                class="form-control"
                placeholder="Contoh: TEK"
              />
            </div>
            <div
              v-if="divisionError"
              class="text-sm text-danger bg-danger-light border border-red-200 rounded-lg px-4 py-2.5"
            >
              {{ divisionError }}
            </div>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button class="btn-secondary" @click="showDivisionModal = false">
              Batal</button
            ><button
              class="btn-primary"
              :disabled="savingDivision"
              @click="saveDivision"
            >
              {{ savingDivision ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Conflict Warning -->
    <ConflictWarning
      v-model="showConflict"
      :conflict="conflictData.conflict"
      :jam-mulai="conflictData.jam_mulai"
      :jam-selesai="conflictData.jam_selesai"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { authAPI, jadwalAPI, ruanganAPI } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import Topbar from "@/components/Topbar.vue";
import ScheduleModal from "@/components/ScheduleModal.vue";
import ConflictWarning from "@/components/ConflictWarning.vue";

const tabs = [
  { key: "jadwal", label: "Semua Jadwal" },
  { key: "ruangan", label: "Ruangan" },
  { key: "divisi", label: "Divisi" },
  { key: "pengguna", label: "Pengguna" },
];
const auth = useAuthStore();
const activeTab = ref("jadwal");

// ── Data ─────────────────────────────────────────────────────
const jadwal = ref([]);
const rooms = ref([]);
const users = ref([]);
const loadingJadwal = ref(false);

const fetchJadwal = async () => {
  loadingJadwal.value = true;
  try {
    jadwal.value = (await jadwalAPI.getAll()).data;
  } finally {
    loadingJadwal.value = false;
  }
};
const fetchRooms = async () => {
  rooms.value = (await ruanganAPI.getAll()).data;
};
const fetchUsers = async () => {
  users.value = (await authAPI.getUsers()).data;
};
const fetchDivisions = async () => {
  divisions.value = (await authAPI.getDivisions()).data;
};

onMounted(async () => {
  await Promise.all([
    fetchJadwal(),
    fetchRooms(),
    fetchUsers(),
    fetchDivisions(),
  ]);
});

// ── Edit Jadwal ───────────────────────────────────────────────
const showEditModal = ref(false);
const editTarget = ref(null);
const openEdit = (s) => {
  editTarget.value = s;
  showEditModal.value = true;
};

// ── Delete Jadwal ─────────────────────────────────────────────
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);
const confirmDelete = (s) => {
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

// ── Conflict ──────────────────────────────────────────────────
const showConflict = ref(false);
const conflictData = ref({});
const onConflict = (data) => {
  conflictData.value = data;
  showConflict.value = true;
};

// ── Tambah Pengguna ───────────────────────────────────────────
const showUserModal = ref(false);
const userForm = ref({
  nama: "",
  username: "",
  password: "",
  role: "staff",
  division_id: "",
});
const divisions = ref([]);
const userError = ref("");
const savingUser = ref(false);
const doCreateUser = async () => {
  userError.value = "";
  if (
    !userForm.value.nama ||
    !userForm.value.username ||
    !userForm.value.password
  ) {
    userError.value = "Semua kolom wajib diisi.";
    return;
  }
  if (!userForm.value.division_id) {
    userError.value = "Pengguna wajib memiliki divisi.";
    return;
  }
  savingUser.value = true;
  try {
    await authAPI.createUser(userForm.value);
    showUserModal.value = false;
    userForm.value = {
      nama: "",
      username: "",
      password: "",
      role: "staff",
      division_id: "",
    };
    fetchUsers();
  } catch (e) {
    userError.value = e.response?.data?.message || "Gagal menambah pengguna.";
  } finally {
    savingUser.value = false;
  }
};

const showDivisionModal = ref(false);
const divisionEditTarget = ref(null);
const divisionForm = ref({ nama: "", kode: "" });
const divisionError = ref("");
const savingDivision = ref(false);
const openDivisionModal = (division = null) => {
  divisionEditTarget.value = division;
  divisionForm.value = division
    ? { nama: division.nama, kode: division.kode }
    : { nama: "", kode: "" };
  divisionError.value = "";
  showDivisionModal.value = true;
};
const saveDivision = async () => {
  divisionError.value = "";
  if (!divisionForm.value.nama.trim() || !divisionForm.value.kode.trim()) {
    divisionError.value = "Nama dan kode divisi wajib diisi.";
    return;
  }
  savingDivision.value = true;
  try {
    if (divisionEditTarget.value)
      await authAPI.updateDivision(
        divisionEditTarget.value.id,
        divisionForm.value,
      );
    else await authAPI.createDivision(divisionForm.value);
    showDivisionModal.value = false;
    await fetchDivisions();
  } catch (error) {
    divisionError.value =
      error.response?.data?.message || "Gagal menyimpan divisi.";
  } finally {
    savingDivision.value = false;
  }
};
const removeDivision = async (division) => {
  if (!window.confirm(`Hapus divisi ${division.nama}?`)) return;
  try {
    await authAPI.deleteDivision(division.id);
    await fetchDivisions();
  } catch (error) {
    window.alert(error.response?.data?.message || "Gagal menghapus divisi.");
  }
};

// ── Atur Password Pengguna ──────────────────────────────────
const showPasswordModal = ref(false);
const passwordTarget = ref(null);
const passwordForm = ref({ password: "" });
const passwordError = ref("");
const savingPassword = ref(false);
const openPasswordModal = (user) => {
  passwordTarget.value = user;
  passwordForm.value = { password: "" };
  passwordError.value = "";
  showPasswordModal.value = true;
};
const savePassword = async () => {
  passwordError.value = "";
  if (passwordForm.value.password.length < 6) {
    passwordError.value = "Password minimal 6 karakter.";
    return;
  }
  savingPassword.value = true;
  try {
    await authAPI.updateUserPassword(
      passwordTarget.value.id,
      passwordForm.value,
    );
    showPasswordModal.value = false;
    passwordTarget.value = null;
  } catch (e) {
    passwordError.value =
      e.response?.data?.message || "Gagal memperbarui password.";
  } finally {
    savingPassword.value = false;
  }
};

// ── Tambah Ruangan ───────────────────────────────────────────
const showRoomModal = ref(false);
const roomForm = ref({ nama: "", kapasitas: 0, keterangan: "" });
const roomEditTarget = ref(null);
const roomError = ref("");
const savingRoom = ref(false);
const openRoomModal = (room = null) => {
  roomError.value = "";
  roomEditTarget.value = room;
  roomForm.value = room
    ? {
        nama: room.nama,
        kapasitas: room.kapasitas,
        keterangan: room.keterangan || "",
      }
    : { nama: "", kapasitas: 0, keterangan: "" };
  showRoomModal.value = true;
};
const saveRoom = async () => {
  roomError.value = "";
  if (!roomForm.value.nama.trim()) {
    roomError.value = "Nama ruangan wajib diisi.";
    return;
  }
  savingRoom.value = true;
  try {
    if (roomEditTarget.value) {
      await ruanganAPI.update(roomEditTarget.value.id, roomForm.value);
    } else {
      await ruanganAPI.create(roomForm.value);
    }
    showRoomModal.value = false;
    roomEditTarget.value = null;
    await fetchRooms();
  } catch (e) {
    roomError.value = e.response?.data?.message || "Gagal menyimpan ruangan.";
  } finally {
    savingRoom.value = false;
  }
};

const showDeleteRoomConfirm = ref(false);
const deleteRoomTarget = ref(null);
const roomDeleteError = ref("");
const deletingRoom = ref(false);
const confirmDeleteRoom = (room) => {
  deleteRoomTarget.value = room;
  roomDeleteError.value = "";
  showDeleteRoomConfirm.value = true;
};
const doDeleteRoom = async () => {
  deletingRoom.value = true;
  roomDeleteError.value = "";
  try {
    await ruanganAPI.delete(deleteRoomTarget.value.id);
    showDeleteRoomConfirm.value = false;
    deleteRoomTarget.value = null;
    await fetchRooms();
  } catch (e) {
    roomDeleteError.value =
      e.response?.data?.message || "Gagal menghapus ruangan.";
  } finally {
    deletingRoom.value = false;
  }
};

// ── Hapus Pengguna ────────────────────────────────────────────
const showDeleteUserConfirm = ref(false);
const deleteUserTarget = ref(null);
const deletingUser = ref(false);
const confirmDeleteUser = (u) => {
  deleteUserTarget.value = u;
  showDeleteUserConfirm.value = true;
};
const doDeleteUser = async () => {
  deletingUser.value = true;
  try {
    await authAPI.deleteUser(deleteUserTarget.value.id);
    showDeleteUserConfirm.value = false;
    fetchUsers();
  } finally {
    deletingUser.value = false;
  }
};

// ── Helpers ───────────────────────────────────────────────────
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
const formatDate = (str) => {
  if (!str) return "-";
  const [y, m, d] = str.split("-");
  return `${d} ${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
};
</script>

<style scoped>
.th {
  @apply px-4 py-3 text-left text-[11px] font-semibold text-white/60 uppercase tracking-widest;
}
.td {
  @apply px-4 py-3 text-sm border-b border-gray-100;
}
tr:last-child .td {
  @apply border-b-0;
}
.btn-sm-edit {
  @apply text-xs font-medium px-3 py-1.5 rounded-lg bg-accent-light text-accent border border-blue-200 hover:bg-accent hover:text-white transition;
}
.btn-sm-del {
  @apply text-xs font-medium px-3 py-1.5 rounded-lg bg-danger-light text-danger border border-red-200 hover:bg-danger hover:text-white transition;
}
</style>
