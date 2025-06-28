const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  imagen: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(v) {
          return v.length <= 3; // Máximo 3 imágenes
        },
        message: 'No se pueden subir más de 3 imágenes'
      },
      {
        validator: function(v) {
          // Validar el tamaño de cada imagen
          for (let img of v) {
            const base64Size = Buffer.byteLength(img, 'utf8');
            const maxSize = 2 * 1024 * 1024; // 2MB máximo por imagen
            if (base64Size > maxSize) {
              return false;
            }
          }
          return true;
        },
        message: 'Una o más imágenes exceden el tamaño máximo permitido de 2MB'
      },
      {
        validator: function(v) {
          // Validar el tamaño total de todas las imágenes
          const totalSize = v.reduce((total, img) => total + Buffer.byteLength(img, 'utf8'), 0);
          const maxTotalSize = 5 * 1024 * 1024; // 5MB total máximo
          return totalSize <= maxTotalSize;
        },
        message: 'El tamaño total de las imágenes excede el límite de 5MB'
      }
    ]
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ["Activo", "Inactivo"],
    default: "Activo"
  }
});

module.exports = mongoose.model('Donation', donationSchema);
