# Deployment Guide - Vercel

## Steps to Deploy on GitHub & Vercel

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `social-media-downloader-sarim-tools`
3. Description: "Social Media Video Downloader with Transcription - SARIM TOOLS"
4. Set as Public or Private (your choice)
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 2: Push Code to GitHub

Open terminal in this folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: Social Media Downloader - SARIM TOOLS"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/social-media-downloader-sarim-tools.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository: `social-media-downloader-sarim-tools`
5. Vercel will auto-detect:
   - Framework: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`
6. Click "Deploy"

### Step 4: Update Configuration

After Vercel deployment:

1. **Get your Vercel URL** (something like: `your-app.vercel.app`)

2. **Update index.html:**
   - Find: `const PROXY_URL = 'http://localhost:3000';`
   - Replace with: `const PROXY_URL = 'https://your-app.vercel.app';`
   
   - Find: `const USE_PROXY = false;`
   - Replace with: `const USE_PROXY = true;`

3. **Commit and push changes:**
   ```bash
   git add index.html
   git commit -m "Update PROXY_URL for Vercel deployment"
   git push
   ```

4. Vercel will auto-deploy the changes!

### Step 5: Test

- Visit your Vercel URL
- Test with a TikTok/Instagram video URL
- Everything should work! 🎉

## File Structure Ready for Deployment

✅ `index.html` - Main application
✅ `server.js` - Backend server (Vercel serverless)
✅ `package.json` - Dependencies
✅ `vercel.json` - Vercel configuration
✅ `README.md` - Project documentation
✅ `.gitignore` - Git ignore rules

## Environment Variables (Optional)

If you want to use environment variables for API keys:

1. In Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `RAPID_API_KEY`
   - `SPEECH_RECOGNITION_API_KEY`
3. Update `server.js` to use `process.env.RAPID_API_KEY` instead of hardcoded values

## Notes

- Vercel will automatically detect the Node.js app
- The `vercel.json` config routes API calls to server.js
- Static files (index.html) are served automatically
- No build step needed - works as-is!

## Troubleshooting

**If API calls fail:**
- Make sure `USE_PROXY = true` in index.html
- Verify PROXY_URL is correct (your Vercel URL)
- Check Vercel function logs in dashboard

**If deployment fails:**
- Check that all dependencies are in package.json
- Verify vercel.json is correct
- Check Vercel build logs

Happy deploying! 🚀
