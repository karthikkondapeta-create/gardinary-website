import { motion } from 'framer-motion'
import JohnnyAndMOM from '../assets/JohnnyAndMOM.jpg'

export default function About() {
  return (
    <>
      <section className="section-y">
        <div className="container-px">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-4"
          >
            About Gardinary
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden md:block"
            >
              <img 
                src={JohnnyAndMOM} 
                alt="Johnny and Mom" 
                className="rounded-lg w-full h-auto object-cover shadow-lg border-4 border-black"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
