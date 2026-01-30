const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        trekId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trek",
            required: true,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);


WishlistSchema.index({ userId: 1, trekId: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", WishlistSchema);
