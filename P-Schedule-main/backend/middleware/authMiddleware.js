const jwt = require("jsonwebtoken");
require("dotenv").config();

// ── Verifikasi token JWT ──────────────────────────────────────
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, nama, role }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah kadaluarsa." });
  }
};

// ── Hanya Big Admin yang boleh akses ─────────────────────────
const bigAdminOnly = (req, res, next) => {
  if (req.user?.role !== "big_admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya Big Admin yang diizinkan." });
  }
  next();
};

const picOrBigAdmin = (req, res, next) => {
  if (!["pic", "big_admin"].includes(req.user?.role)) {
    return res
      .status(403)
      .json({
        message: "Akses ditolak. Hanya PIC atau Big Admin yang diizinkan.",
      });
  }
  next();
};

module.exports = { verifyToken, bigAdminOnly, picOrBigAdmin };
