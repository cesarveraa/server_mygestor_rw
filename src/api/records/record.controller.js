const { db } = require('../../config/firebaseConfig');
const { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } = require('firebase/firestore');

// Crear un nuevo expediente
const createRecord = async (req, res) => {
  const { nombreCaso, estado, prioridad, juezAsignado } = req.body;

  if (!nombreCaso || !estado || !prioridad || !juezAsignado) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const docRef = await addDoc(collection(db, 'records'), {
      nombreCaso,
      estado,
      prioridad,
      juezAsignado,
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
    const querySnapshot = await getDocs(collection(db, 'records'));
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los expedientes', details: error.message });
  }
};

// Actualizar un expediente
const updateRecord = async (req, res) => {
  const { id } = req.params;
  const { nombreCaso, estado, prioridad, juezAsignado } = req.body;

  if (!nombreCaso && !estado && !prioridad && !juezAsignado) {
    return res.status(400).json({ error: 'Debe enviar al menos un campo para actualizar' });
  }

  try {
    const recordRef = doc(db, 'records', id);
    await updateDoc(recordRef, {
      ...(nombreCaso && { nombreCaso }),
      ...(estado && { estado }),
      ...(prioridad && { prioridad }),
      ...(juezAsignado && { juezAsignado }),
    });
    res.status(200).json({ message: 'Expediente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el expediente', details: error.message });
  }
};

// Eliminar un expediente
const deleteRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const recordRef = doc(db, 'records', id);
    await deleteDoc(recordRef);
    res.status(200).json({ message: 'Expediente eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el expediente', details: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
};
