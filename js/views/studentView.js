/**
 * studentView.js – Dashboard do Aluno.
 * Funcionalidades: perfil, meus projetos, criar projeto, sistema de match.
 */

import { navigate }         from '../modules/router.js';
import { showToast, openModal, closeModal, initTagsInput, escapeHtml, formatDate, getInitials } from '../modules/ui.js';
import { getSession }       from '../services/auth.js';
import { updateProfile }    from '../services/userService.js';
import { getAllUsers }       from '../services/userService.js';
import {
  getAllProjects, getProjectsByOwner, getMatchingProjects,
  createProject, STATUS_LABELS,
} from '../services/projectService.js';
import { set, KEYS, get }   from '../services/storage.js';

let _user = null;

// ── Entrada principal ─────────────────────────────────────────────────────────
export function renderStudent() {
  _user = getSession();
  if (!_user) { navigate('login'); return; }

  setupNavbar();
  renderMyProjects(); // aba padrão
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.classList.remove('hidden');
  document.getElementById('nav-username').textContent = _user.name.split(' ')[0];
  document.getElementById('nav-avatar').textContent   = getInitials(_user.name);

  document.getElementById('nav-links').innerHTML = `
    <li><button class="nav-link" id="nl-projects" data-view="projects"><span class="nav-link-icon">📂</span> Meus Projetos</button></li>
    <li><button class="nav-link" id="nl-match"    data-view="match">   <span class="nav-link-icon">🎯</span> Match</button></li>
    <li><button class="nav-link" id="nl-profile"  data-view="profile"> <span class="nav-link-icon">👤</span> Meu Perfil</button></li>
  `;

  document.getElementById('nl-projects')?.addEventListener('click', () => renderMyProjects());
  document.getElementById('nl-match')?.addEventListener('click',    () => renderMatch());
  document.getElementById('nl-profile')?.addEventListener('click',  () => renderProfile());
  document.getElementById('logout-btn')?.addEventListener('click',  () => { import('../services/auth.js').then(m => { m.logout(); navigate('login'); }); });
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
  });
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ── TELA: Meus Projetos ───────────────────────────────────────────────────────
function renderMyProjects() {
  setActiveNav('nl-projects');
  const myProjects = getProjectsByOwner(_user.id);

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <!-- Banner de boas-vindas -->
        <div class="welcome-banner animate-fadeInDown">
          <div class="welcome-greeting">Olá,</div>
          <div class="welcome-name">${escapeHtml(_user.name)} 👋</div>
          <span class="welcome-role">🧑‍💻 ${_user.role === 'aluno' ? 'Aluno' : _user.role}</span>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          ${statCard('📂', myProjects.length, 'Projetos criados', 'stat-icon-navy')}
          ${statCard('🟢', myProjects.filter(p => p.status === 'em_desenvolvimento').length, 'Em desenvolvimento', 'stat-icon-success')}
          ${statCard('🔄', myProjects.filter(p => p.status === 'em_continuidade').length, 'Em continuidade', 'stat-icon-navy')}
          ${statCard('✅', myProjects.filter(p => p.status === 'concluido').length, 'Concluídos', 'stat-icon-orange')}
        </div>

        <!-- Seção de projetos -->
        <div class="projects-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Meus Projetos</h2>
              <p class="section-subtitle">Projetos que você criou e lidera</p>
            </div>
            <button class="btn btn-accent" id="btn-new-project">+ Novo Projeto</button>
          </div>
          <div class="projects-grid" id="my-projects-grid">
            ${myProjects.length
              ? myProjects.map(p => projectCardHTML(p)).join('')
              : `<div class="empty-state" style="grid-column:1/-1">
                   <div class="empty-state-icon">📂</div>
                   <div class="empty-state-title">Nenhum projeto ainda</div>
                   <p class="empty-state-desc">Crie seu primeiro projeto e comece a construir algo incrível!</p>
                 </div>`}
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-new-project')?.addEventListener('click', openCreateProjectModal);

  // Botões nos cards
  document.querySelectorAll('.btn-view-project').forEach(btn => {
    btn.addEventListener('click', () => navigate('project', { id: btn.dataset.id }));
  });
}

