import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import HomeBanner from '../components/home/HomeBanner.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'
import Marquee from '../components/home/Marquee.jsx'
import Newsletter from '../components/Newsletter.jsx'
import ProductModal from '../components/ProductModal.jsx'

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <>
      <HomeBanner />
      <FeaturedProducts onProductClick={setSelectedProduct} />
      <Marquee />
      <Newsletter />

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
