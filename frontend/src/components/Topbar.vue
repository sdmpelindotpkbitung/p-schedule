<template>
  <header
    class="bg-navy text-white h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-lg w-full"
  >
    <!-- Brand -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <img
        src="/images/logo.png"
        alt="Logo P-Schedule"
        class="w-8 h-8 rounded-lg object-contain shrink-0"
      />
      <div>
        <div class="font-display font-semibold text-sm leading-tight">
          P-Schedule
        </div>
        <div class="text-[10px] text-white/40 hidden sm:block">
          PT Pelindo Terminal Petikemas TPK Bitung
        </div>
      </div>
    </div>

    <!-- Nav + User (Menu Kanan) -->
    <!-- PERBAIKAN: ml-auto, min-w-0, dan pl-4 agar menu bisa digeser dengan sempurna tanpa terpotong -->
    <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto min-w-0 ml-auto pl-4">
      
      <!-- Nav tabs -->
      <nav
        class="flex bg-white/8 border border-white/10 rounded-lg p-0.5 gap-0.5 shrink-0"
      >
        <router-link
          to="/"
          class="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all shrink-0"
          :class="
            $route.name === 'Kalender'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white'
          "
        >
          Kalender
        </router-link>
        <router-link
          v-if="auth.isBigAdmin"
          to="/admin"
          class="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all shrink-0"
          :class="
            $route.name === 'Admin'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white'
          "
        >
          Admin
        </router-link>
        <router-link
          to="/kelola-jadwal"
          v-if="!auth.isBigAdmin"
          class="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all shrink-0"
          :class="
            $route.name === 'KelolaJadwal'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white'
          "
          >Kelola Jadwal</router-link
        >
        <router-link
          v-if="auth.isPic"
          to="/anggota-divisi"
          class="px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all shrink-0"
          :class="
            $route.name === 'AnggotaDivisi'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white'
          "
          >Anggota Divisi</router-link
        >
      </nav>

      <!-- User chip -->
      <div
        class="flex items-center gap-2 bg-white/8 border border-white/12 rounded-full pl-1.5 pr-1.5 sm:pr-3 py-1 shrink-0"
      >
        <div
          class="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
        >
          {{ auth.userInitial }}
        </div>
        <span class="text-xs hidden sm:block shrink-0">{{ auth.userName }}</span>
        <span v-if="auth.divisionName" class="text-[10px] text-white/50 hidden lg:block shrink-0">{{
          auth.divisionName
        }}</span>
        <span
          class="text-[10px] bg-white/15 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium hidden sm:block shrink-0"
        >
          {{ auth.userRole }}
        </span>
      </div>

      <!-- Logout -->
      <!-- PERBAIKAN: shrink-0 agar teks 'Keluar' tidak tergencet -->
      <button
        class="text-xs text-white/60 border border-white/15 px-3 py-1.5 rounded-lg hover:bg-white/8 hover:text-white transition shrink-0"
        @click="showLogoutConfirm = true"
      >
        Keluar
      </button>
    </div>

    <!-- Modal Konfirmasi Logout -->
    <transition name="fade">
      <div
        v-if="showLogoutConfirm"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
        @click.self="showLogoutConfirm = false"
      >
        <div class="w-full max-w-sm card overflow-hidden text-gray-800">
          <div class="px-6 py-5">
            <h2 class="font-display font-semibold text-navy">
              Konfirmasi Keluar
            </h2>
            <p class="mt-2 text-sm text-gray-500">
              Apakah Anda yakin ingin keluar dari aplikasi?
            </p>
          </div>
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5"
          >
            <button class="btn-secondary" @click="showLogoutConfirm = false">
              Tidak
            </button>
            <button class="btn-danger" @click="doLogout">Ya, Keluar</button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { ref } from "vue";

const auth = useAuthStore();
const router = useRouter();
const showLogoutConfirm = ref(false);

const doLogout = () => {
  auth.logout();
  router.push({ name: "Login" });
};
</script>
