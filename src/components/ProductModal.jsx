import { useContext, useState } from 'react'
import { motion } from 'framer-motion'
import { CartContext } from '../context/CartContext.jsx'

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const { addToCart } = useContext(CartContext)

  const images = product.images || (product.image ? [product.image] : [])
  const currentImage = images[imageIndex] || ''

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
        className="bg-white rounded-lg p-8 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="w-full">
          <div className="relative bg-stone-50 rounded mb-4 overflow-hidden w-full max-h-[70vh] flex items-center justify-center">
            {images.length > 0 ? (
              <>
                <img
                  src={currentImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                      →
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-xs">
                      {imageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-300 font-display text-xl">No image</span>
            )}
          </div>

          {false && (
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setImageIndex(0)}
                className="text-2xl text-ink-900 hover:text-forest-600 transition-colors"
              >
                ←
              </button>
              <span className="text-ink-600 font-semibold text-sm">
                {showBack ? '2' : '1'}/2
              </span>
              <button
                onClick={() => setShowBack(true)}
                className="text-2xl text-ink-900 hover:text-forest-600 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>

        <h2 className="font-display text-3xl mb-2 text-ink-900">{product.name}</h2>
        <p className="text-forest-600 text-lg font-semibold mb-4">${product.price}</p>
        <p className="text-ink-600 text-sm mb-6">{product.category}</p>

        <div className="space-y-4">
          <div className="flex items-center gap-4 border border-gray-300 rounded w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 text-ink-900 hover:bg-stone-50"
            >
              −
            </button>
            <span className="px-4 py-2 text-ink-900 font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 text-ink-900 hover:bg-stone-50"
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
