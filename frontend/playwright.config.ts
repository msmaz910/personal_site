import { defineConfig, devices } from '@playwright/test'
import { APP_PORT, FAKE_MODEL, FAKE_PORT, FAKE_URL } from './e2e/constants.ts'

const gracefulShutdown = { signal: 'SIGTERM', timeout: 5000 } as const

const container = [
  'docker run --rm',
  `-p ${APP_PORT}:8000`,
  '--add-host=host.docker.internal:host-gateway',
  '-e OPENROUTER_API_KEY=e2e-dummy-key',
  `-e OPENROUTER_MODEL=${FAKE_MODEL}`,
  `-e OPENROUTER_BASE_URL=http://host.docker.internal:${FAKE_PORT}/v1`,
  'personal-website-e2e',
].join(' ')

/** Runs the tests against the built container, with a fake model server in place of OpenRouter. */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${APP_PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      name: 'fake model',
      command: 'node e2e/fake-openrouter.ts',
      url: `${FAKE_URL}/requests`,
      reuseExistingServer: !process.env.CI,
      gracefulShutdown,
    },
    {
      name: 'container',
      command: container,
      url: `http://localhost:${APP_PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      gracefulShutdown,
    },
  ],
})
