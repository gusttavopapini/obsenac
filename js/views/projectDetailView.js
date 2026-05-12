/**
 * projectDetailView.js – Visualização detalhada de um projeto.
 * Mostra metadados, histórico de versões (timeline) e lista de integrantes.
 */

import { navigate }        from '../modules/router.js';
import { escapeHtml, formatDate, getInitials } from '../modules/ui.js';
import { getSession }      from '../services/auth.js';
import { getAllUsers }      from '../services/userService.js';
import { getProjectById, STATUS_LABELS } from '../services/projectService.js';

export function renderProjectDetail(params = {}) {
  const user    = getSession();
  if (!user) { navigate('login'); return; }

  const project = getProjectById(params.id);
  if (!project) {
    document.getElementById('view-root').innerHTML = `
      <div class="dashboard-root">
        <div class="dashboard-content">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">Projeto não encontrado</div>
            <p class="empty-state-desc">O projeto que você procura não existe ou foi removido.</p>
            <button class="btn btn-primary" id="back-btn">← Voltar ao dashboard</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('back-btn')?.addEventListener('click', () => goBack(user));
    return;
  }

  const users   = getAllUsers();
  const owner   = users.find(u => u.id === project.ownerId);
  const advisor = project.advisorId ? users.find(u => u.id === project.advisorId) : null;

  const statusMap = {
    em_desenvolvimento: 'badge-success',
    em_continuidade:    'badge-navy',
    aguardando_equipe:  'badge-warning',
    concluido:          'badge-gray',
    cancelado:          'badge-error',
  };

  document.getElementById('view-root').innerHTML = `
    <div class="project-detail-root">
      <!-- Header escuro -->
      <div class="project-detail-header">
        <div class="project-detail-header-inner animate-fadeInUp">
          <div class="project-detail-info">
            <button class="btn btn-ghost btn-sm" id="detail-back-btn" style="color:rgba(255,255,255,0.7);margin-bottom:1rem">← Voltar</button>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem">
              <span class="badge ${statusMap[project.status] || 'badge-gray'}">${STATUS_LABELS[project.status] || project.status}</span>
              <span class="badge badge-gray">${escapeHtml(project.semester || '–')}</span>
            </div>
            <h1 class="project-detail-title">${escapeHtml(project.title)}</h1>
            <div style="display:flex;flex-wrap:wrap;gap:1rem;margin-top:0.75rem">
              ${owner ? `<span style="font-size:0.875rem;color:var(--navy-100);opacity:0.8">👤 Responsável: <strong>${escapeHtml(owner.name)}</strong></span>` : ''}
              ${advisor ? `<span style="font-size:0.875rem;color:var(--navy-100);opacity:0.8">👨‍🏫 Orientador: <strong>${escapeHtml(advisor.name)}</strong></span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Corpo -->
      <div class="project-detail-body">

        <!-- Coluna principal -->
        <div style="display:flex;flex-direction:column;gap:1.5rem">
          <!-- Objetivo -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">🎯 Objetivo</h3></div>
            <div class="card-body">
              <p style="color:var(--gray-700);line-height:1.7;font-size:0.9375rem">${escapeHtml(project.objective)}</p>
            </div>
          </div>

          <!-- Habilidades -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">🛠️ Habilidades Necessárias</h3></div>
            <div class="card-body">
              <div class="project-card-skills" style="gap:0.5rem">
                ${(project.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
                ${(project.skills || []).length === 0 ? '<span class="text-sm text-muted">Nenhuma habilidade cadastrada.</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Histórico (Timeline) -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">📜 Histórico de Versões</h3></div>
            <div class="card-body">
              ${(project.history && project.history.length > 0) ? `
                <div class="timeline">
                  ${project.history.slice().reverse().map(h => {
                    const author = h.authorId ? users.find(u => u.id === h.authorId) : null;
                    return `
                      <div class="timeline-item">
                        <div class="timeline-date">${formatDate(h.date)}</div>
                        <div class="timeline-event">${escapeHtml(h.event)}</div>
                        <div class="timeline-desc">${escapeHtml(h.desc)}</div>
                        ${author ? `<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--gray-400)">por ${escapeHtml(author.name)}</div>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : '<p class="text-sm text-muted">Nenhum evento registrado.</p>'}
            </div>
          </div>
        </div>

        <!-- Coluna lateral -->
        <div style="display:flex;flex-direction:column;gap:1.5rem">
          <!-- Integrantes -->
          <div class="card animate-fadeInUp">
            <div class="card-header">
              <h3 style="font-size:1rem;font-weight:600">👥 Integrantes</h3>
              <span class="badge badge-navy">${(project.members || []).length}</span>
            </div>
            <div class="card-body">
              <div class="members-list">
                ${(project.members || []).map(mid => {
                  const member = users.find(u => u.id === mid);
                  if (!member) return '';
                  const isOwner = mid === project.ownerId;
                  return `
                    <div class="member-item">
                      <div class="avatar avatar-sm">${getInitials(member.name)}</div>
                      <div class="member-info">
                        <div class="member-name">${escapeHtml(member.name)}</div>
                        <div class="member-role">${isOwner ? '⭐ Responsável' : member.role === 'professor' ? '👨‍🏫 Orientador' : '🧑‍💻 Integrante'}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
                ${advisor && !(project.members || []).includes(advisor.id) ? `
                  <div class="member-item">
                    <div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--orange-400),var(--orange-300))">${getInitials(advisor.name)}</div>
                    <div class="member-info">
                      <div class="member-name">${escapeHtml(advisor.name)}</div>
                      <div class="member-role">👨‍🏫 Orientador</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Informações -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">ℹ️ Informações</h3></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:1rem">
              <div>
                <div class="text-xs text-muted">Criado em</div>
                <div class="text-sm font-semibold">${formatDate(project.createdAt)}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Semestre</div>
                <div class="text-sm font-semibold">${escapeHtml(project.semester || '–')}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Status</div>
                <div style="margin-top:0.25rem"><span class="badge ${statusMap[project.status] || 'badge-gray'}">${STATUS_LABELS[project.status] || project.status}</span></div>
              </div>
              <div>
                <div class="text-xs text-muted">Eventos no histórico</div>
                <div class="text-sm font-semibold">${(project.history || []).length}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  document.getElementById('detail-back-btn')?.addEventListener('click', () => goBack(user));
}

function goBack(user) {
  const routeMap = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
  navigate(routeMap[user.role] || 'student');
}
