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
  const [showModal, setShowModal] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

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

  const handleEntregaCompletada = async (solicitudId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/donations/${donacionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });

      if (response.ok) {
        setSolicitudes(solicitudes.filter(s => s._id !== solicitudId));
        navigate("/mis-donaciones");
      } else {
        const data = await response.json();
        setErrorMsg(data.message || "Error al completar la entrega");
      }
    } catch (error) {
      setErrorMsg("Error al completar la entrega");
      console.error("Error al completar la entrega:", error);
    }
  };

  // Utility functions for contact actions
  const formatMexicanPhoneForWhatsApp = (phone) => {
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If it starts with 52, it's already formatted for international
    if (cleanPhone.startsWith('52')) {
      return cleanPhone;
    }
    
    // If it starts with 1, remove it (some Mexican numbers have this prefix)
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Add Mexico country code (52) if it's a 10-digit number
    if (cleanPhone.length === 10) {
      return '52' + cleanPhone;
    }
    
    return cleanPhone;
  };

  const sendWhatsAppMessage = (solicitud) => {
    const formattedPhone = formatMexicanPhoneForWhatsApp(solicitud.telefono);
    // Use a simpler message format that works better with WhatsApp URL encoding
    const message = `Hola ${solicitud.nombre}!

EXCELENTES NOTICIAS!

Tu solicitud para la donacion "${donacion.nombre}" ha sido APROBADA

Nos complace informarte que has sido seleccionado(a) para recibir esta donacion.

DETALLES DE LA DONACION:
- Articulo: ${donacion.nombre}
- Categoria: ${donacion.categoria}  
- Fecha de aprobacion: ${new Date().toLocaleDateString('es-MX')}

PROXIMOS PASOS:
Por favor, ponte en contacto conmigo lo antes posible para coordinar la entrega de tu donacion.

Puedes responder a este mensaje o llamarme directamente.

Gracias por ser parte de la comunidad DonaUAM!

Plataforma DonaUAM
"Conectando corazones solidarios"`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmail = (solicitud) => {
    const subject = `🎉 ¡Solicitud Aprobada! - Donación: ${donacion.nombre} - DonaUAM`;
    const body = `👋 Estimado/a ${solicitud.nombre},

🎉 ¡EXCELENTES NOTICIAS! 🎉

Tu solicitud para la donación "${donacion.nombre}" ha sido ✅ APROBADA.

🥳 Nos complace informarte que has sido seleccionado(a) para recibir esta donación.

📦 DETALLES DE LA DONACIÓN:
• Artículo: ${donacion.nombre}
• Categoría: ${donacion.categoria}
• Descripción: ${donacion.descripcion}
• Fecha de aprobación: ${new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}

📝 MOTIVO DE TU SOLICITUD:
"${solicitud.descripcion}"

🤝 PRÓXIMOS PASOS:
Por favor, responde a este correo o contáctame para coordinar la entrega de la donación. Es importante que nos pongamos en contacto lo antes posible para finalizar el proceso.

📞 INFORMACIÓN DE CONTACTO:
• Email: Responde a este correo
• Teléfono: ${solicitud.telefono}

🙏 ¡Gracias por ser parte de la comunidad DonaUAM!

❤️ Saludos cordiales,
🌐 Plataforma DonaUAM
🔗 https://donauam.com

💡 "Conectando corazones solidarios"

---
🤖 Este mensaje fue generado automáticamente desde la plataforma DonaUAM.
❓ Si tienes alguna pregunta, no dudes en responder a este correo.`;

    const mailtoUrl = `mailto:${solicitud.correo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
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
                    src={Array.isArray(donacion.imagen) ? donacion.imagen[0] : donacion.imagen}
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
                      <div className="space-y-2">
                        {/* Botones de aprobación/rechazo */}
                        {solicitud.estado === 'pendiente' && (
                          <div className="flex flex-col xs:flex-row gap-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleEstadoSolicitud(solicitud._id, 'aprobada')}
                              disabled={actualizando === solicitud._id}
                              className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                            >
                              {actualizando === solicitud._id
                                ? 'Aprobando...'
                                : '✓ Aprobar'}
                            </button>
                            <button
                              onClick={() => handleEstadoSolicitud(solicitud._id, 'rechazada')}
                              disabled={actualizando === solicitud._id}
                              className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm font-medium"
                            >
                              {actualizando === solicitud._id
                                ? 'Rechazando...'
                                : '✗ Rechazar'}
                            </button>
                          </div>
                        )}

                        {/* Botones de contacto para solicitudes aprobadas */}
                        {solicitud.estado === 'aprobada' && (
                          <div className="pt-2 border-t border-green-200 bg-green-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs sm:text-sm font-medium text-green-700">
                                ✅ Solicitud aprobada - Contactar beneficiario
                              </span>
                            </div>
                            <div className="flex flex-col xs:flex-row gap-2">
                              <button
                                onClick={() => sendWhatsAppMessage(solicitud)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 hover:scale-[1.02] transition-all duration-300 cursor-pointer text-xs sm:text-sm font-medium shadow-sm"
                              >
                                {/* WhatsApp Icon */}
                                WhatsApp
                              </button>
                              <button
                                onClick={() => sendEmail(solicitud)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300 cursor-pointer text-xs sm:text-sm font-medium shadow-sm"
                              >
                                {/* Email Icon */}
                                Email
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSolicitud(solicitud);
                                setShowModal(true);
                              }}
                              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 hover:scale-[1.02] transition-all duration-300 cursor-pointer text-sm font-semibold shadow-lg border-2 border-orange-200 flex items-center justify-center gap-2 group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span className="group-hover:text-yellow-100 transition-colors duration-300">
                                  Marcar Entrega Completada
                                </span>
                                <div className="w-4 h-4 text-yellow-200 group-hover:animate-bounce">
                                  📦
                                </div>
                              </div>
                            </button>
                            <p className="text-xs text-green-600 mt-2 text-center">
                              💡 Comunícate para coordinar la entrega
                            </p>
                          </div>
                        )}

                        {/* Mensaje para solicitudes rechazadas */}
                        {solicitud.estado === 'rechazada' && (
                          <div className="pt-2 border-t border-red-200 bg-red-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-xs sm:text-sm font-medium text-red-700">
                                Solicitud rechazada
                              </span>
                            </div>
                          </div>
                        )}
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

      {/* Modal de confirmación para entrega completada */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Confirmar Entrega?</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto"></div>
            </div>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700 font-medium">
                    <strong>Importante:</strong> Esta acción es irreversible
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    Al confirmar, la donación será eliminada permanentemente de la plataforma y no podrás recuperarla.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 cursor-pointer font-medium border-2 border-gray-200 hover:border-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleEntregaCompletada(selectedSolicitud._id);
                  setShowModal(false);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 cursor-pointer font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationRequests;
