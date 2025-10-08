import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotHelper {
  private page: Page;
  private screenshotDir: string;
  private testName: string;

  constructor(page: Page, testName: string) {
    this.page = page;
    this.testName = testName.replace(/\s+/g, '_');
    this.screenshotDir = path.join(__dirname, '../screenshots');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure screenshots directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Capture screenshot with timestamp
   */
  async capture(stepName: string): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
    const filename = `${this.testName}_${stepName}_${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    await this.page.screenshot({
      path: filepath,
      fullPage: true
    });

    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  /**
   * Capture screenshot on failure
   */
  async captureOnFailure(stepName: string): Promise<string> {
    return await this.capture(`FAILURE_${stepName}`);
  }

  /**
   * Capture element screenshot
   */
  async captureElement(selector: string, stepName: string): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    
    const filename = `${this.testName}_${stepName}_element_${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    const element = this.page.locator(selector);
    await element.screenshot({ path: filepath });

    console.log(`📸 Element screenshot saved: ${filename}`);
    return filepath;
  }

  /**
   * Capture screenshot with annotation
   */
  async captureWithHighlight(
    selector: string,
    stepName: string
  ): Promise<string> {
    // Highlight the element
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        (element as HTMLElement).style.border = '3px solid red';
        (element as HTMLElement).style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      }
    }, selector);

    const filepath = await this.capture(stepName);

    // Remove highlight
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        (element as HTMLElement).style.border = '';
        (element as HTMLElement).style.backgroundColor = '';
      }
    }, selector);

    return filepath;
  }

  /**
   * Get all screenshots for this test
   */
  getAllScreenshots(): string[] {
    const files = fs.readdirSync(this.screenshotDir);
    return files
      .filter(file => file.startsWith(this.testName) && file.endsWith('.png'))
      .map(file => path.join(this.screenshotDir, file));
  }

  /**
   * Clean old screenshots for this test
   */
  cleanOldScreenshots(): void {
    const screenshots = this.getAllScreenshots();
    screenshots.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`🗑️  Deleted old screenshot: ${path.basename(file)}`);
      } catch (error) {
        console.error(`Failed to delete screenshot: ${file}`, error);
      }
    });
  }
}
