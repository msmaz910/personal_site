import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import StyleGuide from './StyleGuide.tsx'
import { tokens } from './styles/tokens.ts'

test('lists every token from tokens.css', () => {
  render(<StyleGuide />)

  expect(tokens.length).toBeGreaterThan(0)
  expect(screen.getAllByRole('listitem')).toHaveLength(tokens.length)
  for (const { name } of tokens) {
    expect(screen.getByText(name)).toBeInTheDocument()
  }
})
