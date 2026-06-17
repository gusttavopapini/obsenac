/**
 * userService.js – CRUD de usuários no Firebase Firestore.
 */

import { db, collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, query, where } from './firebase.js';

/** Retorna todos os usuários (sem senha). */
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      const u = doc.data();
      const { password: _pw, ...safe } = u;
      users.push(safe);
    });
    return users;
  } catch (e) {
    console.error('[UserService] Erro ao obter todos os usuários:', e);
    return [];
  }
}

/** Busca um usuário por ID (sem senha). */
export async function getUserById(id) {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const { password: _pw, ...safe } = docSnap.data();
    return safe;
  } catch (e) {
    console.error('[UserService] Erro ao obter usuário:', e);
    return null;
  }
}

/**
 * Altera o status de um usuário.
 * @param {string} userId
 * @param {'approved'|'blocked'|'pending'} status
 */
export async function setUserStatus(userId, status) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { status });
    return true;
  } catch (e) {
    console.error('[UserService] Erro ao alterar status do usuário:', e);
    return false;
  }
}

/**
 * Atualiza o perfil do usuário logado (nome e habilidades).
 * @param {string} userId
 * @param {{ name?: string, skills?: string[] }} data
 */
export async function updateProfile(userId, data) {
  try {
    const docRef = doc(db, 'users', userId);
    const updates = {};
    if (data.name)   updates.name   = data.name.trim();
    if (data.skills) updates.skills = data.skills;
    await updateDoc(docRef, updates);
    return true;
  } catch (e) {
    console.error('[UserService] Erro ao atualizar perfil:', e);
    return false;
  }
}

/**
 * Cria um usuário diretamente como aprovado pelo Admin.
 */
export async function createUserByAdmin(data) {
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
      role:      data.role,
      status:    'approved',
      skills:    data.skills || [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', id), newUser);
    return { success: true };
  } catch (e) {
    console.error('[UserService] Erro ao criar usuário:', e);
    return { success: false, error: 'Erro de conexão com o banco de dados.' };
  }
}

/**
 * Exclui um usuário.
 */
export async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (e) {
    console.error('[UserService] Erro ao deletar usuário:', e);
    return false;
  }
}

/**
 * Atualiza um usuário por completo (Admin).
 */
export async function updateUserByAdmin(userId, data) {
  try {
    const docRef = doc(db, 'users', userId);
    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.email !== undefined) updates.email = data.email.toLowerCase().trim();
    if (data.role !== undefined) updates.role = data.role;
    if (data.status !== undefined) updates.status = data.status;
    if (data.password !== undefined && data.password.trim() !== '') updates.password = data.password;
    if (data.skills !== undefined) updates.skills = data.skills;
    await updateDoc(docRef, updates);
    return true;
  } catch (e) {
    console.error('[UserService] Erro ao atualizar usuário pelo Admin:', e);
    return false;
  }
}

