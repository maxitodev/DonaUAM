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
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.087"/>
                                </svg>
                                 WhatsApp
                              </button>
                              <button
                                onClick={() => sendEmail(solicitud)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300 cursor-pointer text-xs sm:text-sm font-medium shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                 Email
                              </button>
                            </div>
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
    </>
  );
};

export default DonationRequests;
