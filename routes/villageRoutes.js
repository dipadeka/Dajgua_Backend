const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Village = require("../models/Village"); // adjust path as needed
 
const upload = multer({ storage: multer.memoryStorage() });
 
// --------------- Column name aliases ---------------
// Add any alternate spellings found in your Excel headers here
const COLUMN_MAP = {
  // District
  districtName: ["district name", "district", "dist name", "districtname", "dist"],
 
  // Village
  villageName: ["village name", "village", "villagename", "name of village"],
 
  // Area / Mouza
  areaName: ["area name", "area", "mouza name", "mouza", "areaname"],
 
  // Revenue Circle
  revenueCircle: ["revenue circle", "revenuecircle", "rev circle", "circle"],
 
  // Autonomous Council
  autonomousCouncil: [
    "autonomous council",
    "autonomouscouncil",
    "council",
    "autonomous district council",
    "adc",
  ],
 
  // Households
  totalHousehold: [
    "total household",
    "totalhousehold",
    "households",
    "no of household",
    "no. of household",
    "household",
    "hh",
    "no of hh",
  ],
 
  // Population
  totalPopulation: [
    "total population",
    "totalpopulation",
    "population",
    "total pop",
    "pop",
  ],
 
  // Male
  male: ["male", "male population", "male pop", "m"],
 
  // Female
  female: ["female", "female population", "female pop", "f"],
 
  // Forest Name
  forestName: ["forest name", "forestname", "forest", "name of forest", "rf name"],
 
  // DAJUGA
  dajugaVillage: [
    "dajuga village",
    "dajuga",
    "dajugavillage",
    "is dajuga",
    "dajuga (yes/no)",
    "dajuga?",
  ],
 
  // Sl No (optional)
  slNo: ["sl no", "slno", "sl. no", "sl no.", "serial no", "s.no", "sno"],
};
 
/**
 * Normalize a header string for comparison:
 * lowercase, trim, collapse spaces
 */
function normalizeHeader(h) {
  return String(h || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
 
/**
 * Given the raw headers from the Excel sheet, build a lookup:
 *   { fieldName -> actualExcelColumnKey }
 */
function buildHeaderMapping(rawHeaders) {
  const mapping = {};
  const normalizedRaw = rawHeaders.map((h) => ({
    original: h,
    normalized: normalizeHeader(h),
  }));
 
  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    for (const alias of aliases) {
      const match = normalizedRaw.find((h) => h.normalized === alias);
      if (match) {
        mapping[field] = match.original;
        break;
      }
    }
  }
  return mapping;
}
 
/**
 * Normalize a DAJUGA value → "YES" | "NO" | undefined
 */
function normalizeDajuga(val) {
  if (val === undefined || val === null || val === "") return undefined;
  const s = String(val).trim().toUpperCase();
  if (s === "YES" || s === "Y" || s === "1") return "YES";
  if (s === "NO" || s === "N" || s === "0") return "NO";
  return s; // keep as-is if something unexpected
}
 
// POST /villages/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
 
    // Parse workbook from buffer
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
 
    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
 
    // Convert to JSON (raw headers preserved)
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
 
    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: "Excel sheet is empty or unreadable." });
    }
 
    // Build header mapping from first row's keys
    const excelHeaders = Object.keys(rawRows[0]);
    const headerMap = buildHeaderMapping(excelHeaders);
 
    console.log("Detected header mapping:", headerMap);
 
    // Transform rows
    const villages = rawRows
      .filter((row) => {
        // Skip completely empty rows
        return Object.values(row).some((v) => v !== "" && v !== null && v !== undefined);
      })
      .map((row) => {
        const get = (field) => {
          const col = headerMap[field];
          return col !== undefined ? row[col] : undefined;
        };
 
        return {
          slNo: get("slNo"),
          districtName: String(get("districtName") || "").trim() || undefined,
          villageName: String(get("villageName") || "").trim() || undefined,
          areaName: String(get("areaName") || "").trim() || undefined,
          revenueCircle: String(get("revenueCircle") || "").trim() || undefined,
          autonomousCouncil: String(get("autonomousCouncil") || "").trim() || undefined,
          totalHousehold: get("totalHousehold") !== "" ? Number(get("totalHousehold")) || undefined : undefined,
          totalPopulation: get("totalPopulation") !== "" ? Number(get("totalPopulation")) || undefined : undefined,
          male: get("male") !== "" ? Number(get("male")) || undefined : undefined,
          female: get("female") !== "" ? Number(get("female")) || undefined : undefined,
          forestName: String(get("forestName") || "").trim() || undefined,
          dajugaVillage: normalizeDajuga(get("dajugaVillage")),
        };
      })
      .filter((v) => v.villageName || v.districtName); // must have at least village or district name
 
    if (villages.length === 0) {
      return res.status(400).json({
        error:
          "No valid village rows found. Check that your Excel has the correct columns. Detected columns: " +
          excelHeaders.join(", "),
      });
    }
 
    // Optional: clear existing data before re-importing
    // await Village.deleteMany({});
 
    // Insert into DB
    const inserted = await Village.insertMany(villages, { ordered: false });
 
    return res.json({
      success: true,
      count: inserted.length,
      mappedColumns: headerMap,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      error: "Upload failed: " + err.message,
    });
  }
});
 // POST /villages/undo-upload  — delete specific IDs from last upload
router.post("/undo-upload", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided." });
    }
    const result = await Village.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Undo upload error:", err);
    res.status(500).json({ error: "Undo failed: " + err.message });
  }
});
// GET /villages
router.get("/", async (req, res) => {
  try {
    const villages = await Village.find({}).lean();
    res.json(villages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch villages." });
  }
});
 router.delete("/all", async (req, res) => {
  try {
    const result = await Village.deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Clear all error:", err);
    res.status(500).json({ error: "Failed to clear data: " + err.message });
  }
});
 
module.exports = router;
