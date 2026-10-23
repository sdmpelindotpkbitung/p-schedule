<template>
  <div class="min-h-screen flex items-center justify-center bg-transparent px-4 fade-in">
    <div class="w-full max-w-sm">
      <!-- Glassmorphism Card -->
      <div class="glass-card p-10">
        <!-- Logo -->
        <div class="flex flex-col items-center justify-center mb-6">
          <img
            src="/images/logo-pelindo.png"
            alt="Logo Pelindo"
            class="w-48 h-auto object-contain shrink-0"
          />
        </div>

        <div class="text-center mb-8">
          <h1 class="font-display text-2xl font-bold text-navy mb-1 drop-shadow-sm">
            Selamat Datang
          </h1>
          <p class="text-xs font-medium text-gray-600">
            Sistem Penjadwalan - PT Pelindo Terminal Petikemas TPK Bitung
          </p>
        </div>

        <!-- Error -->
        <transition name="fade">
          <div
            v-if="error"
            class="flex items-start gap-2.5 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm font-bold text-red-600 shadow-sm"
          >
            <span class="mt-0.5 shrink-0">⚠</span>
            <span>{{ error }}</span>
          </div>
        </transition>

        <!-- Form menggunakan @submit.prevent agar halaman tidak refresh -->
        <form @submit.prevent="doLogin">
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Username</label>
              <input
                v-model="form.username"
                class="glass-input"
                placeholder="Masukkan username"
                autocomplete="username"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="glass-input"
                placeholder="Masukkan password"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center mt-8 py-3 text-base"
            :disabled="loading"
          >
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5 mr-2"
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
            <span>{{ loading ? "Memproses..." : "Masuk" }}</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs font-medium text-white/70 drop-shadow-md mt-8">
        PT Pelindo Terminal Petikemas TPK Bitung X UMGO & POLI &copy; {{ new Date().getFullYear() }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = ref({ username: "", password: "" });
const loading = ref(false);
const error = ref("");

const doLogin = async () => {
  error.value = "";
  if (!form.value.username || !form.value.password) {
    error.value = "Username dan password wajib diisi.";
    return;
  }
  loading.value = true;
  try {
    await auth.login(form.value.username, form.value.password);
    router.push({ name: "Kalender" });
  } catch (err) {
    error.value =
      err.response?.data?.message || "Terjadi kesalahan. Coba lagi.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ── Transisi ── */
.fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Glassmorphism ── */
.glass-card {
  @apply bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_15px_40px_rgb(0,0,0,0.2)] rounded-3xl relative overflow-hidden;
}

/* Sedikit efek pendaran di ujung kartu */
.glass-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  animation: shine 6s infinite;
}
@keyframes shine {
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
}

/* ── Input & Buttons ── */
.glass-input {
  @apply bg-white/60 border border-white/50 text-gray-900 font-medium rounded-xl focus:ring-2 focus:ring-navy/50 focus:border-navy focus:bg-white block w-full p-3.5 shadow-inner transition-all;
}

.btn-primary {
  @apply font-bold rounded-xl bg-navy/90 text-white shadow-lg shadow-navy/30 hover:bg-navy hover:scale-[1.02] active:scale-95 transition-all backdrop-blur-sm border border-navy/50;
}
</style>