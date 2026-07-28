import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function FeaturedCollection({ title, products, viewAllLink, comingSoon, onProductClick }) {
  return (
    <section className="section-y">
      <div className="container-px">
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-ink-900 mb-2">{title}</h2>
          <div className="w-16 h-1 bg-forest-600"></div>
        </div>

        {comingSoon ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="font-display text-5xl md:text-6xl text-forest-600 mb-4">Germinating</p>
              <p className="text-ink-600 text-lg max-w-md mx-auto">
                New seeds are sprouting. Check back soon for fresh growth.
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {products.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => onProductClick && onProductClick(product)}
                >
                  <div className="relative aspect-square bg-stone-50 rounded mb-4 overflow-hidden flex items-center justify-center group-hover:border-forest-600 transition-colors duration-300 border border-gray-300">
                    <img
                      src={product.image || product.imageFront}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-ink-900 mb-2 group-hover:text-forest-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-forest-600 font-semibold">${product.price}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to={viewAllLink} className="btn-outline">
                View All
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
