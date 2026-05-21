const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  width: String,
  height: String,
  material: String,
  type: String,
  qty: Number,
  info: String
});

const requirementSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  siteType: String,
  buildingStatus: String,
  location: String,
  items: [itemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Requirement", requirementSchema);