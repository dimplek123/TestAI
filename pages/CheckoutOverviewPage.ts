import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class CheckoutOverviewPage extends BasePage {
  // Selectors
  private readonly selectors = {
    itemTotal: '.summary_subtotal_label',
    tax: '.summary_tax_label',
    total: '.summary_total_label',
    finishButton: '#finish',
    cancelButton: '#cancel',
    cartItems: '.cart_item',
    paymentInfo: '.summary_value_label',
    shippingInfo: '.summary_value_label',
    title: '.title'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Get item total (subtotal before tax)
   */
  async getItemTotal(): Promise<number> {
    const text = await this.getElementText(this.selectors.itemTotal);
    const match = text.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get tax amount
   */
  async getTax(): Promise<number> {
    const text = await this.getElementText(this.selectors.tax);
    const match = text.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get total amount
   */
  async getTotal(): Promise<number> {
    const text = await this.getElementText(this.selectors.total);
    const match = text.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Verify order totals
   */
  async verifyOrderTotals(expectedSubtotal: number): Promise<void> {
    this.logger.info('Verifying order totals');

    const itemTotal = await this.getItemTotal();
    const tax = await this.getTax();
    const total = await this.getTotal();

    // Allow for small floating point differences
    const tolerance = 0.01;

    if (Math.abs(itemTotal - expectedSubtotal) > tolerance) {
      const errorMsg = `Item total mismatch. Expected: $${expectedSubtotal.toFixed(2)}, Actual: $${itemTotal.toFixed(2)}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const calculatedTotal = itemTotal + tax;
    if (Math.abs(total - calculatedTotal) > tolerance) {
      const errorMsg = `Total mismatch. Expected: $${calculatedTotal.toFixed(2)}, Actual: $${total.toFixed(2)}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    this.logger.success(
      `Order totals verified - Subtotal: $${itemTotal.toFixed(2)}, Tax: $${tax.toFixed(2)}, Total: $${total.toFixed(2)}`
    );
  }

  /**
   * Finish checkout
   */
  async finishCheckout(): Promise<void> {
    await this.clickElement(this.selectors.finishButton);
    this.logger.info('Clicked finish button');
  }

  /**
   * Cancel checkout
   */
  async cancelCheckout(): Promise<void> {
    await this.clickElement(this.selectors.cancelButton);
    this.logger.info('Clicked cancel button');
  }

  /**
   * Get number of items in overview
   */
  async getItemCount(): Promise<number> {
    return await this.getElementCount(this.selectors.cartItems);
  }

  /**
   * Verify item count matches expected
   */
  async verifyItemCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getItemCount();
    
    if (actualCount !== expectedCount) {
      const errorMsg = `Item count mismatch. Expected: ${expectedCount}, Actual: ${actualCount}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    this.logger.success(`Item count verified: ${expectedCount}`);
  }

  /**
   * Get all order summary details
   */
  async getOrderSummary(): Promise<{
    itemTotal: number;
    tax: number;
    total: number;
    itemCount: number;
  }> {
    return {
      itemTotal: await this.getItemTotal(),
      tax: await this.getTax(),
      total: await this.getTotal(),
      itemCount: await this.getItemCount()
    };
  }
}
