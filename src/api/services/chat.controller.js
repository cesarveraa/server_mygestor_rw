const { queryGrok } = require("../services/grok.service");
const { db } = require("../../config/firebaseConfig");
const { doc, getDoc, collection, getDocs, query, where } = require("firebase/firestore");

// ----------------------- FUNCIÓN PRINCIPAL -----------------------
const getChatResponse = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    console.log("Requesting Grok with message:", message);
    const lowerMessage = message.toLowerCase();
    let reply;

    if (lowerMessage.startsWith("details of record")) {
      const recordId = extractParameterFromMessage(message, "record");
      reply = await getDetails(fetchRecordDetails, recordId, "Record");
    } 
    else if (lowerMessage.startsWith("details of audience")) {
      const audienceId = extractParameterFromMessage(message, "audience");
      reply = await getDetails(fetchAudienceDetails, audienceId, "Audience");
    } 
    else if (lowerMessage.startsWith("details of movement")) {
      const movementId = extractParameterFromMessage(message, "movement");
      reply = await getDetails(fetchMovementDetails, movementId, "Movement");
    } 
    else if (lowerMessage.includes("search by judge")) {
      const judgeName = extractParameterFromMessage(message, "judge");
      reply = await searchByAttributeFormatted("juez", judgeName, "Judge");
    } 
    else if (lowerMessage.includes("search by participant")) {
      const participantName = extractParameterFromMessage(message, "participant");
      reply = await searchByAttributeFormatted("participantes", participantName, "Participant");
    } 
    else if (lowerMessage.includes("search all by")) {
      const [_, attribute, value] = message.split("by");
      reply = await searchByAnyAttribute(attribute.trim(), value.trim());
    } 
    else {
      // Predeterminado: consulta a Grok
      const response = await queryGrok(message);
      reply = response;
    }

    console.log("Response from Chatbot:", reply);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error processing chat request:", error.message);
    res.status(500).json({ error: "Failed to process your request." });
  }
};

// -------------------- FUNCIONES AUXILIARES --------------------

// Extraer parámetros del mensaje
function extractParameterFromMessage(message, keyword) {
  const parts = message.split(keyword);
  return parts[1] ? parts[1].trim() : null;
}

// Obtener detalles de una entidad
async function getDetails(fetchFunction, id, type) {
  try {
    const details = await fetchFunction(id);
    return formatDetails(details, type);
  } catch (error) {
    return `Error fetching ${type} details: ${error.message}`;
  }
}

// Formatear detalles de cada tipo de entidad
function formatDetails(details, type) {
  switch (type) {
    case "Record":
      return `Record ID: ${details.id}
Case: ${details.caso}
Judge: ${details.juez}
Date: ${details.fecha}
State: ${details.estado ? "Active" : "Inactive"}
Participants:
${JSON.parse(details.participantes).map((p) => `- ${p.nombre} (${p.rol})`).join("\n")}`;

    case "Audience":
      return `Audience ID: ${details.id}
Description: ${details.descripcion}
Date: ${details.fecha} ${details.hora}
Judge: ${details.juez}
State: ${details.estado}
Expedients: ${details.expedientes.join(", ")}
Participants:
${details.participantes.map((p) => `- ${p.nombre} (${p.rol})`).join("\n")}`;

    case "Movement":
      return `Movement ID: ${details.movimiento}
Details: ${details.detalles}
Date: ${details.fecha}
Location: ${details.sede}
Type: ${details.tipo}`;
  }
}

// -------------------- BÚSQUEDAS POR ATRIBUTO --------------------

// Búsqueda formateada por atributo
async function searchByAttributeFormatted(fieldName, value, type) {
  try {
    const results = await searchByAttribute("records", fieldName, value);

    if (results.length === 0) return `No results found for ${type}: "${value}".`;

    return results
      .map((r, index) => `${index + 1}. ID: ${r.id}, Case: ${r.caso}, Judge: ${r.juez}`)
      .join("\n");
  } catch (error) {
    return `Error searching by ${type}: ${error.message}`;
  }
}

// Búsqueda genérica en cualquier colección
async function searchByAnyAttribute(attribute, value) {
  const collections = ["records", "audiences", "movements"];
  let results = [];

  for (const collectionName of collections) {
    const matches = await searchByAttribute(collectionName, attribute, value);
    results = results.concat(matches.map((m) => ({ ...m, collection: collectionName })));
  }

  if (results.length > 0) {
    return results
      .map((r, index) => `${index + 1}. Collection: ${r.collection}, ID: ${r.id}`)
      .join("\n");
  } else {
    return `No results found for "${attribute}" with value "${value}".`;
  }
}

// -------------------- FUNCIONES DE BASE DE DATOS --------------------

// Buscar en una colección por atributo
async function searchByAttribute(collectionName, fieldName, value) {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where(fieldName, "==", value));
  const snapshot = await getDocs(q);

  return snapshot.empty ? [] : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Obtener detalles de una entidad
async function fetchRecordDetails(recordId) {
  return fetchDetails("records", recordId);
}
async function fetchAudienceDetails(audienceId) {
  return fetchDetails("audiences", audienceId);
}
async function fetchMovementDetails(movementId) {
  return fetchDetails("movements", movementId);
}

async function fetchDetails(collectionName, id) {
  const docRef = doc(db, collectionName, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error(`${collectionName} with ID "${id}" not found.`);
  return { id: snapshot.id, ...snapshot.data() };
}

module.exports = { getChatResponse };