// ── TELA: Match ───────────────────────────────────────────────────────────────
function renderMatch() {
  setActiveNav('nl-match');

  // Busca sessão atualizada (para pegar skills atualizadas)
  const users   = getAllUsers();
  const fullUser = users.find(u => u.id === _user.id);
  const skills  = fullUser?.skills || _user.skills || [];
  const matches = getMatchingProjects(skills, _user.id);

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="section-header">
          <div>
            <h2 class="section-title">🎯 Match de Habilidades</h2>
            <p class="section-subtitle">Projetos que buscam suas habilidades: <strong>${skills.join(', ') || 'nenhuma cadastrada'}</strong></p>
          </div>
        </div>

        ${skills.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎯</div>
            <div class="empty-state-title">Cadastre suas habilidades</div>
            <p class="empty-state-desc">Vá até <strong>Meu Perfil</strong> e adicione suas skills para receber sugestões de projetos compatíveis.</p>
            <button class="btn btn-primary" id="go-to-profile">Ir para Meu Perfil</button>
          </div>
        ` : matches.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">Nenhum match encontrado</div>
            <p class="empty-state-desc">Ainda não há projetos buscando suas habilidades. Volte em breve!</p>
          </div>
        ` : `
          <div class="projects-grid">
            ${matches.map(({ project, matchCount, matchSkills }) => matchCardHTML(project, matchCount, matchSkills)).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  document.getElementById('go-to-profile')?.addEventListener('click', () => renderProfile());
  document.querySelectorAll('.btn-view-project').forEach(btn => {
    btn.addEventListener('click', () => navigate('project', { id: btn.dataset.id }));
  });
}

// ── TELA: Perfil ──────────────────────────────────────────────────────────────
function renderProfile() {
  setActiveNav('nl-profile');
  const users    = getAllUsers();
  const fullUser = users.find(u => u.id === _user.id) || _user;
  const skills   = fullUser.skills || [];

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="section-header">
          <div>
            <h2 class="section-title">👤 Meu Perfil</h2>
            <p class="section-subtitle">Gerencie suas informações e habilidades</p>
          </div>
        </div>

        <div class="profile-section">
          <div class="profile-card animate-fadeInLeft card">
            <div class="profile-avatar">${getInitials(_user.name)}</div>
            <div class="profile-name">${escapeHtml(fullUser.name)}</div>
            <div class="profile-email">${escapeHtml(fullUser.email)}</div>
            <span class="badge badge-navy" style="margin-bottom:1rem">${fullUser.role === 'aluno' ? '🧑‍💻 Aluno' : fullUser.role}</span>
            <div style="margin-top:1rem">
              <div class="text-xs text-muted" style="margin-bottom:0.5rem">Membro desde</div>
              <div class="text-sm font-semibold">${formatDate(fullUser.createdAt)}</div>
            </div>
          </div>

          <div class="card animate-fadeInUp">
            <div class="card-header">
              <h3 style="font-size:1rem;font-weight:600">Editar informações</h3>
            </div>
            <div class="card-body">
              <form id="profile-form" class="auth-form">
                <div class="form-group">
                  <label class="form-label" for="pf-name">Nome completo</label>
                  <input id="pf-name" class="form-control" type="text" value="${escapeHtml(fullUser.name)}" />
                  <span class="form-error" aria-live="polite"></span>
                </div>
                <div class="form-group">
                  <label class="form-label">Habilidades <span class="text-muted text-sm">(Enter para adicionar)</span></label>
                  <div class="tags-input-wrapper" id="pf-skills-wrapper">
                    <input class="tags-input-field" id="pf-skills-field" type="text" placeholder="ex: Python, React…" />
                  </div>
                </div>
                <button type="submit" class="btn btn-primary">Salvar alterações</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const wrapper = document.getElementById('pf-skills-wrapper');
  let tagsCtrl  = null;
  if (wrapper) tagsCtrl = initTagsInput(wrapper, [...skills]);

  document.getElementById('profile-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const newName   = document.getElementById('pf-name').value.trim();
    const newSkills = tagsCtrl ? tagsCtrl.getValue() : skills;
    if (!newName) { showToast('Nome obrigatório.', '', 'error'); return; }

    updateProfile(_user.id, { name: newName, skills: newSkills });
    // Atualiza sessão local
    import('../services/storage.js').then(({ get, set, KEYS }) => {
      const sess = get(KEYS.SESSION);
      if (sess) { sess.name = newName; sess.skills = newSkills; set(KEYS.SESSION, sess); _user = sess; }
    });
    showToast('Perfil atualizado!', 'Suas informações foram salvas.', 'success');
    document.getElementById('nav-username').textContent = newName.split(' ')[0];
    document.getElementById('nav-avatar').textContent   = getInitials(newName);
  });
}

// ── MODAL: Criar Projeto ──────────────────────────────────────────────────────
function openCreateProjectModal() {
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">Novo Projeto</h2>
      <p class="modal-subtitle">Preencha as informações do seu projeto</p>
    </div>
    <div class="modal-body">
      <form id="create-project-form" class="auth-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="cp-title">Título do projeto <span class="required">*</span></label>
          <input id="cp-title" class="form-control" type="text" placeholder="Ex: Sistema de Monitoramento IoT" required />
          <span class="form-error"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cp-objective">Objetivo <span class="required">*</span></label>
          <textarea id="cp-objective" class="form-control" rows="4" placeholder="Descreva o objetivo e escopo do projeto…" required></textarea>
          <span class="form-error"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cp-status">Status inicial</label>
          <select id="cp-status" class="form-control">
            <option value="em_desenvolvimento">Em Desenvolvimento</option>
            <option value="aguardando_equipe">Aguardando Equipe</option>
            <option value="em_continuidade">Em Continuidade</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="cp-semester">Semestre</label>
          <input id="cp-semester" class="form-control" type="text" placeholder="Ex: 2025.1" />
        </div>
        <div class="form-group">
          <label class="form-label">Habilidades necessárias <span class="text-muted text-sm">(Enter para adicionar)</span></label>
          <div class="tags-input-wrapper" id="cp-skills-wrapper">
            <input class="tags-input-field" id="cp-skills-field" type="text" placeholder="ex: React, Python…" />
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="cancel-create">Cancelar</button>
      <button class="btn btn-accent" id="submit-create">Criar Projeto</button>
    </div>
  `);

  // Semestre padrão
  const now = new Date();
  document.getElementById('cp-semester').value = `${now.getFullYear()}.${now.getMonth() < 6 ? 1 : 2}`;

  const wrapper  = document.getElementById('cp-skills-wrapper');
  const tagsCtrl = wrapper ? initTagsInput(wrapper, []) : null;

  document.getElementById('cancel-create')?.addEventListener('click', closeModal);
  document.getElementById('submit-create')?.addEventListener('click', () => {
    const title     = document.getElementById('cp-title').value.trim();
    const objective = document.getElementById('cp-objective').value.trim();
    const status    = document.getElementById('cp-status').value;
    const semester  = document.getElementById('cp-semester').value.trim();
    const skills    = tagsCtrl ? tagsCtrl.getValue() : [];

    if (!title)     { showToast('Título obrigatório', '', 'error'); return; }
    if (!objective) { showToast('Objetivo obrigatório', '', 'error'); return; }

    createProject({ title, objective, status, skills, semester, ownerId: _user.id });
    showToast('Projeto criado!', `"${title}" foi adicionado à plataforma.`, 'success');
    closeModal();
    renderMyProjects();
  });
}

