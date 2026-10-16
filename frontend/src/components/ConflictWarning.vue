<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[300] flex items-center justify-center p-5 bg-navy/60 backdrop-blur-sm">
      <transition name="slide-up">
        <div v-if="modelValue" class="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

          <!-- Header merah -->
          <div class="bg-gradient-to-br from-red-900 to-danger px-7 pt-7 pb-6 text-center">
            <div class="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
            <h2 class="font-display font-semibold text-white text-lg mb-1">Jadwal Bentrok!</h2>
            <p class="text-white/70 text-sm">Ruangan sudah digunakan pada waktu tersebut</p>
          </div>

          <!-- Body -->
          <div class="px-7 py-6">

            <!-- Detail konflik -->
            <div class="bg-danger-light border border-red-200 rounded-xl p-4 mb-4 space-y-2">
              <div class="flex items-start gap-2.5 text-sm text-danger">
                <span class="shrink-0 mt-0.5">🏢</span>
                <span><strong>{{ conflict?.nama_ruangan }}</strong> sudah dipesan</span>
              </div>
              <div class="flex items-start gap-2.5 text-sm text-danger">
                <span class="shrink-0 mt-0.5">⏰</span>
                <span>
                  Waktu <strong>{{ requestedTime }}</strong> bertabrakan dengan jadwal berikut:
                </span>
              </div>
            </div>

            <!-- Jadwal konflik -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p class="text-[10px] text-gray-400 font-medium tracking-wider mb-1.5">JADWAL YANG KONFLIK</p>
              <p class="font-semibold text-gray-800 text-sm mb-1.5">{{ conflict?.agenda }}</p>
              <p class="text-xs text-gray-500">
                🕐 {{ conflict?.jam_mulai }} – {{ conflict?.jam_selesai }}
                &nbsp;·&nbsp;
                👤 {{ conflict?.nama_penginput }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-7 pb-6 flex gap-3 justify-end">
            <button class="btn-secondary" @click="$emit('update:modelValue', false)">
              Ubah Jadwal
            </button>
            <button class="btn-danger" @click="$emit('update:modelValue', false)">
              Mengerti
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,           // v-model
  conflict:   Object,            // data jadwal yang konflik dari API
  jamMulai:   String,
  jamSelesai: String,
})
defineEmits(['update:modelValue'])

const requestedTime = computed(() =>
  props.jamMulai && props.jamSelesai
    ? `${props.jamMulai} – ${props.jamSelesai}`
    : '-'
)
</script>
