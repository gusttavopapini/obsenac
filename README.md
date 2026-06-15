<div align="center">

# 🎓 OBSENAC

### Academic Project Continuity & Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

**OBSENAC** is a web platform that connects students, professors, and coordinators to ensure academic projects never die at the end of a semester. Manage teams, validate deliveries, and find your perfect skill match.

[🌐 Live Demo](#) · [📖 Documentation (PT-BR)](docs/LEIAME.md) · [🐛 Report a Bug](https://github.com/gusttavopapini/obsenac/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database (Firebase Firestore)](#-database-firebase-firestore)
- [User Roles](#-user-roles)
- [Services & Architecture](#-services--architecture)
- [Demo Credentials](#-demo-credentials)
- [Deployment (GitHub Pages)](#-deployment-github-pages)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

OBSENAC (**OB**servatory of **SENAC** Academic Projects) was built to solve a recurring problem in academic institutions: **research and extension projects are abandoned at the end of every semester** because there is no structured way to hand them off to new students or continue them across multiple academic terms.

The platform provides:
- A **centralized registry** of all institutional projects with their full history
- A **skills-based matching algorithm** that connects students to projects that need their expertise
- **Role-based access control** so each stakeholder sees exactly what they need
- **Professor-led continuity validation** with an auditable changelog for every project

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔄 **Project Continuity** | Projects survive semester transitions with full history preserved |
| 🧠 **Skills Match** | Algorithm connects students to projects based on skill compatibility |
| 📊 **Analytics Dashboard** | Coordinators monitor real-time metrics across all projects and users |
| ✅ **Docent Validation** | Professors approve continuity with one click, generating an audit trail |
| 👥 **Team Management** | Track members, advisors, and semesters per project |
| 🔐 **Role-Based Access** | Three-tier access: Student, Professor, Coordinator |
| 📝 **Project History** | Full timeline of events, members, and validations per project |
| 🔔 **Toast Notifications** | Elegant real-time feedback for all user actions |
| 📱 **Responsive Design** | Fully functional on desktop, tablet, and mobile |
| ☁️ **Cloud Database** | Firebase Firestore stores all data online, shared across devices |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Structure** | HTML5 (Semantic) | SPA shell, views, modals |
| **Styling** | Vanilla CSS (custom design system) | Variables, components, animations |
| **Logic** | JavaScript ES6+ (ES Modules) | Routing, services, views |
| **Database** | Firebase Firestore | Cloud NoSQL storage |
| **Fonts** | Google Fonts (Inter, Outfit) | Typography |
| **Hosting** | GitHub Pages | Static site deployment |
| **CI/CD** | GitHub Actions | Automatic deploy on push |

> **No framework, no bundler, no build step.** The project runs as pure HTML/CSS/JS — open `index.html` and it just works.

---

## 📁 Project Structure

```
obsenac/
│
├── index.html                  # SPA entry point — single HTML shell
├── favicon.svg                 # Brand icon
├── README.md                   # This file (English)
│
├── css/                        # Stylesheet modules (load order matters)
│   ├── variables.css           # Design tokens: colors, spacing, shadows
│   ├── reset.css               # CSS reset & base styles
│   ├── components.css          # Buttons, cards, badges, forms, tables
│   ├── layout.css              # Navbar, dashboard grid, section layouts
│   ├── views.css               # Landing page, auth, project cards
│   ├── animations.css          # Fade, slide, float keyframe animations
│   └── responsive.css          # Breakpoints for tablet and mobile
│
├── js/
│   ├── app.js                  # Entry point: boot, routes, guards, demo mode
│   │
│   ├── modules/                # Reusable framework-level utilities
│   │   ├── router.js           # Hash-based SPA router with guards
│   │   └── ui.js               # Modal, toast, tags-input, form helpers
│   │
│   ├── services/               # Business logic & data access layer
│   │   ├── firebase.js         # Firebase SDK init & Firestore export
│   │   ├── storage.js          # Data abstraction (Firestore CRUD wrappers)
│   │   ├── auth.js             # Login, register, session management
│   │   ├── projectService.js   # Project CRUD, skills match, metrics
│   │   ├── userService.js      # User CRUD, status management
│   │   └── seed.js             # Initial demo data (runs once on first boot)
│   │
│   └── views/                  # Page renderers (one per route)
│       ├── landingView.js      # Public landing page
│       ├── authView.js         # Login & role-redirect
│       ├── studentView.js      # Student dashboard (projects, match, profile)
│       ├── professorView.js    # Professor dashboard (teams, validation)
│       ├── adminView.js        # Coordinator dashboard (users, metrics, projects)
│       └── projectDetailView.js # Project detail & full history timeline
│
└── docs/
    ├── README.md               # This file (English)
    └── LEIAME.md               # Full documentation in Portuguese (PT-BR)
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A [Firebase account](https://firebase.google.com/) (free, Google account required)
- A [GitHub account](https://github.com/) for deployment

### 1. Clone the repository

```bash
git clone https://github.com/gusttavopapini/obsenac.git
cd obsenac
```

### 2. Set up Firebase

> **Why Firebase?** It's free, has no server required, stores data online so any device can access it, and has a visual console to inspect your data.

#### Step 2.1 – Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it `obsenac` (or anything you like)
4. Disable Google Analytics (not needed) → Click **"Create project"**

#### Step 2.2 – Create a Firestore database

1. In the left sidebar → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a region close to you → **"Done"**

#### Step 2.3 – Register a Web App & get your config

1. Go to **Project settings** (gear icon ⚙️ at top left)
2. Under "Your apps", click **"Add app"** → choose the **Web** icon (`</>`)
3. Name it `obsenac-web` → **"Register app"**
4. Copy the `firebaseConfig` object shown:

```javascript
// It looks like this — yours will have different values:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "obsenac.firebaseapp.com",
  projectId: "obsenac",
  storageBucket: "obsenac.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### Step 2.4 – Add your config to the project

Open `js/services/firebase.js` and replace the placeholder config with yours:

```javascript
// js/services/firebase.js
import { initializeApp }    from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }     from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  // ✅ PASTE YOUR CONFIG HERE
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 3. Run locally

Since this is pure HTML/JS, you can open it with any static server. The simplest option:

```bash
# Option A: Python (usually pre-installed on Mac/Linux)
python3 -m http.server 8080
# Then open: http://localhost:8080

# Option B: Node.js
npx serve .
# Then open the URL shown in the terminal

# Option C: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

> ⚠️ **Important:** Don't open `index.html` directly with `file://` — Firebase and ES Modules require a proper HTTP server.

### 4. First run & seed data

On the first run, the app checks if the Firestore collections are empty. If they are, it automatically populates the database with **8 demo users** and **5 demo projects** so you can explore all features immediately.

You can watch this happen live in the **Firebase Console → Firestore Database** tab.

---

## 🗄 Database (Firebase Firestore)

Firestore is a **NoSQL document database**. Think of it as a collection of JSON objects stored in the cloud.

### Collections

```
firestore/
├── users/          # One document per user
│   └── {userId}
│       ├── id          (string)   e.g. "u1"
│       ├── name        (string)   e.g. "Lucas Ferreira"
│       ├── email       (string)   e.g. "lucas@aluno.edu.br"
│       ├── password    (string)   hashed (SHA-256)
│       ├── role        (string)   "aluno" | "professor" | "coordenador"
│       ├── status      (string)   "pending" | "approved" | "blocked"
│       ├── skills      (array)    ["React", "Python", ...]
│       └── createdAt   (string)   ISO 8601 timestamp
│
└── projects/       # One document per project
    └── {projectId}
        ├── id          (string)   e.g. "p1"
        ├── title       (string)
        ├── objective   (string)
        ├── status      (string)   see Status Values below
        ├── skills      (array)    required skills
        ├── ownerId     (string)   references users/{id}
        ├── advisorId   (string)   references users/{id} or null
        ├── members     (array)    list of user IDs
        ├── semester    (string)   e.g. "2025.1"
        ├── createdAt   (string)   ISO 8601 timestamp
        └── history     (array)    list of { date, event, desc, authorId }
```

### Project Status Values

| Code | Label | Meaning |
|---|---|---|
| `em_desenvolvimento` | In Development | Actively being worked on |
| `em_continuidade` | In Continuity | Continuing from a previous semester |
| `aguardando_equipe` | Waiting for Team | Looking for members |
| `concluido` | Completed | Finished and archived |
| `cancelado` | Cancelled | Discontinued |

### Firestore Security Rules (recommended for production)

After testing, replace the default rules in the Firebase Console → **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: anyone can read, only authenticated writes (simplified)
    match /users/{userId} {
      allow read: if true;
      allow write: if true; // tighten this in production
    }

    // Projects: public read, authenticated write
    match /projects/{projectId} {
      allow read: if true;
      allow write: if true; // tighten this in production
    }
  }
}
```

---

## 👥 User Roles

OBSENAC has three access levels, each with its own dashboard:

### 🎒 Student (`aluno`)
- Create and manage their own projects
- Register skills in their profile
- See the **skills match** feed — projects that need their expertise
- View full project details and history

### 👨‍🏫 Professor (`professor`)
- See all projects they advise
- **Validate project continuity** (transitions project status to `em_continuidade`)
- View all platform projects in read-only mode

### 🏛 Coordinator (`coordenador`)
- Full **user management**: approve, block, or create users
- View **platform-wide analytics**: project counts by status, user stats
- Access **all projects** with ability to navigate to any detail page
- See pending registration approvals on the main dashboard

---

## 🏗 Services & Architecture

OBSENAC follows a **service-layer architecture** — all data access goes through dedicated service modules, never directly from views.

```
Views (UI rendering)
    ↓  call
Services (business logic)
    ↓  call
firebase.js / storage.js (data layer → Firestore)
```

### `js/services/firebase.js`
Initializes the Firebase SDK and exports the `db` (Firestore) instance used by all other services.

### `js/services/storage.js`
Thin async wrapper over Firestore — exposes `get(collection)`, `set(collection, id, data)`, `remove(collection, id)`, and the `KEYS` constants (`USERS`, `PROJECTS`).

### `js/services/auth.js`
- `login(email, password)` — Finds user in Firestore, validates credentials, saves session in `sessionStorage`
- `register(data)` — Creates user with `pending` status, awaiting coordinator approval
- `getSession()` — Returns the current logged-in user from `sessionStorage`
- `logout()` — Clears session

### `js/services/projectService.js`
- `getAllProjects()` — Fetches all projects from Firestore
- `getProjectById(id)` — Single project lookup
- `getProjectsByOwner(userId)` — Student's own projects
- `getProjectsByAdvisor(advisorId)` — Professor's advised projects
- `getMatchingProjects(userSkills, excludeOwnerId)` — **Skills match algorithm**: returns projects sorted by number of matching skills
- `createProject(data)` — Creates project with initial history entry
- `updateProject(id, updates, historyEntry?)` — Partial update with optional audit log
- `validateContinuity(projectId, professorId, professorName)` — Changes status + logs professor validation
- `deleteProject(id)` — Hard delete
- `getMetrics()` — Aggregate stats for the coordinator dashboard

### `js/services/userService.js`
- `getAllUsers()` — All users (passwords excluded)
- `getUserById(id)` — Single user (no password)
- `setUserStatus(userId, status)` — Approve, block, or reset a user
- `updateProfile(userId, data)` — Update name and skills
- `createUserByAdmin(data)` — Admin-only user creation (status `approved` immediately)

### `js/modules/router.js`
Hash-based SPA router (`#landing`, `#login`, `#student`, etc.) with:
- `route(name, handler)` — Register a route
- `beforeEach(guard)` — Navigation guard for auth protection
- `navigate(name, params?)` — Programmatic navigation
- `initRouter()` — Boot the router from the current URL hash

### `js/modules/ui.js`
Shared UI utilities:
- `showToast(title, message, type)` — Non-blocking notifications
- `openModal(html)` / `closeModal()` — Global modal system
- `initTagsInput(wrapper, initialTags)` — Tag input widget for skills
- `escapeHtml(str)` — XSS protection
- `formatDate(iso)` — Locale-friendly date formatting
- `getInitials(name)` — Avatar initials

---

## 🔑 Demo Credentials

These accounts are auto-created on the first run via `seed.js`:

| Role | Email | Password |
|---|---|---|
| **Coordinator** | `carlos.mendes@instituicao.edu.br` | `123456` |
| **Professor** | `ana.lima@instituicao.edu.br` | `123456` |
| **Student** | `lucas.ferreira@aluno.edu.br` | `123456` |

> 💡 **Demo Mode:** After logging in, a role switcher appears in the navbar so you can switch between all three views without logging out.

### Accepted Email Domains

Only institutional email addresses are allowed for registration:
- `@instituicao.edu.br`
- `@aluno.edu.br`
- `@prof.edu.br`

---

## 🌐 Deployment (GitHub Pages)

The project is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

### How it works

The workflow file at `.github/workflows/deploy.yml` triggers on every push to `main` and deploys the static files to the `gh-pages` branch, which GitHub Pages serves publicly.

### Manual setup (one-time)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: add Firebase integration"
   git push origin main
   ```

2. In your GitHub repository → **Settings** → **Pages**
3. Under "Source", select **"Deploy from a branch"**
4. Choose branch: **`gh-pages`** → folder: **`/ (root)`**
5. Click **Save**

After the first GitHub Actions run completes (~1 minute), your site will be live at:
```
https://gusttavopapini.github.io/obsenac/
```

### Automatic deploys

Every subsequent `git push origin main` will trigger a new deploy automatically — no manual steps needed.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `style:` | CSS/UI changes |
| `refactor:` | Code restructure without behavior change |
| `docs:` | Documentation changes |
| `chore:` | Config, tooling, dependencies |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for academic continuity · **OBSENAC v1.0**

[⬆ Back to top](#-obsenac)

</div>
