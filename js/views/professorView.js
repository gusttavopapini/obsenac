/**
 * professorView.js – Dashboard do Professor.
 * Funcionalidades: lista de equipes orientadas, validação de continuidade, acompanhamento.
 */

import { navigate }        from '../modules/router.js';
import { showToast, escapeHtml, formatDate, getInitials } from '../modules/ui.js';
import { getSession, logout } from '../services/auth.js';
import { getAllUsers }      from '../services/userService.js';
import {
  getProjectsByAdvisor, validateContinuity,
  STATUS_LABELS, getAllProjects,
} from '../services/projectService.js';

let _user = null;

export function renderProfessor() {
  _user = getSession();
  if (!_user) { navigate('login'); return; }

  setupNavbar();
  renderTeams();
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.classList.remove('hidden');
  document.getElementById('nav-username').textContent = _user.name.split(' ')[0];
  document.getElementById('nav-avatar').textContent   = getInitials(_user.name);

  document.getElementById('nav-links').innerHTML = `
    <li><button class="nav-link active" id="nl-teams" data-view="teams"><span class="nav-link-icon"></span> Minhas Equipes</button></li>
    <li><button class="nav-link" id="nl-all-projects" data-view="all"><span class="nav-link-icon"></span> Todos os Projetos</button></li>
  `;

  document.getElementById('nl-teams')?.addEventListener('click', () => renderTeams());
  document.getElementById('nl-all-projects')?.addEventListener('click', () => renderAllProjects());
  document.getElementById('logout-btn')?.addEventListener('click', () => { logout(); navigate('login'); });
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
  });
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ── TELA: Minhas Equipes ──────────────────────────────────────────────────────
function renderTeams() {
  setActiveNav('nl-teams');
  const myProjects = getProjectsByAdvisor(_user.id);
  const users      = getAllUsers();

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="welcome-banner animate-fadeInDown">
          <div class="welcome-greeting">Bem-vindo(a),</div>
          <div class="welcome-name">${escapeHtml(_user.name)}</div>
          <span class="welcome-role">Professor Orientador</span>
        </div>

        <div class="stats-row">
          ${statCard('', myProjects.length, 'Equipes orientadas', 'stat-icon-navy')}
          ${statCard('', myProjects.filter(p => p.status === 'em_desenvolvimento').length, 'Em desenvolvimento', 'stat-icon-success')}
          ${statCard('', myProjects.filter(p => p.status === 'em_continuidade').length, 'Em continuidade', 'stat-icon-orange')}
          ${statCard('', myProjects.filter(p => p.status === 'concluido').length, 'Concluídos', 'stat-icon-success')}
        </div>

        <div class="projects-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Minhas Equipes</h2>
              <p class="section-subtitle">Projetos que você orienta e acompanha</p>
            </div>
          </div>

          ${myProjects.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon"></div>
              <div class="empty-state-title">Nenhuma equipe vinculada</div>
              <p class="empty-state-desc">Quando um aluno cadastrar um projeto com você como orientador, ele aparecerá aqui.</p>
            </div>
          ` : `
            <div class="teams-list">
              ${myProjects.map(p => teamItemHTML(p, users)).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  bindTeamActions();
}

function teamItemHTML(project, users) {
  const memberNames = (project.members || [])
    .map(mid => { const u = users.find(x => x.id === mid); return u ? u.name : mid; })
    .join(', ');

  const canValidate = project.status === 'em_desenvolvimento';

  return `
    <div class="team-item animate-fadeInUp">
      <div class="avatar avatar-lg" style="background:linear-gradient(135deg,var(--navy-500),var(--navy-300))">
        ${getInitials(project.title)}
      </div>
      <div class="team-info">
        <div class="team-project-name">${escapeHtml(project.title)}</div>
        <div class="team-members">${escapeHtml(memberNames)}</div>
        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap;align-items:center">
          ${statusBadge(project.status)}
          <span class="badge badge-gray">${escapeHtml(project.semester || '–')}</span>
        </div>
      </div>
      <div class="team-actions">
        <button class="btn btn-outline btn-sm btn-view-project" data-id="${project.id}">Ver detalhes</button>
        ${canValidate
          ? `<button class="btn btn-success btn-sm btn-validate" data-id="${project.id}" data-title="${escapeHtml(project.title)}">Validar Continuidade</button>`
          : ''}
      </div>
    </div>
  `;
}

function bindTeamActions() {
  document.querySelectorAll('.btn-view-project').forEach(btn => {
    btn.addEventListener('click', () => navigate('project', { id: btn.dataset.id }));
  });
  document.querySelectorAll('.btn-validate').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = confirm(`Confirma a validação de continuidade do projeto "${btn.dataset.title}"?`);
      if (!ok) return;
      validateContinuity(btn.dataset.id, _user.id, _user.name);
      showToast('Continuidade validada!', `O projeto "${btn.dataset.title}" foi aprovado para o próximo semestre.`, 'success');
      renderTeams();
    });
  });
}

// ── TELA: Todos os Projetos ───────────────────────────────────────────────────
function renderAllProjects() {
  setActiveNav('nl-all-projects');
  const allProjects = getAllProjects();
  const users       = getAllUsers();

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="section-header">
          <div>
            <h2 class="section-title">Todos os Projetos</h2>
            <p class="section-subtitle">Visão geral de todos os projetos cadastrados</p>
          </div>
        </div>

        <div class="card">
          <div class="table-wrapper">
            <table class="table" id="all-projects-table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Responsável</th>
                  <th>Status</th>
                  <th>Semestre</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${allProjects.map(p => {
                  const owner = users.find(u => u.id === p.ownerId);
                  return `
                    <tr class="animate-fadeInUp">
                      <td><strong>${escapeHtml(p.title)}</strong></td>
                      <td>${owner ? escapeHtml(owner.name) : '–'}</td>
                      <td>${statusBadge(p.status)}</td>
                      <td>${escapeHtml(p.semester || '–')}</td>
                      <td><button class="btn btn-outline btn-sm btn-view-project" data-id="${p.id}">Ver</button></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.btn-view-project').forEach(btn => {
    btn.addEventListener('click', () => navigate('project', { id: btn.dataset.id }));
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statCard(icon, value, label, iconClass) {
  return `
    <div class="stat-card animate-fadeInUp">
      <div class="stat-icon ${iconClass}">${icon}</div>
      <div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
    </div>
  `;
}

function statusBadge(status) {
  const map = {
    em_desenvolvimento: 'badge-success',
    em_continuidade:    'badge-navy',
    aguardando_equipe:  'badge-warning',
    concluido:          'badge-gray',
    cancelado:          'badge-error',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${STATUS_LABELS[status] || status}</span>`;
}
