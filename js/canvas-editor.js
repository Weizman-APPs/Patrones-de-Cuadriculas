/**
 * canvas-editor.js
 * Editor visual interactivo sobre lienzo Canvas HTML5.
 * Soporta dibujo de rutas paso a paso con cálculo de flechas automáticas,
 * modo cuadrícula libre para Pixel Art, zoom, cuadrícula tenue y arrastre de pincel.
 */

class CanvasGridEditor {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');

    // Dimensiones de la cuadrícula
    this.gridSize = options.gridSize || 10;
    this.rows = this.gridSize;
    this.cols = this.gridSize;

    // Modo activo: 'routes' o 'grid'
    this.mode = options.mode || 'routes';

    // Herramienta activa para modo pixel: 'brush', 'eraser', 'bucket'
    this.tool = 'brush';

    // Datos del modelo
    this.steps = [];   // Para 'routes': [{ r, c, color, dir, step }]
    this.cells = [];   // Para 'grid': [{ r, c, color }]
    this.cellMap = new Map(); // Llave "r,c" -> color

    // Paleta activa
    this.palette = options.palette || ['#1F355C', '#6F8A3D', '#863E9B'];
    this.activeColor = this.palette[0];
    this.autoCyclePalette = true; // Si es true, cicla colores en las rutas
    this.colorRotationMode = options.colorRotationMode || 'sequence'; // 'sequence' o 'random'

    // Opciones de flechas
    this.arrowOptions = {
      showArrows: false,
      arrowType: 'direction', // 'direction', 'nextColor', 'number', 'both'
      arrowColor: 'auto'     // 'auto', 'white', 'black', 'nextColor'
    };

    // Opciones visuales
    this.showGrid = true;
    this.zoom = 1;
    this.cellSize = 42; // px base
    this.hoverPos = null;

    // Historial para Deshacer/Rehacer
    this.undoStack = [];
    this.redoStack = [];

    // Estado del ratón
    this.isMouseDown = false;
    this.lastDrawnCoord = null;

    // Callbacks
    this.onStateChange = options.onStateChange || null;

