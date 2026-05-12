/**
 * adminView.js – Painel Administrativo do Coordenador.
 * Funcionalidades: gestão de usuários (aprovar/bloquear), métricas gerais, lista de projetos.
 */

import { navigate }        from '../modules/router.js';
import { showToast, escapeHtml, formatDate, getInitials, openModal, closeModal, initTagsInput, validateField, clearFormErrors } from '../modules/ui.js';
import { getSession, logout } from '../services/auth.js';
import { getAllUsers, setUserStatus, createUserByAdmin } from '../services/userService.js';
import { getMetrics, getAllProjects, STATUS_LABELS } from '../services/projectService.js';

let _user = null;

export function renderAdmin() {
  _user = getSession();
  if (!_user) { navigate('login'); return; }

  setupNavbar();
  renderOverview();
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  navbar.classList.remove('hidden');
  document.getElementById('nav-username').textContent = _user.name.split(' ')[0];
  document.getElementById('nav-avatar').textContent   = getInitials(_user.name);

  document.getElementById('nav-links').innerHTML = `
    <li><button class="nav-link active" id="nl-overview" data-view="overview"><span class="nav-link-icon"></span> Visão Geral</button></li>
    <li><button class="nav-link" id="nl-users" data-view="users"><span class="nav-link-icon"></span> Usuários</button></li>
    <li><button class="nav-link" id="nl-projects" data-view="projects"><span class="nav-link-icon"></span> Projetos</button></li>
  `;

  document.getElementById('nl-overview')?.addEventListener('click', () => renderOverview());
  document.getElementById('nl-users')?.addEventListener('click',    () => renderUsers());
  document.getElementById('nl-projects')?.addEventListener('click', () => renderProjects());
  document.getElementById('logout-btn')?.addEventListener('click',  () => { logout(); navigate('login'); });
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('open');
  });
}

