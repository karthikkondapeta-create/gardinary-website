import { motion } from 'framer-motion'

export default function BrandStory() {
  return (
    <section className="section-y bg-ink-900">
      <div className="container-px grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="aspect-square bg-ink-800 border border-forest-800 rounded-sm flex items-center justify-center"
        >
          <span className="font-display text-forest-500 text-3xl tracking-widest">GROW WILD</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow mb-4">Our Story</p>
          <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Rooted in rebellion, built for the ordinary made extraordinary.
          </h2>
          <p className="text-bone/70 leading-relaxed mb-4">
            Gardinary began as a rejection of the ordinary — a belief that individuality
            is a form of growth, and that the most interesting things happen when you
            stop trying to fit the pattern.
          </p>
          <p className="text-bone/70 leading-relaxed">
            Every piece pulls from the botanical world: the way roots push through concrete,
            the way wildflowers grow where they're not supposed to. Dark, textured,
            and unmistakably ours.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
