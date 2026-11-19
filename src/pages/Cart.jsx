import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CartContext } from '../context/CartContext.jsx'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

export default function Cart() {
  const { cart, updateQuantity } = useContext(CartContext)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [phone, setPhone] = useState("")

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const tax = (subtotal - discountAmount) * 0.1
  const total = subtotal + shipping + tax - discountAmount

  // Auto-apply discount when cart has items
  useEffect(() => {
    const applyAutoDiscount = async () => {
      if (cart.length === 0 || discountApplied) return

      try {
        const email = localStorage.getItem('gardinaryEmail')
        const signupTime = localStorage.getItem('gardinarySignupTime')
        
        if (!email || !signupTime) return

        // Only apply discount if they signed up (signupTime exists in localStorage)
        // Query for the discount code associated with this email
        const q = query(
          collection(db, 'discountCodes'),
          where('email', '==', email),
          where('verified', '==', true)
        )
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const codeData = snapshot.docs[0].data()
          const calculatedDiscount = subtotal * (codeData.discount / 100)
          setDiscountAmount(calculatedDiscount)
          setDiscountApplied(true)
        }
      } catch (error) {
        console.error('Error applying auto-discount:', error)
      }
    }

    applyAutoDiscount()
  }, [cart, discountApplied])

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value })
  }

  const handleCheckout = (e) => handlePlaceOrder(e)

  if (submitted) {
    return (
      <section className="section-y">
        <div className="container-px max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-forest-300 bg-forest-50 p-12 rounded-lg"
          >
            <p className="text-forest-600 text-5xl mb-4">✓</p>
            <h2 className="font-display text-4xl mb-4 text-ink-900">Order Confirmed</h2>
            <p className="text-ink-700 mb-8">
              Thank you for your order! We'll send tracking info to your email soon.
            </p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </section>
    )
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zip || !shippingInfo.country || !phone) {
      alert('Please fill in all shipping fields')
      return
    }

    setPlacingOrder(true)

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        email: shippingInfo.email,
        shippingInfo: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          address: shippingInfo.address,
          city: shippingInfo.city,
          zip: shippingInfo.zip,
          country: shippingInfo.country,
          phone: phone
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          frontImage: item.frontImage
        })),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        discount: discountAmount,
        total: total,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      setOrderPlaced(true)
      localStorage.setItem('lastOrderId', orderRef.id)
      localStorage.setItem('lastOrderEmail', shippingInfo.email)
    } catch (error) {
      console.error('Full error:', error)
      console.error('Error message:', error.message)
      alert('Error placing order: ' + error.message)
      setPlacingOrder(false)
    }
  }

  return (
    <section className="section-y">
      <div className="container-px">
        <h1 className="font-display text-5xl md:text-6xl mb-12 text-ink-900">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="md:col-span-2">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-ink-600 mb-6">Your cart is empty</p>
                <Link to="/shop" className="btn-primary">
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 p-6 border border-gray-200 rounded-lg"
                  >
                    <div className="w-24 h-32 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.frontImage ? (
                        <img 
                          src={item.frontImage} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : item.images && item.images[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs text-center">GARDINARY</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink-900 mb-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600 mb-2">Size: <span className="font-semibold">{item.selectedSize}</span></p>
                      )}
                      <p className="text-forest-600 font-semibold mb-4">${item.price}</p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-gray-300 rounded w-fit">
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity - 1)}
                            className="px-3 py-1 text-ink-900 hover:bg-gray-100"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-ink-900 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.name, item.quantity + 1)}
                            className="px-3 py-1 text-ink-900 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.name, 0)}
                          className="text-red-600 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-ink-900 font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          {cart.length > 0 && (
            <div className="md:col-span-1">
              {/* Order Summary */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="font-display text-xl mb-4 text-ink-900">Order Summary</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between text-ink-700">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-ink-700">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-ink-700">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Discount (10%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-ink-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {discountApplied && (
                  <div className="border-t pt-4">
                    {discountApplied ? (
                      <p className="text-green-600 text-sm font-semibold">✓ 10% discount applied from email signup</p>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-700 font-semibold">💌 Sign up with your email to get 10% off!</p>
                        <p className="text-xs text-blue-600 mt-1">Look for the popup at the bottom of the page</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping Form */}
              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <h3 className="font-display text-lg mb-3 text-ink-900">Shipping Address</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={shippingInfo.name}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                      />
                      <input
                        type="text"
                        name="zip"
                        placeholder="ZIP Code"
                        value={shippingInfo.zip}
                        onChange={handleShippingChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                      />
                    </div>
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Payment Processing:</strong> Stripe payment integration coming soon. For now, we'll create your order and you can arrange payment separately.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={placingOrder}
                  className="w-full px-6 py-4 bg-forest-600 text-white font-bold uppercase tracking-wide rounded hover:bg-forest-700 disabled:opacity-50 transition"
                >
                  {placingOrder ? 'Creating Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
