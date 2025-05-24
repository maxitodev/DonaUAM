const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    contrasena: {
        type: String,
        required: true
    },
    imagenURL: {
        type: String, 
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
