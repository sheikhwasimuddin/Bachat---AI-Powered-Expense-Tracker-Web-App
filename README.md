# 💰 Bachat — AI-Powered Expense Tracker

<p align="center">

**Smart spending. Better saving.**

An AI-powered personal finance web application that helps you track expenses, manage budgets, understand spending patterns, and make smarter financial decisions with the help of Google Gemini.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Bachat-6f8067)](https://mybachat.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/sheikhwasimuddin/Bachat---AI-Powered-Expense-Tracker-Web-App)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase\&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite\&logoColor=white)](https://vite.dev/)

</p>

---

## 🌐 Live Demo

### 🚀 [Open Bachat](https://mybachat.netlify.app/)

> Track your spending, set budgets, and use AI to understand your financial habits.

---

## 📌 Overview

**Bachat** is a modern AI-powered expense tracking web application designed to make personal finance management easier and more intelligent.

Instead of manually filling multiple fields for every transaction, users can describe an expense naturally:

```text
Spent $45 on groceries yesterday
```

Bachat uses **Google Gemini** to understand the sentence and extract structured information such as:

* 💵 Amount
* 🏷️ Category
* 📅 Date
* 📝 Expense description
* 🎯 Confidence

The application also analyzes spending patterns and provides AI-generated financial insights.

---

# ✨ Features

## 💸 Expense Tracking

Record and manage your daily expenses with:

* Amount
* Category
* Date
* Notes
* Transaction history

Keep all your spending organized in one place.

---

## 🤖 AI Natural Language Quick-Add

Add expenses using normal language instead of filling out a form.

### Example

```text
Coffee $5.75 at Starbucks
```

Bachat can interpret the transaction and extract:

```text
Amount: $5.75
Category: Food & Dining
Date: Today
Note: Coffee at Starbucks
```

This feature is powered by the **Google Gemini API**.

---

## 📊 Financial Dashboard

Get an overview of your finances through a centralized dashboard.

The dashboard provides information such as:

* Total spending
* Budget utilization
* Projected monthly spending
* Financial health
* Category-wise spending
* Recent transactions

Interactive charts make it easier to understand where your money is going.

---

## 💰 Budget Management

Create and manage budgets for different spending categories.

For example:

```text
Food & Dining       $500
Transportation      $300
Entertainment       $200
Shopping            $400
```

Bachat monitors your spending against these limits and highlights categories approaching or exceeding their budgets.

---

## 🧠 Gemini Financial Intelligence

Bachat uses Gemini to analyze financial data and generate personalized insights.

The AI can provide:

* Spending summaries
* Budget warnings
* Savings opportunities
* Spending pattern analysis
* Projected monthly spending
* Financial health score
* Personalized recommendations

---

## 💬 AI Financial Advisor

Ask questions about your spending in natural language.

Examples:

```text
How much did I spend on food?

Which category costs me the most?

Am I spending too much this month?

How can I reduce my expenses?

What should I focus on to save more?
```

The AI Advisor uses the user's financial context to provide relevant responses.

---

## 📈 Spending Analytics

Understand your spending through visual analytics.

Analyze:

* Category distribution
* Monthly spending
* Budget utilization
* Spending trends
* Highest spending categories
* Financial health

---

## 🔐 Supabase Authentication & Data

Bachat uses **Supabase** for authentication and data storage.

User data is separated using Supabase's database security features and Row Level Security (RLS).

This allows each user to securely manage their own financial records.

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Bachat UI      │
                         │    React + Vite     │
                         └──────────┬──────────┘
                                    │
                                    │ API Requests
                                    ▼
                         ┌─────────────────────┐
                         │    Express Server   │
                         │     server.ts       │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │   Google Gemini  │                │     Supabase     │
        │   AI Processing  │                │ Auth + Database  │
        └──────────────────┘                └──────────────────┘
```

### AI Request Flow

```text
User enters natural-language expense
              ↓
        React Frontend
              ↓
     /api/gemini/parse-expense
              ↓
       Express Backend
              ↓
        Google Gemini
              ↓
     Structured JSON Response
              ↓
        Expense Preview
              ↓
        Save to Supabase
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Lucide React
* Motion

## Backend

* Node.js
* Express
* TypeScript
* esbuild
* dotenv

## Database & Authentication

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security

## Artificial Intelligence

* Google Gemini API
* `@google/genai`

## Deployment

* **Frontend:** Netlify
* **Backend:** Render

---

# 📂 Project Structure

```text
Bachat/
│
├── src/
│   ├── components/
│   ├── data/
│   ├── db/
│   │   └── schema.sql
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── types.ts
│
├── assets/
├── public/
│
├── server.ts
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/sheikhwasimuddin/Bachat---AI-Powered-Expense-Tracker-Web-App.git
```

```bash
cd Bachat---AI-Powered-Expense-Tracker-Web-App
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key

VITE_SUPABASE_URL=your_supabase_project_url

VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key

VITE_API_BASE_URL=http://localhost:3000
```

### Environment Variables

| Variable                 | Purpose                          |
| ------------------------ | -------------------------------- |
| `GEMINI_API_KEY`         | Google Gemini API authentication |
| `VITE_SUPABASE_URL`      | Supabase project URL             |
| `VITE_SUPABASE_ANON_KEY` | Supabase client authentication   |
| `VITE_API_BASE_URL`      | Backend API URL                  |

> ⚠️ Never commit `.env.local` or expose `GEMINI_API_KEY` publicly.

---

# ▶️ Run Locally

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Build the frontend and backend:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

# 🚀 Deployment

## Frontend — Netlify

The Vite frontend can be deployed to Netlify.

Configure the required frontend environment variables in Netlify:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_BASE_URL=your_render_backend_url
```

---

## Backend — Render

The Express backend should be deployed separately.

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npm start
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

to the Render environment variables.

---

# 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Returns backend and environment status.

---

### AI Expense Parser

```http
POST /api/gemini/parse-expense
```

Parses natural-language expense descriptions.

Example:

```json
{
  "prompt": "Coffee $5.75 at Starbucks",
  "categories": [
    "Food & Dining",
    "Transportation",
    "Shopping"
  ]
}
```

---

### AI Spending Insights

```http
POST /api/gemini/insights
```

Analyzes expenses and budgets and returns structured financial insights.

---

### AI Financial Advisor

```http
POST /api/gemini/advisor
```

Provides contextual answers to financial questions based on the user's spending data.

---

# 🧠 AI Processing

Bachat uses a combination of **Gemini-powered intelligence and deterministic fallback logic**.

If the Gemini service is temporarily unavailable, the backend can fall back to local processing for important expense parsing and financial calculations.

This improves application resilience and prevents the entire experience from depending on a single AI request.

---

# 🔒 Security

Important security practices:

* Gemini API key is kept server-side.
* Supabase authentication is used for user access.
* Supabase Row Level Security protects user data.
* Environment variables are used for secrets.
* API credentials should never be committed to GitHub.

---

# 🗺️ Roadmap

Planned improvements:

* [ ] 📷 AI Receipt Scanner
* [ ] 🔁 Recurring Expense Detection
* [ ] 🎯 Savings Goals
* [ ] 📊 Advanced Financial Reports
* [ ] 🔮 What-If Financial Simulator
* [ ] 📱 Progressive Web App support
* [ ] 📄 PDF/CSV financial reports
* [ ] 🔔 Budget notifications
* [ ] 💳 Payment-method analytics
* [ ] 🌐 Multi-currency improvements

---

# 🎯 Project Goals

Bachat aims to move beyond traditional expense trackers.

Instead of simply answering:

> **"Where did my money go?"**

Bachat aims to help users understand:

> **"Why am I spending this much, and what can I do differently?"**

The combination of structured financial data, analytics, and generative AI makes Bachat a smarter approach to personal expense management.

---

# 📸 Screenshots

Add screenshots of the application here:

```text
docs/
├── dashboard.png
├── ai-quick-add.png
├── financial-insights.png
└── advisor.png
```

Then add them to the README:

```markdown
![Bachat Dashboard](docs/dashboard.png)

![AI Quick Add](docs/ai-quick-add.png)

![Financial Insights](docs/financial-insights.png)
```

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "feat: add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Sheikh Wasimuddin**

Computer Science & Engineering

Interested in:

* Artificial Intelligence
* IoT
* Full-Stack Development
* Cloud Computing
* Generative AI

---

## ⭐ Support

If you find **Bachat** useful, consider giving the repository a ⭐ on GitHub.

### 🔗 Links

🌐 **Live Application:**
https://mybachat.netlify.app/

💻 **GitHub Repository:**
https://github.com/sheikhwasimuddin/Bachat---AI-Powered-Expense-Tracker-Web-App

---

<p align="center">

### 💰 Bachat — Track Smart. Spend Better. Save More.

</p>

