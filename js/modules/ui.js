/**
 * ui.js – Módulo de utilitários de interface (Toast, Modal, TagsInput).
 * Componentes reutilizáveis desacoplados de qualquer view.
 */

// ── TOAST ─────────────────────────────────────────────────────────────────────

const TOAST_ICONS = {
  success: '✓',
  error:   'x',
  warning: '!',
  info:    'i',
};

/**
 * Exibe uma notificação toast temporária.
 * @param {string} title   – Título em negrito.
 * @param {string} message – Detalhe opcional.
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration – Duração em ms (padrão 3500).
 */
export function showToast(title, message = '', type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate__animated`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || 'i'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  // Remove após a duração
  setTimeout(() => {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ── MODAL ─────────────────────────────────────────────────────────────────────

let _modalCloseCallback = null;

/**
 * Abre o modal global com HTML customizado.
 * @param {string}   html      – Conteúdo HTML interno.
 * @param {Function} onClose   – Callback chamado ao fechar.
 */
export function openModal(html, onClose = null) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  content.innerHTML = html;
  overlay.classList.remove('hidden');
  _modalCloseCallback = onClose;

  // Foca o primeiro campo de formulário
  setTimeout(() => {
    const first = content.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }, 100);
}

/** Fecha o modal global. */
export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (_modalCloseCallback) {
    _modalCloseCallback();
    _modalCloseCallback = null;
  }
}

/** Inicializa os listeners do modal (chamado uma única vez no boot). */
export function initModal() {
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── TAGS INPUT ────────────────────────────────────────────────────────────────

/**
 * Inicializa um componente de tags em um container específico.
 * Retorna um objeto com método getValue() para leitura dos valores.
 *
 * @param {HTMLElement} wrapper  – Elemento .tags-input-wrapper.
 * @param {string[]}    initial  – Tags iniciais.
 * @returns {{ getValue: () => string[] }}
 */
export function initTagsInput(wrapper, initial = []) {
  let tags = [...initial];

  const field = wrapper.querySelector('.tags-input-field');
  if (!field) return { getValue: () => tags };

  // Renderiza as tags atuais
  function render() {
    // Remove chips antigos (mantém o input field)
    wrapper.querySelectorAll('.tag-chip').forEach(c => c.remove());

    tags.forEach((tag, idx) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${escapeHtml(tag)}<span class="tag-chip-remove" data-idx="${idx}" role="button" aria-label="Remover ${tag}">×</span>`;
      wrapper.insertBefore(chip, field);
    });

    // Listeners de remoção
    wrapper.querySelectorAll('.tag-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        tags.splice(Number(btn.dataset.idx), 1);
        render();
      });
    });
  }

  function addTag(raw) {
    const val = raw.trim();
    if (!val) return;
    if (!tags.includes(val)) {
      tags.push(val);
      render();
    }
    field.value = '';
  }

  field.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(field.value);
    }
    if (e.key === 'Backspace' && field.value === '' && tags.length) {
      tags.pop();
      render();
    }
  });

  field.addEventListener('blur', () => addTag(field.value));

  wrapper.addEventListener('click', () => field.focus());

  render();
  return { getValue: () => [...tags] };
}

// ── FORM VALIDATION ───────────────────────────────────────────────────────────

/**
 * Valida um campo e exibe erro inline.
 * @param {HTMLElement} input
 * @param {string}      errorMsg – Mensagem de erro (vazia = sem erro).
 * @returns {boolean} true se válido.
 */
export function validateField(input, errorMsg) {
  const group = input.closest('.form-group');
  const errEl = group?.querySelector('.form-error');
  if (errorMsg) {
    input.classList.add('error');
    if (errEl) errEl.textContent = errorMsg;
    return false;
  }
  input.classList.remove('error');
  if (errEl) errEl.textContent = '';
  return true;
}

/** Limpa todos os erros de um formulário. */
export function clearFormErrors(form) {
  form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

// ── HELPERS GERAIS ────────────────────────────────────────────────────────────

/** Escapa HTML para prevenção de XSS. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Formata uma data ISO para exibição local (pt-BR). */
export function formatDate(iso) {
  if (!iso) return '–';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso));
}

/** Retorna as iniciais de um nome (até 2 letras). */
export function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
