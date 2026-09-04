import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    setTimeout(async () => {
      try {
        const q = query(collection(db, 'products'), where('bestseller', '==', true))
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('Bestsellers loaded:', data.length, data)
        setProducts(data.slice(0, 4))
      } catch (e) {
        console.error('Bestsellers error:', e.message)
      }
      setLoaded(true)
    }, 500)
  }, [])

  const handleImageError = (productId) => {
    console.error(`Image failed to load for product: ${productId}`)
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  if (!loaded) return null

  if (products.length === 0) return null

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
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square bg-ink-900 border border-ink-700 mb-4 overflow-hidden flex items-center justify-center">
                {p.images && p.images[0] && !imageErrors[p.id] ? (
                  <img 
                    src={p.images[0]} 
                    alt={p.name} 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    onError={() => handleImageError(p.id)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-bone/20 text-sm">NO IMAGE</div>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
              <p className="text-forest-300 text-sm">${p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
