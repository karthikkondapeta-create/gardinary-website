import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  )
}
