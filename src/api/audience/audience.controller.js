const { db } = require('../../config/firebaseConfig');
const { collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc } = require('firebase/firestore');

// Obtener todas las audiencias de un expediente
const getAudiencesByRecordId = async (req, res) => {
  const { recordId } = req.params;

  try {
    const audienceCollectionRef = collection(db, `records/${recordId}/audiences`);
    const snapshot = await getDocs(audienceCollectionRef);
    const audiences = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(audiences);
  } catch (error) {
    console.error('Error fetching audiences:', error.message);
    res.status(500).json({ error: 'Error fetching audiences', details: error.message });
  }
};

// Crear una nueva audiencia
const createAudience = async (req, res) => {
  const { recordId } = req.params;
  const { fecha, hora, juez, participantes, estado, expedientes, descripcion, actaUrl } = req.body;

  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  if (!fecha || !hora || !juez || !estado || !descripcion || !expedientes || !participantes) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const audienceCollectionRef = collection(db, `records/${recordId}/audiences`);
    const newAudience = {
      fecha,
      hora,
      juez,
      participantes: JSON.parse(participantes),
      estado,
      expedientes: JSON.parse(expedientes),
      descripcion,
      actaUrl: actaUrl || null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(audienceCollectionRef, newAudience);
    res.status(201).json({ message: 'Audiencia creada exitosamente', id: docRef.id });
  } catch (error) {
    console.error('Error creating audience:', error.message);
    res.status(500).json({ error: 'Error creating audience', details: error.message });
  }
};

// Eliminar una audiencia
const deleteAudience = async (req, res) => {
  const { recordId, audienceId } = req.params;

  try {
    const audienceRef = doc(db, `records/${recordId}/audiences/${audienceId}`);
    await deleteDoc(audienceRef);
    res.status(200).json({ message: 'Audiencia eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting audience:', error.message);
    res.status(500).json({ error: 'Error deleting audience', details: error.message });
  }
};
const updateAudience = async (req, res) => {
  const { recordId, audienceId } = req.params; // Obtener IDs de la ruta
  const { fecha, hora, juez, participantes, estado, expedientes, descripcion, actaUrl,} = req.body;

  // Validar que al menos un campo sea proporcionado para actualizar
  if (
    !fecha && !hora && !juez && !participantes && !estado && !expedientes && !descripcion && !actaUrl
  ) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided to update the audience." });
  }

  try {
    // Referencia al documento de la audiencia en la subcolección
    const audienceRef = doc(db, `records/${recordId}/audiences`, audienceId);

    // Verificar si el documento existe antes de actualizar
    const docSnapshot = await getDoc(audienceRef);
    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: "Audience not found." });
    }

    // Construir los campos actualizados
    const updatedFields = {};
    if (fecha) updatedFields.fecha = fecha;
    if (hora) updatedFields.hora = hora;
    if (juez) updatedFields.juez = juez;
    if (participantes) updatedFields.participantes = JSON.parse(participantes);
    if (estado) updatedFields.estado = estado;
    if (expedientes) updatedFields.expedientes = JSON.parse(expedientes);
    if (descripcion) updatedFields.descripcion = descripcion;
    if (actaUrl) updatedFields.actaUrl = actaUrl;

    // Actualizar el documento en Firestore
    await updateDoc(audienceRef, updatedFields);

    res.status(200).json({ message: "Audience updated successfully", id: audienceId });
  } catch (error) {
    console.error("Error updating audience:", error.message);
    res.status(500).json({ error: "Failed to update audience", details: error.message });
  }
};
module.exports = {
  getAudiencesByRecordId,
  createAudience,
  deleteAudience,
  updateAudience,
};
