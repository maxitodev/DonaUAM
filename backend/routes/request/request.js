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

    // Verificar que el usuario no haya enviado ya una solicitud para esta donación
    const solicitudExistente = await Request.findOne({ 
      donacion: donacionId, 
      usuario: userId 
    });
    
    if (solicitudExistente) {
      return res.status(400).json({ 
        message: 'Ya has enviado una solicitud para esta donación' 
      });
    }

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

// Actualizar estado de una solicitud (el donador o el usuario pueden hacerlo, pero solo una aprobada por donación)
router.patch('/:requestId/estado', jwt, async (req, res) => {
  try {
    const { estado } = req.body;
    const requestId = req.params.requestId;
    const userId = req.user.id;

    if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const solicitud = await Request.findById(requestId).populate('donacion');
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Permitir solo al donador o al usuario dueño de la solicitud
    const isDonador = solicitud.donacion.usuario.toString() === userId;
    const isSolicitante = solicitud.usuario.toString() === userId;
    if (!isDonador && !isSolicitante) {
      return res.status(403).json({ message: 'No tienes permisos para modificar esta solicitud' });
    }

    // Si se intenta aprobar, verificar que no haya otra aprobada para la misma donación
    if (estado === 'aprobada') {
      const yaAprobada = await Request.findOne({
        donacion: solicitud.donacion._id,
        estado: 'aprobada'
      });
      if (yaAprobada && yaAprobada._id.toString() !== solicitud._id.toString()) {
        return res.status(400).json({ message: 'Ya existe una solicitud aprobada para esta donación' });
      }
    }

    solicitud.estado = estado;
    await solicitud.save();

    res.json({ message: 'Estado actualizado correctamente', solicitud });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error });
  }
});

// Eliminar una solicitud (solo el usuario que la creó puede eliminarla)
router.delete('/:requestId', jwt, async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user.id;

    const solicitud = await Request.findById(requestId);
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Verificar que el usuario actual sea quien creó la solicitud
    if (solicitud.usuario.toString() !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar esta solicitud' });
    }

    await Request.findByIdAndDelete(requestId);
    res.json({ message: 'Solicitud eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar solicitud', error });
  }
});

module.exports = router;
