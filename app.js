const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./src/config/firebaseConfig');

const app = express();
app.use(cors({
    origin: '*', // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
    credentials: true, // Permitir cookies o encabezados personalizados
  }));
  
app.options('*', cors());  
app.use(express.json());


const multer = require("multer");
const upload = multer(); // Configuración de multer para datos sin archivos
app.use(express.urlencoded({ extended: true })); // Maneja datos en x-www-form-urlencoded

// Importar rutas
const userRoutes = require('./src/api/user/user.routes');
const authRoutes = require('./src/api/auth/auth.routes');
const recordRoutes = require('./src/api/record/record.routes');
const movementRoutes = require('./src/api/movement/movement.routes');
const audienceRoutes = require('./src/api/audience/audience.routes');
const chatRoutes = require('./src/api/services/chat.routes');
const documentRoutes = require("./src/api/document/document.routes");


app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/record', recordRoutes); 
app.use('/api/movement', movementRoutes);
app.use('/api/audience', audienceRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);

// Prueba de conexión con Firestore
db ? console.log("Firestore conectado correctamente") : console.error("Error al conectar con Firestore");
app.use(upload.none());
module.exports = app;
