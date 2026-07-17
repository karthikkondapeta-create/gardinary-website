import Hero from '../components/home/Hero.jsx'
import Marquee from '../components/home/Marquee.jsx'
import BrandStory from '../components/home/BrandStory.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'
import Manifesto from '../components/home/Manifesto.jsx'
import Values from '../components/home/Values.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <BrandStory />
      <FeaturedProducts />
      <Manifesto />
      <Values />
    </>
  )
}
