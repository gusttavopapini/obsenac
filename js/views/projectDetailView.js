/**
 * projectDetailView.js – Visualização detalhada de um projeto.
 * Mostra metadados, histórico de versões (timeline) e lista de integrantes.
 */

import { navigate }        from '../modules/router.js';
import { escapeHtml, formatDate, getInitials, openModal, closeModal, initTagsInput, showToast } from '../modules/ui.js';
import { getSession }      from '../services/auth.js';
import { getAllUsers }      from '../services/userService.js';
import { getProjectById, STATUS_LABELS, updateProject, deleteProject } from '../services/projectService.js';

export async function renderProjectDetail(params = {}) {
  const user    = getSession();
  if (!user) { navigate('login'); return; }

  const project = await getProjectById(params.id);
  if (!project) {
    document.getElementById('view-root').innerHTML = `
      <div class="dashboard-root">
        <div class="dashboard-content">
          <div class="empty-state">
            <div class="empty-state-icon"></div>
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

  const users   = await getAllUsers();
  const owner   = users.find(u => u.id === project.ownerId);
  const advisor = project.advisorId ? users.find(u => u.id === project.advisorId) : null;

  const statusMap = {
    em_desenvolvimento: 'badge-success',
    em_continuidade:    'badge-navy',
    aguardando_equipe:  'badge-warning',
    concluido:          'badge-gray',
    cancelado:          'badge-error',
  };

  const isAuthorized = project.ownerId === user.id || user.role === 'coordenador';

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
              ${owner ? `<span style="font-size:0.875rem;color:var(--navy-100);opacity:0.8">Responsável: <strong>${escapeHtml(owner.name)}</strong></span>` : ''}
              ${advisor ? `<span style="font-size:0.875rem;color:var(--navy-100);opacity:0.8">Orientador: <strong>${escapeHtml(advisor.name)}</strong></span>` : ''}
            </div>
            ${isAuthorized ? `
              <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap">
                <button class="btn btn-outline btn-sm" id="btn-add-history" style="color:white;border-color:rgba(255,255,255,0.4)">+ Histórico</button>
                <button class="btn btn-accent btn-sm" id="btn-edit-project">Editar</button>
                <button class="btn btn-danger btn-sm" id="btn-delete-project">Excluir</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Corpo -->
      <div class="project-detail-body">

        <!-- Coluna principal -->
        <div style="display:flex;flex-direction:column;gap:1.5rem">
          <!-- Objetivo -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">Objetivo</h3></div>
            <div class="card-body">
              <p style="color:var(--gray-700);line-height:1.7;font-size:0.9375rem">${escapeHtml(project.objective)}</p>
            </div>
          </div>

          <!-- Habilidades -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">Habilidades Necessárias</h3></div>
            <div class="card-body">
              <div class="project-card-skills" style="gap:0.5rem">
                ${(project.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
                ${(project.skills || []).length === 0 ? '<span class="text-sm text-muted">Nenhuma habilidade cadastrada.</span>' : ''}
              </div>
            </div>
          </div>

          <!-- Histórico (Timeline) -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">Histórico de Versões</h3></div>
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
              <h3 style="font-size:1rem;font-weight:600">Integrantes</h3>
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
                        <div class="member-role">${isOwner ? 'Responsável' : member.role === 'professor' ? 'Orientador' : 'Integrante'}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
                ${advisor && !(project.members || []).includes(advisor.id) ? `
                  <div class="member-item">
                    <div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--orange-400),var(--orange-300))">${getInitials(advisor.name)}</div>
                    <div class="member-info">
                      <div class="member-name">${escapeHtml(advisor.name)}</div>
                      <div class="member-role">Orientador</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Informações -->
          <div class="card animate-fadeInUp">
            <div class="card-header"><h3 style="font-size:1rem;font-weight:600">Informações</h3></div>
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

  if (isAuthorized) {
    // Listener Adicionar Histórico
    document.getElementById('btn-add-history')?.addEventListener('click', () => {
      openModal(`
        <div class="modal-header">
          <h2 class="modal-title">Nova Entrada de Histórico</h2>
          <p class="modal-subtitle">Adicione um novo marco ou atualização ao projeto</p>
        </div>
        <div class="modal-body">
          <form id="history-form" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="hist-event">Evento <span class="required">*</span></label>
              <input id="hist-event" class="form-control" type="text" placeholder="Ex: Novo protótipo lançado, Testes finalizados..." required />
            </div>
            <div class="form-group">
              <label class="form-label" for="hist-desc">Descrição <span class="required">*</span></label>
              <textarea id="hist-desc" class="form-control" rows="4" placeholder="Descreva brevemente o que foi feito..." required></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="cancel-hist">Cancelar</button>
          <button class="btn btn-accent" id="submit-hist">Adicionar</button>
        </div>
      `);
      
      document.getElementById('cancel-hist')?.addEventListener('click', closeModal);
      document.getElementById('submit-hist')?.addEventListener('click', async () => {
        const event = document.getElementById('hist-event').value.trim();
        const desc = document.getElementById('hist-desc').value.trim();
        if (!event || !desc) {
          showToast('Preencha todos os campos obrigatórios', '', 'error');
          return;
        }
        
        const success = await updateProject(project.id, {}, { event, desc, authorId: user.id });
        if (success) {
          showToast('Histórico atualizado!', 'Novo evento registrado.', 'success');
          closeModal();
          await renderProjectDetail(params);
        } else {
          showToast('Erro ao atualizar histórico', '', 'error');
        }
      });
    });

    // Listener Excluir Projeto
    document.getElementById('btn-delete-project')?.addEventListener('click', async () => {
      const ok = confirm(`Tem certeza que deseja excluir o projeto "${project.title}"? Esta ação não pode ser desfeita.`);
      if (!ok) return;
      const success = await deleteProject(project.id);
      if (success) {
        showToast('Projeto excluído', 'O projeto foi removido.', 'success');
        goBack(user);
      } else {
        showToast('Erro ao excluir projeto', '', 'error');
      }
    });

    // Listener Editar Projeto
    document.getElementById('btn-edit-project')?.addEventListener('click', async () => {
      const usersList = await getAllUsers();
      const professors = usersList.filter(u => u.role === 'professor');
      const students = usersList.filter(u => u.role === 'aluno');
      
      const advisorOptions = professors.map(p => `
        <option value="${p.id}" ${project.advisorId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>
      `).join('');
      
      const ownerOptions = students.map(s => `
        <option value="${s.id}" ${project.ownerId === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>
      `).join('');

      openModal(`
        <div class="modal-header">
          <h2 class="modal-title">Editar Projeto</h2>
          <p class="modal-subtitle">Atualize as informações do projeto</p>
        </div>
        <div class="modal-body">
          <form id="edit-project-form" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="ep-title">Título <span class="required">*</span></label>
              <input id="ep-title" class="form-control" type="text" value="${escapeHtml(project.title)}" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="ep-objective">Objetivo <span class="required">*</span></label>
              <textarea id="ep-objective" class="form-control" rows="4" required>${escapeHtml(project.objective)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="ep-status">Status</label>
              <select id="ep-status" class="form-control">
                <option value="em_desenvolvimento" ${project.status === 'em_desenvolvimento' ? 'selected' : ''}>Em Desenvolvimento</option>
                <option value="aguardando_equipe" ${project.status === 'aguardando_equipe' ? 'selected' : ''}>Aguardando Equipe</option>
                <option value="em_continuidade" ${project.status === 'em_continuidade' ? 'selected' : ''}>Em Continuidade</option>
                <option value="concluido" ${project.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                <option value="cancelado" ${project.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="ep-semester">Semestre</label>
              <input id="ep-semester" class="form-control" type="text" value="${escapeHtml(project.semester || '')}" />
            </div>
            ${user.role === 'coordenador' ? `
              <div class="form-group">
                <label class="form-label" for="ep-owner">Responsável (Aluno)</label>
                <select id="ep-owner" class="form-control">
                  ${ownerOptions}
                </select>
              </div>
            ` : ''}
            <div class="form-group">
              <label class="form-label" for="ep-advisor">Professor Orientador</label>
              <select id="ep-advisor" class="form-control">
                <option value="">Nenhum</option>
                ${advisorOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Habilidades Necessárias <span class="text-muted text-sm">(Enter para adicionar)</span></label>
              <div class="tags-input-wrapper" id="ep-skills-wrapper">
                <input class="tags-input-field" id="ep-skills-field" type="text" placeholder="ex: Python, React…" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" id="cancel-edit-proj">Cancelar</button>
          <button class="btn btn-accent" id="submit-edit-proj">Salvar Alterações</button>
        </div>
      `);

      const wrapper = document.getElementById('ep-skills-wrapper');
      const tagsCtrl = wrapper ? initTagsInput(wrapper, [...(project.skills || [])]) : null;

      document.getElementById('cancel-edit-proj')?.addEventListener('click', closeModal);
      document.getElementById('submit-edit-proj')?.addEventListener('click', async () => {
        const title = document.getElementById('ep-title').value.trim();
        const objective = document.getElementById('ep-objective').value.trim();
        const status = document.getElementById('ep-status').value;
        const semester = document.getElementById('ep-semester').value.trim();
        const advisorId = document.getElementById('ep-advisor').value || null;
        const skills = tagsCtrl ? tagsCtrl.getValue() : [];
        
        const updates = {
          title,
          objective,
          status,
          semester,
          advisorId,
          skills
        };

        if (user.role === 'coordenador') {
          updates.ownerId = document.getElementById('ep-owner').value;
          if (!project.members.includes(updates.ownerId)) {
            updates.members = [...project.members, updates.ownerId];
          }
        }

        if (!title || !objective) {
          showToast('Preencha os campos obrigatórios', '', 'error');
          return;
        }

        const success = await updateProject(project.id, updates, {
          event: 'Projeto editado',
          desc: 'Informações gerais do projeto foram atualizadas.',
          authorId: user.id
        });

        if (success) {
          showToast('Projeto atualizado!', 'Alterações salvas com sucesso.', 'success');
          closeModal();
          await renderProjectDetail(params);
        } else {
          showToast('Erro ao atualizar projeto', '', 'error');
        }
      });
    });
  }
}

function goBack(user) {
  const routeMap = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
  navigate(routeMap[user.role] || 'student');
}

