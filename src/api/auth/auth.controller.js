const { db } = require('../../config/firebaseConfig');
const { collection, getDocs, query, where } = require("firebase/firestore");
const bcrypt = require("bcrypt");

// Login de usuario
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validar campos obligatorios
  if (!email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Buscar el usuario por email
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(400).json({ error: "Correo electrónico o contraseña incorrectos" });
    }

    // Verificar contraseña
    let user;
    querySnapshot.forEach((doc) => {
      user = { id: doc.id, ...doc.data() };
    });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Correo electrónico o contraseña incorrectos" });
    }

    // Usuario autenticado
    res.status(200).json({ message: "Login exitoso", userId: user.id });
  } catch (error) {
    console.error("Error en el login:", error.message, error.stack);
    res.status(500).json({ error: "Error en el servidor", details: error.message });
  }
};

module.exports = {
  loginUser,
};
