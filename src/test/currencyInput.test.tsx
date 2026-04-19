import { describe, it, expect, vi } from 'vitest'
import { CurrencyInput } from '@/components/ui/currency-input'
import { render, screen, fireEvent } from '@testing-library/react'

// ── Helper to re-render with new value ────────────────────────────────────
function setup(value: number, onChange = () => {}) {
  const { rerender } = render(
    <CurrencyInput value={value} onChange={onChange} data-testid="currency-input" />
  )
  const input = screen.getByTestId('currency-input') as HTMLInputElement
  return { input, rerender }
}

describe('Currency Formatting (CurrencyInput)', () => {
  it('displays empty string when value is 0', () => {
    const { input } = setup(0)
    expect(input.value).toBe('')
  })

  it('formats 1000 as "1.000" with Indonesian separators', () => {
    const { input } = setup(1000)
    expect(input.value).toBe('1.000')
  })

  it('formats 1234567 as "1.234.567"', () => {
    const { input } = setup(1234567)
    expect(input.value).toBe('1.234.567')
  })

  it('displays "Rp" prefix label', () => {
    setup(0)
    expect(screen.getByText('Rp')).toBeInTheDocument()
  })

  it('calls onChange with raw number when user types', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value={0} onChange={onChange} data-testid="ci" />)
    const input = screen.getByTestId('ci') as HTMLInputElement
    fireEvent.change(input, { target: { value: '25000' } })
    expect(onChange).toHaveBeenCalledWith(25000)
  })

  it('strips non-numeric characters and calls onChange with 0 for empty input', () => {
    const onChange = vi.fn()
    render(<CurrencyInput value={100} onChange={onChange} data-testid="ci2" />)
    const input = screen.getByTestId('ci2') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('formats value with thousand separators on blur', () => {
    const { input } = setup(25000)
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(input.value).toBe('25.000')
  })
})
