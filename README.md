<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/850f2f52-bd44-4097-aec8-362f01b167f7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. If frontend and backend are deployed separately, set `VITE_API_BASE_URL` in frontend env to your backend URL (example: `https://your-backend.onrender.com`).
4. This project also auto-falls back to the Render backend when running on `*.netlify.app` and `VITE_API_BASE_URL` is missing.
5. Run the app:
   `npm run dev`
