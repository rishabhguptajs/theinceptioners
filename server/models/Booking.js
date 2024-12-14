import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
    match: /.+\@.+\..+/
  },
  customerPhone: {
    type: String,
    required: true,
  },
  numberOfTravelers: {
    type: Number,
    required: true,
    min: 1,
  },
  specialRequests: {
    type: [String],
    default: [],
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package", 
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;