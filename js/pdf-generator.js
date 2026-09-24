/**
 * pdf-generator.js
 * Generador de documentos PDF de alta calidad vectorial utilizando jsPDF.
 * Centrado automático de patrones en hojas A4 / Carta, soporte para flechas direccionales,
 * flechas indicadoras de color, numeración secuencial, páginas individuales o cuadernillos multipágina.
 */

class PatternPdfGenerator {
  constructor() {
    this.jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
  }

  /**
   * Genera el documento PDF y lo descarga o retorna como Blob URL
   * @param {Array<Object>} pages - Lista de páginas a incluir en el PDF
   * @param {Object} options - Configuración de página y renderizado
   * @returns {Object} { doc, blobUrl }
   */
  generatePdf(pages, options = {}) {
    const {
      format = 'a4',             // 'a4' o 'letter'
      orientation = 'portrait',  // 'portrait' o 'landscape'
      squareSizeSetting = 'medium', // 'small', 'medium', 'large', 'fit'
      showGrid = false,          // Dibujar cuadrícula tenue de fondo
      centerPatternOnly = true,  // Centrar el dibujo en vez de toda la cuadrícula
      showPageNumbers = false,   // Mostrar "Pág. 1" en el pie
      showTitle = false,         // Mostrar título en la parte superior
      titleText = 'Patrón de Cuadrados'
    } = options;

    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('La librería jsPDF no está cargada.');
    }

    const doc = new window.jspdf.jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format,
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    pages.forEach((pageData, index) => {
      if (index > 0) {
        doc.addPage(format, orientation);
      }
      this.renderPage(doc, pageData, {
        pageWidth,
        pageHeight,
        squareSizeSetting,
        showGrid,
        centerPatternOnly,
        showPageNumbers,
        pageIndex: index + 1,
        totalPages: pages.length,
        showTitle,
        titleText: pageData.title || titleText
      });
    });