function setActiveNav(id) {
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

// ── TELA: Visão Geral (Métricas) ─────────────────────────────────────────────
function renderOverview() {
  setActiveNav('nl-overview');
  const metrics = getMetrics();
  const users   = getAllUsers();
  const pending = users.filter(u => u.status === 'pending');

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="welcome-banner animate-fadeInDown">
          <div class="welcome-greeting">Painel Administrativo</div>
          <div class="welcome-name">${escapeHtml(_user.name)} 👋</div>
          <span class="welcome-role">Coordenador(a)</span>
        </div>

        <!-- Métricas principais -->
        <div class="stats-row">
          ${statCard('', metrics.total, 'Total de projetos', 'stat-icon-navy')}
          ${statCard('', metrics.emDesenvolvimento, 'Em desenvolvimento', 'stat-icon-success')}
          ${statCard('', metrics.emContinuidade, 'Em continuidade', 'stat-icon-orange')}
          ${statCard('', metrics.concluidos, 'Concluídos', 'stat-icon-success')}
        </div>

        <!-- Métricas secundárias -->
        <div class="stats-row" style="margin-top:0">
          ${statCard('', users.length, 'Total de usuários', 'stat-icon-navy')}
          ${statCard('', pending.length, 'Aprovações pendentes', 'stat-icon-warning')}
          ${statCard('', users.filter(u => u.role === 'aluno' && u.status === 'approved').length, 'Alunos ativos', 'stat-icon-success')}
          ${statCard('', users.filter(u => u.role === 'professor').length, 'Professores', 'stat-icon-navy')}
        </div>

        <!-- Gráfico de distribuição (visual simples) -->
        <div class="card animate-fadeInUp">
          <div class="card-header">
            <h3 style="font-size:1rem;font-weight:600">Distribuição de Status dos Projetos</h3>
          </div>
          <div class="card-body">
            ${chartBarHTML(metrics)}
          </div>
        </div>

        ${pending.length > 0 ? `
          <!-- Aprovações pendentes -->
          <div class="card animate-fadeInUp">
            <div class="card-header">
              <h3 style="font-size:1rem;font-weight:600">Cadastros Pendentes</h3>
              <span class="badge badge-warning">${pending.length}</span>
            </div>
            <div class="table-wrapper">
              <table class="table">
                <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Data</th><th>Ações</th></tr></thead>
                <tbody>
                  ${pending.map(u => `
                    <tr>
                      <td><strong>${escapeHtml(u.name)}</strong></td>
                      <td class="text-sm text-muted">${escapeHtml(u.email)}</td>
                      <td>${roleBadge(u.role)}</td>
                      <td class="text-sm">${formatDate(u.createdAt)}</td>
                      <td style="display:flex;gap:0.5rem">
                        <button class="btn btn-success btn-sm btn-approve-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Aprovar</button>
                        <button class="btn btn-danger btn-sm btn-block-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Bloquear</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  bindUserActions();
}

// ── TELA: Usuários ────────────────────────────────────────────────────────────
function renderUsers() {
  setActiveNav('nl-users');
  const users = getAllUsers().filter(u => u.id !== _user.id);

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="section-header">
          <div>
            <h2 class="section-title">Gestão de Usuários</h2>
            <p class="section-subtitle">Aprove, bloqueie e gerencie os usuários da plataforma</p>
          </div>
          <button class="btn btn-accent" id="btn-new-user">+ Novo Usuário</button>
        </div>

        <div class="card animate-fadeInUp">
          <div class="table-wrapper">
            <table class="table" id="users-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr class="animate-fadeInUp">
                    <td><div class="avatar avatar-sm">${getInitials(u.name)}</div></td>
                    <td><strong>${escapeHtml(u.name)}</strong></td>
                    <td class="text-sm text-muted">${escapeHtml(u.email)}</td>
                    <td>${roleBadge(u.role)}</td>
                    <td>${userStatusBadge(u.status)}</td>
                    <td class="text-sm">${formatDate(u.createdAt)}</td>
                    <td>
                      <div style="display:flex;gap:0.5rem">
                        ${u.status !== 'approved'
                          ? `<button class="btn btn-success btn-sm btn-approve-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Aprovar</button>`
                          : ''}
                        ${u.status !== 'blocked'
                          ? `<button class="btn btn-danger btn-sm btn-block-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Bloquear</button>`
                          : `<button class="btn btn-outline btn-sm btn-approve-user" data-id="${u.id}" data-name="${escapeHtml(u.name)}">Desbloquear</button>`}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  bindUserActions();
  document.getElementById('btn-new-user')?.addEventListener('click', openCreateUserModal);
}

// ── TELA: Projetos ────────────────────────────────────────────────────────────
function renderProjects() {
  setActiveNav('nl-projects');
  const projects = getAllProjects();
  const users    = getAllUsers();

  document.getElementById('view-root').innerHTML = `
    <div class="dashboard-root">
      <div class="dashboard-content">
        <div class="section-header">
          <div>
            <h2 class="section-title">Todos os Projetos</h2>
            <p class="section-subtitle">${projects.length} projetos cadastrados na plataforma</p>
          </div>
        </div>

        <div class="card animate-fadeInUp">
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Responsável</th>
                  <th>Orientador</th>
                  <th>Status</th>
                  <th>Semestre</th>
                  <th>Integrantes</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${projects.map(p => {
                  const owner   = users.find(u => u.id === p.ownerId);
                  const advisor = p.advisorId ? users.find(u => u.id === p.advisorId) : null;
                  return `
                    <tr class="animate-fadeInUp">
                      <td><strong>${escapeHtml(p.title)}</strong></td>
                      <td class="text-sm">${owner ? escapeHtml(owner.name) : '–'}</td>
                      <td class="text-sm">${advisor ? escapeHtml(advisor.name) : '–'}</td>
                      <td>${statusBadge(p.status)}</td>
                      <td class="text-sm">${escapeHtml(p.semester || '–')}</td>
                      <td class="text-sm">${(p.members || []).length}</td>
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

// ── Bind: ações de aprovação/bloqueio ─────────────────────────────────────────
function bindUserActions() {
  document.querySelectorAll('.btn-approve-user').forEach(btn => {
    btn.addEventListener('click', () => {
      setUserStatus(btn.dataset.id, 'approved');
      showToast('Usuário aprovado!', `${btn.dataset.name} agora tem acesso à plataforma.`, 'success');
      rerenderCurrentTab();
    });
  });
  document.querySelectorAll('.btn-block-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const ok = confirm(`Bloquear o usuário "${btn.dataset.name}"?`);
      if (!ok) return;
      setUserStatus(btn.dataset.id, 'blocked');
      showToast('Usuário bloqueado', `${btn.dataset.name} foi bloqueado.`, 'warning');
      rerenderCurrentTab();
    });
  });
}

function rerenderCurrentTab() {
  const active = document.querySelector('.nav-link.active');
  if (!active) return renderOverview();
  const view = active.dataset.view;
  if (view === 'users')    renderUsers();
  else if (view === 'projects') renderProjects();
  else renderOverview();
}

