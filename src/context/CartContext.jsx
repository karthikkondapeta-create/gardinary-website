import { createContext, useState } from 'react'

export const CartContext = createContext()

export default function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.name === product.name)
      if (existing) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      }
      return [...prev, product]
    })
  }

  const updateQuantity = (productName, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.name !== productName))
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.name === productName ? { ...item, quantity } : item
        )
      )
    }
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}
