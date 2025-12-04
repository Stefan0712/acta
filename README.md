# 🛒 Docket

![Status](https://img.shields.io/badge/Status-Active_Development-orange) ![Tech](https://img.shields.io/badge/Tech-React_19_|_TypeScript-blue) ![License](https://img.shields.io/badge/License-MIT-green)

> **A minimal but powerful shopping list app designed for easy group collaboration and offline-first reliability.**

<p align="center">
  <img src="https://i.imgur.com/Zd3qWYm.png" width="32%" alt="Shopping List" />
  <img src="https://i.imgur.com/nDvxIa7.png" width="32%" alt="Item Details" />
  <img src="https://i.imgur.com/VTqMDFV.png" width="32%" alt="Categories" />
</p>

---

## 🛠️ Tech Stack

* **Core:** React 19, Vite
* **Language:** TypeScript
* **Data:** Dexie.js (IndexedDB Wrapper)
* **Routing:** React Router v7
* **Utilities:** BSON (ID generation)

---

## 💡 Key Technical Highlights

* **Local-First Architecture:** Built using **Dexie.js** to ensure the app works flawlessly offline with zero latency.
* **Type Safety:** Fully typed codebase using **TypeScript** interfaces for Group, List, and Item models to prevent runtime errors.
* **Optimistic UI:** State updates immediately for the user while persisting data in the background.
* **Relational Data in NoSQL:** Designed a normalized database schema (Groups ↔ Lists ↔ Items) within IndexedDB to support future multi-user synchronization.

---

## 🚧 Current Status & Roadmap

This project is currently in **Phase 2** of development. I am currently implementing the Group/Notification logic, after which I will develop the backend API.

### Version 0.1: Core MVP (✅ Completed)
- [x] Local Data Storage (Offline capability)
- [x] Minimal local profile
- [x] Shopping Lists & Items
- [x] Custom Categories and Stores

### Version 0.2: Groups and Notifications (🚧 In Progress)
- [x] Data modeling for Groups
- [x] Group list page
- [ ] Group details page
- [ ] Activity logs and filters
- [ ] Group notes & polls
- [ ] Logic for assigning and claiming list items

### Version 0.3: API and Auth (📝 Planned)
- [ ] Login / Register page
- [ ] Authentication routes
- [ ] CRUD Endpoints (Lists, items, groups, notes)
- [ ] Sync logic (Local ↔ API)

### Version 0.4: Polishing (📝 Planned)
- [ ] Adaptive Layouts (Mobile/Desktop)
- [ ] Accessibility Improvements (A11y)
- [ ] Light Theme
- [ ] JSON Import/Export

### Version 0.5: Quality of Life (📝 Planned)
- [ ] User Dashboard (Assignments/Activity)
- [ ] Calendar View
- [ ] PDF Export for printable lists

---

## 🚀 How to Run Locally

Since the backend is undergoing changes, the frontend can be run in **Standalone Mode**:

1. Clone the repository
   ```bash
   git clone [https://github.com/Stefan0712/docket.git](https://github.com/Stefan0712/docket.git)
2. Install dependencies
   ```bash
   npm install
3. Start the development server
   ```bash
   npm run dev

## 👤 Author
Stefan Vladulescu
Portfolio: stefanvladulescu.com

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
