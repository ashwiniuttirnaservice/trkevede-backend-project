const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
    getAllPayments, // <-- new
} = require("../controllers/paymentController");

// Payment Endpoints
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getAllPayments); // <-- new endpoint to get all payments


module.exports = router;
