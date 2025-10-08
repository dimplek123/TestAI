import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';
import { Product } from './InventoryPage';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export class CartPage extends BasePage {
  // Selectors
  private readonly selectors = {
    cartItems: '.cart_item',
    itemName: '.inventory_item_name',
    itemDescription: '.inventory_item_desc',
    itemPrice: '.inventory_item_price',
    removeButton: 'button[id^="remove"]',
    checkoutButton: '#checkout',
    continueShoppingButton: '#continue-shopping',
    cartQuantity: '.cart_quantity',
    cartTitle: '.title'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Get all cart items
   */
  async getCartItems(): Promise<CartItem[]> {
    try {
      this.logger.info('Fetching cart items');

      // Check if cart is empty
      const itemCount = await this.getElementCount(this.selectors.cartItems);
      if (itemCount === 0) {
        this.logger.info('Cart is empty');
        return [];
      }

      await this.waitHelper.waitForElement(this.selectors.cartItems);

      const items = this.page.locator(this.selectors.cartItems);
      const count = await items.count();
      const cartItems: CartItem[] = [];

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const name = await item.locator(this.selectors.itemName).textContent();
        const description = await item.locator(this.selectors.itemDescription).textContent();
        const priceText = await item.locator(this.selectors.itemPrice).textContent();
        const price = parseFloat(priceText?.replace('$', '') || '0');
        const quantityText = await item.locator(this.selectors.cartQuantity).textContent();
        const quantity = parseInt(quantityText || '1');

        cartItems.push({
          name: name?.trim() || '',
          price,
          quantity,
          description: description?.trim() || ''
        });
      }

      this.logger.info(`Found ${cartItems.length} items in cart`);
      return cartItems;
    } catch (error) {
      this.logger.error('Failed to fetch cart items', error as Error);
      throw error;
    }
  }

  /**
   * Calculate cart subtotal
   */
  async calculateSubtotal(): Promise<number> {
    const items = await this.getCartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.logger.info(`Calculated subtotal: $${subtotal.toFixed(2)}`);
    return subtotal;
  }

  /**
   * Verify cart contains expected products
   */
  async verifyCartItems(expectedProducts: Product[]): Promise<void> {
    const cartItems = await this.getCartItems();

    if (cartItems.length !== expectedProducts.length) {
      const errorMsg = `Cart item count mismatch. Expected: ${expectedProducts.length}, Actual: ${cartItems.length}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    for (const expectedProduct of expectedProducts) {
      const found = cartItems.find(
        item => item.name === expectedProduct.name && item.price === expectedProduct.price
      );
      
      if (!found) {
        const errorMsg = `Product not found in cart: ${expectedProduct.name}`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    this.logger.success('Cart items verified successfully');
  }

  /**
   * Remove item from cart by name
   */
  async removeItem(productName: string): Promise<void> {
    try {
      this.logger.info(`Removing item from cart: ${productName}`);

      const items = this.page.locator(this.selectors.cartItems);
      const count = await items.count();

      for (let i = 0; i < count; i++) {
        const item = items.nth(i);
        const name = await item.locator(this.selectors.itemName).textContent();

        if (name?.trim() === productName) {
          await item.locator(this.selectors.removeButton).click();
          await this.waitHelper.customWait(500);
          this.logger.success(`Removed ${productName} from cart`);
          return;
        }
      }

      throw new Error(`Product ${productName} not found in cart`);
    } catch (error) {
      this.logger.error(`Failed to remove item: ${productName}`, error as Error);
      throw error;
    }
  }

  /**
   * Remove all items from cart
   */
  async removeAllItems(): Promise<void> {
    const items = await this.getCartItems();
    
    for (const item of items) {
      await this.removeItem(item.name);
    }
    
    this.logger.success('Removed all items from cart');
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.clickElement(this.selectors.checkoutButton);
    this.logger.info('Proceeded to checkout');
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.clickElement(this.selectors.continueShoppingButton);
    this.logger.info('Continued shopping');
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const count = await this.getElementCount(this.selectors.cartItems);
    return count === 0;
  }

  /**
   * Get item count in cart
   */
  async getItemCount(): Promise<number> {
    return await this.getElementCount(this.selectors.cartItems);
  }

  /**
   * Check if product exists in cart
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const items = await this.getCartItems();
    return items.some(item => item.name === productName);
  }
}
