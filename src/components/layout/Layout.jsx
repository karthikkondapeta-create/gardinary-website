import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import DiscountPopup from '../DiscountPopup.jsx'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DiscountPopup />
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  )
}
