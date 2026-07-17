import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ink-900/90 backdrop-blur border-b border-forest-800' : 'bg-transparent'
      }`}
    >
      <nav className="container-px flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src="/src/assets/gardinary-mark.svg" alt="Gardinary mark" className="h-9 w-9" />
          <span className="font-display text-2xl tracking-widest text-bone">GARDINARY</span>
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-widest transition-colors duration-200 ${
                    isActive ? 'text-forest-300' : 'text-bone/80 hover:text-forest-300'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden flex flex-col gap-1.5 w-8"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-0.5 bg-bone transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`h-0.5 bg-bone transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`h-0.5 bg-bone transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-ink-900 border-t border-forest-800"
          >
            {links.map((link) => (
              <li key={link.to} className="container-px py-4 border-b border-ink-700">
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block text-sm uppercase tracking-widest ${
                      isActive ? 'text-forest-300' : 'text-bone/80'
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
