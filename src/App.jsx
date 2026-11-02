import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Toast from './components/Toast.jsx'
import Loader from './components/Loader.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import FloatingWidgets from './components/FloatingWidgets.jsx'
import TabBar from './components/TabBar.jsx'
import CompareTray from './components/CompareTray.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'
import ChalkPuffs from './components/ChalkPuffs.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Checkout from './pages/Checkout.jsx'
import Branches from './pages/Branches.jsx'
import Brands from './pages/Brands.jsx'
import About from './pages/About.jsx'
import Coach from './pages/Coach.jsx'
import Compare from './pages/Compare.jsx'
import NotFound from './pages/NotFound.jsx'
import { boot, LOADER_MS, LOADER_FADE_MS } from './boot.js'

export default function App() {
  // 'show' -> 'hiding' (fade) -> 'gone' (unmounted)
  const [loadPhase, setLoadPhase] = useState('show')
  useEffect(() => {
    const t1 = setTimeout(() => setLoadPhase('hiding'), LOADER_MS)
    const t2 = setTimeout(() => { setLoadPhase('gone'); boot.introDelay = 0 }, LOADER_MS + LOADER_FADE_MS)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      {loadPhase !== 'gone' && <Loader hiding={loadPhase === 'hiding'} />}
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <Toast />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:category" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/product/:id/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/about" element={<About />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <FloatingWidgets />
      <CompareTray />
      <InstallPrompt />
      <TabBar />
      <ChalkPuffs />
    </>
  )
}
