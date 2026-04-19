import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/stores/cartStore'

// Reset the Zustand store before each test so tests are isolated
beforeEach(() => {
  useCartStore.setState({
    items: [],
    orderType: 'dine_in',
    activeCategory: 'all',
    subtotal: 0,
    tax: 0,
    grandTotal: 0,
  })
})

const ITEM_A = { id: 'prod-1', name: 'Aren Latte', price: 25000 }
const ITEM_B = { id: 'prod-2', name: 'V60 Gayo Beans', price: 28000 }

describe('Cart Store', () => {
  // ── addItem ────────────────────────────────────────────────────────────────
  describe('addItem', () => {
    it('adds a new item to an empty cart', () => {
      useCartStore.getState().addItem(ITEM_A)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('prod-1')
      expect(items[0].qty).toBe(1)
    })

    it('increments qty when same item is added again', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().addItem(ITEM_A)
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].qty).toBe(2)
    })

    it('keeps separate items when different products are added', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().addItem(ITEM_B)
      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  // ── removeItem ─────────────────────────────────────────────────────────────
  describe('removeItem', () => {
    it('removes an existing item from the cart', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().addItem(ITEM_B)
      useCartStore.getState().removeItem('prod-1')
      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].id).toBe('prod-2')
    })

    it('does nothing when removing an id that does not exist', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().removeItem('does-not-exist')
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  // ── updateQty ──────────────────────────────────────────────────────────────
  describe('updateQty', () => {
    it('updates the quantity of an existing item', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().updateQty('prod-1', 5)
      expect(useCartStore.getState().items[0].qty).toBe(5)
    })

    it('removes item when qty is set to 0', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().updateQty('prod-1', 0)
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when qty is set to negative', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().updateQty('prod-1', -1)
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  // ── clearCart ──────────────────────────────────────────────────────────────
  describe('clearCart', () => {
    it('empties the cart and resets totals', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().addItem(ITEM_B)
      useCartStore.getState().clearCart()
      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.subtotal).toBe(0)
      expect(state.tax).toBe(0)
      expect(state.grandTotal).toBe(0)
    })
  })

  // ── Total Calculation ──────────────────────────────────────────────────────
  describe('Total Calculation', () => {
    it('calculates subtotal correctly for single item', () => {
      useCartStore.getState().addItem(ITEM_A)
      expect(useCartStore.getState().subtotal).toBe(25000)
    })

    it('calculates subtotal correctly for multiple items', () => {
      useCartStore.getState().addItem(ITEM_A) // 25,000
      useCartStore.getState().addItem(ITEM_B) // 28,000
      expect(useCartStore.getState().subtotal).toBe(53000)
    })

    it('calculates 10% PB1 tax correctly', () => {
      useCartStore.getState().addItem(ITEM_A) // 25,000 → tax = 2,500
      expect(useCartStore.getState().tax).toBe(2500)
    })

    it('calculates grand total as subtotal + tax', () => {
      useCartStore.getState().addItem(ITEM_A) // 25,000 + 2,500 = 27,500
      expect(useCartStore.getState().grandTotal).toBe(27500)
    })

    it('recalculates totals when quantity is updated', () => {
      useCartStore.getState().addItem(ITEM_A)
      useCartStore.getState().updateQty('prod-1', 3) // 75,000 + 7,500 = 82,500
      expect(useCartStore.getState().subtotal).toBe(75000)
      expect(useCartStore.getState().grandTotal).toBe(82500)
    })
  })
})
