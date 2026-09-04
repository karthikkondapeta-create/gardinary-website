import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ProductShowcase() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log('📸 ProductShowcase: Fetching showcase images...')
        const snap = await getDocs(collection(db, 'showcase'))
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('📸 ProductShowcase: Got', data.length, 'showcase images')
        setImages(data)
      } catch (error) {
        console.error('❌ ProductShowcase Error:', error.message)
      } finally {
        setLoading(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (loading || images.length === 0) return null

  return (
    <section className="section-y bg-white">
      <div className="container-px">
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-3">Our Collection</h2>
          <div className="w-16 h-1 bg-forest-600"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {images.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt="Showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
