const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./src/config/firebaseConfig');

const app = express();

// Configuración de CORS: permite cualquier origen temporalmente
app.use(cors({
  origin: '*', // Permitir cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  credentials: true, // Permitir cookies o encabezados personalizados
}));

// Middleware para manejar solicitudes preflight (OPTIONS)
app.options('*', cors());

// Middleware para parsear JSON
app.use(express.json());

// Rutas
const userRoutes = require('./src/api/user/user.routes');
const authRoutes = require('./src/api/auth/auth.routes');

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Probar conexión con Firestore
db ? console.log("Firestore conectado correctamente") : console.error("Error al conectar con Firestore");

module.exports = app;
