#!/bin/bash

# GitHub Push Script for Saucedemo Automation
# This script will help you push the project to GitHub

echo "🚀 GitHub Push Setup Script"
echo "================================"
echo ""

# Step 1: Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first:"
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Step 2: Initialize Git repository (if not already initialized)
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi
echo ""

# Step 3: Configure Git (if needed)
echo "🔧 Checking Git configuration..."

GIT_USER=$(git config user.name)
GIT_EMAIL=$(git config user.email)

if [ -z "$GIT_USER" ] || [ -z "$GIT_EMAIL" ]; then
    echo ""
    echo "⚠️  Git is not configured. Please enter your details:"
    echo ""
    read -p "Enter your GitHub username: " USERNAME
    read -p "Enter your GitHub email: " EMAIL
    
    git config user.name "$USERNAME"
    git config user.email "$EMAIL"
    
    echo "✅ Git configured successfully"
else
    echo "✅ Git already configured as: $GIT_USER <$GIT_EMAIL>"
fi
echo ""

# Step 4: Add all files
echo "📝 Adding files to Git..."
git add .
echo "✅ Files added"
echo ""

# Step 5: Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Saucedemo Test Automation Framework

- Complete Page Object Model implementation
- Data-driven testing with JSON/CSV support
- Custom wait strategies and screenshot management
- Comprehensive HTML reporting
- Support for multiple user types (standard, problem, locked_out)
- Full test coverage with positive and negative scenarios
- Production-ready with industry best practices"

if [ $? -eq 0 ]; then
    echo "✅ Initial commit created"
else
    echo "⚠️  No changes to commit (may already be committed)"
fi
echo ""

# Step 6: GitHub repository setup
echo "================================"
echo "🌐 GitHub Repository Setup"
echo "================================"
echo ""
echo "Now you need to create a GitHub repository and connect it."
echo ""
echo "Option 1: Create a NEW repository on GitHub"
echo "   1. Go to https://github.com/new"
echo "   2. Repository name: SaucedemoAutomation (or your preferred name)"
echo "   3. Description: E2E Test Automation Framework for Saucedemo"
echo "   4. Choose Public or Private"
echo "   5. Do NOT initialize with README, .gitignore, or license"
echo "   6. Click 'Create repository'"
echo ""
echo "Option 2: Use an EXISTING repository"
echo "   1. Go to your GitHub profile"
echo "   2. Find the repository you want to use"
echo "   3. Copy the repository URL"
echo ""
read -p "Press Enter after creating/selecting your GitHub repository..."
echo ""

# Step 7: Add remote repository
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL is required"
    exit 1
fi

echo ""
echo "🔗 Adding remote repository..."

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

git remote add origin "$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Remote repository added"
else
    echo "❌ Failed to add remote repository"
    exit 1
fi
echo ""

# Step 8: Set default branch
echo "🌿 Setting up default branch..."
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
    git checkout -b main
    echo "✅ Created and switched to 'main' branch"
else
    if [ "$CURRENT_BRANCH" != "main" ]; then
        git branch -M main
        echo "✅ Renamed branch to 'main'"
    else
        echo "✅ Already on 'main' branch"
    fi
fi
echo ""

# Step 9: Push to GitHub
echo "================================"
echo "🚀 Pushing to GitHub..."
echo "================================"
echo ""

read -p "Ready to push to GitHub? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    echo ""
    echo "📤 Pushing to GitHub..."
    echo "   This may take a moment..."
    echo ""
    
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "================================"
        echo "✅ SUCCESS!"
        echo "================================"
        echo ""
        echo "🎉 Your project has been pushed to GitHub!"
        echo ""
        echo "📍 Repository URL: $REPO_URL"
        echo ""
        echo "Next steps:"
        echo "1. Visit your repository on GitHub"
        echo "2. Add a description and topics"
        echo "3. Enable GitHub Actions (if desired)"
        echo "4. Share with your team!"
        echo ""
    else
        echo ""
        echo "================================"
        echo "❌ PUSH FAILED"
        echo "================================"
        echo ""
        echo "Common issues and solutions:"
        echo ""
        echo "1. Authentication Error:"
        echo "   - Use Personal Access Token instead of password"
        echo "   - Generate token at: https://github.com/settings/tokens"
        echo "   - Use token as password when prompted"
        echo ""
        echo "2. Permission Denied:"
        echo "   - Make sure you have write access to the repository"
        echo "   - Check if repository exists on GitHub"
        echo ""
        echo "3. Remote Already Exists:"
        echo "   - Run: git remote remove origin"
        echo "   - Then run this script again"
        echo ""
        echo "Try again with: ./push-to-github.sh"
        exit 1
    fi
else
    echo ""
    echo "⏸️  Push cancelled. You can push manually later with:"
    echo "   git push -u origin main"
fi

echo ""
echo "================================"
echo "🎓 Git Commands Reference"
echo "================================"
echo ""
echo "View status:        git status"
echo "View commits:       git log --oneline"
echo "View remote:        git remote -v"
echo "Pull changes:       git pull origin main"
echo "Push changes:       git push origin main"
echo ""
