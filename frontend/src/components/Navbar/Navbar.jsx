import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { scrollToTop } from "../../utils/scrollUtils";

const Navbar = ({ searchTerm, onSearchChange, onClearSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar cuando el usuario ha hecho scroll para mostrar el botón "scroll to top"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función combinada para manejar navegación
  const handleNavigation = (callback) => {
    setMenuOpen(false);
    if (onClearSearch) onClearSearch();
    if (callback) callback();
    // Pequeño delay para asegurar que la navegación ocurra antes del scroll
    setTimeout(() => scrollToTop(), 100);
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-700 shadow-lg">
      {/* Navbar principal */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menú hamburguesa - aparece en pantallas pequeñas y medianas */}
          <button
            className="xl:hidden flex items-center text-white focus:outline-none hover:text-yellow-300 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
            </svg>
          </button>

          {/* Logo - centrado en móvil, izquierda en desktop */}
          <div className="flex-1 xl:flex-none flex items-center justify-center xl:justify-start">
            <Link
              to="/home"
              onClick={() => handleNavigation(onClearSearch)}
              className="text-white font-bold text-xl sm:text-2xl tracking-tight select-none hover:text-yellow-300 transition-colors duration-200"
            >
              DonaUAM
            </Link>
          </div>

          {/* Barra de búsqueda - solo en pantallas muy grandes */}
          <div className="hidden xl:flex flex-1 justify-center max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar donaciones, categorías..."
                className="w-full py-2.5 pl-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200 bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                value={searchTerm}
                onChange={onSearchChange}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navegación completa - solo en pantallas muy grandes */}
          <div className="hidden xl:flex items-center space-x-6">
            <Link to="/home" onClick={() => handleNavigation(onClearSearch)} className="text-white hover:text-yellow-300 font-medium transition-colors duration-200 whitespace-nowrap">
              Inicio
            </Link>
            <Link to="/donar" onClick={() => handleNavigation(onClearSearch)} className="text-white hover:text-yellow-300 font-medium transition-colors duration-200 whitespace-nowrap">
              Donar
            </Link>
            <Link to="/mis-donaciones" onClick={() => handleNavigation(onClearSearch)} className="text-white hover:text-yellow-300 font-medium transition-colors duration-200 whitespace-nowrap">
              Mis Donaciones
            </Link>
            <Link to="/mis-solicitudes" onClick={() => handleNavigation(onClearSearch)} className="text-white hover:text-yellow-300 font-medium transition-colors duration-200 whitespace-nowrap">
              Mis Solicitudes
            </Link>
            <Link 
              to="/logout" 
              onClick={() => handleNavigation(onClearSearch)} 
              className="bg-orange-400 hover:bg-orange-500 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              Salir
            </Link>
          </div>

          {/* Botón salir compacto para pantallas medianas */}
          <div className="hidden lg:flex xl:hidden">
            <Link 
              to="/logout" 
              onClick={() => handleNavigation(onClearSearch)} 
              className="bg-orange-400 hover:bg-orange-500 text-black font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Salir
            </Link>
          </div>

          {/* Botón salir para móvil */}
          <div className="flex lg:hidden">
            <Link 
              to="/logout" 
              onClick={() => handleNavigation(onClearSearch)} 
              className="bg-orange-400 hover:bg-orange-500 text-black font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 shadow-lg text-sm"
            >
              Salir
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda para pantallas medianas y pequeñas */}
        <div className="xl:hidden mt-3 px-1">
          <div className="relative w-full max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar donaciones..."
              className="w-full py-2.5 pl-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200 bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-500"
              value={searchTerm}
              onChange={onSearchChange}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral del menú hamburguesa - mejorado para mejor responsividad */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${menuOpen ? "visible bg-black bg-opacity-50" : "invisible bg-transparent"} xl:hidden`}
        onClick={() => setMenuOpen(false)}
        style={{ pointerEvents: menuOpen ? "auto" : "none" }}
      >
        <div
          className={`absolute top-0 left-0 h-full w-72 sm:w-80 bg-gradient-to-b from-indigo-600 via-purple-600 to-blue-700 shadow-2xl transform transition-all duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header del menú lateral */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-white font-bold text-xl">DonaUAM</h2>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white hover:text-yellow-300 transition-colors duration-200"
              aria-label="Cerrar menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navegación del menú lateral */}
          <div className="flex flex-col h-full py-6 px-6 space-y-4">
            <Link
              to="/home"
              onClick={() => handleNavigation()}
              className="flex items-center space-x-3 text-white hover:text-yellow-300 hover:bg-white/10 font-medium text-lg transition-all duration-200 p-3 rounded-lg group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </Link>
            
            <Link
              to="/donar"
              onClick={() => handleNavigation()}
              className="flex items-center space-x-3 text-white hover:text-yellow-300 hover:bg-white/10 font-medium text-lg transition-all duration-200 p-3 rounded-lg group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Donar</span>
            </Link>
            
            <Link
              to="/mis-donaciones"
              onClick={() => handleNavigation()}
              className="flex items-center space-x-3 text-white hover:text-yellow-300 hover:bg-white/10 font-medium text-lg transition-all duration-200 p-3 rounded-lg group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Mis Donaciones</span>
            </Link>
            
            <Link
              to="/mis-solicitudes"
              onClick={() => handleNavigation()}
              className="flex items-center space-x-3 text-white hover:text-yellow-300 hover:bg-white/10 font-medium text-lg transition-all duration-200 p-3 rounded-lg group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Mis Solicitudes</span>
            </Link>

            {/* Separador */}
            <div className="border-t border-white/20 my-4"></div>

            {/* Botón de salir prominente en el menú lateral */}
            <Link
              to="/logout"
              onClick={() => handleNavigation()}
              className="flex items-center justify-center space-x-3 bg-orange-400 hover:bg-orange-500 text-black font-semibold text-lg transition-all duration-200 p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 mt-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar Sesión</span>
            </Link>

            {/* Footer del menú lateral */}
            <div className="flex-1"></div>
            <div className="text-xs text-gray-300 text-center mt-8 pt-4 border-t border-white/20">
              © {new Date().getFullYear()} DonaUAM
              <br />
              <span className="text-gray-400">Universidad Autónoma Metropolitana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Volver al inicio"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default Navbar;
