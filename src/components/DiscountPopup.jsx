import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ email: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (hasShown) return
    
    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasShown(true)
    }, 10000)

    return () => clearTimeout(timer)
  }, [hasShown])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const q = query(collection(db, 'discountCodes'), where('email', '==', formData.email))
      const existing = await getDocs(q)
      
      if (!existing.empty) {
        setMessage('Welcome back! Your discount is ready.')
        localStorage.setItem('gardinaryEmail', formData.email)
        setFormData({ email: '', firstName: '', lastName: '' })
        
        setTimeout(() => {
          setIsOpen(false)
        }, 2000)
        return
      }

      await addDoc(collection(db, 'discountCodes'), {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        code: 'DISCOUNT',
        discount: 10,
        verified: true,
        createdAt: serverTimestamp()
      })

      localStorage.setItem('gardinaryEmail', formData.email)
      
      setMessage('Success! Your 10% discount is ready.')
      setFormData({ email: '', firstName: '', lastName: '' })
      
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error signing up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black bg-opacity-60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 bg-white rounded-xl p-10 w-full max-w-sm shadow-2xl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-3xl font-light"
            >
              ✕
            </button>

            <h2 className="text-4xl font-bold mb-3 text-ink-900">Welcome to Gardinary!</h2>
            <p className="text-lg text-ink-600 mb-8">Sign up for 10% off your order</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-ink-900 text-base"
              />
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-ink-900 text-base"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-ink-900 text-base"
              />

              {message && (
                <p className={`text-base text-center font-semibold ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink-900 text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Signing up...' : 'Get 10% Off'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
