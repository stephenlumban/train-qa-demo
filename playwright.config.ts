import { defineConfig } from '@playwright/test'

export default defineConfig({
  webServer: {
    command: 'cd frontend && npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  testDir: './tests',
})
