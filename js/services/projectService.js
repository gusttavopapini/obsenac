/**
 * projectService.js – CRUD de projetos e lógica de Match de habilidades.
 * Todas as operações de projetos passam por este serviço.
 */

import { get, set, KEYS } from './storage.js';

// ── Utilitários ───────────────────────────────────────────────────────────────

function generateId() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

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
export function getAllProjects() {
  return get(KEYS.PROJECTS, []);
}

/** Busca projeto por ID. */
export function getProjectById(id) {
  return getAllProjects().find(p => p.id === id) || null;
}

/** Retorna projetos de um aluno específico. */
export function getProjectsByOwner(userId) {
  return getAllProjects().filter(p => p.ownerId === userId);
}

/** Retorna projetos orientados por um professor. */
export function getProjectsByAdvisor(advisorId) {
  return getAllProjects().filter(p => p.advisorId === advisorId);
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
export function getMatchingProjects(userSkills, excludeOwnerId) {
  if (!userSkills || userSkills.length === 0) return [];

  const projects = getAllProjects().filter(
    p => p.ownerId !== excludeOwnerId && p.status !== 'concluido' && p.status !== 'cancelado'
  );

  const normalizeSkill = s => s.trim().toLowerCase();
  const normalizedUserSkills = userSkills.map(normalizeSkill);

  return projects
    .map(project => {
      const projectNorm = (project.skills || []).map(normalizeSkill);
      // Habilidades em comum (interseção)
      const matchSkills = project.skills.filter(sk =>
        normalizedUserSkills.includes(normalizeSkill(sk))
      );
      return { project, matchCount: matchSkills.length, matchSkills };
    })
    .filter(item => item.matchCount > 0)           // só retorna se houver pelo menos 1 match
    .sort((a, b) => b.matchCount - a.matchCount);  // maior match primeiro
}

// ── Escrita ───────────────────────────────────────────────────────────────────

/**
 * Cria um novo projeto.
 * @param {{ title, objective, status, skills, ownerId, advisorId?, semester }} data
 */
export function createProject(data) {
  const projects = getAllProjects();
  const now      = new Date().toISOString();
  const newProject = {
    id:         generateId(),
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
  set(KEYS.PROJECTS, [...projects, newProject]);
  return newProject;
}

/**
 * Atualiza campos de um projeto existente.
 * @param {string} projectId
 * @param {object} updates – Campos parciais a atualizar.
 * @param {{ event, desc, authorId }} historyEntry – Entrada de histórico (opcional).
 */
export function updateProject(projectId, updates, historyEntry = null) {
  const projects = getAllProjects();
  const idx      = projects.findIndex(p => p.id === projectId);
  if (idx === -1) return false;

  projects[idx] = { ...projects[idx], ...updates };

  if (historyEntry) {
    projects[idx].history = [
      ...projects[idx].history,
      { date: new Date().toISOString(), ...historyEntry },
    ];
  }
  set(KEYS.PROJECTS, projects);
  return true;
}

/**
 * Professor valida a continuidade de um projeto.
 * Muda o status para 'em_continuidade' e registra no histórico.
 * @param {string} projectId
 * @param {string} professorId
 * @param {string} professorName
 */
export function validateContinuity(projectId, professorId, professorName) {
  return updateProject(
    projectId,
    { status: 'em_continuidade' },
    {
      event:    'Continuidade validada pelo professor',
      desc:     `${professorName} validou o progresso e aprovou a continuidade para o próximo semestre.`,
      authorId: professorId,
    }
  );
}

/** Deleta um projeto (somente se o ownerId for o usuário logado ou coordenador). */
export function deleteProject(projectId) {
  const projects = getAllProjects().filter(p => p.id !== projectId);
  set(KEYS.PROJECTS, projects);
}

// ── Métricas ──────────────────────────────────────────────────────────────────

/**
 * Retorna métricas agregadas para o painel administrativo.
 */
export function getMetrics() {
  const projects = getAllProjects();
  return {
    total:           projects.length,
    emDesenvolvimento: projects.filter(p => p.status === 'em_desenvolvimento').length,
    emContinuidade:    projects.filter(p => p.status === 'em_continuidade').length,
    concluidos:        projects.filter(p => p.status === 'concluido').length,
    cancelados:        projects.filter(p => p.status === 'cancelado').length,
    aguardandoEquipe:  projects.filter(p => p.status === 'aguardando_equipe').length,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna o semestre atual no formato "AAAA.N". */
function currentSemester() {
  const now   = new Date();
  const year  = now.getFullYear();
  const sem   = now.getMonth() < 6 ? 1 : 2;
  return `${year}.${sem}`;
}
