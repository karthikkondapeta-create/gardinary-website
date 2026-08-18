import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import ProductModal from '../components/ProductModal.jsx'
import Newsletter from '../components/Newsletter.jsx'

export default function Shop() {
  const [active, setActive] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setProducts(productsData)

      // Extract unique categories from products
      const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => (active === 'All' ? products : products.filter((p) => p.category === active)),
    [active, products]
  )

  if (loading) {
    return (
      <section className="section-y">
        <div className="container-px text-center">
          <p className="text-ink-600">Loading products...</p>
        </div>
      </section>
    )
  }

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
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => setSelectedProduct(p)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square bg-stone-50 border border-gray-300 group-hover:border-forest-600 transition-colors duration-300 mb-4 overflow-hidden flex items-center justify-center rounded">
                {p.images && p.images.length > 0 ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-300 font-display text-xl tracking-widest">GARDINARY</span>
                )}
                {p.stock <= 0 && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-red-600 text-white px-2 py-1">
                    Out of Stock
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1 text-ink-900 group-hover:text-forest-600 transition-colors">
                {p.name}
              </h3>
              <p className="text-forest-600 text-sm">${p.price}</p>
              <p className="text-xs text-ink-500 mt-1">Stock: {p.stock || 0}</p>
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
