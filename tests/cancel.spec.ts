import { test, expect } from '@playwright/test'

test('ticket gets removed after cancel', async ({ page }) => {
  await page.goto('http://localhost:3000/trains')
  await page.getByRole('link', { name: 'Book Ticket' }).first().click()

  await page.getByLabel('Passenger Name').fill('Cancel Me')
  await page.getByRole('button', { name: 'Book Ticket' }).click()

  await page.goto('http://localhost:3000/tickets')

  const ticketRow = page.getByText('Cancel Me')
  await expect(ticketRow).toBeVisible()

  await page.getByRole('button', { name: 'Cancel Ticket (Maybe)' }).click()

  await expect(ticketRow).toBeHidden()
})
