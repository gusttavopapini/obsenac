/**
 * authView.js – View de Login e Registro.
 * Gerencia formulários de autenticação e integração com o auth service.
 */

import { navigate }      from '../modules/router.js';
import { showToast, validateField, clearFormErrors, initTagsInput } from '../modules/ui.js';
import { login, register, getSession } from '../services/auth.js';

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
            <span class="auth-logo-text">OB<span>SENAC</span></span>
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
        <button type="button" id="demo-submit" class="btn btn-accent btn-full btn-lg" style="margin-top:0.75rem">Ver Demo</button>
      </form>

      <div class="auth-switch" style="margin-top:1.5rem; display: flex; justify-content: space-between;">
        <a id="go-landing">← Voltar</a>
        <a id="go-register">Criar conta</a>
      </div>
    `,
    /* sideTitle */ 'Projetos que vivem além do semestre',
    /* sideDesc  */ 'Conectamos alunos, professores e coordenação para garantir a continuidade e o sucesso de cada pesquisa acadêmica.'
  );

  // ── Listeners ──
  document.getElementById('go-landing')?.addEventListener('click',  () => navigate('landing'));
  document.getElementById('go-register')?.addEventListener('click', () => navigate('register'));

  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    handleLogin();
  });

  document.getElementById('demo-submit')?.addEventListener('click', () => {
    handleDemoLogin();
  });
}

async function handleLogin() {
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

  try {
    const result = await login(emailInput.value.trim(), passInput.value);
    btn.disabled = false;
    btn.textContent = 'Entrar';

    if (result.success) {
      showToast('Login realizado!', `Bem-vindo(a), ${result.user.name.split(' ')[0]}!`, 'success');
      redirectByRole(result.user.role);
    } else {
      if (result.error === 'pending') {
        showToast('Aguardando aprovação', 'Sua conta ainda não foi aprovada pelo coordenador.', 'warning');
      } else {
        showToast('Erro ao entrar', result.error, 'error');
        validateField(passInput, result.error);
      }
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Entrar';
    showToast('Erro ao entrar', 'Falha na conexão com o servidor.', 'error');
  }
}

// ── REGISTRO ──────────────────────────────────────────────────────────────────
export function renderRegister() {
  authLayout(
    /* formHtml */ `
      <h1 class="auth-heading">Criar sua conta</h1>
      <p class="auth-subheading">Cadastre-se na plataforma do OBSENAC</p>

      <form class="auth-form" id="register-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="reg-name">Nome completo <span class="required">*</span></label>
          <input id="reg-name" class="form-control" type="text" placeholder="Nome completo" required />
          <span class="form-error" aria-live="polite"></span>
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-email">E-mail institucional <span class="required">*</span></label>
          <input id="reg-email" class="form-control" type="email" placeholder="seu@instituicao.edu.br" required />
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
          <label class="form-label">Habilidades <span class="text-muted text-sm">(opcional – Enter para adicionar)</span></label>
          <div class="tags-input-wrapper" id="reg-skills-wrapper">
            <input class="tags-input-field" id="reg-skills-field" type="text" placeholder="ex: Python, React…" />
          </div>
        </div>
        <button type="submit" id="register-submit" class="btn btn-primary btn-full btn-lg">Cadastrar</button>
      </form>

      <div class="auth-switch" style="margin-top:1.5rem">
        <a id="go-login">← Voltar ao login</a>
      </div>
    `,
    /* sideTitle */ 'Faça parte do ecossistema científico',
    /* sideDesc  */ 'Cadastre-se para compartilhar seus projetos ou colaborar em pesquisas em andamento.'
  );

  const wrapper = document.getElementById('reg-skills-wrapper');
  let tagsInput = null;
  if (wrapper) tagsInput = initTagsInput(wrapper, []);

  document.getElementById('go-login')?.addEventListener('click', () => navigate('login'));

  document.getElementById('register-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    await handleRegister(tagsInput);
  });
}

async function handleRegister(tagsInput) {
  const nameInput  = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput  = document.getElementById('reg-password');
  const roleInput  = document.getElementById('reg-role');
  const btn        = document.getElementById('register-submit');
  clearFormErrors(document.getElementById('register-form'));

  let valid = true;
  if (!nameInput.value.trim())  { validateField(nameInput, 'Nome obrigatório.');  valid = false; }
  if (!emailInput.value.trim()) { validateField(emailInput, 'E-mail obrigatório.'); valid = false; }
  if (passInput.value.length < 6) { validateField(passInput, 'A senha deve ter no mínimo 6 caracteres.'); valid = false; }
  
  if (!valid) return;

  btn.disabled = true;
  btn.textContent = 'Cadastrando...';

  try {
    const result = await register({
      name:     nameInput.value.trim(),
      email:    emailInput.value.trim(),
      password: passInput.value,
      role:     roleInput.value,
      skills:   tagsInput ? tagsInput.getValue() : [],
    });
    btn.disabled = false;
    btn.textContent = 'Cadastrar';

    if (result.success) {
      showToast('Conta criada!', 'Seu cadastro foi enviado e aguarda aprovação da coordenação.', 'success');
      navigate('login');
    } else {
      showToast('Erro no cadastro', result.error, 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Cadastrar';
    showToast('Erro no cadastro', 'Falha na conexão.', 'error');
  }
}

// ── Helper: redireciona conforme role ─────────────────────────────────────────
export function redirectByRole(role) {
  const map = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
  navigate(map[role] || 'student');
}

async function handleDemoLogin() {
  const btn = document.getElementById('demo-submit');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Carregando Demo…';
  }

  try {
    localStorage.setItem('obsenac_is_demo', 'true');
    const { getAllUsers } = await import('../services/userService.js');
    const users = await getAllUsers();
    
    // Procura o aluno padrão
    const defaultStudent = users.find(u => u.email.toLowerCase() === 'lucas.ferreira@aluno.edu.br');
    if (defaultStudent) {
      const { set, KEYS } = await import('../services/storage.js');
      set(KEYS.SESSION, defaultStudent);
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Ver Demo';
      }
      showToast('Acesso de Demonstração', 'Você entrou no modo de demonstração como Aluno!', 'success');
      redirectByRole(defaultStudent.role);
    } else {
      showToast('Erro no Demo', 'Usuário padrão do demo não encontrado no Firestore.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Ver Demo';
      }
    }
  } catch (e) {
    showToast('Erro no Demo', 'Falha ao buscar usuários do demo.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Ver Demo';
    }
  }
}

