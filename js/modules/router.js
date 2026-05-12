/**
 * router.js – Gerenciador de rotas da SPA.
 * Troca de "telas" sem recarregar a página via hash (#).
 */

const _routes = new Map();
let _currentRoute = null;
let _beforeEach   = null;

/**
 * Registra uma rota.
 * @param {string}   path    – Hash sem '#' (ex: 'login', 'dashboard').
 * @param {Function} handler – Função que renderiza a view.
 */
export function route(path, handler) {
  _routes.set(path, handler);
}

/**
 * Guard de navegação: chamado antes de cada troca de rota.
 * @param {Function} fn – (to, from) => boolean | string.
 *   Retornar false cancela a navegação.
 *   Retornar uma string redireciona para aquela rota.
 */
export function beforeEach(fn) {
  _beforeEach = fn;
}

/**
 * Navega para uma rota.
 * @param {string} path
 * @param {object} params – Parâmetros opcionais passados ao handler.
 */
export function navigate(path, params = {}) {
  if (_beforeEach) {
    const result = _beforeEach(path, _currentRoute, params);
    if (result === false) return;
    if (typeof result === 'string') { navigate(result, params); return; }
  }

  const handler = _routes.get(path);
  if (!handler) {
    console.warn('[Router] Rota não encontrada:', path);
    navigate('landing');
    return;
  }

  _currentRoute = path;
  window.location.hash = path;

  // Scroll para o topo ao trocar de view
  window.scrollTo({ top: 0, behavior: 'instant' });

  handler(params);
}

/** Retorna a rota atual. */
export function currentRoute() { return _currentRoute; }

/**
 * Inicializa o router: resolve a rota do hash atual ou vai para 'landing'.
 */
export function initRouter() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    navigate(hash);
  });

  // Rota inicial
  const initial = window.location.hash.replace('#', '') || 'landing';
  navigate(initial);
}
