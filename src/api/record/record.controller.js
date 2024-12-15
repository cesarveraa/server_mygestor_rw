const { db } = require('../../config/firebaseConfig');
const { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc  } = require("firebase/firestore");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Carpeta temporal para archivos

// Crear un nuevo expediente
const createRecord = async (req, res) => {
  try {
    const { id, caso, juez, fecha, prioridad, participantes, estado } = req.body;

    // Validar campos obligatorios
    if (!id || !caso || !juez || !fecha || !prioridad || !participantes || estado === undefined) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const archivo = req.file ? req.file.path : null; // Archivo cargado (si existe)

    // Crear el expediente en Firestore
    const docRef = await addDoc(collection(db, 'records'), {
      id,
      caso,
      juez,
      fecha,
      prioridad,
      participantes: JSON.parse(participantes), // Convertir a JSON si viene como string
      archivo,
      estado: estado === "true" || estado === true, // Convertir a boolean
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Expediente creado exitosamente', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el expediente', details: error.message });
  }
};



// Obtener todos los expedientes
const getRecords = async (req, res) => {
  try {
    const recordsSnapshot = await getDocs(collection(db, "records"));
    const records = recordsSnapshot.docs.map((doc) => ({
      firebaseId: doc.id, // Incluye el ID generado por Firebase
      ...doc.data(), // Incluye los datos del documento
    }));
    res.status(200).json(records);
  } catch (error) {
    console.error("Error al obtener los expedientes:", error.message);
    res.status(500).json({ error: "Error al obtener los expedientes", details: error.message });
  }
};


// Actualizar un expediente
const updateRecord = async (req, res) => {
  const { id } = req.params;

  // Log para inspeccionar datos
  console.log("ID recibido:", id);
  console.log("Datos recibidos en el cuerpo de la solicitud:", req.body);
  console.log("Archivo recibido:", req.file);

  try {
    // Verifica que al menos un campo se envíe
    if (!Object.keys(req.body).length && !req.file) {
      return res.status(400).json({ error: "Debe enviar al menos un campo para actualizar" });
    }

    const updates = { ...req.body };

    // Si se envía un archivo, añade su ruta al objeto de actualización
    if (req.file) {
      updates.archivo = req.file.path;
    }

    const recordRef = doc(db, "records", id);
    await updateDoc(recordRef, updates);
    res.status(200).json({ message: "Expediente actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el expediente:", error.message);
    res.status(500).json({ error: "Error al actualizar el expediente", details: error.message });
  }
};


// Eliminar un expediente
const deleteRecord = async (req, res) => {
  const { id } = req.params;
  console.log("ID recibido para eliminar:", id);

  try {
    const recordRef = doc(db, 'records', id);
    await deleteDoc(recordRef);
    res.status(200).json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el expediente', details: error.message });
  }
};

const getRecordById = async (req, res) => {
  const { recordId } = req.params; // Obtiene el recordId desde los parámetros

  try {
    const recordRef = doc(db, 'records', recordId); // Referencia al documento
    const recordSnapshot = await getDoc(recordRef); // Obtiene el documento

    if (!recordSnapshot.exists()) {
      return res.status(404).json({ error: 'Record not found' }); // Error si no existe
    }

    // Devuelve los datos del documento, incluyendo el ID
    res.status(200).json({
      id: recordSnapshot.id, // ID del documento
      ...recordSnapshot.data(), // Datos del documento
    });
  } catch (error) {
    console.error('Error fetching record:', error.message);
    res.status(500).json({ error: 'Error fetching record', details: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
  getRecordById
};
