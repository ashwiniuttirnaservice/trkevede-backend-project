const mongoose = require("mongoose");

const TrekGalleryItemSchema = new mongoose.Schema({
  photo: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  month: {
    type: String,
    enum: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  year: {
    type: String,
    enum: ["2023", "2024", "2025"],
  },
  experience: {
    type: String,
    enum: ["Beginner", "Moderate", "Advanced"],
  },
  season: {
    type: String,
    enum: ["Winter", "Spring", "Summer", "Autumn"],
  },
  region: {
    type: String,
    enum: ["Uttarakhand", "Himachal", "Kashmir", "Nepal", "Sikkim"],
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});

const TrekGallerySchema = new mongoose.Schema(
  {
    gallery: [TrekGalleryItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("TrekGallery", TrekGallerySchema);
