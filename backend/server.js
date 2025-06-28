require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoutes = require('./routes/auth/auth');
const DonationRoutes = require('./routes/donation/donation');
const RequestRoutes = require('./routes/request/request');
const aiRoutes = require('./routes/ai/ai');


// Configuración CORS simplificada
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para parsear JSON (aumenta el límite de tamaño)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexión a MongoDB con opciones recomendadas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => {
    console.error("Error en la conexión:", error);
    process.exit(1);
  });

//Rutas de la API
app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.get("/api", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Rutas de la API con prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/donations', DonationRoutes);
app.use('/api/requests', RequestRoutes);
app.use('/api/ai', aiRoutes);

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Algo salió mal en el servidor" });
});

// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log("Servidor corriendo");
});