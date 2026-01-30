const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");


exports.addToWishlist = asyncHandler(async (req, res) => {
    const { trekId } = req.body;

    if (!trekId) {
        return sendError(res, "Trek ID is required", 400);
    }

    const wishlist = await Wishlist.create({
        userId: req.user._id,
        trekId,
    });

    return sendResponse(res, wishlist, "Trek added to wishlist", 201);
});


exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const { trekId } = req.params;

    const removed = await Wishlist.findOneAndDelete({
        userId: req.user._id,
        trekId,
    });

    if (!removed) {
        return sendError(res, "Wishlist item not found", 404);
    }

    return sendResponse(res, null, "Trek removed from wishlist");
});


exports.getMyWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "treks",
                localField: "trekId",
                foreignField: "_id",
                as: "trek",
            },
        },
        { $unwind: "$trek" },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                trek: {
                    _id: 1,
                    title: 1,
                    location: 1,
                    price: 1,
                    image: 1,
                    difficulty: 1,
                    duration: 1,
                    groupSize: 1,
                    rating: 1,
                    reviews: 1,
                    discount: 1,
                    season: 1,
                    featured: 1,
                },
            },
        },
        { $sort: { createdAt: -1 } },
    ]);

    return sendResponse(res, wishlist, "Wishlist fetched successfully");
});


exports.checkWishlist = asyncHandler(async (req, res) => {
    const { trekId } = req.params;

    const exists = await Wishlist.findOne({
        userId: req.user._id,
        trekId,
    });

    return sendResponse(res, { isWishlisted: !!exists }, "Wishlist status");
});
