# Acta

![Status](https://img.shields.io/badge/Status-Active_Development-orange) ![Tech](https://img.shields.io/badge/Tech-React_19_|_TypeScript-blue) ![License](https://img.shields.io/badge/License-MIT-green)

> **A minimal but powerful app for managing all sorts of lists, both locally and in groups. Share lists with your friends or family, make decisions easy with polls, and leave useful notes.**


## 🛠️ Tech Stack

* **Core:** React 19, Vite
* **Language:** TypeScript
* **Data:** Dexie.js (IndexedDB Wrapper)
* **Routing:** React Router v7
* **Utilities:** BSON (ID generation)
* **Icons:**: Lucide-react and hand-picked SVGs imported using vite-plugin-svgr


## ✨ Key Features
### 1. Local-First & Offline Ready (Dexie.js)
Acta works right out of the box without an account.

**Instant Storage:** Create lists and items that are saved immediately to your device using IndexedDB.

**Data Portability:** Export your local lists to JSON and import them back anytime.

**Privacy:** Local data stays on your device until you decide to sync or join a group.

<p align="center">
  <img src="./screenshots/lists.jpg" width="32%" alt="Lists" />
  <img src="./screenshots/list.jpg" width="32%" alt="List" />
  <img src="./screenshots/new-list.jpg" width="32%" alt="New List" />
</p>

### 2. Group Collaboration (MongoDB + Express)
You have the option to create an account to unlock the full potential of Acta.

**Groups:** Create groups and invite friends or colleagues via email/username.

**Permissions:** Granular role-based access (Owner, Admin, Member) to control who can edit or delete content.

**Activity Logs:** See exactly who changed what with a detailed history of group actions.

<p align="center">
  <img src="./screenshots/groups.jpg" width="32%" alt="Groups" />
  <img src="./screenshots/group.jpg" width="32%" alt="Group" />
  <img src="./screenshots/auth.jpg" width="32%" alt="Auth" />
</p>

### 3. Smart Lists & Assignments
**Shared Lists:** Lists inside groups are visible to all members.

**Task Assignment:** Claim an item for yourself or assign it to a specific group member.

**Real-time Updates:** Mark items as "Done" and see the progress instantly.

<p align="center">
  <img src="./screenshots/new-item.jpg" width="32%" alt="New Item" />
  <img src="./screenshots/color-selector.jpg" width="32%" alt="Color Selector" />
  <img src="./screenshots/icon-selector.jpg" width="32%" alt="Icon Selector" />
</p>

## 4. Decision Making (Polls & Notes)
**Dynamic Polls:** Create voting polls with fixed options, or allow members to add their own suggestions.

**Notes with Comments:** Write long-form notes and discuss them with threaded comments.

<p align="center">
  <img src="./screenshots/notes.jpg" width="32%" alt="Notes" />
  <img src="./screenshots/polls.jpg" width="32%" alt="Polls" />
  <img src="./screenshots/tags.jpg" width="32%" alt="Tags" />
</p>

## 🚀 Roadmap & Upcoming Features
Acta is fully functional, but I am currently polishing the experience. Here is what I am working on next:

- **Advanced Syncing:** Background fetching/caching to view cloud data while offline (Optimistic UI).

- **Admin Tools:** Better group management (Kick users, promote/demote, scrub history).

- **Notifications:** Improved local alert system for assignments and poll results.

- **Backup System:** One-click local backup of all cloud data.

- **Conflict Resolution:** Smarter merging when two users edit the same list offline.


## 📱 How to Install (PWA)
Acta is a Progressive Web App.

**On iOS:**
- Open the app in Safari.
- Tap the "Share" button.
- Select "Add to Home Screen".

**On Android:**
- Open the app in Chrome.
- Tap the menu (three dots).
- Select "Install App" or "Add to Home Screen".

## 🚀 How to Run Locally


The API is online most of the time, but I cannot guarantee 100% uptime while it is still in development.

1. Clone the repository

   ```bash
   git clone [https://github.com/Stefan0712/acta.git](https://github.com/Stefan0712/acta.git)
   ```
2. Install dependencies

   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```

   
## 👤 Author
Stefan Vladulescu
Portfolio: stefanvladulescu.com
Contact: contact@stefanvladulescu.com

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
