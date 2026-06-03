import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(val: unknown, maximumFractionDigits: number = 0): string {
  // Handle null, undefined, NaN, or invalid values
  if (val === null || val === undefined) return "Rp 0"
  
  // Convert string to number if needed
  const num = typeof val === "string" ? parseFloat(val) : Number(val)
  
  // Check if result is NaN
  if (Number.isNaN(num)) return "Rp 0"
  
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: maximumFractionDigits
    }).format(num)
  } catch {
    return "Rp 0"
  }
}
