/**
 * patterns.js
 * Biblioteca de paletas, patrones predefinidos (incluyendo los 10 del PDF de muestra),
 * plantillas de pixel art, generador de rutas aleatorias y conversor de imagen a pixel art.
 */

// Paletas predefinidas
const PALETTE_PRESETS = {
  pdfSample: {
    name: 'Muestra Original (PDF)',
    colors: ['#1F355C', '#6F8A3D', '#863E9B'] // Azul marino, Verde oliva, Violeta
  },
  rainbow: {
    name: 'Arcoíris Divertido',
    colors: ['#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#457B9D', '#7209B7']
  },
  pastel: {
    name: 'Pastel Suave',
    colors: ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#B8E0D2', '#95B8D1', '#D6E2E9']
  },
  primary: {
    name: 'Primarios Educativos',
    colors: ['#E63946', '#1D3557', '#FFB703', '#2A9D8F']
  },
  cyber: {
    name: 'Neón Tecnológico',
    colors: ['#00F5D4', '#7B2CBF', '#F72585', '#4CC9F0', '#FFEA00']
  },
  monochrome: {
    name: 'Escala de Grises',
    colors: ['#111827', '#374151', '#6B7280', '#9CA3AF']
  }
};

/**
 * 10 Patrones idénticos a los del PDF de muestra (Páginas 1 a 10)
 * Coordenadas relativas en cuadrícula 8x8 (o 10x10) centrada.
 * Cada paso contiene {r, c, colorIndex} en orden secuencial de recorrido.
 */
