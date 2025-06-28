const express = require('express');
const router = express.Router();
const Donation = require('../../models/donation');

// Increase payload limit for this router
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    
    // Validar que la imagen no exceda un tamaño máximo (5MB después de compresión)
    if (imagen && imagen.length > 0) {
      // Validar que no haya más de 3 imágenes
      if (imagen.length > 3) {
        return res.status(400).json({ 
          error: 'No se pueden subir más de 3 imágenes.' 
        });
      }
      
      // Validar el tamaño de cada imagen con límite más estricto
      for (let i = 0; i < imagen.length; i++) {
        const base64Size = Buffer.byteLength(imagen[i], 'utf8');
        const maxSize = 3 * 1024 * 1024; // Reducir a 3MB por imagen
        if (base64Size > maxSize) {
          return res.status(413).json({ 
            error: `La imagen ${i + 1} es demasiado grande. El tamaño máximo permitido es 3MB por imagen.` 
          });
        }
      }
      
      // Validar tamaño total de todas las imágenes
      const totalSize = imagen.reduce((total, img) => total + Buffer.byteLength(img, 'utf8'), 0);
      const maxTotalSize = 8 * 1024 * 1024; // 8MB total
      if (totalSize > maxTotalSize) {
        return res.status(413).json({ 
          error: 'El tamaño total de las imágenes excede el límite permitido de 8MB.' 
        });
      }
    }
    
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
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Las imágenes son demasiado grandes. Reduce el tamaño o la cantidad de imágenes.' });
    }
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
    
    // Validar que la imagen no exceda un tamaño máximo (5MB después de compresión)
    if (imagen && imagen.length > 0) {
      // Validar que no haya más de 3 imágenes
      if (imagen.length > 3) {
        return res.status(400).json({ 
          error: 'No se pueden subir más de 3 imágenes.' 
        });
      }
      
      // Validar el tamaño de cada imagen con límite más estricto
      for (let i = 0; i < imagen.length; i++) {
        const base64Size = Buffer.byteLength(imagen[i], 'utf8');
        const maxSize = 3 * 1024 * 1024; // Reducir a 3MB por imagen
        if (base64Size > maxSize) {
          return res.status(413).json({ 
            error: `La imagen ${i + 1} es demasiado grande. El tamaño máximo permitido es 3MB por imagen.` 
          });
        }
      }
      
      // Validar tamaño total de todas las imágenes
      const totalSize = imagen.reduce((total, img) => total + Buffer.byteLength(img, 'utf8'), 0);
      const maxTotalSize = 8 * 1024 * 1024; // 8MB total
      if (totalSize > maxTotalSize) {
        return res.status(413).json({ 
          error: 'El tamaño total de las imágenes excede el límite permitido de 8MB.' 
        });
      }
    }
    
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
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Las imágenes son demasiado grandes. Reduce el tamaño o la cantidad de imágenes.' });
    }
    res.status(400).json({ error: 'Error al actualizar la donación' });
  }
});

