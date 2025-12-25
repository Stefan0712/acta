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

### What works

1. Local lists and items: The user can crete an unlimited amount of lists, each with its own list of items, without any API connection
2. Auth: You can login or create an account with an email address, username, and password. JWT is used for a simple auth system
3. Groups: Logged in users can create or join groups.
   1. Users can create, edit, view, and delete groups
   2. Invite links can be created to invite other users
   3. Each member has its own role and permissions are granted based on that role
   4. Each group has its own lists, notes, and polls.
   5. All group activity is recorded as Activity Logs


### What is next

1. Notifications: Alerts received by the user locally
2. Dashboard: User's dashboard is not 100% functional yet. The user will also be able to edit it
3. Import/Export: Allow the user to export to .json or import a .json file
4. Print list: Format the list as a printable PDF list
5. Sync: Allow syncing certain items with the API to create back-ups
6. Share list: Share one list with another user
7. Add list to group: Add a local list to a group
8. Publish it!

---

## 🚀 How to Run Locally

Since the backend is undergoing changes, the frontend can be run in **Standalone Mode**:
The API is online most of the time, but I cannot guarantee 100% uptime while it is still in development.

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
