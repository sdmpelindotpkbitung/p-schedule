# Manual Book

## Sistem Penjadwalan TPK Bitung

**Versi:** 1.0  
**Dokumen:** Panduan penggunaan dan sosialisasi sistem  
**Pengguna:** Big Admin, PIC, Staff, dan operator layar TV

---

## 1. Tentang Sistem

Sistem Penjadwalan TPK Bitung digunakan untuk mencatat, melihat, dan mengelola
jadwal kegiatan berdasarkan ruangan, tanggal, waktu, dan divisi. Sistem juga
menyediakan tampilan TV publik untuk menampilkan kegiatan yang berlangsung pada
hari berjalan.

### 1.1 Fitur utama

- Kalender jadwal bulanan.
- Penambahan dan perubahan jadwal.
- Pemeriksaan bentrok ruangan dan waktu.
- Pengelolaan ruangan.
- Pengelolaan divisi.
- Pengelolaan pengguna dan password.
- Pengelolaan staff berdasarkan divisi.
- Tampilan TV kegiatan hari ini.

---

## 2. Hak Akses Pengguna

| Role            | Akses utama                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Big Admin**   | Melihat kalender, mengelola seluruh jadwal, ruangan, divisi, dan pengguna                                               |
| **PIC**         | Melihat kalender, mengelola jadwal divisinya, menambah dan menghapus staff divisi, serta mengatur password staff divisi |
| **Staff**       | Melihat kalender dan mengelola jadwal yang dibuat sendiri                                                               |
| **Operator TV** | Membuka tampilan TV tanpa login                                                                                         |

Catatan: Semua pengguna yang sudah login dapat melihat kalender. Hak untuk
mengubah atau menghapus data dibatasi oleh role masing-masing.

---

## 3. Persiapan dan Menjalankan Sistem

Bagian ini ditujukan untuk administrator teknis atau petugas yang menjalankan
aplikasi di komputer server.

### 3.1 Persyaratan

- Windows atau sistem operasi yang mendukung Node.js dan Python.
- Node.js dan npm.
- MySQL Server.
- Browser modern seperti Google Chrome atau Microsoft Edge.
- Koneksi jaringan jika sistem akan diakses dari komputer lain.

### 3.2 Menyiapkan database pertama kali

1. Buka terminal pada folder `backend`.
2. Install dependency:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`, lalu isi konfigurasi database dan
   `JWT_SECRET`.
4. Buat struktur database menggunakan `config/schema.sql`.
5. Jika database berasal dari versi lama, jalankan juga
   `config/migration_roles.sql` sesuai kebutuhan.

Pada instalasi baru, schema menyediakan akun awal:

| Username | Password awal | Role        |
| -------- | ------------- | ----------- |
| `admin`  | `admin123`    | `big_admin` |

Segera ubah password awal setelah login pertama.

### 3.3 Menjalankan aplikasi

#### Cara manual

Buka dua terminal.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Kemudian buka:

- Aplikasi pengguna: `http://localhost:5173`
- Tampilan TV: `http://localhost:5173/tv`
- Backend/API: `http://localhost:3000`

### 3.4 Akses dari jaringan yang sama

Jika komputer lain berada pada jaringan Wi-Fi atau LAN yang sama:

1. Cari alamat IPv4 komputer server dengan perintah `ipconfig`.
2. Pastikan perangkat lain dapat terhubung ke komputer server.
3. Jalankan aplikasi pada komputer server.
4. Buka alamat berikut dari perangkat lain, dengan mengganti `ALAMAT_IP_SERVER`:

   ```text
   http://ALAMAT_IP_SERVER:5173
   ```

   Untuk tampilan TV:

   ```text
   http://ALAMAT_IP_SERVER:5173/tv
   ```

Frontend dan backend sudah dikonfigurasi untuk mendengarkan koneksi jaringan.
Jika halaman tidak dapat dibuka, izinkan Node.js atau port TCP `5173` pada
Windows Firewall. Backend port `3000` tidak perlu dibuka untuk pengguna biasa
karena request API diteruskan oleh frontend.

#### Menggunakan launcher

Jika tersedia launcher Python pada root project, jalankan:

```bash
python run.py
```

Launcher menjalankan backend dan frontend sekaligus. Tekan `Ctrl+C` pada
terminal launcher untuk menghentikan aplikasi.

---

## 4. Login dan Navigasi Umum

1. Buka `http://localhost:5173`.
2. Masukkan **Username**.
3. Masukkan **Password**.
4. Klik **Masuk**.
5. Setelah berhasil, sistem membuka halaman **Kalender**.

Menu yang tampil pada Topbar menyesuaikan role pengguna:

