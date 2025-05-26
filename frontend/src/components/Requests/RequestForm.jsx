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
  const [yaSolicito, setYaSolicito] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        // Obtener información de la donación
        const donacionRes = await fetch(`${import.meta.env.VITE_API_URL}/donations/${donacionId}`);
        const donacionData = await donacionRes.json();
        setDonacion(donacionData);

        // Verificar si ya envió una solicitud
        const token = localStorage.getItem("token");
        if (token && donacionData && !donacionData.error) {
          const userRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = await userRes.json();
          
          if (userData._id) {
            const solicitudesRes = await fetch(`${import.meta.env.VITE_API_URL}/requests/usuario/${userData._id}`);
            const solicitudesData = await solicitudesRes.json();
            
            const yaEnvio = solicitudesData.some(sol => 
              sol.donacion && sol.donacion._id === donacionId
            );
            setYaSolicito(yaEnvio);
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setDonacion(null);
      } finally {
        setFetchLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchData();
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
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/mis-solicitudes");
        }, 2000);
      } else {
        setError(data.message || "Error al enviar la solicitud.");
      }
    } catch {
      setError("Error de red o servidor.");
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
          <Spinner />
        </div>
      </>
    );
  }

  if (!donacion || donacion.error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center px-4 py-6">
          <div className={`bg-white/90 rounded-3xl shadow-2xl p-6 md:p-10 max-w-sm md:max-w-lg w-full text-center transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
            <div className="animate-bounce inline-block mb-4 md:mb-6">
              <div className="bg-pink-100 rounded-full p-3 md:p-4">
                <span className="text-pink-600 w-8 h-8 md:w-12 md:h-12 text-2xl md:text-3xl">📦</span>
              </div>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-pink-700 mb-4 md:mb-6">¡Ups! Donación no encontrada</h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">No se puede crear una solicitud para esta donación.</p>
            <button
              className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full shadow-xl hover:scale-105 transition-transform font-semibold text-sm md:text-base lg:text-lg"
              onClick={() => navigate("/")}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </>
    );
  }

  if (yaSolicito) {
    return (
      <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-start justify-center px-4 py-6">
        <div className={`mt-12 bg-white/90 rounded-3xl shadow-2xl p-6 md:p-10 max-w-sm md:max-w-lg w-full text-center transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="animate-bounce inline-block mb-4 md:mb-6">
          <div className="bg-yellow-100 rounded-full p-3 md:p-4">
          <span className="text-yellow-600 w-8 h-8 md:w-12 md:h-12 text-2xl md:text-3xl">⚠️</span>
          </div>
        </div>
        <h2 className="text-xl md:text-3xl font-bold text-yellow-700 mb-4 md:mb-6">Solicitud ya enviada</h2>
        <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8">Ya has enviado una solicitud para esta donación. Puedes revisar el estado en "Mis Solicitudes".</p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
          className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:scale-105 transition-transform font-semibold text-sm md:text-base"
          onClick={() => navigate("/mis-solicitudes")}
          >
          Mis Solicitudes
          </button>
          <button
          className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full shadow-xl hover:scale-105 transition-transform font-semibold text-sm md:text-base"
          onClick={() => navigate(`/donacion/${donacionId}`)}
          >
          Ver Donación
          </button>
        </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center py-4 px-3 md:py-8 lg:py-12 md:px-6 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className={`w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-700 ease-out ${fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 animate-fade-in-down">
              <span className="block text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-1">Solicitar:</span>
              <span className="text-pink-600 break-words leading-tight">{donacion.nombre}</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 md:px-3 lg:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                {donacion.categoria}
              </span>
              {donacion.usuario && donacion.usuario.nombre && (
                <span className="bg-pink-100 text-pink-700 px-2 py-1 md:px-3 lg:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  Donado por: {donacion.usuario.nombre}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div>
                <label htmlFor="descripcion" className="block font-medium mb-2 text-gray-700 text-sm md:text-base">
                  ¿Por qué necesitas esta donación?
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  minLength={20}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
                  rows={3}
                  placeholder="Explica brevemente tu motivo..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {descripcion.length}/200 caracteres (mínimo 20)
                </p>
              </div>
              
              <div>
                <label htmlFor="telefono" className="block font-medium mb-2 text-gray-700 text-sm md:text-base">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]+"
                  title="Ingresa solo números"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-4 md:py-3 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
                  placeholder="Ej. 5512345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exactamente 10 dígitos, solo números
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-70 text-sm md:text-base"
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/donacion/${donacionId}`)}
                  className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer text-sm md:text-base"
                >
                  Cancelar
                </button>
              </div>
              
              {mensaje && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm md:text-base">
                  {mensaje}
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm md:text-base">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
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