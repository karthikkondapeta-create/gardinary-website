import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-botanical-fade">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(38,97,45,0.25),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(38,97,45,0.18),transparent_50%)]" />

      <div className="container-px relative z-10 grid md:grid-cols-2 gap-12 items-center w-full">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="eyebrow mb-5"
          >
            Grown, not manufactured
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-wide mb-6 text-ink-900"
          >
            WEAR YOUR
            <br />
            <span className="text-forest-400">WILD</span> ROOTS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-ink-700 max-w-md mb-8 text-base md:text-lg"
          >
            Gardinary is streetwear for people who grow in their own direction.
            Dark botanical design, forest-green accents, built for individuality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/shop" className="btn-primary">Shop the Drop</Link>
            <Link to="/about" className="btn-outline">Our Story</Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative aspect-[4/5] w-full max-w-md mx-auto"
        >
          <div className="absolute inset-0 border border-forest-700 rounded-sm" />
          <div className="absolute inset-4 bg-ink-800 rounded-sm flex items-center justify-center">
            <img
              src="/src/assets/gardinary-mark.svg"
              alt="Gardinary emblem"
              className="w-32 h-32 opacity-90"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-600 text-xs tracking-[0.3em] uppercase"
      >
        Scroll
      </motion.div>
    </section>
  )
}
