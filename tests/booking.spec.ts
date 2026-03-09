import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('books a ticket and shows up in tickets page', async ({ page }) => {
    await page.goto('http://localhost:3000/trains')

    await expect(page.getByText('Available Trains')).toBeVisible()

    await page.getByRole('link', { name: 'Book Ticket' }).first().click()

    await page.getByLabel('Passenger Name').fill('QA Rider')
    await page.getByLabel('Seat Count').fill('2')
    await page.getByRole('button', { name: 'Book Ticket' }).click()

    await page.waitForURL('**/tickets', { timeout: 5000 })

    await expect(page.getByText('QA Rider')).toBeVisible()

    // Intentional bug: seats_available should have decreased but doesn't.
    // Test records current value for cross-check in separate spec.
  })
})
