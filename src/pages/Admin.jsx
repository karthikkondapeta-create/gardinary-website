import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tees', image: '' })
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        loadData()
      }
    })
    return () => unsubscribe()
  }, [])

  const loadData = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'))
      setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))

      const subscribersSnapshot = await getDocs(collection(db, 'subscribers'))
      setSubscribers(subscribersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setEmail('')
      setPassword('')
    } catch (error) {
      alert('Login failed: ' + error.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in all fields')
      return
    }
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image: newProduct.image,
        createdAt: new Date()
      })
      setNewProduct({ name: '', price: '', category: 'Tees', image: '' })
      loadData()
    } catch (error) {
      alert('Error adding product: ' + error.message)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id))
        loadData()
      } catch (error) {
        alert('Error deleting product: ' + error.message)
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-300 p-8 rounded">
          <h1 className="text-3xl font-display text-ink-900 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 text-bone py-2 rounded font-semibold hover:bg-forest-500"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container-px py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display text-ink-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-semibold ${activeTab === 'dashboard' ? 'border-b-2 border-forest-600 text-forest-600' : 'text-ink-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-semibold ${activeTab === 'products' ? 'border-b-2 border-forest-600 text-forest-600' : 'text-ink-600'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 font-semibold ${activeTab === 'subscribers' ? 'border-b-2 border-forest-600 text-forest-600' : 'text-ink-600'}`}
          >
            Subscribers
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Total Products</p>
              <p className="text-4xl font-bold text-forest-600">{products.length}</p>
            </div>
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Newsletter Subscribers</p>
              <p className="text-4xl font-bold text-forest-600">{subscribers.length}</p>
            </div>
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Status</p>
              <p className="text-2xl font-bold text-green-600">✓ Active</p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-display text-ink-900 mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                >
                  <option>Tees</option>
                  <option>Thermals</option>
                  <option>Hoodies</option>
                </select>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                />
                <button
                  type="submit"
                  className="w-full bg-forest-600 text-bone py-2 rounded font-semibold hover:bg-forest-500"
                >
                  Add Product
                </button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-display text-ink-900 mb-4">Current Products</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="bg-stone-50 p-4 rounded border border-gray-300 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-ink-900">{product.name}</p>
                      <p className="text-sm text-ink-600">${product.price} • {product.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div>
            <h2 className="text-2xl font-display text-ink-900 mb-4">Newsletter Subscribers</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {subscribers.map((sub) => (
                <div key={sub.id} className="bg-stone-50 p-4 rounded border border-gray-300">
                  <p className="font-semibold text-ink-900">{sub.email}</p>
                  <p className="text-sm text-ink-600">Discount Code: <span className="font-mono font-bold text-forest-600">{sub.discountCode}</span></p>
                  <p className="text-xs text-ink-500">Signed up: {new Date(sub.createdAt?.toDate?.()).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
