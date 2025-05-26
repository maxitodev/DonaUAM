import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <Navbar />
        <div className={`bg-white/90 rounded-3xl shadow-2xl p-10 max-w-lg w-full mt-10 text-center transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
          <div className="animate-bounce inline-block mb-6">
            <div className="bg-pink-100 rounded-full p-4">
              <span className="text-pink-600 w-12 h-12 text-3xl">📦</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-pink-700 mb-6">¡Ups! Donación no encontrada</h2>
          <p className="text-gray-600 mb-8">Parece que este artículo ya no está disponible o ha sido movido.</p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 text-white rounded-full shadow-xl hover:scale-110 hover:shadow-2xl hover:from-pink-600 hover:to-indigo-700 active:scale-95 transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2 mx-auto cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-pink-300/50"
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
      <section className={`min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-12 px-4 transition-opacity duration-1000 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        {showImageModal ? (
          // Imagen ampliada ocupa todo el section
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center w-full h-full">
              <img
                src={donation.imagen}
                alt={donation.nombre}
                className="object-contain rounded-lg"
                style={{
                  maxHeight: "70vh",
                  maxWidth: "90vw",
                  width: "auto",
                  height: "auto",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
                }}
              />
              <p
                className="mt-4 text-gray-100 text-lg font-medium bg-black/30 px-4 py-2 rounded text-center"
                style={{
                  maxWidth: "80vw",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
                title={donation.nombre}
              >
                {donation.nombre}
              </p>
              <button
                className="mt-6 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-xl hover:scale-110 hover:from-pink-600 hover:to-purple-700 active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
                onClick={() => setShowImageModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          // Contenido normal de detalles de donación
          <div className={`w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-700 ease-out ${fadeIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            {/* Columna Izquierda: Imagen y Fecha */}
            <div className="flex-1 flex flex-col items-center justify-between bg-gray-50 min-h-[300px] md:min-h-[400px] p-4 md:p-8">
              {donation.imagen && (
                <div className="relative w-full flex-1 flex items-center justify-center group hover:bg-gray-100 transition-colors">
                  <img
                    src={donation.imagen}
                    alt={donation.nombre}
                    className="object-contain max-h-[350px] w-full transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                    onClick={() => setShowImageModal(true)}
                  />
                  <button
                    className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm text-pink-600 rounded-lg shadow-lg hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    onClick={() => setShowImageModal(true)}
                  >
                    Ampliar imagen
                  </button>
                </div>
              )}
              <div className="mt-8 flex items-center gap-3 text-gray-500 text-sm">
                <span>
                  Publicado el {new Date(donation.fechaCreacion).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Columna Derecha: Detalles y Solicitar */}
            <div className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4 animate-fade-in-down break-words hyphens-auto">
                  {donation.nombre}
                </h1>
                <div className="flex flex-wrap gap-2 md:gap-3 items-center mb-4 md:mb-6">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                    {donation.categoria}
                  </span>
                  {donation.usuario && donation.usuario.nombre && (
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium truncate max-w-[180px] md:max-w-full">
                      Donado por: {donation.usuario.nombre}
                    </span>
                  )}
                </div>
                <div className="mb-4 md:mb-8">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                    Detalles del artículo
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed break-words whitespace-pre-line max-w-full md:max-w-[38rem]">
                    {donation.descripcion}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:gap-4 mt-4 md:mt-8">
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-xl hover:scale-[1.05] hover:from-green-500 hover:to-green-700 active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-300"
                  onClick={() => navigate(`/solicitar/${donation._id}`)}
                >
                  Solicitar
                </button>
                <button
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-xl hover:scale-[1.05] hover:from-pink-600 hover:to-purple-700 active:scale-95 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  onClick={() => navigate("/")}
                >
                  Volver al listado
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
        .animate-modal-in {
          animation: modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        `}
      </style>
    </>
  );
};

export default DonationDetail;