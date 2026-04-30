const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema({
  slNo: { type: Number },
  districtName: { type: String, index: true },
  villageName: { type: String, index: true },
  areaName: { type: String },
  revenueCircle: { type: String },
  stCommunity: { type: String },
  autonomousCouncil: { type: String },
  totalHousehold: { type: Number, default: 0 },
  totalPopulation: { type: Number, default: 0 },
  male: { type: Number, default: 0 },
  female: { type: Number, default: 0 },
  forestName: { type: String },
  dajugaVillage: { type: String, enum: ['YES', 'NO'], index: true },
}, { timestamps: true });

module.exports = mongoose.model('Village', villageSchema);