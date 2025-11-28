# Supabase URL Configuration Guide

## Correct URL Formats for Supabase

When configuring Supabase redirect URLs, use these **exact** formats:

### For GitHub Pages Production:
```
https://rayraycodes.github.io/ideasnet/auth/callback
```

### For Local Development:
```
http://localhost:3000/auth/callback
```

## Step-by-Step: Adding Redirect URLs in Supabase

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open URL Configuration:**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration** under Authentication

3. **Add Redirect URLs:**
   - In the **Redirect URLs** text area, add each URL on a separate line:
     ```
     https://rayraycodes.github.io/ideasnet/auth/callback
     http://localhost:3000/auth/callback
     ```
   - **Important:** Each URL must be on its own line
   - No trailing slashes
   - No spaces before or after the URL

4. **Set Site URL:**
   - In the **Site URL** field, enter:
     ```
     https://rayraycodes.github.io/ideasnet
     ```
   - This should be your production URL without any path

5. **Save Changes:**
   - Click **Save** or the save button at the bottom

## Troubleshooting "Please provide a valid URL" Error

If you see this error, try:

1. **Check URL Format:**
   - ✅ Correct: `https://rayraycodes.github.io/ideasnet/auth/callback`
   - ❌ Wrong: `https://rayraycodes.github.io/ideasnet/auth/callback/` (trailing slash)
   - ❌ Wrong: ` rayraycodes.github.io/ideasnet/auth/callback` (missing https://)
   - ❌ Wrong: `https://rayraycodes.github.io/ideasnet/auth/callback ` (trailing space)

2. **Add URLs One at a Time:**
   - Some Supabase interfaces require adding URLs individually
   - Try adding the production URL first, save, then add the localhost URL

3. **Check for Special Characters:**
   - Make sure there are no hidden characters
   - Copy and paste the URL directly from this guide

4. **Verify URL is Accessible:**
   - The URL doesn't need to be live yet, but the format must be correct
   - Supabase validates the URL format, not accessibility

## Alternative: Using Supabase Dashboard UI

If the text area doesn't work:

1. Look for an **"Add URL"** or **"+"** button
2. Click it to add URLs one at a time
3. Enter: `https://rayraycodes.github.io/ideasnet/auth/callback`
4. Click **Add** or **Save**
5. Repeat for localhost URL if needed

## CORS Configuration

Also configure CORS in Supabase:

1. Go to **Settings** → **API**
2. Under **CORS**, add:
   ```
   https://rayraycodes.github.io
   ```
3. Click **Save**

## Notes

- Your app uses a custom backend API for authentication, not Supabase Auth
- If you're only using Supabase for database, you may not need these redirect URLs
- These URLs are only needed if you plan to use Supabase Authentication features
- The callback URL matches your React Router route: `/auth/callback`

