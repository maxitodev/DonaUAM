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
    validate: {
      validator: function(v) {
        return v.length <= 3; // Máximo 3 imágenes
      },
      message: 'No se pueden subir más de 3 imágenes'
    }
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
