import { useDrafts } from '../../hooks/useDrafts'
import { Button } from '../ui'
import { formatPrice } from '../../utils/helpers'
import { formatDistanceToNow } from 'date-fns'

/**
 * Drafts section in Profile - shows all saved drafts
 */
export default function DraftsSection({ onNavigate }) {
  const { drafts, loading, refetch, deleteDraft } = useDrafts()

  if (loading) {
    return <p className="detail-loading">Loading drafts…</p>
  }

  if (drafts.length === 0) {
    return (
      <div className="profile-section empty-state">
        <p>Belum ada draft tersimpan.</p>
        <Button variant="primary" onClick={() => onNavigate?.('Create')}>
          Buat Produk Baru
        </Button>
      </div>
    )
  }

  return (
    <div className="profile-section">
      <div className="section-header">
        <h2 className="section-title">Draft Tersimpan ({drafts.length})</h2>
      </div>

      <div className="drafts-grid">
        {drafts.map((draft) => (
          <div key={draft.id} className="draft-card">
            <div className="draft-header">
              <span className="draft-badge">Draft</span>
              <time className="draft-time" dateTime={draft.savedAt}>
                {draft.timeAgo || formatDistanceToNow(new Date(draft.savedAt), { addSuffix: true })}
              </time>
            </div>

            <div className="draft-content">
              <h3 className="draft-name">{draft.formData?.name || 'Tanpa Nama'}</h3>
              <p className="draft-meta">
                {draft.formData?.type || '—'} · {draft.formData?.caliber || '—'}
                {draft.formData?.price && <span> · Rp{formatPrice(draft.formData.price)}</span>}
              </p>
              {draft.formData?.description && (
                <p className="draft-desc">{draft.formData.description.substring(0, 80)}…</p>
              )}
            </div>

            <div className="draft-actions">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (draft.isCreate) {
                    onNavigate?.('Create')
                  } else {
                    onNavigate?.('Edit', { id: draft.id, ...draft.formData })
                  }
                }}
              >
                Lanjutkan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (window.confirm('Hapus draft ini?')) {
                    await deleteDraft(draft.id)
                    refetch()
                  }
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}