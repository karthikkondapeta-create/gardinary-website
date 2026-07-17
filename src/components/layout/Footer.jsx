import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink-800 border-t border-forest-800">
      <div className="container-px py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/src/assets/gardinary-mark.svg" alt="Gardinary mark" className="h-8 w-8" />
            <span className="font-display text-xl tracking-widest">GARDINARY</span>
          </div>
          <p className="text-bone/60 text-sm max-w-xs">
            Premium streetwear grown from individuality, nature, and rebellion.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-bone/70">
            <li><Link to="/shop" className="hover:text-forest-300">Shop</Link></li>
            <li><Link to="/about" className="hover:text-forest-300">About</Link></li>
            <li><Link to="/contact" className="hover:text-forest-300">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Connect</h4>
          <ul className="space-y-2 text-sm text-bone/70">
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-forest-300">GitHub</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-forest-300">LinkedIn</a></li>
            <li><a href="mailto:hello@gardinary.co" className="hover:text-forest-300">hello@gardinary.co</a></li>
          </ul>
        </div>
      </div>

      <div className="container-px py-6 border-t border-ink-700 text-xs text-bone/40 flex flex-col md:flex-row justify-between gap-2">
        <span>&copy; {year} Gardinary. All rights reserved.</span>
      </div>
    </footer>
  )
}
