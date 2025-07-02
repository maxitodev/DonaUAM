import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';
import GoogleLoginButton from './GoogleLoginButton';

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ onLogin }) => {
  useRedirectIfAuthenticated();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const bgRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Manejar errores de Google OAuth desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
      switch (error) {
        case 'invalid-domain':
          setServerError('❌ Solo se permiten correos institucionales @cua.uam.mx. Por favor, usa tu cuenta de la universidad.');
          break;
        case 'google-auth-failed':
          setServerError('❌ Error al iniciar sesión con Google. Verifica que uses tu correo @cua.uam.mx');
          break;
        case 'unauthorized':
          setServerError('❌ No tienes autorización para acceder. Solo correos @cua.uam.mx');
          break;
        case 'token-verification-failed':
          setServerError('❌ Error al verificar las credenciales de Google');
          break;
        case 'no-token':
          setServerError('❌ Error en el proceso de autenticación');
          break;
        case 'server':
          setServerError('❌ Error del servidor. Por favor, intenta de nuevo');
          break;
        default:
          setServerError('❌ Error desconocido en la autenticación');
      }
      
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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
    if (!contrasena) {
      errs.contrasena = 'La contraseña es obligatoria.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { correo, contrasena });
      const data = res.data;
      if (onLogin) onLogin(data);
      localStorage.setItem('token', data.token);
      navigate('/home'); 
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Error de red.');
      }
    }
    setLoading(false);
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
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-300 to-violet-400 opacity-80 z-20"></div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-blue-100 backdrop-blur-md space-y-6"
        noValidate
      >
        <h2 className="text-4xl font-extrabold text-center text-indigo-800 tracking-tight">Iniciar Sesión</h2>

        {serverError && <div className="bg-red-200 text-red-800 p-3 rounded text-center font-medium">{serverError}</div>}

        {/* Botón de Google */}
        <div className="space-y-4">
          <GoogleLoginButton disabled={loading} />
          
          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">O continúa con tu correo</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="correo" className="font-medium text-gray-700">Correo institucional:</label>
          <input
            type="email"
            id="correo"
            name="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            autoComplete="email"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition duration-200 focus:scale-[1.02]"
            placeholder="usuario@cua.uam.mx"
            disabled={loading}
          />
          {errors.correo && <p className="text-red-500 text-sm">{errors.correo}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="contrasena" className="font-medium text-gray-700">Contraseña:</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="contrasena"
              name="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition duration-200 focus:scale-[1.02] pr-12"
              placeholder="Tu contraseña"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-700 focus:outline-none"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                // Ojo abierto
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // Ojo cerrado
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              )}
            </button>
          </div>
          {errors.contrasena && <p className="text-red-500 text-sm">{errors.contrasena}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 rounded-xl text-lg font-bold transition-transform duration-300 transform hover:scale-105"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <div className="mt-4 text-center space-y-3">
          <div>
            <a href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors duration-200">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div>
            <a href="/register" className="text-indigo-700 hover:underline">¿No tienes cuenta? Regístrate</a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;