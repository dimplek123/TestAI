# Test Execution Guide

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with browser visible
npm run test:headed

# Run in debug mode (step-by-step)
npm run test:debug

# Run in UI mode (interactive)
npm run test:ui
```

### Advanced Commands

```bash
# Run specific test file
npx playwright test tests/saucedemo.spec.ts

# Run tests matching pattern
npx playwright test -g "standard user"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with multiple workers (parallel)
npx playwright test --workers=2

# Run with retries
npx playwright test --retries=2

# Run and update snapshots
npx playwright test --update-snapshots
```

### Filtering Tests

```bash
# Run only passed tests
npx playwright test --grep="@smoke"

# Skip specific tests
npx playwright test --grep-invert="@slow"

# Run tests by file path
npx playwright test tests/

# Run specific test by line number
npx playwright test tests/saucedemo.spec.ts:45
```

## Viewing Reports

### HTML Report

```bash
npm run report
```

Opens the Playwright HTML report in your default browser.

### Custom HTML Report

The framework generates a custom HTML report automatically after test execution:

**Location:** `reports/saucedemo-test-report-[timestamp].html`

Open this file in a browser to see:
- Test execution summary
- Pass/fail statistics
- Screenshot gallery
- Detailed logs
- Error messages

### Console Output

Real-time colored output shows:
- 🔵 INFO - General information
- 🟢 SUCCESS - Successful operations
- 🟡 WARNING - Warnings
- 🔴 ERROR - Errors

### Log Files

Detailed log files are saved in:
`reports/logs/[testname]_[timestamp].log`

## Test Results Structure

```
SaucedemoAutomation/
├── screenshots/              # All test screenshots
│   ├── purchase_standard_01_landing_page_[timestamp].png
│   ├── purchase_standard_02_after_login_[timestamp].png
│   └── ...
│
├── reports/                  # Test reports
│   ├── saucedemo-test-report-[timestamp].html
│   ├── test-results.json
│   ├── junit-results.xml
│   └── logs/
│       ├── purchase_flow_standard_[timestamp].log
│       └── ...
│
└── playwright-report/        # Playwright HTML report
    └── index.html
```

## Debugging Tests

### Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect elements
- View console logs
- Modify selectors

### UI Mode

```bash
npm run test:ui
```

Interactive mode with:
- Test explorer
- Time travel debugging
- Watch mode
- Screenshot comparison

### VSCode Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Playwright Tests",
      "program": "${workspaceFolder}/node_modules/@playwright/test/cli.js",
      "args": ["test", "--debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/tests.yml`:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npm test
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Jenkins

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Browser not found
```bash
npx playwright install chromium
```

#### 2. Timeout errors
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 90 * 1000
```

#### 3. Flaky tests
Enable retries:
```typescript
retries: 2
```

#### 4. Screenshots not saved
Check `screenshots/` directory permissions

#### 5. Report not generating
Check `reports/` directory exists

### Debug Tips

1. **Use headed mode** to see what's happening
   ```bash
   npm run test:headed
   ```

2. **Add delays** for debugging
   ```typescript
   await page.pause(); // Pauses execution
   ```

3. **Check console logs**
   ```typescript
   console.log(await page.title());
   ```

4. **Use trace viewer**
   ```bash
   npx playwright show-trace trace.zip
   ```

5. **Inspect elements**
   ```typescript
   await page.locator('#element').highlight();
   ```

## Performance Optimization

### 1. Run tests in parallel
```typescript
// playwright.config.ts
workers: 4
```

### 2. Reduce timeout for faster feedback
```typescript
timeout: 30 * 1000
```

### 3. Skip unnecessary waits
Use efficient selectors and minimal waits

### 4. Reuse browser contexts
Share browser instances across tests

### 5. Clean up after tests
Remove screenshots and logs regularly:
```bash
npm run clean
```

## Test Data Management

### Update credentials
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

### Update checkout info
Edit `testData/checkoutInfo.json`:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "postalCode": "54321"
}
```

## Best Practices

1. **Always run tests locally before pushing**
2. **Keep test data separate from code**
3. **Use meaningful test names**
4. **Clean up test artifacts regularly**
5. **Review failed test screenshots**
6. **Keep logs for debugging**
7. **Update dependencies regularly**
8. **Document new test cases**
9. **Use version control for test code**
10. **Monitor test execution time**

---

**Happy Testing! 🧪**
