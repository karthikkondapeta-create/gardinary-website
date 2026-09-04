import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'

const IMGBB_API_KEY = '3144d33434570356b03b7493164033f4'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, showcase: false })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
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

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    setUploadProgress('Starting upload...')
    try {
      const uploadedUrls = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading image ${i + 1} of ${files.length} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`)
        console.log(`Uploading ${file.name} to imgbb...`)

        // Upload to imgbb
        const formData = new FormData()
        formData.append('image', file)
        formData.append('key', IMGBB_API_KEY)

        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`imgbb upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (!data.success) {
          throw new Error(`imgbb error: ${data.error?.message || 'Unknown error'}`)
        }

        const imageUrl = data.data.url
        uploadedUrls.push(imageUrl)
        console.log(`✓ Uploaded image ${i + 1}: ${imageUrl}`)
      }

      setNewProduct({ ...newProduct, images: [...newProduct.images, ...uploadedUrls] })
      setUploadProgress(`✓ Successfully uploaded ${uploadedUrls.length} image(s)!`)
      setTimeout(() => setUploadProgress(''), 2000)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading images: ' + error.message)
      setUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || newProduct.images.length === 0) {
      alert('Please fill in all fields and add at least one image')
      return
    }
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        images: newProduct.images,
        bestseller: newProduct.bestseller,
        showcase: newProduct.showcase,
        createdAt: new Date()
      })
      setNewProduct({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, showcase: false })
      loadData()
      alert('Product added successfully!')
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

  const handleUpdateStock = async (id, newStock) => {
    try {
      await updateDoc(doc(db, 'products', id), { stock: parseInt(newStock) })
      loadData()
    } catch (error) {
      alert('Error updating stock: ' + error.message)
    }
  }

  const handleToggleBestseller = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, 'products', id), { bestseller: !currentValue })
      loadData()
    } catch (error) {
      alert('Error updating bestseller: ' + error.message)
    }
  }

  const handleToggleShowcase = async (id, currentValue) => {
    try {
      await updateDoc(doc(db, 'products', id), { showcase: !currentValue })
      loadData()
    } catch (error) {
      alert('Error updating showcase: ' + error.message)
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
              className="w-full px-4 py-2 bg-forest-600 text-bone rounded font-semibold hover:bg-forest-500 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-ink-900 text-bone p-6 flex flex-col">
        <div className="mb-8">
          <Link to="/" className="font-display text-2xl text-bone">
            GARDINARY
          </Link>
          <p className="text-xs text-bone/60 mt-1">Admin Panel</p>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-forest-600 text-white'
                : 'text-bone hover:bg-ink-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${
              activeTab === 'products'
                ? 'bg-forest-600 text-white'
                : 'text-bone hover:bg-ink-800'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${
              activeTab === 'showcase'
                ? 'bg-forest-600 text-white'
                : 'text-bone hover:bg-ink-800'
            }`}
          >
            Showcase
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`w-full text-left px-4 py-3 rounded transition-colors ${
              activeTab === 'subscribers'
                ? 'bg-forest-600 text-white'
                : 'text-bone hover:bg-ink-800'
            }`}
          >
            Subscribers
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold mt-auto"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display text-ink-900">Welcome Back!</h1>
          <p className="text-ink-600 mt-2">Manage your Gardinary store</p>
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
              <p className="text-ink-600 text-sm mb-2">Showcase Products</p>
              <p className="text-4xl font-bold text-forest-600">
                {products.filter(p => p.showcase).length}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
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
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
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
                <div>
                  <label className="block text-sm text-ink-600 mb-2">Product Images (select multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                  />
                  {uploadingImage && <p className="text-sm text-forest-600 mt-1">⚡ {uploadProgress}</p>}
                  {newProduct.images.length > 0 && <p className="text-sm text-green-600 mt-1">✓ {newProduct.images.length} image(s) uploaded</p>}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newProduct.bestseller}
                    onChange={(e) => setNewProduct({ ...newProduct, bestseller: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-ink-600">Mark as bestseller</span>
                </label>
                <button
                  type="submit"
                  className="w-full bg-forest-600 text-bone py-2 rounded font-semibold hover:bg-forest-500"
                >
                  Add Product
                </button>
              </form>
            </div>

            <div className="col-span-2">
              <h2 className="text-2xl font-display text-ink-900 mb-4">Current Products ({products.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div key={product.id} className="bg-stone-50 p-4 rounded border border-gray-300">
                    <div className="flex justify-between items-start mb-2">
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-ink-600">Stock:</label>
                        <input
                          type="number"
                          value={product.stock || 0}
                          onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-ink-900 text-sm"
                          min="0"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.bestseller || false}
                          onChange={() => handleToggleBestseller(product.id, product.bestseller)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-ink-600">Bestseller</span>
                      </label>
                      <p className="text-xs text-ink-500">{product.images?.length || 0} image(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'showcase' && (
          <div>
            <h2 className="text-2xl font-display text-ink-900 mb-4">Manage Showcase Products</h2>
            <p className="text-ink-600 mb-6">Select which products appear in the "Our Collection" section on the home page</p>
            <div className="grid grid-cols-2 gap-4 max-h-screen overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded border border-gray-300 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-ink-900">{product.name}</p>
                    <p className="text-sm text-ink-600 mb-3">${product.price} • {product.category}</p>
                    {product.images && product.images[0] && (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={product.showcase || false}
                      onChange={() => handleToggleShowcase(product.id, product.showcase)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-ink-600 whitespace-nowrap">Add to Showcase</span>
                  </label>
                </div>
              ))}
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
