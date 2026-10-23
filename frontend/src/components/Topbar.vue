<template>
  <header class="shrink-0 glass-header px-4 sm:px-6 py-3 flex items-center justify-between z-50 shadow-sm border-b border-white/40 sticky top-0 w-full">
    
    <!-- ═══ KIRI: Brand & Logo ═══ -->
    <div class="flex items-center gap-3 shrink-0">
      <img src="/images/logo-pelindo.png" alt="Logo Pelindo" class="w-32 h-auto object-contain" />
      <span class="h-7 border-l-2 border-slate-300/80"></span>
      <h1 class="font-display font-bold text-navy text-sm tracking-wide uppercase drop-shadow-sm mt-0.5">
        P-Schedule
      </h1>
    </div>

    <!-- ═══ TENGAH: Menu Navigasi Desktop (Sesuai Role) ═══ -->
    <nav class="hidden md:flex items-center bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl p-1 shadow-sm shrink-0">
      <router-link 
        to="/kalender" 
        class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
        active-class="bg-navy/90 text-white shadow-md"
        :class="[$route.name === 'Kalender' ? '' : 'text-gray-700 hover:bg-white/60 hover:text-navy']"
      >
        Kalender
      </router-link>
      
      <router-link 
        v-if="auth.isBigAdmin"
        to="/admin" 
        class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
        active-class="bg-navy/90 text-white shadow-md"
        :class="[$route.name === 'Admin' ? '' : 'text-gray-700 hover:bg-white/60 hover:text-navy']"
      >
        Admin Panel
      </router-link>

      <router-link 
        v-if="!auth.isBigAdmin"
        to="/kelola-jadwal" 
        class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
        active-class="bg-navy/90 text-white shadow-md"
        :class="[$route.name === 'KelolaJadwal' ? '' : 'text-gray-700 hover:bg-white/60 hover:text-navy']"
      >
        Kelola Jadwal
      </router-link>

      <router-link 
        v-if="auth.isPic"
        to="/anggota-divisi" 
        class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
        active-class="bg-navy/90 text-white shadow-md"
        :class="[$route.name === 'AnggotaDivisi' ? '' : 'text-gray-700 hover:bg-white/60 hover:text-navy']"
      >
        Anggota Divisi
      </router-link>
    </nav>

    <!-- ═══ KANAN: Profil, Logout & Tombol Hamburger ═══ -->
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Info Profil -->
      <div class="flex items-center gap-2.5 bg-white/40 px-3 py-1.5 rounded-xl border border-white/50 shadow-sm">
        <div class="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shadow-md">
          {{ auth.userInitial }}
        </div>
        <div class="hidden sm:block">
          <div class="flex items-center gap-1.5">
            <p class="text-xs font-bold text-navy leading-none">{{ auth.userName }}</p>
            <span v-if="auth.divisionName" class="text-[9px] font-bold bg-white/60 text-navy px-1.5 py-0.5 rounded-md border border-white/80 uppercase">
              {{ auth.divisionName }}
            </span>
            <span class="text-[9px] font-bold bg-navy text-white px-1.5 py-0.5 rounded-md uppercase">
              {{ auth.userRole === 'big_admin' ? 'Admin' : (auth.userRole === 'pic' ? 'PIC' : 'Staff') }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Tombol Logout -->
      <button 
        @click="showLogoutConfirm = true" 
        class="w-9 h-9 hidden md:flex items-center justify-center rounded-xl bg-red-500/90 text-white hover:bg-red-600 transition shadow-sm border border-red-500/50" 
        title="Keluar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>

      <!-- Tombol Hamburger (Hanya Mobile) -->
      <button 
        @click="isMobileMenuOpen = !isMobileMenuOpen" 
        class="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/60 border border-white/80 text-navy shadow-sm focus:outline-none"
      >
        <svg v-if="!isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- ═══ DROPDOWN MENU MOBILE ═══ -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden absolute top-full left-0 w-full p-4 glass-header border-b border-white/40 shadow-lg">
        <nav class="flex flex-col gap-2">
          <router-link 
            to="/kalender" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2.5 rounded-lg text-sm font-bold text-center"
            active-class="bg-navy text-white"
            :class="[$route.name === 'Kalender' ? '' : 'bg-white/50 text-navy hover:bg-white/80']"
          >
            Kalender
          </router-link>
          
          <router-link 
            v-if="auth.isBigAdmin"
            to="/admin" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2.5 rounded-lg text-sm font-bold text-center"
            active-class="bg-navy text-white"
            :class="[$route.name === 'Admin' ? '' : 'bg-white/50 text-navy hover:bg-white/80']"
          >
            Admin Panel
          </router-link>

          <router-link 
            v-if="!auth.isBigAdmin"
            to="/kelola-jadwal" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2.5 rounded-lg text-sm font-bold text-center"
            active-class="bg-navy text-white"
            :class="[$route.name === 'KelolaJadwal' ? '' : 'bg-white/50 text-navy hover:bg-white/80']"
          >
            Kelola Jadwal
          </router-link>

          <router-link 
            v-if="auth.isPic"
            to="/anggota-divisi" 
            @click="isMobileMenuOpen = false"
            class="px-4 py-2.5 rounded-lg text-sm font-bold text-center"
            active-class="bg-navy text-white"
            :class="[$route.name === 'AnggotaDivisi' ? '' : 'bg-white/50 text-navy hover:bg-white/80']"
          >
            Anggota Divisi
          </router-link>

          <!-- Tombol Logout di Menu Mobile -->
          <button 
            @click="() => { showLogoutConfirm = true; isMobileMenuOpen = false; }"
            class="mt-2 px-4 py-2.5 rounded-lg text-sm font-bold text-center bg-red-500/90 text-white hover:bg-red-600"
          >
            Keluar Aplikasi
          </button>
        </nav>
      </div>
    </transition>

    <!-- ═══ MODAL KONFIRMASI LOGOUT (Tetap Sama) ═══ -->
    <transition name="fade">
      <div v-if="showLogoutConfirm" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm" @click.self="showLogoutConfirm = false">
        <div class="w-full max-w-sm glass-modal overflow-hidden text-gray-800">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-display font-bold text-navy">Konfirmasi Keluar</h2>
            <button class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition" @click="showLogoutConfirm = false">✕</button>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm font-medium text-gray-600 leading-relaxed">Apakah Anda yakin ingin keluar dari aplikasi?</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5">
            <button class="btn-secondary" @click="showLogoutConfirm = false">Batal</button>
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
const isMobileMenuOpen = ref(false);

const closeMenu = () => {
  isMobileMenuOpen.value = false;
};

const doLogout = () => {
  auth.logout();
  router.push({ name: "Login" });
};
</script>

<style scoped>
/* ── Efek Kaca untuk Header ── */
.glass-header {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* ── Transisi Modal ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.glass-modal {
  @apply bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-2xl;
}

/* ── Buttons Modal ── */
.btn-secondary {
  @apply font-bold px-6 py-2 rounded-xl bg-white/80 text-gray-700 shadow-sm hover:bg-white transition-all border border-gray-200 backdrop-blur-sm;
}
.btn-danger {
  @apply font-bold px-6 py-2 rounded-xl bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all backdrop-blur-sm border border-red-500/50;
}
</style>