import { useEffect } from 'react';
import { scrollToTop } from '../utils/scrollUtils';

/**
 * Hook personalizado que automáticamente hace scroll al inicio de la página
 * cuando el componente se monta. Útil para asegurar que el usuario siempre
 * comience viendo el contenido desde arriba.
 * 
 * @param {boolean} immediate - Si es true, hace scroll inmediatamente sin animación
 * @param {number} delay - Delay en milisegundos antes de hacer scroll (default: 0)
 */
const useScrollToTop = (immediate = false, delay = 0) => {
  useEffect(() => {
    if (delay > 0) {
      const timeoutId = setTimeout(() => scrollToTop(immediate), delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop(immediate);
    }
  }, [immediate, delay]);
};

export default useScrollToTop;
