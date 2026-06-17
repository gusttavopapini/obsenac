/**
 * projectService.js – CRUD de projetos e lógica de Match de habilidades no Firestore.
 */

import { db, collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, query, where } from './firebase.js';

// ── Utilitários ───────────────────────────────────────────────────────────────

/**
 * Mapeia código de status para rótulo amigável.
 */
export const STATUS_LABELS = {
  em_desenvolvimento: 'Em Desenvolvimento',
  em_continuidade:    'Em Continuidade',
  aguardando_equipe:  'Aguardando Equipe',
  concluido:          'Concluído',
  cancelado:          'Cancelado',
};

// ── Leitura ───────────────────────────────────────────────────────────────────

/** Retorna todos os projetos. */
export async function getAllProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    return projects;
  } catch (e) {
    console.error('[ProjectService] Erro ao buscar todos os projetos:', e);
    return [];
  }
}

/** Busca projeto por ID. */
export async function getProjectById(id) {
  try {
    const docRef = doc(db, 'projects', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    console.error('[ProjectService] Erro ao buscar projeto por ID:', e);
    return null;
  }
}

/** Retorna projetos de um aluno específico. */
export async function getProjectsByOwner(userId) {
  try {
    const q = query(collection(db, 'projects'), where('ownerId', '==', userId));
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    return projects;
  } catch (e) {
    console.error('[ProjectService] Erro ao buscar projetos do proprietário:', e);
    return [];
  }
}

/** Retorna projetos orientados por um professor. */
export async function getProjectsByAdvisor(advisorId) {
  try {
    const q = query(collection(db, 'projects'), where('advisorId', '==', advisorId));
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    return projects;
  } catch (e) {
    console.error('[ProjectService] Erro ao buscar projetos orientados pelo professor:', e);
    return [];
  }
}

/**
 * SISTEMA DE MATCH – Filtra projetos que buscam habilidades do aluno.
 * A pontuação de match é calculada pelo número de habilidades em comum
 * entre as skills do projeto e as skills do aluno.
 *
 * @param {string[]} userSkills – Habilidades do aluno logado.
 * @param {string}   excludeOwnerId – Exclui projetos do próprio aluno.
 * @returns {Array<{ project, matchCount, matchSkills }>} ordenado por matchCount desc.
 */
export async function getMatchingProjects(userSkills, excludeOwnerId) {
  if (!userSkills || userSkills.length === 0) return [];
  try {
    const allProjects = await getAllProjects();
    const projects = allProjects.filter(
      p => p.ownerId !== excludeOwnerId && p.status !== 'concluido' && p.status !== 'cancelado'
    );

    const normalizeSkill = s => s.trim().toLowerCase();
    const normalizedUserSkills = userSkills.map(normalizeSkill);

    return projects
      .map(project => {
        const matchSkills = (project.skills || []).filter(sk =>
          normalizedUserSkills.includes(normalizeSkill(sk))
        );
        return { project, matchCount: matchSkills.length, matchSkills };
      })
      .filter(item => item.matchCount > 0)           // só retorna se houver pelo menos 1 match
      .sort((a, b) => b.matchCount - a.matchCount);  // maior match primeiro
  } catch (e) {
    console.error('[ProjectService] Erro no match de habilidades:', e);
    return [];
  }
}

// ── Escrita ───────────────────────────────────────────────────────────────────

/**
 * Cria um novo projeto.
 * @param {{ title, objective, status, skills, ownerId, advisorId?, semester }} data
 */
export async function createProject(data) {
  try {
    const id = `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const newProject = {
      id,
      title:      data.title.trim(),
      objective:  data.objective.trim(),
      status:     data.status || 'em_desenvolvimento',
      skills:     data.skills || [],
      ownerId:    data.ownerId,
      advisorId:  data.advisorId || null,
      members:    [data.ownerId],
      semester:   data.semester || currentSemester(),
      createdAt:  now,
      history: [
        {
          date:     now,
          event:    'Projeto criado',
          desc:     `Projeto registrado na plataforma no semestre ${data.semester || currentSemester()}.`,
          authorId: data.ownerId,
        },
      ],
    };
    await setDoc(doc(db, 'projects', id), newProject);
    return newProject;
  } catch (e) {
    console.error('[ProjectService] Erro ao criar projeto:', e);
    return null;
  }
}

/**
 * Atualiza campos de um projeto existente.
 * @param {string} projectId
 * @param {object} updates – Campos parciais a atualizar.
 * @param {{ event, desc, authorId }} historyEntry – Entrada de histórico (opcional).
 */
export async function updateProject(projectId, updates, historyEntry = null) {
  try {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    const project = docSnap.data();

    const newFields = { ...updates };
    if (historyEntry) {
      newFields.history = [
        ...(project.history || []),
        { date: new Date().toISOString(), ...historyEntry },
      ];
    }
    await updateDoc(docRef, newFields);
    return true;
  } catch (e) {
    console.error('[ProjectService] Erro ao atualizar projeto:', e);
    return false;
  }
}

/**
 * Professor valida a continuidade de um projeto.
 * Muda o status para 'em_continuidade' e registra no histórico.
 * @param {string} projectId
 * @param {string} professorId
 * @param {string} professorName
 */
export async function validateContinuity(projectId, professorId, professorName) {
  return await updateProject(
    projectId,
    { status: 'em_continuidade' },
    {
      event:    'Continuidade validada pelo professor',
      desc:     `${professorName} validou o progresso e aprovou a continuidade para o próximo semestre.`,
      authorId: professorId,
    }
  );
}

/** Deleta um projeto. */
export async function deleteProject(projectId) {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return true;
  } catch (e) {
    console.error('[ProjectService] Erro ao excluir projeto:', e);
    return false;
  }
}

// ── Métricas ──────────────────────────────────────────────────────────────────

/**
 * Retorna métricas agregadas para o painel administrativo.
 */
export async function getMetrics() {
  try {
    const projects = await getAllProjects();
    return {
      total:             projects.length,
      emDesenvolvimento: projects.filter(p => p.status === 'em_desenvolvimento').length,
      emContinuidade:    projects.filter(p => p.status === 'em_continuidade').length,
      concluidos:        projects.filter(p => p.status === 'concluido').length,
      cancelados:        projects.filter(p => p.status === 'cancelado').length,
      aguardandoEquipe:  projects.filter(p => p.status === 'aguardando_equipe').length,
    };
  } catch (e) {
    console.error('[ProjectService] Erro ao obter métricas:', e);
    return {
      total: 0,
      emDesenvolvimento: 0,
      emContinuidade: 0,
      concluidos: 0,
      cancelados: 0,
      aguardandoEquipe: 0,
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna o semestre atual no formato "AAAA.N". */
function currentSemester() {
  const now   = new Date();
  const year  = now.getFullYear();
  const sem   = now.getMonth() < 6 ? 1 : 2;
  return `${year}.${sem}`;
}