// Crear 40 donaciones de ejemplo
router.post('/sample/create-40', async (req, res) => {
  try {
    const donacionesReales = [
      // Ropa
      { nombre: "Chaqueta de Cuero Negra", descripcion: "Chaqueta de cuero genuino en excelente estado, talla M. Perfecta para el frío, muy poco uso.", categoria: "Ropa", imagen: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop" },
      { nombre: "Vestido Floral de Verano", descripcion: "Hermoso vestido con estampado floral, talla S. Ideal para ocasiones especiales, como nuevo.", categoria: "Ropa", imagen: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop" },
      { nombre: "Jeans Azul Clásico", descripcion: "Pantalón jeans azul talla 32, marca reconocida. En muy buen estado, apenas usado.", categoria: "Ropa", imagen: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop" },
      { nombre: "Suéter de Lana Gris", descripcion: "Suéter tejido a mano de lana 100% natural, talla L. Muy abrigador y cómodo.", categoria: "Ropa", imagen: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop" },
      { nombre: "Zapatos Deportivos Nike", descripcion: "Zapatillas Nike Air Max, talla 42, color blanco con detalles azules. Poco uso, muy cómodas.", categoria: "Ropa", imagen: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop" },

      // Juguetes
      { nombre: "Bicicleta Infantil Rosa", descripcion: "Bicicleta para niñas de 6-8 años, con rueditas de apoyo. En perfecto estado, muy bien cuidada.", categoria: "Juguetes", imagen: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=400&h=300&fit=crop" },
      { nombre: "Set de Legos Arquitectura", descripcion: "Set completo de Lego Architecture Torre Eiffel, todas las piezas incluidas con manual.", categoria: "Juguetes", imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { nombre: "Muñeca Barbie Coleccionable", descripcion: "Muñeca Barbie edición especial con vestidos y accesorios. Perfecta para coleccionistas.", categoria: "Juguetes", imagen: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=300&fit=crop" },
      { nombre: "Pelota de Fútbol Profesional", descripcion: "Balón de fútbol FIFA oficial, usado en pocas ocasiones. Ideal para entrenamientos.", categoria: "Juguetes", imagen: "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400&h=300&fit=crop" },
      { nombre: "Puzzle 1000 Piezas Paisaje", descripcion: "Rompecabezas de 1000 piezas con hermoso paisaje de montaña. Completo, ninguna pieza faltante.", categoria: "Juguetes", imagen: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop" },

      // Libros
      { nombre: "Cien Años de Soledad - García Márquez", descripcion: "Clásico de la literatura latinoamericana en excelente estado. Edición tapa dura.", categoria: "Libros", imagen: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop" },
      { nombre: "Enciclopedia Médica Completa", descripcion: "Set de 5 tomos de enciclopedia médica actualizada. Perfecta para estudiantes de medicina.", categoria: "Libros", imagen: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop" },
      { nombre: "Colección Harry Potter Completa", descripcion: "Los 7 libros de Harry Potter en español, tapa blanda. Algunos con uso pero en buen estado.", categoria: "Libros", imagen: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=300&fit=crop" },
      { nombre: "Atlas Mundial Ilustrado", descripcion: "Atlas mundial con mapas detallados y fotografías. Edición 2020, como nuevo.", categoria: "Libros", imagen: "https://images.unsplash.com/photo-1609735010495-5f16fda9e983?w=400&h=300&fit=crop" },
      { nombre: "Libro de Recetas de Cocina", descripcion: "500 recetas de cocina internacional, con fotografías a color. Perfecto para aprender a cocinar.", categoria: "Libros", imagen: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop" },

      // Electrodomésticos
      { nombre: "Microondas Samsung 20L", descripcion: "Microondas en excelente funcionamiento, 20 litros de capacidad. Incluye plato giratorio.", categoria: "Electrodomésticos", imagen: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400&h=300&fit=crop" },
      { nombre: "Licuadora Oster Clásica", descripcion: "Licuadora de 3 velocidades con vaso de vidrio. Funciona perfectamente, motor potente.", categoria: "Electrodomésticos", imagen: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop" },
      { nombre: "Plancha de Vapor Philips", descripcion: "Plancha de vapor con base antiadherente. Elimina arrugas fácilmente, muy poco uso.", categoria: "Electrodomésticos", imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { nombre: "Tostadora 4 Rebanadas", descripcion: "Tostadora automática para 4 rebanadas, 7 niveles de tostado. Color acero inoxidable.", categoria: "Electrodomésticos", imagen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
      { nombre: "Cafetera Express Delonghi", descripcion: "Cafetera para espresso y cappuccino, con vaporizador incluido. Hace café profesional.", categoria: "Electrodomésticos", imagen: "https://images.unsplash.com/photo-1545379904-b86e3b40f5e9?w=400&h=300&fit=crop" },

      // Muebles
      { nombre: "Silla de Oficina Ergonómica", descripcion: "Silla giratoria con soporte lumbar y reposabrazos ajustables. Color negro, muy cómoda.", categoria: "Muebles", imagen: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
      { nombre: "Mesa de Centro de Madera", descripcion: "Mesa de centro de madera maciza con cajón. Diseño clásico, perfecta para sala.", categoria: "Muebles", imagen: "https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop" },
      { nombre: "Librero de 5 Repisas", descripcion: "Estantería de madera con 5 niveles, ideal para libros y decoración. Muy estable.", categoria: "Muebles", imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" },
      { nombre: "Espejo de Pared Decorativo", descripcion: "Espejo redondo con marco dorado, 60cm de diámetro. Perfecto para decorar cualquier habitación.", categoria: "Muebles", imagen: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=300&fit=crop" },
      { nombre: "Cómoda de 4 Cajones", descripcion: "Cómoda blanca con 4 cajones espaciosos. Ideal para dormitorio, en muy buen estado.", categoria: "Muebles", imagen: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },

      // Deportes
      { nombre: "Raqueta de Tenis Wilson", descripcion: "Raqueta profesional Wilson con grip nuevo. Incluye funda protectora, poco uso.", categoria: "Deportes", imagen: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop" },
      { nombre: "Pesas de 10kg (Par)", descripcion: "Set de mancuernas de 10kg cada una, con recubrimiento de goma. Perfectas para ejercicio en casa.", categoria: "Deportes", imagen: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },
      { nombre: "Casco de Ciclismo Specialized", descripcion: "Casco de ciclismo profesional con ventilación. Talla M, certificado de seguridad.", categoria: "Deportes", imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { nombre: "Tabla de Skateboard Completa", descripcion: "Skateboard completo con diseño gráfico colorido. Ruedas nuevas, lista para usar.", categoria: "Deportes", imagen: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop" },
      { nombre: "Guantes de Boxeo Everlast", descripcion: "Guantes de boxeo profesionales 12oz, color rojo. Incluye vendas para manos.", categoria: "Deportes", imagen: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop" },

      // Tecnología
      { nombre: "Laptop HP Pavilion i5", descripcion: "Laptop HP con procesador Intel i5, 8GB RAM, 256GB SSD. Funciona perfectamente, incluye cargador.", categoria: "Tecnología", imagen: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" },
      { nombre: "Smartphone Samsung Galaxy", descripcion: "Samsung Galaxy S20 en excelente estado, 128GB. Incluye cargador y funda protectora.", categoria: "Tecnología", imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop" },
      { nombre: "Tablet iPad 7ma Generación", descripcion: "iPad de 32GB con pantalla de 10.2 pulgadas. Incluye cargador original y funda.", categoria: "Tecnología", imagen: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop" },
      { nombre: "Auriculares Sony Bluetooth", descripcion: "Auriculares inalámbricos con cancelación de ruido. Batería de larga duración, como nuevos.", categoria: "Tecnología", imagen: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop" },
      { nombre: "Cámara Canon EOS Rebel", descripcion: "Cámara DSLR con lente 18-55mm incluido. Perfecta para fotografía amateur, pocos disparos.", categoria: "Tecnología", imagen: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop" },

      // Hogar
      { nombre: "Juego de Sábanas King Size", descripcion: "Set completo de sábanas para cama king size, 100% algodón. Color blanco, muy suaves.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop" },
      { nombre: "Lámpara de Mesa Vintage", descripcion: "Lámpara decorativa con base de madera y pantalla de tela. Crea ambiente cálido y acogedor.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop" },
      { nombre: "Set de Ollas Antiadherentes", descripcion: "Juego de 7 piezas con ollas y sartenes antiadherentes. Incluye tapas de cristal templado.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop" },
      { nombre: "Aspiradora Black & Decker", descripcion: "Aspiradora de mano inalámbrica, perfecta para auto y espacios pequeños. Batería recargable.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" },
      { nombre: "Plantas en Macetas Decorativas", descripcion: "Set de 3 plantas de interior en macetas de cerámica. Fáciles de cuidar, purifican el aire.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop" },
      { nombre: "Mochila Escolar Jansport", descripcion: "Mochila resistente con múltiples compartimientos. Color azul marino, perfecta para estudiantes.", categoria: "Hogar", imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" }
    ];

    const donacionesCreadas = await Donation.insertMany(donacionesReales);
    res.status(201).json({ 
      message: '40 donaciones reales creadas exitosamente', 
      count: donacionesCreadas.length,
      donaciones: donacionesCreadas 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear las donaciones de ejemplo' });
  }
});

module.exports = router;