- **Kalender:** melihat jadwal bulanan.
- **Kelola Jadwal:** tersedia untuk Staff dan PIC.
- **Anggota Divisi:** tersedia untuk PIC.
- **Admin:** tersedia untuk Big Admin.
- **Keluar:** mengakhiri sesi login.

### 4.1 Keluar dari sistem

1. Klik tombol **Keluar** pada Topbar.
2. Pada dialog konfirmasi, klik **Ya, Keluar**.

---

## 5. Panduan Big Admin

Big Admin memiliki akses pengelolaan sistem secara menyeluruh.

### 5.1 Mengelola jadwal

1. Buka menu **Kalender** atau **Kelola Jadwal**.
2. Klik **Tambah Jadwal**.
3. Isi data berikut:
   - Agenda / Nama Kegiatan.
   - Ruangan.
   - Tanggal.
   - Jam mulai dan jam selesai dalam format 24 jam `HH:mm` (contoh `08:30` atau `16:00`).
   - Keterangan, jika diperlukan.
4. Klik **Tambahkan Jadwal**.
5. Jika ruangan dan waktu bentrok dengan jadwal lain, sistem menampilkan
   peringatan. Pilih waktu atau ruangan lain.

Untuk mengubah jadwal, klik **Edit**, ubah data yang diperlukan, lalu klik
**Simpan Perubahan**.

Untuk menghapus jadwal, klik **Hapus**, kemudian konfirmasi penghapusan.

### 5.2 Mengelola ruangan

1. Buka menu **Admin**.
2. Pilih tab **Ruangan**.
3. Klik **Tambah Ruangan**.
4. Isi nama ruangan, kapasitas, dan keterangan.
5. Klik tombol simpan.

Gunakan tombol **Edit** untuk mengubah data. Ruangan yang masih digunakan oleh
jadwal aktif tidak dapat dihapus sebelum jadwal terkait ditangani.

### 5.3 Mengelola divisi

1. Buka menu **Admin**.
2. Pilih tab **Divisi**.
3. Klik **Tambah Divisi**.
4. Isi nama divisi dan kode divisi.
5. Simpan data.

Divisi yang masih digunakan oleh pengguna tidak dapat dihapus.

### 5.4 Menambah pengguna

1. Buka menu **Admin**.
2. Pilih tab **Pengguna**.
3. Klik **Tambah Pengguna**.
4. Isi nama lengkap, username, password, role, dan divisi jika diwajibkan.
5. Klik tombol simpan.

Ketentuan role:

- `big_admin` tidak wajib memiliki divisi.
- `pic` wajib memiliki divisi.
- `staff` wajib memiliki divisi.
- Username harus unik.
- Password minimal 6 karakter.

### 5.5 Mengatur password pengguna

1. Pada tab **Pengguna**, cari pengguna yang diperlukan.
2. Klik **Atur Password**.
3. Masukkan password baru minimal 6 karakter.
4. Klik **Simpan**.

Big Admin tidak dapat menghapus akun yang sedang dipakai sendiri. Sistem juga
melindungi Big Admin terakhir agar tidak terhapus seluruhnya.

---

## 6. Panduan PIC

PIC bertanggung jawab terhadap staff dan jadwal pada divisinya.

### 6.1 Mengelola jadwal divisi

1. Login sebagai PIC.
2. Buka **Kelola Jadwal**.
3. Klik **Tambah Jadwal** untuk membuat jadwal baru.
4. Isi agenda, ruangan, tanggal, waktu, dan keterangan.
5. Simpan jadwal.

PIC dapat mengubah atau menghapus jadwal yang berada dalam cakupan divisinya.
Jadwal dari divisi lain tidak menjadi tanggung jawab PIC.

### 6.2 Menambah staff

1. Buka menu **Anggota Divisi**.
2. Klik **Tambah Staff**.
3. Isi nama lengkap, username, dan password.
4. Klik **Tambahkan**.

Staff baru otomatis ditempatkan pada divisi PIC yang sedang login.

### 6.3 Mengatur password staff

1. Buka **Anggota Divisi**.
2. Cari nama staff.
3. Klik **Atur Password**.
4. Masukkan password baru.
5. Klik **Simpan**.

PIC hanya dapat mengatur password staff pada divisinya sendiri.

### 6.4 Menghapus akun staff

1. Buka **Anggota Divisi**.
2. Cari staff yang akan dihapus, lalu klik **Hapus**.
3. Periksa konfirmasi, kemudian pilih **Ya, Hapus**.

PIC hanya dapat menghapus akun staff pada divisinya sendiri. Akun dan seluruh
jadwal yang dibuat oleh staff tersebut akan dihapus permanen; akun pada divisi
lain tidak dapat dihapus oleh PIC.