const PDF_SAMPLE_PATTERNS = [
  {
    id: 'pdf-page-1',
    name: 'Página 1: Bucle en U invertida',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 3, c: 3, colorIndex: 1 },
      { r: 3, c: 4, colorIndex: 1 },
      { r: 3, c: 5, colorIndex: 2 },
      { r: 3, c: 6, colorIndex: 0 },
      { r: 3, c: 7, colorIndex: 1 },
      { r: 4, c: 7, colorIndex: 2 },
      { r: 5, c: 7, colorIndex: 0 },
      { r: 6, c: 7, colorIndex: 0 },
      { r: 6, c: 6, colorIndex: 2 },
      { r: 6, c: 5, colorIndex: 1 },
      { r: 6, c: 4, colorIndex: 0 }
    ]
  },
  {
    id: 'pdf-page-2',
    name: 'Página 2: Gancho angular',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 2, c: 4, colorIndex: 1 },
      { r: 2, c: 5, colorIndex: 2 },
      { r: 2, c: 6, colorIndex: 1 },
      { r: 2, c: 7, colorIndex: 0 },
      { r: 3, c: 7, colorIndex: 2 },
      { r: 4, c: 7, colorIndex: 1 },
      { r: 5, c: 7, colorIndex: 0 },
      { r: 6, c: 7, colorIndex: 0 },
      { r: 6, c: 6, colorIndex: 2 },
      { r: 6, c: 5, colorIndex: 1 }
    ]
  },
  {
    id: 'pdf-page-3',
    name: 'Página 3: Escalera / Zigzag',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 3, c: 3, colorIndex: 1 },
      { r: 4, c: 3, colorIndex: 2 },
      { r: 4, c: 4, colorIndex: 2 },
      { r: 4, c: 5, colorIndex: 0 },
      { r: 4, c: 6, colorIndex: 1 },
      { r: 5, c: 6, colorIndex: 2 },
      { r: 6, c: 6, colorIndex: 1 },
      { r: 7, c: 6, colorIndex: 0 },
      { r: 7, c: 7, colorIndex: 2 },
      { r: 7, c: 8, colorIndex: 2 }
    ]
  },
  {
    id: 'pdf-page-4',
    name: 'Página 4: Diagonal continua',
    gridSize: 10,
    steps: [
      { r: 2, c: 2, colorIndex: 0 },
      { r: 3, c: 3, colorIndex: 1 },
      { r: 4, c: 4, colorIndex: 2 },
      { r: 5, c: 5, colorIndex: 0 },
      { r: 6, c: 6, colorIndex: 1 },
      { r: 7, c: 7, colorIndex: 2 }
    ]
  },
  {
    id: 'pdf-page-5',
    name: 'Página 5: Rectángulo abierto (U)',
    gridSize: 10,
    steps: [
      { r: 3, c: 3, colorIndex: 0 },
      { r: 3, c: 4, colorIndex: 1 },
      { r: 3, c: 5, colorIndex: 2 },
      { r: 3, c: 6, colorIndex: 1 },
      { r: 3, c: 7, colorIndex: 0 },
      { r: 4, c: 7, colorIndex: 2 },
      { r: 5, c: 7, colorIndex: 1 },
      { r: 6, c: 7, colorIndex: 0 },
      { r: 7, c: 7, colorIndex: 1 },
      { r: 7, c: 6, colorIndex: 0 },
      { r: 7, c: 5, colorIndex: 2 },
      { r: 7, c: 4, colorIndex: 1 }
    ]
  },
  {
    id: 'pdf-page-6',
    name: 'Página 6: Forma en L',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 3, c: 3, colorIndex: 1 },
      { r: 4, c: 3, colorIndex: 2 },
      { r: 5, c: 3, colorIndex: 0 },
      { r: 6, c: 3, colorIndex: 1 },
      { r: 6, c: 4, colorIndex: 1 },
      { r: 6, c: 5, colorIndex: 2 },
      { r: 6, c: 6, colorIndex: 1 },
      { r: 6, c: 7, colorIndex: 0 }
    ]
  },
  {
    id: 'pdf-page-7',
    name: 'Página 7: Número 2 / Onda',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 2, c: 4, colorIndex: 1 },
      { r: 2, c: 5, colorIndex: 2 },
      { r: 3, c: 6, colorIndex: 1 },
      { r: 4, c: 6, colorIndex: 0 },
      { r: 4, c: 5, colorIndex: 2 },
      { r: 4, c: 4, colorIndex: 1 },
      { r: 4, c: 3, colorIndex: 0 },
      { r: 5, c: 3, colorIndex: 2 },
      { r: 6, c: 3, colorIndex: 1 },
      { r: 7, c: 4, colorIndex: 0 },
      { r: 7, c: 5, colorIndex: 2 },
      { r: 7, c: 6, colorIndex: 1 }
    ]
  },
  {
    id: 'pdf-page-8',
    name: 'Página 8: Espiral Labyrinth',
    gridSize: 10,
    steps: [
      { r: 2, c: 2, colorIndex: 0 },
      { r: 2, c: 3, colorIndex: 1 },
      { r: 2, c: 4, colorIndex: 2 },
      { r: 2, c: 5, colorIndex: 1 },
      { r: 2, c: 6, colorIndex: 0 },
      { r: 3, c: 6, colorIndex: 2 },
      { r: 4, c: 6, colorIndex: 1 },
      { r: 5, c: 6, colorIndex: 2 },
      { r: 6, c: 6, colorIndex: 2 },
      { r: 6, c: 5, colorIndex: 1 },
      { r: 6, c: 4, colorIndex: 0 },
      { r: 6, c: 3, colorIndex: 2 },
      { r: 5, c: 3, colorIndex: 1 },
      { r: 4, c: 3, colorIndex: 0 },
      { r: 4, c: 4, colorIndex: 2 },
      { r: 5, c: 4, colorIndex: 1 },
      { r: 5, c: 5, colorIndex: 0 }
    ]
  },
  {
    id: 'pdf-page-9',
    name: 'Página 9: Cruz (+)',
    gridSize: 10,
    steps: [
      // Barra vertical
      { r: 1, c: 5, colorIndex: 2 },
      { r: 2, c: 5, colorIndex: 1 },
      { r: 3, c: 5, colorIndex: 0 },
      { r: 4, c: 5, colorIndex: 1 },
      { r: 5, c: 5, colorIndex: 2 },
      // Barra horizontal
      { r: 3, c: 3, colorIndex: 1 },
      { r: 3, c: 4, colorIndex: 2 },
      { r: 3, c: 6, colorIndex: 2 },
      { r: 3, c: 7, colorIndex: 1 }
    ]
  },
  {
    id: 'pdf-page-10',
    name: 'Página 10: Serpiente doble giro',
    gridSize: 10,
    steps: [
      { r: 2, c: 3, colorIndex: 0 },
      { r: 2, c: 4, colorIndex: 1 },
      { r: 2, c: 5, colorIndex: 2 },
      { r: 2, c: 6, colorIndex: 1 },
      { r: 2, c: 7, colorIndex: 0 },
      { r: 3, c: 7, colorIndex: 2 },
      { r: 4, c: 6, colorIndex: 1 },
      { r: 4, c: 5, colorIndex: 0 },
      { r: 4, c: 4, colorIndex: 1 },
      { r: 4, c: 3, colorIndex: 1 },
      { r: 5, c: 3, colorIndex: 0 },
      { r: 6, c: 3, colorIndex: 2 },
      { r: 6, c: 4, colorIndex: 1 },
      { r: 6, c: 5, colorIndex: 0 },
      { r: 6, c: 6, colorIndex: 2 },
      { r: 6, c: 7, colorIndex: 1 }
    ]
  }
];

