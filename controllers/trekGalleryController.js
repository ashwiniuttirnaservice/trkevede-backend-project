const TrekGallery = require("../models/TrekGallery");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload");

exports.addGallery = asyncHandler(async (req, res) => {
  // 1. Validation
  if (!req.files || req.files.length === 0) {
    return sendError(
      res,
      400,
      false,
      "कृपया किमान एक इमेज निवडा (Please upload at least one image)",
    );
  }

  const galleryItems = await Promise.all(
    req.files.map(async (file, index) => {
      const uploadResult = await uploadToAws({
        file: file,
        fileName: `gallery_${Date.now()}_${index}`,
        folderName: "gallery/trek-gallery",
      });

      return {
        photo: uploadResult, // Stores the Object { url, key }
        title: Array.isArray(req.body.title)
          ? req.body.title[index]
          : req.body.title || `Image ${index + 1}`,
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
      };
    }),
  );

  const galleryDoc = await TrekGallery.create({ gallery: galleryItems });

  return sendResponse(
    res,
    201,
    true,
    "गॅलरी यशस्वीरित्या जोडली गेली! (Gallery added successfully)",
    galleryDoc,
  );
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
      },
    },
  ]);

  return sendResponse(res, 200, true, "Gallery fetched successfully", gallery);
});

exports.updateGallery = asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the ID of the TrekGallery document

  const galleryDoc = await TrekGallery.findById(id);
  if (!galleryDoc) return sendError(res, 404, false, "Gallery not found");

  // --- PART 1: ADD NEW IMAGES TO GALLERY ---
  if (req.files && req.files.length > 0) {
    const newImages = await Promise.all(
      req.files.map(async (file, index) => {
        const uploadResult = await uploadToAws({
          file: file,
          fileName: `gallery_update_${Date.now()}_${index}`,
          folderName: "gallery/trek-gallery",
        });

        return {
          photo: uploadResult,
          title: Array.isArray(req.body.title)
            ? req.body.title[index]
            : req.body.title || `New Image`,
          season: Array.isArray(req.body.season)
            ? req.body.season[index]
            : req.body.season,
          month: Array.isArray(req.body.month)
            ? req.body.month[index]
            : req.body.month,
          year: Array.isArray(req.body.year)
            ? req.body.year[index]
            : req.body.year,
          experience: Array.isArray(req.body.experience)
            ? req.body.experience[index]
            : req.body.experience,
          region: Array.isArray(req.body.region)
            ? req.body.region[index]
            : req.body.region,
        };
      }),
    );

    galleryDoc.gallery.push(...newImages);
  }

  if (req.body.updates) {
    const metadataUpdates =
      typeof req.body.updates === "string"
        ? JSON.parse(req.body.updates)
        : req.body.updates;

    metadataUpdates.forEach((update) => {
      const item = galleryDoc.gallery.id(update._id);
      if (item) {
        if (update.title) item.title = update.title;
        if (update.season) item.season = update.season;
        if (update.month) item.month = update.month;
        if (update.year) item.year = update.year;
        if (update.experience) item.experience = update.experience;
        if (update.region) item.region = update.region;
        if (typeof update.isActive !== "undefined")
          item.isActive = update.isActive;
      }
    });
  }

  await galleryDoc.save();

  return sendResponse(
    res,
    200,
    true,
    "गॅलरी यशस्वीरित्या अपडेट झाली! (Gallery updated successfully)",
    galleryDoc,
  );
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
  const { galleryId, itemId } = req.params;
  const galleryDoc = await TrekGallery.findById(galleryId);
  if (!galleryDoc) return sendError(res, 404, "Gallery not found");

  const item = galleryDoc.gallery.id(itemId);
  if (!item) return sendError(res, 404, "Gallery item not found");

  item.remove();
  await galleryDoc.save();

  return sendResponse(
    res,
    200,
    "Gallery item deleted successfully",
    galleryDoc,
  );
});
