import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

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
    }, 15000)

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
      // Check if email already has a discount code
      const q = query(collection(db, 'discountCodes'), where('email', '==', formData.email))
      const existing = await getDocs(q)
      
      if (!existing.empty && existing.docs[0].data().verified) {
        setMessage('This email already has a discount code. Check your email for the code.')
        setLoading(false)
        return
      }

      // Create discount record
      await addDoc(collection(db, 'discountCodes'), {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        code: 'DISCOUNT',
        discount: 10,
        verified: false,
        verificationToken: Math.random().toString(36).substring(7),
        createdAt: serverTimestamp()
      })

      setMessage('Check your email for the verification link to activate your 10% discount code: DISCOUNT')
      setFormData({ email: '', firstName: '', lastName: '' })
      
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-8 max-w-md w-full mx-4 z-50 shadow-2xl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-2 text-ink-900">Welcome to Gardinary!</h2>
            <p className="text-ink-600 mb-6">Get 10% off your first order</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-900"
              />

              {message && (
                <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink-900 text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Signing up...' : 'Get My Discount Code'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              We'll send you a verification email with your discount code
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
