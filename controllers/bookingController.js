const Booking = require("../models/Booking");
const Trek = require("../models/Trek");
const Slot = require("../models/Slot");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// @desc    Create new booking
// @route   POST /api/bookings
exports.createBooking = asyncHandler(async (req, res) => {

  const {
    trekId,
    slots,
    name,
    whatsappNumber,
    email,
    dob,
    gender,
    pickupPoint,
    bloodGroup,
    medicalHistory,
    alternativeContact,
    emergencyContact,
    departureDate,
    numberOfPeople,

    needCoupleTent,
    needPrivateRoom,
    additionalMembers,
    totalAmount,
    paymentDetails
  } = req.body;


  const trek = await Trek.findById(trekId);
  if (!trek) {
    return sendError(res, 404, false, "Trek not found");
  }


  if (!slots || slots.length === 0) {
    return sendError(res, 400, false, "Please select at least one batch (slot) for your booking.");
  }
  if (numberOfPeople > 1) {
    const expectedMembers = numberOfPeople - 1;
    if (!additionalMembers || additionalMembers.length !== expectedMembers) {
      return sendError(
        res,
        400,
        false,
        `Details for ${expectedMembers} additional members are required.`
      );
    }
  }

  const booking = await Booking.create({
    trekId,
    slots,
    name,
    whatsappNumber,
    email,
    dob,
    gender,
    pickupPoint,
    bloodGroup,
    medicalHistory,
    alternativeContact,
    emergencyContact,
    departureDate,
    numberOfPeople,

    needCoupleTent,
    needPrivateRoom,
    additionalMembers,
    totalAmount,
    paymentDetails
  });

  sendResponse(res, 201, true, "Booking submitted successfully", booking);
});

// @desc    Update booking details
// @route   PUT /api/bookings/:id
exports.updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let booking = await Booking.findById(id);

  if (!booking) {
    return sendError(res, 404, false, "Booking not found");
  }


  if (req.body.numberOfPeople) {
    const newCount = req.body.numberOfPeople;
    const members = req.body.additionalMembers || booking.additionalMembers;

    if (newCount > 1 && (!members || members.length !== newCount - 1)) {
      return sendError(
        res,
        400,
        false,
        `Update failed: provide details for ${newCount - 1} additional members.`
      );
    }
  }


  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true }
  ).populate("trekId slots");

  sendResponse(res, 200, true, "Booking updated successfully", updatedBooking);
});

// @desc    Get all bookings
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("trekId", "title price location")
    .populate("slots")
    .sort({ createdAt: -1 });

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

    return sendError(res, 404, false, "Booking not found");
  }


  if (req.body.numberOfPeople) {
    const newCount = req.body.numberOfPeople;
    const members = req.body.additionalMembers || booking.additionalMembers;

    if (newCount > 1 && (!members || members.length !== newCount - 1)) {
      return sendError(
        res,
        400,
        false,
        `Update failed: provide details for ${newCount - 1} additional members.`,
      );
    }
  }

  // Update the booking
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
