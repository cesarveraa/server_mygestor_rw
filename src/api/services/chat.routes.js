const express = require('express');
const { getChatResponse} = require("./chat.controller");
const router = express.Router();

router.post('/', getChatResponse);

module.exports = router;
