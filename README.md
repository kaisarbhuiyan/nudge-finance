# Nudge Finance 🚀

Welcome to **Nudge**, your AI-powered personal financial planner and tracker. Nudge is designed to feel less like a spreadsheet and more like a premium, proactive assistant that helps you stay on top of your money effortlessly.

![Nudge App](icon-192.png)

## ✨ Live Demo
**[Launch Nudge Finance](https://nudge-finance.vercel.app/)** 

*(Scan receipts, log expenses with your voice, and track your cash flow! Open the link on your mobile browser to install it as a native-feeling app.)*

---

## 🌟 Key Features

### 🎙️ Voice Input Engine
Log expenses seamlessly using natural language. Just hit the microphone, say *"I spent $15 on Chipotle,"* and Nudge's smart engine will parse the amount, description, and automatically categorize it for you.

### 🧾 AI Receipt Scanner
Don't want to type? Use the built-in Receipt Scanner. Upload an image or use your camera, and Nudge will extract the merchant, date, amount, and payment method instantly.

### 📱 Full PWA Support
Nudge isn't just a website; it's a Progressive Web App (PWA). Add it to your iOS or Android Home Screen to enjoy a standalone, full-screen native app experience complete with caching for fast load times.

### 🏦 Comprehensive Tracking
From Cash and Bank Transfers to Credit and Debit Cards, track every facet of your cash flow. Intuitive Quick Action buttons let you record positive Incomes and negative Expenses with dedicated visual styling.

### ☁️ Supabase Ready
The foundation is laid for cloud persistence. Transactions currently survive via `localStorage` caching but the architecture is wired up to easily sync securely with Supabase databases in real-time.

---

## 🛠️ Technology Stack
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
* **Design:** Custom Glassmorphism UI, Luminous Dark Mode
* **Backend Integration:** Supabase (Database & Auth SDK ready)
* **Hosting:** Vercel (Auto-deployments on main)

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/kaisarbhuiyan/nudge-finance.git
   ```
2. Navigate to the project directory:
   ```bash
   cd nudge-finance
   ```
3. Run a local server (e.g., using Python's http.server or VSCode Live Server):
   ```bash
   python3 -m http.server 8000
   ```
4. Open your browser and go to `http://localhost:8000`

---

*Designed and developed by Kaisar Bhuiyan.*
