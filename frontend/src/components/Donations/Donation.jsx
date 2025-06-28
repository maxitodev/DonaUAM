import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";
import imageCompression from 'browser-image-compression';

const API_URL = import.meta.env.VITE_API_URL;

const categorias = [
  "Libros",
  "Electrónica",
  "Accesorios",
  "Útiles escolares",
  "Ropa",
  "Mochilas y bolsos",
  "Material de laboratorio",
  "Deportes",
  "Arte y papelería",
  "Muebles",
  "Instrumentos musicales",
  "Juguetes",
  "Herramientas",
  "Otros"
];

function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || "";
  } catch {
    return "";
  }
}

const Donation = () => {
  const userId = getUserIdFromToken();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    imagen: [],
    usuario: userId
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [aiModal, setAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [compressing, setCompressing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Manejar carga de imagen y convertir a base64
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validar límite de 3 imágenes
    if (form.imagen.length + files.length > 3) {
      setMensaje("No puedes subir más de 3 imágenes en total.");
      return;
    }
    
    setCompressing(true);
    setMensaje("");
    
    try {
      for (const file of files) {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm((prev) => ({ ...prev, imagen: [...prev.imagen, reader.result] }));
        };
        reader.readAsDataURL(compressedFile);
      }
      setCompressing(false);
    } catch (error) {
      console.error('Error al comprimir la imagen:', error);
      setMensaje("Error al comprimir la imagen. Intenta nuevamente.");
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    // Validar que todos los campos sean obligatorios
    if (
      !form.nombre.trim() ||
      !form.descripcion.trim() ||
      !form.categoria.trim() ||
      form.imagen.length === 0 ||
      !form.usuario
    ) {
      setMensaje("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }
    // Validar mínimo y máximo de caracteres en nombre (título)
    const nombreLen = form.nombre.trim().length;
    if (nombreLen < 3) {
      setMensaje("El título debe tener al menos 3 caracteres.");
      setLoading(false);
      return;
    }
    if (nombreLen > 40) {
      setMensaje("El título no debe exceder los 40 caracteres.");
      setLoading(false);
      return;
    }
    // Validar mínimo y máximo de caracteres en descripción
    const descLen = form.descripcion.trim().length;
    if (descLen < 50) {
      setMensaje("La descripción debe tener al menos 50 caracteres.");
      setLoading(false);
      return;
    }
    if (descLen > 200) {
      setMensaje("La descripción no debe exceder los 200 caracteres.");
      setLoading(false);
      return;
    }
    try {
      await axios.post(`${API_URL}/donations`, form);
      setMensaje("¡Donación registrada exitosamente!");
      setTimeout(() => navigate("/mis-donaciones"), 1200);
    } catch {
      setMensaje("Error al registrar la donación.");
    }
    setLoading(false);
  };

  const handleAiImprovement = async () => {
    if (!form.descripcion.trim() || !form.categoria || !form.nombre.trim()) {
      setMensaje("Por favor completa el nombre, categoría y descripción antes de usar la IA.");
      return;
    }

    setAiLoading(true);
    setAiModal(true);
    setOriginalDescription(form.descripcion);

    try {
      const response = await axios.post(`${API_URL}/ai/improve-description`, {
        descripcion: form.descripcion,
        categoria: form.categoria,
        nombre: form.nombre
      });

      setImprovedDescription(response.data.improvedDescription);
    } catch (error) {
      console.error('Error al mejorar descripción:', error);
      setMensaje("Error al conectar con el servicio de IA. Intenta nuevamente.");
      setAiModal(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAiDescription = () => {
    setForm({ ...form, descripcion: improvedDescription });
    setAiModal(false);
    setMensaje("¡Descripción mejorada aplicada exitosamente!");
    setTimeout(() => setMensaje(""), 3000);
  };

  const handleRejectAiDescription = () => {
    setAiModal(false);
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      imagen: prev.imagen.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-16 px-4">
        <div className="w-full max-w-xl bg-white/90 rounded-3xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-center text-indigo-900 mb-8">
            Dona un artículo
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-indigo-900 font-semibold mb-2">Nombre del artículo</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={40}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition cursor-text hover:border-pink-300"
                placeholder="Ej. Calculadora Científica"
              />
              {form.nombre && form.nombre.trim().length > 0 && form.nombre.trim().length < 3 && (
                <div className="text-pink-700 text-sm mt-1">El título debe tener al menos 3 caracteres.</div>
              )}
              {form.nombre && form.nombre.trim().length > 40 && (
                <div className="text-pink-700 text-sm mt-1">El título no debe exceder los 40 caracteres.</div>
              )}
              <div className="text-right text-xs text-gray-500 mt-1">
                {form.nombre.trim().length}/40 caracteres
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-indigo-900 font-semibold">Descripción</label>
                <button
                  type="button"
                  onClick={handleAiImprovement}
                  disabled={!form.descripcion.trim() || !form.categoria || !form.nombre.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Mejorar con IA</span>
                </button>
              </div>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                required
                minLength={50}
                maxLength={200}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition resize-none cursor-text hover:border-pink-300"
                placeholder="Describe el estado, uso, detalles relevantes... (mínimo 50, máximo 200 caracteres)"
              />
              {form.descripcion && form.descripcion.trim().length > 0 && form.descripcion.trim().length < 50 && (
                <div className="text-pink-700 text-sm mt-1">La descripción debe tener al menos 50 caracteres.</div>
              )}
              {form.descripcion && form.descripcion.trim().length > 200 && (
                <div className="text-pink-700 text-sm mt-1">La descripción no debe exceder los 200 caracteres.</div>
              )}
              <div className="text-right text-xs text-gray-500 mt-1">
                {form.descripcion.trim().length}/200 caracteres
              </div>
            </div>
            <div>
              <label className="block text-indigo-900 font-semibold mb-2">Categoría</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition bg-white cursor-pointer hover:border-pink-300"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-indigo-900 font-semibold mb-2">
                Imágenes del artículo <span className="text-pink-700 font-bold">*</span>
                <span className="text-sm text-gray-600 ml-2">(Máximo 3 imágenes)</span>
              </label>
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="imagen"
                  className={`px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl shadow-md cursor-pointer hover:scale-110 hover:shadow-xl hover:from-pink-600 hover:to-indigo-600 active:scale-95 transition-all duration-300 font-semibold transform hover:-translate-y-1 ${compressing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {compressing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Comprimiendo...
                    </>
                  ) : (
                    "Seleccionar imágenes"
                  )}
                  <input
                    id="imagen"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden cursor-pointer"
                    required
                    disabled={compressing}
                  />
                </label>
                {form.imagen.length > 0 && !compressing && (
                  <span className="text-green-700 font-medium">
                    {form.imagen.length} imagen{form.imagen.length !== 1 ? 'es' : ''} subida{form.imagen.length !== 1 ? 's' : ''} exitosamente
                  </span>
                )}
              </div>
              {compressing && (
                <div className="text-blue-600 text-sm flex items-center mt-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Comprimiendo imagen{form.imagen.length > 1 ? 'es' : ''} para optimizar el tamaño...
                </div>
              )}
              {form.imagen.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {form.imagen.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        title="Eliminar imagen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white font-bold text-xl shadow-xl hover:scale-105 hover:shadow-2xl hover:from-pink-700 hover:via-purple-700 hover:to-indigo-800 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
            >
              {loading ? "Enviando..." : "Donar artículo"}
            </button>
            {mensaje && (
              <div className={`text-center mt-4 font-semibold ${mensaje.startsWith("¡") ? "text-green-600" : "text-pink-700"}`}>
                {mensaje}
              </div>
            )}
          </form>
        </div>

        {/* AI Modal */}
        {aiModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-900 flex items-center space-x-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Mejora con IA</span>
                  </h3>
                  <button
                    onClick={handleRejectAiDescription}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {aiLoading ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mb-3 sm:mb-4"></div>
                    <p className="text-gray-600 text-base sm:text-lg">La IA está mejorando tu descripción...</p>
                    <p className="text-gray-500 text-sm mt-1 sm:mt-2">Esto puede tomar unos segundos</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Tu descripción original:</span>
                      </h4>
                      <div className="text-red-700 bg-white p-2 sm:p-3 rounded-lg border text-sm sm:text-base break-words max-h-24 sm:max-h-32 overflow-y-auto">
                        {originalDescription}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Descripción mejorada por IA:</span>
                      </h4>
                      <div className="text-green-700 bg-white p-2 sm:p-3 rounded-lg border text-sm sm:text-base break-words max-h-24 sm:max-h-32 overflow-y-auto">
                        {improvedDescription}
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1 sm:mt-2">
                        {improvedDescription.length}/200 caracteres
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={handleAcceptAiDescription}
                        className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Usar descripción mejorada</span>
                      </button>
                      <button
                        onClick={handleRejectAiDescription}
                        className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:from-gray-600 hover:to-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Mantener original</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Donation;
