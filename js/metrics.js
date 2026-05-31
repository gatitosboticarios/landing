/* ============================================
   Universo Gatitos Boticarios — Metrics Module
   ============================================
   Almacena métricas locales en localStorage:
   - Visitas (fecha + timestamp)
   - Formularios enviados (contador)
   - Descargas por archivo (contador por nombre)
   ============================================ */

const Metrics = {
  KEY: 'ugb_metrics',

  /**
   * Obtiene todos los datos de métricas almacenados.
   * @returns {{ visits: Array, forms_sent: number, downloads: Object }}
   */
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || this._defaults();
    } catch { return this._defaults(); }
  },

  /** Estructura inicial si no hay datos */
  _defaults() {
    return {
      visits: [],
      forms_sent: 0,
      downloads: {}
    };
  },

  /** Guarda el objeto de métricas en localStorage */
  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('[Metrics] No se pudo guardar en localStorage:', err);
    }
  },

  /** Registra una visita con la fecha de hoy */
  trackVisit() {
    const data = this.getAll();
    const today = new Date().toISOString().slice(0, 10);
    data.visits.push({ date: today, ts: Date.now() });
    // Conservar solo las últimas 1000 visitas para no llenar localStorage
    if (data.visits.length > 1000) data.visits = data.visits.slice(-1000);
    this.save(data);
    console.log('[Metrics] Visita registrada:', today);
  },

  /** Incrementa el contador de formularios enviados */
  trackFormSubmission() {
    const data = this.getAll();
    data.forms_sent = (data.forms_sent || 0) + 1;
    this.save(data);
    console.log('[Metrics] Formulario registrado. Total:', data.forms_sent);
  },

  /**
   * Incrementa el contador de descargas para un archivo específico.
   * @param {string} filename — Ruta o nombre del archivo descargado
   */
  trackDownload(filename) {
    const data = this.getAll();
    if (!data.downloads) data.downloads = {};
    data.downloads[filename] = (data.downloads[filename] || 0) + 1;
    this.save(data);
    console.log('[Metrics] Descarga registrada:', filename);
  }
};

// Registrar visita al cargar el módulo
Metrics.trackVisit();

// Exponer trackDL globalmente para los onclick inline del HTML dinámico
window.trackDL = function (filename) {
  Metrics.trackDownload(filename);
};
