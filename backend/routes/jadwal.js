const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/jadwalController");
const tvCtrl = require("../controllers/tvController");
const { verifyToken } = require("../middleware/authMiddleware");

// Semua endpoint jadwal butuh login
router.get("/", verifyToken, ctrl.getAll);
router.get("/kelolaan", verifyToken, ctrl.getManaged);
router.get("/tv/hari-ini", tvCtrl.hariIni);
router.get("/tv/akan-datang", tvCtrl.akanDatang);
router.get("/:id", verifyToken, ctrl.getById);
router.post("/", verifyToken, ctrl.create);
router.put("/:id", verifyToken, ctrl.update);
router.delete("/:id", verifyToken, ctrl.remove);

module.exports = router;
