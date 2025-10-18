import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';

// Resolve o caminho absoluto para a pasta dist
const distPath = path.resolve(__dirname, '../dist');

const config: PlaywrightTestConfig = {
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            `--disable-extensions-except=${distPath}`,
            `--load-extension=${distPath}`
          ],
          headless: false
        }
      },
    },
  ],
};

export default config;