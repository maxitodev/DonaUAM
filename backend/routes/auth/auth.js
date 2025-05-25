const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../../models/user');
const multer = require('multer');
const authJwt = require('../../middlewares/jwt');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Registro
router.post(
  '/register',
  upload.single('imagen'),
  [
    body('nombre')
      .notEmpty().withMessage('El nombre es obligatorio.'),
    body('correo')
      .isEmail().withMessage('Correo inválido.')
      .matches(/^[a-zA-Z0-9._%+-]+@cua\.uam\.mx$/).withMessage('El correo debe ser @cua.uam.mx.'),
    body('contrasena')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
      .matches(/[a-z]/).withMessage('La contraseña debe tener al menos una minúscula.')
      .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una mayúscula.')
      .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un número.')
      .matches(/[^A-Za-z0-9]/).withMessage('La contraseña debe tener al menos un símbolo.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Devuelve todos los errores de validación
      return res.status(400).json({
        message: 'Errores de validación.',
        errors: errors.array()
      });
    }
    const { nombre, correo, contrasena } = req.body;
    try {
      const existe = await User.findOne({ correo });
      if (existe) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'La imagen es obligatoria.' });
      }
      // Guarda la imagen como base64
      const imagenBase64 = req.file.buffer.toString('base64');
      const hash = await bcrypt.hash(contrasena, 10);
      const user = new User({ nombre, correo, contrasena: hash, imagenURL: imagenBase64 });
      await user.save();
      // Mensaje de éxito claro
      res.status(201).json({ message: 'Usuario registrado correctamente.' });
    } catch (err) {
      res.status(500).json({ message: 'Error en el servidor.', error: err.message });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('correo')
      .isEmail().withMessage('Correo inválido.')
      .matches(/^[a-zA-Z0-9._%+-]+@cua\.uam\.mx$/).withMessage('El correo debe ser @cua.uam.mx.'),
    body('contrasena')
      .notEmpty().withMessage('La contraseña es obligatoria.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Devuelve todos los errores de validación
      return res.status(400).json({
        message: 'Errores de validación.',
        errors: errors.array()
      });
    }
    const { correo, contrasena } = req.body;
    try {
      const user = await User.findOne({ correo });
      if (!user) {
        return res.status(400).json({ message: 'Credenciales inválidas.' });
      }
      const valid = await bcrypt.compare(contrasena, user.contrasena);
      if (!valid) {
        return res.status(400).json({ message: 'Credenciales inválidas. Verifica tu Correo y Contraseña' });
      }
      const token = jwt.sign(
        { id: user._id, correo: user.correo, nombre: user.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      // Mensaje de éxito claro
      res.json({
        message: 'Inicio de sesión exitoso.',
        token,
        user: { id: user._id, nombre: user.nombre, correo: user.correo, imagenURL: user.imagenURL }
      });
    } catch (err) {
      res.status(500).json({ message: 'Error en el servidor.', error: err.message });
    }
  }
);

// Obtener usuario autenticado
router.get('/me', authJwt, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-contrasena');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

module.exports = router;
