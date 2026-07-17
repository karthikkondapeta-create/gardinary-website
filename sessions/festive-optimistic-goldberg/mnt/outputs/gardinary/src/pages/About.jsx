import { motion } from 'framer-motion'
import Values from '../components/home/Values.jsx'

export default function About() {
  return (
    <>
      <section className="section-y">
        <div className="container-px max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-4"
          >
            About Gardinary
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl mb-8 leading-tight"
          >
            Ordinary is a starting point. We build from there.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 text-bone/70 leading-relaxed text-lg"
          >
            <p>
              Gardinary was founded on a simple idea: the most interesting people aren't
              trying to be anything other than themselves. Streetwear, at its best, is a
              record of that growth — worn, lived-in, and personal.
            </p>
            <p>
              Our design language borrows from the botanical world. Dark, moody backgrounds.
              Forest green accents. Shapes that reference roots, vines, and wild growth
              patterns. It's premium streetwear that feels grown, not manufactured.
            </p>
            <p>
              This site itself is part of that story — designed and built from scratch as a
              portfolio project, using React, Vite, Tailwind CSS, and Framer Motion.
            </p>
          </motion.div>
        </div>
      </section>
      <Values />
    </>
  )
}
