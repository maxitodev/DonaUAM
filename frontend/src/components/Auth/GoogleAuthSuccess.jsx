import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const GoogleAuthSuccess = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Error en autenticación con Google:', error);
        let errorMessage = 'google-auth-failed';
        
        switch (error) {
          case 'invalid-domain':
            errorMessage = 'invalid-domain';
            break;
          case 'unauthorized':
            errorMessage = 'unauthorized';
            break;
          case 'server':
            errorMessage = 'server';
            break;
          default:
            errorMessage = 'google-auth-failed';
        }
        
        navigate(`/login?error=${errorMessage}`);
        return;
      }

      if (token) {
        try {
          // Verificar el token con el backend
          const response = await axios.post(`${API_URL}/auth/google/token`, { token });
          
          if (response.data) {
            // Guardar token en localStorage
            localStorage.setItem('token', response.data.token);
            
            // Llamar callback de login si existe
            if (onLogin) {
              onLogin(response.data);
            }
            
            // Redirigir al home
            navigate('/home');
          }
        } catch (error) {
          console.error('Error verificando token de Google:', error);
          navigate('/login?error=token-verification-failed');
        }
      } else {
        navigate('/login?error=no-token');
      }
    };

    handleGoogleAuth();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-300 to-violet-400">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Completando inicio de sesión...</h2>
        <p className="text-gray-600 mt-2">Por favor espera un momento</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;
