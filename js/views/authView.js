/**
 * authView.js – View de Login.
 * Gerencia formulário de login e integração com o auth service.
 */

import { navigate }      from '../modules/router.js';
import { showToast, validateField, clearFormErrors } from '../modules/ui.js';
import { login } from '../services/auth.js';
import { getSession }    from '../services/auth.js';

// ── Helper: monta o layout comum Auth (painel + lateral) ─────────────────────
function authLayout(formHtml, sideTitle, sideDesc) {
  document.getElementById('navbar').classList.add('hidden');
  document.getElementById('view-root').innerHTML = `
    <div class="auth-root">
      <!-- Painel do formulário -->
      <div class="auth-panel">
        <div class="auth-form-box animate-fadeInUp">
          <div class="auth-logo">
            <span class="auth-logo-icon"></span>
            <span class="auth-logo-text">PC<span>GPA</span></span>
          </div>
          ${formHtml}
        </div>
      </div>

      <!-- Painel decorativo lateral -->
      <div class="auth-side">
        <div class="auth-side-orb auth-side-orb-1"></div>
        <div class="auth-side-orb auth-side-orb-2"></div>
        <div class="auth-side-content animate-fadeIn">
          <span class="auth-side-icon"></span>
          <h2 class="auth-side-title">${sideTitle}</h2>
          <p class="auth-side-desc">${sideDesc}</p>
        </div>
      </div>
    </div>
  `;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function renderLogin() {
  authLayout(
    /* formHtml */ `
      <h1 class="auth-heading">Bem-vindo de volta</h1>
      <p class="auth-subheading">Acesse sua conta institucional</p>

      <form class="auth-form" id="login-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="login-email">E-mail institucional <span class="required">*</span></label>
          <input id="login-email" class="form-control" type="email" placeholder="seu@instituicao.edu.br" autocomplete="email" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Senha <span class="required">*</span></label>
          <input id="login-password" class="form-control" type="password" placeholder="••••••••" autocomplete="current-password" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <button type="submit" id="login-submit" class="btn btn-primary btn-full btn-lg">Entrar</button>
      </form>

      <div class="auth-switch" style="margin-top:1.5rem">
        <a id="go-landing">← Voltar ao início</a>
      </div>
    `,
    /* sideTitle */ 'Projetos que vivem além do semestre',
    /* sideDesc  */ 'Conectamos alunos, professores e coordenação para garantir a continuidade e o sucesso de cada pesquisa acadêmica.'
  );

  // ── Listeners ──
  document.getElementById('go-landing')?.addEventListener('click',  () => navigate('landing'));

  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    handleLogin();
  });
}

function handleLogin() {
  const emailInput = document.getElementById('login-email');
  const passInput  = document.getElementById('login-password');
  const btn        = document.getElementById('login-submit');
  clearFormErrors(document.getElementById('login-form'));

  let valid = true;
  if (!emailInput.value.trim()) {
    validateField(emailInput, 'Informe seu e-mail.'); valid = false;
  }
  if (!passInput.value) {
    validateField(passInput, 'Informe sua senha.'); valid = false;
  }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Entrando…';

  // Simulação de latência para UX
  setTimeout(() => {
    const result = login(emailInput.value.trim(), passInput.value);
    btn.disabled = false;
    btn.textContent = 'Entrar';

    if (result.success) {
      showToast('Login realizado!', `Bem-vindo(a), ${result.user.name.split(' ')[0]}!`, 'success');
      redirectByRole(result.user.role);
    } else {
      showToast('Erro ao entrar', result.error, 'error');
      validateField(passInput, result.error);
    }
  }, 400);
}

// ── Helper: redireciona conforme role ─────────────────────────────────────────
export function redirectByRole(role) {
  const map = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
  navigate(map[role] || 'student');
}
