import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-opacity-50"></div>
  </div>
);

const DonationRequests = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Try multiple possible parameter names
  const donacionId = params.donacionId || params.id;
  
  const [solicitudes, setSolicitudes] = useState([]);
  const [donacion, setDonacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [actualizando, setActualizando] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    console.log("URL params:", params);
    console.log("donacionId:", donacionId);
    
    const fetchData = async () => {
      // Validar que donacionId existe
      if (!donacionId) {
        console.error("donacionId is undefined. Available params:", params);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching donation data for ID:", donacionId);
        
        // Obtener información de la donación
        const donacionRes = await fetch(`${import.meta.env.VITE_API_URL}/donations/${donacionId}`);
        
        if (!donacionRes.ok) {
          console.error("Error fetching donation:", donacionRes.status, donacionRes.statusText);
          setDonacion(null);
        } else {
          const donacionData = await donacionRes.json();
          console.log("Donation data:", donacionData);
          setDonacion(donacionData);
        }

        // Obtener solicitudes de la donación
        const solicitudesRes = await fetch(`${import.meta.env.VITE_API_URL}/requests/donacion/${donacionId}`);
        
        if (!solicitudesRes.ok) {
          console.error("Error fetching requests:", solicitudesRes.status, solicitudesRes.statusText);
          setSolicitudes([]);
        } else {
          const solicitudesData = await solicitudesRes.json();
          console.log("Requests data:", solicitudesData);
          setSolicitudes(solicitudesData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setDonacion(null);
        setSolicitudes([]);
      } finally {
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      }
    };

    fetchData();
  }, [donacionId, params]);

  const handleEstadoSolicitud = async (solicitudId, nuevoEstado) => {
    setActualizando(solicitudId);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/requests/${solicitudId}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        setSolicitudes(solicitudes.map(s => 
          s._id === solicitudId ? { ...s, estado: nuevoEstado } : s
        ));
      } else {
        const data = await response.json();
        setErrorMsg(data.message || "Error al actualizar estado");
      }
    } catch (error) {
      setErrorMsg("Error al actualizar estado");
      console.error("Error al actualizar estado:", error);
    } finally {
      setActualizando(null);
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;

  if (!donacion || !donacionId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex items-center justify-center px-4">
          <div className="bg-white/90 rounded-3xl shadow-2xl p-10 text-center max-w-md">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Donación no encontrada</h2>
            <p className="text-gray-600 mb-6">No se pudo cargar la información de la donación.</p>
            <button
              onClick={() => navigate("/mis-donaciones")}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:scale-105 transition-all cursor-pointer"
            >
              Volver a Mis Donaciones
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-4 px-2 sm:py-6 sm:px-3 md:py-12 md:px-4 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          {/* Header con información de la donación */}
          <div className="bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start">
              {donacion.imagen && (
                <div className="w-full md:w-auto flex justify-center md:justify-start">
                  <img
                    src={donacion.imagen}
                    alt={donacion.nombre}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-xl flex-shrink-0"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 w-full">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words hyphens-auto leading-tight">
                  Solicitudes para: <span className="text-indigo-600">{donacion.nombre}</span>
                </h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-indigo-100 text-indigo-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium break-words">
                    {donacion.categoria}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium break-words ${
                    donacion.estado === 'Activo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {donacion.estado}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words hyphens-auto leading-relaxed">{donacion.descripcion}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mt-4">
              <button
                onClick={() => navigate("/mis-donaciones")}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-all cursor-pointer text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                ← Volver
              </button>
            </div>
          </div>

          {/* Lista de solicitudes */}
          <div className="bg-white/95 rounded-2xl md:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              Solicitudes Recibidas ({solicitudes.length})
            </h2>

            {solicitudes.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="text-4xl md:text-5xl mb-4">📭</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No hay solicitudes</h3>
                <p className="text-sm md:text-base text-gray-600">Aún no has recibido solicitudes para esta donación.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {solicitudes.map((solicitud) => (
                  <div
                    key={solicitud._id}
                    className="border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="space-y-3 md:space-y-4">
                      {/* Header con nombre y estado */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-2 border-b border-gray-100">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words hyphens-auto leading-tight">
                            {solicitud.nombre}
                          </h3>
                        </div>
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 shrink-0">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              solicitud.estado === 'aprobada'
                                ? 'bg-green-100 text-green-700'
                                : solicitud.estado === 'rechazada'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {solicitud.estado === 'aprobada' ? 'Aprobada' : 
                             solicitud.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Información de contacto y motivo */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-2">
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 block">Email:</span>
                            <span className="text-xs sm:text-sm text-gray-600 break-all">{solicitud.correo}</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 block">Teléfono:</span>
                            <span className="text-xs sm:text-sm text-gray-600 break-all">{solicitud.telefono}</span>
                          </div>
                          <div className="min-w-0 lg:hidden">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 block">Fecha completa:</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">Motivo:</span>
                          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 max-h-32 overflow-y-auto">
                            <p className="text-xs sm:text-sm text-gray-600 break-words whitespace-pre-wrap leading-relaxed">
                              {solicitud.descripcion}
                            </p>
                          </div>
                          <div className="hidden lg:block mt-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 block">Fecha completa:</span>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-col xs:flex-row gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleEstadoSolicitud(solicitud._id, 'aprobada')}
                          disabled={actualizando === solicitud._id || solicitud.estado !== 'pendiente'}
                          className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                        >
                          {actualizando === solicitud._id
                            ? 'Aprobando...'
                            : '✓ Aprobar'}
                        </button>
                        <button
                          onClick={() => handleEstadoSolicitud(solicitud._id, 'rechazada')}
                          disabled={actualizando === solicitud._id || solicitud.estado !== 'pendiente'}
                          className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                        >
                          {actualizando === solicitud._id
                            ? 'Rechazando...'
                            : '✗ Rechazar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 text-center text-red-600 font-semibold text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DonationRequests;
