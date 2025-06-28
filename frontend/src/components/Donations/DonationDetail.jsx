import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer";

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-opacity-50"></div>
  </div>
);

const DonationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/donations/${id}`)
      .then(res => res.json())
      .then(data => {
        setDonation(data);
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      })
      .catch(() => {
        setDonation(null);
        setLoading(false);
        setTimeout(() => setFadeIn(true), 100);
      });
  }, [id]);

  if (loading) return <Spinner />;

  if (!donation || donation.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transition-all duration-700 ${fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div className="animate-bounce mb-6">
              <div className="bg-pink-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
                <span className="text-pink-600 text-4xl">📦</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Donación no encontrada</h2>
            <p className="text-gray-600 mb-6">Este artículo ya no está disponible o ha sido removido.</p>
            <button
              className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => navigate("/")}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Modal de imagen */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-4xl w-full h-full sm:h-auto flex items-center justify-center">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/20 backdrop-blur-sm text-white rounded-full p-2 sm:p-3 hover:bg-white/30 transition-all duration-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={Array.isArray(donation.imagen) ? donation.imagen[selectedImageIndex] : donation.imagen}
              alt={donation.nombre}
              className="w-full h-auto max-h-[90vh] sm:max-h-[80vh] object-contain rounded-lg"
            />
            
            {Array.isArray(donation.imagen) && donation.imagen.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4">
                <button
                  className="text-white hover:text-gray-300 transition-colors p-1"
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : donation.imagen.length - 1)}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {selectedImageIndex + 1} de {donation.imagen.length}
                </span>
                <button
                  className="text-white hover:text-gray-300 transition-colors p-1"
                  onClick={() => setSelectedImageIndex(prev => prev < donation.imagen.length - 1 ? prev + 1 : 0)}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-2 sm:py-6 lg:py-8 transition-all duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <nav className="flex items-center gap-2 text-white/80 text-sm">
              <button 
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Inicio</span>
              </button>
              <span className="hidden sm:inline text-white/60">/</span>
              <span className="text-white font-medium">Detalle de donación</span>
            </nav>
          </div>

          {/* Contenedor principal */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden">
          
            {/* Header optimizado para móvil */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {/* Título y categoría */}
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 leading-tight break-words word-wrap overflow-wrap-anywhere">
                    {donation.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium break-words">
                      {donation.categoria}
                    </span>
                    <span className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Disponible
                    </span>
                  </div>
                </div>
                
                {/* Información del donante */}
                {donation.usuario && donation.usuario.nombre && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm text-white/80">Donado por</p>
                      <p className="font-semibold break-words word-wrap overflow-wrap-anywhere">{donation.usuario.nombre}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido principal - Layout móvil first */}
            <div className="flex flex-col lg:grid lg:grid-cols-5 lg:gap-0">
              
              {/* Sección de imágenes - Ocupa más espacio en desktop */}
              <div className="lg:col-span-3 p-4 sm:p-6 bg-gray-50">
              
                {/* Imagen principal */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
                  <div className="relative aspect-square bg-gray-100">
                    {donation.imagen && donation.imagen.length > 0 ? (
                      <>
                        <img
                          src={Array.isArray(donation.imagen) ? donation.imagen[selectedImageIndex] : donation.imagen}
                          alt={donation.nombre}
                          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                          onClick={() => setShowImageModal(true)}
                        />
                        
                        {/* Indicador de zoom */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <span className="hidden sm:inline">Ampliar</span>
                        </div>
                        
                        {/* Controles de navegación para múltiples imágenes */}
                        {Array.isArray(donation.imagen) && donation.imagen.length > 1 && (
                          <>
                            <button
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white hover:shadow-lg transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => prev > 0 ? prev - 1 : donation.imagen.length - 1);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white hover:shadow-lg transition-all duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImageIndex(prev => prev < donation.imagen.length - 1 ? prev + 1 : 0);
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            
                            {/* Indicador de imagen current */}
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                              {selectedImageIndex + 1}/{donation.imagen.length}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Sin imagen disponible</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Galería de miniaturas */}
                {Array.isArray(donation.imagen) && donation.imagen.length > 1 && (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Galería de imágenes</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {donation.imagen.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'border-pink-500 shadow-lg ring-2 ring-pink-200' 
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${donation.nombre} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sección de información y acciones */}
              <div className="lg:col-span-2 p-4 sm:p-6 flex flex-col">
              
                {/* Estado del artículo */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-green-700">Disponible</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="font-bold">Gratuito</span>
                    </div>
                  </div>
                </div>

                {/* Fecha de publicación */}
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">
                    Publicado el {new Date(donation.fechaCreacion).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Descripción */}
                <div className="flex-1 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <div className="bg-gray-50 rounded-xl p-4 overflow-hidden">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words word-wrap overflow-wrap-anywhere hyphens-auto">
                      {donation.descripcion}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigate(`/solicitar/${donation._id}`)}
                  >
                    <div className="flex items-center justify-center gap-3 min-w-0">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <span className="break-words word-wrap">Solicitar este artículo</span>
                    </div>
                  </button>

                  <button
                    className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => navigate("/")}
                  >
                    <div className="flex items-center justify-center gap-2 min-w-0">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="break-words word-wrap">Ver más donaciones</span>
                    </div>
                  </button>
                </div>

                {/* Información adicional */}
                <div className="text-center pt-6 mt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-gray-500 flex-wrap">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm break-words word-wrap text-center">Este artículo es completamente gratuito</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default DonationDetail;