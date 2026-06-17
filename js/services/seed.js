import { db, collection, getDocs, doc, setDoc } from './firebase.js';

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
        desc: 'Prof. Bruno Costa validou o progresso e aprovou a continuidade. A equipe conseguiu concluir a prototipagem dos sensores e enviar dados para o servidor na nuvem.',
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
    members: ['u5', 'u4'],
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
        desc: 'Modelo base com acurácia de 82%. Profa. Ana Lima recomendou continuidade para focar em fine-tuning e deployment.',
        authorId: 'u2',
      },
      {
        date: '2024-08-05T10:00:00.000Z',
        event: 'Retomada no semestre 2024.2',
        desc: 'Juliana retomou o projeto com foco em aumentar a acurácia para 90%.',
        authorId: 'u5',
      },
      {
        date: '2024-08-10T10:00:00.000Z',
        event: 'Novo membro integrado',
        desc: 'Lucas Ferreira ingressou na equipe para desenvolver a interface web e API do modelo de predição.',
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
    members: ['u4', 'u6'],
    semester: '2024.2',
    createdAt: '2024-08-20T10:00:00.000Z',
    history: [
      {
        date: '2024-08-20T10:00:00.000Z',
        event: 'Projeto criado',
        desc: 'Lucas Ferreira iniciou o desenvolvimento do MVP utilizando React Native.',
        authorId: 'u4',
      },
      {
        date: '2024-09-05T10:00:00.000Z',
        event: 'Rafael Souza entrou no time',
        desc: 'Rafael assumiu a liderança na parte de infraestrutura e otimização de banco de dados.',
        authorId: 'u4',
      },
      {
        date: '2024-10-10T10:00:00.000Z',
        event: 'Revisão com o Professor',
        desc: 'Profa. Ana Lima avaliou a estrutura do banco e a modelagem do aplicativo, solicitando algumas melhorias na segurança dos dados.',
        authorId: 'u2',
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
        desc: 'Equipe formada por Juliana e Lucas no semestre 2023.2, com início do levantamento bibliográfico.',
        authorId: 'u5',
      },
      {
        date: '2023-10-20T10:00:00.000Z',
        event: 'Finalização do modelo base',
        desc: 'O primeiro pipeline de dados foi construído com sucesso, alcançando resultados parciais satisfatórios.',
        authorId: 'u4',
      },
      {
        date: '2023-12-15T10:00:00.000Z',
        event: 'Projeto concluído com aprovação máxima',
        desc: 'Trabalho publicado no simpósio interno e marcado como concluído. Excelente contribuição da equipe.',
        authorId: 'u2',
      },
    ],
  },
  {
    id: 'p5',
    title: 'Sistema de Autenticação Biométrica Centralizada',
    objective:
      'Construir um sistema seguro utilizando C++ e bibliotecas de biometria para unificar acessos nos laboratórios do campus.',
    status: 'aguardando_equipe',
    skills: ['C++', 'Segurança da Informação', 'Banco de Dados'],
    ownerId: 'u6',
    advisorId: 'u3',
    members: ['u6'],
    semester: '2024.2',
    createdAt: '2024-09-01T10:00:00.000Z',
    history: [
      {
        date: '2024-09-01T10:00:00.000Z',
        event: 'Projeto proposto',
        desc: 'Rafael Souza elaborou a documentação inicial do sistema.',
        authorId: 'u6',
      },
      {
        date: '2024-09-15T10:00:00.000Z',
        event: 'Revisão inicial',
        desc: 'Prof. Bruno Costa revisou a arquitetura de segurança e o projeto está aguardando mais membros para o desenvolvimento backend.',
        authorId: 'u3',
      },
    ],
  },
];

/**
 * Inicializa o banco de dados local se ainda não existir.
 * Chamado uma única vez na inicialização do app.
 */
export async function seedDatabase() {
  try {
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    if (usersSnapshot.empty) {
      console.info('[Seed] Populando usuários no Firestore...');
      for (const u of SEED_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
      console.info('[Seed] Usuários inicializados no Firestore.');
    }

    const projectsCol = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsCol);
    if (projectsSnapshot.empty) {
      console.info('[Seed] Populando projetos no Firestore...');
      for (const p of SEED_PROJECTS) {
        await setDoc(doc(db, 'projects', p.id), p);
      }
      console.info('[Seed] Projetos inicializados no Firestore.');
    }
  } catch (e) {
    console.error('[Seed] Erro ao popular banco de dados (provavelmente erro de autenticação ou falta de configuração do Firebase):', e);
  }
}

