/**
 * app.js
 * Orquestador principal de la aplicación.
 * Conecta la interfaz de usuario con el editor Canvas, las plantillas y el generador de PDF.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado general de la aplicación
  const state = {
    pages: [],           // Array de páginas del proyecto
    activePageIndex: 0,  // Índice de página actual
    activePaletteKey: 'pdfSample',
    activePalette: [...PALETTE_PRESETS.pdfSample.colors],
    activeColor: PALETTE_PRESETS.pdfSample.colors[0],
    pdfOptions: {
      format: 'a4',
      orientation: 'portrait',
      squareSizeSetting: 'medium',
      showGrid: false,
      centerPatternOnly: true,
      showPageNumbers: false,
      showTitle: false,
      titleText: ''
    }
  };

  // Referencias DOM
  const canvas = document.getElementById('grid-canvas');
  const btnModeRoutes = document.getElementById('btn-mode-routes');
  const btnModeGrid = document.getElementById('btn-mode-grid');
  const paletteContainer = document.getElementById('palette-colors');
  const selectPalettePreset = document.getElementById('select-palette-preset');
  const inputCustomColor = document.getElementById('input-custom-color');
  const btnAddCustomColor = document.getElementById('btn-add-custom-color');
  const toggleCycleColors = document.getElementById('toggle-cycle-colors');
  const selectColorRotationMode = document.getElementById('select-color-rotation-mode');
  const colorRotationOptions = document.getElementById('color-rotation-options');

  const selectGridSize = document.getElementById('select-grid-size');
  const toggleCanvasGrid = document.getElementById('toggle-canvas-grid');

  // Flechas
  const toggleShowArrows = document.getElementById('toggle-show-arrows');
  const selectArrowType = document.getElementById('select-arrow-type');
  const selectArrowColor = document.getElementById('select-arrow-color');
  const arrowSettingsBox = document.getElementById('arrow-settings-box');

  // Herramientas Pixel
  const pixelToolsBox = document.getElementById('pixel-tools-box');
  const btnToolBrush = document.getElementById('btn-tool-brush');
  const btnToolEraser = document.getElementById('btn-tool-eraser');
  const btnToolBucket = document.getElementById('btn-tool-bucket');

  // Presets y Generador
  const btnRandomRoute = document.getElementById('btn-random-route');
  const inputRouteSteps = document.getElementById('input-route-steps');
  const selectPdfPreset = document.getElementById('select-pdf-preset');
  const selectPixelPreset = document.getElementById('select-pixel-preset');

  // Importador de imagen
  const inputImageFile = document.getElementById('input-image-file');
  const toggleSnapPalette = document.getElementById('toggle-snap-palette');

  // Barra de herramientas superior
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnClear = document.getElementById('btn-clear');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomReset = document.getElementById('btn-zoom-reset');

  // Páginas
  const pagesListEl = document.getElementById('pages-list');
  const btnAddPage = document.getElementById('btn-add-page');
  const btnDuplicatePage = document.getElementById('btn-duplicate-page');
  const btnDeletePage = document.getElementById('btn-delete-page');
  const lblPageCount = document.getElementById('lbl-page-count');

  // Exportar PDF
  const btnExportCurrentPdf = document.getElementById('btn-export-current-pdf');
  const btnExportAllPdf = document.getElementById('btn-export-all-pdf');
  const btnPreviewPdf = document.getElementById('btn-preview-pdf');
  const btnDirectPrint = document.getElementById('btn-direct-print');

  // Configuración de PDF
  const selectPdfFormat = document.getElementById('select-pdf-format');
  const selectPdfOrientation = document.getElementById('select-pdf-orientation');
  const selectSquareSize = document.getElementById('select-square-size');
  const togglePdfGrid = document.getElementById('toggle-pdf-grid');
  const togglePdfPageNums = document.getElementById('toggle-pdf-page-nums');

  // Modal Vista Previa
  const modalPreview = document.getElementById('modal-preview');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const iframePreview = document.getElementById('iframe-preview');

  // Info inferior
  const statusInfo = document.getElementById('status-info');

  // Inicializar Editor Canvas
  const editor = new CanvasGridEditor(canvas, {
    gridSize: 10,
    mode: 'routes',
    palette: state.activePalette,
    onStateChange: (pageData) => {
      // Guardar cambios en la página activa
      if (state.pages[state.activePageIndex]) {
        state.pages[state.activePageIndex] = {
          ...state.pages[state.activePageIndex],
          ...pageData
        };
        updateStatusInfo();
        renderPagesList();
      }
    }
  });

  // Inicializar las 10 páginas de muestra precargadas
  function initDefaultPages() {
    state.pages = PDF_SAMPLE_PATTERNS.map((p, idx) => ({
      title: p.name,
      mode: 'routes',
      gridSize: p.gridSize,
      steps: p.steps.map((st, sIdx) => ({
        r: st.r,
        c: st.c,
        color: state.activePalette[st.colorIndex % state.activePalette.length],
        step: sIdx + 1
      })),
      cells: [],
      arrowOptions: {
        showArrows: false,
        arrowType: 'direction',
        arrowColor: 'auto'
      }
    }));

    // Cargar la primera página en el editor
    loadPage(0);
  }

  function loadPage(index) {
    if (index < 0 || index >= state.pages.length) return;
    state.activePageIndex = index;
    const page = state.pages[index];

    // Actualizar editor
    editor.loadPageData(page);

    // Sincronizar controles UI con la página
    syncUiWithEditor();
    renderPagesList();
    updateStatusInfo();
  }

  function syncUiWithEditor() {
    // Modo
    if (editor.mode === 'routes') {
      btnModeRoutes.classList.add('active');
      btnModeGrid.classList.remove('active');
      arrowSettingsBox.style.display = 'block';
      pixelToolsBox.style.display = 'none';
    } else {
      btnModeRoutes.classList.remove('active');
      btnModeGrid.classList.add('active');
      arrowSettingsBox.style.display = 'none';
      pixelToolsBox.style.display = 'block';
    }

    // Tamaño de cuadrícula
    selectGridSize.value = editor.gridSize;

    // Flechas
    toggleShowArrows.checked = editor.arrowOptions.showArrows;
    selectArrowType.value = editor.arrowOptions.arrowType;
    selectArrowColor.value = editor.arrowOptions.arrowColor;

    // Rotación de color
    toggleCycleColors.checked = editor.autoCyclePalette;
    if (selectColorRotationMode) {
      selectColorRotationMode.value = editor.colorRotationMode || 'sequence';
    }
    if (colorRotationOptions) {
      colorRotationOptions.style.display = editor.autoCyclePalette ? 'block' : 'none';
    }
  }

  function updateStatusInfo() {
    const page = state.pages[state.activePageIndex];
    if (!page) return;

    const count = page.mode === 'routes' ? page.steps.length : page.cells.length;
    const modeLabel = page.mode === 'routes' ? 'Rutas Lineales' : 'Cuadrícula / Pixel';
    statusInfo.textContent = `Página ${state.activePageIndex + 1} de ${state.pages.length} | Modo: ${modeLabel} | Cuadrados: ${count} | Cuadrícula: ${editor.gridSize}×${editor.gridSize}`;
  }

  // Renderizar lista de miniaturas de páginas
  function renderPagesList() {
    pagesListEl.innerHTML = '';
    state.pages.forEach((page, idx) => {
      const item = document.createElement('div');
      item.className = `page-thumbnail ${idx === state.activePageIndex ? 'active' : ''}`;
      item.innerHTML = `
        <div class="thumb-header">
          <span class="thumb-number">#${idx + 1}</span>
          <span class="thumb-title">${page.title || 'Página ' + (idx + 1)}</span>
        </div>
        <div class="thumb-canvas-wrap">
          <canvas class="thumb-mini-canvas" width="60" height="60"></canvas>
        </div>
      `;

      // Miniatura rápida
      const miniCanvas = item.querySelector('.thumb-mini-canvas');
      drawThumbnail(miniCanvas, page);

      item.addEventListener('click', () => {
        loadPage(idx);
      });

      pagesListEl.appendChild(item);
    });

    lblPageCount.textContent = `${state.pages.length} páginas`;
  }

  function drawThumbnail(miniCanvas, page) {
    const ctx = miniCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 60, 60);

    const items = page.mode === 'routes' ? page.steps : page.cells;
    if (!items || items.length === 0) return;

    const sz = page.gridSize || 10;
    const cellW = 60 / sz;

    items.forEach(it => {
      ctx.fillStyle = it.color || '#1F355C';
      ctx.fillRect(it.c * cellW, it.r * cellW, cellW, cellW);
    });
  }

  // Paleta de Colores
  function renderPalette() {
    paletteContainer.innerHTML = '';
    state.activePalette.forEach((hex, idx) => {
      const swatch = document.createElement('div');
      swatch.className = `palette-swatch ${hex.toLowerCase() === state.activeColor.toLowerCase() ? 'active' : ''}`;
      swatch.style.backgroundColor = hex;
      swatch.title = `Color ${idx + 1}: ${hex}`;

      // Botón para eliminar si hay más de 2 colores
      if (state.activePalette.length > 2) {
        const delBtn = document.createElement('button');
        delBtn.className = 'swatch-del';
        delBtn.innerHTML = '&times;';
        delBtn.title = 'Eliminar color';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.activePalette.splice(idx, 1);
          if (state.activeColor === hex) {
            state.activeColor = state.activePalette[0];
          }
          editor.setPalette(state.activePalette);
          editor.setActiveColor(state.activeColor);
          renderPalette();
        });
        swatch.appendChild(delBtn);
      }

      swatch.addEventListener('click', () => {
        state.activeColor = hex;
        editor.setActiveColor(hex);
        renderPalette();
      });

      paletteContainer.appendChild(swatch);
    });
  }

  // Event Listeners UI

  // Modos de trabajo
  btnModeRoutes.addEventListener('click', () => {
    editor.setMode('routes');
    syncUiWithEditor();
  });

  btnModeGrid.addEventListener('click', () => {
    editor.setMode('grid');
    syncUiWithEditor();
  });

  // Paletas predefinidas
  selectPalettePreset.addEventListener('change', (e) => {
    const key = e.target.value;
    if (PALETTE_PRESETS[key]) {
      state.activePaletteKey = key;
      state.activePalette = [...PALETTE_PRESETS[key].colors];
      state.activeColor = state.activePalette[0];
      editor.setPalette(state.activePalette);
      editor.setActiveColor(state.activeColor);
      renderPalette();
    }
  });

  // Agregar color personalizado
  btnAddCustomColor.addEventListener('click', () => {
    const newHex = inputCustomColor.value.toUpperCase();
    if (!state.activePalette.includes(newHex)) {
      state.activePalette.push(newHex);
      state.activeColor = newHex;
      editor.setPalette(state.activePalette);
      editor.setActiveColor(newHex);
      renderPalette();
    }
  });

  toggleCycleColors.addEventListener('change', (e) => {
    editor.autoCyclePalette = e.target.checked;
    if (colorRotationOptions) {
      colorRotationOptions.style.display = e.target.checked ? 'block' : 'none';
    }
  });

  if (selectColorRotationMode) {
    selectColorRotationMode.addEventListener('change', (e) => {
      editor.setColorRotationMode(e.target.value);
    });
  }

  // Tamaño de cuadrícula
  selectGridSize.addEventListener('change', (e) => {
    const newSize = parseInt(e.target.value, 10);
    editor.setGridSize(newSize);
  });

  toggleCanvasGrid.addEventListener('change', (e) => {
    editor.setShowGrid(e.target.checked);
  });

  // Flechas
  toggleShowArrows.addEventListener('change', (e) => {
    editor.setArrowOptions({ showArrows: e.target.checked });
  });

  selectArrowType.addEventListener('change', (e) => {
    editor.setArrowOptions({ arrowType: e.target.value });
  });

  selectArrowColor.addEventListener('change', (e) => {
    editor.setArrowOptions({ arrowColor: e.target.value });
  });

  // Herramientas Pixel
  btnToolBrush.addEventListener('click', () => {
    editor.tool = 'brush';
    btnToolBrush.classList.add('active');
    btnToolEraser.classList.remove('active');
    btnToolBucket.classList.remove('active');
  });

  btnToolEraser.addEventListener('click', () => {
    editor.tool = 'eraser';
    btnToolBrush.classList.remove('active');
    btnToolEraser.classList.add('active');
    btnToolBucket.classList.remove('active');
  });

  btnToolBucket.addEventListener('click', () => {
    editor.tool = 'bucket';
    btnToolBrush.classList.remove('active');
    btnToolEraser.classList.remove('active');
    btnToolBucket.classList.add('active');
  });

  // Presets del PDF de muestra
  selectPdfPreset.addEventListener('change', (e) => {
    const presetId = e.target.value;
    const found = PDF_SAMPLE_PATTERNS.find(p => p.id === presetId);
    if (found) {
      editor.loadPattern(found);
      if (state.pages[state.activePageIndex]) {
        state.pages[state.activePageIndex].title = found.name;
      }
      syncUiWithEditor();
      renderPagesList();
    }
    e.target.value = ''; // Reset select
  });

  // Presets de Pixel Art
  selectPixelPreset.addEventListener('change', (e) => {
    const presetId = e.target.value;
    const found = PIXEL_ART_PRESETS.find(p => p.id === presetId);
    if (found) {
      editor.loadPattern(found);
      if (state.pages[state.activePageIndex]) {
        state.pages[state.activePageIndex].title = found.name;
      }
      syncUiWithEditor();
      renderPagesList();
    }
    e.target.value = '';
  });

  // Generador de Rutas Aleatorias
  btnRandomRoute.addEventListener('click', () => {
    const steps = parseInt(inputRouteSteps.value, 10) || 12;
    const mode = editor.colorRotationMode || 'sequence';
    const newRoute = generateRandomRoute(editor.gridSize, steps, state.activePalette, false, mode);
    editor.loadPattern({
      gridSize: editor.gridSize,
      steps: newRoute
    });
    if (state.pages[state.activePageIndex]) {
      state.pages[state.activePageIndex].title = `Ruta aleatoria (${steps} pasos)`;
    }
    syncUiWithEditor();
    renderPagesList();
  });

  // Importar Imagen a Pixel Art
  inputImageFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const snapToPalette = toggleSnapPalette.checked;
      const targetSize = editor.gridSize;
      const pixelCells = await processImageToPixelGrid(
        file,
        targetSize,
        targetSize,
        state.activePalette,
        snapToPalette
      );

      editor.loadPattern({
        gridSize: targetSize,
        cells: pixelCells
      });
      if (state.pages[state.activePageIndex]) {
        state.pages[state.activePageIndex].title = `Imagen pixelada: ${file.name.slice(0, 15)}`;
      }
      syncUiWithEditor();
      renderPagesList();
    } catch (err) {
      alert('Error al procesar la imagen: ' + err.message);
    }
    inputImageFile.value = '';
  });

  // Botones de acción del lienzo
  btnUndo.addEventListener('click', () => editor.undo());
  btnRedo.addEventListener('click', () => editor.redo());
  btnClear.addEventListener('click', () => {
    if (confirm('¿Limpiar todo el diseño de la página actual?')) {
      editor.clear();
      renderPagesList();
    }
  });

  btnZoomIn.addEventListener('click', () => {
    editor.cellSize = Math.min(80, editor.cellSize + 6);
    editor.resizeCanvas();
    editor.render();
  });

  btnZoomOut.addEventListener('click', () => {
    editor.cellSize = Math.max(18, editor.cellSize - 6);
    editor.resizeCanvas();
    editor.render();
  });

  btnZoomReset.addEventListener('click', () => {
    editor.cellSize = 42;
    editor.resizeCanvas();
    editor.render();
  });

  // Gestión de Páginas
  btnAddPage.addEventListener('click', () => {
    const newPage = {
      title: `Página ${state.pages.length + 1}`,
      mode: editor.mode,
      gridSize: editor.gridSize,
      steps: [],
      cells: [],
      arrowOptions: { ...editor.arrowOptions }
    };
    state.pages.push(newPage);
    loadPage(state.pages.length - 1);
  });

  btnDuplicatePage.addEventListener('click', () => {
    const cur = state.pages[state.activePageIndex];
    if (!cur) return;
    const duplicated = JSON.parse(JSON.stringify(cur));
    duplicated.title = `${cur.title || 'Página'} (Copia)`;
    state.pages.splice(state.activePageIndex + 1, 0, duplicated);
    loadPage(state.activePageIndex + 1);
  });

  btnDeletePage.addEventListener('click', () => {
    if (state.pages.length <= 1) {
      alert('Debe haber al menos 1 página en el proyecto.');
      return;
    }
    if (confirm(`¿Eliminar la página ${state.activePageIndex + 1}?`)) {
      state.pages.splice(state.activePageIndex, 1);
      const nextIdx = Math.min(state.activePageIndex, state.pages.length - 1);
      loadPage(nextIdx);
    }
  });

  // Opciones de Configuración PDF
  function getActivePdfOptions() {
    return {
      format: selectPdfFormat.value,
      orientation: selectPdfOrientation.value,
      squareSizeSetting: selectSquareSize.value,
      showGrid: togglePdfGrid.checked,
      showPageNumbers: togglePdfPageNums.checked,
      centerPatternOnly: true
    };
  }

  // Exportar PDF Página Actual
  btnExportCurrentPdf.addEventListener('click', () => {
    const curPage = state.pages[state.activePageIndex];
    if (!curPage) return;

    try {
      const opts = getActivePdfOptions();
      const { doc } = window.patternPdfGenerator.generatePdf([curPage], opts);
      const fileName = `patron-cuadrados-p${state.activePageIndex + 1}.pdf`;
      doc.save(fileName);
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    }
  });

  // Exportar PDF Todas las Páginas (Cuadernillo completo)
  btnExportAllPdf.addEventListener('click', () => {
    if (state.pages.length === 0) return;

    try {
      const opts = getActivePdfOptions();
      const { doc } = window.patternPdfGenerator.generatePdf(state.pages, opts);
      const fileName = `cuadernillo-patrones-cuadrados.pdf`;
      doc.save(fileName);
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    }
  });

  // Vista Previa de PDF
  btnPreviewPdf.addEventListener('click', () => {
    try {
      const opts = getActivePdfOptions();
      const { blobUrl } = window.patternPdfGenerator.generatePdf(state.pages, opts);
      iframePreview.src = blobUrl;
      modalPreview.classList.add('visible');
    } catch (err) {
      alert('Error al generar vista previa: ' + err.message);
    }
  });

  btnCloseModal.addEventListener('click', () => {
    modalPreview.classList.remove('visible');
    iframePreview.src = 'about:blank';
  });

  // Imprimir Directamente
  btnDirectPrint.addEventListener('click', () => {
    // Si se desea imprimir nativamente, abrimos la vista previa o disparamos window.print
    window.print();
  });

  // Iniciar
  renderPalette();
  initDefaultPages();
});
