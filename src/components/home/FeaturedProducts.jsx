import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const products = [
  { name: 'Wildroot Hoodie', price: '$88', tag: 'Best Seller' },
  { name: 'Marigold Tee', price: '$42', tag: 'New' },
  { name: 'Overgrowth Cargo', price: '$96', tag: 'Limited' },
  { name: 'Bramble Jacket', price: '$140', tag: 'New' },
]

export default function FeaturedProducts() {
  return (
    <section className="section-y bg-ink-800">
      <div className="container-px">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-3">Featured</p>
            <h2 className="font-display text-4xl md:text-5xl">The Current Drop</h2>
          </div>
          <Link to="/shop" className="text-sm uppercase tracking-widest text-forest-300 hover:text-forest-200">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] bg-ink-900 border border-ink-700 group-hover:border-forest-600 transition-colors duration-300 mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-bone/20 font-display text-2xl tracking-widest">
                  GARDINARY
                </div>
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-forest-600 text-bone px-2 py-1">
                  {p.tag}
                </span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
              <p className="text-forest-300 text-sm">{p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
