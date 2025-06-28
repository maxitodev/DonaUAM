# Documentación del Hook useScrollToTop

## 📝 Descripción

El hook `useScrollToTop` garantiza que cuando un componente se monte, automáticamente se haga scroll al inicio de la página. Esto resuelve el problema común donde los usuarios quedan viendo el footer u otras partes de la página al navegar entre rutas.

## 🚀 Instalación

El hook ya está creado en: `src/hooks/useScrollToTop.js`

## 💻 Uso Básico

```javascript
import useScrollToTop from '../hooks/useScrollToTop';

const MiComponente = () => {
  // Scroll automático al inicio cuando se carga el componente
  useScrollToTop();
  
  return (
    <div>
      {/* Tu contenido aquí */}
    </div>
  );
};
```

## ⚙️ Parámetros

### `immediate` (boolean, opcional)
- **Default:** `false`
- **Descripción:** Controla el tipo de scroll
  - `false`: Scroll suave con animación
  - `true`: Scroll inmediato sin animación

### `delay` (number, opcional)
- **Default:** `0`
- **Descripción:** Tiempo de espera en milisegundos antes de ejecutar el scroll

## 📖 Ejemplos de Uso

### 1. Scroll Suave (Recomendado)
```javascript
useScrollToTop(); // Scroll suave inmediato
```

### 2. Scroll Inmediato
```javascript
useScrollToTop(true); // Scroll sin animación
```

### 3. Scroll con Delay
```javascript
useScrollToTop(false, 200); // Scroll suave después de 200ms
```

### 4. Scroll Inmediato con Delay
```javascript
useScrollToTop(true, 100); // Scroll inmediato después de 100ms
```

## 🎯 Casos de Uso

### ✅ Recomendado para:
- **Páginas de listado** (Home, Mis Donaciones, Mis Solicitudes)
- **Formularios** (Crear Donación, Solicitar Artículo)
- **Páginas de detalle** (Detalle de Donación)
- **Cualquier página** donde quieras asegurar que el usuario vea el contenido desde arriba

### ❌ No recomendado para:
- **Componentes modales** o popups
- **Componentes que manejan su propio scroll** (como Login que usa Lenis)
- **Componentes que no representan páginas completas**

## 🔧 Componentes que YA lo usan

Los siguientes componentes ya han sido configurados con `useScrollToTop`:

1. **Home.jsx**: `useScrollToTop(true, 100)`
2. **Donation.jsx**: `useScrollToTop(true, 100)`
3. **DonationDetail.jsx**: `useScrollToTop(false, 150)`
4. **Mydonations.jsx**: `useScrollToTop(true, 100)`
5. **MyRequests.jsx**: `useScrollToTop(true, 100)`
6. **RequestForm.jsx**: `useScrollToTop(false, 150)`

## 🛠️ Utilidades Adicionales

Si necesitas más control sobre el scroll, puedes usar las utilidades de `src/utils/scrollUtils.js`:

```javascript
import { scrollToTop, scrollToElement } from '../utils/scrollUtils';

// Scroll manual al inicio
scrollToTop(); // Suave
scrollToTop(true); // Inmediato

// Scroll a un elemento específico
scrollToElement('miElementoId', 100); // Con offset de 100px
```

## 🎨 Configuraciones Recomendadas

### Para Páginas de Listado
```javascript
useScrollToTop(true, 100); // Inmediato con pequeño delay
```

### Para Páginas de Detalle
```javascript
useScrollToTop(false, 150); // Suave con delay para cargar contenido
```

### Para Formularios
```javascript
useScrollToTop(true, 100); // Inmediato para mostrar el formulario completo
```

## 🐛 Solución de Problemas

### Problema: El scroll no funciona
**Solución:** Asegúrate de que el hook esté en el nivel correcto del componente, preferiblemente al inicio del cuerpo de la función.

### Problema: El scroll interrumpe animaciones
**Solución:** Usa un delay mayor o scroll inmediato:
```javascript
useScrollToTop(true, 200); // Delay más largo
```

### Problema: Scroll muy brusco
**Solución:** Usa scroll suave:
```javascript
useScrollToTop(false, 100); // Scroll suave con delay
```

## 🔄 Integración con React Router

El hook funciona perfectamente con React Router. Cada vez que navegues a una nueva ruta que use el hook, automáticamente se hará scroll al inicio.

## 📱 Compatibilidad

- ✅ **Desktop**: Funciona perfectamente
- ✅ **Mobile**: Funciona perfectamente
- ✅ **Tablets**: Funciona perfectamente
- ✅ **Todos los navegadores modernos**
