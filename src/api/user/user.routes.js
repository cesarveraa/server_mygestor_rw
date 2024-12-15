const express = require('express');
const { createUser, getUsers, updateUser, deleteUser } = require('./user.controller');

const router = express.Router();

// Ruta para crear un usuario
router.post('/', createUser);

// Ruta para obtener todos los usuarios
router.get('/', getUsers);

// Ruta para actualizar un usuario
router.put('/:id', updateUser);

// Ruta para eliminar un usuario
router.delete('/:id', deleteUser);

module.exports = router;
