# 🚀 QUICK START GUIDE

## Welcome to Saucedemo Test Automation!

This guide will get you up and running in **5 minutes**.

---

## ✅ Step 1: Verify Prerequisites

Open Terminal and check:

```bash
# Check Node.js (should be v16 or higher)
node --version

# Check npm
npm --version
```

**Don't have Node.js?** Download from: https://nodejs.org/

---

## 📦 Step 2: Install Dependencies

```bash
# Navigate to the project
cd /Users/dimple/Downloads/SaucedemoAutomation

# Install Node packages
npm install

# Install Playwright browsers
npx playwright install chromium
```

---

## 🧪 Step 3: Run Your First Test

```bash
# Run tests with browser visible
npm run test:headed
```

**That's it!** You should see:
- Chrome browser opens
- Tests execute automatically
- Console shows colored output
- Screenshots saved in `screenshots/`

---

## 📊 Step 4: View Results

### View HTML Report
```bash
npm run report
```

### View Custom Report
```bash
# Open the custom HTML report
open reports/saucedemo-test-report-*.html
```

---

## 🎯 What Just Happened?

Your tests just:
1. ✅ Logged in as multiple users
2. ✅ Selected most expensive products
3. ✅ Added items to cart
4. ✅ Completed checkout
5. ✅ Verified purchase
6. ✅ Generated detailed reports

---

## 📚 Common Commands

```bash
# Run tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Debug mode (step through)
npm run test:debug

# Interactive UI mode
npm run test:ui

# View report
npm run report

# Clean old artifacts
npm run clean
```

---

## 🎓 Next Steps

### 1. Explore the Code
- `pages/` - Page Object Models
- `tests/` - Test specifications
- `utils/` - Helper utilities
- `testData/` - Test data files

### 2. Customize Tests
Edit `testData/credentials.json`:
```json
{
  "users": [
    {
      "username": "your_username",
      "password": "your_password",
      "type": "custom",
      "shouldSucceed": true
    }
  ]
}
```

### 3. Add New Tests
Create new file in `tests/` folder:
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('My custom test', async ({ page }) => {
  const loginPage = new LoginPage(page, logger);
  await loginPage.navigate('https://www.saucedemo.com');
  // Add your test steps
});
```

---

## 🐛 Troubleshooting

### Issue: Tests fail immediately
**Solution:** Make sure browsers are installed
```bash
npx playwright install chromium --force
```

### Issue: Permission denied
**Solution:** Make setup script executable
```bash
chmod +x setup.sh
./setup.sh
```

### Issue: Module not found
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

---

## 📖 Read More

- **README.md** - Complete documentation
- **TESTING_GUIDE.md** - Advanced testing guide
- **PROJECT_SUMMARY.md** - Project overview

---

## 💡 Tips

1. **Screenshots** are saved after each step
2. **Logs** are in `reports/logs/`
3. **Failed tests** auto-expand in HTML report
4. **Use headed mode** to see what's happening
5. **Debug mode** lets you step through tests

---

## 🎉 You're Ready!

Your test automation framework is fully set up and ready to use!

**Questions?** Check the documentation files or review the code comments.

**Happy Testing!** 🧪

---

**Framework Version:** 1.0.0  
**Location:** `/Users/dimple/Downloads/SaucedemoAutomation`