// ── MODAL: Criar Usuário ──────────────────────────────────────────────────────
function openCreateUserModal() {
  openModal(`
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">Novo Usuário</h2>
      <p class="modal-subtitle">Cadastre um novo aluno ou professor</p>
    </div>
    <div class="modal-body">
      <form id="create-user-form" class="auth-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="cu-name">Nome completo <span class="required">*</span></label>
          <input id="cu-name" class="form-control" type="text" placeholder="Nome completo" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cu-email">E-mail institucional <span class="required">*</span></label>
          <input id="cu-email" class="form-control" type="email" placeholder="seu@instituicao.edu.br" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="cu-role">Perfil <span class="required">*</span></label>
          <select id="cu-role" class="form-control" required>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="cu-password">Senha Provisória <span class="required">*</span></label>
          <input id="cu-password" class="form-control" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Habilidades <span class="text-muted text-sm">(opcional – Enter para adicionar)</span></label>
          <div class="tags-input-wrapper" id="cu-skills-wrapper">
            <input class="tags-input-field" id="cu-skills-field" type="text" placeholder="ex: Python, React…" />
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="cancel-create-user">Cancelar</button>
      <button class="btn btn-accent" id="submit-create-user">Cadastrar</button>
    </div>
  `);

  const wrapper = document.getElementById('cu-skills-wrapper');
  let tagsInput = null;
  if (wrapper) tagsInput = initTagsInput(wrapper, []);

  document.getElementById('cancel-create-user')?.addEventListener('click', closeModal);
  document.getElementById('submit-create-user')?.addEventListener('click', () => {
    const nameInput  = document.getElementById('cu-name');
    const emailInput = document.getElementById('cu-email');
    const passInput  = document.getElementById('cu-password');
    const roleInput  = document.getElementById('cu-role');
    const form       = document.getElementById('create-user-form');
    clearFormErrors(form);

    let valid = true;
    if (!nameInput.value.trim())  { validateField(nameInput, 'Nome obrigatório.');  valid = false; }
    if (!emailInput.value.trim()) { validateField(emailInput, 'E-mail obrigatório.'); valid = false; }
    if (passInput.value.length < 6) { validateField(passInput, 'A senha deve ter no mínimo 6 caracteres.'); valid = false; }
    
    if (!valid) return;

    const btn = document.getElementById('submit-create-user');
    btn.disabled = true;
    btn.textContent = 'Cadastrando...';

    setTimeout(() => {
      const result = createUserByAdmin({
        name:     nameInput.value.trim(),
        email:    emailInput.value.trim(),
        password: passInput.value,
        role:     roleInput.value,
        skills:   tagsInput ? tagsInput.getValue() : [],
      });

      if (result.success) {
        showToast('Usuário Cadastrado', `${nameInput.value.trim()} foi cadastrado com sucesso.`, 'success');
        closeModal();
        renderUsers();
      } else {
        btn.disabled = false;
        btn.textContent = 'Cadastrar';
        showToast('Erro no cadastro', result.error, 'error');
      }
    }, 400);
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

function roleBadge(role) {
  const map = { aluno: 'Aluno', professor: 'Professor', coordenador: 'Coordenador' };
  return `<span class="badge badge-navy">${map[role] || role}</span>`;
}

function userStatusBadge(status) {
  const map = {
    approved: ['badge-success', '✓ Ativo'],
    pending:  ['badge-warning', 'Pendente'],
    blocked:  ['badge-error',   '✕ Bloqueado'],
  };
  const [cls, lbl] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${lbl}</span>`;
}

/**
 * Gera barras horizontais simples para visualização de métricas.
 */
function chartBarHTML(metrics) {
  const max = Math.max(metrics.emDesenvolvimento, metrics.emContinuidade, metrics.concluidos, metrics.cancelados, metrics.aguardandoEquipe, 1);
  const bars = [
    { label: 'Em Desenvolvimento', value: metrics.emDesenvolvimento, color: 'var(--success-500)' },
    { label: 'Em Continuidade',    value: metrics.emContinuidade,    color: 'var(--navy-400)' },
    { label: 'Aguardando Equipe',  value: metrics.aguardandoEquipe,  color: 'var(--warning-500)' },
    { label: 'Concluídos',         value: metrics.concluidos,        color: 'var(--gray-500)' },
    { label: 'Cancelados',         value: metrics.cancelados,        color: 'var(--error-500)' },
  ];

  return `<div style="display:flex;flex-direction:column;gap:1rem">
    ${bars.map(b => `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem">
          <span style="font-size:0.8125rem;font-weight:500;color:var(--gray-700)">${b.label}</span>
          <span style="font-size:0.8125rem;font-weight:700;color:var(--navy-800)">${b.value}</span>
        </div>
        <div style="height:8px;background:var(--gray-200);border-radius:999px;overflow:hidden">
          <div style="height:100%;width:${max > 0 ? (b.value / max) * 100 : 0}%;background:${b.color};border-radius:999px;transition:width 0.6s cubic-bezier(0.16,1,0.3,1)"></div>
        </div>
      </div>
    `).join('')}
  </div>`;
}
