import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import HomeBanner from '../components/home/HomeBanner.jsx'
import FeaturedCollection from '../components/home/FeaturedCollection.jsx'
import Marquee from '../components/home/Marquee.jsx'
import Newsletter from '../components/Newsletter.jsx'
import ProductModal from '../components/ProductModal.jsx'
import whiteThermal from '../assets/white-thermal.png'
import flowerEyeFront from '../assets/flower-eye-front.png'
import flowerEyeBack from '../assets/flower-eye-back.png'
import loveTee from '../assets/love-tee.png'
import flowerTee from '../assets/flower-tee.png'

const currentProducts = [
  {
    name: 'White Thermal',
    price: 30,
    category: 'Thermals',
    image: whiteThermal
  },
  {
    name: 'Flower Eye',
    price: 25,
    category: 'Tees',
    imageFront: flowerEyeFront,
    imageBack: flowerEyeBack
  },
  {
    name: 'Love Tee',
    price: 25,
    category: 'Tees',
    image: loveTee
  },
  {
    name: 'Flower Tee',
    price: 10,
    category: 'Tees',
    image: flowerTee
  },
]

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  return (
    <>
      <HomeBanner />
      <FeaturedCollection
        title="Best Sellers"
        products={currentProducts}
        viewAllLink="/shop"
        onProductClick={setSelectedProduct}
      />
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
