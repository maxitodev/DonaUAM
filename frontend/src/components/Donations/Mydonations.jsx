import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer";
import useScrollToTop from "../../hooks/useScrollToTop";

const API_URL = import.meta.env.VITE_API_URL;

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

const shimmer =
  "animate-pulse bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100";

const MyDonations = () => {
  // Scroll automático al inicio cuando se carga el componente
  useScrollToTop(true, 100);
  
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmarId, setConfirmarId] = useState(null); // ID de donación a eliminar
  const userId = getUserIdFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setDonaciones([]);
      setLoading(false);
      return;
    }
    axios
      .get(`${API_URL}/donations/usuario/${userId}`)
      .then((res) => {
        setDonaciones(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await axios.patch(`${API_URL}/donations/${id}/estado`, { estado: nuevoEstado });
      setDonaciones((donaciones) =>
        donaciones.map((d) =>
          d._id === id ? { ...d, estado: nuevoEstado } : d
        )
      );
    } catch {
      // Manejo de error opcional
    }
  };

  const handleEliminar = (id) => {
    setConfirmarId(id);
  };

  const confirmarEliminar = async () => {
    if (!confirmarId) return;
    try {
      await axios.delete(`${API_URL}/donations/${confirmarId}`);
      setDonaciones((donaciones) => donaciones.filter((d) => d._id !== confirmarId));
    } catch {
      // Manejo de error opcional
    }
    setConfirmarId(null);
  };

  const cancelarEliminar = () => {
    setConfirmarId(null);
  };

  return (
    <>
      <Navbar />
      <section className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-4 px-2 sm:py-6 sm:px-3 md:py-12 md:px-4`}>
        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 text-center animate-fade-in-down">
            Mis Donaciones
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-3xl shadow-xl overflow-hidden ${shimmer} h-[28rem]`}
                >
                  <div className="h-2/3 w-full" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 w-2/3 rounded bg-indigo-200" />
                    <div className="h-4 w-full rounded bg-indigo-100" />
                    <div className="h-4 w-1/2 rounded bg-pink-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : donaciones.length === 0 ? (
            <div className="bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-10 text-center flex flex-col items-center justify-center">
              <div className="text-3xl sm:text-4xl md:text-6xl mb-4">📦</div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 mb-4">Aún no has realizado donaciones</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6">Cuando dones artículos aparecerán aquí.</p>
              <a
                href="/donar"
                className="px-4 md:px-6 py-2 md:py-3 bg-pink-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:bg-pink-700 transition-all text-sm md:text-base"
              >
                Dona tu primer artículo
              </a>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {donaciones.map((obj, idx) => (
                <div
                  key={obj._id}
                  className="bg-white/95 rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group relative"
                  style={{ animation: `fadeInUp 0.5s ${idx * 0.08}s both` }}
                  onClick={() => navigate(`/editar-donacion/${obj._id}`)}
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="space-y-3 md:space-y-4">
                      {/* Header con imagen y estado */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {obj.imagen && obj.imagen.length > 0 ? (
                              <img
                                src={Array.isArray(obj.imagen) ? obj.imagen[0] : obj.imagen}
                                alt={obj.nombre}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-3xl text-gray-400">📦</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                              {obj.nombre}
                            </h3>
                            <span className="block text-xs text-gray-400">{obj.categoria}</span>
                          </div>
                        </div>
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 shrink-0">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              obj.estado === "Activo"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {obj.estado}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                            {new Date(obj.fechaCreacion).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                      {/* Descripción */}
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">Descripción:</p>
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 max-h-24 sm:max-h-32 overflow-y-auto">
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words whitespace-pre-wrap leading-relaxed">
                            {obj.descripcion}
                          </p>
                        </div>
                      </div>
                      {/* Botones de acción */}
                      <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                        <button
                          className="flex-1 px-3 md:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs md:text-sm hover:bg-indigo-700 transition-all duration-300 cursor-pointer font-medium"
                          onClick={e => { e.stopPropagation(); navigate(`/solicitudes-donacion/${obj._id}`); }}
                        >
                          👁️ Ver Solicitudes
                        </button>
                        <button
                          className="flex-1 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm hover:bg-blue-700 transition-all duration-300 cursor-pointer font-medium"
                          onClick={e => { e.stopPropagation(); navigate(`/editar-donacion/${obj._id}`); }}
                        >
                          ✏️ Editar
                        </button>
                        {obj.estado === "Activo" ? (
                          <button
                            className="flex-1 px-3 md:px-4 py-2 bg-gray-400 text-white rounded-lg text-xs md:text-sm hover:bg-gray-500 transition-all duration-300 cursor-pointer font-medium"
                            onClick={e => { e.stopPropagation(); handleEstadoChange(obj._id, "Inactivo"); }}
                          >
                            ⏸️ Marcar como Inactivo
                          </button>
                        ) : (
                          <>
                            <button
                              className="flex-1 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm hover:bg-green-700 transition-all duration-300 cursor-pointer font-medium"
                              onClick={e => { e.stopPropagation(); handleEstadoChange(obj._id, "Activo"); }}
                            >
                              ▶️ Activar
                            </button>
                            <button
                              className="flex-1 px-3 md:px-4 py-2 bg-pink-600 text-white rounded-lg text-xs md:text-sm hover:bg-pink-700 transition-all duration-300 cursor-pointer font-medium"
                              onClick={e => { e.stopPropagation(); handleEliminar(obj._id); }}
                            >
                              🗑️ Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal de confirmación */}
        {confirmarId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 max-w-xs sm:max-w-sm w-full text-center mx-2">
              <div className="text-3xl sm:text-4xl md:text-5xl mb-4">🗑️</div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4 text-gray-900">¿Eliminar donación?</h3>
              <p className="mb-6 text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                ¿Seguro que deseas eliminar esta donación? Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 text-xs sm:text-sm"
                  onClick={confirmarEliminar}
                >
                  Sí, eliminar
                </button>
                <button
                  className="flex-1 px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded-full bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 text-xs sm:text-sm"
                  onClick={cancelarEliminar}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fadeInUp 0.7s both;
        }
        `}
      </style>
    </>
  );
};

export default MyDonations;
