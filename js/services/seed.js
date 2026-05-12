/**
 * seed.js – Dados iniciais (seed) da plataforma.
 * Popula o localStorage na primeira execução com usuários e projetos de exemplo.
 */

import { get, set, KEYS } from './storage.js';

// ── Usuários de exemplo ───────────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@instituicao.edu.br',
    password: '123456',
    role: 'coordenador',
    status: 'approved',
    skills: [],
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Profa. Ana Lima',
    email: 'ana.lima@instituicao.edu.br',
    password: '123456',
    role: 'professor',
    status: 'approved',
    skills: ['Metodologia de Pesquisa', 'Python', 'Machine Learning'],
    createdAt: '2024-01-12T10:00:00.000Z',
  },
  {
    id: 'u3',
    name: 'Prof. Bruno Costa',
    email: 'bruno.costa@instituicao.edu.br',
    password: '123456',
    role: 'professor',
    status: 'approved',
    skills: ['Redes', 'IoT', 'Segurança da Informação'],
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'u4',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@aluno.edu.br',
    password: '123456',
    role: 'aluno',
    status: 'approved',
    skills: ['React', 'Node.js', 'Python', 'Banco de Dados'],
    createdAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'u5',
    name: 'Juliana Rocha',
    email: 'juliana.rocha@aluno.edu.br',
    password: '123456',
    role: 'aluno',
    status: 'approved',
    skills: ['Machine Learning', 'Python', 'Análise de Dados', 'TensorFlow'],
    createdAt: '2024-02-03T10:00:00.000Z',
  },
  {
    id: 'u6',
    name: 'Rafael Souza',
    email: 'rafael.souza@aluno.edu.br',
    password: '123456',
    role: 'aluno',
    status: 'approved',
    skills: ['IoT', 'C++', 'Arduino', 'Redes'],
    createdAt: '2024-02-05T10:00:00.000Z',
  },
  {
    id: 'u7',
    name: 'Mariana Oliveira',
    email: 'mariana.oliveira@aluno.edu.br',
    password: '123456',
    role: 'aluno',
    status: 'pending',
    skills: ['UI/UX', 'Figma', 'CSS'],
    createdAt: '2024-03-10T10:00:00.000Z',
  },
  {
    id: 'u8',
    name: 'Pedro Alves',
    email: 'pedro.alves@aluno.edu.br',
    password: '123456',
    role: 'aluno',
    status: 'blocked',
    skills: ['Java', 'Spring Boot'],
    createdAt: '2024-02-20T10:00:00.000Z',
  },
];

// ── Projetos de exemplo ───────────────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    id: 'p1',
    title: 'Sistema de Monitoramento de Qualidade do Ar com IoT',
    objective:
      'Desenvolver uma rede de sensores IoT para monitorar em tempo real a qualidade do ar em ambientes urbanos, gerando dashboards e alertas automáticos.',
    status: 'em_desenvolvimento',
    skills: ['IoT', 'Python', 'Arduino', 'Banco de Dados', 'Redes'],
    ownerId: 'u4',
    advisorId: 'u3',
    members: ['u4', 'u6'],
    semester: '2024.1',
    createdAt: '2024-02-10T10:00:00.000Z',
    history: [
      {
        date: '2024-02-10T10:00:00.000Z',
        event: 'Projeto criado',
        desc: 'Lucas Ferreira iniciou o projeto no semestre 2024.1.',
        authorId: 'u4',
      },
      {
        date: '2024-03-01T10:00:00.000Z',
        event: 'Rafael Souza entrou no time',
        desc: 'Rafael passou a integrar a equipe como especialista em hardware.',
        authorId: 'u4',
      },
      {
        date: '2024-06-20T10:00:00.000Z',
        event: 'Validado pelo professor para continuidade',
        desc: 'Prof. Bruno Costa validou o progresso e aprovou a continuidade.',
        authorId: 'u3',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Plataforma de Diagnóstico de Doenças via Imagem com IA',
    objective:
      'Criar um modelo de Machine Learning capaz de identificar padrões em imagens médicas (raios-X) para auxiliar no diagnóstico precoce de pneumonia.',
    status: 'em_continuidade',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Análise de Dados'],
    ownerId: 'u5',
    advisorId: 'u2',
    members: ['u5'],
    semester: '2024.2',
    createdAt: '2024-02-15T10:00:00.000Z',
    history: [
      {
        date: '2024-02-15T10:00:00.000Z',
        event: 'Projeto criado',
        desc: 'Juliana Rocha iniciou a pesquisa com dados públicos de radiologia.',
        authorId: 'u5',
      },
      {
        date: '2024-06-30T10:00:00.000Z',
        event: 'Encerramento do semestre 2024.1',
        desc: 'Modelo com acurácia de 82%. Profa. Ana Lima recomendou continuidade.',
        authorId: 'u2',
      },
      {
        date: '2024-08-05T10:00:00.000Z',
        event: 'Retomada no semestre 2024.2',
        desc: 'Juliana retomou o projeto com foco em aumentar a acurácia para 90%.',
        authorId: 'u5',
      },
    ],
  },
  {
    id: 'p3',
    title: 'App Mobile de Gestão de Resíduos para Cooperativas',
    objective:
      'Desenvolver um aplicativo mobile que conecte cooperativas de reciclagem a geradores de resíduos, otimizando as rotas de coleta e o controle de materiais.',
    status: 'em_desenvolvimento',
    skills: ['React', 'Node.js', 'Banco de Dados', 'UI/UX'],
    ownerId: 'u4',
    advisorId: 'u2',
    members: ['u4'],
    semester: '2024.2',
    createdAt: '2024-08-20T10:00:00.000Z',
    history: [
      {
        date: '2024-08-20T10:00:00.000Z',
        event: 'Projeto criado',
        desc: 'Lucas Ferreira iniciou o desenvolvimento do MVP.',
        authorId: 'u4',
      },
    ],
  },
  {
    id: 'p4',
    title: 'Análise Preditiva de Evasão Escolar',
    objective:
      'Utilizar técnicas de data mining e ML para identificar alunos com alto risco de evasão, permitindo intervenções precoces pela instituição.',
    status: 'concluido',
    skills: ['Machine Learning', 'Python', 'Análise de Dados', 'Banco de Dados'],
    ownerId: 'u5',
    advisorId: 'u2',
    members: ['u5', 'u4'],
    semester: '2023.2',
    createdAt: '2023-08-10T10:00:00.000Z',
    history: [
      {
        date: '2023-08-10T10:00:00.000Z',
        event: 'Projeto criado',
        desc: 'Equipe formada por Juliana e Lucas no semestre 2023.2.',
        authorId: 'u5',
      },
      {
        date: '2023-12-15T10:00:00.000Z',
        event: 'Projeto concluído com aprovação máxima',
        desc: 'Trabalho publicado no simpósio interno e marcado como concluído.',
        authorId: 'u2',
      },
    ],
  },
];

/**
 * Inicializa o banco de dados local se ainda não existir.
 * Chamado uma única vez na inicialização do app.
 */
export function seedDatabase() {
  if (!get(KEYS.USERS)) {
    set(KEYS.USERS, SEED_USERS);
    console.info('[Seed] Usuários inicializados:', SEED_USERS.length);
  }
  if (!get(KEYS.PROJECTS)) {
    set(KEYS.PROJECTS, SEED_PROJECTS);
    console.info('[Seed] Projetos inicializados:', SEED_PROJECTS.length);
  }
}
