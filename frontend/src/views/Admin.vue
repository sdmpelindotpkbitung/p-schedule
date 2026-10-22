<template>
  <div class="min-h-screen flex flex-col font-sans">
    <Topbar />

    <main class="flex-1 max-w-[1100px] w-full mx-auto px-6 py-7">
      <!-- Tab bar Glassmorphism -->
      <div
        class="flex gap-1 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-1.5 w-full sm:w-fit mb-8 shadow-lg overflow-x-auto whitespace-nowrap"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
          :class="
            activeTab === tab.key
              ? 'bg-navy/90 text-white shadow-md backdrop-blur-sm transform scale-105'
              : 'text-gray-600 hover:text-navy hover:bg-white/40'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ═══ Tab: Semua Jadwal ═══ -->
      <div v-if="activeTab === 'jadwal'" class="fade-in">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="font-display font-bold text-navy text-2xl drop-shadow-sm">
            Semua Jadwal
          </h2>
          <span class="text-sm font-medium text-gray-600 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/40"
            >{{ jadwal.length }} jadwal ditemukan</span
          >
        </div>
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px]">
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
                <tr v-if="loadingJadwal">
                  <td colspan="6" class="py-16 text-center text-gray-600 font-medium">
                    <span class="animate-pulse">⏳ Memuat data...</span>
                  </td>
                </tr>
                <tr v-else-if="jadwal.length === 0">
                  <td colspan="6" class="py-16 text-center">
                    <div class="text-5xl mb-4 drop-shadow-md">📅</div>
                    <div class="text-gray-600 font-medium text-lg">
                      Belum ada jadwal tersimpan.
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="s in jadwal"
                  :key="s.id"
                  class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0"
                >
                  <td class="td font-bold text-gray-800">{{ s.agenda }}</td>
                  <td class="td font-medium text-gray-700">{{ s.nama_ruangan }}</td>
                  <td class="td text-gray-700">{{ formatDate(s.tanggal) }}</td>
                  <td class="td font-mono text-sm text-gray-600 font-semibold">
                    <span class="bg-white/50 px-2 py-1 rounded-md border border-white/40">{{ s.jam_mulai }} – {{ s.jam_selesai }}</span>
                  </td>
                  <td class="td text-gray-700">{{ s.nama_penginput }}</td>
                  <td class="td">
                    <div class="flex gap-2">
                      <button class="btn-sm-edit" @click="openEdit(s)">Edit</button>
                      <button class="btn-sm-del" @click="confirmDelete(s)">Hapus</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══ Tab: Ruangan ═══ -->
      <div v-if="activeTab === 'ruangan'" class="fade-in">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="font-display font-bold text-navy text-2xl drop-shadow-sm">
            Daftar Ruangan
          </h2>
          <button class="btn-primary" @click="openRoomModal()">
            ＋ Tambah Ruangan
          </button>
        </div>
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[500px]">
              <thead class="bg-navy/90 backdrop-blur-md">
                <tr>
                  <th class="th rounded-tl-xl">Nama Ruangan</th>
                  <th class="th">Kapasitas</th>
                  <th class="th">Keterangan</th>
                  <th class="th rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in rooms" :key="r.id" class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0">
                  <td class="td font-bold text-gray-800">{{ r.nama }}</td>
                  <td class="td font-medium text-gray-700">
                    <span class="bg-white/50 px-2 py-1 rounded-md border border-white/40">{{ r.kapasitas }} orang</span>
                  </td>
                  <td class="td text-gray-600 italic">{{ r.keterangan || "-" }}</td>
                  <td class="td">
                    <div class="flex gap-2">
                      <button class="btn-sm-edit" @click="openRoomModal(r)">Edit</button>
                      <button class="btn-sm-del" @click="confirmDeleteRoom(r)">Hapus</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══ Tab: Divisi ═══ -->
      <div v-if="activeTab === 'divisi'" class="fade-in">
        <div class="flex items-center justify-between mb-4 px-2">
          <div>
            <h2 class="font-display font-bold text-navy text-2xl drop-shadow-sm">
              Daftar Divisi
            </h2>
            <p class="text-sm font-medium text-gray-600 mt-1">
              Pengelompokan jadwal dan pengguna operasional.
            </p>
          </div>
          <button class="btn-primary" @click="openDivisionModal()">
            ＋ Tambah Divisi
          </button>
        </div>
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[400px]">
              <thead class="bg-navy/90 backdrop-blur-md">
                <tr>
                  <th class="th rounded-tl-xl">Nama Divisi</th>
                  <th class="th">Kode</th>
                  <th class="th rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="divisions.length === 0">
                  <td colspan="3" class="py-12 text-center text-base font-medium text-gray-500">
                    Belum ada divisi.
                  </td>
                </tr>
                <tr
                  v-for="division in divisions"
                  :key="division.id"
                  class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0"
                >
                  <td class="td font-bold text-gray-800">{{ division.nama }}</td>
                  <td class="td font-mono text-gray-700 font-semibold">{{ division.kode }}</td>
                  <td class="td">
                    <div class="flex gap-2">
                      <button class="btn-sm-edit" @click="openDivisionModal(division)">Edit</button>
                      <button class="btn-sm-del" @click="removeDivision(division)">Hapus</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══ Tab: Pengguna ═══ -->
      <div v-if="activeTab === 'pengguna'" class="fade-in">
        <div class="flex items-center justify-between mb-4 px-2">
          <h2 class="font-display font-bold text-navy text-2xl drop-shadow-sm">
            Daftar Pengguna
          </h2>
          <button class="btn-primary" @click="showUserModal = true">
            ＋ Tambah Pengguna
          </button>
        </div>
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px]">
              <thead class="bg-navy/90 backdrop-blur-md">
                <tr>
                  <th class="th rounded-tl-xl">Nama</th>
                  <th class="th">Username</th>
                  <th class="th">Role</th>
                  <th class="th">Divisi</th>
                  <th class="th">Dibuat</th>
                  <th class="th rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in users" :key="u.id" class="hover:bg-white/50 transition-colors border-b border-white/40 last:border-0">
                  <td class="td font-bold text-gray-800">{{ u.nama }}</td>
                  <td class="td text-gray-700 font-medium">{{ u.username }}</td>
                  <td class="td">
                    <span
                      class="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
                      :class="
                        u.role === 'big_admin'
                          ? 'bg-navy text-white shadow-sm'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      "
                    >
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="td font-medium text-gray-700">{{ u.division_name || "-" }}</td>
                  <td class="td text-gray-500 text-xs font-medium">
                    {{ formatDate(u.created_at?.slice(0, 10)) }}
                  </td>
                  <td class="td">
                    <div class="flex gap-2">
                      <button class="btn-sm-edit" @click="openPasswordModal(u)">Password</button>
                      <button v-if="u.id !== auth.user?.id" class="btn-sm-del" @click="confirmDeleteUser(u)">Hapus</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═══ Tab: Slide TV ═══ -->
      <div v-if="activeTab === 'slides'" class="fade-in">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 px-2 gap-4">
          <div>
            <h2 class="font-display font-bold text-navy text-2xl drop-shadow-sm">
              Manajemen Slide TV
            </h2>
            <p class="text-sm font-medium text-gray-600 mt-1">
              Foto-foto ini akan muncul bergantian saat tidak ada kegiatan di TV.
            </p>
          </div>
          <label class="btn-primary cursor-pointer flex items-center gap-2 shrink-0">
            <span v-if="uploadingSlide" class="animate-pulse">⏳ Mengunggah...</span>
            <span v-else>＋ Upload Foto</span>
            <input type="file" accept="image/*" class="hidden" @change="handleUploadSlide" :disabled="uploadingSlide" />
          </label>
        </div>

        <!-- Notifikasi Error Kustom -->
        <transition name="fade">
          <div v-if="slideError" class="mb-4 mx-2 px-4 py-3 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl text-sm font-bold text-red-600 shadow-sm flex items-center justify-between">
            <span>⚠ {{ slideError }}</span>
            <button @click="slideError = ''" class="text-red-400 hover:text-red-700">✕</button>
          </div>
        </transition>

        <div class="glass-card p-6">
          <div v-if="loadingSlides" class="py-12 text-center text-gray-600 font-medium animate-pulse">
            Memuat daftar slide...
          </div>

          <div v-else-if="slides.length === 0" class="py-16 text-center">
            <div class="text-5xl mb-4 drop-shadow-md">🖼️</div>
            <p class="text-gray-600 font-medium text-lg">Belum ada foto slide yang diunggah.</p>
          </div>

          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <div
              v-for="slide in slides"
              :key="slide.id"
              class="group relative rounded-2xl overflow-hidden border border-white/60 bg-white/40 shadow-sm aspect-video"
            >
              <img :src="slide.url" class="w-full h-full object-cover" alt="Slide Preview" />
              <div class="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-3">
                <!-- Ubah event klik menjadi modal konfirmasi -->
                <button
                  class="btn-sm-del bg-red-600 text-white border-none hover:bg-red-700 shadow-md"
                  @click="confirmDeleteSlide(slide)"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          </div>
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
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showDeleteConfirm = false"
      >
        <div class="w-full max-w-sm glass-modal overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">Hapus Jadwal</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              @click="showDeleteConfirm = false"
            >✕</button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-700 leading-relaxed font-medium">
            Jadwal
            <strong class="text-gray-900 font-bold">{{ deleteTarget?.agenda }}</strong>
            akan dihapus permanen.
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showDeleteConfirm = false">Batal</button>
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
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showUserModal = false"
      >
        <transition name="slide-up">
          <div v-if="showUserModal" class="w-full max-w-md glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-display font-bold text-navy">Tambah Pengguna Baru</h2>
              <button
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                @click="showUserModal = false"
              >✕</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="form-label font-bold text-gray-700">Nama Lengkap <span class="text-red-500">*</span></label>
                <input v-model="userForm.nama" class="form-control glass-input" placeholder="Contoh: Budi Santoso" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Username <span class="text-red-500">*</span></label>
                <input v-model="userForm.username" class="form-control glass-input" placeholder="Contoh: budi.santoso" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Password <span class="text-red-500">*</span></label>
                <input v-model="userForm.password" type="password" class="form-control glass-input" placeholder="Minimal 6 karakter" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Role</label>
                <select v-model="userForm.role" class="form-control glass-input">
                  <option value="staff">Staff</option>
                  <option value="pic">PIC</option>
                </select>
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Divisi <span class="text-red-500">*</span></label>
                <select v-model="userForm.division_id" class="form-control glass-input">
                  <option value="" disabled>Pilih divisi...</option>
                  <option v-for="division in divisions" :key="division.id" :value="division.id">
                    {{ division.nama }}
                  </option>
                </select>
              </div>
              <transition name="fade">
                <div v-if="userError" class="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  {{ userError }}
                </div>
              </transition>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
              <button class="btn-secondary" @click="showUserModal = false">Batal</button>
              <button class="btn-primary" :disabled="savingUser" @click="doCreateUser">
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
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showPasswordModal = false"
      >
        <transition name="slide-up">
          <div v-if="showPasswordModal" class="w-full max-w-md glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <p class="text-[11px] uppercase tracking-widest text-blue-600 font-bold">Pemulihan Akun</p>
                <h2 class="font-display font-bold text-navy">Atur Password</h2>
              </div>
              <button
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                @click="showPasswordModal = false"
              >✕</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <p class="text-sm text-gray-600 font-medium">
                Atur password baru untuk <strong class="text-gray-900">{{ passwordTarget?.nama }}</strong>.
              </p>
              <div>
                <label class="form-label font-bold text-gray-700">Password Baru <span class="text-red-500">*</span></label>
                <input v-model="passwordForm.password" type="password" class="form-control glass-input" placeholder="Minimal 6 karakter" @keyup.enter="savePassword" />
              </div>
              <div v-if="passwordError" class="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {{ passwordError }}
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
              <button class="btn-secondary" @click="showPasswordModal = false">Batal</button>
              <button class="btn-primary" :disabled="savingPassword" @click="savePassword">
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
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showDeleteUserConfirm = false"
      >
        <div class="w-full max-w-sm glass-modal overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">Hapus Pengguna</h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
              @click="showDeleteUserConfirm = false"
            >✕</button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-700 leading-relaxed font-medium">
            Pengguna <strong class="text-gray-900 font-bold">{{ deleteUserTarget?.nama }}</strong> akan dihapus beserta semua jadwalnya.
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showDeleteUserConfirm = false">Batal</button>
            <button class="btn-danger" :disabled="deletingUser" @click="doDeleteUser">
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
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showRoomModal = false"
      >
        <transition name="slide-up">
          <div v-if="showRoomModal" class="w-full max-w-md glass-modal overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-display font-bold text-navy">{{ roomEditTarget ? "Edit Ruangan" : "Tambah Ruangan Baru" }}</h2>
              <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition" @click="showRoomModal = false">✕</button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="form-label font-bold text-gray-700">Nama Ruangan <span class="text-red-500">*</span></label>
                <input v-model="roomForm.nama" class="form-control glass-input" placeholder="Contoh: Ruang Rapat Lantai 3" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Kapasitas</label>
                <input v-model.number="roomForm.kapasitas" type="number" min="0" class="form-control glass-input" placeholder="Contoh: 20" />
              </div>
              <div>
                <label class="form-label font-bold text-gray-700">Keterangan</label>
                <textarea v-model="roomForm.keterangan" class="form-control glass-input" rows="3" placeholder="Fasilitas atau keterangan ruangan"></textarea>
              </div>
              <div v-if="roomError" class="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {{ roomError }}
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
              <button class="btn-secondary" @click="showRoomModal = false">Batal</button>
              <button class="btn-primary" :disabled="savingRoom" @click="saveRoom">
                {{ savingRoom ? "Menyimpan..." : roomEditTarget ? "Simpan Perubahan" : "Tambahkan" }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- ── Hapus Ruangan Confirm ── -->
    <transition name="fade">
      <div v-if="showDeleteRoomConfirm" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showDeleteRoomConfirm = false">
        <div class="w-full max-w-sm glass-modal overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">Hapus Ruangan</h2>
            <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition" @click="showDeleteRoomConfirm = false">✕</button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-700 leading-relaxed font-medium">
            Ruangan <strong class="text-gray-900 font-bold">{{ deleteRoomTarget?.nama }}</strong> akan dihapus permanen.
          </div>
          <div v-if="roomDeleteError" class="px-6 text-sm font-bold text-red-600">
            {{ roomDeleteError }}
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showDeleteRoomConfirm = false">Batal</button>
            <button class="btn-danger" :disabled="deletingRoom" @click="doDeleteRoom">
              {{ deletingRoom ? "Menghapus..." : "Ya, Hapus" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Tambah/Edit Divisi Modal ── -->
    <transition name="fade">
      <div v-if="showDivisionModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showDivisionModal = false">
        <div class="w-full max-w-md glass-modal overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">{{ divisionEditTarget ? "Edit Divisi" : "Tambah Divisi" }}</h2>
            <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100" @click="showDivisionModal = false">✕</button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="form-label font-bold text-gray-700">Nama Divisi</label>
              <input v-model="divisionForm.nama" class="form-control glass-input" placeholder="Contoh: Teknik" />
            </div>
            <div>
              <label class="form-label font-bold text-gray-700">Kode Divisi</label>
              <input v-model="divisionForm.kode" class="form-control glass-input" placeholder="Contoh: TEK" />
            </div>
            <div v-if="divisionError" class="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {{ divisionError }}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showDivisionModal = false">Batal</button>
            <button class="btn-primary" :disabled="savingDivision" @click="saveDivision">
              {{ savingDivision ? "Menyimpan..." : "Simpan" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

        <!-- ── Hapus Slide Confirm Modal ── -->
    <transition name="fade">
      <div v-if="showDeleteSlideConfirm" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showDeleteSlideConfirm = false">
        <div class="w-full max-w-sm glass-modal overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">Hapus Foto Slide</h2>
            <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition" @click="showDeleteSlideConfirm = false">✕</button>
          </div>
          <div class="px-6 py-5 text-sm text-gray-700 leading-relaxed font-medium">
            Apakah Anda yakin ingin menghapus foto slide ini? Foto akan hilang dari tayangan TV secara permanen.
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showDeleteSlideConfirm = false">Batal</button>
            <button class="btn-danger" :disabled="deletingSlide" @click="doDeleteSlide">
              {{ deletingSlide ? "Menghapus..." : "Ya, Hapus" }}
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
import axios from "axios";

const tabs = [
  { key: "jadwal", label: "Semua Jadwal" },
  { key: "ruangan", label: "Ruangan" },
  { key: "divisi", label: "Divisi" },
  { key: "pengguna", label: "Pengguna" },
  { key: "slides", label: "Slide TV" }
];
const auth = useAuthStore();
const activeTab = ref("jadwal");

const jadwal = ref([]);
const rooms = ref([]);
const users = ref([]);
const divisions = ref([]);
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

const showEditModal = ref(false);
const editTarget = ref(null);
const openEdit = (s) => {
  editTarget.value = s;
  showEditModal.value = true;
};

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

const showConflict = ref(false);
const conflictData = ref({});
const onConflict = (data) => {
  conflictData.value = data;
  showConflict.value = true;
};

const showUserModal = ref(false);
const userForm = ref({
  nama: "",
  username: "",
  password: "",
  role: "staff",
  division_id: "",
});
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

// ==========================================
// STATE & FUNGSI UNTUK SLIDE TV
// ==========================================
const slides = ref([]);
const loadingSlides = ref(false);
const uploadingSlide = ref(false);
const slideError = ref(""); // Variabel untuk menampung pesan error
const showDeleteSlideConfirm = ref(false); // Modal konfirmasi hapus
const slideToDelete = ref(null);
const deletingSlide = ref(false);

const fetchSlides = async () => {
  loadingSlides.value = true;
  try {
    const res = await axios.get('/api/tv/slides');
    slides.value = res.data;
  } catch (err) {
    console.error("Gagal mengambil slide:", err);
  } finally {
    loadingSlides.value = false;
  }
};

const handleUploadSlide = async (e) => {
  slideError.value = ""; // Reset error
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('slideImage', file);

  uploadingSlide.value = true;
  try {
    await axios.post('/api/tv/slides', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${auth.token}`
      }
    });
    await fetchSlides();
  } catch (err) {
    // Tampilkan pesan error di UI, bukan alert()
    slideError.value = err.response?.data?.message || "Gagal mengunggah foto ke Supabase.";
  } finally {
    uploadingSlide.value = false;
    e.target.value = ""; 
  }
};

const confirmDeleteSlide = (slide) => {
  slideError.value = "";
  slideToDelete.value = slide;
  showDeleteSlideConfirm.value = true;
};

const doDeleteSlide = async () => {
  deletingSlide.value = true;
  try {
    await axios.delete(`/api/tv/slides/${slideToDelete.value.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    showDeleteSlideConfirm.value = false;
    slideToDelete.value = null;
    await fetchSlides();
  } catch (err) {
    slideError.value = "Gagal menghapus gambar dari server.";
    showDeleteSlideConfirm.value = false;
  } finally {
    deletingSlide.value = false;
  }
};



onMounted(() => {
  fetchSlides();
});
</script>

<style scoped>
/* Transisi halus saat pindah tab */
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

/* Base Glassmorphism Card */
.glass-card {
  @apply bg-white/75 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl;
}

/* Modals Override Glassmorphism agar tetap pekat/mudah dibaca */
.glass-modal {
  @apply bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl;
}

/* Tabel Header & Sel */
.th {
  @apply px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-widest border-b border-white/20;
}
.td {
  @apply px-5 py-4 text-sm align-middle;
}

/* Form Input di dalam Modal */
.glass-input {
  @apply bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5;
}

/* Tombol Aksi */
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
  @apply font-bold px-6 py-2.5 rounded-xl bg-white/80 text-gray-700 shadow-sm hover:bg-white transition-all border border-gray-200 backdrop-blur-sm;
}
.btn-danger {
  @apply font-bold px-6 py-2.5 rounded-xl bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all backdrop-blur-sm border border-red-500/50;
}
</style>