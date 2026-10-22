<template>
  <!-- Backdrop -->
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/55 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <transition name="slide-up">
        <div
          v-if="modelValue"
          class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 class="font-display font-semibold text-navy text-base">
              {{ schedule ? "Edit Jadwal" : "Tambah Jadwal Baru" }}
            </h2>
            <button
              class="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              @click="$emit('update:modelValue', false)"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <!-- Agenda -->
            <div>
              <label class="form-label">Agenda / Nama Kegiatan <span class="text-danger">*</span></label>
              <input v-model="form.agenda" class="form-control" placeholder="Contoh: Rapat Koordinasi Bulanan" />
            </div>

            <!-- Ruangan -->
            <div>
              <label class="form-label">Ruangan <span class="text-danger">*</span></label>
              <select v-model="form.room_id" class="form-control">
                <option value="" disabled>Pilih ruangan...</option>
                <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.nama }}</option>
              </select>
            </div>

            <!-- Tanggal -->
            <div>
              <label class="form-label">Tanggal <span class="text-danger">*</span></label>
              <input v-model="form.tanggal" type="date" class="form-control" />
            </div>

            <!-- Jam mulai & selesai -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label">Jam Mulai <span class="text-danger">*</span></label>
                <input
                  v-model="form.jam_mulai"
                  type="text"
                  class="form-control"
                  inputmode="numeric"
                  maxlength="5"
                  placeholder="08:00"
                  autocomplete="off"
                  @input="formatTimeInput('jam_mulai', $event)"
                />
              </div>
              <div>
                <label class="form-label">Jam Selesai <span class="text-danger">*</span></label>
                <input
                  v-model="form.jam_selesai"
                  type="text"
                  class="form-control"
                  inputmode="numeric"
                  maxlength="5"
                  placeholder="17:00"
                  autocomplete="off"
                  @input="formatTimeInput('jam_selesai', $event)"
                />
              </div>
            </div>

            <!-- Keterangan -->
            <div>
              <label class="form-label">Keterangan <span class="text-gray-400 font-normal">(opsional)</span></label>
              <textarea v-model="form.keterangan" class="form-control resize-none" rows="2" placeholder="Informasi tambahan..."></textarea>
            </div>

            <!-- 📸 Foto Kegiatan (Input Baru) -->
            <div>
              <label class="form-label">Foto Kegiatan <span class="text-gray-400 font-normal">(opsional)</span></label>
              
              <!-- Input File (disembunyikan secara visual, diganti dengan tombol custom) -->
              <label class="cursor-pointer flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-400 transition group">
                <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                <span class="text-sm font-medium text-gray-500 group-hover:text-blue-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Pilih Gambar
                </span>
              </label>

              <!-- Image Preview -->
              <div v-if="previewUrl" class="mt-3 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <img :src="previewUrl" class="w-full h-full object-cover" alt="Preview" />
                <!-- Tombol hapus gambar -->
                <button 
                  @click="removePhoto" 
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500/90 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 hover:scale-110 transition opacity-0 group-hover:opacity-100"
                  title="Hapus Foto"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- 📢 Checkbox Pengingat Penting -->
            <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_reminder" 
                v-model="form.is_reminder" 
                class="w-5 h-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500 cursor-pointer" 
              />
              <label for="is_reminder" class="form-label !mb-0 cursor-pointer font-bold text-yellow-800">
                Jadikan Pengingat Penting (Muncul di Running Text TV)
              </label>
            </div>

            <!-- Validation error -->
            <transition name="fade">
              <div v-if="validationError" class="flex items-center gap-2 text-sm text-danger bg-danger-light px-4 py-2.5 rounded-lg border border-red-200">
                <span>⚠</span> {{ validationError }}
              </div>
            </transition>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 shrink-0 bg-gray-50/50">
            <button class="btn-secondary" @click="$emit('update:modelValue', false)">Batal</button>
            <button class="btn-primary" :disabled="loading" @click="handleSave">
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {{ loading ? "Menyimpan..." : schedule ? "Simpan Perubahan" : "Tambahkan Jadwal" }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";
import { jadwalAPI } from "@/services/api";
import axios from "axios";

const props = defineProps({
  modelValue: Boolean,
  schedule: Object,
  rooms: Array,
  defaultDate: String,
});

const emit = defineEmits(["update:modelValue", "saved", "conflict"]);

// ── Form state ────────────────────────────────────────────────
const emptyForm = () => ({
  agenda: "",
  room_id: "",
  tanggal: props.defaultDate || "",
  jam_mulai: "",
  jam_selesai: "",
  keterangan: "",
});

const form = ref(emptyForm());
const loading = ref(false);
const validationError = ref("");

// ── State untuk File Foto ─────────────────────────────────────
const fotoFile = ref(null);
const previewUrl = ref("");
const isFotoRemoved = ref(false);

// ── Handle Upload Foto ────────────────────────────────────────
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      validationError.value = "Ukuran gambar terlalu besar. Maksimal 5MB.";
      return;
    }
    fotoFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
    isFotoRemoved.value = false;
    validationError.value = "";
  }
};

