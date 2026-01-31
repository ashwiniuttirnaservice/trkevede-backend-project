const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

router.route("/").post(createBooking).get(getAllBookings);

router
  .route("/:id")
  .get(getBookingById)
  .put(updateBooking)
  .delete(deleteBooking);

module.exports = router;
