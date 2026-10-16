const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); // Pastikan db.js yang digunakan sudah versi PostgreSQL (pg)
require("dotenv").config();

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi." });
  }

  try {
    const { rows } = await db.query(
      `SELECT u.*, d.nama AS division_name
       FROM users u LEFT JOIN divisions d ON d.id = u.division_id
       WHERE u.username = $1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
        division_id: user.division_id,
        division_name: user.division_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        division_id: user.division_id,
        division_name: user.division_name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nama, u.username, u.role, u.division_id,
          d.nama AS division_name, u.created_at
       FROM users u LEFT JOIN divisions d ON d.id = u.division_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── GET /api/auth/users  (admin only) ────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.nama, u.username, u.role, u.division_id,
          d.nama AS division_name, u.created_at
       FROM users u LEFT JOIN divisions d ON d.id = u.division_id
       ORDER BY u.role, u.nama`
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getDivisions = async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, nama, kode FROM divisions WHERE aktif = TRUE ORDER BY nama"
    );
    res.json(rows);
  } catch (err) {
    console.error("getDivisions error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const getDivisionMembers = async (req, res) => {
  try {
    const { rows: current } = await db.query(
      "SELECT division_id FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!current.length || !current[0].division_id)
      return res.status(400).json({ message: "Akun belum memiliki divisi." });
    
    const { rows } = await db.query(
      `SELECT id, nama, username, role, division_id, created_at
       FROM users WHERE division_id = $1 AND role = 'staff' ORDER BY nama`,
      [current[0].division_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("getDivisionMembers error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const createDivision = async (req, res) => {
  const { nama, kode } = req.body;
  if (!nama || !kode)
    return res
      .status(400)
      .json({ message: "Nama dan kode divisi wajib diisi." });
  try {
    const { rows } = await db.query(
      "INSERT INTO divisions (nama, kode) VALUES ($1, $2) RETURNING id",
      [nama.trim(), kode.trim().toUpperCase()]
    );
    res
      .status(201)
      .json({ message: "Divisi berhasil dibuat.", id: rows[0].id });
  } catch (err) {
    if (err.code === "23505") // Error code unik duplicate di PostgreSQL
      return res
        .status(409)
        .json({ message: "Nama atau kode divisi sudah digunakan." });
    console.error("createDivision error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const updateDivision = async (req, res) => {
  const { nama, kode } = req.body;
  if (!nama || !kode)
    return res
      .status(400)
      .json({ message: "Nama dan kode divisi wajib diisi." });
  try {
    const { rowCount } = await db.query(
      "UPDATE divisions SET nama = $1, kode = $2 WHERE id = $3",
      [nama.trim(), kode.trim().toUpperCase(), req.params.id]
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Divisi tidak ditemukan." });
    res.json({ message: "Divisi berhasil diperbarui." });
  } catch (err) {
    if (err.code === "23505") // Error code unik duplicate di PostgreSQL
      return res
        .status(409)
        .json({ message: "Nama atau kode divisi sudah digunakan." });
    console.error("updateDivision error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const deleteDivision = async (req, res) => {
  try {
    const { rows: users } = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE division_id = $1",
      [req.params.id]
    );
    if (parseInt(users[0].total) > 0)
      return res
        .status(409)
        .json({ message: "Divisi masih digunakan oleh pengguna." });
    
    const { rowCount } = await db.query("DELETE FROM divisions WHERE id = $1", [
      req.params.id,
    ]);
    if (rowCount === 0)
      return res.status(404).json({ message: "Divisi tidak ditemukan." });
    res.json({ message: "Divisi berhasil dihapus." });
  } catch (err) {
    console.error("deleteDivision error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── POST /api/auth/users  (admin only) ───────────────────────
const createUser = async (req, res) => {
  let { nama, username, password, role, division_id } = req.body;

  if (req.user.role === "pic") {
    role = "staff";
    const { rows: owner } = await db.query(
      "SELECT division_id FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!owner.length || !owner[0].division_id) {
      return res
        .status(400)
        .json({ message: "Akun PIC belum memiliki divisi." });
    }
    division_id = owner[0].division_id;
  }

  if (!nama || !username || !password) {
    return res
      .status(400)
      .json({ message: "Nama, username, dan password wajib diisi." });
  }
  if (!["staff", "pic", "big_admin"].includes(role)) {
    return res.status(400).json({ message: "Role tidak valid." });
  }
  if (role === "big_admin") {
    return res.status(403).json({
      message: "Big Admin tidak dapat menambahkan Big Admin lain.",
    });
  }
  if (role !== "big_admin" && !division_id) {
    return res
      .status(400)
      .json({ message: "Staff dan PIC wajib memiliki divisi." });
  }

  try {
    const { rows: existing } = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username sudah digunakan." });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows: result } = await db.query(
      "INSERT INTO users (nama, username, password, role, division_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [nama, username, hash, role || "staff", division_id || null]
    );

    res.status(201).json({
      message: "Pengguna berhasil dibuat.",
      id: result[0].id,
    });
  } catch (err) {
    console.error("createUser error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── PUT /api/auth/users/:id/password (admin only) ───────────
const updateUserPassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter." });
  }

  try {
    if (req.user.role === "pic") {
      const { rows: target } = await db.query(
        "SELECT division_id, role FROM users WHERE id = $1",
        [req.params.id]
      );
      const { rows: current } = await db.query(
        "SELECT division_id FROM users WHERE id = $1",
        [req.user.id]
      );
      if (
        !target.length ||
        target[0].role !== "staff" ||
        !current.length ||
        target[0].division_id !== current[0].division_id
      ) {
        return res.status(403).json({
          message: "PIC hanya dapat mengatur password Staff dalam divisinya.",
        });
      }
    }
    const hash = await bcrypt.hash(password, 10);
    const { rowCount } = await db.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hash, req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    res.json({ message: "Password pengguna berhasil diperbarui." });
  } catch (err) {
    console.error("updateUserPassword error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// ── DELETE /api/auth/users/:id  (admin only) ─────────────────
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res
      .status(400)
      .json({ message: "Tidak bisa menghapus akun sendiri." });
  }

  try {
    const { rows: target } = await db.query(
      "SELECT role, division_id FROM users WHERE id = $1",
      [id]
    );
    if (!target.length) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    if (req.user.role === "pic") {
      const { rows: current } = await db.query(
        "SELECT division_id FROM users WHERE id = $1",
        [req.user.id]
      );
      if (
        target[0].role !== "staff" ||
        !current.length ||
        !current[0].division_id ||
        !target[0].division_id ||
        Number(target[0].division_id) !== Number(current[0].division_id)
      ) {
        return res.status(403).json({
          message: "PIC hanya dapat menghapus Staff dalam divisinya.",
        });
      }
    }

    if (target[0].role === "big_admin") {
      const { rows: admins } = await db.query(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'big_admin'"
      );
      if (parseInt(admins[0].total) <= 1) {
        return res.status(400).json({
          message: "Big Admin terakhir tidak boleh dihapus.",
        });
      }
    }

    const { rowCount } = await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Pengguna berhasil dihapus." });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  login,
  getMe,
  getAllUsers,
  getDivisions,
  getDivisionMembers,
  createDivision,
  updateDivision,
  deleteDivision,
  createUser,
  updateUserPassword,
  deleteUser,
};