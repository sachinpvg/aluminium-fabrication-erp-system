const mongoose = require("mongoose");

const WindowSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    image: String,
    windowType: {
        type: String,
        enum: ["Aluminium", "UPVC", "Aluminium & UPVC"],
        default: "Aluminium"
    },
    price_per_sqft: { type: Number, required: true },
    labour_charge: { type: Number, default: 0 },
    rubber_charge: { type: Number, default: 0 },
    service_charge: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Window", WindowSchema);