/**
 * Plantillas de Pixel Art clásicas (iconos, objetos, etc.)
 */
const PIXEL_ART_PRESETS = [
  {
    id: 'pixel-heart',
    name: 'Corazón Rojo',
    gridSize: 10,
    cells: [
      { r: 2, c: 3, color: '#E63946' }, { r: 2, c: 4, color: '#E63946' },
      { r: 2, c: 6, color: '#E63946' }, { r: 2, c: 7, color: '#E63946' },
      { r: 3, c: 2, color: '#E63946' }, { r: 3, c: 5, color: '#E63946' }, { r: 3, c: 8, color: '#E63946' },
      { r: 4, c: 2, color: '#E63946' }, { r: 4, c: 8, color: '#E63946' },
      { r: 5, c: 3, color: '#E63946' }, { r: 5, c: 7, color: '#E63946' },
      { r: 6, c: 4, color: '#E63946' }, { r: 6, c: 6, color: '#E63946' },
      { r: 7, c: 5, color: '#E63946' },
      // Relleno
      { r: 3, c: 3, color: '#E63946' }, { r: 3, c: 4, color: '#E63946' }, { r: 3, c: 6, color: '#E63946' }, { r: 3, c: 7, color: '#E63946' },
      { r: 4, c: 3, color: '#E63946' }, { r: 4, c: 4, color: '#E63946' }, { r: 4, c: 5, color: '#E63946' }, { r: 4, c: 6, color: '#E63946' }, { r: 4, c: 7, color: '#E63946' },
      { r: 5, c: 4, color: '#E63946' }, { r: 5, c: 5, color: '#E63946' }, { r: 5, c: 6, color: '#E63946' },
      { r: 6, c: 5, color: '#E63946' }
    ]
  },
  {
    id: 'pixel-star',
    name: 'Estrella Dorada',
    gridSize: 10,
    cells: [
      { r: 1, c: 5, color: '#FFB703' },
      { r: 2, c: 5, color: '#FFB703' },
      { r: 3, c: 1, color: '#FFB703' }, { r: 3, c: 2, color: '#FFB703' }, { r: 3, c: 3, color: '#FFB703' }, { r: 3, c: 4, color: '#FFB703' }, { r: 3, c: 5, color: '#FFB703' }, { r: 3, c: 6, color: '#FFB703' }, { r: 3, c: 7, color: '#FFB703' }, { r: 3, c: 8, color: '#FFB703' }, { r: 3, c: 9, color: '#FFB703' },
      { r: 4, c: 2, color: '#FFB703' }, { r: 4, c: 3, color: '#FFB703' }, { r: 4, c: 4, color: '#FFB703' }, { r: 4, c: 5, color: '#FFB703' }, { r: 4, c: 6, color: '#FFB703' }, { r: 4, c: 7, color: '#FFB703' }, { r: 4, c: 8, color: '#FFB703' },
      { r: 5, c: 3, color: '#FFB703' }, { r: 5, c: 4, color: '#FFB703' }, { r: 5, c: 5, color: '#FFB703' }, { r: 5, c: 6, color: '#FFB703' }, { r: 5, c: 7, color: '#FFB703' },
      { r: 6, c: 2, color: '#FFB703' }, { r: 6, c: 3, color: '#FFB703' }, { r: 6, c: 5, color: '#FFB703' }, { r: 6, c: 7, color: '#FFB703' }, { r: 6, c: 8, color: '#FFB703' },
      { r: 7, c: 2, color: '#FFB703' }, { r: 7, c: 8, color: '#FFB703' },
      { r: 8, c: 1, color: '#FFB703' }, { r: 8, c: 9, color: '#FFB703' }
    ]
  },
  {
    id: 'pixel-smiley',
    name: 'Carita Sonriente',
    gridSize: 10,
    cells: [
      { r: 1, c: 3, color: '#FFB703' }, { r: 1, c: 4, color: '#FFB703' }, { r: 1, c: 5, color: '#FFB703' }, { r: 1, c: 6, color: '#FFB703' },
      { r: 2, c: 2, color: '#FFB703' }, { r: 2, c: 7, color: '#FFB703' },
      { r: 3, c: 1, color: '#FFB703' }, { r: 3, c: 3, color: '#1D3557' }, { r: 3, c: 6, color: '#1D3557' }, { r: 3, c: 8, color: '#FFB703' },
      { r: 4, c: 1, color: '#FFB703' }, { r: 4, c: 8, color: '#FFB703' },
      { r: 5, c: 1, color: '#FFB703' }, { r: 5, c: 8, color: '#FFB703' },
      { r: 6, c: 1, color: '#FFB703' }, { r: 6, c: 2, color: '#1D3557' }, { r: 6, c: 7, color: '#1D3557' }, { r: 6, c: 8, color: '#FFB703' },
      { r: 7, c: 2, color: '#FFB703' }, { r: 7, c: 3, color: '#1D3557' }, { r: 7, c: 4, color: '#1D3557' }, { r: 7, c: 5, color: '#1D3557' }, { r: 7, c: 6, color: '#1D3557' }, { r: 7, c: 7, color: '#FFB703' },
      { r: 8, c: 3, color: '#FFB703' }, { r: 8, c: 4, color: '#FFB703' }, { r: 8, c: 5, color: '#FFB703' }, { r: 8, c: 6, color: '#FFB703' }
    ]
  },
  {
    id: 'pixel-tree',
    name: 'Árbol',
    gridSize: 10,
    cells: [
      { r: 1, c: 5, color: '#2A9D8F' },
      { r: 2, c: 4, color: '#2A9D8F' }, { r: 2, c: 5, color: '#2A9D8F' }, { r: 2, c: 6, color: '#2A9D8F' },
      { r: 3, c: 3, color: '#2A9D8F' }, { r: 3, c: 4, color: '#2A9D8F' }, { r: 3, c: 5, color: '#2A9D8F' }, { r: 3, c: 6, color: '#2A9D8F' }, { r: 3, c: 7, color: '#2A9D8F' },
      { r: 4, c: 4, color: '#2A9D8F' }, { r: 4, c: 5, color: '#2A9D8F' }, { r: 4, c: 6, color: '#2A9D8F' },
      { r: 5, c: 3, color: '#2A9D8F' }, { r: 5, c: 4, color: '#2A9D8F' }, { r: 5, c: 5, color: '#2A9D8F' }, { r: 5, c: 6, color: '#2A9D8F' }, { r: 5, c: 7, color: '#2A9D8F' },
      { r: 6, c: 2, color: '#2A9D8F' }, { r: 6, c: 3, color: '#2A9D8F' }, { r: 6, c: 4, color: '#2A9D8F' }, { r: 6, c: 5, color: '#2A9D8F' }, { r: 6, c: 6, color: '#2A9D8F' }, { r: 6, c: 7, color: '#2A9D8F' }, { r: 6, c: 8, color: '#2A9D8F' },
      { r: 7, c: 5, color: '#6F4E37' },
      { r: 8, c: 5, color: '#6F4E37' }
    ]
  }
];

