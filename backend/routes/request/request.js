const express = require('express');
const router = express.Router();
const Request = require('../../models/request');
const Donation = require('../../models/donation');
const jwt = require('../../middlewares/jwt');
const User = require('../../models/user');

// Crear una solicitud para una donación
router.post('/:donacionId', jwt, async (req, res) => {
  try {
    const { descripcion, telefono } = req.body;
    const donacionId = req.params.donacionId;
    const userId = req.user.id;

    // Obtener usuario autenticado
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Verificar que la donación existe
    const donacion = await Donation.findById(donacionId);
    if (!donacion) return res.status(404).json({ message: 'Donación no encontrada' });

    const nuevaSolicitud = new Request({
      nombre: user.nombre,
      correo: user.correo,
      descripcion,
      telefono,
      donacion: donacionId,
      usuario: userId
    });
    await nuevaSolicitud.save();
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la solicitud', error });
  }
});

// Obtener solicitudes de una donación
router.get('/donacion/:donacionId', async (req, res) => {
  try {
    const solicitudes = await Request.find({ donacion: req.params.donacionId }).populate('usuario', 'nombre correo');
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes', error });
  }
});

// Obtener solicitudes de un usuario
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const solicitudes = await Request.find({ usuario: req.params.usuarioId }).populate('donacion');
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener solicitudes', error });
  }
});

module.exports = router;
