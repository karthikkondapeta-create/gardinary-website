import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setEmail('')
      setSubmitted(false)
    }, 2000)
  }

  return (
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
              className={`px-8 py-3 font-semibold uppercase tracking-wide rounded transition-all duration-300 ${
                submitted
                  ? 'bg-forest-600 text-white'
                  : 'bg-forest-600 text-white hover:bg-forest-700'
              }`}
            >
              {submitted ? '✓ Subscribed' : 'Subscribe'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
