import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductModal from '../components/ProductModal.jsx'
import Newsletter from '../components/Newsletter.jsx'
import whiteThermal from '../assets/white-thermal.png'
import flowerEyeFront from '../assets/flower-eye-front.png'
import flowerEyeBack from '../assets/flower-eye-back.png'
import loveTee from '../assets/love-tee.png'
import flowerTee from '../assets/flower-tee.png'

const allProducts = [
  {
    name: 'White Thermal',
    price: 30,
    category: 'Thermals',
    tag: 'New',
    image: whiteThermal
  },
  {
    name: 'Flower Eye',
    price: 25,
    category: 'Tees',
    tag: 'Best Seller',
    imageFront: flowerEyeFront,
    imageBack: flowerEyeBack
  },
  {
    name: 'Love Tee',
    price: 25,
    category: 'Tees',
    tag: 'New',
    image: loveTee
  },
  {
    name: 'Flower Tee',
    price: 10,
    category: 'Tees',
    tag: '',
    image: flowerTee
  },
]

const categories = ['All', 'Tees', 'Thermals']

export default function Shop() {
  const [active, setActive] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filtered = useMemo(
    () => (active === 'All' ? allProducts : allProducts.filter((p) => p.category === active)),
    [active]
  )

  return (
    <section className="section-y">
      <div className="container-px">
        <div className="mb-12">
          <h1 className="font-display text-5xl md:text-6xl text-ink-900 mb-3">The Full Collection</h1>
          <div className="w-16 h-1 bg-forest-600"></div>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-widest border transition-colors duration-200 ${
                active === cat
                  ? 'bg-forest-600 border-forest-600 text-bone'
                  : 'border-ink-300 text-ink-700 hover:border-forest-500 hover:text-forest-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setSelectedProduct(p)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square bg-stone-50 border border-gray-300 group-hover:border-forest-600 transition-colors duration-300 mb-4 overflow-hidden flex items-center justify-center">
                <img
                  src={p.image || p.imageFront}
                  alt={p.name}
                  className="w-full h-full object-contain"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-forest-600 text-bone px-2 py-1">
                    {p.tag}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1 text-ink-900">{p.name}</h3>
              <p className="text-forest-600 text-sm">${p.price}</p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-ink-600 text-center py-20">No products in this category yet.</p>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>

      <Newsletter />
    </section>
  )
}
