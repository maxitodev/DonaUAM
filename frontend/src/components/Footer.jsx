import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              DonaUAM
            </h3>
            <p className="text-indigo-200 leading-relaxed">
              Plataforma de donativos de la Universidad Autónoma Metropolitana - Cuajimalpa. 
              Conectando a la comunidad universitaria a través del intercambio solidario de recursos.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-300">Enlaces útiles</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/maxitodev" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-200 hover:text-white hover:text-pink-300 transition-colors duration-200"
                >
                  GitHub 
                </a>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/in/maxitodev/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-200 hover:text-white hover:text-pink-300 transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a 
                  href="https://www.maxitodev.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-200 hover:text-white hover:text-pink-300 transition-colors duration-200"
                >
                  Portafolio Web
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-300">Información del Proyecto</h3>
            <div className="text-indigo-200 space-y-3">
              <div>
                <p className="font-semibold text-white">Desarrollador:</p>
                <p>Max Uriel Sánchez Díaz</p>
                <a 
                  href="mailto:contacto@maxitodev.com" 
                  className="text-pink-300 hover:text-white transition-colors duration-200"
                >
                  contacto@maxitodev.com
                </a>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold text-white">Supervisores del proyecto:</p>
                <p>Dra. María del Carmen Gómez Fuentes</p>
                <p>Dr. Jorge Cervantes Ojeda</p>
                <p className="text-sm mt-1">
                  DMAS - Ingeniería en Computación<br />
                  Universidad Autónoma Metropolitana
                </p>
              </div>
              
              <div className="mt-4">
                <p className="font-semibold text-white">Idea original:</p>
                <p>César Jovani Rodríguez De Jesús</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-700 mt-8 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-indigo-200 text-center">
              © 2025 DonaUAM - Sistema de Donativos UAM-C. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
