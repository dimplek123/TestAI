import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class LoginPage extends BasePage {
  // Selectors
  private readonly selectors = {
    usernameInput: '#user-name',
    passwordInput: '#password',
    loginButton: '#login-button',
    errorMessage: '[data-test="error"]',
    errorButton: '.error-button',
    logo: '.login_logo'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Perform login
   */
  async login(username: string, password: string): Promise<void> {
    try {
      this.logger.info(`Attempting login with username: ${username}`);
      
      await this.typeText(this.selectors.usernameInput, username);
      await this.typeText(this.selectors.passwordInput, password);
      await this.clickElement(this.selectors.loginButton);

      // Wait for either success (inventory page) or error message
      await this.waitHelper.customWait(1000);

      if (await this.isElementVisible(this.selectors.errorMessage)) {
        const errorMsg = await this.getErrorMessage();
        this.logger.error(`Login failed: ${errorMsg}`);
        throw new Error(`Login failed: ${errorMsg}`);
      }

      this.logger.success(`Login successful for user: ${username}`);
    } catch (error) {
      this.logger.error(`Login process failed for ${username}`, error as Error);
      throw error;
    }
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isElementVisible(this.selectors.errorMessage)) {
      return await this.getElementText(this.selectors.errorMessage);
    }
    return '';
  }

  /**
   * Check if user is locked out
   */
  async isLockedOut(): Promise<boolean> {
    const errorMsg = await this.getErrorMessage();
    return errorMsg.toLowerCase().includes('locked out');
  }

  /**
   * Check if on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.logo);
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    await this.typeText(this.selectors.usernameInput, '', false);
    await this.typeText(this.selectors.passwordInput, '', false);
    this.logger.info('Cleared login form');
  }

  /**
   * Click error button to dismiss error
   */
  async dismissError(): Promise<void> {
    if (await this.isElementVisible(this.selectors.errorButton)) {
      await this.clickElement(this.selectors.errorButton);
      this.logger.info('Dismissed error message');
    }
  }
}
