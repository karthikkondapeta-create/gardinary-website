import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // This is a static portfolio site — replace with a real form handler
    // (e.g. Formspree, Netlify Forms, or a backend endpoint) before launch.
    setSubmitted(true)
  }

  return (
    <section className="section-y">
      <div className="container-px max-w-xl mx-auto">
        <p className="eyebrow mb-3 text-center">Get In Touch</p>
        <h1 className="font-display text-5xl md:text-6xl mb-10 text-center text-ink-900">Contact Us</h1>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center border border-forest-300 bg-forest-50 p-10"
          >
            <p className="text-forest-600 text-lg font-semibold mb-2">Message sent.</p>
            <p className="text-ink-600 text-sm">
              Thanks for reaching out — we'll get back to you soon.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-widest text-ink-600 mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 focus:border-forest-500 outline-none px-4 py-3 text-ink-900 placeholder:text-ink-400"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest text-ink-600 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 focus:border-forest-500 outline-none px-4 py-3 text-ink-900 placeholder:text-ink-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs uppercase tracking-widest text-ink-600 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 focus:border-forest-500 outline-none px-4 py-3 text-ink-900 placeholder:text-ink-400 resize-none"
                placeholder="What's on your mind?"
              />
            </div>

            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        )}
      </div>
    </section>
  )
}
