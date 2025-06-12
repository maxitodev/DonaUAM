const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mejorar descripción de donación con IA
router.post('/improve-description', async (req, res) => {
  try {
    const { descripcion, categoria, nombre } = req.body;

    if (!descripcion || !categoria || !nombre) {
      return res.status(400).json({ 
        error: 'Se requiere descripción, categoría y nombre del artículo' 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'Clave de API de OpenAI no configurada' 
      });
    }

    const prompt = `Mejora esta descripción de donación para hacerla más atractiva y profesional, manteniendo máximo 100 caracteres:

Artículo: ${nombre}
Categoría: ${categoria}
Descripción original: ${descripcion}

Mejora la redacción, hazla más persuasiva y mantén la información importante. Responde solo con la descripción mejorada, sin explicaciones adicionales.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en marketing y redacción. Mejora descripciones de donaciones para hacerlas más atractivas manteniendo la veracidad. Responde únicamente con la descripción mejorada, máximo 100 caracteres."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 80,
      temperature: 0.7,
    });

    let improvedDescription = completion.choices[0].message.content.trim();
    
    // Remover comillas si las tiene
    improvedDescription = improvedDescription.replace(/^["']|["']$/g, '');
    
    // Asegurar que no exceda 200 caracteres
    if (improvedDescription.length > 200) {
      improvedDescription = improvedDescription.substring(0, 197) + '...';
    }

    res.json({
      originalDescription: descripcion,
      improvedDescription: improvedDescription,
      success: true
    });

  } catch (error) {
    console.error('Error al mejorar descripción:', error);
    
    // Manejo específico de errores de OpenAI
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: 'Clave de API de OpenAI inválida' 
      });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ 
        error: 'Cuota de OpenAI agotada' 
      });
    }

    res.status(500).json({ 
      error: 'Error al procesar la solicitud de mejora. Por favor intenta nuevamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
