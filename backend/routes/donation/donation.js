const express = require('express');
const router = express.Router();
const Donation = require('../../models/donation');

// Obtener todas las donaciones (solo Activo)
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find({ estado: "Activo" }).sort({ fechaCreacion: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener donaciones' });
  }
});

// Crear una nueva donación
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, categoria, imagen, usuario, estado } = req.body;
    const donation = new Donation({
      nombre,
      descripcion,
      categoria,
      imagen,
      usuario,
      estado // opcional, por defecto "Activo"
    });
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la donación' });
  }
});

// Cambiar el estado de una donación (solo el usuario dueño debería poder hacerlo)
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!["Activo", "Inactivo"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const updated = await Donation.findByIdAndUpdate(id, { estado }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// Eliminar una donación por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Donation.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }
    res.json({ message: 'Donación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la donación' });
  }
});

// Eliminar todas las donaciones
router.delete('/', async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.json({ message: 'Todas las donaciones han sido eliminadas' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar todas las donaciones' });
  }
});

// Obtener todas las donaciones de un usuario específico
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const donations = await Donation.find({ usuario: usuarioId }).sort({ fechaCreacion: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener donaciones del usuario' });
  }
});

// Obtener una donación por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findById(id).populate('usuario', 'nombre');
    if (!donation) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }
    res.json(donation);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la donación' });
  }
});

// Actualizar una donación por ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, imagen } = req.body;
    const updated = await Donation.findByIdAndUpdate(
      id,
      { nombre, descripcion, categoria, imagen },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar la donación' });
  }
});

module.exports = router;
