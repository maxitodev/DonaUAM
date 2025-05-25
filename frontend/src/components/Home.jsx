import React, { useEffect, useState } from "react";
import Navbar from "./Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import SkeletonCard from "./SkeletonCard";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const navigate = useNavigate();
  const [objetos, setObjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar donaciones desde el backend usando la variable de entorno
    axios.get(`${API_URL}/donations`)
      .then(res => {
        setObjetos(res.data.filter(obj => obj.estado === "Activo"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="w-full bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-20 px-4 transition-opacity duration-1000 opacity-100"
      >
        <div 
          className="max-w-7xl mx-auto text-center bg-white/90 rounded-3xl shadow-2xl py-14 px-4 md:px-16"
        >
          <h1 
            className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 mb-6 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            Plataforma de Donativos UAM-C
          </h1>
          <p 
            className="text-xl md:text-2xl text-indigo-900 mb-10 font-medium transition-opacity duration-1000"
          >
            Dona, solicita y comparte recursos con tu comunidad universitaria.<br className="hidden sm:block" /> 
            <span className="font-bold text-pink-700">Juntos, hacemos la diferencia.</span>
          </p>
          <button 
            className="px-10 py-4 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white font-bold text-xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300/50 cursor-pointer"
            onClick={() => navigate('/donar')}
          >
            Comienza a donar
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div 
          className="max-w-7xl mx-auto px-4"
        >
          <h2 
            className="text-4xl font-bold text-center text-indigo-900 mb-16"
          >
            ¿Cómo te ayuda DonaUAM?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div 
              className="p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl text-white">🎁</span>
              </div>
              <h3 className="text-2xl font-semibold text-indigo-900 mb-4 text-center">Dona fácilmente</h3>
              <p className="text-gray-600 text-center">
                Publica artículos que ya no necesitas y ayuda a otros estudiantes a aprovecharlos.
              </p>
            </div>
            <div 
              className="p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl text-white">🔎</span>
              </div>
              <h3 className="text-2xl font-semibold text-indigo-900 mb-4 text-center">Solicita lo que necesitas</h3>
              <p className="text-gray-600 text-center">
                Encuentra y solicita artículos disponibles para ti dentro de la comunidad UAM-C.
              </p>
            </div>
            <div 
              className="p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-4xl text-white">🤝</span>
              </div>
              <h3 className="text-2xl font-semibold text-indigo-900 mb-4 text-center">Conecta y apoya</h3>
              <p className="text-gray-600 text-center">
                Contacta a otros usuarios, coordina entregas y fortalece la solidaridad universitaria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donations Section */}
      <section className="py-20 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="flex flex-col md:flex-row justify-between items-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4 md:mb-0">Artículos disponibles</h2>
            <button 
              className="mt-4 md:mt-0 px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full shadow-xl hover:scale-105 transition-all cursor-pointer"
              onClick={() => navigate('/donar')}
            >
              Donar un artículo
            </button>
          </div>
          
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && objetos.length === 0 && (
            <div 
              className="flex flex-col items-center justify-center h-96 transition-opacity duration-500 opacity-100"
            >
              <p className="text-2xl text-indigo-900 mb-6">Aún no hay donaciones disponibles</p>
              <button 
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full shadow-xl hover:scale-105 transition-all cursor-pointer"
                onClick={() => navigate('/donar')}
              >
                Sé el primero en donar
              </button>
            </div>
          )}

          {!loading && objetos.length > 0 && (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {objetos.map((obj) => (
                <div 
                  key={obj._id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-2 transition-all cursor-pointer"
                  onClick={() => navigate(`/donacion/${obj._id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/donacion/${obj._id}`); }}
                >
                  <div className="h-64 bg-gray-200 relative">
                    {obj.imagen && obj.imagen.trim() !== "" ? (
                      <img 
                        src={obj.imagen} 
                        alt={obj.nombre} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl text-gray-400">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-2">{obj.nombre}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{obj.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">{obj.categoria}</span>
                      <button 
                        className="px-5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-full font-semibold shadow-md hover:scale-105 hover:from-pink-600 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-pink-300/50 cursor-pointer"
                        onClick={e => { e.stopPropagation(); navigate(`/donacion/${obj._id}`); }}
                      >
                        Solicitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg md:text-xl mb-8">© 2025 DonaUAM. Todos los derechos reservados.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-pink-400 transition-colors">Contacto</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Aviso de privacidad</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;