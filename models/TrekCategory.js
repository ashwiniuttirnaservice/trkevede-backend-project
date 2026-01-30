
const mongoose = require("mongoose");

const TrekCategorySchema = new mongoose.Schema(
    {
        categoryId: { type: String, required: true, unique: true },
        title: { type: String },
        description: { type: String },
        tag: { type: String },
        trekCount: { type: Number, default: 0 },
        difficulty: {
            type: String,
            enum: ["Easy", "Moderate", "Challenging", "Difficult", "Expert"],
        },
        catImage: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TrekCategory", TrekCategorySchema);
