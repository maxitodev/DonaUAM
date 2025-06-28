import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-opacity-50"></div>
  </div>
);

const MyRequests = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        const userData = await userResponse.json();
        
        if (userData._id) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/requests/usuario/${userData._id}`);
          const data = await response.json();
          setSolicitudes(data);
        }
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchSolicitudes();
  }, []);

  const handleEliminarSolicitud = async (solicitudId) => {
    setEliminando(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requests/${solicitudId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });

      if (response.ok) {
        setSolicitudes(solicitudes.filter(s => s._id !== solicitudId));
        setConfirmarEliminar(null);
      } else {
        console.error("Error al eliminar solicitud");
      }
    } catch (error) {
      console.error("Error al eliminar solicitud:", error);
    } finally {
      setEliminando(false);
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <>
      <Navbar />
      <section className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-4 px-2 sm:py-6 sm:px-3 md:py-12 md:px-4 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-down">
            Mis Solicitudes
          </h1>
          
          {solicitudes.length === 0 ? (
            <div className="bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 text-center">
              <div className="text-3xl sm:text-4xl md:text-6xl mb-4">📋</div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 mb-4">No tienes solicitudes</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6">Cuando solicites donaciones aparecerán aquí.</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 md:px-6 py-2 md:py-3 bg-pink-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:bg-pink-700 transition-all text-sm md:text-base"
              >
                Ver Donaciones
              </button>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud._id}
                  className="bg-white/95 rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="space-y-3 md:space-y-4">
                      {/* Header con título y estado */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-2 border-b border-gray-100">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words hyphens-auto leading-tight">
                            {solicitud.donacion?.nombre || "Donación eliminada"}
                          </h3>
                        </div>
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 shrink-0">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              solicitud.estado === 'aprobada'
                                ? 'bg-green-100 text-green-700'
                                : solicitud.estado === 'rechazada'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {solicitud.estado === 'aprobada' ? 'Aprobada' : 
                             solicitud.estado === 'rechazada' ? 'Rechazada' : 'Enviada'}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                            {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Información detallada */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Motivo:</p>
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 max-h-24 sm:max-h-32 overflow-y-auto">
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words whitespace-pre-wrap leading-relaxed">
                              {solicitud.descripcion}
                            </p>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Teléfono:</p>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 break-all bg-gray-50 rounded px-2 py-1">
                            {solicitud.telefono}
                          </p>
                        </div>
                      </div>

                      {/* Notificación especial para solicitudes aprobadas */}
                      {solicitud.estado === 'aprobada' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-lg">🎉</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-base font-semibold text-green-800 mb-2">
                                ¡Felicidades! Tu solicitud ha sido aprobada
                              </h4>
                              <div className="space-y-2 text-xs md:text-sm text-green-700">
                                <p className="leading-relaxed">
                                  El donador ha revisado tu solicitud y ha decidido otorgarte esta donación.
                                </p>
                                <div className="bg-green-100 rounded-lg p-2 md:p-3">
                                  <p className="font-medium mb-1">📞 Próximos pasos:</p>
                                  <ul className="space-y-1 text-xs md:text-sm">
                                    <li>• El donador se pondrá en contacto contigo pronto</li>
                                    <li>• Mantén tu teléfono disponible: <span className="font-medium">{solicitud.telefono}</span></li>
                                    <li>• Coordinarán juntos la fecha y lugar de entrega</li>
                                    <li>• Asegúrate de revisar tu WhatsApp y correo electrónico</li>
                                  </ul>
                                </div>
                                <p className="text-xs text-green-600 italic">
                                  💡 Si no recibes contacto en 48 horas, puedes ver los detalles de la donación para más información.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mensaje para solicitudes rechazadas */}
                      {solicitud.estado === 'rechazada' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-lg">❌</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-base font-semibold text-red-800 mb-2">
                                Solicitud no aprobada
                              </h4>
                              <p className="text-xs md:text-sm text-red-700 leading-relaxed">
                                Lamentablemente, el donador ha decidido no aprobar tu solicitud en esta ocasión. 
                                Te animamos a seguir participando y solicitar otras donaciones que se ajusten a tus necesidades.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mensaje para solicitudes pendientes */}
                      {solicitud.estado === 'pendiente' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 text-lg">⏳</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-base font-semibold text-yellow-800 mb-2">
                                Solicitud en revisión
                              </h4>
                              <p className="text-xs md:text-sm text-yellow-700 leading-relaxed">
                                Tu solicitud ha sido enviada correctamente y está siendo revisada por el donador. 
                                Recibirás una notificación cuando haya una respuesta.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                        {solicitud.donacion && (
                          <button
                            onClick={() => navigate(`/donacion/${solicitud.donacion._id}`)}
                            className="flex-1 px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs md:text-sm hover:bg-indigo-700 transition-all duration-300 cursor-pointer font-medium"
                          >
                            👁️ Ver Donación
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmarEliminar(solicitud._id)}
                          className="flex-1 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg text-xs md:text-sm hover:bg-red-700 transition-all duration-300 cursor-pointer font-medium"
                        >
                          🗑️ Eliminar Solicitud
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {confirmarEliminar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm w-full text-center mx-2">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-4">🗑️</div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4 text-gray-900">¿Eliminar solicitud?</h3>
              <p className="mb-6 text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                ¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => handleEliminarSolicitud(confirmarEliminar)}
                  disabled={eliminando}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs sm:text-sm"
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                  onClick={() => setConfirmarEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 text-xs sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
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
      <Footer />
    </>
  );
};

export default MyRequests;
