import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";

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

const EditDonation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    imagen: "",
  });
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [imgPreview, setImgPreview] = useState("");

  useEffect(() => {
    // Buscar la donación directamente por ID en el backend
    axios.get(`${API_URL}/donations/${id}`)
      .then(res => {
        const don = res.data;
        setForm({
          nombre: don.nombre,
          descripcion: don.descripcion,
          categoria: don.categoria,
          imagen: don.imagen || ""
        });
        setImgPreview(don.imagen || "");
        setLoading(false);
      })
      .catch(() => {
        setMensaje("Error al cargar la donación.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imagen: reader.result }));
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (
      !form.nombre.trim() ||
      !form.descripcion.trim() ||
      !form.categoria.trim() ||
      !form.imagen
    ) {
      setMensaje("Todos los campos son obligatorios.");
      return;
    }
    // Validar mínimo y máximo de caracteres en nombre (título)
    const nombreLen = form.nombre.trim().length;
    if (nombreLen < 3) {
      setMensaje("El título debe tener al menos 3 caracteres.");
      return;
    }
    if (nombreLen > 40) {
      setMensaje("El título no debe exceder los 40 caracteres.");
      return;
    }
    const descLen = form.descripcion.trim().length;
    if (descLen < 50) {
      setMensaje("La descripción debe tener al menos 50 caracteres.");
      return;
    }
    if (descLen > 200) {
      setMensaje("La descripción no debe exceder los 200 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${API_URL}/donations/${id}`, form);
      setMensaje("¡Donación actualizada exitosamente!");
      setTimeout(() => navigate("/mis-donaciones"), 1200);
    } catch {
      setMensaje("Error al actualizar la donación.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-16 px-4">
        <div className="w-full max-w-xl bg-white/90 rounded-3xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-center text-indigo-900 mb-8">
            Editar Donación
          </h2>
          {loading ? (
            <div className="text-center text-indigo-900 text-xl py-10">Cargando...</div>
          ) : (
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
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition"
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
                <label className="block text-indigo-900 font-semibold mb-2">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  minLength={50}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition resize-none"
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
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-pink-400 outline-none transition bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-indigo-900 font-semibold mb-2">Imagen del artículo <span className="text-pink-700 font-bold">*</span></label>
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="imagen"
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl shadow-md cursor-pointer hover:scale-105 transition-all font-semibold"
                  >
                    Seleccionar archivo
                    <input
                      id="imagen"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imgPreview && (
                    <span className="text-green-700 font-medium">¡Imagen cargada!</span>
                  )}
                </div>
                {imgPreview && (
                  <img
                    src={imgPreview}
                    alt="Vista previa"
                    className="mt-4 rounded-xl max-h-40 mx-auto"
                  />
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300/50"
              >
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
              {mensaje && (
                <div className={`text-center mt-4 font-semibold ${mensaje.startsWith("¡") ? "text-green-600" : "text-pink-700"}`}>
                  {mensaje}
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default EditDonation;
