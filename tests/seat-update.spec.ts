import { test, expect } from '@playwright/test'

test('seat availability decreases after booking', async ({ page }) => {
  await page.goto('http://localhost:3000/trains')

  const seatCell = page.locator('text=Available Seats').locator('..').locator('..').first()
  const beforeText = await seatCell.innerText()

  await page.getByRole('link', { name: 'Book Ticket' }).first().click()
  await page.getByLabel('Passenger Name').fill('Seat Tester')
  await page.getByLabel('Seat Count').fill('3')
  await page.getByRole('button', { name: 'Book Ticket' }).click()

  await page.goto('http://localhost:3000/trains')
  const afterText = await seatCell.innerText()

  expect(beforeText).not.toEqual(afterText)
})
