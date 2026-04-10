# 🕵️ WITLOCK: A Trace Remains

> *"You weren't searching for the truth. You were being led to it."*

A fully deployed, multi-stage **Alternate Reality Game (ARG)** built for a live cybersecurity event. Players navigate through a fake security incident database, decrypt hidden diary entries, follow physical clues, and ultimately uncover the identity behind the system — **Whitlock**.

---

## 🎮 How It Worked

Teams registered with a team name and PIN, then progressed through **7 puzzle stages** disguised as a professional cybersecurity blog. Each stage required solving a real-world inspired puzzle to unlock a hidden encrypted diary entry. The UI degraded progressively — from clean and professional to dark, corrupted terminal — as players went deeper.

### The Meta-Puzzle
Across all 6 blog stages, a single letter was visually "crooked" and highlighted in red. Collected in order, they spelled:

```
W  H  IT  LO  C  K
↑  ↑   ↑   ↑  ↑  ↑
R1 R2  R3  R4 R5 R6
```

The final answer was always hiding in plain sight.

---

## 🧩 Stages & Passwords

| Level | Platform | Password | Max Teams |
|-------|----------|----------|-----------|
| 1 | EduCore Systems (Google Forms leak) | `savehumanity` | 63 |
| 2 | Spotify (social engineering) | `undefeated` | 50 |
| 3 | Instagram (coordinated compromise) | `illusion` | 40 |
| 4 | MetaSphere Analytics (steganography) | `mirage` | 30 |
| 5 | Sony Pictures (physical cipher) | `phantom` | 20 |
| 6 | DataTrust Financial (timeline discrepancy) | `whitlock` | 10 |
| 7 | System-wide analysis (meta pattern) | `awaken` | 4 |
| Final | `/awaken` page | *your team name* | — |

Teams were progressively filtered at each stage. Only **4 teams** could reach the final.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Create React App) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (via Mongoose) |
| Encryption | AES-256-CBC (diary entries encrypted per session) |
| Hosting | Vercel (frontend) + Render (backend) |
| Auth | Custom session tokens + team PIN |

---

## 🔐 Security Features

- **AES-256 encrypted diary entries** — decrypted client-side using the team's session token as the key
- **Per-team rate limiting** — 20 attempts per 5 min window, keyed by teamId (not IP) to prevent shared WiFi lockouts
- **Stage slot enforcement** — MongoDB tracks `slotsTaken` per stage; teams are locked out once the cap is hit
- **Session validation** — every API call requires a valid `teamId` + `sessionToken` header
- **403 on locked stages** — direct URL access to future stages is blocked server-side

---

## 📁 Project Structure

```
Whitlock-ARG/
├── arg-backend/
│   ├── server.js        # Express API — auth, submit, stage/diary fetch
│   ├── seed.js          # Database seeder — wipes and reloads all content
│   ├── package.json
│   └── .env             # MONGO_URI, PORT (not committed)
│
└── arg-frontend/
    ├── public/
    │   └── profile_pic.png   # Richard. W author photo
    ├── src/
    │   ├── components/
    │   │   ├── Login.js        # Team registration / login
    │   │   ├── BlogContainer.js
    │   │   └── StageDisplay.js # Article renderer with HTML support
    │   ├── pages/
    │   │   ├── Hub.js          # Stage selection dashboard
    │   │   ├── Round.js        # Blog + diary + answer submission
    │   │   └── Awaken.js       # Final sequence — on-screen keyboard
    │   └── App.js
    └── vercel.json       # SPA routing config for Vercel
```

---

## 🚀 Setup (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd arg-backend
npm install
# Create .env with:
# MONGO_URI=mongodb://...
# PORT=5000
node seed.js    # Load all content
node server.js  # Start API
```

### Frontend
```bash
cd arg-frontend
npm install
# Create .env with:
# REACT_APP_API_URL=http://localhost:5000
npm start
```

---

## 🌐 Deployment

| Service | Purpose | Config |
|---------|---------|--------|
| **MongoDB Atlas** | Database | Whitelist `0.0.0.0/0` for event |
| **Render** | Backend API | Root: `arg-backend`, Start: `npm start` |
| **Vercel** | Frontend | Root: `arg-frontend`, Env: `REACT_APP_API_URL` |

### Pre-event reset
```bash
cd arg-backend
node seed.js
```
> ⚠️ Wipes ALL team registrations and reloads content. Run once before the event. Never during.

---

## 🎨 Dynamic Theme System

The UI progressively degrades as players advance:

| Stages | Aesthetic | Font |
|--------|-----------|------|
| 1–2 | Clean professional blog | Helvetica |
| 3–5 | Aged, sepia, paranoid | Georgia serif |
| 6 | Dark, red alerts, corrupted | Courier monospace |
| 7+ | Full black terminal, green text | Courier monospace |

---

## 📖 Narrative

*Richard. W*, a security researcher, begins noticing inconsistencies in cyber incident reports — dates shifted, platforms misidentified, patterns too consistent to be random. As players unlock his diary entries, they follow his descent from skepticism to certainty: something is filtering what the world sees. The final revelation is that Whitlock isn't an enemy — it's a system that selects who gets to see the truth, and the players have just been recruited.

---

## ⚡ Event Results

- **Teams who completed all 7 stages:** 4
- **Final stage reached:** `/awaken` — enter your team name to trigger the finale
- **Post-completion:** Redirected to winner submission Google Form
- **Memorable moment:** Multiple teams completed Stage 7 but forgot to write their own team name on the final form 💀

---

## 👥 Built by

| GitHub | Role |
|--------|------|
| [Blute122](https://github.com/Blute122) | Development, Deployment |
| [kushpo357](https://github.com/kushpo357) | Co-creator, Game Design |

*Built for a live cybersecurity ARG event — April 2026*
