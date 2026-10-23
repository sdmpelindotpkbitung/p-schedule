require('dotenv').config(); // 👈 LETAKKAN INI PALING ATAS

const db = require("../config/db");
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inisialisasi Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==========================================
// 1. BAGIAN JADWAL TV (HARI INI & AKAN DATANG)
// ==========================================

const QUERY = `
  SELECT
    s.id,
    s.foto,
    s.is_reminder,
    TO_CHAR(s.tanggal, 'YYYY-MM-DD') AS tanggal,
    TO_CHAR(s.jam_mulai, 'HH24:MI') AS jam_mulai,
    TO_CHAR(s.jam_selesai, 'HH24:MI') AS jam_selesai,
    s.agenda, s.keterangan,
    u.nama AS nama_penginput,
    r.nama AS nama_ruangan
  FROM schedules s
  JOIN users u ON s.user_id = u.id
  JOIN rooms  r ON s.room_id = r.id
`;

const hariIni = async (req, res) => {
  try {
    const { rows } = await db.query(
      QUERY + ` WHERE s.tanggal = CURRENT_DATE ORDER BY s.jam_mulai ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("TV hariIni error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const akanDatang = async (req, res) => {
  try {
    const { rows } = await db.query(
      QUERY +
        `
        WHERE s.tanggal > CURRENT_DATE
          AND (s.tanggal <= CURRENT_DATE + INTERVAL '3 days' OR s.is_reminder = true)
        ORDER BY s.tanggal ASC, s.jam_mulai ASC
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("TV akanDatang error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ==========================================
// 2. BAGIAN MANAJEMEN SLIDESHOW FOTO (SUPABASE STORAGE)
// ==========================================

// Menggunakan memoryStorage karena file akan langsung dikirim ke Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isMatch = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    if (isMatch) cb(null, true);
    else cb(new Error('Format file harus berupa gambar (JPG, PNG, WEBP)'));
  }
}).single('slideImage');

const getSlides = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM tv_slides ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data slide', error: error.message });
  }
};

const uploadSlide = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'File gambar wajib diunggah' });

    const file = req.file;
    const ext = path.extname(file.originalname);
    const fileName = `slide-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    try {
      // 1. Upload file ke Supabase Storage (Bucket: tv_slides)
      const { data, error: uploadError } = await supabase.storage
        .from('tv_slides')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Dapatkan Public URL dari Supabase
      const { data: publicUrlData } = supabase.storage
        .from('tv_slides')
        .getPublicUrl(fileName);
      
      const fileUrl = publicUrlData.publicUrl;

      // 3. Simpan URL ke Database PostgreSQL
      const { rows } = await db.query(
        'INSERT INTO tv_slides (file_name, url) VALUES ($1, $2) RETURNING id',
        [fileName, fileUrl]
      );

      res.status(201).json({
        id: rows[0].id,
        file_name: fileName,
        url: fileUrl,
        message: 'Foto slide berhasil diunggah'
      });
    } catch (e) {
      console.error("Upload error:", e);
      res.status(500).json({ message: 'Gagal mengunggah ke Supabase', error: e.message });
    }
  });
};

const deleteSlide = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM tv_slides WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Slide tidak ditemukan' });

    const fileName = rows[0].file_name;

    // 1. Hapus file dari Supabase Storage
    const { error: removeError } = await supabase.storage
      .from('tv_slides')
      .remove([fileName]);

    if (removeError) throw removeError;

    // 2. Hapus data dari Database PostgreSQL
    await db.query('DELETE FROM tv_slides WHERE id = $1', [id]);
    
    res.json({ message: 'Foto slide berhasil dihapus' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Gagal menghapus slide', error: error.message });
  }


  
};

module.exports = { 
  hariIni, 
  akanDatang, 
  getSlides, 
  uploadSlide, 
  deleteSlide 
};