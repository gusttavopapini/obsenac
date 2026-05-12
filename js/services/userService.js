/**
 * userService.js – CRUD de usuários.
 * Gerencia aprovações, bloqueios e atualização de perfil.
 */

import { get, set, KEYS } from './storage.js';

/** Retorna todos os usuários (sem senha). */
export function getAllUsers() {
  return get(KEYS.USERS, []).map(({ password: _pw, ...u }) => u);
}

/** Busca um usuário por ID (sem senha). */
export function getUserById(id) {
  const u = get(KEYS.USERS, []).find(u => u.id === id);
  if (!u) return null;
  const { password: _pw, ...safe } = u;
  return safe;
}

/**
 * Altera o status de um usuário.
 * @param {string} userId
 * @param {'approved'|'blocked'|'pending'} status
 */
export function setUserStatus(userId, status) {
  const users = get(KEYS.USERS, []);
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  users[idx].status = status;
  set(KEYS.USERS, users);
  return true;
}

/**
 * Atualiza o perfil do usuário logado (nome e habilidades).
 * @param {string} userId
 * @param {{ name?: string, skills?: string[] }} data
 */
export function updateProfile(userId, data) {
  const users = get(KEYS.USERS, []);
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return false;
  if (data.name)   users[idx].name   = data.name.trim();
  if (data.skills) users[idx].skills = data.skills;
  set(KEYS.USERS, users);
  return true;
}

/**
 * Cria um usuário diretamente como aprovado pelo Admin.
 */
export function createUserByAdmin(data) {
  const users = get(KEYS.USERS, []);
  if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: 'Este e-mail já está cadastrado.' };
  }
  const newUser = {
    id:        `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name:      data.name.trim(),
    email:     data.email.toLowerCase().trim(),
    password:  data.password,
    role:      data.role,
    status:    'approved',
    skills:    data.skills || [],
    createdAt: new Date().toISOString(),
  };
  set(KEYS.USERS, [...users, newUser]);
  return { success: true };
}
