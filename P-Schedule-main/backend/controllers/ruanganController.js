const db = require("../config/db");

// ── GET /api/ruangan ─────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM rooms ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("getAll rooms error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── GET /api/ruangan/:id ─────────────────────────────────────
const getById = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM rooms WHERE id = $1", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Ruangan tidak ditemukan." });
    res.json(rows[0]);
  } catch (err) {
    console.error("getById room error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── POST /api/ruangan  (admin only) ──────────────────────────
const create = async (req, res) => {
  const { nama, kapasitas, keterangan } = req.body;
  if (!nama)
    return res.status(400).json({ message: "Nama ruangan wajib diisi." });

  try {
    const { rows } = await db.query(
      "INSERT INTO rooms (nama, kapasitas, keterangan) VALUES ($1, $2, $3) RETURNING id",
      [nama, kapasitas || 0, keterangan || null]
    );
    res
      .status(201)
      .json({ message: "Ruangan berhasil ditambahkan.", id: rows[0].id });
  } catch (err) {
    console.error("create room error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── PUT /api/ruangan/:id  (admin only) ───────────────────────
const update = async (req, res) => {
  const { nama, kapasitas, keterangan } = req.body;
  if (!nama)
    return res.status(400).json({ message: "Nama ruangan wajib diisi." });

  try {
    const { rowCount } = await db.query(
      "UPDATE rooms SET nama = $1, kapasitas = $2, keterangan = $3 WHERE id = $4",
      [nama, kapasitas || 0, keterangan || null, req.params.id]
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Ruangan tidak ditemukan." });
    res.json({ message: "Ruangan berhasil diperbarui." });
  } catch (err) {
    console.error("update room error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── DELETE /api/ruangan/:id  (admin only) ────────────────────
const remove = async (req, res) => {
  try {
    // Ruangan tidak boleh dihapus jika masih dipakai jadwal.
    const { rows: schedules } = await db.query(
      `SELECT id FROM schedules WHERE room_id = $1`,
      [req.params.id]
    );
    if (schedules.length > 0) {
      return res.status(409).json({
        message: `Ruangan tidak bisa dihapus karena masih memiliki ${schedules.length} jadwal aktif.`,
      });
    }

    const { rowCount } = await db.query("DELETE FROM rooms WHERE id = $1", [
      req.params.id,
    ]);
    if (rowCount === 0)
      return res.status(404).json({ message: "Ruangan tidak ditemukan." });
    res.json({ message: "Ruangan berhasil dihapus." });
  } catch (err) {
    console.error("delete room error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = { getAll, getById, create, update, remove };