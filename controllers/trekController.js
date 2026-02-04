
const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload");


const calculateStatus = (start, end) => {
  const today = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (today < startDate) return "Upcoming";
  if (today >= startDate && today <= endDate) return "Ongoing";
  return "Completed";
};

// @desc    Create new trek
// @route   POST /api/treks
exports.createTrek = asyncHandler(async (req, res) => {

  const {
    title,
    location,
    difficulty,
    category,
    bookingType,
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
    startDate,
    endDate,
    feeDetails,
    addons,
    proTrekkerBenefit,
    govtEligibility,
    links,
  } = req.body;

  let mainImage = null;
  let galleryImages = [];


  if (req.files?.TrekImage?.[0]) {
    mainImage = await uploadToAws({
      file: req.files.TrekImage[0],
      fileName: `trek_main_${Date.now()}`,
      folderName: "Treks",
    });
  }


  if (req.files?.TrekGallery?.length > 0) {
    galleryImages = await Promise.all(
      req.files.TrekGallery.map((file, index) =>
        uploadToAws({
          file: file,
          fileName: `trek_gallery_${index}_${Date.now()}`,
          folderName: "Treks/trekkvede-gallery",
        })
      )
    );
  }


  const status = calculateStatus(startDate, endDate);

  const trek = await Trek.create({
    title,
    location,
    difficulty,
    category,
    bookingType,
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
    startDate,
    endDate,
    feeDetails,
    addons,
    proTrekkerBenefit,
    govtEligibility,
    links,
    status,
    image: mainImage,
    gallery: galleryImages,
  });

  sendResponse(res, 201, true, "Trek created successfully", trek);
});

// @desc    Get all active treks
// @route   GET /api/treks
exports.getAllTreks = asyncHandler(async (req, res) => {
  const treks = await Trek.find({ isActive: true })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  sendResponse(res, 200, true, "Treks fetched successfully", treks);
});

// @desc    Get single trek
// @route   GET /api/treks/:id
exports.getTrekById = asyncHandler(async (req, res) => {
  const trek = await Trek.findOne({ _id: req.params.id, isActive: true })
    .populate("category")
    .populate("slots");

  if (!trek) return sendError(res, 404, false, "Trek not found or inactive");

  sendResponse(res, 200, true, "Trek fetched successfully", trek);
});


// @desc    Update trek
// @route   PUT /api/treks/:id
exports.updateTrek = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Find the existing trek
  let trek = await Trek.findById(id);
  if (!trek) {
    return sendError(res, 404, false, "Trek not found");
  }

  // 2. Destructure all fields from req.body
  const {
    title,
    location,
    difficulty,
    category,
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
    startDate,
    endDate,
    feeDetails,
    addons,
    proTrekkerBenefit,
    govtEligibility,
    links,
    isActive
  } = req.body;

  // 3. Handle Main Image (Preserve existing if no new file)
  let mainImage = trek.image;
  if (req.files?.TrekImage?.[0]) {
    mainImage = await uploadToAws({
      file: req.files.TrekImage[0],
      fileName: `trek_main_${Date.now()}`,
      folderName: "Treks",
    });
  }

  // 4. Handle Gallery (Append new images to existing list)
  let galleryImages = trek.gallery;
  if (req.files?.TrekGallery?.length > 0) {
    const newGalleryResults = await Promise.all(
      req.files.TrekGallery.map((file, index) =>
        uploadToAws({
          file: file,
          fileName: `trek_gallery_${index}_${Date.now()}`,
          folderName: "Treks/trekkvede-gallery",
        })
      )
    );
    galleryImages = [...trek.gallery, ...newGalleryResults];
  }


  const finalStatus = calculateStatus(
    startDate || trek.startDate,
    endDate || trek.endDate
  );

  // 6. Update in Database
  const updatedTrek = await Trek.findByIdAndUpdate(
    id,
    {
      title,
      location,
      difficulty,
      category,
      duration,
      bookingType,
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
      startDate,
      endDate,
      feeDetails,
      addons,
      proTrekkerBenefit,
      govtEligibility,
      links,
      isActive,
      status: finalStatus,
      image: mainImage,
      gallery: galleryImages,
    },
    { new: true, runValidators: true }
  );

  sendResponse(res, 200, true, "Trek updated successfully", updatedTrek);
});

// @desc    Filter by difficulty
// @route   GET /api/treks/filter
exports.filterTreksByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;

  // Check if categoryId is provided
  if (!categoryId) {
    return sendError(res, 400, false, "Category ID is required for filtering.");
  }


  const treks = await Trek.find({
    category: categoryId,
    isActive: true
  })
    .populate("category")
    .sort({ createdAt: -1 });

  if (treks.length === 0) {
    return sendResponse(res, 200, true, "No treks found for this category", []);
  }

  sendResponse(res, 200, true, "Filtered treks by category fetched", treks);
});

// @desc    Soft delete trek
// @route   DELETE /api/treks/:id
exports.deleteTrek = asyncHandler(async (req, res) => {
  const trek = await Trek.findById(req.params.id);
  if (!trek) return sendError(res, 404, false, "Trek not found");

  trek.isActive = false;
  await trek.save();

  sendResponse(res, 200, true, "Trek deactivated successfully");
});