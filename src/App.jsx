import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import PWABadge from './components/PWABadge'
import ConfirmModal from './components/modals/ConfirmModal'
import SplashScreen from './components/common/SplashScreen'
import ErrorBoundary from './components/common/ErrorBoundary'
import gunService from './services/gunService'
import { useState, useEffect } from 'react'
import './App.css'

// Lazy-loaded pages
const Catalog = lazy(() => import('./pages/Catalog'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage'))
const EditGunPage = lazy(() => import('./pages/EditGunPage'))
const GunDetailPage = lazy(() => import('./pages/GunDetailPage'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'))
const CartPage = lazy(() => import('./pages/CartPage'))

// Fallback for lazy loading
const PageFallback = () => (
  <div className="state-box">
    <div className="spin" style={{ width: 28, height: 28, border: '3px solid var(--line)', borderTopColor: 'var(--brass)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <p>Loading…</p>
  </div>
)

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Check for PWA update on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.update()
      })
    }
  }, [])

  return (
    <BrowserRouter>
      <CartProvider>
        <div className="shell">
          {showSplash && (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          )}

          <Header onNavigateCart={() => {}} />

          <main className="main">
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/catalog" replace />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/profile" element={<ProfilePage onReplaySplash={() => setShowSplash(true)} />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/gun/:id" element={<GunDetailPage />} />
                  <Route path="/create" element={<CreateGunPage />} />
                  <Route path="/edit/:id" element={<EditGunPage />} />
                  <Route path="/edit-profile" element={<EditProfilePage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          {/* Global Delete Confirmation */}
          <ConfirmModal
            open={Boolean(deleteTarget)}
            title="Delete Hardware Record"
            message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            confirmLabel="Delete"
            danger
            loading={deleting}
            onConfirm={async () => {
              if (!deleteTarget) return
              try {
                setDeleting(true)
                await gunService.deleteGun(deleteTarget.id)
                setDeleteTarget(null)
              } catch (err) {
                alert(err.message || 'Failed to delete record.')
              } finally {
                setDeleting(false)
              }
            }}
            onCancel={() => setDeleteTarget(null)}
          />

          <PWABadge />
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App