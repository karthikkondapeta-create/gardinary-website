import { motion } from 'framer-motion'

const values = [
  {
    title: 'Growth',
    body: 'We evolve with every drop, never staying static or safe.',
  },
  {
    title: 'Individuality',
    body: 'No two pieces are worn the same way twice. That is the point.',
  },
  {
    title: 'Rebellion',
    body: 'We push against convention, quietly and on purpose.',
  },
  {
    title: 'Nature',
    body: 'Textures, tones, and shapes pulled straight from the wild.',
  },
]

export default function Values() {
  return (
    <section className="section-y bg-ink-800">
      <div className="container-px">
        <p className="eyebrow mb-3 text-center">What We Stand For</p>
        <h2 className="font-display text-4xl md:text-5xl text-center mb-14">Our Values</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-forest-700 pt-6"
            >
              <h3 className="font-display text-2xl tracking-wide text-forest-300 mb-3">
                {v.title}
              </h3>
              <p className="text-bone/60 text-sm leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
