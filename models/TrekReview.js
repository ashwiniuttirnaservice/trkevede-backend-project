const mongoose = require("mongoose");

const TrekReviewSchema = new mongoose.Schema(
  {
    trekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trek",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    profilePhoto: {
      type: Object, // Changed to Object for AWS
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TrekReview", TrekReviewSchema);
