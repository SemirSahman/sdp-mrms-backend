const express = require("express");
const upload = require("../middlewares/upload.js");
const {
  getRecords,
  createRecord,
  updateRecord,
} = require("../controllers/records.controller.js");
const auth = require("../middlewares/auth.js");

const router = express.Router();

router.get("/", auth, getRecords);
router.post("/", auth, upload.single("file"), createRecord);
router.put("/:id", auth, upload.single("file"), updateRecord);

module.exports = router;
