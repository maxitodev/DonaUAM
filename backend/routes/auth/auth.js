const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../../models/user');
const multer = require('multer');
const authJwt = require('../../middlewares/jwt');
const passport = require('../../config/passport'); // Ensure correct path to passport.js
const emailService = require('../../services/emailService');

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
      
      // Validar tamaño máximo de imagen (5MB después de compresión)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          message: 'La imagen es demasiado grande. El tamaño máximo permitido es 5MB.' 
        });
      }
      
      // Guarda la imagen como base64
      const imagenBase64 = req.file.buffer.toString('base64');
      const hash = await bcrypt.hash(contrasena, 10);
      const user = new User({ nombre, correo, contrasena: hash, imagenURL: imagenBase64 });
      await user.save();
      
      // Enviar email de bienvenida
      try {
        await emailService.enviarCorreoBienvenida(user);
        console.log(`✅ Email de bienvenida enviado a ${user.correo}`);
      } catch (emailError) {
        console.error('❌ Error enviando email de bienvenida:', emailError);
        // No fallar el registro si el email falla
      }
      
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

// Rutas de Google OAuth
router.get('/google',
  (req, res, next) => {
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server`);
      }
      
      if (!user) {
        if (info && info.type === 'domain_error') {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid-domain`);
        }
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=unauthorized`);
      }
      
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, correo: req.user.correo, nombre: req.user.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server`);
    }
  }
);

// Endpoint para obtener token desde el frontend después de Google OAuth
router.post('/google/token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-contrasena');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Inicio de sesión exitoso con Google.',
      token,
      user: { 
        id: user._id, 
        nombre: user.nombre, 
        correo: user.correo, 
        imagenURL: user.imagenURL 
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
});

// Solicitar recuperación de contraseña
router.post(
  '/forgot-password',
  [
    body('correo')
      .isEmail().withMessage('Correo inválido.')
      .matches(/^[a-zA-Z0-9._%+-]+@cua\.uam\.mx$/).withMessage('El correo debe ser @cua.uam.mx.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Correo inválido.',
        errors: errors.array()
      });
    }

    const { correo } = req.body;
    
    try {
      const user = await User.findOne({ correo });
      
      if (!user) {
        // Por seguridad, no revelar si el usuario existe o no
        return res.status(200).json({
          message: 'Si el correo está registrado, recibirás un enlace de recuperación en unos minutos.'
        });
      }

      // Si el usuario se registró con Google, no puede cambiar contraseña por este método
      if (user.googleId && !user.contrasena) {
        return res.status(400).json({
          message: 'Esta cuenta está vinculada con Google. Inicia sesión usando tu cuenta de Google.'
        });
      }

      // Generar token de reset
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = await bcrypt.hash(resetToken, 10);

      // Guardar token en la base de datos (expira en 1 hora)
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await user.save();

      // Enviar email
      try {
        await emailService.enviarCorreoRecuperacionContrasena(correo, resetToken);
        res.status(200).json({
          message: 'Se ha enviado un enlace de recuperación a tu correo institucional. Revisa tu bandeja de entrada y spam.'
        });
      } catch (emailError) {
        console.error('Error enviando email de recuperación:', emailError);
        res.status(500).json({
          message: 'Error al enviar el correo de recuperación. Intenta de nuevo más tarde.'
        });
      }
    } catch (error) {
      console.error('Error en forgot-password:', error);
      res.status(500).json({
        message: 'Error interno del servidor.'
      });
    }
  }
);

// Verificar token de reset
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token requerido' });
    }

    // Buscar usuarios con tokens no expirados
    const users = await User.find({
      resetPasswordToken: { $exists: true, $ne: null },
      resetPasswordExpire: { $gt: new Date() }
    });

    // Verificar si algún token coincide
    let validUser = null;
    for (const user of users) {
      const isValid = await bcrypt.compare(token, user.resetPasswordToken);
      if (isValid) {
        validUser = user;
        break;
      }
    }

    if (!validUser) {
      return res.status(400).json({
        message: 'Token inválido o expirado'
      });
    }

    res.status(200).json({
      message: 'Token válido'
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      message: 'Error interno del servidor'
    });
  }
});

// Restablecer contraseña
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty().withMessage('Token requerido'),
    body('nuevaContrasena')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
      .matches(/[a-z]/).withMessage('La contraseña debe tener al menos una minúscula.')
      .matches(/[A-Z]/).withMessage('La contraseña debe tener al menos una mayúscula.')
      .matches(/[0-9]/).withMessage('La contraseña debe tener al menos un número.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos inválidos.',
        errors: errors.array()
      });
    }

    const { token, nuevaContrasena } = req.body;

    try {
      // Buscar usuarios con tokens no expirados
      const users = await User.find({
        resetPasswordToken: { $exists: true, $ne: null },
        resetPasswordExpire: { $gt: new Date() }
      });

      // Verificar si algún token coincide
      let validUser = null;
      for (const user of users) {
        const isValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (isValid) {
          validUser = user;
          break;
        }
      }

      if (!validUser) {
        return res.status(400).json({
          message: 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.'
        });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

      // Actualizar contraseña y limpiar tokens de reset
      validUser.contrasena = hashedPassword;
      validUser.resetPasswordToken = null;
      validUser.resetPasswordExpire = null;
      await validUser.save();

      // Enviar email de confirmación
      try {
        await emailService.enviarCorreoContrasenaRestablecida(validUser.correo, validUser.nombre);
      } catch (emailError) {
        console.error('Error enviando email de confirmación:', emailError);
        // No fallar la operación si el email falla
      }

      res.status(200).json({
        message: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
      });
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      res.status(500).json({
        message: 'Error interno del servidor.'
      });
    }
  }
);

module.exports = router;
