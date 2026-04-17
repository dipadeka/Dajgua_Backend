const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    // ── Location ──────────────────────────────────────────
    districtName: {
      type: String,
      required: [true, 'District name is required'],
      trim: true,
    },

    developmentBlock: {
      type: String,
      required: [true, 'Development block is required'],
      trim: true,
    },

    isGramPanchayatVillage: {
      type: Boolean,
      default: false,
    },

    gramPanchayatVillageName: {
      type: String,
      trim: true,
      default: '',
    },

    villageName: {
      type: String,
      required: [true, 'Village name is required'],
      trim: true,
    },

    parliamentConstituency: {
      type: String,
      trim: true,
      default: '',
    },

    assemblyConstituency: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Population ────────────────────────────────────────
    totalPopulation: {
      type: Number,
      default: 0,
      min: 0,
    },

    malePop: {
      type: Number,
      default: 0,
      min: 0,
    },

    femalePop: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalHouseholds: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── FRA ───────────────────────────────────────────────
    isFRAVillage: {
      type: Boolean,
      default: false,
    },

    fraTitle: {
      type: String,
      trim: true,
      default: '',        // FRA title number if applicable
    },

    fraTitleDate: {
      type: Date,
      default: null,      // date when FRA title was given
    },

    fraLandArea: {
      type: Number,
      default: 0,         // land area in hectares
    },

    // ── Upload tracking ───────────────────────────────────
    uploadedBy: {
      type: String,
      trim: true,
      default: 'unknown', // which department uploaded this
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',  // links to the Department collection
      default: null,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,  // auto saves current date and time
    },

    lastEditedAt: {
      type: Date,
      default: null,      // updates whenever someone edits the record
    },

    lastEditedBy: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,     // auto adds createdAt and updatedAt fields
  }
);

// This creates the "villages" collection in MongoDB
const Village = mongoose.model('Village', villageSchema);

module.exports = Village;