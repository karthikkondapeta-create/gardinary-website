import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function ProductShowcase() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log('📸 ProductShowcase: Fetching showcase items...')
        const snap = await getDocs(collection(db, 'showcase'))
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        // Sort by creation date to maintain order
        data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        console.log('📸 ProductShowcase: Got', data.length, 'showcase items')
        setItems(data)
      } catch (error) {
        console.error('❌ ProductShowcase Error:', error.message)
      } finally {
        setLoading(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (loading || items.length === 0) return null

  return (
    <section className="section-y bg-white">
      <div className="container-px">
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-3">Our Collection</h2>
          <div className="w-16 h-1 bg-forest-600"></div>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-16 h-96">
          {/* Left Column - 2 items */}
          <div className="col-span-3 grid grid-rows-2 gap-4">
            {items[0] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="group overflow-hidden rounded bg-gray-100"
              >
                {items[0].type === 'video' ? (
                  <video
                    src={items[0].videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[0].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
            {items[1] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="group overflow-hidden rounded bg-gray-100"
              >
                {items[1].type === 'video' ? (
                  <video
                    src={items[1].videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[1].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* Center - Large Video/Image */}
          <div className="col-span-6">
            {items[2] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="group overflow-hidden rounded bg-gray-100 h-full"
              >
                {items[2].type === 'video' ? (
                  <video
                    src={items[2].videoUrl}
                    controls
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[2].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column - 3 items */}
          <div className="col-span-3 grid grid-rows-3 gap-4">
            {items[3] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group overflow-hidden rounded bg-gray-100"
              >
                {items[3].type === 'video' ? (
                  <video
                    src={items[3].videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[3].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
            {items[4] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="group overflow-hidden rounded bg-gray-100"
              >
                {items[4].type === 'video' ? (
                  <video
                    src={items[4].videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[4].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
            {items[5] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="group overflow-hidden rounded bg-gray-100"
              >
                {items[5].type === 'video' ? (
                  <video
                    src={items[5].videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={items[5].imageUrl}
                    alt="Showcase"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
