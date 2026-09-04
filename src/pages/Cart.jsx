import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CartContext } from '../context/CartContext.jsx'

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
  const [submitted, setSubmitted] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 15
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
  }

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value })
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

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
                      {item.images && item.images[0] ? (
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
                  <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-ink-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
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
                  </div>
                </div>

                {/* Payment Form */}
                <div>
                  <h3 className="font-display text-lg mb-3 text-ink-900">Payment Info</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="cardName"
                      placeholder="Cardholder Name"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card Number"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={paymentInfo.expiry}
                        onChange={handlePaymentChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded text-ink-900 placeholder:text-ink-400"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Complete Purchase
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
