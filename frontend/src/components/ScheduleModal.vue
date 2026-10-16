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
          class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          >
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
          <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <!-- Agenda -->
            <div>
              <label class="form-label"
                >Agenda / Nama Kegiatan
                <span class="text-danger">*</span></label
              >
              <input
                v-model="form.agenda"
                class="form-control"
                placeholder="Contoh: Rapat Koordinasi Bulanan"
              />
            </div>

            <!-- Ruangan -->
            <div>
              <label class="form-label"
                >Ruangan <span class="text-danger">*</span></label
              >
              <select v-model="form.room_id" class="form-control">
                <option value="" disabled>Pilih ruangan...</option>
                <option v-for="r in rooms" :key="r.id" :value="r.id">
                  {{ r.nama }}
                </option>
              </select>
            </div>

            <!-- Tanggal -->
            <div>
              <label class="form-label"
                >Tanggal <span class="text-danger">*</span></label
              >
              <input v-model="form.tanggal" type="date" class="form-control" />
            </div>

            <!-- Jam mulai & selesai -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="form-label"
                  >Jam Mulai <span class="text-danger">*</span></label
                >
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
                <label class="form-label"
                  >Jam Selesai <span class="text-danger">*</span></label
                >
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
              <label class="form-label"
                >Keterangan <span class="text-gray-300">(opsional)</span></label
              >
              <textarea
                v-model="form.keterangan"
                class="form-control resize-none"
                rows="2"
                placeholder="Informasi tambahan..."
              />
            </div>

            <!-- Validation error -->
            <transition name="fade">
              <div
                v-if="validationError"
                class="flex items-center gap-2 text-sm text-danger bg-danger-light px-4 py-2.5 rounded-lg border border-red-200"
              >
                <span>⚠</span> {{ validationError }}
              </div>
            </transition>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button
              class="btn-secondary"
              @click="$emit('update:modelValue', false)"
            >
              Batal
            </button>
            <button class="btn-primary" :disabled="loading" @click="handleSave">
              <svg
                v-if="loading"
                class="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              {{
                loading
                  ? "Menyimpan..."
                  : schedule
                    ? "Simpan Perubahan"
                    : "Tambahkan Jadwal"
              }}
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

const props = defineProps({
  modelValue: Boolean,
  schedule: Object, // null = tambah baru, ada isi = edit
  rooms: Array,
  defaultDate: String, // opsional: pre-fill tanggal
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

// ── Isi form saat edit ────────────────────────────────────────
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      validationError.value = "";
      if (props.schedule) {
        form.value = {
          agenda: props.schedule.agenda,
          room_id: props.schedule.room_id,
          tanggal: props.schedule.tanggal,
          jam_mulai: props.schedule.jam_mulai?.slice(0, 5) || "",
          jam_selesai: props.schedule.jam_selesai?.slice(0, 5) || "",
          keterangan: props.schedule.keterangan || "",
        };
      } else {
        form.value = emptyForm();
      }
    }
  },
);

// ── Simpan ────────────────────────────────────────────────────
const handleSave = async () => {
  validationError.value = "";

  // Validasi
  if (
    !form.value.agenda ||
    !form.value.room_id ||
    !form.value.tanggal ||
    !form.value.jam_mulai ||
    !form.value.jam_selesai
  ) {
    validationError.value = "Harap lengkapi semua kolom yang wajib diisi.";
    return;
  }
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    !timePattern.test(form.value.jam_mulai) ||
    !timePattern.test(form.value.jam_selesai)
  ) {
    validationError.value = "Gunakan format 24 jam HH:mm, contoh 08:30.";
    return;
  }
  if (form.value.jam_mulai >= form.value.jam_selesai) {
    validationError.value = "Jam selesai harus lebih besar dari jam mulai.";
    return;
  }

  loading.value = true;
  try {
    if (props.schedule) {
      await jadwalAPI.update(props.schedule.id, form.value);
    } else {
      await jadwalAPI.create(form.value);
    }
    emit("update:modelValue", false);
    emit("saved");
  } catch (err) {
    if (err.response?.status === 409) {
      // Bentrok → tutup modal, emit data konflik ke parent
      emit("update:modelValue", false);
      emit("conflict", {
        conflict: err.response.data.conflict,
        jam_mulai: form.value.jam_mulai,
        jam_selesai: form.value.jam_selesai,
      });
    } else {
      validationError.value =
        err.response?.data?.message || "Terjadi kesalahan. Coba lagi.";
    }
  } finally {
    loading.value = false;
  }
};

const formatTimeInput = (field, event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
  form.value[field] =
    digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};
</script>
