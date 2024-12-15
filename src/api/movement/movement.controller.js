const { db } = require('../../config/firebaseConfig');
const { collection, query, where, getDocs, addDoc, doc, deleteDoc, updateDoc, getDoc} = require('firebase/firestore');


// Obtener movimientos de un expediente
const getMovements = async (req, res) => {
    const { recordId } = req.params;
    console.log("Record ID in backend:", recordId); // Verificar que el recordId llegue al backend
  
    try {
      const movementsRef = collection(db, "records", recordId, "movements");
      const querySnapshot = await getDocs(movementsRef);
  
      const movements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Movements fetched:", movements); // Verificar que los movimientos se obtienen correctamente
      res.status(200).json(movements);
    } catch (error) {
      console.error("Error fetching movements:", error.message);
      res.status(500).json({ error: "Error fetching movements", details: error.message });
    }
};
  
  

// Añadir un nuevo movimiento

const addMovement = async (req, res) => {
    const { recordId } = req.params;
    const { fecha, movimiento, sede, tipo, detalles } = req.body;
    
    console.log("Record ID received:", recordId);
    console.log("Movement data received:", req.body);

    // Validar campos obligatorios
    if (!fecha || !movimiento || !sede || !tipo || !detalles) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Crear un nuevo documento en la subcolección de movimientos
      const docRef = await addDoc(collection(db, `records/${recordId}/movements`), {
        fecha,
        movimiento,
        sede,
        tipo,
        detalles,
        createdAt: new Date().toISOString(),
      });
  
      res.status(201).json({ message: 'Movimiento creado exitosamente', id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el movimiento', details: error.message });
    }
  };
  const deleteMovement = async (req, res) => {
    const { recordId, movementId } = req.params;
  
    console.log("Deleting movement from Record ID:", recordId);
    console.log("Deleting Movement ID:", movementId);
  
    try {
      const movementRef = doc(db, `records/${recordId}/movements`, movementId);
      await deleteDoc(movementRef);
  
      res.status(200).json({ message: "Movement deleted successfully" });
    } catch (error) {
      console.error("Error deleting movement:", error);
      res.status(500).json({ error: "Failed to delete movement" });
    }
  };
  
const updateMovement = async (req, res) => {
  const { recordId, movementId } = req.params; // Obtener IDs de la ruta
  console.log("Updating movement within record:", recordId, "Movement ID:", movementId); // Debug

  const { fecha, movimiento, sede, tipo, detalles } = req.body;

  // Validar los campos requeridos
  if (!fecha && !movimiento && !sede && !tipo && !detalles) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided to update the movement." });
  }

  try {
    // Referencia al documento en la subcolección
    const movementRef = doc(db, `records/${recordId}/movements`, movementId);

    // Verificar si el documento existe antes de actualizar
    const docSnapshot = await getDoc(movementRef);
    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: "Movement not found." });
    }

    // Actualizar los campos enviados
    const updatedFields = {};
    if (fecha) updatedFields.fecha = fecha;
    if (movimiento) updatedFields.movimiento = movimiento;
    if (sede) updatedFields.sede = sede;
    if (tipo) updatedFields.tipo = tipo;
    if (detalles) updatedFields.detalles = detalles;

    await updateDoc(movementRef, updatedFields);

    res.status(200).json({ message: "Movement updated successfully", id: movementId });
  } catch (error) {
    console.error("Error updating movement:", error.message);
    res.status(500).json({ error: "Failed to update movement", details: error.message });
  }
};

  
module.exports = { getMovements, deleteMovement, addMovement, updateMovement};
