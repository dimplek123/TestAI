import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class CheckoutCompletePage extends BasePage {
  // Selectors
  private readonly selectors = {
    completeHeader: '.complete-header',
    completeText: '.complete-text',
    backHomeButton: '#back-to-products',
    ponyExpressImage: '.pony_express',
    title: '.title'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Check if checkout is complete
   */
  async isCheckoutComplete(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.completeHeader);
  }

  /**
   * Get completion message
   */
  async getCompleteMessage(): Promise<string> {
    return await this.getElementText(this.selectors.completeHeader);
  }

  /**
   * Get completion description
   */
  async getCompleteDescription(): Promise<string> {
    return await this.getElementText(this.selectors.completeText);
  }

  /**
   * Verify checkout completion
   */
  async verifyCheckoutComplete(): Promise<void> {
    const isComplete = await this.isCheckoutComplete();
    
    if (!isComplete) {
      const errorMsg = 'Checkout completion page not displayed';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const message = await this.getCompleteMessage();
    const messageLower = message.toLowerCase();
    
    if (!messageLower.includes('complete') && !messageLower.includes('thank you')) {
      const errorMsg = `Unexpected checkout completion message: ${message}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.success('Checkout completed successfully');
  }

  /**
   * Go back to products page
   */
  async backToProducts(): Promise<void> {
    await this.clickElement(this.selectors.backHomeButton);
    this.logger.info('Navigated back to products page');
  }

  /**
   * Verify pony express image is displayed
   */
  async isPonyExpressImageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.ponyExpressImage);
  }

  /**
   * Get complete order confirmation details
   */
  async getOrderConfirmationDetails(): Promise<{
    header: string;
    description: string;
    isComplete: boolean;
  }> {
    return {
      header: await this.getCompleteMessage(),
      description: await this.getCompleteDescription(),
      isComplete: await this.isCheckoutComplete()
    };
  }
}
