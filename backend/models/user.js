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
        required: function() {
            // La contraseña es requerida solo si no hay googleId
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        sparse: true, // Permite valores únicos y nulos
        unique: true
    },
    imagenURL: {
        type: String, 
        required: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
