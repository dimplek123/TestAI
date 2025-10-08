import * as fs from 'fs';
import * as path from 'path';

export interface TestResult {
  testName: string;
  username: string;
  userType: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  screenshots: Array<{ step: string; path: string }>;
  logs: string[];
  error: string | null;
  duration: string;
  startTime: string;
  endTime: string;
}

export class HTMLReportGenerator {
  private testResults: TestResult[] = [];
  private reportDir: string;

  constructor() {
    this.reportDir = path.join(__dirname, '../reports');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  addTestResult(result: TestResult): void {
    this.testResults.push(result);
  }

  generateHTML(): string {
    const timestamp = new Date().toLocaleString();
    const passCount = this.testResults.filter(r => r.status === 'PASSED').length;
    const failCount = this.testResults.filter(r => r.status === 'FAILED').length;
    const skipCount = this.testResults.filter(r => r.status === 'SKIPPED').length;
    const totalCount = this.testResults.length;
    const passRate = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(2) : '0.00';

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saucedemo Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; }
        .header h1 { font-size: 36px; margin-bottom: 10px; font-weight: 700; }
        .header p { opacity: 0.9; font-size: 16px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-card { padding: 25px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .summary-card:hover { transform: translateY(-5px); }
        .summary-card.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .summary-card.passed { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
        .summary-card.failed { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; }
        .summary-card.skipped { background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; }
        .summary-card h3 { font-size: 42px; margin-bottom: 8px; font-weight: 700; }
        .summary-card p { text-transform: uppercase; font-size: 13px; font-weight: 600; letter-spacing: 1px; }
        .tests { padding: 30px; }
        .test-case { background: #fff; margin-bottom: 25px; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .test-case.passed { border-left: 5px solid #4caf50; }
        .test-case.failed { border-left: 5px solid #f44336; }
        .test-case.skipped { border-left: 5px solid #ff9800; }
        .test-header { padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #fafafa; transition: background 0.2s; }
        .test-header:hover { background: #f0f0f0; }
        .test-title { font-size: 18px; font-weight: 600; color: #333; }
        .test-meta { display: flex; gap: 15px; align-items: center; }
        .test-status { padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .test-status.passed { background: #4caf50; color: white; }
        .test-status.failed { background: #f44336; color: white; }
        .test-status.skipped { background: #ff9800; color: white; }
        .test-duration { color: #666; font-size: 14px; font-weight: 500; }
        .test-details { padding: 0 20px 20px; display: none; }
        .test-details.show { display: block; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .test-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
        .info-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .info-value { font-size: 16px; color: #333; font-weight: 500; }
        .logs { background: #263238; color: #aed581; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 400px; overflow-y: auto; margin-top: 20px; }
        .log-line { margin-bottom: 6px; line-height: 1.5; }
        .log-line.error { color: #ff5252; font-weight: 600; }
        .log-line.success { color: #69f0ae; font-weight: 600; }
        .log-line.warning { color: #ffd740; font-weight: 600; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-top: 20px; }
        .screenshot { border-radius: 8px; overflow: hidden; border: 2px solid #e0e0e0; transition: transform 0.2s; cursor: pointer; }
        .screenshot:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .screenshot img { width: 100%; height: auto; display: block; }
        .screenshot-label { padding: 10px; background: #f5f5f5; font-size: 12px; text-align: center; font-weight: 600; color: #555; }
        .error-message { background: #ffebee; border-left: 5px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .error-message strong { color: #c62828; display: block; margin-bottom: 10px; font-size: 16px; }
        .error-message pre { color: #d32f2f; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; }
        .section-title { font-size: 16px; font-weight: 700; color: #333; margin: 25px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
        .pass-rate { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 24px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Saucedemo Test Automation Report</h1>
            <p>Generated on ${timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>${totalCount}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card passed">
                <h3>${passCount}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card failed">
                <h3>${failCount}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card skipped">
                <h3>${skipCount}</h3>
                <p>Skipped</p>
            </div>
        </div>
        
        <div class="pass-rate">
            Pass Rate: ${passRate}%
        </div>
        
        <div class="tests">
`;

    this.testResults.forEach((result, index) => {
      const statusClass = result.status.toLowerCase();
      
      html += `
            <div class="test-case ${statusClass}">
                <div class="test-header" onclick="toggleDetails(${index})">
                    <div class="test-title">${result.testName}</div>
                    <div class="test-meta">
                        <div class="test-duration">⏱️ ${result.duration}</div>
                        <div class="test-status ${statusClass}">${result.status}</div>
                    </div>
                </div>
                <div class="test-details" id="details-${index}">
                    <div class="test-info">
                        <div class="info-item">
                            <div class="info-label">User Type</div>
                            <div class="info-value">${result.userType}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Username</div>
                            <div class="info-value">${result.username}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Start Time</div>
                            <div class="info-value">${result.startTime}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">End Time</div>
                            <div class="info-value">${result.endTime}</div>
                        </div>
                    </div>
`;

      if (result.error) {
        html += `
                    <div class="error-message">
                        <strong>❌ Error Details:</strong>
                        <pre>${this.escapeHtml(result.error)}</pre>
                    </div>
`;
      }

      if (result.logs && result.logs.length > 0) {
        html += `
                    <div class="section-title">📝 Execution Logs</div>
                    <div class="logs">
`;
        result.logs.forEach((log: string) => {
          let logClass = '';
          if (log.includes('[ERROR]')) logClass = 'error';
          else if (log.includes('[SUCCESS]')) logClass = 'success';
          else if (log.includes('[WARNING]')) logClass = 'warning';
          
          html += `                        <div class="log-line ${logClass}">${this.escapeHtml(log)}</div>\n`;
        });
        html += `
                    </div>
`;
      }

      if (result.screenshots && result.screenshots.length > 0) {
        html += `
                    <div class="section-title">📸 Screenshots (${result.screenshots.length})</div>
                    <div class="screenshots">
`;
        result.screenshots.forEach((screenshot: any) => {
          const relativePath = path.relative(this.reportDir, screenshot.path);
          html += `
                        <div class="screenshot" onclick="window.open('${relativePath}', '_blank')">
                            <img src="${relativePath}" alt="${screenshot.step}" loading="lazy" />
                            <div class="screenshot-label">${screenshot.step}</div>
                        </div>
`;
        });
        html += `
                    </div>
`;
      }

      html += `
                </div>
            </div>
`;
    });

    html += `
        </div>
    </div>
    
    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }
        
        // Auto-expand failed tests
        window.addEventListener('load', function() {
            const failedTests = document.querySelectorAll('.test-case.failed .test-details');
            failedTests.forEach(detail => detail.classList.add('show'));
        });
    </script>
</body>
</html>
`;

    return html;
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  saveReport(filename: string = 'test-report.html'): string {
    const html = this.generateHTML();
    const filepath = path.join(this.reportDir, filename);
    
    try {
      fs.writeFileSync(filepath, html, 'utf-8');
      console.log(`\n✅ HTML Report generated successfully!`);
      console.log(`📄 Report location: ${filepath}\n`);
      return filepath;
    } catch (error) {
      console.error('❌ Failed to save HTML report:', error);
      throw error;
    }
  }

  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  clearResults(): void {
    this.testResults = [];
  }
}
