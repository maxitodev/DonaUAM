import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate, useParams } from 'react-router-dom';
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated';

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  useRedirectIfAuthenticated();

  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);

  const formRef = useRef(null);
  const bgRef = useRef(null);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    // Verificar que el token sea válido
    const verifyToken = async () => {
      try {
        await axios.get(`${API_URL}/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch {
        setTokenValid(false);
        setMessage('El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.');
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
      setMessage('Token de recuperación no encontrado.');
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
  }, [token]);

  const validate = () => {
    const errs = {};
    
    if (!contrasena) {
      errs.contrasena = 'La contraseña es obligatoria.';
    } else if (contrasena.length < 6) {
      errs.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(contrasena)) {
      errs.contrasena = 'La contraseña debe contener al menos una minúscula, una mayúscula y un número.';
    }
    
    if (!confirmarContrasena) {
      errs.confirmarContrasena = 'Confirma tu contraseña.';
    } else if (contrasena !== confirmarContrasena) {
      errs.confirmarContrasena = 'Las contraseñas no coinciden.';
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
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        nuevaContrasena: contrasena
      });
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

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const renderPasswordStrength = () => {
    if (!contrasena) return null;
    
    const strength = getPasswordStrength(contrasena);
    const getStrengthColor = () => {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 4) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    
    const getStrengthText = () => {
      if (strength <= 2) return 'Débil';
      if (strength <= 4) return 'Media';
      return 'Fuerte';
    };

    return (
      <div className="mt-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(strength / 6) * 100}%` }}
            ></div>
          </div>
          <span className={`text-xs font-medium ${
            strength <= 2 ? 'text-red-500' : 
            strength <= 4 ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {getStrengthText()}
          </span>
        </div>
      </div>
    );
  };

  if (tokenValid === false) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <img
          src="/uploads/Banner.webp"
          alt="Sistema de Donativos"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <canvas ref={bgRef} className="absolute inset-0 w-full h-full z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-400 to-pink-500 opacity-80 z-20"></div>

        <div
          ref={formRef}
          className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-red-100 backdrop-blur-md space-y-6 text-center"
        >
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Enlace expirado</h2>
          <p className="text-gray-600">{message}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
          >
            Solicitar nuevo enlace
          </button>
          <button
            onClick={handleGoToLogin}
            className="w-full text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <img
          src="/uploads/Banner.webp"
          alt="Sistema de Donativos"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <canvas ref={bgRef} className="absolute inset-0 w-full h-full z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-400 to-purple-500 opacity-80 z-20"></div>

        <div className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-blue-100 backdrop-blur-md space-y-6 text-center">
          <div className="animate-spin mx-auto w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <img
        src="/uploads/Banner.webp"
        alt="Sistema de Donativos"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full z-10" />
      <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-blue-400 to-indigo-500 opacity-80 z-20"></div>

      <div
        ref={formRef}
        className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-green-100 backdrop-blur-md space-y-6"
      >
        {!isSuccess ? (
          <>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Restablecer contraseña</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Crea una nueva contraseña segura para tu cuenta
              </p>
            </div>

            {message && !isSuccess && (
              <div className="bg-red-100 text-red-800 border border-red-200 p-4 rounded-lg text-center font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="contrasena" className="font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="contrasena"
                    name="password"
                    value={contrasena}
                    onChange={e => setContrasena(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition duration-200 focus:scale-[1.02] shadow-sm pr-12"
                    placeholder="Tu nueva contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
                {renderPasswordStrength()}
                {errors.contrasena && <p className="text-red-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.contrasena}
                </p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmarContrasena" className="font-medium text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmarContrasena"
                    name="confirmPassword"
                    value={confirmarContrasena}
                    onChange={e => setConfirmarContrasena(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition duration-200 focus:scale-[1.02] shadow-sm pr-12"
                    placeholder="Confirma tu nueva contraseña"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.873 6.872A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.293 5.95M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmarContrasena && <p className="text-red-500 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.confirmarContrasena}
                </p>}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800">Requisitos de contraseña:</p>
                    <ul className="mt-1 text-sm text-blue-700 space-y-1">
                      <li>• Mínimo 6 caracteres</li>
                      <li>• Al menos una letra mayúscula</li>
                      <li>• Al menos una letra minúscula</li>
                      <li>• Al menos un número</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </div>
                ) : (
                  'Actualizar contraseña'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">¡Contraseña actualizada!</h2>
            <p className="text-gray-600">Tu contraseña ha sido restablecida exitosamente.</p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-3 rounded-xl text-lg font-bold transition-all duration-300 transform hover:scale-105"
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
