import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [loading, setLoading] = useState(false)

  const generateDiscountCode = () => {
    return 'GARDINARY' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if email already exists
      const q = query(collection(db, 'subscribers'), where('email', '==', email))
      const existingDocs = await getDocs(q)

      if (existingDocs.empty) {
        // New subscriber
        const code = generateDiscountCode()
        await addDoc(collection(db, 'subscribers'), {
          email,
          discountCode: code,
          createdAt: new Date()
        })
        setDiscountCode(code)
      } else {
        // Already subscribed
        setDiscountCode(existingDocs.docs[0].data().discountCode)
      }

      setSubmitted(true)
      setTimeout(() => {
        setEmail('')
        setSubmitted(false)
        setDiscountCode('')
      }, 5000)
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Error subscribing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="section-y bg-forest-50">
        <div className="container-px max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-4">
              Stay in the Loop
            </h2>
            <p className="text-ink-700 mb-8">
              Get notified about new drops, exclusive releases, and special offers.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 font-semibold uppercase tracking-wide rounded transition-all duration-300 ${
                  submitted
                    ? 'bg-forest-600 text-white'
                    : 'bg-forest-600 text-white hover:bg-forest-700'
                }`}
              >
                {loading ? 'Loading...' : submitted ? '✓ Subscribed' : 'Subscribe'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Discount Code Popup */}
      <AnimatePresence>
        {submitted && discountCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full text-center"
            >
              <h3 className="font-display text-3xl text-forest-600 mb-2">10% Off!</h3>
              <p className="text-ink-700 mb-6">Welcome to Gardinary! Use this code at checkout:</p>

              <div className="bg-stone-50 p-6 rounded border-2 border-forest-600 mb-6">
                <p className="text-xs text-ink-600 mb-2">Your Discount Code</p>
                <p className="font-display text-2xl tracking-widest text-ink-900 mb-4">
                  {discountCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(discountCode)
                    alert('Code copied!')
                  }}
                  className="w-full px-4 py-2 bg-forest-600 text-white rounded font-semibold hover:bg-forest-500 text-sm"
                >
                  Copy Code
                </button>
              </div>

              <p className="text-xs text-ink-500">Valid for one purchase only</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
