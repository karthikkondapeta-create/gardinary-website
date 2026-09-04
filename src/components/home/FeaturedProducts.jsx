import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [imageErrors, setImageErrors] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('FeaturedProducts: Component mounted')
    
    const fetchBestsellers = async () => {
      try {
        console.log('FeaturedProducts: Fetching bestsellers from Firestore...')
        const q = query(collection(db, 'products'), where('bestseller', '==', true))
        const snap = await getDocs(q)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('FeaturedProducts: Bestsellers loaded:', data.length, data)
        setProducts(data.slice(0, 4))
        setError(null)
      } catch (e) {
        console.error('FeaturedProducts: Error fetching bestsellers:', e)
        setError(e.message)
      } finally {
        setLoaded(true)
      }
    }

    const timer = setTimeout(fetchBestsellers, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleImageError = (productId) => {
    console.error(`FeaturedProducts: Image failed to load for product: ${productId}`)
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  if (!loaded) {
    console.log('FeaturedProducts: Still loading...')
    return null
  }

  if (error) {
    console.error('FeaturedProducts: Error state:', error)
    return null
  }

  if (products.length === 0) {
    console.log('FeaturedProducts: No bestseller products found')
    return null
  }

  console.log('FeaturedProducts: Rendering', products.length, 'products')

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
                    onLoad={() => console.log(`FeaturedProducts: Image loaded for ${p.name}`)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-bone/20 text-sm">
                    {imageErrors[p.id] ? 'IMAGE ERROR' : 'NO IMAGE'}
                  </div>
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
