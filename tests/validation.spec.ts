import { test, expect } from '@playwright/test'

test.describe('Validation', () => {
  test('should block empty passenger name', async ({ page }) => {
    await page.goto('http://localhost:3000/trains')
    await page.getByRole('link', { name: 'Book Ticket' }).first().click()

    await page.getByLabel('Passenger Name').fill('')
    await page.getByLabel('Seat Count').fill('-5')
    await page.getByRole('button', { name: 'Book Ticket' }).click()

    // Expected behavior: show validation error (but bug allows submission)
    await expect(page.getByText('Passenger name is required')).toBeVisible()
  })
})