    this.initEvents();
    this.resizeCanvas();
    this.render();
  }

  setGridSize(size) {
    this.saveState();
    this.gridSize = size;
    this.rows = size;
    this.cols = size;
    // Filtrar celdas que queden fuera
    this.steps = this.steps.filter(s => s.r < size && s.c < size);
    this.cells = this.cells.filter(c => c.r < size && c.c < size);
    this.syncCellMap();
    this.recalcRouteDirections();
    this.resizeCanvas();
    this.render();
    this.notifyChange();
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.saveState();
    this.mode = mode;

    if (mode === 'grid' && this.steps.length > 0 && this.cells.length === 0) {
      // Transferir pasos a celdas
      this.cells = this.steps.map(s => ({ r: s.r, c: s.c, color: s.color }));
      this.syncCellMap();
    } else if (mode === 'routes' && this.cells.length > 0 && this.steps.length === 0) {
      // Transferir celdas a pasos en orden de inserción
      this.steps = this.cells.map((c, i) => ({
        r: c.r,
        c: c.c,
        color: c.color,
        step: i + 1
      }));
      this.recalcRouteDirections();
    }

    this.render();
    this.notifyChange();
  }

  setPalette(paletteColors) {
    this.palette = paletteColors;
    if (!this.palette.includes(this.activeColor)) {
      this.activeColor = this.palette[0] || '#1F355C';
    }
  }

  setActiveColor(hex) {
    this.activeColor = hex;
  }

  setColorRotationMode(mode) {
    this.colorRotationMode = mode;
    this.notifyChange();
  }

  setArrowOptions(options) {
    this.arrowOptions = { ...this.arrowOptions, ...options };
    this.render();
    this.notifyChange();
  }

  setShowGrid(show) {
    this.showGrid = show;
    this.render();
  }

  loadPattern(pattern) {
    this.saveState();
    if (pattern.gridSize) {
      this.gridSize = pattern.gridSize;
      this.rows = pattern.gridSize;
      this.cols = pattern.gridSize;
    }

    if (pattern.steps) {
      // Es un patrón de ruta
      this.mode = 'routes';
      this.steps = pattern.steps.map((st, i) => {
        let col = st.color;
        if (!col && typeof st.colorIndex === 'number') {
          col = this.palette[st.colorIndex % this.palette.length];
        }
        return {
          r: st.r,
          c: st.c,
          color: col || this.palette[0],
          step: i + 1
        };
      });
      this.cells = [];
      this.recalcRouteDirections();
      this.syncCellMap();
    } else if (pattern.cells) {
      // Es un patrón de cuadrícula / pixel art
      this.mode = 'grid';
      this.cells = pattern.cells.map(c => ({
        r: c.r,
        c: c.c,
        color: c.color || this.palette[0]
      }));
      this.steps = [];
      this.syncCellMap();
    }

    this.resizeCanvas();
    this.render();
    this.notifyChange();
  }

  clear() {
    this.saveState();
    this.steps = [];
    this.cells = [];
    this.cellMap.clear();
    this.render();
    this.notifyChange();
  }

  saveState() {
    const snapshot = {
      mode: this.mode,
      gridSize: this.gridSize,
      colorRotationMode: this.colorRotationMode,
      steps: JSON.parse(JSON.stringify(this.steps)),
      cells: JSON.parse(JSON.stringify(this.cells))
    };
    this.undoStack.push(snapshot);
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = []; // Limpiar rehacer
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const current = {
      mode: this.mode,
      gridSize: this.gridSize,
      colorRotationMode: this.colorRotationMode,
      steps: JSON.parse(JSON.stringify(this.steps)),
      cells: JSON.parse(JSON.stringify(this.cells))
    };
    this.redoStack.push(current);

    const prev = this.undoStack.pop();
    this.mode = prev.mode;
    this.gridSize = prev.gridSize;
    if (prev.colorRotationMode) this.colorRotationMode = prev.colorRotationMode;
    this.rows = prev.gridSize;
    this.cols = prev.gridSize;
    this.steps = prev.steps;
    this.cells = prev.cells;
    this.syncCellMap();
    this.recalcRouteDirections();
    this.resizeCanvas();
    this.render();
    this.notifyChange();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const current = {
      mode: this.mode,
      gridSize: this.gridSize,
      colorRotationMode: this.colorRotationMode,
      steps: JSON.parse(JSON.stringify(this.steps)),
      cells: JSON.parse(JSON.stringify(this.cells))
    };
    this.undoStack.push(current);

    const next = this.redoStack.pop();
    this.mode = next.mode;
    this.gridSize = next.gridSize;
    if (next.colorRotationMode) this.colorRotationMode = next.colorRotationMode;
    this.rows = next.gridSize;
    this.cols = next.gridSize;
    this.steps = next.steps;
    this.cells = next.cells;
    this.syncCellMap();
    this.recalcRouteDirections();
    this.resizeCanvas();
    this.render();
    this.notifyChange();
  }

  syncCellMap() {
    this.cellMap.clear();
    const source = this.mode === 'routes' ? this.steps : this.cells;
    source.forEach(item => {
      this.cellMap.set(`${item.r},${item.c}`, item.color);
    });
  }

  recalcRouteDirections() {
    for (let i = 0; i < this.steps.length; i++) {
      this.steps[i].step = i + 1;
      if (i < this.steps.length - 1) {
        const dr = this.steps[i + 1].r - this.steps[i].r;
        const dc = this.steps[i + 1].c - this.steps[i].c;
        this.steps[i].dir = getDirectionName(dr, dc);
      } else {
        this.steps[i].dir = 'none';
      }
    }
  }

  // Interacción de dibujo
  handleCellClickOrDrag(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
    const key = `${r},${c}`;
    if (this.lastDrawnCoord && this.lastDrawnCoord.r === r && this.lastDrawnCoord.c === c) {
      return; // Ya procesado en este arrastre
    }
    this.lastDrawnCoord = { r, c };

    if (this.mode === 'routes') {
      // Si hacemos clic en el último paso agregado, lo borramos (deshacer último paso)
      if (this.steps.length > 0) {
        const lastStep = this.steps[this.steps.length - 1];
        if (lastStep.r === r && lastStep.c === c) {
          this.steps.pop();
          this.syncCellMap();
          this.recalcRouteDirections();
          this.render();
          this.notifyChange();
          return;
        }
      }

      // Evitar duplicar celda ya visitada en la ruta actual
      const alreadyIndex = this.steps.findIndex(s => s.r === r && s.c === c);
      if (alreadyIndex !== -1) {
        // Si hace clic en una casilla previa, recortar la ruta hasta allí
        this.steps.splice(alreadyIndex);
        this.syncCellMap();
        this.recalcRouteDirections();
        this.render();
        this.notifyChange();
        return;
      }

      // Asignar color según ciclo automático o color activo
      let chosenColor = this.activeColor;
      if (this.autoCyclePalette && this.palette.length > 0) {
        if (this.colorRotationMode === 'random') {
          // Si hay más de un color, evitar repetir consecutivamente el mismo color
          const lastColor = this.steps.length > 0 ? this.steps[this.steps.length - 1].color : null;
          let pool = this.palette;
          if (this.palette.length > 1 && lastColor) {
            const filtered = this.palette.filter(c => c.toLowerCase() !== lastColor.toLowerCase());
            if (filtered.length > 0) pool = filtered;
          }
          chosenColor = pool[Math.floor(Math.random() * pool.length)];
        } else {
          chosenColor = this.palette[this.steps.length % this.palette.length];
        }
      }

      this.steps.push({
        r,
        c,
        color: chosenColor,
        step: this.steps.length + 1
      });

      this.syncCellMap();
      this.recalcRouteDirections();
      this.render();
      this.notifyChange();

    } else {
      // Modo Cuadrícula / Pixel Art
      if (this.tool === 'brush') {
        const existingIdx = this.cells.findIndex(cell => cell.r === r && cell.c === c);
        if (existingIdx !== -1) {
          this.cells[existingIdx].color = this.activeColor;
        } else {
          this.cells.push({ r, c, color: this.activeColor });
        }
      } else if (this.tool === 'eraser') {
        this.cells = this.cells.filter(cell => !(cell.r === r && cell.c === c));
      } else if (this.tool === 'bucket') {
        this.floodFill(r, c, this.activeColor);
      }

      this.syncCellMap();
      this.render();
      this.notifyChange();
    }
  }

  floodFill(targetR, targetC, newColor) {
    const targetKey = `${targetR},${targetC}`;
    const currentColor = this.cellMap.get(targetKey) || null;
    if (currentColor === newColor) return;

    const queue = [{ r: targetR, c: targetC }];
    const visited = new Set();
    visited.add(targetKey);

    while (queue.length > 0) {
      const { r, c } = queue.pop();
      const existingIdx = this.cells.findIndex(cell => cell.r === r && cell.c === c);
      if (existingIdx !== -1) {
        this.cells[existingIdx].color = newColor;
      } else {
        this.cells.push({ r, c, color: newColor });
      }

      const neighbors = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r, c: c - 1 },
        { r, c: c + 1 }
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < this.rows && n.c >= 0 && n.c < this.cols) {
          const nKey = `${n.r},${n.c}`;
          if (!visited.has(nKey)) {
            visited.add(nKey);
            const nColor = this.cellMap.get(nKey) || null;
            if (nColor === currentColor) {
              queue.push(n);
            }
          }
        }
      }
    }
  }

  // Eventos del Mouse y Touch
  initEvents() {
    const getCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      const c = Math.floor(x / this.cellSize);
      const r = Math.floor(y / this.cellSize);
      return { r, c, x, y };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isMouseDown = true;
      this.saveState();
      this.lastDrawnCoord = null;
      const { r, c } = getCoords(e);
      this.handleCellClickOrDrag(r, c);
    });

    window.addEventListener('mousemove', (e) => {
      const { r, c } = getCoords(e);
      if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
        this.hoverPos = { r, c };
      } else {
        this.hoverPos = null;
      }

      if (this.isMouseDown) {
        this.handleCellClickOrDrag(r, c);
      } else {
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.lastDrawnCoord = null;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPos = null;
      this.render();
    });

    // Soporte táctil móvil / tablet
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isMouseDown = true;
      this.saveState();
      this.lastDrawnCoord = null;
      const { r, c } = getCoords(e);
      this.handleCellClickOrDrag(r, c);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isMouseDown) {
        const { r, c } = getCoords(e);
        this.handleCellClickOrDrag(r, c);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.lastDrawnCoord = null;
    });
  }

  resizeCanvas() {
    this.canvas.width = this.cols * this.cellSize;
    this.canvas.height = this.rows * this.cellSize;
  }

  // Renderizado visual del lienzo
  render() {
    const { ctx, rows, cols, cellSize } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fondo blanco limpio (tal como la hoja de papel)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar cuadrícula tenue si está activada
    if (this.showGrid) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        ctx.moveTo(0, r * cellSize);
        ctx.lineTo(cols * cellSize, r * cellSize);
      }
      for (let c = 0; c <= cols; c++) {
        ctx.moveTo(c * cellSize, 0);
        ctx.lineTo(c * cellSize, rows * cellSize);
      }
      ctx.stroke();
    }

    // Dibujar celdas coloreadas
    const activeItems = this.mode === 'routes' ? this.steps : this.cells;

    activeItems.forEach((item, idx) => {
      const x = item.c * cellSize;
      const y = item.r * cellSize;

      ctx.fillStyle = item.color || '#1F355C';
      ctx.fillRect(x, y, cellSize, cellSize);

      // Si es modo rutas y flechas activas
      if (this.mode === 'routes' && this.arrowOptions.showArrows) {
        const nextItem = activeItems[idx + 1];
        this.drawCanvasArrow(item, nextItem, x, y, cellSize, idx + 1);
      }
    });

    // Indicador de hover
    if (this.hoverPos && !this.isMouseDown) {
      const hx = this.hoverPos.c * cellSize;
      const hy = this.hoverPos.r * cellSize;

      ctx.save();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(hx + 1, hy + 1, cellSize - 2, cellSize - 2);

      // Previsualizar color si es celda vacía
      const isFilled = this.cellMap.has(`${this.hoverPos.r},${this.hoverPos.c}`);
      if (!isFilled) {
        let previewColor = this.activeColor;
        if (this.mode === 'routes' && this.autoCyclePalette && this.palette.length > 0) {
          previewColor = this.palette[this.steps.length % this.palette.length];
        }
        ctx.fillStyle = previewColor + '44'; // semitransparente
        ctx.fillRect(hx + 2, hy + 2, cellSize - 4, cellSize - 4);
      }
      ctx.restore();
    }
  }

  drawCanvasArrow(currentItem, nextItem, x, y, size, stepNum) {
    const { ctx } = this;
    const { arrowType = 'direction', arrowColor = 'auto' } = this.arrowOptions;
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // Determinar color de la flecha
    let colorRgb;
    const bgRgb = hexToRgb(currentItem.color || '#1F355C');
    const isLightBg = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) > 140;

    if (arrowColor === 'white') {
      colorRgb = '#FFFFFF';
    } else if (arrowColor === 'black') {
      colorRgb = '#111827';
    } else if (arrowColor === 'nextColor' && nextItem && nextItem.color) {
      colorRgb = nextItem.color;
    } else {
      colorRgb = isLightBg ? '#0F172A' : '#FFFFFF';
    }

    ctx.save();

    // Solo número
    if (arrowType === 'number') {
      ctx.fillStyle = colorRgb;
      ctx.font = `bold ${Math.max(11, size * 0.42)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(stepNum), centerX, centerY);
      ctx.restore();
      return;
    }

    // Calcular dirección
    let angle = null;
    if (nextItem) {
      const dr = nextItem.r - currentItem.r;
      const dc = nextItem.c - currentItem.c;
      angle = Math.atan2(dr, dc);
    } else if (currentItem.dir && currentItem.dir !== 'none') {
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

    // Último paso
    if (angle === null || angle === undefined) {
      ctx.fillStyle = colorRgb;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Tipo both: número pequeño + flecha
    if (arrowType === 'both') {
      ctx.fillStyle = colorRgb;
      ctx.font = `bold ${Math.max(9, size * 0.3)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(String(stepNum), x + 4, y + 3);
    }

    // Flecha vectorial
    const arrowLen = size * 0.55;
    const halfLen = arrowLen / 2;
    const headLen = arrowLen * 0.45;
    const headAngle = Math.PI / 6;

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    ctx.strokeStyle = colorRgb;
    ctx.fillStyle = colorRgb;
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Vástago
    ctx.beginPath();
    ctx.moveTo(-halfLen, 0);
    ctx.lineTo(halfLen, 0);
    ctx.stroke();

    // Cabeza triangular
    ctx.beginPath();
    ctx.moveTo(halfLen, 0);
    ctx.lineTo(halfLen - headLen * Math.cos(headAngle), headLen * Math.sin(headAngle));
    ctx.lineTo(halfLen - headLen * Math.cos(headAngle), -headLen * Math.sin(headAngle));
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  notifyChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getPageData());
    }
  }

  getPageData() {
    return {
      mode: this.mode,
      gridSize: this.gridSize,
      colorRotationMode: this.colorRotationMode || 'sequence',
      steps: JSON.parse(JSON.stringify(this.steps)),
      cells: JSON.parse(JSON.stringify(this.cells)),
      arrowOptions: { ...this.arrowOptions }
    };
  }

  loadPageData(data) {
    this.mode = data.mode || 'routes';
    this.gridSize = data.gridSize || 10;
    this.colorRotationMode = data.colorRotationMode || 'sequence';
    this.rows = this.gridSize;
    this.cols = this.gridSize;
    this.steps = data.steps || [];
    this.cells = data.cells || [];
    if (data.arrowOptions) {
      this.arrowOptions = { ...data.arrowOptions };
    }
    this.syncCellMap();
    this.recalcRouteDirections();
    this.resizeCanvas();
    this.render();
  }
}
