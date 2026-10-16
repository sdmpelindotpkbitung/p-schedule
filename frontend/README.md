# Frontend — Sistem Penjadwalan TPK Bitung

## Cara Menjalankan

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Jalankan development server
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

> **Pastikan backend sudah berjalan** di `http://localhost:3000` sebelum menjalankan frontend.
> Semua request ke `/api/...` akan otomatis di-proxy ke backend.

### 3. Build untuk production
```bash
npm run build
# Output ada di folder dist/
```

---

## Struktur File

```
src/
├── main.js                  ← Entry point, setup Vue + Pinia + Router
├── App.vue                  ← Root component
├── style.css                ← Global CSS (Tailwind)
├── router/
│   └── index.js             ← Vue Router + navigation guard
├── stores/
│   └── auth.js              ← Pinia store (login state)
├── services/
│   └── api.js               ← Axios instance + semua API call
├── components/
│   ├── Topbar.vue           ← Navigasi atas
│   ├── CalendarGrid.vue     ← Komponen kalender bulanan
│   ├── ScheduleModal.vue    ← Form tambah/edit jadwal
│   └── ConflictWarning.vue  ← Pop-up warning bentrok
└── views/
    ├── Login.vue            ← Halaman login
    ├── Kalender.vue         ← Halaman utama (kalender)
    └── Admin.vue            ← Panel admin
```

---

## Alur Penggunaan

1. User buka `http://localhost:5173` → diarahkan ke `/login`
2. Login dengan username & password
3. Jika **staff** → langsung ke kalender
4. Jika **admin** → kalender + akses tab Admin di navbar
5. Klik **Tambah Jadwal** → form input
6. Jika waktu & ruangan bentrok → pop-up warning otomatis muncul
7. Admin bisa kelola jadwal, ruangan, dan pengguna dari panel Admin
