require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ── Middleware Global ─────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/ruangan", require("./routes/ruangan"));
app.use("/api/jadwal", require("./routes/jadwal"));

// ── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server TPK Bitung berjalan." });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} tidak ditemukan.` });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Terjadi kesalahan internal pada server." });
});

// ── Start server (Disesuaikan untuk Vercel & Lokal) ───────────
// Vercel secara otomatis menyematkan environment variable VERCEL=1
if (process.env.VERCEL) {
  // Jika di Vercel, kita mengekspor aplikasi agar dijalankan sebagai Serverless Function
  module.exports = app;
} else {
  // Jika di komputer lokal, jalankan server secara normal
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server berjalan di http://${HOST}:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}