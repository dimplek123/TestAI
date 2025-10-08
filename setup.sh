#!/bin/bash

# Saucedemo Automation Setup Script
# This script sets up the test automation framework

echo "🚀 Setting up Saucedemo Test Automation Framework..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✅ Playwright browsers installed successfully"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p screenshots
mkdir -p reports/logs
mkdir -p config

echo "✅ Directories created"
echo ""

# Display success message
echo "=========================================="
echo "✅ Setup completed successfully!"
echo "=========================================="
echo ""
echo "📚 Quick Start Commands:"
echo "   npm test              - Run all tests"
echo "   npm run test:headed   - Run tests with browser visible"
echo "   npm run test:debug    - Run tests in debug mode"
echo "   npm run test:ui       - Run tests in UI mode"
echo "   npm run report        - View test report"
echo ""
echo "📖 Read README.md for more information"
echo ""
