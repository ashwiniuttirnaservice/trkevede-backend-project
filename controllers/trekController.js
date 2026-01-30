const Trek = require("../models/Trek");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");


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

        category
    } = req.body;

    if (req.files?.TrekImage && req.files.TrekImage.length > 0) {

        const file = req.files.TrekImage[0];
        req.body.image = `${file.filename}`;
    }

    if (req.files?.TrekGallery && req.files.TrekGallery.length > 0) {

        req.body.gallery = req.files.TrekGallery.map(
            file => `${file.filename}`
        );
    }
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
        image: req.body.image,
        gallery: req.body.gallery
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
    const trek = await Trek.findById(req.params.id);
    if (!trek) return sendError(res, 404, false, "Trek not found");

    if (req.files?.TrekImage?.length) {
        req.body.image = req.files.TrekImage[0].filename;
    }

    if (req.files?.TrekGallery?.length) {
        const newGallery = req.files.TrekGallery.map(file => file.filename);
        req.body.gallery = trek.gallery.concat(newGallery);
    }

    const startDate = req.body.startDate || trek.startDate;
    const endDate = req.body.endDate || trek.endDate;

    req.body.status = calculateStatus(
        new Date(startDate),
        new Date(endDate)
    );

    const updatedTrek = await Trek.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    sendResponse(res, 200, true, "Trek updated successfully", updatedTrek);
});



exports.filterTreksByDifficulty = asyncHandler(async (req, res) => {
    const { difficulty } = req.query;


    const allowedDifficulties = ["Easy", "Moderate", "Challenging", "Difficult", "Extreme"];
    if (!difficulty || !allowedDifficulties.includes(difficulty)) {
        return sendError(
            res,
            400,
            false,
            `Invalid difficulty. Allowed values: ${allowedDifficulties.join(", ")}`
        );
    }


    const treks = await Trek.find({ difficulty }).sort({ createdAt: -1 });

    sendResponse(res, 200, true, `Treks with difficulty "${difficulty}" fetched successfully`, treks);
});




exports.deleteTrek = asyncHandler(async (req, res) => {
    const trek = await Trek.findById(req.params.id);

    if (!trek) return sendError(res, 404, false, "Trek not found");

    trek.isActive = false;
    await trek.save();

    sendResponse(res, 200, true, "Trek deleted successfully");
});
