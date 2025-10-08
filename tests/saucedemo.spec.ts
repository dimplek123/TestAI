import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, Product } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { DataReader, UserCredential } from '../utils/DataReader';
import { Logger } from '../utils/Logger';
import { ScreenshotHelper } from '../utils/ScreenshotHelper';
import { HTMLReportGenerator, TestResult } from '../utils/HTMLReportGenerator';
import { WaitHelper } from '../utils/WaitHelper';

const BASE_URL = 'https://www.saucedemo.com';
const reportGenerator = new HTMLReportGenerator();

test.describe('Saucedemo Complete Purchase Flow', () => {
  
  test.afterAll(async () => {
    // Generate final HTML report
    reportGenerator.saveReport(`saucedemo-test-report-${Date.now()}.html`);
  });

  // Test for each user type
  const users = DataReader.readCredentialsFromJSON();
  
  users.forEach((user: UserCredential) => {
    test(`Complete purchase flow - ${user.type} user (${user.username})`, async ({ page }) => {
      const startTime = new Date();
      const logger = new Logger(`purchase_flow_${user.type}`);
      const screenshotHelper = new ScreenshotHelper(page, `purchase_${user.type}`);
      
      const testResult: TestResult = {
        testName: `Complete Purchase Flow - ${user.type}`,
        username: user.username,
        userType: user.type,
        status: 'PASSED',
        screenshots: [],
        logs: [],
        error: null,
        duration: '0s',
        startTime: startTime.toLocaleString(),
        endTime: ''
      };

      try {
        logger.info(`========== Starting Test for ${user.username} ==========`);

        // Initialize page objects
        const loginPage = new LoginPage(page, logger);
        const inventoryPage = new InventoryPage(page, logger);
        const cartPage = new CartPage(page, logger);
        const checkoutPage = new CheckoutPage(page, logger);
        const checkoutOverviewPage = new CheckoutOverviewPage(page, logger);
        const checkoutCompletePage = new CheckoutCompletePage(page, logger);
        const waitHelper = new WaitHelper(page);

        // Step 1: Navigate to Saucedemo
        logger.info('Step 1: Navigating to Saucedemo');
        await loginPage.navigate(BASE_URL);
        testResult.screenshots.push({
          step: '01_landing_page',
          path: await screenshotHelper.capture('01_landing_page')
        });

        // Step 2: Login
        logger.info('Step 2: Performing login');
        
        if (!user.shouldSucceed) {
          // Test locked out user scenario
          try {
            await loginPage.login(user.username, user.password);
            throw new Error('Expected login to fail for locked out user, but it succeeded');
          } catch (error: any) {
            if (await loginPage.isLockedOut()) {
              logger.success('Locked out user correctly prevented from logging in');
              testResult.screenshots.push({
                step: '02_locked_out_error',
                path: await screenshotHelper.capture('02_locked_out_error')
              });
              
              testResult.logs = logger.getLogs();
              const endTime = new Date();
              testResult.duration = `${((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2)}s`;
              testResult.endTime = endTime.toLocaleString();
              
              reportGenerator.addTestResult(testResult);
              return;
            } else {
              throw error;
            }
          }
        }

        await loginPage.login(user.username, user.password);
        testResult.screenshots.push({
          step: '02_after_login',
          path: await screenshotHelper.capture('02_after_login')
        });

        // Step 3: Handle problem user scenario
        if (user.hasIssues) {
          logger.info('Step 3: Checking for problem user issues (broken images)');
          const brokenImages = await inventoryPage.checkForBrokenImages();
          if (brokenImages.length > 0) {
            logger.warning(`Problem user detected: ${brokenImages.length} broken images found`);
            testResult.screenshots.push({
              step: '03_problem_user_issues',
              path: await screenshotHelper.capture('03_problem_user_issues')
            });
          }
        }

        // Step 4: Get most expensive products
        logger.info('Step 4: Identifying most expensive products');
        const expensiveProducts = await inventoryPage.getMostExpensiveProducts(2);
        logger.info(`Selected products: ${expensiveProducts.map(p => p.name).join(', ')}`);

        // Step 5: Add products to cart
        logger.info('Step 5: Adding products to cart');
        for (const product of expensiveProducts) {
          await inventoryPage.addProductToCart(product.name);
          await waitHelper.customWait(500);
        }
        testResult.screenshots.push({
          step: '05_products_added_to_cart',
          path: await screenshotHelper.capture('05_products_added')
        });

        // Step 6: Verify cart badge
        logger.info('Step 6: Verifying cart badge count');
        await inventoryPage.verifyCartBadgeCount(expensiveProducts.length);
        testResult.screenshots.push({
          step: '06_cart_badge_verified',
          path: await screenshotHelper.capture('06_cart_badge')
        });

        // Step 7: Go to cart
        logger.info('Step 7: Navigating to cart');
        await inventoryPage.goToCart();
        await waitHelper.customWait(500);
        testResult.screenshots.push({
          step: '07_cart_page',
          path: await screenshotHelper.capture('07_cart_page')
        });

        // Step 8: Verify cart items
        logger.info('Step 8: Verifying cart items');
        await cartPage.verifyCartItems(expensiveProducts);

        // Step 9: Calculate subtotal
        logger.info('Step 9: Calculating cart subtotal');
        const subtotal = await cartPage.calculateSubtotal();
        logger.info(`Subtotal calculated: $${subtotal.toFixed(2)}`);

        // Step 10: Remove one item
        logger.info('Step 10: Removing one item from cart');
        const itemToRemove = expensiveProducts[0].name;
        await cartPage.removeItem(itemToRemove);
        await waitHelper.customWait(500);
        testResult.screenshots.push({
          step: '10_after_item_removal',
          path: await screenshotHelper.capture('10_item_removed')
        });

        // Step 11: Recalculate subtotal
        logger.info('Step 11: Recalculating subtotal after removal');
        const updatedSubtotal = await cartPage.calculateSubtotal();
        const expectedSubtotal = expensiveProducts[1].price;

        if (Math.abs(updatedSubtotal - expectedSubtotal) > 0.01) {
          throw new Error(
            `Subtotal mismatch after removal. Expected: $${expectedSubtotal}, Actual: $${updatedSubtotal}`
          );
        }
        logger.success('Cart updated correctly after item removal');

        // Step 12: Proceed to checkout
        logger.info('Step 12: Proceeding to checkout');
        await cartPage.proceedToCheckout();
        await waitHelper.customWait(500);
        testResult.screenshots.push({
          step: '12_checkout_page',
          path: await screenshotHelper.capture('12_checkout')
        });

        // Step 13: Fill checkout information
        logger.info('Step 13: Filling checkout information');
        const checkoutData = DataReader.readCheckoutInfo();
        await checkoutPage.fillCheckoutInformation(
          checkoutData.firstName,
          checkoutData.lastName,
          checkoutData.postalCode
        );
        testResult.screenshots.push({
          step: '13_checkout_info_filled',
          path: await screenshotHelper.capture('13_info_filled')
        });

        // Step 14: Continue to overview
        logger.info('Step 14: Continuing to checkout overview');
        await checkoutPage.continue();
        
        // Custom wait strategy for slow-loading overview page
        await waitHelper.waitUntilStable('.summary_info', 100, 500);
        
        testResult.screenshots.push({
          step: '14_checkout_overview',
          path: await screenshotHelper.capture('14_overview')
        });

        // Step 15: Verify order totals
        logger.info('Step 15: Verifying order totals');
        await checkoutOverviewPage.verifyOrderTotals(updatedSubtotal);
        testResult.screenshots.push({
          step: '15_totals_verified',
          path: await screenshotHelper.capture('15_totals')
        });

        // Step 16: Complete purchase
        logger.info('Step 16: Completing purchase');
        await checkoutOverviewPage.finishCheckout();
        
        // Wait for completion page
        await waitHelper.customWait(1000);
        
        testResult.screenshots.push({
          step: '16_order_complete',
          path: await screenshotHelper.capture('16_complete')
        });

        // Step 17: Verify completion
        logger.info('Step 17: Verifying checkout completion');
        await checkoutCompletePage.verifyCheckoutComplete();
        testResult.screenshots.push({
          step: '17_completion_verified',
          path: await screenshotHelper.capture('17_verified')
        });

        logger.success(`========== Test Completed Successfully for ${user.username} ==========`);
        testResult.status = 'PASSED';

      } catch (error: any) {
        logger.error(`========== Test Failed for ${user.username} ==========`, error);
        testResult.status = 'FAILED';
        testResult.error = error.message + '\n' + (error.stack || '');

        try {
          testResult.screenshots.push({
            step: 'ERROR_SCREENSHOT',
            path: await screenshotHelper.captureOnFailure('test_failure')
          });
        } catch (screenshotError) {
          logger.error('Failed to capture error screenshot', screenshotError as Error);
        }

        throw error;
      } finally {
        const endTime = new Date();
        testResult.duration = `${((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2)}s`;
        testResult.endTime = endTime.toLocaleString();
        testResult.logs = logger.getLogs();
        
        reportGenerator.addTestResult(testResult);
      }
    });
  });

  // Additional negative test cases
  test('Negative Test - Empty checkout form submission', async ({ page }) => {
    const logger = new Logger('negative_empty_form');
    const screenshotHelper = new ScreenshotHelper(page, 'negative_test');
    
    const loginPage = new LoginPage(page, logger);
    const inventoryPage = new InventoryPage(page, logger);
    const cartPage = new CartPage(page, logger);
    const checkoutPage = new CheckoutPage(page, logger);

    await loginPage.navigate(BASE_URL);
    await loginPage.login('standard_user', 'secret_sauce');
    
    const products = await inventoryPage.getMostExpensiveProducts(1);
    await inventoryPage.addProductToCart(products[0].name);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    
    // Try to continue without filling form
    await checkoutPage.continue();
    await screenshotHelper.capture('empty_form_error');
    
    const hasError = await checkoutPage.hasRequiredFieldError();
    expect(hasError).toBeTruthy();
    
    logger.success('Empty form validation working correctly');
  });

  test('Negative Test - Verify cart badge with no items', async ({ page }) => {
    const logger = new Logger('negative_empty_cart');
    const loginPage = new LoginPage(page, logger);
    const inventoryPage = new InventoryPage(page, logger);

    await loginPage.navigate(BASE_URL);
    await loginPage.login('standard_user', 'secret_sauce');
    
    const badgeCount = await inventoryPage.getCartBadgeCount();
    expect(badgeCount).toBe(0);
    
    logger.success('Empty cart badge verification passed');
  });
});
