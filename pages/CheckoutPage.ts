import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class CheckoutPage extends BasePage {
  // Selectors
  private readonly selectors = {
    firstNameInput: '#first-name',
    lastNameInput: '#last-name',
    postalCodeInput: '#postal-code',
    continueButton: '#continue',
    cancelButton: '#cancel',
    errorMessage: '[data-test="error"]',
    title: '.title'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Fill checkout information
   */
  async fillCheckoutInformation(
    firstName: string,
    lastName: string,
    postalCode: string
  ): Promise<void> {
    try {
      this.logger.info('Filling checkout information');

      await this.typeText(this.selectors.firstNameInput, firstName);
      await this.typeText(this.selectors.lastNameInput, lastName);
      await this.typeText(this.selectors.postalCodeInput, postalCode);

      this.logger.success('Checkout information filled successfully');
    } catch (error) {
      this.logger.error('Failed to fill checkout information', error as Error);
      throw error;
    }
  }

  /**
   * Click continue button
   */
  async continue(): Promise<void> {
    await this.clickElement(this.selectors.continueButton);
    this.logger.info('Clicked continue on checkout page');
  }

  /**
   * Click cancel button
   */
  async cancel(): Promise<void> {
    await this.clickElement(this.selectors.cancelButton);
    this.logger.info('Clicked cancel on checkout page');
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
   * Verify required field error
   */
  async hasRequiredFieldError(): Promise<boolean> {
    const errorMsg = await this.getErrorMessage();
    return errorMsg.toLowerCase().includes('required');
  }

  /**
   * Fill only first name (negative test)
   */
  async fillOnlyFirstName(firstName: string): Promise<void> {
    await this.typeText(this.selectors.firstNameInput, firstName);
    this.logger.info('Filled only first name');
  }

  /**
   * Fill only last name (negative test)
   */
  async fillOnlyLastName(lastName: string): Promise<void> {
    await this.typeText(this.selectors.lastNameInput, lastName);
    this.logger.info('Filled only last name');
  }

  /**
   * Fill only postal code (negative test)
   */
  async fillOnlyPostalCode(postalCode: string): Promise<void> {
    await this.typeText(this.selectors.postalCodeInput, postalCode);
    this.logger.info('Filled only postal code');
  }

  /**
   * Clear checkout form
   */
  async clearCheckoutForm(): Promise<void> {
    await this.typeText(this.selectors.firstNameInput, '', false);
    await this.typeText(this.selectors.lastNameInput, '', false);
    await this.typeText(this.selectors.postalCodeInput, '', false);
    this.logger.info('Cleared checkout form');
  }
}
