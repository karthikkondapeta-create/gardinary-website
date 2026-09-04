import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ProductShowcase() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log('📸 ProductShowcase: Fetching showcase products...')
        const q = query(collection(db, 'products'), where('showcase', '==', true))
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('📸 ProductShowcase: Got', data.length, 'showcase products')
        setProducts(data)
      } catch (error) {
        console.error('❌ ProductShowcase Error:', error.message)
      } finally {
        setLoading(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="section-y bg-white">
      <div className="container-px">
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-3">Our Collection</h2>
          <div className="w-16 h-1 bg-forest-600"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-50 text-gray-400">
                    <span className="font-display text-sm">GARDINARY</span>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <h3 className="font-semibold text-ink-900 text-sm mb-1">{p.name}</h3>
                <p className="text-forest-600 font-semibold text-sm">${p.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
