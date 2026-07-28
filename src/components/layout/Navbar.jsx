import { useEffect, useState, useContext } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CartContext } from '../../context/CartContext.jsx'
import logo from '../../assets/IMG_0907.png'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { cart } = useContext(CartContext)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur border-b border-gray-200' : 'bg-transparent'
      }`}
    >
      <nav className="container-px flex items-center justify-between py-2">
        <Link to="/" onClick={() => setOpen(false)}>
          <img src={logo} alt="Gardinary logo" className="h-14 object-cover" />
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-widest transition-colors duration-200 ${
                    isActive ? 'text-forest-600' : 'text-ink-700 hover:text-forest-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 overflow-visible">
          <Link
            to="/cart"
            className="relative text-ink-900 hover:text-forest-600 transition-colors overflow-visible"
            aria-label="Shopping cart"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="-1 -1 26 28" preserveAspectRatio="xMidYMid meet">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0h2m-2 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-forest-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden flex flex-col gap-1.5 w-8"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-0.5 bg-ink-900 transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 bg-ink-900 transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`h-0.5 bg-ink-900 transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            {links.map((link) => (
              <li key={link.to} className="container-px py-4 border-b border-gray-200">
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block text-sm uppercase tracking-widest ${
                      isActive ? 'text-forest-600' : 'text-ink-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
