const Contact = require("../models/Contact");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");


// @desc    Submit a new contact inquiry
// @route   POST /api/contact
exports.submitInquiry = asyncHandler(async (req, res) => {
    const { name, email, mobile_no, message } = req.body;

    if (!name || !email || !mobile_no || !message) {
        return sendError(res, 400, false, "All fields are required.");
    }

    const contact = await Contact.create({
        name,
        email,
        mobile_no,
        message,
    });

    sendResponse(res, 201, true, "Inquiry submitted successfully!", contact);
});

// @desc    Get all inquiries (For Admin)
// @route   GET /api/contact
exports.getAllInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    sendResponse(res, 200, true, "All inquiries fetched", inquiries);
});

// @desc    Delete an inquiry
// @route   DELETE /api/contact/:id
exports.deleteInquiry = asyncHandler(async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
        return sendError(res, 404, false, "Inquiry not found");
    }

    sendResponse(res, 200, true, "Inquiry deleted successfully");
});