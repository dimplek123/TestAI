import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export interface Product {
  name: string;
  price: number;
  description: string;
  selector: string;
  index: number;
}

export class InventoryPage extends BasePage {
  // Selectors
  private readonly selectors = {
    inventoryItems: '.inventory_item',
    itemName: '.inventory_item_name',
    itemDescription: '.inventory_item_desc',
    itemPrice: '.inventory_item_price',
    addToCartButton: 'button[id^="add-to-cart"]',
    removeButton: 'button[id^="remove"]',
    cartBadge: '.shopping_cart_badge',
    cartLink: '.shopping_cart_link',
    productImage: '.inventory_item_img',
    sortDropdown: '.product_sort_container',
    burgerMenu: '#react-burger-menu-btn'
  };

  constructor(page: Page, logger: Logger) {
    super(page, logger);
  }

  /**
   * Get all products from inventory
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      this.logger.info('Fetching all products from inventory');
      await this.waitHelper.waitForElement(this.selectors.inventoryItems);

      const itemCount = await this.getElementCount(this.selectors.inventoryItems);
      const products: Product[] = [];

      for (let i = 0; i < itemCount; i++) {
        const item = this.page.locator(this.selectors.inventoryItems).nth(i);
        
        const name = await item.locator(this.selectors.itemName).textContent();
        const description = await item.locator(this.selectors.itemDescription).textContent();
        const priceText = await item.locator(this.selectors.itemPrice).textContent();
        const price = parseFloat(priceText?.replace('$', '') || '0');

        products.push({
          name: name?.trim() || '',
          price,
          description: description?.trim() || '',
          selector: `${this.selectors.inventoryItems}:nth-child(${i + 1})`,
          index: i
        });
      }

      this.logger.info(`Found ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error('Failed to fetch products', error as Error);
      throw error;
    }
  }

  /**
   * Get the N most expensive products
   */
  async getMostExpensiveProducts(count: number = 2): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    const sorted = allProducts.sort((a, b) => b.price - a.price);
    const topProducts = sorted.slice(0, count);

    this.logger.info(
      `Most expensive products: ${topProducts.map(p => `${p.name} ($${p.price})`).join(', ')}`
    );
    return topProducts;
  }

  /**
   * Add product to cart by name
   */
  async addProductToCart(productName: string): Promise<void> {
    try {
      this.logger.info(`Adding product to cart: ${productName}`);

      const items = this.page.locator(this.selectors.inventoryItems);
      const itemCount = await items.count();

      for (let i = 0; i < itemCount; i++) {
        const item = items.nth(i);
        const name = await item.locator(this.selectors.itemName).textContent();

        if (name?.trim() === productName) {
          const addButton = item.locator(this.selectors.addToCartButton);

          // Check if product is in stock (button exists and visible)
          const isVisible = await addButton.isVisible().catch(() => false);
          
          if (isVisible) {
            await addButton.click();
            await this.waitHelper.customWait(500); // Wait for animation
            this.logger.success(`Added ${productName} to cart`);
            return;
          } else {
            this.logger.warning(`Add to cart button not found for ${productName} - possibly out of stock`);
            throw new Error(`Product ${productName} appears to be out of stock`);
          }
        }
      }

      throw new Error(`Product ${productName} not found in inventory`);
    } catch (error) {
      this.logger.error(`Failed to add product to cart: ${productName}`, error as Error);
      throw error;
    }
  }

  /**
   * Remove product from cart by name
   */
  async removeProductFromCart(productName: string): Promise<void> {
    try {
      this.logger.info(`Removing product from cart: ${productName}`);

      const items = this.page.locator(this.selectors.inventoryItems);
      const itemCount = await items.count();

      for (let i = 0; i < itemCount; i++) {
        const item = items.nth(i);
        const name = await item.locator(this.selectors.itemName).textContent();

        if (name?.trim() === productName) {
          const removeButton = item.locator(this.selectors.removeButton);
          await removeButton.click();
          await this.waitHelper.customWait(500);
          this.logger.success(`Removed ${productName} from cart`);
          return;
        }
      }

      throw new Error(`Product ${productName} not found in inventory`);
    } catch (error) {
      this.logger.error(`Failed to remove product from cart: ${productName}`, error as Error);
      throw error;
    }
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<number> {
    try {
      if (await this.isElementVisible(this.selectors.cartBadge)) {
        const text = await this.getElementText(this.selectors.cartBadge);
        return parseInt(text) || 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Verify cart badge count
   */
  async verifyCartBadgeCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getCartBadgeCount();
    if (actualCount !== expectedCount) {
      const errorMsg = `Cart badge mismatch. Expected: ${expectedCount}, Actual: ${actualCount}`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    this.logger.success(`Cart badge count verified: ${expectedCount}`);
  }

  /**
   * Navigate to cart
   */
  async goToCart(): Promise<void> {
    await this.clickElement(this.selectors.cartLink);
    this.logger.info('Navigated to cart page');
  }

  /**
   * Check for broken images (for problem_user)
   */
  async checkForBrokenImages(): Promise<string[]> {
    const brokenImages: string[] = [];
    const images = this.page.locator(this.selectors.productImage);
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');

      // Problem user has specific broken image patterns
      if (src && (src.includes('WithGarbageOnItToBreakTheUrl') || src.includes('/static/media/sl-404'))) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      this.logger.warning(`Found ${brokenImages.length} broken images`);
    }

    return brokenImages;
  }

  /**
   * Sort products
   */
  async sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    const sortValues = {
      az: 'az',
      za: 'za',
      lohi: 'lohi',
      hilo: 'hilo'
    };

    await this.selectDropdown(this.selectors.sortDropdown, sortValues[sortOption]);
    await this.waitHelper.customWait(500);
    this.logger.info(`Sorted products by: ${sortOption}`);
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const items = this.page.locator(this.selectors.inventoryItems);
    const itemCount = await items.count();

    for (let i = 0; i < itemCount; i++) {
      const item = items.nth(i);
      const name = await item.locator(this.selectors.itemName).textContent();

      if (name?.trim() === productName) {
        const removeButton = item.locator(this.selectors.removeButton);
        return await removeButton.isVisible().catch(() => false);
      }
    }

    return false;
  }
}
