const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const {
  verifyToken,
  bigAdminOnly,
  picOrBigAdmin,
} = require("../middleware/authMiddleware");

// Public
router.post("/login", ctrl.login);

// Protected - semua user login
router.get("/me", verifyToken, ctrl.getMe);
router.get("/divisions", verifyToken, ctrl.getDivisions);
router.get(
  "/division-members",
  verifyToken,
  picOrBigAdmin,
  ctrl.getDivisionMembers,
);
router.post("/divisions", verifyToken, bigAdminOnly, ctrl.createDivision);
router.put("/divisions/:id", verifyToken, bigAdminOnly, ctrl.updateDivision);
router.delete("/divisions/:id", verifyToken, bigAdminOnly, ctrl.deleteDivision);

// Protected - admin only
router.get("/users", verifyToken, bigAdminOnly, ctrl.getAllUsers);
router.post("/users", verifyToken, picOrBigAdmin, ctrl.createUser);
router.put(
  "/users/:id/password",
  verifyToken,
  picOrBigAdmin,
  ctrl.updateUserPassword,
);
router.delete("/users/:id", verifyToken, picOrBigAdmin, ctrl.deleteUser);

module.exports = router;
