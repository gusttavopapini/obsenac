/**
 * storage.js – Camada de abstração sobre o localStorage.
 * Todas as leituras/gravações passam por aqui para centralizar
 * serialização/desserialização e evitar erros espalhados pelo código.
 */

const KEYS = {
  USERS:    'obsenac_users',
  PROJECTS: 'obsenac_projects',
  SESSION:  'obsenac_session',
};

/**
 * Lê e desserializa um item do localStorage.
 * @param {string} key
 * @param {*} defaultValue – Valor padrão caso a chave não exista.
 */
export function get(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error('[Storage] Erro ao ler:', key, e);
    return defaultValue;
  }
}

/**
 * Serializa e grava um item no localStorage.
 * @param {string} key
 * @param {*} value
 */
export function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('[Storage] Erro ao gravar:', key, e);
  }
}

/** Remove um item do localStorage. */
export function remove(key) {
  localStorage.removeItem(key);
}

// Exporta as chaves para uso externo
export { KEYS };
