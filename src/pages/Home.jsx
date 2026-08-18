import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import HomeBanner from '../components/home/HomeBanner.jsx'
import FeaturedCollection from '../components/home/FeaturedCollection.jsx'
import Marquee from '../components/home/Marquee.jsx'
import Newsletter from '../components/Newsletter.jsx'
import ProductModal from '../components/ProductModal.jsx'

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // Filter to only bestsellers
      const bestSellers = productsData.filter(p => p.bestseller === true)
      setProducts(bestSellers)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <HomeBanner />
        <div className="section-y text-center">
          <p className="text-ink-600">Loading products...</p>
        </div>
        <Marquee />
        <Newsletter />
      </>
    )
  }

  return (
    <>
      <HomeBanner />
      <FeaturedCollection
        title="Best Sellers"
        products={products}
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
