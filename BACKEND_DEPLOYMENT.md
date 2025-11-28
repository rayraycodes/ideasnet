# Backend Deployment Guide

## Problem

GitHub Pages only serves static files (HTML, CSS, JS). Your backend API needs to be deployed separately. The 405 errors you're seeing are because `/api/auth/login` doesn't exist on GitHub Pages.

## Solution: Deploy Backend Separately

You need to deploy your Node.js backend to a hosting service. Here are the best options:

### Option 1: Railway (Recommended - Easiest)

1. **Sign up:** https://railway.app
2. **Create new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `ideasnet` repository
   - Railway will auto-detect it's a Node.js app

3. **Configure environment variables:**
   - Go to your project → Variables
   - Add all variables from your `.env` file:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret
     NODE_ENV=production
     FRONTEND_URL=https://rayraycodes.github.io/ideasnet
     PORT=3001
     SESSION_SECRET=your-session-secret
     SUPABASE_URL=https://...
     SUPABASE_ANON_KEY=...
     ```

4. **Deploy:**
   - Railway will automatically deploy
   - You'll get a URL like: `https://your-app.railway.app`

5. **Update GitHub Secrets:**
   - Go to: https://github.com/rayraycodes/ideasnet/settings/secrets/actions
   - Add: `REACT_APP_API_URL` = `https://your-app.railway.app`

### Option 2: Render

1. **Sign up:** https://render.com
2. **Create new Web Service:**
   - Connect your GitHub repo
   - Select the root directory
   - Build command: `npm install && npm run build:server`
   - Start command: `npm start`
   - Environment: Node

3. **Add environment variables** (same as Railway)

4. **Deploy and get URL:**
   - Render will give you: `https://your-app.onrender.com`
   - Add to GitHub secrets as `REACT_APP_API_URL`

### Option 3: Heroku

1. **Install Heroku CLI:** https://devcenter.heroku.com/articles/heroku-cli
2. **Login:**
   ```bash
   heroku login
   ```
3. **Create app:**
   ```bash
   heroku create ideasnet-api
   ```
4. **Set environment variables:**
   ```bash
   heroku config:set DATABASE_URL=...
   heroku config:set JWT_SECRET=...
   # ... add all other vars
   ```
5. **Deploy:**
   ```bash
   git push heroku main
   ```
6. **Get URL:** `https://ideasnet-api.herokuapp.com`

### Option 4: Fly.io

1. **Install Fly CLI:** https://fly.io/docs/getting-started/installing-flyctl/
2. **Login:**
   ```bash
   fly auth login
   ```
3. **Create app:**
   ```bash
   fly launch
   ```
4. **Set secrets:**
   ```bash
   fly secrets set DATABASE_URL=...
   fly secrets set JWT_SECRET=...
   ```
5. **Deploy:**
   ```bash
   fly deploy
   ```

## After Backend Deployment

### 1. Update GitHub Secrets

Go to: https://github.com/rayraycodes/ideasnet/settings/secrets/actions

Add:
- **Name:** `REACT_APP_API_URL`
- **Value:** Your backend URL (e.g., `https://your-app.railway.app`)

### 2. Update Backend CORS

In your backend `.env` or environment variables, set:
```
FRONTEND_URL=https://rayraycodes.github.io/ideasnet
```

Or update `src/server/index.ts` CORS configuration to allow:
```javascript
origin: [
  'https://rayraycodes.github.io',
  'http://localhost:3000'
]
```

### 3. Redeploy Frontend

The GitHub Actions workflow will automatically rebuild with the new API URL. Or manually trigger:
- Go to Actions tab
- Run "Deploy to GitHub Pages" workflow

### 4. Test

Visit: https://rayraycodes.github.io/ideasnet
- Try logging in
- The API calls should now go to your deployed backend

## Quick Railway Setup (Step-by-Step)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** `rayraycodes/ideasnet`
5. **Add environment variables:**
   - Copy all from your local `.env` file
   - Make sure `FRONTEND_URL=https://rayraycodes.github.io/ideasnet`
6. **Deploy** (automatic)
7. **Copy the URL** (e.g., `https://ideasnet-production.up.railway.app`)
8. **Add to GitHub Secrets:**
   - `REACT_APP_API_URL` = your Railway URL
9. **Done!** Frontend will rebuild automatically

## Troubleshooting

### Backend returns 405 Method Not Allowed
- Check that your backend is running
- Verify CORS is configured correctly
- Make sure `FRONTEND_URL` includes your GitHub Pages domain

### CORS errors in browser
- Add `https://rayraycodes.github.io` to backend CORS allowed origins
- Check backend logs for CORS errors

### API calls still going to GitHub Pages
- Verify `REACT_APP_API_URL` secret is set correctly
- Rebuild the frontend (push a new commit or manually trigger workflow)

### Database connection issues
- Verify `DATABASE_URL` is correct in backend environment
- Check Supabase allows connections from your hosting provider
- Some providers need IP whitelisting in Supabase

## Cost Estimates

- **Railway:** Free tier available, then ~$5-20/month
- **Render:** Free tier available, then ~$7/month
- **Heroku:** No free tier, ~$7/month
- **Fly.io:** Free tier available, then ~$3-10/month

All have free tiers suitable for development/testing!