/**
 * Generador procedural de rutas sin colisión propia (Self-Avoiding Walk)
 * Genera un camino continuo paso a paso para ejercicios educativos.
 *
 * @param {number} gridSize - Filas y columnas de la cuadrícula
 * @param {number} stepCount - Cantidad de cuadrados en la ruta
 * @param {Array<string>} palette - Paleta de colores a ciclar
 * @param {boolean} allowDiagonals - Si permite movimientos diagonales
 * @param {string} colorRotationMode - 'sequence' o 'random'
 * @returns {Array<Object>} Lista de pasos {r, c, color, dir}
 */
function generateRandomRoute(gridSize = 10, stepCount = 12, palette = PALETTE_PRESETS.pdfSample.colors, allowDiagonals = false, colorRotationMode = 'sequence') {
  const visited = new Set();
  const route = [];

  const getNextColor = (stepIndex, prevColor) => {
    if (colorRotationMode === 'random' && palette.length > 1) {
      let pool = palette;
      if (prevColor) {
        const filtered = palette.filter(c => c.toLowerCase() !== prevColor.toLowerCase());
        if (filtered.length > 0) pool = filtered;
      }
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return palette[stepIndex % palette.length];
  };

  // Elegir punto de inicio con margen
  let curR = Math.floor(Math.random() * (gridSize - 4)) + 2;
  let curC = Math.floor(Math.random() * (gridSize - 4)) + 2;

  visited.add(`${curR},${curC}`);
  const initialColor = (colorRotationMode === 'random' && palette.length > 0)
    ? palette[Math.floor(Math.random() * palette.length)]
    : palette[0 % palette.length];

  route.push({
    r: curR,
    c: curC,
    color: initialColor,
    step: 1
  });

  // Direcciones ortogonales (y opcionalmente diagonales)
  const directions = [
    { dr: -1, dc: 0, name: 'up' },
    { dr: 1, dc: 0, name: 'down' },
    { dr: 0, dc: -1, name: 'left' },
    { dr: 0, dc: 1, name: 'right' }
  ];

  if (allowDiagonals) {
    directions.push(
      { dr: -1, dc: 1, name: 'up-right' },
      { dr: 1, dc: 1, name: 'down-right' },
      { dr: 1, dc: -1, name: 'down-left' },
      { dr: -1, dc: -1, name: 'up-left' }
    );
  }

  let attempts = 0;
  while (route.length < stepCount && attempts < 200) {
    attempts++;
    // Mezclar direcciones
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
    let moved = false;

    for (const d of shuffledDirs) {
      const nr = curR + d.dr;
      const nc = curC + d.dc;

      // Verificar límites
      if (nr >= 1 && nr < gridSize - 1 && nc >= 1 && nc < gridSize - 1) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          // Asignar dirección al paso anterior
          route[route.length - 1].dir = d.name;
          route[route.length - 1].delta = { dr: d.dr, dc: d.dc };

          curR = nr;
          curC = nc;
          visited.add(key);

          const stepIndex = route.length;
          const prevColor = route[route.length - 1].color;
          route.push({
            r: curR,
            c: curC,
            color: getNextColor(stepIndex, prevColor),
            step: stepIndex + 1
          });
          moved = true;
          break;
        }
      }
    }

    if (!moved) {
      // Si se quedó atrapado, retroceder un paso o terminar si hay suficientes
      if (route.length >= Math.max(6, Math.floor(stepCount * 0.7))) {
        break;
      } else {
        // Reiniciar intento
        visited.clear();
        route.length = 0;
        curR = Math.floor(Math.random() * (gridSize - 4)) + 2;
        curC = Math.floor(Math.random() * (gridSize - 4)) + 2;
        visited.add(`${curR},${curC}`);
        route.push({
          r: curR,
          c: curC,
          color: initialColor,
          step: 1
        });
      }
    }
  }

  // Asegurar direcciones para todos los pasos excepto el último
  for (let i = 0; i < route.length - 1; i++) {
    const dr = route[i + 1].r - route[i].r;
    const dc = route[i + 1].c - route[i].c;
    route[i].delta = { dr, dc };
    route[i].dir = getDirectionName(dr, dc);
  }

  return route;
}

