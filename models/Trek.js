const mongoose = require("mongoose");

const TrekSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        location: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["Easy", "Moderate", "Challenging", "Difficult", "Extreme"],
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TrekCategory",

        },
        duration: { type: String, required: true },
        groupSize: { type: String, required: true },
        price: { type: Number, required: true },
        rating: { type: Number, default: 0 },
        reviews: { type: Number, default: 0 },
        image: { type: String, required: false },
        featured: { type: Boolean, default: false },
        season: { type: String },
        altitude: { type: String },
        tags: { type: [String], default: [] },
        highlight: { type: String },
        bestFor: { type: String },
        discount: { type: Number, default: 0 },

        description: { type: String },

        reviewsData: [
            {
                name: String,
                role: String,
                title: String,
                desc: String,
            },
        ],

        gallery: { type: [String], require: false, default: [] },

        trekInfo: [
            {
                title: {
                    type: String,
                    required: true,
                    enum: [
                        "TREK DIFFICULTY",
                        "TREK DURATION",
                        "HIGHEST ALTITUDE",
                        "SUITABLE FOR",
                        "BASECAMP",
                        "ACCOMMODATION",
                        "FITNESS CRITERIA",
                        "PICKUP",
                        "DROPOFF",
                        "GEAR RENTAL",
                        "CLOAKROOM",
                        "OFFLOADING"
                    ],
                    immutable: true
                },
                value: { type: String, required: true },

            }
        ],

        status: {
            type: String,
            enum: ["Upcoming", "Ongoing", "Completed"],
            default: "Upcoming",
        },

        startDate: {
            type: String,

        },
        endDate: {
            type: String,

        },

        feeDetails: {
            baseFee: { type: Number, required: true },
            gstPercent: { type: Number, default: 5 },
            insurance: { type: Number, default: 180 },
            transport: { type: Number, default: 2800 },
        },

        addons: [
            {
                name: String,
                price: Number,
                description: String,
            },
        ],

        proTrekkerBenefit: { type: String },
        govtEligibility: { type: String },

        links: {
            inclusions: { type: String },
            terms: { type: String },
            cancellation: { type: String },
            scholarships: { type: String },
        },

        months: [
            {
                month: String,
                season: String,
                badge: String,
                slotsAvailable: { type: Boolean, default: true },
            },
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Trek", TrekSchema);
