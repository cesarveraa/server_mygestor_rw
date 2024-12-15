const { db } = require('../../config/firebaseConfig');

const { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } = require("firebase/firestore");

const bcrypt = require("bcrypt");

// Crear un nuevo usuario
const createUser = async (req, res) => {

    console.log("Solicitud recibida:", req.body);
    const { email, name, id, password } = req.body;
  
    // Validar campos obligatorios
    if (!email || !name || !id || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
  
    try {
      // Verificar si el correo ya está registrado
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
  
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Guardar el usuario en Firestore
      const docRef = await addDoc(usersCollection, {
        email,
        name,
        id,
        password: hashedPassword, // Almacenar la contraseña encriptada
        createdAt: new Date().toISOString(),
      });
  
      res.status(201).json({ message: 'Usuario creado exitosamente', id: docRef.id });
    } catch (error) {
        console.error("Error al crear el usuario:", error.message, error.stack);
        res.status(500).json({ error: 'Error al crear el usuario', details: error.message });
      
    }
};
  

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios", details: error.message });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, password } = req.body;

  if (!email && !name && !password) {
    return res.status(400).json({ error: "Debes enviar al menos un campo para actualizar" });
  }

  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      ...(email && { email }),
      ...(name && { name }),
      ...(password && { password }),
    });

    res.status(200).json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el usuario", details: error.message });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario", details: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