    const blobUrl = doc.output('bloburl');
    return { doc, blobUrl };
  }

  /**
   * Renderiza una página individual en el lienzo PDF
   */
  renderPage(doc, pageData, cfg) {
    const {
      pageWidth,
      pageHeight,
      squareSizeSetting,
      showGrid,
      centerPatternOnly,
      showPageNumbers,
      pageIndex,
      totalPages,
      showTitle,
      titleText
    } = cfg;

    const {
      mode = 'routes',
      gridSize = 10,
      cells = [],        // Cuadrícula / Pixel Art: [{ r, c, color }]
      steps = [],        // Rutas: [{ r, c, color, dir, step }]
      arrowOptions = {
        showArrows: false,
        arrowType: 'direction', // 'direction', 'nextColor', 'number', 'both'
        arrowColor: 'auto'     // 'auto', 'white', 'black', 'nextColor'
      }
    } = pageData;

    // Calcular márgenes de página
    const margin = 15; // mm
    const usableW = pageWidth - margin * 2;
    const usableH = pageHeight - margin * 2 - (showTitle ? 15 : 0) - (showPageNumbers ? 10 : 0);

    // Determinar elementos a dibujar
    const activeItems = mode === 'routes' ? steps : cells;
    if (!activeItems || activeItems.length === 0) {
      return; // Página en blanco
    }

    // Calcular límites de la cuadrícula o del patrón
    let minR = 0, maxR = gridSize - 1, minC = 0, maxC = gridSize - 1;
    if (centerPatternOnly && activeItems.length > 0) {
      minR = Math.min(...activeItems.map(i => i.r));
      maxR = Math.max(...activeItems.map(i => i.r));
      minC = Math.min(...activeItems.map(i => i.c));
      maxC = Math.max(...activeItems.map(i => i.c));
    }

    const patternCols = maxC - minC + 1;
    const patternRows = maxR - minR + 1;

    // Calcular tamaño del cuadrado en mm
    let squareSizeMm = 12; // Base mediano
    if (squareSizeSetting === 'small') squareSizeMm = 8;
    else if (squareSizeSetting === 'medium') squareSizeMm = 12;
    else if (squareSizeSetting === 'large') squareSizeMm = 16;
    else if (squareSizeSetting === 'extra-large') squareSizeMm = 20;
    else if (squareSizeSetting === 'fit') {
      const maxPossibleW = usableW / patternCols;
      const maxPossibleH = usableH / patternRows;
      squareSizeMm = Math.min(maxPossibleW, maxPossibleH, 25);
    }

    // Limitar al espacio útil de la página
    if (patternCols * squareSizeMm > usableW) {
      squareSizeMm = usableW / patternCols;
    }
    if (patternRows * squareSizeMm > usableH) {
      squareSizeMm = usableH / patternRows;
    }

    const totalPatternW = patternCols * squareSizeMm;
    const totalPatternH = patternRows * squareSizeMm;

    // Centrar en la página
    const startX = (pageWidth - totalPatternW) / 2;
    let startY = (pageHeight - totalPatternH) / 2;
    if (showTitle) startY += 5;

    // Dibujar título opcional
    if (showTitle && titleText) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text(titleText, pageWidth / 2, margin + 5, { align: 'center' });
    }

    // Dibujar cuadrícula tenue de fondo si está activa
    if (showGrid) {
      doc.setDrawColor(220, 224, 230);
      doc.setLineWidth(0.2);

      const gridStartC = centerPatternOnly ? minC : 0;
      const gridEndC = centerPatternOnly ? maxC : gridSize - 1;
      const gridStartR = centerPatternOnly ? minR : 0;
      const gridEndR = centerPatternOnly ? maxR : gridSize - 1;

      for (let r = gridStartR; r <= gridEndR; r++) {
        for (let c = gridStartC; c <= gridEndC; c++) {
          const x = startX + (c - minC) * squareSizeMm;
          const y = startY + (r - minR) * squareSizeMm;
          doc.rect(x, y, squareSizeMm, squareSizeMm, 'S');
        }
      }
    }

    // Dibujar los cuadrados coloreados
    // Mapa rápido de coordenadas para lookups
    const itemMap = new Map();
    activeItems.forEach(item => {
      itemMap.set(`${item.r},${item.c}`, item);
    });

    activeItems.forEach((item, idx) => {
      const x = startX + (item.c - minC) * squareSizeMm;
      const y = startY + (item.r - minR) * squareSizeMm;

      const rgb = this.hexToRgb(item.color || '#1F355C');
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      // Rellenar cuadrado sin borde visible o borde tenue
      doc.setDrawColor(rgb.r, rgb.g, rgb.b);
      doc.setLineWidth(0.1);
      doc.rect(x, y, squareSizeMm, squareSizeMm, 'FD');

      // Si es modo rutas y las flechas están activadas
      if (mode === 'routes' && arrowOptions.showArrows) {
        const nextItem = activeItems[idx + 1];
        this.renderArrowOrBadge(doc, item, nextItem, x, y, squareSizeMm, arrowOptions, idx + 1);
      }
    });

    // Pie de página opcional
    if (showPageNumbers && totalPages > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`${pageIndex} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }
  }

  /**
   * Dibuja la flecha direccional o el indicador dentro del cuadrado
   */
  renderArrowOrBadge(doc, currentItem, nextItem, x, y, size, options, stepNum) {
    const { arrowType = 'direction', arrowColor = 'auto' } = options;
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Determinar color de la flecha
    let finalColorRgb;
    const bgRgb = this.hexToRgb(currentItem.color || '#1F355C');
    const isLightBg = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) > 140;

    if (arrowColor === 'white') {
      finalColorRgb = { r: 255, g: 255, b: 255 };
    } else if (arrowColor === 'black') {
      finalColorRgb = { r: 20, g: 20, b: 20 };
    } else if (arrowColor === 'nextColor' && nextItem && nextItem.color) {
      finalColorRgb = this.hexToRgb(nextItem.color);
    } else {
      // Auto: blanco sobre oscuro, negro sobre claro
      finalColorRgb = isLightBg ? { r: 30, g: 41, b: 59 } : { r: 255, g: 255, b: 255 };
    }

    // Si solo es número
    if (arrowType === 'number') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(Math.max(7, size * 1.3));
      doc.setTextColor(finalColorRgb.r, finalColorRgb.g, finalColorRgb.b);
      doc.text(String(stepNum), centerX, centerY + (size * 0.15), { align: 'center' });
      return;
    }

    // Calcular dirección hacia el siguiente punto
    let angle = null;
    if (nextItem) {
      const dr = nextItem.r - currentItem.r;
      const dc = nextItem.c - currentItem.c;
      angle = Math.atan2(dr, dc); // radianes (0 = derecha, PI/2 = abajo, etc.)
    } else if (currentItem.dir) {
      const dirMap = {
        'right': 0,
        'down-right': Math.PI / 4,
        'down': Math.PI / 2,
        'down-left': (3 * Math.PI) / 4,
        'left': Math.PI,
        'up-left': -(3 * Math.PI) / 4,
        'up': -Math.PI / 2,
        'up-right': -Math.PI / 4
      };
      angle = dirMap[currentItem.dir];
    }

    // Si no hay dirección (último paso de la ruta), dibujar un círculo o punto de meta
    if (angle === null || angle === undefined) {
      doc.setFillColor(finalColorRgb.r, finalColorRgb.g, finalColorRgb.b);
      doc.circle(centerX, centerY, size * 0.18, 'F');
      return;
    }

    // Si se eligió tipo 'both' (flecha + número)
    if (arrowType === 'both') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(Math.max(6, size * 0.9));
      doc.setTextColor(finalColorRgb.r, finalColorRgb.g, finalColorRgb.b);
      // Colocar número en una esquina y flecha en el centro
      doc.text(String(stepNum), x + size * 0.22, y + size * 0.35, { align: 'center' });
    }

    // Dibujar flecha vectorial centrada rotada según el ángulo
    this.drawVectorArrow(doc, centerX, centerY, size * 0.55, angle, finalColorRgb);
  }

  /**
   * Dibuja una flecha estilizada rotada
   */
  drawVectorArrow(doc, cx, cy, arrowLen, angle, color) {
    const halfLen = arrowLen / 2;
    const headLen = arrowLen * 0.42;
    const headAngle = Math.PI / 6; // 30 grados apertura

    // Puntos relativos no rotados: la flecha apunta hacia el eje X positivo (derecha)
    // Punta: (+halfLen, 0)
    // Origen del vástago: (-halfLen, 0)
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotate = (px, py) => {
      return {
        x: cx + px * cos - py * sin,
        y: cy + px * sin + py * cos
      };
    };

    const tip = rotate(halfLen, 0);
    const tail = rotate(-halfLen, 0);

    // Alas de la punta
    const wing1 = rotate(halfLen - headLen * Math.cos(headAngle), headLen * Math.sin(headAngle));
    const wing2 = rotate(halfLen - headLen * Math.cos(headAngle), -headLen * Math.sin(headAngle));

    // Dibujar vástago y cabeza
    doc.setDrawColor(color.r, color.g, color.b);
    doc.setFillColor(color.r, color.g, color.b);
    doc.setLineWidth(Math.max(0.6, arrowLen * 0.12));

    // Línea del cuerpo
    doc.line(tail.x, tail.y, tip.x, tip.y);

    // Cabeza triangular rellena
    doc.triangle(tip.x, tip.y, wing1.x, wing1.y, wing2.x, wing2.y, 'FD');
  }

  hexToRgb(hex) {
    let clean = (hex || '#000000').replace('#', '');
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
}

// Instancia global
window.patternPdfGenerator = new PatternPdfGenerator();
