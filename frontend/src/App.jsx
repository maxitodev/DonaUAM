import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useRedirectIfAuthenticated from './hooks/useRedirectIfAuthenticated'
import Footer from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const navigate = useNavigate()
  const lenisRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Redirige a /home si el usuario ya está autenticado
  useRedirectIfAuthenticated()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 5, 
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })
    lenisRef.current = lenis

    const raf = (time) => {
      lenis.raf(time)
      ScrollTrigger.update()
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Usa scrollerProxy solo si usas un contenedor personalizado.
    // Si quieres scroll global, comenta o elimina esto:
    // ScrollTrigger.scrollerProxy(scrollRef.current, { ... })

    lenis.on('scroll', ScrollTrigger.update)
    // Fix: Use lenis.raf instead of lenis.update in refresh event
    const handleRefresh = () => {
      if (lenisRef.current) {
        lenisRef.current.raf(performance.now())
      }
    }
    ScrollTrigger.addEventListener('refresh', handleRefresh)

    return () => {
      lenis.destroy()
      ScrollTrigger.removeEventListener('refresh', handleRefresh)
      // Si usaste scrollerProxy, límpialo aquí
    }
  }, [])

  useEffect(() => {
    // Configuración base para animaciones
    const baseConfig = {
      start: 'top bottom',
      end: 'bottom top',
      once: true, // Ejecuta la animación solo una vez
    }

    // Animación principal para textos
    ScrollTrigger.batch('.animate-text', {
      onEnter: batch => {
        gsap.fromTo(batch, 
          { opacity: 0, y: 60 }, 
          { 
            opacity: 1, 
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
          }
        )
      },
      ...baseConfig,
    })

    // Animaciones direccionales
    const directionalAnimations = [
      { selector: '.animate-left', x: -80 },
      { selector: '.animate-right', x: 80 },
      { selector: '.animate-up', y: 80 },
    ]

    directionalAnimations.forEach(({ selector, x = 0, y = 0 }) => {
      ScrollTrigger.batch(selector, {
        onEnter: batch => {
          gsap.fromTo(batch, 
            { opacity: 0, x, y }, 
            { 
              opacity: 1, 
              x: 0, 
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: 'power2.out',
            }
          )
        },
        ...baseConfig,
      })
    })

    // Animación para fondos
    ScrollTrigger.batch('.animate-bg', {
      onEnter: batch => {
        gsap.fromTo(batch, 
          { opacity: 0, scale: 1.05 }, 
          { 
            opacity: 1, 
            scale: 1,
            duration: 1.5,
            ease: 'power2.out',
          }
        )
      },
      ...baseConfig,
    })

    // Animación especial para títulos grandes
    ScrollTrigger.batch('.animate-title', {
      onEnter: batch => {
        gsap.fromTo(batch, 
          { opacity: 0, y: 40 }, 
          { 
            opacity: 1, 
            y: 0,
            duration: 1.5,
            stagger: 0.05,
            ease: 'elastic.out(1, 0.75)',
          }
        )
      },
      ...baseConfig,
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <>
      {/* Botón hamburguesa/X */}
      <button
        className="fixed top-6 right-6 z-50 flex flex-col justify-center items-center w-12 h-12 bg-transparent focus:outline-none cursor-pointer"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setMenuOpen(open => !open)}
        type="button"
      >
        <span className={`block w-7 h-1 rounded bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-7 h-1 rounded bg-white my-1 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-7 h-1 rounded bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Menú lateral */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-in-out">
          <nav
            ref={menuRef}
            className="fixed top-0 right-0 h-full w-full sm:w-80 max-w-xs
              bg-transparent
              shadow-2xl flex flex-col pt-28 px-6 gap-6 animate-slide-in-right
              border-l border-white/20
              backdrop-blur-3xl backdrop-saturate-200
              rounded-l-3xl"
            style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
          >
            <button
              className="cursor-pointer text-white text-lg font-medium py-3 px-6 rounded-lg bg-indigo-700 hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-75"
              onClick={() => { setMenuOpen(false); navigate('/login') }}
            >
              Iniciar sesión
            </button>
            <div className="flex items-center gap-3">
              <hr className="flex-grow border-indigo-200/60" />
              <p className="text-center text-indigo-100 text-sm font-normal">O</p>
              <hr className="flex-grow border-indigo-200/60" />
            </div>
            <button
              className="cursor-pointer text-indigo-700 border border-indigo-400 bg-white text-lg font-medium py-3 px-6 rounded-lg hover:bg-indigo-50 hover:text-indigo-900 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-60"
              onClick={() => { setMenuOpen(false); navigate('/register') }}
            >
              Registrarse
            </button>
          </nav>
          {/* Animación simple para el menú */}
          <style>
            {`
              @keyframes slide-in {
                from { transform: translateX(100%); opacity: 0.5; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}
          </style>
        </div>
      )}

      <div
        // ref={scrollRef} // Elimina el ref si usas scroll global
        className="w-full min-h-[100dvh] font-sans text-white bg-black"
        // Si quieres usar un contenedor personalizado, agrega: overflow-auto h-screen
        // className="w-full min-h-screen font-sans text-white bg-black overflow-auto h-screen"
      >
        {/* Hero */}
        <div className="relative w-full min-h-[100dvh] h-screen overflow-hidden animate-bg">
          <img
            src="/uploads/Banner.webp"
            alt="Sistema de Donativos"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 mt-10 animate-up">
            <svg className="w-10 h-10 text-indigo-800 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Mensaje inicial */}
        <div className="w-full min-h-[100dvh] flex justify-center items-center bg-gradient-to-b from-violet-950 animate-bg">
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold bg-gradient-to-r from-purple-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-center px-6 animate-title">
            Dona lo que ya no uses. ¡Apoya a tu comunidad universitaria!
          </h1>
        </div>

        {/* Cómo funciona */}
        <div className="w-full min-h-[100dvh] flex flex-col items-center bg-indigo-950 animate-bg">
          <h1 className="mt-10 text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-extrabold text-indigo-300 text-center animate-title">
            ¿Cómo funciona?
          </h1>
          <p className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white text-start max-w-5xl px-4 animate-text">
            Al crear una cuenta podrás solicitar o donar algún producto, además si el producto te fue otorgado podrás ponerte en contacto con el usuario para coordinar la entrega.
          </p>
          <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 px-4">
            <div className="animate-left">
              <h2 className="text-2xl lg:text-6xl font-bold text-indigo-200 mb-4">Beneficios para Donadores</h2>
              <p className="text-base sm:text-lg lg:text-3xl font-semibold text-white tracking-wide leading-relaxed drop-shadow-sm mb-1">
                Dona artículos en buen estado y ayuda a otros miembros. Contribuye al aprovechamiento de recursos y fomenta la solidaridad.
              </p>
            </div>
            <div className="animate-right">
              <h2 className="text-2xl lg:text-6xl font-bold text-indigo-200 mb-4">Beneficios para Solicitantes</h2>
              <p className="text-base sm:text-lg lg:text-3xl font-semibold text-white tracking-wide leading-relaxed drop-shadow-sm mb-6">
                Solicita productos que necesites y recibe apoyo. Encuentra artículos útiles y da una segunda vida a los recursos.
              </p>
            </div>
          </div>
        </div>

        {/* Únete */}
        <div className="w-full min-h-[100dvh] flex flex-col items-center bg-gradient-to-b from-violet-950 animate-bg px-2 py-8 sm:py-0">
          <h1 className="mt-10 sm:mt-20 text-3xl xs:text-4xl sm:text-6xl md:text-8xl lg:text-[12rem] font-extrabold text-center px-2 sm:px-4 text-pink-400 animate-title leading-tight">
            ¡Únete a la comunidad!
          </h1>
          <p className="mt-6 sm:mt-10 text-lg xs:text-xl sm:text-3xl lg:text-5xl font-extrabold text-white text-center max-w-2xl sm:max-w-5xl px-2 sm:px-4 animate-text">
            Regístrate y comienza a donar o solicitar productos hoy mismo. Juntos podemos hacer la diferencia en nuestra comunidad.
          </p>
          <button
            className="cursor-pointer w-full max-w-xs sm:max-w-fit px-6 py-4 sm:px-20 sm:py-10 text-lg sm:text-5xl mt-8 sm:mt-10 mb-4 sm:mb-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold shadow-2xl transition-all duration-300 animate-up focus:outline-none focus:ring-4 focus:ring-pink-400/60 focus:ring-offset-2 focus:ring-offset-black
              relative overflow-hidden group hover:scale-105 hover:shadow-pink-400/40 active:scale-95"
            onClick={() => navigate('/register')}
          >
            <span className="absolute left-[-75%] top-0 w-[250%] h-full bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-modern-shine pointer-events-none rounded-full"></span>
            <span className="relative z-10">Registrarse</span>
          </button>
          <p className="mt-6 sm:mt-10 text-lg xs:text-xl sm:text-3xl lg:text-5xl font-extrabold text-white text-center max-w-2xl sm:max-w-5xl px-2 sm:px-4 animate-text">
            O si ya tienes cuenta, inicia sesión para acceder a todas las funciones.
          </p>
          <button
            className="cursor-pointer w-full max-w-xs sm:max-w-fit px-6 py-4 sm:px-20 sm:py-10 text-lg sm:text-5xl mt-8 sm:mt-10 mb-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-extrabold shadow-2xl transition-all duration-300 animate-up focus:outline-none focus:ring-4 focus:ring-indigo-400/60 focus:ring-offset-2 focus:ring-offset-black
              relative overflow-hidden group hover:scale-105 hover:shadow-indigo-400/40 active:scale-95"
            onClick={() => navigate('/login')}
          >
            <span className="absolute left-[-75%] top-0 w-[250%] h-full bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-modern-shine pointer-events-none rounded-full"></span>
            <span className="relative z-10">Iniciar sesión</span>
          </button>
          {/* Animación de brillo moderno */}
          <style>
            {`
              @keyframes modern-shine {
                0% { transform: translateX(-60%); opacity: 0; }
                20% { opacity: 0.2; }
                60% { opacity: 0.5; }
                100% { transform: translateX(60%); opacity: 0; }
              }
              .group:hover .group-hover\\:animate-modern-shine {
                animation: modern-shine 0.7s cubic-bezier(.4,1,.6,1);
              }
            `}
          </style>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  )
}

export default App