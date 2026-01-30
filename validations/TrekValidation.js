const Joi = require("joi");


const trekValidationSchema = Joi.object({
    title: Joi.string()
        .trim()
        .required()
        .messages({
            "string.empty": "Title is required",
            "any.required": "Title is required",
        }),

    location: Joi.string()
        .required()
        .messages({
            "string.empty": "Location is required",
            "any.required": "Location is required",
        }),

    difficulty: Joi.string()
        .valid("Easy", "Moderate", "Challenging", "Difficult", "Extreme")
        .required()
        .messages({
            "any.only": "Difficulty must be one of Easy, Moderate, Challenging, Difficult, Extreme",
            "any.required": "Difficulty is required",
        }),

    duration: Joi.string()
        .required()
        .messages({
            "string.empty": "Duration is required",
            "any.required": "Duration is required",
        }),

    groupSize: Joi.string()
        .required()
        .messages({
            "string.empty": "Group size is required",
            "any.required": "Group size is required",
        }),

    price: Joi.number()
        .required()
        .messages({
            "number.base": "Price must be a number",
            "any.required": "Price is required",
        }),

    rating: Joi.number()
        .default(0)
        .messages({ "number.base": "Rating must be a number" }),

    reviews: Joi.number()
        .default(0)
        .messages({ "number.base": "Reviews must be a number" }),

    image: Joi.string()
        .required()
        .messages({
            "string.empty": "Main image is required",
            "any.required": "Main image is required",
        }),

    featured: Joi.boolean().default(false),
    season: Joi.string().allow("", null),
    altitude: Joi.string().allow("", null),
    tags: Joi.array().items(Joi.string()).default([]),
    highlight: Joi.string().allow("", null),
    bestFor: Joi.string().allow("", null),
    discount: Joi.number().default(0),
    description: Joi.array().items(Joi.string()).default([]),


    reviewsData: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required().messages({ "any.required": "Reviewer name is required" }),
                role: Joi.string().required().messages({ "any.required": "Reviewer role is required" }),
                title: Joi.string().required().messages({ "any.required": "Review title is required" }),
                desc: Joi.string().required().messages({ "any.required": "Review description is required" }),
            })
        )
        .default([]),


    images: Joi.array().items(Joi.string()).default([]),


    trekInfo: Joi.array()
        .items(
            Joi.object({
                title: Joi.string().required().messages({ "any.required": "Trek info title is required" }),
                value: Joi.string().required().messages({ "any.required": "Trek info value is required" }),
                img: Joi.string().allow("", null),
            })
        )
        .default([]),

    feeDetails: Joi.object({
        baseFee: Joi.number().required().messages({ "any.required": "Base fee is required" }),
        gstPercent: Joi.number().default(5),
        insurance: Joi.number().default(180),
        transport: Joi.number().default(2800),
    }).required(),


    addons: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().required().messages({ "any.required": "Addon name is required" }),
                price: Joi.number().required().messages({ "any.required": "Addon price is required" }),
                description: Joi.string().allow("", null),
            })
        )
        .default([]),

    proTrekkerBenefit: Joi.string().allow("", null),
    govtEligibility: Joi.string().allow("", null),


    links: Joi.object({
        inclusions: Joi.string().allow("", null),
        terms: Joi.string().allow("", null),
        cancellation: Joi.string().allow("", null),
        scholarships: Joi.string().allow("", null),
    }).default({}),

    months: Joi.array()
        .items(
            Joi.object({
                month: Joi.string().required().messages({ "any.required": "Month is required" }),
                season: Joi.string().allow("", null),
                badge: Joi.string().allow("", null),
                slotsAvailable: Joi.boolean().default(true),
            })
        )
        .default([]),
});

module.exports = trekValidationSchema;
