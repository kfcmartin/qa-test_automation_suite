import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';

test.describe('Swag Labs Checkout', () => {
    test('User can complete a purchase end to end', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();
        await expect(page.locator('.title')).toHaveText('Products');

        await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        //Verify the item registered in the cart before proceeding.
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

        await page.locator('.shopping_cart_link').click();
        await page.locator('[data-test="checkout"]').click();

        await page.locator('[data-test="firstName"]').fill('Keith');
        await page.locator('[data-test="lastName"]').fill('Martin');
        await page.locator('[data-test="postalCode"]').fill('1210');
        await page.locator('[data-test="continue"]').click();

        await page.locator('[data-test="finish"]').click();

        await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    });

    test('Locked out user cannot log in', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.locator('[data-test="username"]').fill('locked_out_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        // Login should be rejected and an error shown, not navigate to the products page
        await expect(page.locator('[data-test="error"]')).toContainText('locked out');
        await expect(page).toHaveURL(BASE_URL + '/');
    });
});

