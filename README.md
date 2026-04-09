# Nudge Finance 🚀

Welcome to **Nudge**, your AI-powered personal financial planner and tracker. Nudge is designed to feel less like a spreadsheet and more like a premium, proactive assistant that helps you stay on top of your money effortlessly.

![Nudge App](icon-192.png)

## ✨ Live Demo
**[Launch Nudge Finance](https://nudge-finance.vercel.app/)** 

*(Scan receipts, log expenses with your voice, and track your cash flow! Open the link on your mobile browser to install it as a native-feeling app.)*

---

## 🌟 Key Features

### 🎙️ Voice Input Engine
Log expenses seamlessly using natural language processing. Just tap the microphone and say *"I spent $15 on a Chipotle bowl,"* and Nudge's smart engine will parse the amount, description, and automatically categorize the transaction for you.

### 🧾 AI Receipt Scanner
Don't want to manually type out a long grocery bill? Use the built-in AI Receipt Scanner. Upload an image or use your device camera, and Nudge will intelligently extract the merchant name, date, total amount, and payment method instantly.

### 🔒 Secure Supabase Authentication
Full, robust user authentication powered by Supabase.
* **Email & Password Sign In/Sign Up:** Securely create an account and log in.
* **Persistent Sessions:** Your login session is securely maintained across visits, without frustrating page reloads during form submission.
* **Responsive Auth UI:** Beautifully designed, tab-driven login and registration screens that look perfect on any device size.

### 📱 Full PWA Support (Native App Experience)
Nudge isn't just a website; it's a fully functional Progressive Web App (PWA). 
* Add it to your iOS or Android Home Screen to enjoy a standalone, full-screen native app experience.
* Built-in service workers ensure ultra-fast load times and offline caching.

### 🏦 Comprehensive Transaction Tracking
Track every facet of your cash flow.
* **Multi-Modal Flow:** From Cash and Bank Transfers to Credit and Debit Cards.
* **Income & Expenses:** Intuitive Quick Action buttons let you record positive Incomes (green) and negative Expenses (red) with dedicated visual styling.
* **Smart Categorization:** Keep your personal ledger organized with automatically assigned categories.

### ☁️ Real-time Cloud Syncing
The foundation is laid for absolute reliability. While transactions gracefully fallback to `localStorage` caching if offline, the architecture natively syncs with secure Supabase databases in real-time, ensuring your financial data is safely stored in the cloud and accessible across all your devices.

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