// ── HTML Helpers ──────────────────────────────────────────────────────────────

function statCard(icon, value, label, iconClass) {
  return `
    <div class="stat-card animate-fadeInUp">
      <div class="stat-icon ${iconClass}">${icon}</div>
      <div>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
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

function projectCardHTML(p) {
  const users = getAllUsers();
  const advisor = p.advisorId ? users.find(u => u.id === p.advisorId) : null;
  return `
    <div class="project-card card-interactive animate-fadeInUp">
      <div>
        <div class="project-card-meta" style="margin-bottom:0.5rem">
          ${statusBadge(p.status)}
          <span class="badge badge-gray">${escapeHtml(p.semester || '–')}</span>
        </div>
        <div class="project-card-title">${escapeHtml(p.title)}</div>
      </div>
      <p class="project-card-desc">${escapeHtml(p.objective)}</p>
      <div class="project-card-skills">
        ${(p.skills || []).slice(0, 5).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
        ${p.skills.length > 5 ? `<span class="skill-tag">+${p.skills.length - 5}</span>` : ''}
      </div>
      <div class="card-footer" style="margin:-1.25rem;margin-top:0;border-radius:0 0 0.75rem 0.75rem">
        ${advisor ? `<span class="text-xs text-muted">👨‍🏫 ${escapeHtml(advisor.name)}</span>` : ''}
        <button class="btn btn-outline btn-sm btn-view-project" data-id="${p.id}" style="margin-left:auto">Ver detalhes</button>
      </div>
    </div>
  `;
}

function matchCardHTML(p, matchCount, matchSkills) {
  const users   = getAllUsers();
  const owner   = users.find(u => u.id === p.ownerId);
  return `
    <div class="project-card card-interactive animate-fadeInUp">
      <div>
        <div class="project-card-meta" style="margin-bottom:0.5rem">
          ${statusBadge(p.status)}
          <span class="badge badge-orange">🎯 ${matchCount} skill${matchCount > 1 ? 's' : ''} em comum</span>
        </div>
        <div class="project-card-title">${escapeHtml(p.title)}</div>
      </div>
      <p class="project-card-desc">${escapeHtml(p.objective)}</p>
      <div class="project-card-skills">
        ${(p.skills || []).map(s =>
          matchSkills.includes(s)
            ? `<span class="skill-tag skill-tag-match">✓ ${escapeHtml(s)}</span>`
            : `<span class="skill-tag">${escapeHtml(s)}</span>`
        ).join('')}
      </div>
      <div class="card-footer" style="margin:-1.25rem;margin-top:0;border-radius:0 0 0.75rem 0.75rem">
        ${owner ? `<span class="text-xs text-muted">👤 ${escapeHtml(owner.name)}</span>` : ''}
        <button class="btn btn-accent btn-sm btn-view-project" data-id="${p.id}" style="margin-left:auto">Ver projeto</button>
      </div>
    </div>
  `;
}
