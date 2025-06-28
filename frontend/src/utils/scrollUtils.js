/**
 * Utilidades para manejo de scroll en la aplicación
 */

/**
 * Función para hacer scroll al inicio de la página
 * @param {boolean} immediate - Si es true, hace scroll inmediatamente sin animación
 */
export const scrollToTop = (immediate = false) => {
  if (immediate) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
};

/**
 * Función para hacer scroll a un elemento específico
 * @param {string} elementId - ID del elemento al que hacer scroll
 * @param {number} offset - Offset en píxeles desde la parte superior (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Función para obtener la posición actual del scroll
 * @returns {number} Posición Y del scroll
 */
export const getScrollPosition = () => {
  return window.pageYOffset || document.documentElement.scrollTop;
};

/**
 * Función para verificar si el usuario está cerca del final de la página
 * @param {number} threshold - Umbral en píxeles desde el final (default: 100)
 * @returns {boolean} True si está cerca del final
 */
export const isNearBottom = (threshold = 100) => {
  const scrollPosition = getScrollPosition();
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  return scrollPosition + windowHeight >= documentHeight - threshold;
};
