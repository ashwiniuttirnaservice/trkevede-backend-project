const TrekGallery = require("../models/TrekGallery");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload");

exports.addGallery = asyncHandler(async (req, res) => {
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

  if (season && season !== "All") matchStage["gallery.season"] = season;
  if (month && month !== "All") matchStage["gallery.month"] = month;
  if (year && year !== "All") matchStage["gallery.year"] = year;
  if (experience && experience !== "All")
    matchStage["gallery.experience"] = experience;
  if (region && region !== "All") matchStage["gallery.region"] = region;

  const gallery = await TrekGallery.aggregate([
    { $unwind: "$gallery" },
    { $match: matchStage },
    {
      $project: {
        _id: "$gallery._id",
        photo: "$gallery.photo",
        title: "$gallery.title",
        month: "$gallery.month",
        year: "$gallery.year",
        season: "$gallery.season",
        experience: "$gallery.experience",
        region: "$gallery.region",
        isActive: "$gallery.isActive",
      },
    },
  ]);

  return sendResponse(res, 200, true, "Gallery fetched successfully", gallery);
});

exports.getGalleryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const galleryDoc = await TrekGallery.findOne({ "gallery._id": itemId });

  if (!galleryDoc) {
    return sendError(res, 404, false, "Gallery item not found");
  }

  const singleItem = galleryDoc.gallery.id(itemId);

  return sendResponse(res, 200, true, "Item fetched successfully", singleItem);
});

exports.updateGalleryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { title, season, month, year, experience, region } = req.body;

  // 1. Pehle ye check karo ki kya ye item exist karta hai
  const galleryDoc = await TrekGallery.findOne({ "gallery._id": itemId });

  if (!galleryDoc) {
    return sendError(res, 404, false, "Item not found in any gallery");
  }

  // Purana item nikaal lo (AWS deletion ke liye agar zarurat pade)
  const oldItem = galleryDoc.gallery.id(itemId);
  let updatedPhoto = oldItem.photo;

  // 2. Agar nayi file upload hui hai
  if (req.file) {
    // Purani file delete karna (optional)
    if (updatedPhoto && updatedPhoto.key) {
      await deleteFromAws(updatedPhoto.key);
    }

    const uploadResult = await uploadToAws({
      file: req.file,
      fileName: `gallery_updated_${Date.now()}`,
      folderName: "gallery/trek-gallery",
    });
    updatedPhoto = uploadResult;
  }

  // 3. Atomic update using positional operator ($)
  const updatedDoc = await TrekGallery.findOneAndUpdate(
    { "gallery._id": itemId },
    {
      $set: {
        "gallery.$.photo": updatedPhoto,
        "gallery.$.title": title || oldItem.title,
        "gallery.$.season": season || oldItem.season,
        "gallery.$.month": month || oldItem.month,
        "gallery.$.year": year || oldItem.year,
        "gallery.$.experience": experience || oldItem.experience,
        "gallery.$.region": region || oldItem.region,
      },
    },
    { new: true }
  );

  return sendResponse(
    res,
    200,
    true,
    "गॅलरी आयटम अपडेट झाला! (Item updated successfully)",
    updatedDoc
  );
});

exports.deleteGalleryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const galleryDoc = await TrekGallery.findOne({
    "gallery._id": itemId,
  });

  if (!galleryDoc) {
    return sendError(res, 404, false, "Gallery item not found");
  }

  galleryDoc.gallery.pull({ _id: itemId });

  await galleryDoc.save();

  return sendResponse(res, 200, true, "Gallery item deleted successfully");
});
