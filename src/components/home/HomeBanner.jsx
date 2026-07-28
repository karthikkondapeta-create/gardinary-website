import bannerImage from '../../assets/banner.png'

export default function HomeBanner() {
  return (
    <section className="relative w-full aspect-video overflow-hidden">
      <img
        src={bannerImage}
        alt="Gardinary Banner"
        className="w-full h-full object-cover"
      />
    </section>
  )
}
