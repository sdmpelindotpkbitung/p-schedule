<template>
  <div class="tv-wrap">
    <!-- ═══ HEADER ═══ -->
    <header class="tv-header">
      <div class="tv-brand">
        <img
          src="/images/logo.png"
          alt="Logo P-Schedule"
          class="w-12 h-12 rounded-lg object-contain shrink-0"
        />
        <div>
          <div class="tv-brand-title">PT Pelindo Petikemas</div>
          <div class="tv-brand-sub">TPK Bitung</div>
        </div>
      </div>

      <div class="tv-date-block">
        <div class="tv-date">{{ tanggalHariIni }}</div>
        <div class="tv-day">{{ hariHariIni }}</div>
      </div>

      <div class="tv-clock">{{ jam }}</div>
    </header>

    <!-- ═══ BODY ═══ -->
    <div class="tv-body">
      <!-- Kolom kiri: Kegiatan Hari Ini -->
      <div class="tv-main">
        <div class="tv-section-label">
          <span class="tv-section-dot"></span>
          Kegiatan Hari Ini
        </div>

        <!-- Loading -->
        <div v-if="loading" class="tv-empty">
          <div class="tv-empty-icon">⏳</div>
          <div>Memuat data...</div>
        </div>

        <!-- Kosong -->
        <div v-else-if="hariIni.length === 0" class="tv-empty">
          <div class="tv-empty-icon">☀️</div>
          <div class="tv-empty-text">Tidak ada kegiatan hari ini</div>
          <div class="tv-empty-sub">Selamat beraktivitas!</div>
        </div>

        <!-- Daftar jadwal hari ini -->
        <div v-else class="tv-events">
          <div
            v-for="(evt, i) in hariIni"
            :key="evt.id"
            class="tv-event-card"
            :class="{
              'tv-event-active': isActive(evt),
              'tv-event-done': isDone(evt),
            }"
          >
            <!-- Indikator aktif -->
            <div
              class="tv-event-status-bar"
              :class="
                isActive(evt)
                  ? 'bar-active'
                  : isDone(evt)
                    ? 'bar-done'
                    : 'bar-upcoming'
              "
            ></div>

            <div class="tv-event-inner">
              <div class="tv-event-time">
                <span>{{ evt.jam_mulai }}</span>
                <span class="tv-event-time-sep">–</span>
                <span>{{ evt.jam_selesai }}</span>
                <span v-if="isActive(evt)" class="tv-badge-live"
                  >BERLANGSUNG</span
                >
                <span v-else-if="isDone(evt)" class="tv-badge-done"
                  >SELESAI</span
                >
              </div>

              <div class="tv-event-agenda">{{ evt.agenda }}</div>

              <div class="tv-event-meta">
                <div class="tv-meta-item">
                  <span class="tv-meta-icon">🏢</span>
                  <span>{{ evt.nama_ruangan }}</span>
                </div>
                <div class="tv-meta-divider">·</div>
                <div class="tv-meta-item">
                  <span class="tv-meta-icon">👤</span>
                  <span>{{ evt.nama_penginput }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom kanan: Akan Datang -->
      <div class="tv-sidebar">
        <div class="tv-section-label">
          <span class="tv-section-dot dot-orange"></span>
          Akan Datang
        </div>

        <div v-if="akanDatang.length === 0" class="tv-sidebar-empty">
          <div style="font-size: 28px; margin-bottom: 8px">📭</div>
          <div>Tidak ada kegiatan<br />dalam 3 hari ke depan</div>
        </div>

        <div v-else class="tv-upcoming-list">
          <div v-for="evt in akanDatang" :key="evt.id" class="tv-upcoming-card">
            <div class="tv-upcoming-date">{{ formatTanggal(evt.tanggal) }}</div>
            <div class="tv-upcoming-agenda">{{ evt.agenda }}</div>
            <div class="tv-upcoming-meta">
              <span>🏢 {{ evt.nama_ruangan }}</span>
              <span>⏰ {{ evt.jam_mulai }} – {{ evt.jam_selesai }}</span>
              <span>👤 {{ evt.nama_penginput }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <footer class="tv-footer">
      <span>Data diperbarui otomatis setiap 1 menit</span>
      <span>·</span>
      <span>Sistem Penjadwalan TPK Bitung</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";

// ── Data ─────────────────────────────────────────────────────
const hariIni = ref([]);
const akanDatang = ref([]);
const loading = ref(true);
const jam = ref("");

// ── Nama hari & bulan Indonesia ──────────────────────────────
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
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

const now = new Date();
const hariHariIni = ref(HARI[now.getDay()]);
const tanggalHariIni = ref(
  `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`,
);

// ── Jam real-time ─────────────────────────────────────────────
const updateJam = () => {
  const d = new Date();
  jam.value = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ── Fetch data ────────────────────────────────────────────────
const fetchData = async () => {
  try {
    const [r1, r2] = await Promise.all([
      axios.get("/api/jadwal/tv/hari-ini"),
      axios.get("/api/jadwal/tv/akan-datang"),
    ]);
    hariIni.value = r1.data;
    akanDatang.value = r2.data;
  } catch (e) {
    console.error("TV fetch error:", e);
  } finally {
    loading.value = false;
  }
};

// ── Status jadwal ─────────────────────────────────────────────
const isActive = (evt) => {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return hhmm >= evt.jam_mulai && hhmm < evt.jam_selesai;
};
const isDone = (evt) => {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return hhmm >= evt.jam_selesai;
};

// ── Format tanggal akan datang ────────────────────────────────
const formatTanggal = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const hari = HARI[dt.getDay()];
  return `${hari}, ${parseInt(d)} ${BULAN[parseInt(m) - 1]}`;
};

// ── Timers ────────────────────────────────────────────────────
let jamInterval, fetchInterval;
onMounted(() => {
  updateJam();
  fetchData();
  jamInterval = setInterval(updateJam, 1000);
  fetchInterval = setInterval(fetchData, 60000); // refresh tiap 1 menit
});
onUnmounted(() => {
  clearInterval(jamInterval);
  clearInterval(fetchInterval);
});
</script>

<style scoped>
/* ── Root ── */
.tv-wrap {
  min-height: 100vh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
  font-family: "Inter", "Segoe UI", sans-serif;
}

/* ── Header ── */
.tv-header {
  background: #0f2a4a;
  color: white;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}
.tv-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.tv-logo {
  width: 48px;
  height: 48px;
  background: #1e6fbf;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  font-family: "DM Sans", sans-serif;
}
.tv-brand-title {
  font-size: 18px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
}
.tv-brand-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.tv-date-block {
  text-align: center;
}
.tv-date {
  font-size: 20px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
}
.tv-day {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.tv-clock {
  font-size: 40px;
  font-weight: 500;
  font-family: "Consolas", "SFMono-Regular", monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.9);
  min-width: 180px;
  text-align: right;
}

/* ── Body ── */
.tv-body {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 300px);
  gap: 24px;
  padding: 28px 40px;
}
.tv-main,
.tv-sidebar {
  min-width: 0;
}
.tv-main {
  background: #e7f0f9;
  border: 1px solid #c9ddf0;
  border-radius: 16px;
  padding: 20px;
}
.tv-main .tv-section-label {
  color: #0f2a4a;
  font-size: 15px;
  margin-bottom: 18px;
}
.tv-main .tv-section-dot {
  width: 10px;
  height: 10px;
  box-shadow: 0 0 0 5px rgba(30, 111, 191, 0.14);
}

/* ── Section label ── */
.tv-section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5268;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}
.tv-section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e6fbf;
}
.dot-orange {
  background: #d97706;
}

