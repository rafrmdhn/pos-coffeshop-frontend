import React from 'react'

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  currency?: string
  className?: string
}

/**
 * CurrencyInput — displays Rupiah-formatted value with thousand separators.
 * Strips formatting on change and returns a raw number to the parent.
 */
export function CurrencyInput({
  value,
  onChange,
  currency = 'IDR',
  className = '',
  placeholder = '0',
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  // Format number → "1.234.567"
  const format = (n: number) =>
    n === 0 ? '' : n.toLocaleString('id-ID')

  // Keep display in sync when external value changes
  React.useEffect(() => {
    setDisplayValue(format(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '') // strip non-digits
    const num = raw === '' ? 0 : parseInt(raw, 10)
    setDisplayValue(raw === '' ? '' : num.toLocaleString('id-ID'))
    onChange(num)
  }

  const handleFocus = () => {
    // Show raw digits on focus so user can easily edit
    if (value === 0) setDisplayValue('')
  }

  const handleBlur = () => {
    setDisplayValue(format(value))
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
        Rp
      </span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`pl-9 w-full h-10 px-3 py-2 rounded-xl bg-muted/20 border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${className}`}
      />
    </div>
  )
}
