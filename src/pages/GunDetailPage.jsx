import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  Share2,
  ShoppingCart,
  Archive,
  RotateCcw,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Check,
} from 'lucide-react'
import FavoriteButton from '../components/common/FavoriteButton'
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, useVoteReview } from '../hooks/useReviews'
import { useShare } from '../hooks/useShare'
import { useGunDetail, useDeleteGun } from '../hooks/useGuns'
import { useArchiveGun, useRestoreGun, useArchivedGuns } from '../hooks/useArchivedGuns'
import { useCart } from '../context/CartContext'
import { getUserIdentifier } from '../services/userService'
import { formatPrice, averageRating } from '../utils/helpers'
import { Button, toast } from '../components/ui'
import ConfirmModal from '../components/modals/ConfirmModal'
import { formatDistanceToNow } from 'date-fns'

/**
 * Full-screen product detail view with reviews CRUD, voting, and cart integration.
 */
export default function GunDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { share } = useShare()
  const { addItem } = useCart()

  const { gun, loading, error, refetch: refetchGun } = useGunDetail(id)
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(id)
  const { createReview, loading: submitting } = useCreateReview()
  const { updateReview } = useUpdateReview()
  const { deleteReview } = useDeleteReview()
  const { voteReview } = useVoteReview()

  const { archiveGun, loading: archiving } = useArchiveGun()
  const { restoreGun, loading: restoring } = useRestoreGun()
  const { deleteGun, loading: deleting } = useDeleteGun()
  const { guns: archivedGuns } = useArchivedGuns()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [cartQuantity, setCartQuantity] = useState(1)

  useEffect(() => {
    if (gun) refetchReviews()
  }, [gun, refetchReviews])

  const isArchived = Boolean(
    gun?.deleted_at ||
    gun?.archived_at ||
    archivedGuns.some((ag) => String(ag.id) === String(id))
  )

  const avgRating = gun?.average_rating || averageRating(reviews)
  const reviewCount = gun?.review_count ?? reviews.length
  const userId = getUserIdentifier()

  const handleAddToCart = () => {
    if (!gun) return
    addItem(gun, cartQuantity)
    toast.success('Keranjang', `${cartQuantity}x ${gun.name} ditambahkan ke keranjang.`)
  }

  const handleArchiveToggle = async () => {
    if (!gun) return
    if (isArchived) {
      await restoreGun(gun.id)
      refetchGun()
    } else {
      await archiveGun(gun)
      refetchGun()
    }
  }

  const handleDeletePermanent = async () => {
    if (!gun) return
    await deleteGun(gun.id)
    setDeleteConfirmOpen(false)
    toast.success('Dihapus', `${gun.name} telah dihapus permanen.`)
    navigate('/catalog')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    try {
      const result = await createReview({
        gunId: id,
        reviewData: {
          user_identifier: userId,
          rating,
          comment: comment.trim(),
        },
      })

      if (result) {
        setReviewSuccess('Review berhasil dikirim!')
        setComment('')
        setRating(5)
        refetchReviews()
        refetchGun()
      }
    } catch (err) {
      setReviewError(err.message || 'Gagal mengirim review.')
    }
  }

  const handleVote = async (reviewId, vote) => {
    try {
      await voteReview({ reviewId, gunId: id, vote })
      refetchReviews()
    } catch (err) {
      toast.error('Vote gagal', err.message || 'Tidak dapat memproses vote')
    }
  }

  const startEditReview = (review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment || '')
  }

  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault()
    try {
      await updateReview({
        reviewId,
        reviewData: { rating: editRating, comment: editComment.trim() },
        gunId: id,
      })
      setEditingReviewId(null)
      toast.success('Review diperbarui', 'Review Anda berhasil diubah.')
      refetchReviews()
    } catch (err) {
      toast.error('Update gagal', err.message || 'Tidak dapat memperbarui review')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Hapus review ini?')) return
    try {
      await deleteReview({ reviewId, gunId: id })
      toast.success('Review dihapus', 'Review telah dihapus.')
      refetchReviews()
    } catch (err) {
      toast.error('Hapus gagal', err.message || 'Tidak dapat menghapus review')
    }
  }

  const handleShare = () => {
    if (gun) share(gun)
  }

  if (loading) {
    return (
      <div className="detail">
        <div className="state-box">
          <Loader size={32} className="spin" />
          <p>Memuat detail hardware…</p>
        </div>
      </div>
    )
  }

  if (error || !gun) {
    return (
      <div className="detail">
        <div className="state-box state-box--error">
          <p>{error || 'Hardware tidak ditemukan.'}</p>
          <Button variant="outline" onClick={() => navigate('/catalog')}>
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    )
  }

  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || 'Hardware'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  return (
    <div className="detail">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/catalog')}
        className="detail-back-btn"
        style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={18} /> Kembali ke Katalog
      </Button>

      {/* Hero */}
      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
            {isArchived && <span className="badge badge--archive ml-2">Arsip</span>}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          {/* Add to Cart Section */}
          <div
            className="detail-cart-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '16px 0',
              padding: '12px',
              background: 'var(--paper, #f9f9f9)',
              borderRadius: '8px',
              border: '1px solid var(--line, #eee)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartQuantity((q) => Math.max(1, q - 1))}
                aria-label="Kurangi kuantitas"
              >
                −
              </Button>
              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                {cartQuantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartQuantity((q) => q + 1)}
                aria-label="Tambah kuantitas"
              >
                +
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={handleAddToCart}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flex: 1 }}
            >
              <ShoppingCart size={18} /> Tambah ke Keranjang
            </Button>
          </div>

          {/* Action buttons */}
          <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <FavoriteButton gunId={gun.id || gun.name} />
            <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Bagikan" title="Bagikan">
              <Share2 size={20} />
            </Button>
            <Link to={`/edit/${gun.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 size={14} className="mr-1" /> Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              disabled={archiving || restoring}
              onClick={handleArchiveToggle}
            >
              {isArchived ? (
                <>
                  <RotateCcw size={14} className="mr-1" /> Pulihkan
                </>
              ) : (
                <>
                  <Archive size={14} className="mr-1" /> Arsip
                </>
              )}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleting}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 size={14} className="mr-1" /> Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'Tidak ada deskripsi tersedia.'}</p>
      </section>

      {/* Specifications */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Spesifikasi Hardware</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Assembly / Maintenance Steps */}
      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly &amp; Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>{step.instruction || step}</li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews &amp; Ratings ({reviews.length})</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars" style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              >
                <Star
                  size={24}
                  fill={n <= rating ? 'var(--brass, #b38f4d)' : 'none'}
                  stroke={n <= rating ? 'var(--brass, #b38f4d)' : 'var(--steel, #888)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Tulis ulasan Anda mengenai hardware ini…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line, #ccc)' }}
          />

          <div style={{ marginTop: '8px' }}>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? (
                <>
                  <Loader size={15} className="spin" /> Mengirim…
                </>
              ) : (
                <>
                  <Send size={15} /> Kirim Review
                </>
              )}
            </Button>
          </div>

          {reviewError && <p className="form-error" style={{ color: '#c0392b', marginTop: '6px' }}>{reviewError}</p>}
          {reviewSuccess && <p className="form-success" style={{ color: '#27ae60', marginTop: '6px' }}>{reviewSuccess}</p>}
        </form>

        {/* Existing reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Memuat ulasan…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list" style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
            {reviews.map((rev) => {
              const isOwner =
                rev.user_id === userId ||
                rev.user_identifier === userId ||
                !rev.user_id ||
                rev.user_identifier === 'Operator' ||
                String(rev.id).startsWith('local-')
              const userVote = rev.user_votes?.[userId]
              const upvotes = rev.upvotes || 0
              const downvotes = rev.downvotes || 0

              if (editingReviewId === rev.id) {
                return (
                  <li
                    key={rev.id}
                    className="review-item review-item--editing"
                    style={{
                      padding: '14px',
                      background: 'var(--paper, #f9f9f9)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: '1px solid var(--brass, #b38f4d)',
                    }}
                  >
                    <form onSubmit={(e) => handleUpdateReview(e, rev.id)}>
                      <div className="review-stars" style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className="star-btn"
                            onClick={() => setEditRating(n)}
                            aria-label={`${n} star${n > 1 ? 's' : ''}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Star
                              size={20}
                              fill={n <= editRating ? 'var(--brass, #b38f4d)' : 'none'}
                              stroke={n <= editRating ? 'var(--brass, #b38f4d)' : 'var(--steel, #888)'}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="review-input"
                        rows="3"
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        maxLength={500}
                        placeholder="Ubah ulasan Anda…"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--line, #ccc)' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <Button type="submit" variant="primary" size="sm">
                          <Check size={14} className="mr-1" /> Simpan
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    </form>
                  </li>
                )
              }

              return (
                <li
                  key={rev.id}
                  className="review-item"
                  style={{
                    padding: '14px',
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--line, #eee)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    className="review-head"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}
                  >
                    <span className="review-user" style={{ fontWeight: 'bold' }}>
                      {rev.user_identifier || 'Operator'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="review-stars-display" style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < rev.rating ? 'var(--brass, #b38f4d)' : 'none'}
                            stroke={i < rev.rating ? 'var(--brass, #b38f4d)' : 'var(--line, #ccc)'}
                          />
                        ))}
                      </span>
                      {rev.created_at && (
                        <time className="review-time" style={{ fontSize: '0.75rem', color: '#888' }}>
                          {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                        </time>
                      )}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="review-comment" style={{ margin: '8px 0', color: 'var(--text, #333)' }}>
                      {rev.comment}
                    </p>
                  )}

                  <div
                    className="review-votes"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--line, #eee)',
                    }}
                  >
                    {/* Thumbs Up Button */}
                    <Button
                      variant={userVote === 'up' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote(rev.id, 'up')}
                      aria-label={userVote === 'up' ? 'Batalkan suka' : 'Suka'}
                      title="Thumbs Up"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ThumbsUp size={15} />
                      <span>{upvotes}</span>
                    </Button>

                    {/* Thumbs Down Button */}
                    <Button
                      variant={userVote === 'down' ? 'danger' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote(rev.id, 'down')}
                      aria-label={userVote === 'down' ? 'Batalkan tidak suka' : 'Tidak suka'}
                      title="Thumbs Down"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ThumbsDown size={15} />
                      <span>{downvotes}</span>
                    </Button>

                    {isOwner && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditReview(rev)}
                          title="Edit Review"
                          aria-label="Edit review"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Hapus Review"
                          aria-label="Hapus review"
                          style={{ color: '#c0392b' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="detail-empty" style={{ color: '#888', fontStyle: 'italic', marginTop: '12px' }}>
            Belum ada ulasan untuk hardware ini. Jadilah yang pertama memberikan ulasan!
          </p>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        title="Hapus Hardware"
        message={`Apakah Anda yakin ingin menghapus "${gun.name}" secara permanen?`}
        confirmLabel="Hapus Permanen"
        danger
        loading={deleting}
        onConfirm={handleDeletePermanent}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}
