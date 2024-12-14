import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    availableDates: {
        type: [Date],
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String
    },
}, { timestamps: true });

const Package = mongoose.model("Package", packageSchema);

export default Package;
