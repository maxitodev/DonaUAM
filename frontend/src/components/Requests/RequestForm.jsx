import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-opacity-50"></div>
  </div>
);

const RequestForm = ({ donacionId: propDonacionId, onSuccess }) => {
  const params = useParams();
  const navigate = useNavigate();
  const donacionId = propDonacionId || params.id;
  const [fadeIn, setFadeIn] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [donacion, setDonacion] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    // Obtener información de la donación para mostrar detalles
    setFetchLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/donations/${donacionId}`)
      .then((res) => res.json())
      .then((data) => {
        setDonacion(data);
        setFetchLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      })
      .catch(() => {
        setDonacion(null);
        setFetchLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      });
  }, [donacionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/requests/${donacionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ descripcion, telefono }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensaje("¡Solicitud enviada correctamente!");
        setDescripcion("");
        setTelefono("");
        if (onSuccess) onSuccess();
      } else {
        setError(data.message || "Error al enviar la solicitud.");
      }
    } catch {
      setError("Error de red o servidor.");
    }
    setLoading(false);
  };

  if (fetchLoading) return <><Navbar /><Spinner /></>;

  if (!donacion || donacion.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Navbar />
        <div className={`bg-white/90 rounded-3xl shadow-2xl p-10 max-w-lg w-full mt-10 text-center transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
          <div className="animate-bounce inline-block mb-6">
            <div className="bg-pink-100 rounded-full p-4">
              <span className="text-pink-600 w-12 h-12 text-3xl">📦</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-pink-700 mb-6">¡Ups! Donación no encontrada</h2>
          <p className="text-gray-600 mb-8">No se puede crear una solicitud para esta donación.</p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full shadow-xl hover:scale-105 transition-transform font-semibold text-lg flex items-center justify-center gap-2 mx-auto"
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className={`min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-8 px-3 md:py-12 md:px-4 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className={`w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-700 ease-out ${fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="p-5 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 animate-fade-in-down flex flex-col md:flex-row md:items-center md:gap-3">
              <span className="text-lg md:text-xl text-gray-700">Solicitar:</span>
              <span className="text-pink-600 break-words hyphens-auto">{donacion.nombre}</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 md:gap-3 items-center mb-4 md:mb-6">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                {donacion.categoria}
              </span>
              {donacion.usuario && donacion.usuario.nombre && (
                <span className="bg-pink-100 text-pink-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium truncate max-w-[200px]">
                  Donado por: {donacion.usuario.nombre}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5 mt-4 md:mt-6">
              <div>
                <label htmlFor="descripcion" className="block font-medium mb-2 text-gray-700">
                  ¿Por qué necesitas esta donación?
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  rows={4}
                  placeholder="Explica brevemente tu motivo..."
                />
              </div>
              
              <div>
                <label htmlFor="telefono" className="block font-medium mb-2 text-gray-700">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej. 5512345678"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70"
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/donacion/${donacionId}`)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
              
              {mensaje && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {mensaje}
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      <style>
        {`
        .animate-fade-in-down {
          animation: fadeInDown 0.7s both;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate3d(0, -40px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        `}
      </style>
    </>
  );
};

export default RequestForm;