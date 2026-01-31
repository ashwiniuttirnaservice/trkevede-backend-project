const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

require("dotenv").config(); // <--- HI LINE ADD KARA

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Ata yala value milel
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return sendError(res, 400, false, "Amount is required");
  }

  try {
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return sendResponse(res, 201, true, "Order Created Successfully", order);
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);

    // Error status code check kara, jar nasel tar 500 vapra
    const statusCode = error.statusCode || 500;
    const message = error.error
      ? error.error.description
      : "Razorpay Order Failed";

    return sendError(res, statusCode, false, message);
  }
});
// @desc    Verify Payment and Save Booking
// @route   POST /api/payments/verify-payment
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingData,
  } = req.body;

  // 1. Signature check karne
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return sendError(res, false, 400, "Invalid Payment Signature!");
  }

  // 2. Booking Database madhe save karne
  const booking = await Booking.create({
    ...bookingData,
    paymentDetails: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "Captured",
    },
  });

  sendResponse(res, 201, true, "Payment Verified & Booking Success", booking);
});
