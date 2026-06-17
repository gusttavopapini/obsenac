/**
 * auth.js – Serviço de autenticação e gerenciamento de sessão no Firestore.
 */

import { db, collection, getDocs, doc, setDoc, query, where } from './firebase.js';
import { get, set, remove, KEYS } from './storage.js';

// ── Constantes ────────────────────────────────────────────────────────────────
/** Domínios de e-mail institucionais aceitos */
const INSTITUTIONAL_DOMAINS = ['@instituicao.edu.br', '@aluno.edu.br', '@prof.edu.br'];

// ── Utilitários ───────────────────────────────────────────────────────────────

/** Valida se o e-mail é de domínio institucional. */
export function isInstitutionalEmail(email) {
  return INSTITUTIONAL_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
}

// ── Auth API ──────────────────────────────────────────────────────────────────

/**
 * Realiza o login do usuário.
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export async function login(email, password) {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return { success: false, error: 'E-mail não encontrado.' };
    }

    let user = null;
    querySnapshot.forEach((doc) => {
      user = doc.data();
    });

    if (user.password !== password) return { success: false, error: 'Senha incorreta.' };
    if (user.status === 'pending')  return { success: false, error: 'pending' };
    if (user.status === 'blocked')  return { success: false, error: 'Sua conta foi bloqueada. Entre em contato com a coordenação.' };

    // Salva sessão (sem a senha)
    const { password: _pw, ...safeUser } = user;
    set(KEYS.SESSION, safeUser);
    return { success: true, user: safeUser };
  } catch (e) {
    console.error('[Auth] Erro ao fazer login:', e);
    return { success: false, error: 'Erro de conexão com o banco de dados.' };
  }
}

/**
 * Registra um novo usuário.
 * @param {{ name, email, password, role, skills? }} data
 * @returns {{ success: boolean, error?: string }}
 */
export async function register(data) {
  if (!isInstitutionalEmail(data.email)) {
    return { success: false, error: `Use um e-mail institucional. Domínios aceitos: ${INSTITUTIONAL_DOMAINS.join(', ')}` };
  }

  try {
    const q = query(collection(db, 'users'), where('email', '==', data.email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    const id = `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const newUser = {
      id,
      name:      data.name.trim(),
      email:     data.email.toLowerCase().trim(),
      password:  data.password,
      role:      data.role || 'aluno',
      status:    'pending',   // aguarda aprovação do coordenador
      skills:    data.skills || [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', id), newUser);
    return { success: true };
  } catch (e) {
    console.error('[Auth] Erro ao registrar:', e);
    return { success: false, error: 'Erro ao registrar usuário no banco de dados.' };
  }
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
  localStorage.removeItem('obsenac_is_demo');
}
