import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  useRedirectIfAuthenticated();

  const [correo, setCorreo] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const formRef = useRef(null);
  const bgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis();
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    gsap.fromTo(
      formRef.current,
      { y: 100, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: 'power4.out',
      }
    );

    // Fondo partículas
    const canvas = bgRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(173,216,230,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();

    return () => cancelAnimationFrame(animate);
  }, []);

  const validate = () => {
    const errs = {};
    if (!correo) {
      errs.correo = 'El correo es obligatorio.';
    } else if (!/^[a-zA-Z0-9._%+-]+@cua\.uam\.mx$/.test(correo)) {
      errs.correo = 'El correo debe ser @cua.uam.mx.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { correo });
      setMessage(response.data.message);
      setIsSuccess(true);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error de red. Por favor, intenta de nuevo.');
      }
      setIsSuccess(false);
    }
    setLoading(false);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Imagen de fondo */}
      <img
        src="/uploads/Banner.webp"
        alt="Sistema de Donativos"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Canvas de partículas */}
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full z-10" />
      {/* Gradiente encima del canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-400 to-blue-500 opacity-80 z-20"></div>

      <div
        ref={formRef}
        className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-purple-100 backdrop-blur-md space-y-6"
      >
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">¿Olvidaste tu contraseña?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                No te preocupes, ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg text-center font-medium ${
                isSuccess 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="correo" className="font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Correo institucional
                </label>
                <input
                  type="email"
                  id="correo"
                  name="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition duration-200 focus:scale-[1.02] shadow-sm"
                  placeholder="usuario@cua.uam.mx"
                  disabled={loading}
                />
                {errors.correo && <p className="text-red-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.correo}
                </p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </div>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">¡Correo enviado!</h2>
            <div className="space-y-3">
              <p className="text-gray-600 leading-relaxed">
                Hemos enviado un enlace de recuperación a tu correo institucional.
              </p>
              <p className="text-sm text-gray-500">
                Revisa tu bandeja de entrada y también tu carpeta de spam. El enlace será válido por 1 hora.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800">Consejos:</p>
                  <ul className="mt-1 text-sm text-blue-700 space-y-1">
                    <li>• El enlace expira en 1 hora por seguridad</li>
                    <li>• Si no recibes el correo, revisa spam</li>
                    <li>• Puedes solicitar un nuevo enlace si es necesario</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
