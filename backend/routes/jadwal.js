const express = require("express");
const router = express.Router();
const multer = require("multer"); // 👈 Wajib diimpor
const ctrl = require("../controllers/jadwalController");
const tvCtrl = require("../controllers/tvController");
const { verifyToken } = require("../middleware/authMiddleware");

// 👈 Konfigurasi penangkap file gambar
const upload = multer({ storage: multer.memoryStorage() });

// Semua endpoint jadwal butuh login
router.get("/", verifyToken, ctrl.getAll);
router.get("/kelolaan", verifyToken, ctrl.getManaged);
router.get("/tv/hari-ini", tvCtrl.hariIni);
router.get("/tv/akan-datang", tvCtrl.akanDatang);
router.get("/:id", verifyToken, ctrl.getById);

// 👈 PERUBAHAN KRUSIAL: Tambahkan upload.single("foto") di tengah-tengah POST dan PUT
router.post("/", verifyToken, upload.single("foto"), ctrl.create);
router.put("/:id", verifyToken, upload.single("foto"), ctrl.update);

router.delete("/:id", verifyToken, ctrl.remove);

module.exports = router;