/* ── Events ── */
.tv-events {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tv-event-card {
  background: white;
  border-radius: 14px;
  border: 1px solid #d8e5f0;
  box-shadow: 0 5px 18px rgba(15, 42, 74, 0.12);
  display: flex;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.tv-event-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(15, 42, 74, 0.17);
}
.tv-event-active {
  border-color: #1e6fbf;
  box-shadow: 0 6px 24px rgba(30, 111, 191, 0.25);
}
.tv-event-done {
  opacity: 0.55;
}

.tv-event-status-bar {
  width: 5px;
  flex-shrink: 0;
}
.bar-active {
  background: #1e6fbf;
}
.bar-done {
  background: #9ca3af;
}
.bar-upcoming {
  background: #1a7f5a;
}

.tv-event-inner {
  padding: 20px 24px;
  flex: 1;
}

.tv-event-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 700;
  color: #1e6fbf;
  margin-bottom: 8px;
}
.tv-event-time-sep {
  color: #9ca3af;
}

.tv-badge-live {
  font-size: 10px;
  font-weight: 700;
  background: #1e6fbf;
  color: white;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.06em;
  animation: pulse 2s infinite;
}
.tv-badge-done {
  font-size: 10px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0.06em;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.tv-event-agenda {
  font-size: 23px;
  font-weight: 600;
  color: #1e2235;
  margin-bottom: 12px;
  line-height: 1.3;
}

.tv-event-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.tv-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #334155;
}
.tv-meta-icon {
  font-size: 14px;
}
.tv-meta-divider {
  color: #d1d5db;
  font-size: 18px;
}

/* ── Empty state ── */
.tv-empty {
  background: white;
  border-radius: 14px;
  min-height: 320px;
  padding: 80px 40px;
  text-align: center;
  color: #9ca3af;
  box-shadow: 0 2px 10px rgba(15, 42, 74, 0.05);
}
.tv-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.tv-empty-text {
  font-size: 20px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}
.tv-empty-sub {
  font-size: 14px;
  color: #9ca3af;
}

/* ── Sidebar ── */
.tv-sidebar {
  display: flex;
  flex-direction: column;
}

.tv-upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tv-upcoming-card {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(15, 42, 74, 0.06);
  border-left: 4px solid #d97706;
}
.tv-upcoming-date {
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
}
.tv-upcoming-agenda {
  font-size: 15px;
  font-weight: 600;
  color: #1e2235;
  margin-bottom: 8px;
  line-height: 1.3;
}
.tv-upcoming-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: #6b7280;
}

.tv-sidebar-empty {
  background: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.8;
  box-shadow: 0 2px 8px rgba(15, 42, 74, 0.05);
}

/* ── Footer ── */
.tv-footer {
  background: #0f2a4a;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  text-align: center;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
