# 🎓 OBSENAC: Academic Project Continuity & Management Platform

> A role-based web platform that connects students, professors, and coordinators to ensure no academic research or extension project is abandoned at the end of a semester. Developed as a final project for the **[Course Name]** course at **[University / SENAC]**.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20JS-yellow)](https://developer.mozilla.org/en-US/)
[![Database](https://img.shields.io/badge/database-Firebase%20Firestore-orange)](https://firebase.google.com/)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://pages.github.com/)

---

## 📋 Project Overview

**OBSENAC** is a Single Page Application (SPA) built to solve a recurring institutional problem: research and extension projects are abandoned at the end of every semester because there is no structured way to hand them off to new students or preserve their progress across academic terms.

Our solution provides a **centralized registry** for all institutional projects, a **skills-based matching algorithm** that connects students to projects needing their expertise, and a **professor-led continuity validation** flow with a full audit trail — all running in the browser with no backend server required.

### Key Features
* **Project Continuity:** Projects survive semester transitions with their full history preserved.
* **Skills Match System:** An algorithm ranks projects by skill compatibility with the logged-in student.
* **Role-Based Dashboards:** Three distinct views — Student, Professor, and Coordinator — each with relevant tools.
* **Cloud Database:** Firebase Firestore stores all users and projects online, shared across any device.
* **Fail-Safe Offline Session:** The session is stored locally so the UI remains functional even during brief connectivity issues.

---

## 🏗️ System Architecture & Module Breakdown

### Layers of the Application

* **Views Layer** (`js/views/`) — Page renderers, one per route. Each view is a pure function that writes HTML into the DOM.
* **Services Layer** (`js/services/`) — All business logic and data access. Views call services; services call Firestore.
* **Modules Layer** (`js/modules/`) — Reusable framework-level utilities: router, modal system, toast notifications, and form helpers.
* **Styling Layer** (`css/`) — A custom design system built with CSS variables, covering tokens, components, layout, animations, and responsive breakpoints.

### SPA Routing Flow

The app uses a **hash-based router** (`#landing`, `#login`, `#student`, `#professor`, `#admin`, `#project`) with navigation guards that check the user's session and role before rendering any protected view. If the session is invalid or the role doesn't match the requested route, the user is redirected automatically.

---

## 💻 Tech Stack & Software

* **Structure:** HTML5 (Semantic, single-file SPA shell)
* **Styling:** Vanilla CSS with a full custom design system (variables, components, layout, animations, responsive)
* **Logic:** JavaScript ES6+ with native ES Modules — no bundler, no build step
* **Database:** Firebase Firestore (NoSQL cloud document store)
* **Typography:** Google Fonts — Inter & Outfit
* **Hosting:** GitHub Pages (static deploy, zero cost)
* **CI/CD:** GitHub Actions (auto-deploy on every push to `main`)
* **Libraries Used:**
  * Firebase SDK v10 (via CDN — `firebase-app.js`, `firebase-firestore.js`)
  * No other external JavaScript dependencies

---

## ⚙️ Getting Started (Setup Guide)

Follow these steps to run OBSENAC locally or deploy your own instance.

### 1. Prerequisites & Account Setup
1. Install any static file server (e.g., [VS Code Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or Python's `http.server`).
2. Create a free [Google / Firebase account](https://firebase.google.com/).
3. In the [Firebase Console](https://console.firebase.google.com/), create a new project, enable **Firestore Database** in test mode, and register a **Web App** to get your config keys.

### 2. Configuration (`js/services/firebase.js`)
Open `js/services/firebase.js` and replace the placeholder values with your own Firebase project credentials:

```javascript
// js/services/firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
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

### 3. Running the App Locally
* Clone the repository: `git clone https://github.com/gusttavopapini/obsenac.git`
* Open the project folder in VS Code.
* Right-click `index.html` → **"Open with Live Server"** — or run:
```bash
python3 -m http.server 8080
# then open: http://localhost:8080
```
* On first load, the app checks if Firestore is empty and auto-populates it with **8 demo users** and **5 demo projects** via `seed.js`.
* Open the **Serial Monitor** equivalent — the browser DevTools Console (`F12`) — to see seed logs and debug output.

---

## 🗺️ Route & Role Permission Map

| Route | Path (`#`) | Accessible By | Main Action |
|---|---|---|---|
| Landing Page | `#landing` | Public | Entry point, feature overview |
| Login | `#login` | Public | Credential authentication |
| Student Dashboard | `#student` | `aluno` only | Manage projects, view match, edit profile |
| Professor Dashboard | `#professor` | `professor` only | View advised teams, validate continuity |
| Coordinator Dashboard | `#admin` | `coordenador` only | User management, platform metrics |
| Project Detail | `#project?id=` | Any logged-in role | Full project info & history timeline |

---

## 📝 Future Improvements (What We'd Do Next)

If we had another semester, we plan to implement:

* **Firebase Authentication:** Replace the manual credential check with Firebase Auth for a proper, secure sign-in flow with password reset via email.
* **Real-Time Listeners:** Use Firestore `onSnapshot()` instead of one-time reads so all dashboards update live without page refresh.
* **File Attachments:** Allow students to upload project documents (PDFs, reports) directly to Firebase Storage, linked to the project history.
* **Email Notifications:** Trigger automated emails (via Firebase Cloud Functions) when a user is approved or a project continuity is validated.
* **Advanced Analytics:** Add semester-over-semester comparison charts for the Coordinator dashboard.

---

## 👥 Authors (Team Members)

* **[Team Member 1]** — Frontend Architecture & SPA Router — [GitHub](#)
* **[Team Member 2]** — Firebase Integration & Data Services — [GitHub](#)
* **[Team Member 3]** — UI/UX Design & CSS Design System — [GitHub](#)

Project Mentor: [Mentor Name]  
Tech English Course Professor: [Professor Name]

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
