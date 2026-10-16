const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,     
  port:     process.env.DB_PORT,   
  user:     process.env.DB_USER,    
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  // Supabase mewajibkan koneksi SSL
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Sama dengan connectionLimit di MySQL
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
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