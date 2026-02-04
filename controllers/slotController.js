const Slot = require("../models/Slot");
const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");


exports.createSlot = asyncHandler(async (req, res) => {
  const { trekId, startDate, endDate, displayRange, totalSeats, status } = req.body;


  if (!trekId) {
    return sendError(res, 400, false, "Please provide a trekId to link this slot.");
  }


  const slot = await Slot.create({
    trekId,
    startDate,
    endDate,
    displayRange,
    totalSeats,
    status
  });


  const trek = await Trek.findByIdAndUpdate(
    trekId,
    { $push: { slots: slot._id } },
    { new: true }
  );


  if (!trek) {
    await Slot.findByIdAndDelete(slot._id);
    return sendError(res, 404, false, "Trek not found with the provided ID.");
  }

  sendResponse(res, 201, true, "Slot created and linked to Trek successfully", {
    slot,
    trekTitle: trek.title
  });
});


exports.getAllSlots = asyncHandler(async (req, res) => {
  const slots = await Slot.find().sort({ startDate: 1 });
  sendResponse(res, 200, true, "Slots fetched successfully", slots);
});

exports.getSlotById = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return sendError(res, 404, false, "Slot not found");

  sendResponse(res, 200, true, "Slot fetched", slot);
});

exports.updateSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!slot) return sendError(res, 404, false, "Slot not found");
  sendResponse(res, 200, true, "Slot updated successfully", slot);
});

exports.deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndDelete(req.params.id);
  if (!slot) return sendError(res, 404, false, "Slot not found");

  sendResponse(res, 200, true, "Slot deleted successfully", null);
});
