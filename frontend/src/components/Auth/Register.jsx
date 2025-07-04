import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useRedirectIfAuthenticated from '../../hooks/useRedirectIfAuthenticated'
import imageCompression from 'browser-image-compression'
import GoogleLoginButton from './GoogleLoginButton'

gsap.registerPlugin(ScrollTrigger)

const Register = () => {
  useRedirectIfAuthenticated()

  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '' })
  const [imagen, setImagen] = useState(null)
  const [errores, setErrores] = useState({})
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [imageInfo, setImageInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const formRef = useRef(null)
  const bgRef = useRef(null)

  useEffect(() => {
    // Manejar errores de Google OAuth desde la URL
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    
    if (error) {
      switch (error) {
        case 'invalid-domain':
          setErrores({ general: '❌ Solo se permiten correos institucionales @cua.uam.mx. Por favor, usa tu cuenta de la universidad.' })
          break
        case 'google-auth-failed':
          setErrores({ general: '❌ Error al registrarse con Google. Verifica que uses tu correo @cua.uam.mx' })
          break
        case 'unauthorized':
          setErrores({ general: '❌ No tienes autorización para acceder. Solo correos @cua.uam.mx' })
          break
        case 'server':
          setErrores({ general: '❌ Error del servidor. Por favor, intenta de nuevo' })
          break
        default:
          setErrores({ general: '❌ Error desconocido en la autenticación' })
      }
      
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const lenis = new Lenis()
    const raf = (time) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

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
    )

    // Animación de fondo tipo partículas nebulosas
    const canvas = bgRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 4 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      opacity: Math.random() * 0.5 + 0.2,
    }))

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(173,216,230,${p.opacity})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy

        // rebote
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      requestAnimationFrame(animate)
    }
    animate()

    // Cleanup
    return () => cancelAnimationFrame(animate)
  }, [])

  const validarNombre = (nombre) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(nombre.trim()) && nombre.trim().split(' ').length >= 2
  const validarCorreo = (correo) => /^[\w.-]+@cua\.uam\.mx$/.test(correo)
  // Nueva función para validar y detallar errores de contraseña
  const validarContrasenaDetalles = (contrasena) => {
    const errores = []
    if (contrasena.length < 8) errores.push('Debe tener al menos 8 caracteres.')
    if (!/[a-z]/.test(contrasena)) errores.push('Debe incluir una letra minúscula.')
    if (!/[A-Z]/.test(contrasena)) errores.push('Debe incluir una letra mayúscula.')
    if (!/[0-9]/.test(contrasena)) errores.push('Debe incluir un número.')
    if (!/[^A-Za-z0-9]/.test(contrasena)) errores.push('Debe incluir un carácter especial.')
    return errores
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const campo = name === 'name' ? 'nombre' : name === 'email' ? 'correo' : 'contrasena'
    setForm({ ...form, [campo]: value })
    setErrores({ ...errores, [campo]: undefined })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setCompressing(true)
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      })
      setImagen(compressedFile)
      setImageInfo({
        size: compressedFile.size,
        width: compressedFile.width,
        height: compressedFile.height
      })
      setErrores({ ...errores, imagen: undefined })
    } catch (error) {
      setErrores({ ...errores, imagen: error.message })
    } finally {
      setCompressing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const nuevosErrores = {}

    if (!validarNombre(form.nombre)) nuevosErrores.nombre = 'Escribe tu nombre completo (mínimo nombre y apellido, solo letras).'
    if (!validarCorreo(form.correo)) nuevosErrores.correo = 'El correo debe terminar en @cua.uam.mx.'
    const contrasenaErrores = validarContrasenaDetalles(form.contrasena)
    if (contrasenaErrores.length > 0) nuevosErrores.contrasena = contrasenaErrores
    if (!imagen) nuevosErrores.imagen = 'Sube una imagen de tu credencial.'

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('nombre', form.nombre)
    formData.append('correo', form.correo)
    formData.append('contrasena', form.contrasena)
    formData.append('imagen', imagen)

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('¡Registro exitoso! Serás redirigido para iniciar sesión en 3 segundos...')
      setForm({ nombre: '', correo: '', contrasena: '' })
      setImagen(null)
      setImageInfo(null)
      setErrores({})
      setTimeout(() => navigate('/login'), 3000)
    } catch (error) {
      setErrores({ general: error.response?.data?.message || 'Error en el registro' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Imagen de fondo más profunda */}
      <img
        src="/uploads/Banner.webp"
        alt="Sistema de Donativos"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Canvas de partículas encima de la imagen */}
      <canvas ref={bgRef} className="absolute inset-0 w-full h-full z-10" />
      {/* Gradiente encima del canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-300 to-violet-400 opacity-80 z-20"></div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative z-30 w-full max-w-lg p-10 bg-white shadow-2xl rounded-3xl border border-blue-100 backdrop-blur-md space-y-6"
        encType="multipart/form-data"
      >
        <h2 className="text-4xl font-extrabold text-center text-indigo-800 tracking-tight">Crear cuenta</h2>

        {success && <div className="bg-green-200 text-green-900 p-3 rounded text-center font-medium">{success}</div>}
        {errores.general && <div className="bg-red-200 text-red-800 p-3 rounded text-center font-medium">{errores.general}</div>}

        {/* Botón de Google */}
        <div className="space-y-4">
          <GoogleLoginButton disabled={loading || compressing} />
          
          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">O regístrate con tu correo</span>
            </div>
          </div>
        </div>

        {['nombre', 'correo', 'contrasena'].map((campo) => (
          <div key={campo} className="space-y-2">
            <label className="font-medium text-gray-700 capitalize">{campo.replace('contrasena', 'Contraseña segura')}:</label>
            <div className="relative">
              <input
                type={
                  campo === 'contrasena'
                    ? (showPassword ? 'text' : 'password')
                    : campo === 'correo'
                    ? 'email'
                    : 'text'
                }
                name={
                  campo === 'nombre' ? 'name' :
                  campo === 'correo' ? 'email' :
                  'password'
                }
                autoComplete={
                  campo === 'nombre' ? 'name' :
                  campo === 'correo' ? 'email' :
                  'new-password'
                }
                value={form[campo]}
                onChange={handleChange}
                required
                disabled={loading || compressing}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 outline-none transition duration-200 focus:scale-[1.02] pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={
                  campo === 'nombre'
                    ? 'Ej. Juan Pérez'
                    : campo === 'correo'
                    ? 'usuario@cua.uam.mx'
                    : 'Mínimo 8 caracteres...'
                }
              />
              {campo === 'contrasena' && (
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-700 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
              )}
            </div>
            {/* Mostrar errores detallados de contraseña y otros campos */}
            {errores[campo] && (
              Array.isArray(errores[campo])
                ? <ul className="text-red-500 text-sm list-disc pl-5">
                    {errores[campo].map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                : <p className="text-red-500 text-sm">{errores[campo]}</p>
            )}
          </div>
        ))}

        <div className="space-y-2">
          <label className="font-medium text-gray-700">Foto de credencial:</label>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="imagen"
              className={`cursor-pointer inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-semibold rounded-lg shadow-md hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 ${(compressing || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {compressing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Comprimiendo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a2 2 0 10-2.828-2.828z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7v6a2 2 0 002 2h6" />
                  </svg>
                  Seleccionar imagen
                </>
              )}
              <input
                id="imagen"
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="hidden"
                disabled={compressing || loading}
              />
            </label>
            <span className="text-gray-600 text-sm truncate max-w-[180px]">
              {imagen ? imagen.name : "Ningún archivo seleccionado"}
            </span>
          </div>
          {compressing && (
            <div className="text-blue-600 text-sm flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Comprimiendo imagen para optimizar el tamaño...
            </div>
          )}
          {imageInfo && !compressing && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
                Imagen subida exitosamente
              </div>
            </div>
          )}
          {errores.imagen && <p className="text-red-500 text-sm">{errores.imagen}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || compressing}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-2.5 rounded-xl text-lg font-bold transition-transform duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </div>
          ) : (
            'Registrarse'
          )}
        </button>
        <div className="text-center mt-4">
          <span className="text-gray-700">¿Ya tienes cuenta? </span>
          <a
            href="/login"
            className="text-indigo-700 font-semibold hover:underline"
          >
            Inicia Sesión
          </a>
        </div>
      </form>
    </div>
  )
}

export default Register
