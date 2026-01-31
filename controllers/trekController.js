const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload"); // He line top la add kara
const calculateStatus = (startDate, endDate) => {
  const today = new Date();

  if (today < startDate) return "Upcoming";
  if (today >= startDate && today <= endDate) return "Ongoing";
  return "Completed";
};

exports.createTrek = asyncHandler(async (req, res) => {
  const {
    title,
    location,
    difficulty,
    duration,
    groupSize,
    price,
    rating,
    reviews,
    featured,
    season,
    altitude,
    tags,
    highlight,
    bestFor,
    discount,
    description,
    reviewsData,
    trekInfo,
    feeDetails,
    addons,
    proTrekkerBenefit,
    govtEligibility,
    links,
    months,
    startDate,
    endDate,
    category,
  } = req.body;

  let mainImage = null;
  let galleryImages = [];

  if (req.files?.TrekImage?.[0]) {
    const file = req.files.TrekImage[0];
    mainImage = await uploadToAws({
      file: file,
      fileName: `trek_main_${Date.now()}`,
      folderName: "Treks",
    });
  }

  // 2. Handle Gallery Images (TrekGallery)
  if (req.files?.TrekGallery?.length > 0) {
    galleryImages = await Promise.all(
      req.files.TrekGallery.map((file, index) =>
        uploadToAws({
          file: file,
          fileName: `trek_gallery_${index}_${Date.now()}`,
          folderName: "Treks/trekkvede-gallery",
        }),
      ),
    );
  }

  // 3. Status and Save
  const status = calculateStatus(new Date(startDate), new Date(endDate));

  const trek = await Trek.create({
    title,
    location,
    difficulty,
    duration,
    groupSize,
    price,
    rating,
    reviews,
    featured,
    season,
    altitude,
    tags,
    highlight,
    bestFor,
    discount,
    description,
    reviewsData,
    trekInfo,
    feeDetails,
    addons,
    proTrekkerBenefit,
    govtEligibility,
    links,
    months,
    status,
    startDate,
    endDate,
    category,
    image: mainImage,
    gallery: galleryImages,
  });

  sendResponse(res, 201, true, "Trek created successfully", trek);
});

exports.getAllTreks = asyncHandler(async (req, res) => {
  const treks = await Trek.find({ isActive: true }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, "Treks fetched successfully", treks);
});

exports.getTrekById = asyncHandler(async (req, res) => {
  const trek = await Trek.findById(req.params.id);

  if (!trek) return sendError(res, 404, false, "Trek not found");

  sendResponse(res, 200, true, "Trek fetched successfully", trek);
});

exports.updateTrek = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find existing trek
  let trek = await Trek.findById(id);
  if (!trek) {
    return sendError(res, 404, false, "Trek not found");
  }

  // 2. Handle Main Image Update
  let mainImage = trek.image; // Default to existing
  if (req.files?.TrekImage?.[0]) {
    const file = req.files.TrekImage[0];
    mainImage = await uploadToAws({
      file: file,
      fileName: `trek_main_${Date.now()}`,
      folderName: "Treks",
    });
  }

  // 3. Handle Gallery Update
  // Note: This logic replaces the gallery. To append, use: [...trek.gallery, ...newImages]
  let galleryImages = trek.gallery;
  if (req.files?.TrekGallery?.length > 0) {
    const newGalleryResults = await Promise.all(
      req.files.TrekGallery.map((file, index) =>
        uploadToAws({
          file: file,
          fileName: `trek_gallery_${index}_${Date.now()}`,
          folderName: "Treks/trekkvede-gallery",
        }),
      ),
    );
    galleryImages = newGalleryResults;
  }

  // 4. Calculate Status (if dates changed)
  const startDate = req.body.startDate || trek.startDate;
  const endDate = req.body.endDate || trek.endDate;
  const status = calculateStatus(new Date(startDate), new Date(endDate));

  // 5. Update in Database
  const updatedTrek = await Trek.findByIdAndUpdate(
    id,
    {
      ...req.body,
      image: mainImage,
      gallery: galleryImages,
      status: status,
    },
    { new: true, runValidators: true },
  );

  sendResponse(res, 200, true, "Trek updated successfully", updatedTrek);
});

exports.filterTreksByDifficulty = asyncHandler(async (req, res) => {
  const { difficulty } = req.query;

  const allowedDifficulties = [
    "Easy",
    "Moderate",
    "Challenging",
    "Difficult",
    "Extreme",
  ];
  if (!difficulty || !allowedDifficulties.includes(difficulty)) {
    return sendError(
      res,
      400,
      false,
      `Invalid difficulty. Allowed values: ${allowedDifficulties.join(", ")}`,
    );
  }

  const treks = await Trek.find({ difficulty }).sort({ createdAt: -1 });

  sendResponse(
    res,
    200,
    true,
    `Treks with difficulty "${difficulty}" fetched successfully`,
    treks,
  );
});

exports.deleteTrek = asyncHandler(async (req, res) => {
  const trek = await Trek.findById(req.params.id);

  if (!trek) return sendError(res, 404, false, "Trek not found");

  trek.isActive = false;
  await trek.save();

  sendResponse(res, 200, true, "Trek deleted successfully");
});
