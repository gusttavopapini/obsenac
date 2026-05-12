/**
 * landingView.js – Página inicial pública da plataforma.
 */

import { navigate }  from '../modules/router.js';

export function renderLanding() {
  // Esconde a navbar (é uma página pública)
  document.getElementById('navbar').classList.add('hidden');

  document.getElementById('view-root').innerHTML = `
    <div class="landing-root">

      <!-- HERO -->
      <section class="landing-hero">
        <div class="hero-bg-gradient"></div>
        <div class="hero-bg-orbs">
          <div class="hero-orb hero-orb-1"></div>
          <div class="hero-orb hero-orb-2"></div>
        </div>

        <!-- Nav pública -->
        <nav class="landing-nav" aria-label="Navegação principal">
          <div class="landing-nav-brand">
            <span class="landing-nav-logo" aria-hidden="true"></span>
            <span class="landing-nav-name">PC<span>GPA</span></span>
          </div>
          <div class="landing-nav-actions">
            <button id="landing-login-btn"    class="btn btn-ghost"   style="color:rgba(255,255,255,0.8)">Entrar</button>
          </div>
        </nav>

        <!-- Conteúdo hero -->
        <div class="hero-content">
          <div class="hero-text animate-fadeInUp">
            <span class="hero-eyebrow">Plataforma Institucional v1.0</span>
            <h1 class="hero-h1">Dê <span>continuidade</span> ao que importa na academia</h1>
            <p class="hero-desc">
              A PCGPA conecta alunos, professores e coordenação para garantir que nenhum projeto acadêmico seja abandonado ao fim do semestre. Gerencie equipes, valide entregas e encontre seu match de habilidades.
            </p>
            <div class="hero-cta">
              <button id="hero-start-btn" class="btn btn-accent btn-lg">Começar agora →</button>
              <button id="hero-learn-btn" class="btn btn-outline btn-lg" style="border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.85)">Como funciona</button>
            </div>
          </div>

          <div class="hero-visual animate-slideRight">
            <div class="hero-card-preview animate-float">
              <div class="hero-card-label">Match encontrado!</div>
              <div class="hero-project-title">IA para Diagnóstico Médico por Imagem</div>
              <div class="hero-project-meta">
                <span class="badge badge-orange">Em Continuidade</span>
                <span class="badge badge-gray">2025.1</span>
              </div>
              <div class="hero-skill-chips" style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1rem">
                <span class="hero-skill-chip">Python</span>
                <span class="hero-skill-chip">TensorFlow</span>
                <span class="hero-skill-chip">Machine Learning</span>
              </div>
              <div class="hero-match-row">
                <span class="hero-match-icon">*</span>
                <div class="hero-match-info">
                  <div class="hero-match-label">Compatibilidade de habilidades</div>
                  <div class="hero-match-value">3 de 3 skills em comum</div>
                </div>
              </div>
            </div>

            <div class="hero-card-preview" style="opacity:0.7;transform:scale(0.97)">
              <div class="hero-card-label">Progresso da equipe</div>
              <div class="hero-project-title">Monitoramento de Qualidade do Ar – IoT</div>
              <div style="margin-top:0.75rem">
                <div class="progress-bar"><div class="progress-fill" style="width:72%"></div></div>
                <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:0.4rem">72% concluído · 3 integrantes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="landing-features" id="features">
        <div class="features-inner">
          <p class="features-label">Funcionalidades</p>
          <h2 class="features-title">Tudo que sua pesquisa precisa</h2>
          <p class="features-desc">Uma plataforma completa para cada perfil acadêmico, do aluno ao coordenador.</p>
          <div class="features-grid">
            ${[
              { icon:'', title:'Continuidade Garantida', desc:'Projetos não morrem ao fim do semestre. O histórico completo é preservado e a equipe pode ser renovada com novos alunos.' },
              { icon:'', title:'Match de Habilidades',   desc:'Nosso algoritmo conecta alunos às equipes certas com base nas skills do perfil, maximizando o aproveitamento de talentos.' },
              { icon:'', title:'Dashboard Analítico',    desc:'Coordenadores visualizam métricas em tempo real: projetos ativos, em continuidade, equipes e progresso por semestre.' },
              { icon:'', title:'Validação Docente',      desc:'Professores orientadores validam a continuidade de cada projeto ao fim do semestre com um clique, gerando registro no histórico.' },
              { icon:'', title:'Controle de Acesso',     desc:'Sistema de roles com 3 níveis: Aluno, Professor e Coordenador. Aprovação de novos cadastros pela coordenação.' },
              { icon:'', title:'Histórico de Versões',   desc:'Cada projeto mantém uma linha do tempo detalhada de todos os eventos, integrantes e validações ao longo dos semestres.' },
            ].map(f => `
              <div class="feature-item">
                <div class="feature-icon-wrap">${f.icon}</div>
                <h3 class="feature-title">${f.title}</h3>
                <p class="feature-desc">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ROLES -->
      <section class="landing-roles">
        <div class="roles-inner">
          <h2 class="roles-heading">Uma plataforma, três perfis</h2>
          <div class="roles-grid">
            <div class="role-card">
              <div class="role-emoji"></div>
              <h3 class="role-name">Aluno</h3>
              <p class="role-desc">Crie e gerencie seus projetos, cadastre suas habilidades e encontre equipes que precisam do seu perfil.</p>
            </div>
            <div class="role-card">
              <div class="role-emoji"></div>
              <h3 class="role-name">Professor</h3>
              <p class="role-desc">Acompanhe o progresso das equipes que você orienta e valide a continuidade ao fim de cada semestre.</p>
            </div>
            <div class="role-card">
              <div class="role-emoji"></div>
              <h3 class="role-name">Coordenador</h3>
              <p class="role-desc">Aprove cadastros, gerencie usuários e monitore todas as métricas da plataforma em um painel central.</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="landing-footer">
        <p>© ${new Date().getFullYear()} PCGPA – Plataforma de Continuidade e Gestão de Projetos Acadêmicos. Todos os direitos reservados.</p>
      </footer>

    </div>
  `;

  // ── Event Listeners ───────────────────────────────────────────────────────
  document.getElementById('landing-login-btn')?.addEventListener('click',    () => navigate('login'));
  document.getElementById('hero-start-btn')?.addEventListener('click',       () => navigate('login'));
  document.getElementById('hero-learn-btn')?.addEventListener('click', () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  });
}
