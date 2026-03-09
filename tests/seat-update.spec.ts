import { test, expect } from '@playwright/test'

const parseSeats = (text: string) => Number(text.split('/')[0].trim())

test('seat availability goes down after booking and back up after cancellation', async ({ page }) => {
  await page.goto('http://localhost:3000/trains')
  const firstCard = page.locator('[data-testid^="train-card-"]').first()
  await expect(firstCard).toBeVisible()
  const cardTestId = await firstCard.getAttribute('data-testid')
  const seatLocator = firstCard.getByTestId('seat-availability')
  const beforeBooking = parseSeats(await seatLocator.innerText())
  const riderName = `Seat Tester ${Date.now()}`

  await firstCard.getByRole('link', { name: 'Book Ticket' }).click()
  await page.getByLabel('Passenger Name').fill(riderName)
  await page.getByLabel('Seat Count').fill('1')
  await page.getByRole('button', { name: 'Book Ticket' }).click()
  await page.waitForURL('**/tickets')
  await expect(page.getByText(riderName)).toBeVisible()

  await page.goto('http://localhost:3000/trains')
  const afterBookingLocator = page
    .locator(`[data-testid="${cardTestId}"]`)
    .getByTestId('seat-availability')
  const afterBooking = parseSeats(await afterBookingLocator.innerText())
  expect(afterBooking).toBe(beforeBooking - 1)

  await page.goto('http://localhost:3000/tickets')
  const ticketCard = page.getByTestId('ticket-card').filter({ hasText: riderName })
  await ticketCard.getByRole('button', { name: 'Cancel Ticket' }).click()
  await expect(ticketCard.getByText(riderName)).toBeHidden()

  await page.goto('http://localhost:3000/trains')
  const afterCancelLocator = page
    .locator(`[data-testid="${cardTestId}"]`)
    .getByTestId('seat-availability')
  const afterCancel = parseSeats(await afterCancelLocator.innerText())
  expect(afterCancel).toBe(beforeBooking)
})