/**
 * Obtiene el nombre semántico de dirección a partir de deltas
 */
function getDirectionName(dr, dc) {
  if (dr === -1 && dc === 0) return 'up';
  if (dr === 1 && dc === 0) return 'down';
  if (dr === 0 && dc === -1) return 'left';
  if (dr === 0 && dc === 1) return 'right';
  if (dr === -1 && dc === 1) return 'up-right';
  if (dr === 1 && dc === 1) return 'down-right';
  if (dr === 1 && dc === -1) return 'down-left';
  if (dr === -1 && dc === -1) return 'up-left';
  return 'none';
}

/**
 * Convierte una imagen a cuadrícula de píxeles (pixel art)
 * mapeando colores a la paleta más cercana o conservando colores originales.
 */
function processImageToPixelGrid(imageFile, targetCols, targetRows, palette, snapToPalette = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetCols;
        canvas.height = targetRows;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, targetCols, targetRows);

        const imgData = ctx.getImageData(0, 0, targetCols, targetRows).data;
        const cells = [];

        for (let r = 0; r < targetRows; r++) {
          for (let c = 0; c < targetCols; c++) {
            const idx = (r * targetCols + c) * 4;
            const red = imgData[idx];
            const green = imgData[idx + 1];
            const blue = imgData[idx + 2];
            const alpha = imgData[idx + 3];

            // Ignorar píxeles transparentes o casi blancos puros si se desea
            if (alpha > 50 && !(red > 245 && green > 245 && blue > 245)) {
              let finalHex = rgbToHex(red, green, blue);
              if (snapToPalette && palette && palette.length > 0) {
                finalHex = findClosestColor(red, green, blue, palette);
              }
              cells.push({ r, c, color: finalHex });
            }
          }
        }
        resolve(cells);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function findClosestColor(r, g, b, palette) {
  let closest = palette[0];
  let minDistance = Infinity;

  for (const hex of palette) {
    const p = hexToRgb(hex);
    // Distancia Euclidiana ponderada perceptualmente en espacio RGB
    const d = Math.sqrt(
      0.3 * Math.pow(r - p.r, 2) +
      0.59 * Math.pow(g - p.g, 2) +
      0.11 * Math.pow(b - p.b, 2)
    );
    if (d < minDistance) {
      minDistance = d;
      closest = hex;
    }
  }
  return closest;
}
