const Admin = require("../models/Admin");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return sendError(res, 400, false, "Admin with this email already exists");
  }

  const admin = await Admin.create({ name, email, password });

  sendResponse(res, 201, true, "Admin registered successfully", admin);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, false, "Please provide email and password");
  }

  const admin = await Admin.findOne({ email }).select("+password");

  admin.lastLogin = Date.now();
  await admin.save({ validateBeforeSave: false });
  admin.password = undefined;

  sendResponse(res, 200, true, "Logged in successfully", { admin });
});

exports.getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find();
  sendResponse(res, 200, true, "All admins fetched", admins);
});

exports.getById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return sendError(res, 404, false, "Admin not found");
  }

  sendResponse(res, 200, true, "Admin profile fetched", admin);
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  let admin = await Admin.findById(req.params.id);

  if (!admin) {
    return sendError(res, 404, false, "Admin not found");
  }

  admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendResponse(res, 200, true, "Admin updated successfully", admin);
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return sendError(res, 404, false, "Admin not found");
  }

  await admin.deleteOne();
  sendResponse(res, 200, true, "Admin deleted successfully", null);
});
