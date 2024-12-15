const { db } = require("../../config/firebaseConfig");
const { collection, query, where, getDocs } = require("firebase/firestore");

// Obtener documentos por el email del usuario autenticado
const getDocumentsByUserId = async (req, res) => {
    const { userId } = req.query; // Obtener el userId desde la query
  
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }
  
    try {
      const documentsRef = collection(db, "documents");
      const q = query(documentsRef, where("createdBy.uid", "==", userId)); // Filtrar por userId
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        return res.status(404).json({ message: "No documents found for this user ID." });
      }
  
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().sections?.[0]?.fields?.[0]?.label || "Unnamed Document",
      }));
  
      res.status(200).json({ documents });
    } catch (error) {
      console.error("Error fetching documents by userId:", error.message);
      res.status(500).json({ error: "Failed to fetch documents." });
    }
  };
  
  module.exports = { getDocumentsByUserId };
  