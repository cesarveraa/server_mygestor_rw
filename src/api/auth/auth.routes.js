const express = require("express");
const { loginUser } = require("./auth.controller");

const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", loginUser);

module.exports = router;
