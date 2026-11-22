import { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CartContext } from '../context/CartContext.jsx'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

const stripePromise = Promise.resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY))

function PaymentForm({ cart, shippingInfo, phone, discountAmount, subtotal, shipping, tax, total, onSuccess, onError, isLoading }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handlePayment = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // 1. Create Payment Intent via Vercel API
      const paymentResponse = await fetch('/api/createPaymentIntent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: shippingInfo.email,
          description: `Order for ${shippingInfo.name}`
        })
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret, paymentIntentId } = await paymentResponse.json()

      // 2. Create pending order via Vercel API
      const orderResponse = await fetch('/api/createPendingOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          paymentIntentId: paymentIntentId
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create pending order')
      }

      const orderResult = await orderResponse.json()
      console.log('Pending order created:', orderResult.pendingOrderId)

      // 3. Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.name,
            email: shippingInfo.email,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.zip,
              country: 'US'
            }
          }
        }
      })

      if (error) {
        setErrorMessage(error.message)
        console.error('Payment error:', error)
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!')
        localStorage.setItem('lastOrderId', orderResult.pendingOrderId)
        localStorage.setItem('lastOrderEmail', shippingInfo.email)
        onSuccess()
      }
    } catch (error) {
      setErrorMessage(error.message)
      console.error('Checkout error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="bg-stone-50 p-4 rounded border border-stone-200">
        <label className="block text-sm font-semibold text-ink-900 mb-3">Card Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': {
                  color: '#9ca3af',
                }
              },
              invalid: {
                color: '#dc2626'
              }
            }
          }}
          className="p-2"
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || isLoading || !stripe}
        className="w-full px-6 py-3 bg-forest-600 text-bone font-semibold uppercase tracking-wide hover:bg-forest-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  )
}

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
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [phone, setPhone] = useState("")
  const [showPaymentForm, setShowPaymentForm] = useState(false)

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

  const handleCheckout = (e) => {
    e.preventDefault()

    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address || !shippingInfo.city || !shippingInfo.zip || !shippingInfo.country || !phone) {
      alert('Please fill in all shipping fields')
      return
    }

    setShowPaymentForm(true)
  }

  if (orderPlaced) {
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
              Thank you for your order! We've sent a confirmation email to {shippingInfo.email}.
              <br />You'll receive tracking information as soon as we ship your order.
            </p>
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="section-y">
        <div className="container-px max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl mb-4 text-ink-900">Your Cart is Empty</h1>
          <p className="text-ink-600 mb-8">Start shopping to add items to your cart.</p>
          <Link to="/shop" className="btn-primary">
            Go to Shop
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section-y">
      <div className="container-px max-w-6xl mx-auto">
        <h1 className="font-display text-4xl mb-12 text-ink-900">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-stone-200 rounded-lg p-4 flex gap-4"
              >
                <img
                  src={item.frontImage || item.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-ink-900">{item.name}</h3>
                  {item.selectedSize && <p className="text-sm text-ink-600">Size: {item.selectedSize}</p>}
                  <p className="text-forest-600 font-semibold mt-2">${item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-2 py-1 border border-stone-300 rounded hover:bg-stone-50"
                    >
                      −
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border border-stone-300 rounded hover:bg-stone-50"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary & Checkout */}
          <div className="bg-stone-50 p-6 rounded-lg h-fit sticky top-20">
            <h2 className="font-display text-xl mb-4 text-ink-900">Order Summary</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
              <div className="flex justify-between text-ink-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-700">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-forest-600 font-semibold">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-display text-lg mb-6 text-ink-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {!showPaymentForm ? (
              <form onSubmit={handleCheckout} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={shippingInfo.name}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                  />
                  <input
                    type="text"
                    name="zip"
                    placeholder="ZIP"
                    value={shippingInfo.zip}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                />
                <select
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-forest-600"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="MX">Mexico</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-forest-600 text-bone font-semibold uppercase tracking-wide hover:bg-forest-500"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              <>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="w-full mb-4 px-6 py-2 text-forest-600 font-semibold hover:text-forest-500"
                >
                  ← Back to Shipping
                </button>
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    cart={cart}
                    shippingInfo={shippingInfo}
                    phone={phone}
                    discountAmount={discountAmount}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    total={total}
                    onSuccess={() => {
                      setOrderPlaced(true)
                      setShowPaymentForm(false)
                    }}
                    onError={(error) => {
                      alert('Payment failed: ' + error)
                    }}
                    isLoading={placingOrder}
                  />
                </Elements>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
