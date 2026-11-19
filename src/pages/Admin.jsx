import { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Link } from 'react-router-dom'

const IMGBB_API_KEY = '3144d33434570356b03b7493164033f4'

export default function Admin() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [showcaseItems, setShowcaseItems] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, sizes: [] })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadingShowcase, setUploadingShowcase] = useState(false)
  const [showcaseUploadProgress, setShowcaseUploadProgress] = useState('')
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

      const showcaseSnapshot = await getDocs(collection(db, 'showcase'))
      const sortedShowcase = showcaseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      sortedShowcase.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setShowcaseItems(sortedShowcase)
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

  const handleShowcaseUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingShowcase(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const isVideo = file.type.startsWith('video/')
        
        setShowcaseUploadProgress(`Uploading ${isVideo ? 'video' : 'image'} ${i + 1} of ${files.length}...`)
        console.log(`Uploading showcase ${file.name} (${isVideo ? 'video' : 'image'})...`)

        let url
        
        if (isVideo) {
          const videoRef = ref(storage, `showcase/videos/${Date.now()}-${file.name}`)
          const snapshot = await uploadBytes(videoRef, file)
          url = await getDownloadURL(snapshot.ref)
          console.log(`✓ Video uploaded: ${url}`)
        } else {
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

          url = data.data.url
          console.log(`✓ Image uploaded: ${url}`)
        }

        await addDoc(collection(db, 'showcase'), {
          type: isVideo ? 'video' : 'image',
          imageUrl: isVideo ? null : url,
          videoUrl: isVideo ? url : null,
          createdAt: new Date()
        })
      }

      setShowcaseUploadProgress(`✓ Successfully uploaded ${files.length} item(s)!`)
      setTimeout(() => setShowcaseUploadProgress(''), 2000)
      loadData()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading: ' + error.message)
      setShowcaseUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingShowcase(false)
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
        sizes: newProduct.sizes && newProduct.sizes.length > 0 ? newProduct.sizes : [],
        createdAt: new Date()
      })
      setNewProduct({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, sizes: [] })
      loadData()
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product: ' + error.message)
    }
  }

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: parseInt(newStock) || 0
      })
      loadData()
    } catch (error) {
      console.error('Error updating stock:', error)
    }
  }

  const handleToggleBestseller = async (productId, currentValue) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        bestseller: !currentValue
      })
      loadData()
    } catch (error) {
      console.error('Error updating bestseller:', error)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId))
        loadData()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleDeleteShowcase = async (itemId) => {
    if (confirm('Are you sure you want to delete this showcase item?')) {
      try {
        await deleteDoc(doc(db, 'showcase', itemId))
        loadData()
      } catch (error) {
        console.error('Error deleting showcase item:', error)
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="max-w-sm w-full bg-stone-50 p-8 rounded-lg border border-gray-300">
          <h1 className="text-4xl font-display mb-6 text-ink-900">Admin Login</h1>
          <div className="space-y-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-forest-600 text-white font-semibold rounded hover:bg-forest-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container-px flex justify-between items-center mb-8">
        <h1 className="text-5xl font-display text-ink-900">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 flex gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-3 font-semibold ${activeTab === 'dashboard' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold ${activeTab === 'products' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-600'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-6 py-3 font-semibold ${activeTab === 'subscribers' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-600'}`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-6 py-3 font-semibold ${activeTab === 'showcase' ? 'border-b-2 border-ink-900 text-ink-900' : 'text-ink-600'}`}
        >
          Showcase
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Total Products</p>
              <p className="text-4xl font-bold text-ink-900">{products.length}</p>
            </div>
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Newsletter Subscribers</p>
              <p className="text-4xl font-bold text-ink-900">{subscribers.length}</p>
            </div>
            <div className="bg-stone-50 p-6 rounded border border-gray-300">
              <p className="text-ink-600 text-sm mb-2">Showcase Items</p>
              <p className="text-4xl font-bold text-ink-900">{showcaseItems.length}</p>
            </div>
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
              <input
                type="text"
                placeholder="Sizes (e.g. XS,S,M,L,XL,XXL)"
                value={newProduct.sizes.join(",")}
                onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, sizes: ["XS","S","M","L","XL","XXL"] })}
                  className="text-xs px-2 py-1 bg-ink-100 text-ink-900 rounded hover:bg-ink-200"
                >
                  All Sizes
                </button>
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, sizes: ["S","M","L","XL"] })}
                  className="text-xs px-2 py-1 bg-ink-100 text-ink-900 rounded hover:bg-ink-200"
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, sizes: ["XS","S","M","L","XL"] })}
                  className="text-xs px-2 py-1 bg-ink-100 text-ink-900 rounded hover:bg-ink-200"
                >
                  Extended
                </button>
              </div>
              <div>
                <label className="block text-sm text-ink-600 mb-2">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
                />
                {uploadProgress && <p className="text-sm text-ink-600 mt-2">{uploadProgress}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={newProduct.bestseller}
                  onChange={(e) => setNewProduct({ ...newProduct, bestseller: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="bestseller" className="text-sm text-ink-600">Featured</label>
              </div>
              <div className="space-y-2">
                {newProduct.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`upload ${idx}`} className="w-full h-24 object-cover rounded" />
                ))}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-forest-600 text-white font-semibold rounded hover:bg-forest-700"
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
                      {product.sizes && product.sizes.length > 0 && <p className="text-sm text-ink-600">Sizes: {product.sizes.join(", ")}</p>}
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
                      <span className="text-sm text-ink-600">Featured</span>
                    </label>
                    <p className="text-xs text-ink-500">{product.images?.length || 0} image(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div>
          <h2 className="text-2xl font-display text-ink-900 mb-4">Newsletter Subscribers ({subscribers.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {subscribers.map((sub) => (
              <div key={sub.id} className="bg-stone-50 p-3 rounded border border-gray-300">
                <p className="font-semibold text-ink-900">{sub.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'showcase' && (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <h2 className="text-2xl font-display text-ink-900 mb-4">Add Showcase Item</h2>
            <div>
              <label className="block text-sm text-ink-600 mb-2">Upload Images or Videos</label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleShowcaseUpload}
                disabled={uploadingShowcase}
                className="w-full px-4 py-2 border border-gray-300 rounded text-ink-900"
              />
              {showcaseUploadProgress && <p className="text-sm text-ink-600 mt-2">{showcaseUploadProgress}</p>}
            </div>
          </div>

          <div className="col-span-2">
            <h2 className="text-2xl font-display text-ink-900 mb-4">Showcase Items ({showcaseItems.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {showcaseItems.map((item, idx) => (
                <div key={item.id} className="bg-stone-50 p-3 rounded border border-gray-300 flex justify-between items-center">
                  <span className="text-sm text-ink-900">{idx + 1}. {item.type === 'video' ? '🎥 Video' : '📸 Image'}</span>
                  <button
                    onClick={() => handleDeleteShowcase(item.id)}
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
    </div>
  )
}
