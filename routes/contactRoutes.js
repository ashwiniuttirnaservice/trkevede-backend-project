const express = require("express");
const router = express.Router();
const {
    submitInquiry,
    getAllInquiries,
    deleteInquiry,
} = require("../controllers/contactController");

// Public Route: User message bhej sakta hai
router.post("/submit", submitInquiry);

// Admin Routes: Messages dekhne aur delete karne ke liye
router.get("/all", getAllInquiries);
router.delete("/:id", deleteInquiry);

module.exports = router;