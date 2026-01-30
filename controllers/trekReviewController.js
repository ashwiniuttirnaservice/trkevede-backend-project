const TrekReview = require("../models/TrekReview");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.addReview = asyncHandler(async (req, res) => {
    let profilePhoto = null;

    if (req.file) {
        profilePhoto = req.file.filename;
    }

    const { trekId, name, rating, description } = req.body;

    if (!trekId || !name || !rating || !description) {
        return sendError(res, 400, "All fields are required");
    }

    const review = await TrekReview.create({
        trekId,
        name,
        profilePhoto,
        rating,
        description,
    });

    return sendResponse(res, 201, "Review added successfully", review);
});

exports.getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await TrekReview.find()
        .populate("trekId", "title location")
        .lean();
    return sendResponse(res, 200, "Reviews fetched successfully", reviews);
});


exports.getReviewsByTrek = asyncHandler(async (req, res) => {
    const { trekId } = req.params;
    const reviews = await TrekReview.find({ trekId, isActive: true })
        .populate("trekId", "title location")
        .lean();
    return sendResponse(res, 200, "Reviews fetched successfully", reviews);
});


exports.updateReview = asyncHandler(async (req, res) => {
    const review = await TrekReview.findById(req.params.id);
    if (!review) return sendError(res, 404, "Review not found");

    if (req.file) review.profilePhoto = req.file.path;

    const { name, rating, description } = req.body;

    if (name) review.name = name;
    if (rating) review.rating = rating;
    if (description) review.description = description;

    await review.save();
    return sendResponse(res, 200, "Review updated successfully", review);
});


exports.deleteReview = asyncHandler(async (req, res) => {
    const review = await TrekReview.findById(req.params.id);
    if (!review) return sendError(res, 404, "Review not found");

    review.isActive = false;
    await review.save();
    return sendResponse(res, 200, "Review deleted successfully", review);
});
