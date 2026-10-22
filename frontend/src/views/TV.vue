<template>
  <div class="tv-wrapper" :class="{ 'idle-mode': isIdleMode }">
    
    <!-- ═══ HEADER ═══ -->
    <header class="tv-header-modern glass-effect relative z-40 transition-all duration-700">
      <div class="header-time-container">
        <div class="tv-time transition-colors duration-700">{{ jam }}</div>
        <div class="tv-date-modern transition-colors duration-700">{{ hariHariIni }}, {{ tanggalHariIni }}</div>
      </div>
      
      <div class="header-brand-container">
        <div class="text-right">
          <h1 class="brand-title transition-colors duration-700">PT Pelindo Terminal Petikemas</h1>
          <p class="brand-subtitle transition-colors duration-700">TPK Bitung</p>
        </div>
        <div class="brand-logo-wrapper transition-all duration-700">
          <img src="/images/logo.png" alt="Logo" class="brand-logo" />
        </div>
      </div>
    </header>

    <!-- ═══ BODY (TAMPILAN NORMAL: ADA KEGIATAN SEDANG BERLANGSUNG) ═══ -->
    <main class="tv-body relative z-10">
      
      <!-- KOLOM KIRI: SEDANG BERLANGSUNG -->
      <section class="tv-main glass-panel flex flex-col">
        <div class="section-header shrink-0">
          <div class="flex items-center gap-3">
            <span class="live-indicator"></span>
            <h2 class="section-title text-blue-800">SEDANG BERLANGSUNG</h2>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4 pb-4">
          <template v-if="activeEvents.length > 0">
            <div
              v-for="evt in activeEvents"
              :key="'active-'+evt.id"
              class="event-card-modern is-active"
            >
              <!-- 📸 TAMPILKAN GAMBAR HANYA SAAT SEDANG BERLANGSUNG -->
              <div v-if="evt.foto" class="w-full h-48 sm:h-64 mb-4 rounded-xl overflow-hidden shadow-inner border border-white/20">
                <img :src="getImageUrl(evt.foto)" class="w-full h-full object-cover" alt="Banner Kegiatan" />
              </div>

              <div class="card-time-badge">{{ evt.jam_mulai }} - {{ evt.jam_selesai }}</div>
              <h3 class="event-agenda-text">{{ evt.agenda }}</h3>
              <div class="event-details">
                <div class="detail-row"><span class="icon">🏢</span><span class="text">{{ evt.nama_ruangan }}</span></div>
                <div class="detail-row"><span class="icon">👤</span><span class="text">{{ evt.nama_penginput }}</span></div>
              </div>
              <div class="status-overlay">SEDANG BERLANGSUNG</div>
            </div>

            <!-- JADWAL SELANJUTNYA HARI INI (TIDAK ADA GAMBAR) -->
            <div v-if="upcomingTodayEvents.length > 0" class="mt-4 mb-2 border-t border-gray-200/60 pt-4">
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Selanjutnya Hari Ini:</h3>
              <div
                v-for="evt in upcomingTodayEvents"
                :key="'upcoming-'+evt.id"
                class="event-card-modern bg-white/60 shadow-sm mb-3"
              >
                <div class="card-time-badge !text-sm !py-1 !px-3">{{ evt.jam_mulai }} - {{ evt.jam_selesai }}</div>
                <h3 class="event-agenda-text !text-lg !mb-2">{{ evt.agenda }}</h3>
                <div class="event-details !bg-white/50 !p-2 !gap-1">
                  <div class="detail-row !text-sm"><span class="icon">🏢</span><span class="text">{{ evt.nama_ruangan }}</span></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- KOLOM KANAN: AKAN DATANG BESOK/LUSA (TIDAK ADA GAMBAR) -->
      <section class="tv-sidebar glass-panel">
        <div class="section-header border-b-0 pb-0 mb-4 shrink-0">
          <div class="flex items-center gap-3">
            <span class="upcoming-indicator"></span>
            <h2 class="section-title text-gray-700">AKAN DATANG</h2>
          </div>
        </div>

        <div v-if="akanDatang.length === 0" class="empty-upcoming">
          <p>Belum ada jadwal untuk<br>3 hari ke depan.</p>
        </div>

        <div v-else class="upcoming-list custom-scrollbar">
          <div v-for="evt in akanDatang" :key="'bg-'+evt.id" class="upcoming-card">
            <div class="upcoming-date-badge">{{ formatTanggal(evt.tanggal) }}</div>
            <h4 class="upcoming-agenda">{{ evt.agenda }}</h4>
            <div class="upcoming-meta-list">
              <span>⏰ {{ evt.jam_mulai }} - {{ evt.jam_selesai }}</span>
              <span>🏢 {{ evt.nama_ruangan }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ==========================================
         MODE IDLE (WAKTU KOSONG / ISTIRAHAT - 3 KOLOM)
         ========================================== -->
    <transition name="fade-overlay">
      <div v-if="isIdleMode" class="fixed inset-0 z-30 idle-bg-overlay"></div>
    </transition>

    <transition name="fade-overlay">
      <div v-if="isIdleMode" class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div class="idle-content-wrapper pointer-events-auto">
          
          <!-- KOLOM 1: SLIDESHOW GAMBAR -->
          <div class="idle-slideshow-box">
            <transition-group name="slide-right" tag="div" class="slideshow-wrapper">
              <img v-if="slides.length > 0" :src="getImageUrl(slides[currentSlideIndex]?.url)" :key="slides[currentSlideIndex]?.id + '-' + tick" class="idle-slide-image" />
              <div v-if="slides.length === 0" key="no-image" class="empty-slide-state"><span class="text-6xl mb-4">🖼️</span><p class="text-white/70 font-medium">Belum ada foto slide</p></div>
            </transition-group>
            <div class="idle-welcome-text"><h2>PT Pelindo Terminal Petikemas</h2><p>TPK Bitung</p></div>
          </div>

          <!-- KOLOM 2: SELESAI HARI INI -->
          <div class="idle-list-column" v-if="doneEvents.length > 0">
            <div class="idle-list-header"><span class="indicator-glow bg-green-400 shadow-[0_0_12px_#4ade80]"></span><h3>SELESAI HARI INI</h3></div>
            <div class="idle-scroll-viewport">
              <div class="idle-scroll-content scrolling-up">
                
                <div v-for="evt in doneEvents" :key="'done-'+evt.id" class="idle-card done-card">
                  <!-- 📸 GAMBAR MUNCUL DI KEGIATAN SELESAI -->
                  <div v-if="evt.foto" class="w-full h-32 mb-3 rounded-lg overflow-hidden border border-white/20">
                    <img :src="getImageUrl(evt.foto)" class="w-full h-full object-cover" />
                  </div>
                  
                  <div class="idle-date-badge text-green-400">SELESAI</div>
                  <h4 class="idle-agenda">{{ evt.agenda }}</h4>
                  <div class="idle-meta"><span>⏰ {{ evt.jam_mulai }} - {{ evt.jam_selesai }}</span><span>🏢 {{ evt.nama_ruangan }}</span></div>
                </div>

              </div>
            </div>
          </div>

          <!-- KOLOM 3: KEGIATAN BERIKUTNYA & JADWAL MENDATANG (TIDAK ADA GAMBAR) -->
          <div class="idle-list-column">
            <div class="idle-list-header"><span class="indicator-glow bg-sky-400 shadow-[0_0_12px_#38bdf8]"></span><h3>JADWAL MENDATANG</h3></div>
            <div v-if="allUpcomingEvents.length === 0" class="idle-empty-upcoming"><p>Belum ada jadwal mendatang.</p></div>
            <div v-else class="idle-scroll-viewport">
              <div class="idle-scroll-content scrolling-up" style="animation-delay: -8s;">
                
                <div v-for="evt in allUpcomingEvents" :key="'allup-'+evt.id" class="idle-card">
                  <!-- Tidak ada gambar di sini -->
                  <div class="idle-date-badge text-sky-300">
                    {{ isToday(evt.tanggal) ? 'SELANJUTNYA HARI INI' : formatTanggal(evt.tanggal) }}
                  </div>
                  <h4 class="idle-agenda">{{ evt.agenda }}</h4>
                  <div class="idle-meta"><span>⏰ {{ evt.jam_mulai }} - {{ evt.jam_selesai }}</span><span>🏢 {{ evt.nama_ruangan }}</span></div>
                </div>

              </div>
            </div>
          </div>

        </div> 
      </div>
    </transition>

    <!-- ═══ RUNNING TEXT PENGINGAT (SELALU MUNCUL) ═══ -->
    <div class="running-text-wrapper relative z-50">
      <div class="running-text-label">PENGUMUMAN</div>
      <div class="running-text-content">
        <div class="running-text-track" v-if="reminderEvents.length > 0">
          <span v-for="(evt, idx) in reminderEvents" :key="'rem-'+evt.id" class="reminder-item">
            <span class="text-yellow-400 mr-2">★</span> 
            <span class="font-bold text-white">{{ evt.agenda }}</span> 
            <span class="text-gray-300 ml-1">({{ formatTanggal(evt.tanggal) }}, {{ evt.jam_mulai }} - {{ evt.jam_selesai }})</span>
            <span class="mx-8 text-white/30">•</span>
          </span>
        </div>
        <div class="running-text-track" v-else>
          <span class="reminder-item text-white/70">Tidak ada pengumuman penting saat ini.</span>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <footer class="tv-footer-modern relative z-50 transition-colors duration-700">
      <div class="footer-dot animate-pulse"></div>
      <p>Live Sync Terhubung • Diperbarui otomatis setiap 1 menit</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";

// Data
const hariIni = ref([]);
const akanDatang = ref([]);
const slides = ref([]);
const currentSlideIndex = ref(0);
const loading = ref(true);
const jam = ref("");
const nowHhmm = ref(""); 
const todayDateStr = ref("");
const tick = ref(0);

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const now = new Date();
const hariHariIni = ref(HARI[now.getDay()]);
const tanggalHariIni = ref(`${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`);

const updateJam = () => {
  const d = new Date();
  jam.value = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  nowHhmm.value = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  hariHariIni.value = HARI[d.getDay()];
  tanggalHariIni.value = `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  todayDateStr.value = `${yyyy}-${mm}-${dd}`;
};

// ── FUNGSI BARU: PENYELAMAT PATH GAMBAR ──
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  // Ambil baseURL dari axios (biasanya http://localhost:3000 jika saat dev)
  // Jika axios.defaults.baseURL kosong, kita pakaikan fallback
  const baseUrl = axios.defaults.baseURL || "http://localhost:3000";
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const fetchData = async () => {
  try {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const [r1, r2, r3] = await Promise.all([
      axios.get("/api/jadwal/tv/hari-ini"),
      axios.get("/api/jadwal/tv/akan-datang"),
      axios.get("/api/tv/slides").catch(() => ({ data: [] }))
    ]);

    const combinedJadwal = [...r1.data, ...r2.data];

    hariIni.value = combinedJadwal
      .filter(evt => evt.tanggal === todayStr)
      .sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

    akanDatang.value = combinedJadwal
      .filter(evt => evt.tanggal > todayStr)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal) || a.jam_mulai.localeCompare(b.jam_mulai));

    slides.value = r3.data;
  } catch (e) {
    console.error("TV fetch error:", e);
  } finally {
    loading.value = false;
  }
};

const isDone = (evt) => nowHhmm.value >= evt.jam_selesai;
const isActive = (evt) => nowHhmm.value >= evt.jam_mulai && nowHhmm.value < evt.jam_selesai;
const isToday = (dateStr) => dateStr === todayDateStr.value;

// ── PENGELOMPOKAN JADWAL ──
// Memfilter jadwal mana saja yang di-centang sebagai pengingat
const reminderEvents = computed(() => {
  const allSchedules = [...hariIni.value, ...akanDatang.value];
  return allSchedules.filter(evt => evt.is_reminder === true || evt.is_reminder === 'true');
});
const activeEvents = computed(() => hariIni.value.filter(evt => isActive(evt)));
const doneEvents = computed(() => hariIni.value.filter(evt => isDone(evt)));
const upcomingTodayEvents = computed(() => hariIni.value.filter(evt => !isDone(evt) && !isActive(evt)));

const allUpcomingEvents = computed(() => [...upcomingTodayEvents.value, ...akanDatang.value]);

const isIdleMode = computed(() => {
  if (loading.value) return false;
  return activeEvents.value.length === 0;
});

const formatTanggal = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return `${HARI[dt.getDay()]}, ${parseInt(d)} ${BULAN[parseInt(m) - 1]}`;
};

let jamInterval, fetchInterval, slideInterval;

const startSlideshow = () => {
  slideInterval = setInterval(() => {
    if (slides.value.length > 0) {
      currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
      tick.value++; 
    }
  }, 5000); 
};

onMounted(() => {
  updateJam();
  fetchData().then(() => startSlideshow());
  jamInterval = setInterval(updateJam, 1000);
  fetchInterval = setInterval(fetchData, 60000); 
});

onUnmounted(() => {
  clearInterval(jamInterval);
  clearInterval(fetchInterval);
  clearInterval(slideInterval);
});
</script>

<style scoped>
/* ── Root & Background ── */
.tv-wrapper { height: 100vh; max-height: 100vh; width: 100vw; background: transparent !important; display: flex; flex-direction: column; font-family: "Inter", "Segoe UI", sans-serif; overflow: hidden; position: relative;}
.glass-effect { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 255, 255, 0.4); }
.glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05); border-radius: 24px; }

/* ── HEADER NORMAL ── */
.tv-header-modern { display: flex; justify-content: space-between; align-items: center; padding: 16px 40px; }
.header-time-container { display: flex; flex-direction: column; }
.tv-time { font-size: 56px; font-weight: 800; color: #0f2a4a; line-height: 1; font-family: "Consolas", monospace; text-shadow: 0 2px 10px rgba(255,255,255,0.6); }
.tv-date-modern { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 4px; text-transform: uppercase; }
.header-brand-container { display: flex; align-items: center; gap: 16px; }
.brand-title { font-size: 22px; font-weight: 800; color: #0f2a4a; line-height: 1.2; }
.brand-subtitle { font-size: 14px; color: #334155; font-weight: 600; }
.brand-logo-wrapper { background: white; padding: 8px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
.brand-logo { width: 50px; height: 50px; object-fit: contain; }

/* ── PERUBAHAN HEADER SAAT MODE IDLE AKTIF ── */
.idle-mode .tv-header-modern { background: transparent !important; border-bottom: 1px solid rgba(255, 255, 255, 0.1); box-shadow: none; }
.idle-mode .tv-time { color: white !important; text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8); }
.idle-mode .tv-date-modern { color: #e2e8f0 !important; }
.idle-mode .brand-title { color: white !important; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8); }
.idle-mode .brand-subtitle { color: #cbd5e1 !important; }
.idle-mode .brand-logo-wrapper { background: rgba(255, 255, 255, 0.95) !important; }

/* ── BODY ── */
.tv-body { flex: 1; padding: 24px 40px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 380px); gap: 24px; position: relative; min-height: 0; overflow: hidden; }
.tv-main, .tv-sidebar { display: flex; flex-direction: column; padding: 24px 30px; min-height: 0; overflow: hidden; }

/* ── BACKGROUND KIRI & KANAN (NORMAL) ── */
.section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed rgba(15, 42, 74, 0.15); padding-bottom: 16px; margin-bottom: 20px; }
.section-title { font-size: 20px; font-weight: 800; color: #0f2a4a; letter-spacing: 0.05em; text-transform: uppercase; }
.live-indicator { width: 14px; height: 14px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); animation: pulse-red 2s infinite; }
.upcoming-indicator { width: 14px; height: 14px; background: #f59e0b; border-radius: 50%; }
.badge-count { background: #0f2a4a; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; }
@keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; flex: 1; }
.upcoming-list { display: flex; flex-direction: column; gap: 16px; flex: 1; overflow-y: auto; padding-right: 8px; }
.event-card-modern { background: white; border-radius: 20px; padding: 24px; position: relative; border: 1px solid #f1f5f9; box-shadow: 0 8px 20px rgba(0,0,0,0.04); display: flex; flex-direction: column; transition: all 0.5s ease; }
.card-time-badge { display: inline-block; background: #f1f5f9; color: #0f2a4a; font-weight: 800; font-size: 18px; padding: 6px 14px; border-radius: 12px; margin-bottom: 12px; width: fit-content; }
.event-agenda-text { font-size: 22px; font-weight: 800; color: #1e293b; line-height: 1.3; margin-bottom: 16px; }
.event-details { display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 12px 16px; border-radius: 12px; }
.detail-row { display: flex; align-items: center; gap: 10px; font-size: 15px; color: #475569; font-weight: 600; }

.event-card-modern.is-active { background: linear-gradient(135deg, #0f2a4a 0%, #1e6fbf 100%); color: white; transform: scale(1.01); border: none; box-shadow: 0 15px 30px rgba(15,42,74,0.3); }
.is-active .card-time-badge { background: rgba(255,255,255,0.2); color: white; }
.is-active .event-agenda-text, .is-active .detail-row { color: white; }
.is-active .event-details { background: rgba(0,0,0,0.15); }
.status-overlay { position: absolute; top: 0; right: 0; background: #ef4444; color: white; font-size: 11px; font-weight: 800; padding: 6px 20px; border-bottom-left-radius: 16px; animation: pulse-opacity 2s infinite; }
@keyframes pulse-opacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

.upcoming-card { background: white; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; border-left: 5px solid #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.upcoming-date-badge { font-size: 12px; font-weight: 800; color: #d97706; text-transform: uppercase; margin-bottom: 8px; }
.upcoming-agenda { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 6px; line-height: 1.3; }
.upcoming-meta-list { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #475569; font-weight: 600; }
.empty-upcoming { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #475569; font-weight: 600; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(15, 42, 74, 0.1); border-radius: 10px; }

/* =======================================================
   POP-UP IKLAN OVERLAY (HITAM PEKAT & 3 KOLOM)
   ======================================================= */
.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 1.5s ease; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }

.idle-bg-overlay { background: rgba(10, 20, 35, 0.95); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }

.idle-content-wrapper { display: flex; width: 95%; max-width: 1700px; height: 75vh; margin-top: 80px; gap: 32px; align-items: stretch; }

/* KOLOM 1: SLIDESHOW (KIRI) */
.idle-slideshow-box { flex: 0 0 45%; position: relative; background: rgba(0, 0, 0, 0.8); border-radius: 28px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255, 255, 255, 0.2); }
.slideshow-wrapper { width: 100%; height: 100%; position: relative; }
.idle-slide-image { width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 1.2s ease; }
.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to { transform: translateX(100%); opacity: 0; }
.slide-right-enter-to, .slide-right-leave-from { transform: translateX(0); opacity: 1; }

.empty-slide-state { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.idle-welcome-text { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); color: white; z-index: 2; }
.idle-welcome-text h2 { font-size: 32px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.idle-welcome-text p { font-size: 18px; font-weight: 500; color: #93c5fd; }

/* KOLOM 2 & 3: JADWAL (TENGAH DAN KANAN) */
.idle-list-column { flex: 1; min-width: 0; display: flex; flex-direction: column; background: transparent; padding: 10px 0; }
.idle-list-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.indicator-glow { width: 12px; height: 12px; border-radius: 50%; }
.idle-list-header h3 { color: white; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-shadow: 0 2px 5px rgba(0,0,0,0.8); }

.idle-scroll-viewport { flex: 1; overflow: hidden; position: relative; mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent); }
.idle-scroll-content { display: flex; flex-direction: column; gap: 16px; position: absolute; width: 100%; padding-right: 10px;}

.scrolling-up { animation: scroll-up 50s linear infinite; }
@keyframes scroll-up { 0% { transform: translateY(80vh); } 100% { transform: translateY(-100%); } }

.idle-card { background: rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 16px; border-left: 4px solid #38bdf8; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.idle-card.done-card { border-left-color: #4ade80; background: rgba(255, 255, 255, 0.1); } 
.idle-date-badge { font-size: 12px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;}
.idle-agenda { color: white; font-size: 16px; font-weight: 700; margin-bottom: 8px; line-height: 1.3;}
.idle-meta { display: flex; flex-direction: column; gap: 4px; color: #cbd5e1; font-size: 13px; font-weight: 500;}
.idle-empty-upcoming { color: #94a3b8; font-weight: 600; text-align: center; margin-top: 40px;}

/* ── FOOTER ── */
.tv-footer-modern { background: rgba(255, 255, 255, 0.8); color: #0f2a4a; padding: 12px 40px; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; border-top: 1px solid rgba(15,42,74,0.1); }
.idle-mode .tv-footer-modern { background: rgba(0, 0, 0, 0.8); color: white; border-top: 1px solid rgba(255,255,255,0.1); }
.footer-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }

/* =======================================================
   RUNNING TEXT (TEKS BERJALAN)
   ======================================================= */
.running-text-wrapper {
  background: #0f2a4a;
  display: flex;
  align-items: center;
  height: 45px;
  border-top: 3px solid #f59e0b; /* Garis kuning orange */
  overflow: hidden;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.2);
}
.running-text-label {
  background: #f59e0b;
  color: #0f2a4a;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.1em;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 10;
  box-shadow: 4px 0 10px rgba(0,0,0,0.4);
}
.running-text-content {
  flex: 1;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}
.running-text-track {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%; /* Mulai dari luar layar kanan */
  animation: scroll-left 25s linear infinite; /* Kecepatan jalan (ubah 25s jadi lebih kecil jika ingin lebih cepat) */
}
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
.reminder-item {
  font-size: 16px;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
}
</style>