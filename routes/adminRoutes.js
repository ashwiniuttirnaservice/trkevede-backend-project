const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllAdmins,
  getById,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

router.post("/register", register);
router.post("/login", login);

router.get("/", getAllAdmins);
router.get("/:id", getById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;
