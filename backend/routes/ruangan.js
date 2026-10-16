const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/ruanganController");
const { verifyToken, bigAdminOnly } = require("../middleware/authMiddleware");

// Semua user login bisa lihat daftar ruangan
router.get("/", verifyToken, ctrl.getAll);
router.get("/:id", verifyToken, ctrl.getById);

// Hanya admin yang bisa kelola ruangan
router.post("/", verifyToken, bigAdminOnly, ctrl.create);
router.put("/:id", verifyToken, bigAdminOnly, ctrl.update);
router.delete("/:id", verifyToken, bigAdminOnly, ctrl.remove);

module.exports = router;
