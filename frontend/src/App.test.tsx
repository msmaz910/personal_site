import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App.tsx'

afterEach(() => {
  vi.unstubAllEnvs()
})

test('shows the site name and placeholder text', () => {
  vi.stubEnv('VITE_SITE_NAME', 'Test Site')

  render(<App />)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Site')
  expect(screen.getByText('Coming soon.')).toBeInTheDocument()
})
