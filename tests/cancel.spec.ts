import { test, expect } from '@playwright/test'

test('ticket gets removed after cancel', async ({ page }) => {
  const riderName = `Cancel Me ${Date.now()}`
  await page.goto('http://localhost:3000/trains')
  const firstCard = page.locator('[data-testid^="train-card-"]').first()
  await expect(firstCard).toBeVisible()
  await firstCard.getByRole('link', { name: 'Book Ticket' }).click()

  await page.getByLabel('Passenger Name').fill(riderName)
  await page.getByRole('button', { name: 'Book Ticket' }).click()

  await page.goto('http://localhost:3000/tickets')

  const ticketCard = page.getByTestId('ticket-card').filter({ hasText: riderName })
  await expect(ticketCard.getByText(riderName)).toBeVisible()

  await ticketCard.getByRole('button', { name: 'Cancel Ticket' }).click()

  await expect(ticketCard.getByText(riderName)).toBeHidden()
})
