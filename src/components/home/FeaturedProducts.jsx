import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log('📦 FeaturedProducts: Starting to fetch bestsellers...')
        const q = query(collection(db, 'products'), where('bestseller', '==', true))
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('📦 FeaturedProducts: Got', data.length, 'bestsellers:', data)
        setProducts(data.slice(0, 4))
      } catch (error) {
        console.error('❌ FeaturedProducts Error:', error.message)
      } finally {
        setLoading(false)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="section-y bg-ink-800">
      <div className="container-px">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="eyebrow mb-3">Featured</p>
            <h2 className="font-display text-4xl md:text-5xl">Best Sellers</h2>
          </div>
          <Link to="/shop" className="text-sm uppercase tracking-widest text-forest-300">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
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
              </div>
              <h3 className="text-sm font-semibold mb-1 text-bone group-hover:text-forest-300 transition-colors">
                {p.name}
              </h3>
              <p className="text-forest-300 text-sm">${p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
