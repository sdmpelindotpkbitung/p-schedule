const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,     
  port:     process.env.DB_PORT,   
  user:     process.env.DB_USER,    
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  
  // Konfigurasi wajib untuk Supabase
  ssl: {
    rejectUnauthorized: false
  },
  
  max: 10, 
  idleTimeoutMillis: 10000,        // Tutup koneksi jika nganggur 10 detik
  connectionTimeoutMillis: 10000,  // Waktu maksimal untuk mencoba connect
  
  // ── TAMBAHKAN BARIS INI ──
  keepAlive: true, // Mengirim ping berkala agar Supabase tidak memutus koneksi
});

// Penangkap error agar server tidak crash saat koneksi idle terputus
pool.on('error', (err, client) => {
  console.error('⚠️ Koneksi idle terputus dari Supabase (ini wajar):', err.message);
});

// Test koneksi saat pertama kali diload
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Terhubung ke database PostgreSQL (Supabase)');
    client.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke database:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;