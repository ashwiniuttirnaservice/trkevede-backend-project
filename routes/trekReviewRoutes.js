const express = require("express");
const router = express.Router();

const trekReviewController = require("../controllers/trekReviewController");
const upload = require("../middleware/multer");

router.post(
  "/",
  upload.single("TrekReviewImage"),
  trekReviewController.addReview,
);

router.put(
  "/:id",
  upload.single("TrekReviewImage"),
  trekReviewController.updateReview,
);

router.get("/", trekReviewController.getAllReviews);

router.get("/trek/:trekId", trekReviewController.getReviewsByTrek);

router.delete("/:id", trekReviewController.deleteReview);

module.exports = router;