---

## 7. Panduan Staff

### 7.1 Melihat jadwal

1. Login menggunakan username dan password.
2. Halaman **Kalender** akan terbuka.
3. Gunakan tombol `‹` dan `›` untuk berpindah bulan.
4. Klik **Hari Ini** untuk kembali ke bulan berjalan.
5. Klik tanggal pada kalender untuk melihat daftar kegiatan hari tersebut.
6. Klik salah satu kegiatan untuk melihat detail agenda, tanggal, waktu, dan
   ruangan.

### 7.2 Menambah jadwal

1. Klik **Tambah Jadwal** pada halaman Kalender atau buka **Kelola Jadwal**.
2. Isi semua kolom wajib.
3. Pastikan jam selesai lebih besar daripada jam mulai.
4. Klik **Tambahkan Jadwal**.
5. Jika muncul peringatan bentrok, ubah ruangan atau waktu.

### 7.3 Mengubah atau menghapus jadwal

Staff hanya dapat mengubah atau menghapus jadwal yang dibuat sendiri.

1. Buka **Kelola Jadwal**.
2. Cari jadwal yang akan diubah atau dihapus.
3. Klik **Edit** untuk memperbarui data, atau klik **Hapus** untuk menghapusnya.
4. Konfirmasi tindakan jika diminta.

---

## 8. Panduan Tampilan TV

Tampilan TV tidak memerlukan login dan ditujukan untuk monitor atau televisi
informasi.

1. Jalankan backend dan frontend.
2. Buka `http://localhost:5173/tv` pada browser.
3. Gunakan mode layar penuh jika ditampilkan pada TV.
4. Halaman menampilkan tanggal, waktu, dan kegiatan hari ini.

Status kegiatan yang ditampilkan:

- **Akan datang:** kegiatan belum dimulai.
- **Berlangsung:** kegiatan sedang berlangsung.
- **Selesai:** waktu kegiatan telah berakhir.

Jika tidak ada kegiatan, layar menampilkan informasi bahwa tidak ada kegiatan
hari ini.

---

## 9. Aturan Pengisian Jadwal

- Gunakan nama agenda yang singkat tetapi jelas.
- Pastikan tanggal dan waktu sesuai undangan atau agenda resmi.
- Masukkan waktu dalam format 24 jam `HH:mm`, misalnya `08:30` untuk pukul 8.30 pagi atau `20:15` untuk pukul 8.15 malam. Format AM/PM tidak digunakan.
- Periksa ruangan sebelum menyimpan.
- Jangan membuat dua jadwal pada ruangan dan waktu yang sama.
- Gunakan kolom keterangan untuk informasi tambahan yang penting.
- Setelah membuat jadwal, periksa kembali jadwal tersebut pada kalender.

---

## 10. Penanganan Masalah Umum

### Tidak dapat login

- Pastikan username dan password benar.
- Pastikan backend sedang berjalan.
- Hubungi Big Admin untuk pengaturan password.

### Muncul pesan jadwal bentrok

Ruangan tersebut sudah digunakan pada waktu yang sama atau memiliki irisan
waktu. Pilih ruangan atau waktu lain.

### Menu tidak muncul

Menu ditentukan oleh role akun. Hubungi Big Admin jika role atau divisi akun
tidak sesuai.

### Data tidak tampil

- Periksa koneksi jaringan.
- Pastikan backend berjalan pada port `3000`.
- Muat ulang halaman browser.
- Jika masalah berlanjut, hubungi administrator teknis.

### Lupa password Big Admin

Administrator teknis dapat menjalankan script pemulihan dari folder `backend`:

```bash
npm run reset-big-admin
```

Script meminta username dan password baru secara interaktif. Password tidak
ditampilkan dan tidak disimpan ke file. Gunakan hanya pada komputer server atau
komputer yang dipercaya.

---

## 11. Praktik Keamanan

- Jangan membagikan username dan password.
- Segera ganti password awal `admin123`.
- Jangan menyimpan password di dokumen, source code, atau chat.
- Jangan membagikan file `.env`.
- Jangan menjalankan script pemulihan melalui pipe atau layanan publik.
- Gunakan password minimal 6 karakter dan sebaiknya lebih panjang.
- Keluar dari sistem setelah selesai menggunakan komputer bersama.
- Batasi akses URL aplikasi dan database hanya kepada jaringan yang diperlukan.

---

## 12. Kontak Dukungan

Untuk masalah penggunaan, hubungi Big Admin. Untuk masalah server, database,
atau pemulihan akun Big Admin, hubungi administrator teknis sistem.
