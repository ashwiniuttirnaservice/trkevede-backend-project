const mongoose = require("mongoose");

const SlotSchema = new mongoose.Schema({

  trekId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trek",
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  displayRange: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["AVBL", "FULL", "LIMITED", "FAST FILLING"],
    default: "AVBL",
  },
  totalSeats: {
    type: Number,
    default: 20,
  },
  bookedSeats: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Slot", SlotSchema);
