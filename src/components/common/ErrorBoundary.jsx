import { Component } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/catalog'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '50%',
              background: '#fee2e2',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={36} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Terjadi Kesalahan Tampilan</h2>
          <p style={{ color: '#666', maxWidth: '440px', marginBottom: '20px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'Aplikasi mengalami kendala saat memuat halaman.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn btn--primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={16} /> Muat Ulang
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="btn btn--outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={16} /> Ke Katalog
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

