const TrekGallery = require("../models/TrekGallery");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const path = require("path");



exports.addGallery = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return sendError(res, 400, "Please upload at least one image");
    }

    const gallery = req.files.map((file, index) => ({
        photo: path.basename(file.path),

        title: Array.isArray(req.body.title)
            ? req.body.title[index]
            : req.body.title || `Image ${index + 1}`,

        // ⬇️ IMPORTANT FIX (NO "All")
        season: Array.isArray(req.body.season)
            ? req.body.season[index]
            : req.body.season || undefined,

        month: Array.isArray(req.body.month)
            ? req.body.month[index]
            : req.body.month || undefined,

        year: Array.isArray(req.body.year)
            ? req.body.year[index]
            : req.body.year || undefined,

        experience: Array.isArray(req.body.experience)
            ? req.body.experience[index]
            : req.body.experience || undefined,

        region: Array.isArray(req.body.region)
            ? req.body.region[index]
            : req.body.region || undefined,
    }));

    const galleryDoc = await TrekGallery.create({ gallery });

    return sendResponse(res, 201, "Gallery added successfully", galleryDoc);
});


exports.getAllGallery = asyncHandler(async (req, res) => {
    const { season, month, year, experience, region } = req.query;

    const matchStage = {
        "gallery.isActive": true,
    };

    if (season && season !== "All") {
        matchStage["gallery.season"] = season;
    }

    if (month && month !== "All") {
        matchStage["gallery.month"] = month;
    }

    if (year && year !== "All") {
        matchStage["gallery.year"] = year;
    }

    if (experience && experience !== "All") {
        matchStage["gallery.experience"] = experience;
    }

    if (region && region !== "All") {
        matchStage["gallery.region"] = region;
    }

    const gallery = await TrekGallery.aggregate([
        { $unwind: "$gallery" },
        { $match: matchStage },
        {
            $project: {
                _id: 0,
                photo: "$gallery.photo",
                title: "$gallery.title",
                month: "$gallery.month",
                year: "$gallery.year",
                season: "$gallery.season",
                experience: "$gallery.experience",
                region: "$gallery.region",
            }
        }
    ]);

    return sendResponse(
        res,
        200,
        true,
        "Gallery fetched successfully",
        gallery
    );
});


exports.updateGallery = asyncHandler(async (req, res) => {
    const galleryDoc = await TrekGallery.findById(req.params.id);
    if (!galleryDoc) return sendError(res, 404, "Gallery not found");


    if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
            galleryDoc.gallery.push({
                photo: path.basename(file.path),
                title: Array.isArray(req.body.title)
                    ? req.body.title[index]
                    : req.body.title || `Image ${galleryDoc.gallery.length + 1}`,
                season: Array.isArray(req.body.season)
                    ? req.body.season[index]
                    : req.body.season || "All",
                month: Array.isArray(req.body.month)
                    ? req.body.month[index]
                    : req.body.month || "All",
                year: Array.isArray(req.body.year)
                    ? req.body.year[index]
                    : req.body.year || "All",
                experience: Array.isArray(req.body.experience)
                    ? req.body.experience[index]
                    : req.body.experience || "All",
                region: Array.isArray(req.body.region)
                    ? req.body.region[index]
                    : req.body.region || "All",
            });
        });
    }

    // Update existing items
    if (req.body.gallery) {
        const updates = JSON.parse(req.body.gallery);
        updates.forEach((u) => {
            const item = galleryDoc.gallery.id(u._id);
            if (item) {
                if (u.title) item.title = u.title;
                if (u.season) item.season = u.season;
                if (u.month) item.month = u.month;
                if (u.year) item.year = u.year;
                if (u.experience) item.experience = u.experience;
                if (u.region) item.region = u.region;
            }
        });
    }

    await galleryDoc.save();
    return sendResponse(res, 200, "Gallery updated successfully", galleryDoc);
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
    const { galleryId, itemId } = req.params;
    const galleryDoc = await TrekGallery.findById(galleryId);
    if (!galleryDoc) return sendError(res, 404, "Gallery not found");

    const item = galleryDoc.gallery.id(itemId);
    if (!item) return sendError(res, 404, "Gallery item not found");

    item.remove();
    await galleryDoc.save();

    return sendResponse(res, 200, "Gallery item deleted successfully", galleryDoc);
});
