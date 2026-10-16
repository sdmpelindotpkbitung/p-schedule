<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-navy-mid px-4"
  >
    <div class="w-full max-w-sm">
      <!-- Card -->
      <div class="card p-10">
        <!-- Logo -->
        <img
          src="/images/logo.png"
          alt="Logo P-Schedule"
          class="w-8 h-8 rounded-lg object-contain shrink-0 mb-5"
        />

        <h1 class="font-display text-xl font-semibold text-navy mb-1">
          Selamat Datang
        </h1>
        <p class="text-xs text-gray-400 mb-7">
          Sistem Penjadwalan - PT Pelindo Petikemas TPK Bitung
        </p>

        <!-- Error -->
        <transition name="fade">
          <div
            v-if="error"
            class="flex items-start gap-2.5 bg-danger-light border-l-4 border-danger rounded-lg px-4 py-3 mb-5 text-sm text-danger"
          >
            <span class="mt-0.5 shrink-0">⚠</span>
            <span>{{ error }}</span>
          </div>
        </transition>

        <!-- Form -->
        <div class="space-y-4">
          <div>
            <label class="form-label">Username</label>
            <input
              v-model="form.username"
              class="form-control"
              placeholder="Masukkan username"
              autocomplete="username"
              @keyup.enter="doLogin"
            />
          </div>
          <div>
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="Masukkan password"
              autocomplete="current-password"
              @keyup.enter="doLogin"
            />
          </div>
        </div>

        <button
          class="btn-primary w-full justify-center mt-6 py-2.5 text-base"
          :disabled="loading"
          @click="doLogin"
        >
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
          <span>{{ loading ? "Memproses..." : "Masuk" }}</span>
        </button>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-white/30 mt-6">
        PT Pelindo Petikemas TPK Bitung &copy; {{ new Date().getFullYear() }}
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
