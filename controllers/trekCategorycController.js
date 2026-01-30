const TrekCategory = require("../models/TrekCategory");
const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");


exports.createCategory = asyncHandler(async (req, res) => {
    const { categoryId, title, description, tag, difficulty, isActive } = req.body;

    if (!categoryId || !title) {
        return sendError(res, 400, false, "categoryId and title are required");
    }

    let catImage = req.file ? req.file.filename : undefined;

    const category = await TrekCategory.create({
        categoryId,
        title,
        description,
        tag,
        difficulty,
        catImage,
        isActive,
    });

    return sendResponse(res, 201, true, "Trek category created successfully", category);
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

    return sendResponse(res, 200, "Trek categories fetched successfully", categories);
});

exports.getCategoryById = asyncHandler(async (req, res) => {
    const category = await TrekCategory.findById(req.params.id).lean();

    if (!category) return sendError(res, 404, "Trek category not found");

    category.trekCount = await Trek.countDocuments({ category: category._id });

    return sendResponse(res, 200, "Trek category fetched successfully", category);
});


exports.updateCategory = asyncHandler(async (req, res) => {
    const allowedFields = ["categoryId", "title", "description", "tag", "difficulty", "isActive"];
    const updateFields = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    if (req.file) updateFields.catImage = req.file.filename;

    const category = await TrekCategory.findByIdAndUpdate(req.params.id, updateFields, {
        new: true,
        runValidators: true,
    });

    if (!category) return sendError(res, 404, "Trek category not found");

    return sendResponse(res, 200, "Trek category updated successfully", category);
});


exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await TrekCategory.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!category) return sendError(res, 404, "Trek category not found");

    return sendResponse(res, 200, "Trek category deactivated successfully", category);
});
