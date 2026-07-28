import { Link } from 'react-router-dom'
import logo from '../../assets/IMG_0907.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink-800 border-t border-forest-800">
      <div className="container-px py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="relative inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <img src={logo} alt="Gardinary logo" className="h-10 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-forest-600 rounded-full opacity-70"></span>
              <span className="absolute top-1 right-0 w-1 h-1 bg-forest-500 rounded-full opacity-60"></span>
              <span className="absolute top-2 -left-1 w-1.5 h-1.5 bg-forest-600 rounded-full opacity-70"></span>
              <span className="absolute top-0 left-1 w-1 h-1 bg-forest-500 rounded-full opacity-50"></span>
              <span className="absolute -bottom-1 left-0 w-1 h-1 bg-forest-600 rounded-full opacity-70"></span>
              <span className="absolute bottom-1 -left-2 w-1.5 h-1.5 bg-forest-500 rounded-full opacity-60"></span>
              <span className="absolute -bottom-1 right-1 w-1 h-1 bg-forest-600 rounded-full opacity-60"></span>
              <span className="absolute bottom-2 -right-1 w-1.5 h-1.5 bg-forest-500 rounded-full opacity-70"></span>
              <span className="absolute top-1 -left-2 w-0.5 h-0.5 bg-forest-600 rounded-full opacity-50"></span>
              <span className="absolute bottom-0 right-0 w-0.5 h-0.5 bg-forest-500 rounded-full opacity-60"></span>
            </div>
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
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-forest-300">Instagram</a></li>
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
