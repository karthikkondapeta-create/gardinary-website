import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { CartContext } from '../context/CartContext.jsx'

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useContext(CartContext)

  const handleAddToCart = () => {
    addToCart({ ...product, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-8 max-w-md w-full"
      >
        <div className="aspect-[3/4] bg-gray-100 rounded mb-6 flex items-center justify-center">
          <span className="text-gray-300 font-display text-lg tracking-widest">GARDINARY</span>
        </div>

        <h2 className="font-display text-3xl mb-2 text-ink-900">{product.name}</h2>
        <p className="text-forest-600 text-lg font-semibold mb-4">${product.price}</p>
        <p className="text-ink-600 text-sm mb-6">{product.category}</p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 border border-gray-300 rounded w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-ink-900 hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-4 py-2 text-ink-900 font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 text-ink-900 hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full px-6 py-3 font-semibold uppercase tracking-wide transition-colors duration-300 ${
              added
                ? 'bg-forest-600 text-bone'
                : 'bg-forest-600 text-bone hover:bg-forest-500'
            }`}
          >
            {added ? '✓ Added to Cart' : 'Add to Cart'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 text-ink-600 hover:text-ink-900 text-sm uppercase tracking-wide"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
