# Generador de Patrones en Cuadrados y Rutas (PDF)

Aplicación web interactiva para generar y diseñar patrones de cuadrados de colores, rutas secuenciales con flechas direccionales e indicadoras de color, cuadrículas de pixel art y exportación a documentos PDF vectoriales de alta calidad (individuales o cuadernillos de ejercicios multi-página).

## 🚀 Uso en la Web

Puedes usar la aplicación directamente desde tu navegador sin instalar nada abriendo `index.html` o a través de **GitHub Pages**.

## ✨ Características

- **Rutas Lineales**: Trazado paso a paso con flechas que muestran la dirección de movimiento, el color de la siguiente casilla o numeración secuencial.
- **Rotación de Color**:
  - *Secuencial*: Cicla los colores de la paleta en orden predefinido.
  - *Aleatorio / Random*: Asigna colores al azar de la paleta activa en cada paso.
- **Cuadrícula y Pixel Art**: Herramientas de pincel, borrador y bote de relleno.
- **Plantillas Predefinidas**: Incluye los 10 patrones del formato de muestra y diseños de pixel art.
- **Importador de Imágenes**: Convierte cualquier imagen o icono a píxeles adaptados a la paleta activa.
- **Exportación a PDF**: Exportación vectorial a página individual o cuadernillo completo (A4 y Carta), con opción de cuadrícula de fondo para imprimir.

## 🛠️ Tecnologías

- HTML5 / CSS3 moderno (con reglas `@media print` para impresión nativa).
- JavaScript ES6 puro (Vanilla JS, sin dependencias de compilación).
- [jsPDF](https://github.com/parallax/jsPDF) para generación vectorial de PDFs en el cliente.
