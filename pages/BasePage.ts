import { Page, Locator } from '@playwright/test';
import { WaitHelper } from '../utils/WaitHelper';
import { Logger } from '../utils/Logger';

export class BasePage {
  protected page: Page;
  protected waitHelper: WaitHelper;
  protected logger: Logger;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.waitHelper = new WaitHelper(page);
    this.logger = logger;
  }

  /**
   * Navigate to URL
   */
  async navigate(url: string): Promise<void> {
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      this.logger.info(`Navigated to ${url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to ${url}`, error as Error);
      throw error;
    }
  }

  /**
   * Get element text
   */
  async getElementText(selector: string): Promise<string> {
    try {
      await this.waitHelper.waitForElement(selector);
      const text = await this.page.locator(selector).textContent();
      return text?.trim() || '';
    } catch (error) {
      this.logger.error(`Failed to get text from ${selector}`, error as Error);
      throw error;
    }
  }

  /**
   * Click element
   */
  async clickElement(selector: string): Promise<void> {
    try {
      await this.waitHelper.waitForClickable(selector);
      await this.page.locator(selector).click();
      this.logger.info(`Clicked on ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click ${selector}`, error as Error);
      throw error;
    }
  }

  /**
   * Type text
   */
  async typeText(selector: string, text: string, clearFirst: boolean = true): Promise<void> {
    try {
      await this.waitHelper.waitForElement(selector);
      const input = this.page.locator(selector);
      
      if (clearFirst) {
        await input.clear();
      }
      
      await input.fill(text);
      this.logger.info(`Typed text into ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to type into ${selector}`, error as Error);
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    try {
      return await this.page.locator(selector).count();
    } catch {
      return 0;
    }
  }

  /**
   * Get element attribute
   */
  async getElementAttribute(selector: string, attribute: string): Promise<string | null> {
    try {
      await this.waitHelper.waitForElement(selector);
      return await this.page.locator(selector).getAttribute(attribute);
    } catch (error) {
      this.logger.error(`Failed to get attribute ${attribute} from ${selector}`, error as Error);
      return null;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Select dropdown option
   */
  async selectDropdown(selector: string, value: string): Promise<void> {
    try {
      await this.waitHelper.waitForElement(selector);
      await this.page.locator(selector).selectOption(value);
      this.logger.info(`Selected "${value}" from dropdown ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option from ${selector}`, error as Error);
      throw error;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    try {
      const element = this.page.locator(selector);
      await element.scrollIntoViewIfNeeded();
      this.logger.info(`Scrolled to ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to scroll to ${selector}`, error as Error);
      throw error;
    }
  }

  /**
   * Hover over element
   */
  async hoverElement(selector: string): Promise<void> {
    try {
      await this.waitHelper.waitForElement(selector);
      await this.page.locator(selector).hover();
      this.logger.info(`Hovered over ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to hover over ${selector}`, error as Error);
      throw error;
    }
  }
}
