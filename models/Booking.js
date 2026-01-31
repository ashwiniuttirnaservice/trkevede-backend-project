const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    trekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trek",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    pickupPoint: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    medicalHistory: { type: String, default: "None" },
    alternativeContact: { type: String, required: true },
    emergencyContact: { type: String, required: true },

    departureDate: { type: Date, required: true },
    numberOfPeople: { type: Number, required: true, default: 1 },

    bookingType: {
      type: String,
      enum: ["Trek", "Trek + Camping", "Trip"],
      required: true,
    },
    needCoupleTent: { type: Boolean, default: false },
    needPrivateRoom: { type: Boolean, default: false },

    additionalMembers: [
      {
        name: { type: String, required: true },
        whatsappNumber: { type: String, required: true },
      },
    ],

    totalAmount: { type: Number },
    paymentDetails: {
      orderId: String,
      paymentId: String,
      signature: String,
      status: {
        type: String,
        enum: ["Pending", "Captured", "Failed"],
        default: "Pending",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", BookingSchema);
