const Booking = require("../models/Booking");
const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public/Private
exports.createBooking = asyncHandler(async (req, res) => {
  const { trekId, numberOfPeople, additionalMembers, bookingType, ...rest } =
    req.body;

  // 1. Validate Trek existence
  const trek = await Trek.findById(trekId);
  if (!trek) {
    return sendError(res, false, 404, "Trek not found");
  }

  if (numberOfPeople > 1) {
    if (!additionalMembers || additionalMembers.length !== numberOfPeople - 1) {
      return sendError(
        res,
        false,
        400,
        `Please provide details for the ${numberOfPeople - 1} additional members.`,
      );
    }
  }

  // 3. Create Booking
  const booking = await Booking.create({
    trekId,
    numberOfPeople,
    additionalMembers,
    bookingType,
    ...rest,
  });

  sendResponse(res, 201, true, "Booking submitted successfully", booking);
});

// @desc    Get all bookings (For Admin)
// @route   GET /api/bookings
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().populate(
    "trekId",
    "title price location",
  );
  sendResponse(res, 200, true, "Bookings retrieved successfully", bookings);
});
// @desc    Get booking by ID
// @route   GET /api/bookings/:id
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("trekId");

  if (!booking) {
    return sendError(res, false, 404, "Booking not found");
  }

  sendResponse(res, 200, true, "Booking retrieved successfully", booking);
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
exports.updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, false, 404, "Booking not found");
  }

  // Logic: If updating numberOfPeople, you might need to validate additionalMembers again
  if (req.body.numberOfPeople && req.body.numberOfPeople > 1) {
    const members = req.body.additionalMembers || booking.additionalMembers;
    if (!members || members.length !== req.body.numberOfPeople - 1) {
      return sendError(
        res,
        false,
        400,
        `Update failed: provide details for ${req.body.numberOfPeople - 1} additional members.`,
      );
    }
  }

  booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, true, "Booking updated successfully", booking);
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendError(res, false, 404, "Booking not found");
  }

  await booking.deleteOne();

  sendResponse(res, 200, true, "Booking removed successfully", null);
});
