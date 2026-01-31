const TrekReview = require("../models/TrekReview");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload");

exports.addReview = asyncHandler(async (req, res) => {
  const { trekId, name, rating, description } = req.body;

  if (!trekId || !name || !rating || !description) {
    return sendError(
      res,
      400,
      false,
      "सर्व फील्ड्स आवश्यक आहेत. (All fields are required)",
    );
  }

  let profilePhotoData = null;

  if (req.file) {
    try {
      profilePhotoData = await uploadToAws({
        file: req.file,
        fileName: `review_${Date.now()}`,
        folderName: "review/trek-review",
      });
    } catch (error) {
      console.error("AWS Upload Error:", error.message);
    }
  }

  const review = await TrekReview.create({
    trekId,
    name,
    profilePhoto: profilePhotoData,
    rating,
    description,
  });

  return sendResponse(
    res,
    201,
    true,
    "रिव्ह्यू यशस्वीरित्या जोडला गेला!",
    review,
  );
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await TrekReview.findById(req.params.id);
  if (!review) return sendError(res, 404, false, "रिव्ह्यू सापडला नाही");

  let profilePhotoData = review.profilePhoto;

  if (req.file) {
    profilePhotoData = await uploadToAws({
      file: req.file,
      fileName: `review_update_${Date.now()}`,
      folderName: "review/trek-review",
    });
  }

  const updatedReview = await TrekReview.findByIdAndUpdate(
    req.params.id,
    { ...req.body, profilePhoto: profilePhotoData },
    { new: true, runValidators: true },
  );

  return sendResponse(
    res,
    200,
    true,
    "रिव्ह्यू यशस्वीरित्या अपडेट झाला!",
    updatedReview,
  );
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
