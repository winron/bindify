# Push to GitHub Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `bindify` (or your preferred name)
3. Description: "Control your Spotify playback with customizable keyboard shortcuts"
4. Choose Public or Private
5. **DO NOT** check "Initialize this repository with a README"
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/winron/bindify.git
git branch -M main
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:winron/bindify.git
git branch -M main
git push -u origin main
```

## Note

Make sure to:
- Replace `YOUR_USERNAME` with your actual GitHub username
- Replace `bindify` with your repository name if you chose a different one
- Have your GitHub credentials ready (or use SSH keys for authentication)

