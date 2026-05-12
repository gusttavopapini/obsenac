/**
 * auth.js – Serviço de autenticação e gerenciamento de sessão.
 * Lida com login, cadastro, logout e recuperação do usuário logado.
 */

import { get, set, remove, KEYS } from './storage.js';

// ── Constantes ────────────────────────────────────────────────────────────────
/** Domínios de e-mail institucionais aceitos */
const INSTITUTIONAL_DOMAINS = ['@instituicao.edu.br', '@aluno.edu.br', '@prof.edu.br'];

// ── Utilitários ───────────────────────────────────────────────────────────────

/** Valida se o e-mail é de domínio institucional. */
export function isInstitutionalEmail(email) {
  return INSTITUTIONAL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
}

/** Gera um ID único simples baseado em timestamp + random. */
function generateId() {
  return `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

/**
 * Realiza o login do usuário.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function login(email, password) {
  const users = get(KEYS.USERS, []);
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user)              return { success: false, error: 'E-mail não encontrado.' };
  if (user.password !== password) return { success: false, error: 'Senha incorreta.' };
  if (user.status === 'pending')  return { success: false, error: 'pending' };
  if (user.status === 'blocked')  return { success: false, error: 'Sua conta foi bloqueada. Entre em contato com a coordenação.' };

  // Salva sessão (sem a senha)
  const { password: _pw, ...safeUser } = user;
  set(KEYS.SESSION, safeUser);
  return { success: true, user: safeUser };
}

/**
 * Registra um novo usuário.
 * @param {{ name, email, password, role, skills? }} data
 * @returns {{ success: boolean, error?: string }}
 */
export function register(data) {
  if (!isInstitutionalEmail(data.email)) {
    return { success: false, error: `Use um e-mail institucional. Domínios aceitos: ${INSTITUTIONAL_DOMAINS.join(', ')}` };
  }

  const users = get(KEYS.USERS, []);
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: 'Este e-mail já está cadastrado.' };
  }

  const newUser = {
    id:        generateId(),
    name:      data.name.trim(),
    email:     data.email.toLowerCase().trim(),
    password:  data.password,
    role:      data.role || 'aluno',
    status:    'pending',   // aguarda aprovação do coordenador
    skills:    data.skills || [],
    createdAt: new Date().toISOString(),
  };

  set(KEYS.USERS, [...users, newUser]);
  return { success: true };
}

/**
 * Retorna o usuário logado (sem senha), ou null se não há sessão.
 */
export function getSession() {
  return get(KEYS.SESSION, null);
}

/** Remove a sessão atual (logout). */
export function logout() {
  remove(KEYS.SESSION);
}
