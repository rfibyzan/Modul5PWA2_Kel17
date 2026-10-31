/**
 * About section content (extracted from About.jsx page)
 */
export default function AboutSection() {
  return (
    <div className="profile-section">
      <h2 className="section-title">Tentang Bore & Barrel</h2>
      <p className="lede">
        Bore & Barrel menjual daftar singkat, jujur senjata api. Setiap item dihargai
        dari meja kerja — tanpa markup teater, tanpa pengisi.
      </p>
      <div className="about-details">
        <h3>Visi Kami</h3>
        <p>
          Menyediakan katalog perangkat keras yang terkurasi, transparan, dan dapat diakses
          secara offline melalui Progressive Web App.
        </p>
        <h3>Teknologi</h3>
        <ul>
          <li>React 19 + Vite 8</li>
          <li>PWA dengan Service Worker (Workbox)</li>
          <li>Supabase PostgREST sebagai backend</li>
          <li>TanStack Query untuk caching</li>
        </ul>
      </div>
    </div>
  )
}