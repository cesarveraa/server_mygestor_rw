const express = require('express');
const router = express.Router();
const { getDocumentsByUserId} = require('./document.controller');

router.get("/user-documents", getDocumentsByUserId);

module.exports = router;
