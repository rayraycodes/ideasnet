# GitHub Pages Setup Guide

This guide will walk you through setting up your Ideas.net application on GitHub Pages with Supabase integration.

## Prerequisites

- A GitHub account
- A Supabase account and project
- Git installed on your local machine

## Step 1: Push Code to GitHub

1. **Add all files to git:**
   ```bash
   git add .
   ```

2. **Commit your changes:**
   ```bash
   git commit -m "Initial commit: Setup GitHub Pages deployment"
   ```

3. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

## Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/rayraycodes/ideasnet`
2. Click on **Settings** (in the repository menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. The site will be available at: `https://rayraycodes.github.io/ideasnet`

## Step 3: Set Up Supabase Secrets in GitHub

1. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard: https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (the `anon` key under Project API keys)

2. **Add secrets to GitHub:**
   - Go to your repository: `https://github.com/rayraycodes/ideasnet`
   - Click on **Settings**
   - Click on **Secrets and variables** → **Actions** in the left sidebar
   - Click **New repository secret**
   - Add the following secrets:

   **Secret 1:**
   - **Name**: `REACT_APP_SUPABASE_URL`
   - **Value**: Your Supabase Project URL (e.g., `https://xxxxx.supabase.co`)

   **Secret 2:**
   - **Name**: `REACT_APP_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key

3. **Verify secrets are added:**
   - You should see both secrets listed in the Secrets section

## Step 4: Configure Supabase for GitHub Pages

1. **Update Supabase Redirect URLs:**
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **URL Configuration**
   - Add the following to **Redirect URLs**:
     ```
     https://rayraycodes.github.io/ideasnet/auth/callback
     http://localhost:3000/auth/callback
     ```
   - Add the following to **Site URL**:
     ```
     https://rayraycodes.github.io/ideasnet
     ```

2. **Update CORS settings (if needed):**
   - In Supabase, go to **Settings** → **API**
   - Under **CORS**, make sure `https://rayraycodes.github.io` is allowed

## Step 5: Trigger Deployment

1. **Automatic deployment:**
   - The workflow will automatically run when you push to the `main` branch
   - Go to **Actions** tab in your GitHub repository to see the deployment progress

2. **Manual deployment:**
   - Go to **Actions** tab
   - Select **Deploy to GitHub Pages** workflow
   - Click **Run workflow** → **Run workflow**

## Step 6: Verify Deployment

1. **Check deployment status:**
   - Go to **Actions** tab
   - Click on the latest workflow run
   - Wait for both `build` and `deploy` jobs to complete (green checkmarks)

2. **Access your site:**
   - Visit: `https://rayraycodes.github.io/ideasnet`
   - The site should load with your React application

## Troubleshooting

### Build fails with "Secrets not found"
- Make sure you've added both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` as repository secrets
- Verify the secret names match exactly (case-sensitive)

### Site loads but shows blank page
- Check browser console for errors
- Verify the `homepage` in `client/package.json` is set to `/ideasnet`
- Verify the `basename` in `App.tsx` matches the homepage

### Authentication not working
- Verify Supabase redirect URLs are correctly configured
- Check that the Supabase URL and keys in secrets match your project
- Ensure CORS settings in Supabase allow your GitHub Pages domain

### 404 errors on routes
- This is normal for client-side routing on GitHub Pages
- The app uses React Router which handles routing client-side
- All routes should work when navigating within the app

## Updating the Site

Every time you push to the `main` branch, the site will automatically rebuild and deploy. The deployment typically takes 2-5 minutes.

## Local Development

For local development, the app will still work at `http://localhost:3000` without the `/ideasnet` base path. The base path is only applied in production builds.

## Additional Notes

- The backend API server is not deployed with GitHub Pages (static hosting only)
- You'll need to deploy the backend separately (e.g., Railway, Render, Heroku, etc.)
- Update the API endpoints in your client code to point to your deployed backend URL
- Consider using environment variables for the API URL as well

