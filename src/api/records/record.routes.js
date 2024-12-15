const express = require('express');
const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require('./record.controller');

const router = express.Router();

// Ruta para crear un expediente
router.post('/', createRecord);

// Ruta para obtener todos los expedientes
router.get('/', getRecords);

// Ruta para actualizar un expediente
router.put('/:id', updateRecord);

// Ruta para eliminar un expediente
router.delete('/:id', deleteRecord);

module.exports = router;
