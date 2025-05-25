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
    type: String,
    default: ''
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
