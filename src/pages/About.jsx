import { motion } from 'framer-motion'

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
            className="font-display text-5xl md:text-6xl mb-8 leading-tight text-ink-900"
          >
            Our Story
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-5 text-ink-700 leading-relaxed text-lg"
          >
            <p>
              Gardinary is more than just clothes. It's a community built around something 
              that has always been part of my life. I've always had a passion for fashion, 
              but I also grew up surrounded by nature. There were always flowers, plants, 
              vines, and floral pieces around the house, and almost every day I would see 
              my mom outside gardening.
            </p>
            <p>
              Her love for plants and the environment I grew up in became a big part of 
              the inspiration behind Gardinary. I wanted to bring those two worlds together 
              by combining streetwear with garden inspired elements. Gardinary is my way of 
              showing the beauty of nature through clothing while building a community around it.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
