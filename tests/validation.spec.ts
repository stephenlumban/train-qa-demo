import { test, expect } from '@playwright/test'

test.describe('Validation', () => {
  test('blocks empty passenger name and invalid seat count', async ({ page }) => {
    await page.goto('http://localhost:3000/trains')
    const firstCard = page.locator('[data-testid^="train-card-"]').first()
    await expect(firstCard).toBeVisible()
    await firstCard.getByRole('link', { name: 'Book Ticket' }).click()

    await page.getByLabel('Passenger Name').fill('')
    await page.getByLabel('Seat Count').fill('0')
    await page.getByRole('button', { name: 'Book Ticket' }).click()

    await expect(page.getByText('Passenger name is required.')).toBeVisible()
    await expect(page.getByText('Seat count must be a positive whole number.')).toBeVisible()
  })
})
