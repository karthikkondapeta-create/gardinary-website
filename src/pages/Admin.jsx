import { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'
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
  const [discountCodes, setDiscountCodes] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, sizes: [], frontImage: null, backImage: null })
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [uploadingShowcase, setUploadingShowcase] = useState(false)
  const [showcaseUploadProgress, setShowcaseUploadProgress] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchProduct, setSearchProduct] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [discountCodeForm, setDiscountCodeForm] = useState({ code: '', discount: 10, limit: 100 })

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
      const [productsSnap, subscribersSnap, showcaseSnap, discountSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'subscribers')),
        getDocs(collection(db, 'showcase')),
        getDocs(collection(db, 'discountCodes'))
      ])
      
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setSubscribers(subscribersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setDiscountCodes(discountSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      
      const showcaseData = showcaseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      showcaseData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      setShowcaseItems(showcaseData)
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
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`)

        const formData = new FormData()
        formData.append('image', file)
        formData.append('key', IMGBB_API_KEY)

        const response = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.success) {
          uploadedUrls.push(data.data.url)
        }
      }

      setNewProduct({ ...newProduct, images: [...newProduct.images, ...uploadedUrls] })
      setUploadProgress(`✓ Uploaded ${uploadedUrls.length} image(s)!`)
      setTimeout(() => setUploadProgress(''), 2000)
    } catch (error) {
      setUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFrontImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setUploadProgress('Uploading front image...')
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('key', IMGBB_API_KEY)

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setNewProduct({ ...newProduct, frontImage: data.data.url })
        setUploadProgress('✓ Front image uploaded!')
        setTimeout(() => setUploadProgress(''), 2000)
      }
    } catch (error) {
      setUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleBackImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setUploadProgress('Uploading back image...')
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('key', IMGBB_API_KEY)

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setNewProduct({ ...newProduct, backImage: data.data.url })
        setUploadProgress('✓ Back image uploaded!')
        setTimeout(() => setUploadProgress(''), 2000)
      }
    } catch (error) {
      setUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price')
      return
    }
    if (!newProduct.frontImage && !newProduct.backImage && newProduct.images.length === 0) {
      alert('Please add at least one image (Front, Back, or Additional)')
      return
    }
    try {
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 0,
        images: newProduct.images,
        bestseller: newProduct.bestseller,
        sizes: newProduct.sizes && newProduct.sizes.length > 0 ? newProduct.sizes : [],
        frontImage: newProduct.frontImage,
        backImage: newProduct.backImage
      }
      
      if (editingProduct === 'new') {
        productData.createdAt = new Date()
        await addDoc(collection(db, 'products'), productData)
        alert('Product added successfully!')
      } else {
        await updateDoc(doc(db, 'products', editingProduct), productData)
        alert('Product updated successfully!')
      }
      
      setNewProduct({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, sizes: [], frontImage: null, backImage: null })
      setEditingProduct(null)
      loadData()
    } catch (error) {
      alert('Error saving product: ' + error.message)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'products', productId))
        loadData()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images || [],
      bestseller: product.bestseller || false,
      sizes: product.sizes || [],
      frontImage: product.frontImage || null,
      backImage: product.backImage || null
    })
    setEditingProduct(product.id)
  }

  const handleUpdateStock = async (productId, newStock) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: parseInt(newStock) || 0
      })
      loadData()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddDiscount = async (e) => {
    e.preventDefault()
    if (!discountCodeForm.code || !discountCodeForm.discount) {
      alert('Please fill in all fields')
      return
    }
    try {
      await addDoc(collection(db, 'discountCodes'), {
        code: discountCodeForm.code.toUpperCase(),
        discount: parseInt(discountCodeForm.discount),
        limit: parseInt(discountCodeForm.limit) || 100,
        used: 0,
        verified: true,
        createdAt: new Date()
      })
      setDiscountCodeForm({ code: '', discount: 10, limit: 100 })
      loadData()
      alert('Discount code created!')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleDeleteDiscount = async (codeId) => {
    if (confirm('Delete this discount code?')) {
      try {
        await deleteDoc(doc(db, 'discountCodes', codeId))
        loadData()
      } catch (error) {
        console.error('Error:', error)
      }
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

        let url

        if (isVideo) {
          const videoRef = ref(storage, `showcase/videos/${Date.now()}-${file.name}`)
          const snapshot = await uploadBytes(videoRef, file)
          url = await getDownloadURL(snapshot.ref)
        } else {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('key', IMGBB_API_KEY)

          const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()
          if (data.success) {
            url = data.data.url
          }
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
      setShowcaseUploadProgress(`Error: ${error.message}`)
    } finally {
      setUploadingShowcase(false)
    }
  }

  const handleDeleteShowcase = async (itemId) => {
    if (confirm('Delete this showcase item?')) {
      try {
        await deleteDoc(doc(db, 'showcase', itemId))
        loadData()
      } catch (error) {
        console.error('Error:', error)
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-display mb-2 text-ink-900">Gardinary</h1>
          <p className="text-ink-600 mb-8">Admin Dashboard</p>
          
          <div className="space-y-4 mb-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    )
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProduct.toLowerCase())
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container-px flex justify-between items-center py-4">
          <h1 className="text-2xl font-display text-ink-900">Gardinary Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'products', label: 'Products', icon: '📦' },
            { id: 'orders', label: 'Orders', icon: '🛒' },
            { id: 'discounts', label: 'Discounts', icon: '🏷️' },
            { id: 'subscribers', label: 'Subscribers', icon: '📧' },
            { id: 'showcase', label: 'Showcase', icon: '🎨' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-forest-600 text-white'
                  : 'text-ink-700 hover:bg-stone-100'
              }`}
            >
              <span className="mr-3">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-display text-ink-900">Dashboard</h2>
                <div className="grid grid-cols-4 gap-6">
                  {[
                    { label: 'Total Products', value: products.length, icon: '📦' },
                    { label: 'Total Sales', value: '$0', icon: '💰' },
                    { label: 'Subscribers', value: subscribers.length, icon: '👥' },
                    { label: 'Active Discounts', value: discountCodes.length, icon: '🏷️' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                      <p className="text-gray-600 text-sm font-semibold mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-ink-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-display text-ink-900">Products</h2>
                  <button
                    onClick={() => setEditingProduct('new')}
                    className="px-6 py-3 bg-forest-600 text-white rounded-lg font-semibold hover:bg-forest-700"
                  >
                    + Add Product
                  </button>
                </div>

                {/* Add/Edit Product Form */}
                {editingProduct && (
                  <div className="bg-white rounded-xl p-8 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-ink-900">
                        {editingProduct === 'new' ? 'Add New Product' : 'Edit Product'}
                      </h3>
                      {editingProduct !== 'new' && newProduct.bestseller && (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                          ⭐ Bestseller
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                      >
                        <option>Tees</option>
                        <option>Thermals</option>
                        <option>Hoodies</option>
                      </select>
                      <div>
                        <label className="block text-sm font-semibold text-ink-900 mb-3">Select Sizes</label>
                        <div className="flex gap-3 flex-wrap mb-3">
                          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                const updatedSizes = newProduct.sizes.includes(size)
                                  ? newProduct.sizes.filter(s => s !== size)
                                  : [...newProduct.sizes, size]
                                setNewProduct({ ...newProduct, sizes: updatedSizes })
                              }}
                              className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition ${
                                newProduct.sizes.includes(size)
                                  ? 'bg-forest-600 text-white border-2 border-forest-600'
                                  : 'bg-stone-100 text-ink-900 border-2 border-gray-300 hover:border-forest-600'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                        {newProduct.sizes.length > 0 && (
                          <p className="text-xs text-gray-600">Selected: {newProduct.sizes.join(", ")}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-ink-900 mb-3">Front Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFrontImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                        {newProduct.frontImage && (
                          <p className="text-xs text-green-600 mt-2">✓ Front image uploaded</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-ink-900 mb-3">Back Picture</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBackImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                        {newProduct.backImage && (
                          <p className="text-xs text-green-600 mt-2">✓ Back image uploaded</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-ink-900 mb-3">Additional Images</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                        {uploadProgress && <p className="text-sm text-ink-600 mt-2">{uploadProgress}</p>}
                      </div>

                      <div className="col-span-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="bestseller"
                          checked={newProduct.bestseller}
                          onChange={(e) => setNewProduct({ ...newProduct, bestseller: e.target.checked })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="bestseller" className="text-sm font-semibold text-ink-900 cursor-pointer">
                          Mark as Bestseller
                        </label>
                      </div>

                      <div className="col-span-2 flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700"
                        >
                          {editingProduct === 'new' ? 'Add Product' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(null)
                            setNewProduct({ name: '', price: '', category: 'Tees', stock: 0, images: [], bestseller: false, sizes: [], frontImage: null, backImage: null })
                          }}
                          className="flex-1 px-6 py-3 bg-stone-200 text-ink-900 font-semibold rounded-lg hover:bg-stone-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Search & Filter */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                  >
                    <option>All Categories</option>
                    <option>Tees</option>
                    <option>Thermals</option>
                    <option>Hoodies</option>
                  </select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
                      <div className="aspect-square bg-stone-100 overflow-hidden relative">
                        {product.frontImage ? (
                          <img src={product.frontImage} alt={product.name} className="w-full h-full object-cover" />
                        ) : product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                        {product.bestseller && (
                          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">⭐</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-ink-900 mb-1 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-forest-600">${product.price}</span>
                          <span className="text-xs bg-stone-100 px-2 py-1 rounded text-ink-700">{product.stock} stock</span>
                        </div>
                        {product.sizes && product.sizes.length > 0 && (
                          <p className="text-xs text-gray-600 mb-3">Sizes: {product.sizes.join(", ")}</p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discounts */}
            {activeTab === 'discounts' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-ink-900">Discount Codes</h2>
                
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold mb-6 text-ink-900">Create New Discount</h3>
                  <form onSubmit={handleAddDiscount} className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Code (e.g. SUMMER20)"
                      value={discountCodeForm.code}
                      onChange={(e) => setDiscountCodeForm({ ...discountCodeForm, code: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                    <input
                      type="number"
                      placeholder="Discount %"
                      value={discountCodeForm.discount}
                      onChange={(e) => setDiscountCodeForm({ ...discountCodeForm, discount: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                    <input
                      type="number"
                      placeholder="Usage Limit"
                      value={discountCodeForm.limit}
                      onChange={(e) => setDiscountCodeForm({ ...discountCodeForm, limit: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-600"
                    />
                    <button
                      type="submit"
                      className="col-span-3 px-6 py-3 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700"
                    >
                      Create Discount Code
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Code</th>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Discount</th>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Limit</th>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Used</th>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountCodes.map((code) => (
                        <tr key={code.id} className="border-b border-gray-200 hover:bg-stone-50">
                          <td className="px-6 py-3 font-semibold text-ink-900">{code.code}</td>
                          <td className="px-6 py-3">{code.discount}%</td>
                          <td className="px-6 py-3">{code.limit}</td>
                          <td className="px-6 py-3">{code.used || 0}</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => handleDeleteDiscount(code.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Subscribers */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-ink-900">Newsletter Subscribers ({subscribers.length})</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-stone-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Email</th>
                        <th className="px-6 py-3 text-left font-semibold text-ink-900">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-200 hover:bg-stone-50">
                          <td className="px-6 py-3 text-ink-900">{sub.email}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Showcase */}
            {activeTab === 'showcase' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-ink-900">Showcase ({showcaseItems.length})</h2>

                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-ink-900">Upload Images or Videos</h3>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleShowcaseUpload}
                    disabled={uploadingShowcase}
                    className="w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-forest-600"
                  />
                  {showcaseUploadProgress && <p className="text-sm text-ink-600 mt-3">{showcaseUploadProgress}</p>}
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {showcaseItems.map((item, idx) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="aspect-square bg-stone-100">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
                        ) : (
                          <img src={item.imageUrl} alt="showcase" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-gray-600 mb-2">{item.type === 'video' ? 'Video' : 'Image'}</p>
                        <button
                          onClick={() => handleDeleteShowcase(item.id)}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders (Placeholder) */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-display text-ink-900">Orders</h2>
                <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                  <p className="text-gray-600">Order management coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
