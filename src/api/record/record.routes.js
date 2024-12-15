const express = require("express");
const { createRecord, getRecords, updateRecord, deleteRecord, getRecordById } = require("./record.controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/", upload.single("archivo"), createRecord); // Manejar un solo archivo
router.put("/:id", upload.single("archivo"), updateRecord);
router.get("/", getRecords);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);
router.get('/:recordId', getRecordById);

module.exports = router;




