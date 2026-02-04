const TrekCategory = require("../models/TrekCategory");
const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const uploadToAws = require("../help/awsUpload");
exports.createCategory = asyncHandler(async (req, res) => {
  const { categoryId, title, description, tag, difficulty, isActive } =
    req.body;

  if (!categoryId || !title) {
    return sendError(res, 400, false, "categoryId and title are required");
  }

  let catImageData = null;


  if (req.file) {
    try {
      catImageData = await uploadToAws({
        file: req.file,
        fileName: `category_${Date.now()}`,
        folderName: "category/trekkvede-category",
      });
    } catch (awsError) {
      console.error("AWS Category Upload Error:", awsError.message);
    }
  }

  const category = await TrekCategory.create({
    categoryId,
    title,
    description,
    tag,
    difficulty,
    catImage: catImageData,
    isActive,
  });

  return sendResponse(
    res,
    201,
    true,
    "Trek category created successfully",
    category,
  );
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const { isActive } = req.query;
  const filter = {};

  if (isActive !== undefined) filter.isActive = isActive === "true";

  const categories = await TrekCategory.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  for (let cat of categories) {
    const count = await Trek.countDocuments({ category: cat._id });
    cat.trekCount = count;
  }

  return sendResponse(
    res,
    200,
    "Trek categories fetched successfully",
    categories,
  );
});

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await TrekCategory.findById(req.params.id).lean();

  if (!category) return sendError(res, 404, "Trek category not found");

  category.trekCount = await Trek.countDocuments({ category: category._id });

  return sendResponse(res, 200, "Trek category fetched successfully", category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryId, title, description, tag, difficulty, isActive } =
    req.body;

  // 1. Find the existing category
  let category = await TrekCategory.findById(id);
  if (!category) {
    return sendError(res, 404, false, "Category not found");
  }

  // 2. Handle Image Update
  let catImageData = category.catImage; // Default to old image

  if (req.file) {
    try {
      // Upload new image to AWS
      catImageData = await uploadToAws({
        file: req.file,
        fileName: `category_${Date.now()}`,
        folderName: "category/trekkvede-category",
      });
    } catch (awsError) {
      console.error("AWS Category Update Error:", awsError.message);
    }
  }

  // 3. Update the document
  const updatedCategory = await TrekCategory.findByIdAndUpdate(
    id,
    {
      categoryId,
      title,
      description,
      tag,
      difficulty,
      catImage: catImageData,
      isActive,
    },
    { new: true, runValidators: true },
  );

  return sendResponse(
    res,
    200,
    true,
    "Trek category updated successfully",
    updatedCategory,
  );
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await TrekCategory.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!category) return sendError(res, 404, "Trek category not found");

  return sendResponse(
    res,
    200,
    "Trek category deactivated successfully",
    category,
  );
});
