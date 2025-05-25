import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-700 shadow-lg">
      {/* Navbar principal */}
      <div className="max-w-1xl mx-auto px-4 py-3 flex items-center justify-between md:grid md:grid-cols-12 md:gap-4">
        {/* Menú hamburguesa solo en móvil */}
        <button
          className="md:hidden flex items-center text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
          </svg>
        </button>
        {/* Logo */}
        <div className="flex-1 flex items-center justify-center md:justify-start md:col-span-3">
          <Link to="/home" className="text-white font-bold text-2xl tracking-tight select-none mx-auto md:mx-0">
            DonaUAM
          </Link>
        </div>
        {/* Barra de búsqueda en desktop, centrada */}
        <div className="hidden md:flex md:col-span-6 justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full py-2 pl-4 pr-10 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 transition bg-white bg-opacity-90 text-gray-800"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
          </div>
        </div>
        {/* Opciones de navegación en desktop */}
        <div className="hidden md:flex md:col-span-3 items-center justify-end space-x-6">
          <Link to="/home" className="text-white hover:text-yellow-300 font-semibold transition duration-200">Inicio</Link>
          <Link to="/donar" className="text-white hover:text-yellow-300 font-semibold transition duration-200">Donar</Link>
          <Link to="/mis-donaciones" className="text-white hover:text-yellow-300 font-semibold transition duration-200">Mis Donaciones</Link>
          <Link to="/mis-solicitudes" className="text-white hover:text-yellow-300 font-semibold transition duration-200">Mis Solicitudes</Link>
          <Link to="/logout" className="bg-orange-400 hover:bg-orange-500 text-black font-bold py-1 px-4 rounded transition duration-200 shadow">
            Salir
          </Link>
        </div>
        {/* Botón salir en móvil */}
        <div className="flex-shrink-0 ml-2 md:hidden">
          <Link to="/logout" className="bg-orange-400 hover:bg-orange-500 text-black font-bold py-1 px-4 rounded transition duration-200 shadow">
            Salir
          </Link>
        </div>
      </div>
      {/* Barra de búsqueda en móvil */}
      <div className="md:hidden px-4 pb-2">
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full py-2 pl-4 pr-10 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-yellow-300 transition bg-white bg-opacity-90 text-gray-800"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
        </div>
      </div>
      {/* Panel lateral del menú hamburguesa */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? "visible bg-black bg-opacity-40" : "invisible bg-transparent"} md:hidden`}
        onClick={() => setMenuOpen(false)}
        style={{ pointerEvents: menuOpen ? "auto" : "none" }}
      >
        <div
          className={`absolute top-0 left-0 h-full w-64 bg-gradient-to-b from-indigo-600 via-purple-600 to-blue-700 shadow-xl transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col h-full py-8 px-6 space-y-6">
            <Link
              to="/home"
              className="text-white hover:text-yellow-300 font-semibold text-lg transition duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/donar"
              className="text-white hover:text-yellow-300 font-semibold text-lg transition duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Donar
            </Link>
            <Link
              to="/mis-donaciones"
              className="text-white hover:text-yellow-300 font-semibold text-lg transition duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Mis Donaciones
            </Link>
            <Link
              to="/mis-solicitudes"
              className="text-white hover:text-yellow-300 font-semibold text-lg transition duration-200"
              onClick={() => setMenuOpen(false)}
            >
              Mis Solicitudes
            </Link>
            <div className="flex-1" />
            <div className="text-xs text-gray-300 text-center">© {new Date().getFullYear()} DonaUAM</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
