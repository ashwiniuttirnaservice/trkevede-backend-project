const express = require("express");
const trekRoutes = require("./trekRoutes");
const trekCategoryRoutes = require("./trekCategoryRoutes");
const trekGalleryRoutes = require("./trekGalleryRoutes");
const trekReviewRoutes = require("./trekReviewRoutes");
const wishlistRoutes = require("./wishlistRoutes");

const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  res.send("LMS API is alive and running...");
});

indexRouter.use("/trek", trekRoutes);
indexRouter.use("/trekCategory", trekCategoryRoutes);
indexRouter.use("/trekGallery", trekGalleryRoutes);
indexRouter.use("/trekReview", trekReviewRoutes);
indexRouter.use("/wishlist", wishlistRoutes);
indexRouter.use("/bookings", require("./bookingRoutes"));
indexRouter.use("/payments", require("./paymentRoutes"));
module.exports = indexRouter;