const removePhoto = () => {
  fotoFile.value = null;
  previewUrl.value = "";
  isFotoRemoved.value = true;
};

// ── Isi form saat edit ────────────────────────────────────────
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      validationError.value = "";
      fotoFile.value = null;
      previewUrl.value = "";
      isFotoRemoved.value = false;

      if (props.schedule) {
        form.value.is_reminder = props.schedule.is_reminder === true || props.schedule.is_reminder === 'true';
        form.value = {
          agenda: props.schedule.agenda,
          room_id: props.schedule.room_id,
          tanggal: props.schedule.tanggal,
          jam_mulai: props.schedule.jam_mulai?.slice(0, 5) || "",
          jam_selesai: props.schedule.jam_selesai?.slice(0, 5) || "",
          keterangan: props.schedule.keterangan || "",
        };
        if (props.schedule.foto) {
          previewUrl.value = props.schedule.foto;
        }
      } else {
        form.value = emptyForm();
      }
    }
  }
);

// ── Simpan ────────────────────────────────────────────────────
const handleSave = async () => {
  validationError.value = "";

  if (!form.value.agenda || !form.value.room_id || !form.value.tanggal || !form.value.jam_mulai || !form.value.jam_selesai) {
    validationError.value = "Harap lengkapi semua kolom yang wajib diisi.";
    return;
  }
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(form.value.jam_mulai) || !timePattern.test(form.value.jam_selesai)) {
    validationError.value = "Gunakan format 24 jam HH:mm, contoh 08:30.";
    return;
  }
  if (form.value.jam_mulai >= form.value.jam_selesai) {
    validationError.value = "Jam selesai harus lebih besar dari jam mulai.";
    return;
  }

  loading.value = true;
  
  const formData = new FormData();
  formData.append("agenda", form.value.agenda);
  formData.append("room_id", form.value.room_id);
  formData.append("tanggal", form.value.tanggal);
  formData.append("jam_mulai", form.value.jam_mulai);
  formData.append("jam_selesai", form.value.jam_selesai);
  formData.append("is_reminder", form.value.is_reminder ? "true" : "false");
  if (form.value.keterangan) formData.append("keterangan", form.value.keterangan);

  if (fotoFile.value) {
    formData.append("foto", fotoFile.value);
  } else if (isFotoRemoved.value) {
    formData.append("remove_foto", "true");
  }

    const emptyForm = () => ({
    agenda: "", room_id: "", tanggal: props.defaultDate || "", jam_mulai: "", jam_selesai: "", keterangan: "",
    is_reminder: false, // 👈 TAMBAHAN
  });

  // 2. ── PERUBAHAN UTAMA DI SINI ──
  try {
    loading.value = true;
    
    // Kembali menggunakan jadwalAPI bawaan agar Token otomatis terkirim
    if (props.schedule) {
      await jadwalAPI.update(props.schedule.id, formData);
    } else {
      await jadwalAPI.create(formData);
    }
    
    emit("update:modelValue", false);
    emit("saved");
  } catch (err) {
    console.error("Error simpan jadwal:", err);
    if (err.response?.status === 409) {
      emit("update:modelValue", false);
      emit("conflict", {
        conflict: err.response.data.conflict,
        jam_mulai: form.value.jam_mulai,
        jam_selesai: form.value.jam_selesai,
      });
    } else {
      validationError.value = err.response?.data?.message || "Gagal menyimpan. Cek terminal backend.";
    }
  } finally {
    loading.value = false;
  }
};

const formatTimeInput = (field, event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
  form.value[field] = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15, 42, 74, 0.15); border-radius: 10px; }
</style>