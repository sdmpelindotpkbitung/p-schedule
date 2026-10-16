# Backend — Sistem Penjadwalan TPK Bitung

## Cara Menjalankan

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Buka .env dan isi dengan konfigurasi yang sesuai
```

### 3. Setup database MySQL

```bash
# Masuk ke MySQL
mysql -u root -p

# Jalankan schema (membuat database, tabel, dan data awal)
source config/schema.sql
```

Jika database `tpk_scheduler` sudah pernah dibuat dengan versi sebelumnya, jalankan
migrasi role/divisi/status berikut satu kali:

```bash
mysql -u root -p tpk_scheduler < config/migration_roles.sql
```

Migrasi ini menambahkan divisi, mengubah role menjadi `staff`, `pic`, dan
`big_admin`, serta menghapus kolom status dari jadwal.

### 4. Jalankan server

```bash
# Development (auto-restart saat file berubah)
npm run dev

# Production
npm start
```

Server akan berjalan di `http://localhost:3000`

### Pemulihan Big Admin

Jika password Big Admin lupa atau seluruh akun Big Admin terhapus, jalankan dari
folder `backend`:

```bash
npm run reset-big-admin
```

Script meminta username dan password baru secara interaktif. Password tidak
ditampilkan, tidak disimpan ke file, dan hanya hash bcrypt yang disimpan ke
database. Jika username sudah ada, akun tersebut dipulihkan sebagai `big_admin`;
jika belum ada, akun baru dibuat.

---

## Daftar Endpoint API

### Auth

| Method | Endpoint              | Akses  | Keterangan                  |
| ------ | --------------------- | ------ | --------------------------- |
| POST   | `/api/auth/login`     | Public | Login, mendapat JWT token   |
| GET    | `/api/auth/me`        | Login  | Info user yang sedang login |
| GET    | `/api/auth/users`     | Admin  | Daftar semua pengguna       |
| POST   | `/api/auth/users`     | Admin  | Tambah pengguna baru        |
| DELETE | `/api/auth/users/:id` | Admin  | Hapus pengguna              |

### Ruangan

| Method | Endpoint           | Akses | Keterangan           |
| ------ | ------------------ | ----- | -------------------- |
| GET    | `/api/ruangan`     | Login | Daftar semua ruangan |
| GET    | `/api/ruangan/:id` | Login | Detail satu ruangan  |
| POST   | `/api/ruangan`     | Admin | Tambah ruangan       |
| PUT    | `/api/ruangan/:id` | Admin | Edit ruangan         |
| DELETE | `/api/ruangan/:id` | Admin | Hapus ruangan        |

### Jadwal

| Method | Endpoint          | Akses   | Keterangan                                                         |
| ------ | ----------------- | ------- | ------------------------------------------------------------------ |
| GET    | `/api/jadwal`     | Login   | Semua jadwal (filter: `?bulan=2024-06` atau `?tanggal=2024-06-15`) |
| GET    | `/api/jadwal/:id` | Login   | Detail satu jadwal                                                 |
| POST   | `/api/jadwal`     | Login   | Tambah jadwal (otomatis cek bentrok)                               |
| PUT    | `/api/jadwal/:id` | Login\* | Edit jadwal                                                        |
| DELETE | `/api/jadwal/:id` | Login\* | Hapus jadwal                                                       |

> \*Staff hanya bisa edit/hapus jadwal milik sendiri. Admin bisa semua.

---

## Akun Default

| Username | Password | Role  |
| -------- | -------- | ----- |
| admin    | admin123 | Admin |

Tambah akun staff lewat panel admin atau endpoint `POST /api/auth/users`.

---

## Cara Pakai Token JWT

Setelah login, sertakan token di setiap request:

```
Authorization: Bearer <token_dari_login>
```

## Respon Bentrok (HTTP 409)

```json
{
  "message": "Jadwal bentrok dengan jadwal yang sudah ada.",
  "conflict": {
    "id": 5,
    "agenda": "Rapat Direksi",
    "jam_mulai": "09:00",
    "jam_selesai": "11:00",
    "nama_penginput": "Budi Santoso",
    "nama_ruangan": "Ruang Rapat Lantai 1"
  }
}
```
