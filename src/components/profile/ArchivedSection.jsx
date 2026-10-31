import { useArchivedGuns, useRestoreGun } from '../../hooks/useArchivedGuns'
import { useDeleteGun } from '../../hooks/useGuns'
import { Button } from '../ui'
import { formatPrice } from '../../utils/helpers'
import { formatDistanceToNow } from 'date-fns'
import { Archive, RotateCcw, Trash2, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import ConfirmModal from '../modals/ConfirmModal'

/**
 * Archived (soft-deleted) guns section in Profile
 * Displays all soft-deleted hardware items with restore and permanent delete options.
 */
export default function ArchivedSection({ onNavigate }) {
  const { guns, loading } = useArchivedGuns()
  const { restoreGun, loading: restoring } = useRestoreGun()
  const { deleteGun, loading: deleting } = useDeleteGun()
  const [deleteTarget, setDeleteTarget] = useState(null)

  if (loading) {
    return <p className="detail-loading">Loading archived items…</p>
  }

  if (guns.length === 0) {
    return (
      <div className="profile-section empty-state">
        <Archive className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Arsip Kosong
        </h3>
        <p className="text-gray-500 mb-4 max-w-sm text-center">
          Belum ada hardware yang diarsipkan. Anda dapat mengarsipkan hardware dari katalog menggunakan tombol arsip (📦).
        </p>
        <Button variant="primary" size="sm" onClick={() => onNavigate?.('Catalog')}>
          Lihat Katalog <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className="profile-section">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h2 className="section-title">Item Diarsipkan ({guns.length})</h2>
        <p className="text-sm text-gray-500">
          Item ini disembunyikan dari katalog utama tetapi dapat dipulihkan sewaktu-waktu.
        </p>
      </div>

      <div className="archived-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {guns.map((gun) => {
          const archivedDate = gun.archived_at || gun.deleted_at
          let timeAgo = ''
          if (archivedDate) {
            try {
              timeAgo = formatDistanceToNow(new Date(archivedDate), { addSuffix: true })
            } catch {
              timeAgo = 'Baru saja'
            }
          }

          return (
            <div
              key={gun.id}
              className="card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                opacity: 0.95,
                background: 'var(--card-bg, #fff)',
              }}
            >
              <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#f5f5f5', borderRadius: '8px 8px 0 0' }}>
                <img
                  src={gun.image_url || gun.image || '/guns/pistol.svg'}
                  alt={gun.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }}
                />
                <span className="badge badge--archive" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  Arsip
                </span>
              </div>

              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 className="name display" style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>
                  {gun.name}
                </h3>
                <span className="type" style={{ fontSize: '0.8rem', color: 'var(--steel)', marginBottom: '8px' }}>
                  {gun.type || gun.category || 'Hardware'} {gun.caliber ? `· ${gun.caliber}` : ''}
                </span>

                <span className="price" style={{ fontWeight: 'bold', marginBottom: '12px' }}>
                  {formatPrice(gun.price ?? gun.cook_time ?? 0)}
                </span>

                {timeAgo && (
                  <span style={{ fontSize: '0.75rem', color: '#888', marginBottom: '12px' }}>
                    Diarsipkan {timeAgo}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={restoring}
                    onClick={() => restoreGun(gun.id)}
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={14} /> Pulihkan
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting}
                    onClick={() => setDeleteTarget(gun)}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Hardware Permanen"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}" secara permanen? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          await deleteGun(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
