<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zPBrB-7ivgqzaxvLpLTPDRx-1Gk6RMjk

## Run Locally

**Prerequisites:**  Node.js, Docker

## Run with Docker

1. Set the environment variables in `.env.local` (and `.env` if needed for the backend).
2. Build and run the services:
   `docker-compose up --build`
   
The frontend will be available at `http://localhost:3000`.

## Run Locally (Manual)

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
