const db = require("../config/db");

const QUERY = `
  SELECT
    s.id,
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

// ── GET /api/jadwal/tv/hari-ini ───────────────────────────────
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

// ── GET /api/jadwal/tv/akan-datang ───────────────────────────
// Mengembalikan jadwal 3 hari ke depan (tidak termasuk hari ini)
const akanDatang = async (req, res) => {
  try {
    const { rows } = await db.query(
      QUERY +
        `
        WHERE s.tanggal > CURRENT_DATE
          AND s.tanggal <= CURRENT_DATE + INTERVAL '3 days'
        ORDER BY s.tanggal ASC, s.jam_mulai ASC
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("TV akanDatang error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = { hariIni, akanDatang };