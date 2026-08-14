<div align="center"> <img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" /> </div>
Expense Tracker

An AI-powered expense tracker built with React, Supabase, and the Gemini API. Log expenses in natural language, track spending by category, and get AI-generated insights into your monthly finances.

View your app in AI Studio: https://ai.studio/apps/850f2f52-bd44-4097-aec8-362f01b167f7

Features
Track expenses with categories, dates, and notes
AI Quick-Add: type expenses in plain language (e.g. "spent 450 on groceries yesterday") and let Gemini parse them into structured data
AI-generated monthly spending insights and summaries
Dashboard with charts and category breakdowns
Supabase-backed auth and per-user data storage with Row Level Security
Tech Stack
Frontend: React (Vite)
Database & Auth: Supabase
AI: Gemini API
Deployment: Netlify (frontend) / Render (backend)
Run Locally

Prerequisites: Node.js

Install dependencies:
bash
   npm install
Set the GEMINI_API_KEY in .env.local to your Gemini API key.
Add your Supabase credentials to the same .env.local file:
   GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
If the frontend and backend are deployed separately, set VITE_API_BASE_URL in the frontend env to your backend URL (example: https://your-backend.onrender.com).

This project also auto-falls back to the Render backend when running on *.netlify.app and VITE_API_BASE_URL is missing.

Run the app:
bash
   npm run dev
Environment Variables
Variable	Description
GEMINI_API_KEY	API key for Google Gemini
VITE_SUPABASE_URL	Your Supabase project URL
VITE_SUPABASE_ANON_KEY	Your Supabase anon/public key
VITE_API_BASE_URL	(Optional) Backend URL if deployed separately
Deployment
Frontend: Deploy to Netlify (or similar static hosting)
Backend: Deploy to Render (or similar), and point VITE_API_BASE_URL at it
License

MIT
