require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const authRoutes = require('./routes/auth/auth');
const DonationRoutes = require('./routes/donation/donation');
const RequestRoutes = require('./routes/request/request');


// Leer orígenes permitidos desde variables de entorno y limpiar espacios
const getAllowedOrigins = () => {
  const env = process.env.NODE_ENV === "production" ? "production" : "development";
  const origins = env === "production"
    ? process.env.ALLOWED_ORIGINS_PROD
    : process.env.ALLOWED_ORIGINS_DEV;
  return origins
    ? origins.split(",").map(origin => origin.trim()).filter(Boolean)
    : ["http://localhost:3000"];
};
const allowedOrigins = getAllowedOrigins();

// Middleware CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman) o si el origen está permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware para parsear JSON (aumenta el límite de tamaño)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos desde la carpeta "public/uploads"
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Servir frontend estático en producción
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (req, res, next) => {
    // Si la ruta empieza por /uploads, pasar al siguiente middleware
    if (req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

// Conexión a MongoDB con opciones recomendadas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => {
    console.error("Error en la conexión:", error);
    process.exit(1);
  });

//Rutas
app.get("/", (req, res) => {
  res.send("API funcionando");
});
app.use('/auth', authRoutes);
app.use('/donations', DonationRoutes);
app.use('/requests', RequestRoutes);


// Manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Algo salió mal en el servidor" });
});

// Iniciar el servidor
app.listen(process.env.PORT, () => {
  console.log("Servidor corriendo");
});