import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";

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
      <section className="min-h-screen bg-gradient-to-b from-white to-indigo-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 text-center mb-12 drop-shadow-lg">
            Mis Donaciones
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-3xl shadow-xl overflow-hidden ${shimmer} h-[28rem]`} // altura aumentada
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
            <div className="flex flex-col items-center justify-center h-80 animate-fade-in">
              <p className="text-2xl text-indigo-900 mb-6 font-semibold">
                Aún no has realizado donaciones
              </p>
              <a
                href="/donar"
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full shadow-xl hover:scale-105 transition-transform duration-200 font-semibold"
              >
                Dona tu primer artículo
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {donaciones.map((obj, idx) => (
                <div
                  key={obj._id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative h-[35rem]"
                  style={{ animation: `fadeInUp 0.5s ${idx * 0.08}s both` }}
                  onClick={() => navigate(`/editar-donacion/${obj._id}`)}
                >
                  <div className="h-64 bg-gray-200 relative overflow-hidden">
                    {obj.imagen && obj.imagen.trim() !== "" ? (
                      <img
                        src={obj.imagen}
                        alt={obj.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl text-gray-400">📦</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                          obj.estado === "Activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {obj.estado}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col h-64">
                    {/* Información de la donación */}
                    <div className="mb-2">
                      <span className="block text-xs text-gray-400 mb-1">Título</span>
                      <h3 className="text-xl font-semibold text-indigo-900 truncate">
                        {obj.nombre}
                      </h3>
                    </div>
                    <div className="mb-4">
                      <span className="block text-xs text-gray-400 mb-1">Descripción</span>
                      <p className="text-gray-600 line-clamp-3">{obj.descripcion}</p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {obj.categoria}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(obj.fechaCreacion).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        className="px-4 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/editar-donacion/${obj._id}`); }}
                      >
                        Editar
                      </button>
                      {obj.estado === "Activo" ? (
                        <button
                          className="px-4 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 bg-gray-400 hover:bg-gray-500 cursor-pointer"
                          onClick={e => { e.stopPropagation(); handleEstadoChange(obj._id, "Inactivo"); }}
                        >
                          Marcar como Inactivo
                        </button>
                      ) : (
                        <>
                          <button
                            className="px-4 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 bg-green-600 hover:bg-green-700 cursor-pointer"
                            onClick={e => { e.stopPropagation(); handleEstadoChange(obj._id, "Activo"); }}
                          >
                            Activar
                          </button>
                          <button
                            className="px-4 py-2 rounded-full text-white font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 bg-pink-600 hover:bg-pink-700 cursor-pointer"
                            onClick={e => { e.stopPropagation(); handleEliminar(obj._id); }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal de confirmación */}
        {confirmarId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
              <h3 className="text-xl font-bold mb-4 text-indigo-900">¿Eliminar donación?</h3>
              <p className="mb-6 text-gray-700">¿Seguro que deseas eliminar esta donación? Esta acción no se puede deshacer.</p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-6 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition cursor-pointer"
                  onClick={confirmarEliminar}
                >
                  Sí, eliminar
                </button>
                <button
                  className="px-6 py-2 rounded-full bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition cursor-pointer"
                  onClick={cancelarEliminar}
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
