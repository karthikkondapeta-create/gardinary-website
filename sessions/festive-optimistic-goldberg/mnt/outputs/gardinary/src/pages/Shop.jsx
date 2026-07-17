import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

const allProducts = [
  { name: 'Wildroot Hoodie', price: 88, category: 'Hoodies', tag: 'Best Seller' },
  { name: 'Marigold Tee', price: 42, category: 'Tees', tag: 'New' },
  { name: 'Overgrowth Cargo', price: 96, category: 'Pants', tag: 'Limited' },
  { name: 'Bramble Jacket', price: 140, category: 'Outerwear', tag: 'New' },
  { name: 'Thornline Tee', price: 44, category: 'Tees', tag: '' },
  { name: 'Mossback Hoodie', price: 92, category: 'Hoodies', tag: '' },
  { name: 'Undergrowth Shorts', price: 58, category: 'Pants', tag: '' },
  { name: 'Canopy Coach Jacket', price: 128, category: 'Outerwear', tag: 'New' },
]

const categories = ['All', 'Tees', 'Hoodies', 'Pants', 'Outerwear']

export default function Shop() {
  const [active, setActive] = useState('All')

  const filtered = useMemo(
    () => (active === 'All' ? allProducts : allProducts.filter((p) => p.category === active)),
    [active]
  )

  return (
    <section className="section-y">
      <div className="container-px">
        <p className="eyebrow mb-3">Shop</p>
        <h1 className="font-display text-5xl md:text-6xl mb-10">The Full Collection</h1>

        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2 text-xs uppercase tracking-widest border transition-colors duration-200 ${
                active === cat
                  ? 'bg-forest-600 border-forest-600 text-bone'
                  : 'border-bone/20 text-bone/60 hover:border-forest-500 hover:text-forest-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] bg-ink-800 border border-ink-700 group-hover:border-forest-600 transition-colors duration-300 mb-4 overflow-hidden flex items-center justify-center">
                <span className="text-bone/20 font-display text-xl tracking-widest">GARDINARY</span>
                {p.tag && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-forest-600 text-bone px-2 py-1">
                    {p.tag}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
              <p className="text-forest-300 text-sm">${p.price}</p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-bone/50 text-center py-20">No products in this category yet.</p>
        )}
      </div>
    </section>
  )
}
