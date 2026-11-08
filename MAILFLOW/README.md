# MAILFLOW — Bulk Mail Studio

A MERN bulk-mail application with separate `frontend/` and `backend/` folders, ready for GitHub and separate Render Web Services.

## Requirements
- Node.js 20+
- MongoDB Atlas database
- SMTP credentials (Gmail App Password or an email provider)

## Run locally

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Fill in `MONGODB_URI`, `JWT_SECRET`, and SMTP values in `backend/.env`.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

Default local admin credentials are configured in `backend/.env.example`. Change them before deployment.

## Deploy on Render

Create **two separate Web Services** from the same GitHub repository.

### Backend service
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables from `backend/.env.example` in the Render dashboard.
- Set `FRONTEND_URL` to your deployed frontend URL.
- Set `MONGODB_URI` to your MongoDB Atlas connection string.
- Set `NODE_ENV=production`.

### Frontend service
- Root Directory: `frontend`
- Runtime: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Add environment variable `VITE_API_URL` = your backend URL, including `https://` and without a trailing slash.

After deployment, update the backend `FRONTEND_URL` with the exact frontend URL and redeploy the backend.

## Push to GitHub
From the MAILFLOW project root:
```bash
git init
git add .
git commit -m "Initial MAILFLOW bulk mail application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MAILFLOW.git
git push -u origin main
```

## Important email notes
- Use only recipient lists you are authorized to contact.
- Configure consent and unsubscribe handling before sending real marketing campaigns.
- SMTP acceptance is not proof of inbox delivery. The app records per-recipient send attempts and failures, not guaranteed delivery.
- Start with a small test list. Providers impose sending limits.
- Never commit `.env` files or expose SMTP credentials in frontend code.
