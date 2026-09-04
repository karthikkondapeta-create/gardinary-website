import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        console.log('🔍 Fetching bestsellers from Firestore...')
        const q = query(collection(db, 'products'), where('bestseller', '==', true))
        const querySnapshot = await getDocs(q)
        console.log(`✅ Found ${querySnapshot.docs.length} bestsellers`)
        
        const bestsellers = querySnapshot.docs.map(doc => {
          console.log('Product:', doc.data())
          return {
            id: doc.id,
            ...doc.data()
          }
        }).slice(0, 4)
        
        setProducts(bestsellers)
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching bestsellers:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBestSellers()
  }, [])

  if (loading) {
    return (
      <section className="section-y bg-ink-800">
        <div className="container-px">
          <p className="text-bone/50">Loading bestsellers...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section-y bg-ink-800">
        <div className="container-px">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-y bg-ink-800">
      <div className="container-px">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3">Featured</p>
            <h2 className="font-display text-4xl md:text-5xl">Best Sellers</h2>
          </div>
          <Link to="/shop" className="text-sm uppercase tracking-widest text-forest-300 hover:text-forest-200">
            View All &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-bone/50">No bestsellers yet. Mark products as bestsellers in the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-ink-900 border border-ink-700 group-hover:border-forest-600 transition-colors duration-300 mb-4 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => console.error(`Image failed to load: ${product.images[0]}`)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-bone/20 font-display text-2xl tracking-widest">
                      GARDINARY
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-forest-600 text-bone px-2 py-1">
                    Best Seller
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                <p className="text-forest-300 text-sm">${product.price}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
