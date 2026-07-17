import { motion } from 'framer-motion'

export default function Manifesto() {
  return (
    <section className="section-y bg-ink-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-botanical-fade opacity-60" />
      <div className="container-px relative z-10 max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="eyebrow mb-6"
        >
          Manifesto
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-4xl md:text-6xl leading-tight"
        >
          We don't dress to blend in. We dress to take root, break through, and grow
          into something no one else can copy.
        </motion.h2>
      </div>
    </section>
  )
}
