import { Page, Locator } from '@playwright/test';

export class WaitHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(
    selector: string, 
    timeout: number = 10000
  ): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        timeout,
        state: 'visible'
      });
    } catch (error) {
      throw new Error(
        `Element ${selector} not found within ${timeout}ms. Error: ${error}`
      );
    }
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.warn('Network idle timeout exceeded:', error);
    }
  }

  /**
   * Custom wait with artificial delay
   */
  async customWait(milliseconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Wait until element position is stable (for animations)
   */
  async waitUntilStable(
    selector: string,
    checkInterval: number = 100,
    stableTime: number = 500
  ): Promise<void> {
    const element = this.page.locator(selector);
    let lastPosition = await element.boundingBox();
    let stableCount = 0;
    const requiredStableChecks = stableTime / checkInterval;

    while (stableCount < requiredStableChecks) {
      await this.customWait(checkInterval);
      const currentPosition = await element.boundingBox();

      if (JSON.stringify(lastPosition) === JSON.stringify(currentPosition)) {
        stableCount++;
      } else {
        stableCount = 0;
        lastPosition = currentPosition;
      }
    }
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(selector: string, timeout: number = 10000): Promise<void> {
    await this.waitForElement(selector, timeout);
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    // Check if element is enabled
    const isEnabled = await element.isEnabled();
    if (!isEnabled) {
      throw new Error(`Element ${selector} is not clickable - disabled`);
    }
  }

  /**
   * Wait for any of the selectors to appear
   */
  async waitForAny(selectors: string[], timeout: number = 10000): Promise<string> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      for (const selector of selectors) {
        const element = this.page.locator(selector);
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          return selector;
        }
      }
      await this.customWait(100);
    }
    
    throw new Error(`None of the selectors appeared within ${timeout}ms: ${selectors.join(', ')}`);
  }

  /**
   * Wait for element to disappear
   */
  async waitForHidden(selector: string, timeout: number = 10000): Promise<void> {
    try {
      await this.page.waitForSelector(selector, {
        state: 'hidden',
        timeout
      });
    } catch (error) {
      throw new Error(`Element ${selector} did not disappear within ${timeout}ms`);
    }
  }

  /**
   * Wait for text to appear in element
   */
  async waitForText(
    selector: string,
    expectedText: string,
    timeout: number = 10000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = this.page.locator(selector);
      const text = await element.textContent().catch(() => '');
      
      if (text?.includes(expectedText)) {
        return;
      }
      
      await this.customWait(100);
    }
    
    throw new Error(
      `Text "${expectedText}" did not appear in ${selector} within ${timeout}ms`
    );
  }
}
