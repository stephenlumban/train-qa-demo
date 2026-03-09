import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('books a ticket, updates seats, and lists the ticket', async ({ page }) => {
    await page.goto('http://localhost:3000/trains')
    const firstCard = page.locator('[data-testid^="train-card-"]').first()
    await expect(firstCard).toBeVisible()
    const cardTestId = await firstCard.getAttribute('data-testid')
    const seatLocator = firstCard.getByTestId('seat-availability')
    const [availableBefore] = (await seatLocator.innerText()).split('/').map((value) => Number(value.trim()))
    const seatsToBook = Math.max(1, Math.min(availableBefore, 2))
    const riderName = `QA Rider ${Date.now()}`

    await firstCard.getByRole('link', { name: 'Book Ticket' }).click()
    await page.getByLabel('Passenger Name').fill(riderName)
    await page.getByLabel('Seat Count').fill(String(seatsToBook))
    await page.getByRole('button', { name: 'Book Ticket' }).click()

    await page.waitForURL('**/tickets', { timeout: 5000 })
    await expect(page.getByText(riderName)).toBeVisible()

    await page.goto('http://localhost:3000/trains')
    const updatedSeatLocator = page
      .locator(`[data-testid="${cardTestId}"]`)
      .getByTestId('seat-availability')
    const [availableAfter] = (await updatedSeatLocator.innerText()).split('/').map((value) => Number(value.trim()))

    expect(availableBefore - seatsToBook).toBe(availableAfter)
  })
})
