# 🔐 RecoveryPins

**RecoveryPins** is a hacker-themed logic puzzle game where players bypass encrypted systems by deducing hidden mathematical operators between numeric pins. Wrapped in a cinematic **terminal UI**, **glassmorphism**, and **cyber-aesthetic**, the game blends logic, pressure, and atmosphere.

> *Think less like a mathematician, more like a hacker breaking entropy.*

---

## 🧠 Core Gameplay

* Each level generates a **hidden equation** using:

  * Numeric **Pins** (each pin has multiple selectable values)
  * Concealed **Operators** (`+`, `-`, `*`)
* Your goal is to:

  * Select the correct values for each pin
  * Produce a result that **matches the encrypted target value**

### 🎯 Rules

* Target value range: **24 – 100**
* Operators are hidden — only deduction works
* Limited attempts before **security lockout**
* Time pressure based on difficulty

---

## ⚙️ Difficulty Modes

| Mode   | Pins | Time Limit | Description            |
| ------ | ---- | ---------- | ---------------------- |
| Easy   | 3    | 3 minutes  | Entry-level decryption |
| Medium | 4    | 6 minutes  | Increased entropy      |
| Hard   | 6    | 8 minutes  | Maximum chaos          |

---

## 💀 Failure & Victory

### ❌ Failure Conditions

* Exceed **5 incorrect attempts**
* Timer reaches zero

Results in:

* System lockout
* Cinematic glitch/failure video
* Audio cutoff

### ✅ Victory

* Correct result matches target
* System unlocked
* Session logs confirm data recovery

---

## 🖥️ Features

* 🧩 Procedural puzzle generation
* ⏱️ Real-time countdown timer
* 🎵 Dynamic background music playlist
* 📟 Live terminal log feed
* 🧠 AI-generated hacker hints (Gemini integration)
* 🎥 Cinematic failure overlays
* 🧊 Glassmorphism + neon hacker UI
* 🔊 Mute / audio control settings

---

## 🛠️ Tech Stack

* **React + TypeScript**
* **Tailwind CSS** (glassmorphism & neon styling)
* **Framer Motion** (UI animations)
* **Cloudinary** (audio & video assets)
* **Gemini API** (hacker-style hints)

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/recoverypins.git
cd recoverypins
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Run the development server

```bash
npm run dev
```

---

## 🔐 Environment Variables

If using AI hints, create a `.env` file:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

---

## 🎨 Design Philosophy

RecoveryPins is inspired by:

* Hacker cinema aesthetics
* Terminal-driven UX
* Psychological pressure systems
* Minimal UI with maximal tension

Everything — from logs to music — reinforces the illusion of **breaking into a live system**.

---

## 📌 Roadmap

* [ ] Mobile support
* [ ] Story / narrative campaign
* [ ] Operator discovery mode
* [ ] Leaderboards
* [ ] Daily encrypted challenges
* [ ] Steam / desktop build

---

## ⚠️ Disclaimer

All audio/video assets belong to their respective owners and are used for **non-commercial / demo purposes only**.

---

## 🧑‍💻 Author

**Md. Toriqul Haque**
Experimental logic game & atmospheric UI project

---

> **ACCESS LOGGED. REPOSITORY PUBLIC. PROCEED WITH CAUTION.**
