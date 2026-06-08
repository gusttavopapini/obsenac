/**
 * app.js – Ponto de entrada da SPA OBSENAC.
 * Inicializa seed data, registra rotas, configura guards e boot do sistema.
 */

import { seedDatabase }            from './services/seed.js';
import { getSession, logout }      from './services/auth.js';
import { route, beforeEach, initRouter, navigate } from './modules/router.js';
import { initModal }               from './modules/ui.js';

// ── Views ─────────────────────────────────────────────────────────────────────
import { renderLanding }           from './views/landingView.js';
import { renderLogin, redirectByRole } from './views/authView.js';
import { renderStudent }           from './views/studentView.js';
import { renderProfessor }         from './views/professorView.js';
import { renderAdmin }             from './views/adminView.js';
import { renderProjectDetail }     from './views/projectDetailView.js';

// ══════════════════════════════════════════════════════════════════════════════
// 1) Inicializa o banco de dados com dados de exemplo (seed)
// ══════════════════════════════════════════════════════════════════════════════
seedDatabase();

// ══════════════════════════════════════════════════════════════════════════════
// 2) Inicializa o sistema de modal global
// ══════════════════════════════════════════════════════════════════════════════
initModal();

// ══════════════════════════════════════════════════════════════════════════════
// 3) Registra as rotas da SPA
// ══════════════════════════════════════════════════════════════════════════════
route('landing',  () => renderLanding());
route('login',    () => renderLogin());

route('student',   () => renderStudent());
route('professor', () => renderProfessor());
route('admin',     () => renderAdmin());

// Rota com parâmetros (detalhe de projeto)
route('project',   (params) => renderProjectDetail(params));

// ══════════════════════════════════════════════════════════════════════════════
// 4) Guard de navegação – protege rotas autenticadas e redireciona
// ══════════════════════════════════════════════════════════════════════════════
const PUBLIC_ROUTES  = ['landing', 'login'];
const ROLE_ROUTES    = { aluno: 'student', professor: 'professor', coordenador: 'admin' };

beforeEach((to, from, params) => {
  const session = getSession();
  
  // Atualiza exibição do seletor demo pós-navegação
  setTimeout(updateDemoSwitcher, 0);

  // Rotas públicas: se já está logado e tenta ir para login/register → redireciona
  if (PUBLIC_ROUTES.includes(to)) {
    if (session && to === 'login') {
      return ROLE_ROUTES[session.role] || 'student';
    }
    return true; // permite acesso
  }

  // Rota de projeto: exige autenticação, mas qualquer role pode ver
  if (to === 'project') {
    if (!session) return 'login';
    return true;
  }

  // Rotas protegidas: exige sessão
  if (!session) return 'login';

  // Verifica se o role do usuário tem permissão para a rota
  const allowedRoute = ROLE_ROUTES[session.role];
  if (to !== allowedRoute && to !== 'project') {
    return allowedRoute || 'login';
  }

  return true;
});

// ══════════════════════════════════════════════════════════════════════════════
// 5) Inicializa o router (resolve a rota do hash ou vai para landing)
// ══════════════════════════════════════════════════════════════════════════════
initRouter();

console.info(
  '%c🎓 OBSENAC%c v1.0 – Plataforma de Continuidade e Gestão de Projetos Acadêmicos',
  'font-weight:bold;font-size:14px;color:#1E4080',
  'font-size:12px;color:#6B7280'
);
console.info(
  '%cCredenciais de teste:',
  'font-weight:bold;color:#F06A00',
  '\n  Coordenador: carlos.mendes@instituicao.edu.br / 123456',
  '\n  Professor:   ana.lima@instituicao.edu.br / 123456',
  '\n  Aluno:       lucas.ferreira@aluno.edu.br / 123456'
);

// ══════════════════════════════════════════════════════════════════════════════
// Lógica de Modo Demo
// ══════════════════════════════════════════════════════════════════════════════
function updateDemoSwitcher() {
  const session = getSession();
  const isDemo = localStorage.getItem('obsenac_is_demo') === 'true';
  const switcher = document.getElementById('demo-switcher');
  if (session && isDemo) {
    switcher?.classList.remove('hidden');
    const select = document.getElementById('demo-role-select');
    if (select) select.value = session.role;
  } else {
    switcher?.classList.add('hidden');
  }
}

// Executa no boot inicial
updateDemoSwitcher();

// Escuta a troca de visão no seletor
document.getElementById('demo-role-select')?.addEventListener('change', async (e) => {
  const selectedRole = e.target.value;
  await switchDemoUser(selectedRole);
});

async function switchDemoUser(role) {
  const { get, set, KEYS } = await import('./services/storage.js');
  const { navigate } = await import('./modules/router.js');
  const { showToast } = await import('./modules/ui.js');
  
  const users = get(KEYS.USERS, []);
  const emailMap = {
    aluno: 'lucas.ferreira@aluno.edu.br',
    professor: 'ana.lima@instituicao.edu.br',
    coordenador: 'carlos.mendes@instituicao.edu.br'
  };
  const targetEmail = emailMap[role];
  const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
  
  if (user) {
    const { password: _pw, ...safeUser } = user;
    set(KEYS.SESSION, safeUser);
    
    showToast('Visão Alterada', `Agora você está visualizando como ${role === 'aluno' ? 'Aluno' : role === 'professor' ? 'Professor' : 'Coordenador'}!`, 'success');
    
    const roleRoutes = { aluno: 'student', professor: 'professor', coordenador: 'admin' };
    navigate(roleRoutes[role]);
  }
}
