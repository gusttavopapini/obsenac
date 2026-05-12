/**
 * authView.js – Views de Login e Cadastro.
 * Gerencia formulários, validação e integração com o auth service.
 */

import { navigate }      from '../modules/router.js';
import { showToast, validateField, clearFormErrors, initTagsInput } from '../modules/ui.js';
import { login, register, isInstitutionalEmail } from '../services/auth.js';
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
            <span class="auth-logo-icon">🎓</span>
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
          <span class="auth-side-icon">🎓</span>
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

      <div class="auth-switch">
        Não tem conta? <a id="go-register">Cadastrar-se</a>
      </div>
      <div class="auth-switch" style="margin-top:0.5rem">
        <a id="go-landing">← Voltar ao início</a>
      </div>
    `,
    /* sideTitle */ 'Projetos que vivem além do semestre',
    /* sideDesc  */ 'Conectamos alunos, professores e coordenação para garantir a continuidade e o sucesso de cada pesquisa acadêmica.'
  );

  // ── Listeners ──
  document.getElementById('go-register')?.addEventListener('click', () => navigate('register'));
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
    } else if (result.error === 'pending') {
      renderPending();
    } else {
      showToast('Erro ao entrar', result.error, 'error');
      validateField(passInput, result.error);
    }
  }, 400);
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function renderRegister() {
  authLayout(
    /* formHtml */ `
      <h1 class="auth-heading">Criar conta</h1>
      <p class="auth-subheading">Use seu e-mail institucional para se cadastrar</p>

      <form class="auth-form" id="register-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="reg-name">Nome completo <span class="required">*</span></label>
          <input id="reg-name" class="form-control" type="text" placeholder="Seu nome completo" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">E-mail institucional <span class="required">*</span></label>
          <input id="reg-email" class="form-control" type="email" placeholder="seu@aluno.edu.br" required />
          <span class="form-hint">Domínios aceitos: @instituicao.edu.br, @aluno.edu.br</span>
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-role">Perfil <span class="required">*</span></label>
          <select id="reg-role" class="form-control" required>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password">Senha <span class="required">*</span></label>
          <input id="reg-password" class="form-control" type="password" placeholder="Mínimo 6 caracteres" required minlength="6" />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password2">Confirmar senha <span class="required">*</span></label>
          <input id="reg-password2" class="form-control" type="password" placeholder="Repita a senha" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label">Habilidades <span class="text-muted text-sm">(opcional – pressione Enter para adicionar)</span></label>
          <div class="tags-input-wrapper" id="reg-skills-wrapper">
            <input class="tags-input-field" id="reg-skills-field" type="text" placeholder="ex: Python, React…" aria-label="Adicionar habilidade" />
          </div>
        </div>
        <button type="submit" id="reg-submit" class="btn btn-primary btn-full btn-lg">Criar conta</button>
      </form>

      <div class="auth-switch">
        Já tem conta? <a id="go-login">Entrar</a>
      </div>
    `,
    /* sideTitle */ 'Faça parte da comunidade acadêmica',
    /* sideDesc  */ 'Após o cadastro, a coordenação irá revisar e aprovar seu acesso. Você será notificado assim que o processo for concluído.'
  );

  // Tags Input para habilidades
  const wrapper = document.getElementById('reg-skills-wrapper');
  let tagsInput = null;
  if (wrapper) tagsInput = initTagsInput(wrapper, []);

  document.getElementById('go-login')?.addEventListener('click', () => navigate('login'));

  document.getElementById('register-form')?.addEventListener('submit', e => {
    e.preventDefault();
    handleRegister(tagsInput);
  });
}

function handleRegister(tagsInput) {
  const nameInput  = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput  = document.getElementById('reg-password');
  const pass2Input = document.getElementById('reg-password2');
  const btn        = document.getElementById('reg-submit');
  const form       = document.getElementById('register-form');
  clearFormErrors(form);

  let valid = true;
  if (!nameInput.value.trim())  { validateField(nameInput, 'Nome obrigatório.');  valid = false; }
  if (!emailInput.value.trim()) { validateField(emailInput, 'E-mail obrigatório.'); valid = false; }
  else if (!isInstitutionalEmail(emailInput.value)) {
    validateField(emailInput, 'Use um e-mail institucional (@aluno.edu.br, @instituicao.edu.br).'); valid = false;
  }
  if (passInput.value.length < 6) { validateField(passInput, 'Senha deve ter ao menos 6 caracteres.'); valid = false; }
  if (passInput.value !== pass2Input.value) { validateField(pass2Input, 'As senhas não coincidem.'); valid = false; }
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Criando conta…';

  setTimeout(() => {
    const result = register({
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      password: passInput.value,
      role:     document.getElementById('reg-role').value,
      skills:   tagsInput ? tagsInput.getValue() : [],
    });

    btn.disabled = false;
    btn.textContent = 'Criar conta';

    if (result.success) {
      renderPending();
    } else {
      showToast('Erro no cadastro', result.error, 'error');
    }
  }, 400);
}

// ── APROVAÇÃO PENDENTE ────────────────────────────────────────────────────────
export function renderPending() {
  document.getElementById('navbar').classList.add('hidden');
  document.getElementById('view-root').innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;background:var(--gray-50)">
      <div class="pending-card animate-scaleIn">
        <div class="pending-icon">⏳</div>
        <h1 class="pending-title">Aguardando aprovação</h1>
        <p class="pending-desc">
          Seu cadastro foi recebido com sucesso! A coordenação irá revisar suas informações e aprovar seu acesso em breve.<br><br>
          Após a aprovação você poderá acessar todos os recursos da plataforma.
        </p>
        <button id="pending-back" class="btn btn-primary btn-full" style="margin-top:2rem">Voltar ao login</button>
      </div>
    </div>
  `;
  document.getElementById('pending-back')?.addEventListener('click', () => navigate('login'));
}

// ── Helper: redireciona conforme role ─────────────────────────────────────────
export function redirectByRole(role) {
  const map = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
  navigate(map[role] || 'student');
}
