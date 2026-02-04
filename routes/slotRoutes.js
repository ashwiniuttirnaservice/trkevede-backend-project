const express = require("express");
const router = express.Router();
const {
  createSlot,
  getAllSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
} = require("../controllers/slotController");

// Basic CRUD routes
router.route("/").post(createSlot).get(getAllSlots);

router.route("/:id").get(getSlotById).put(updateSlot).delete(deleteSlot);

module.exports = router;
