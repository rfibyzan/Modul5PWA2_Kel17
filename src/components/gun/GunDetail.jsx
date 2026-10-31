import { useState } from 'react'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  ShoppingCart,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from './ShareButton'
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, useVoteReview } from '../../hooks/useReviews'
import { useCart } from '../../context/CartContext'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'
import { Button, toast } from '../ui'

/**
 * Full-screen product detail view modal.
 */
export default function GunDetail({ gun, onBack, onEdit, onDelete }) {
  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  const { addItem } = useCart()
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const { updateReview } = useUpdateReview()
  const { deleteReview } = useDeleteReview()
  const { voteReview } = useVoteReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length
  const userId = getUserIdentifier()

  const handleAddToCart = () => {
    addItem(gun)
    toast.success('Keranjang', `${gun.name} ditambahkan ke keranjang.`)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating harus antara 1 dan 5.')
      return
    }

    try {
      const result = await createReview(gun.id, {
        user_identifier: userId,
        rating,
        comment: comment.trim(),
      })

      if (result) {
        setReviewSuccess('Review berhasil dikirim!')
        setComment('')
        setRating(5)
        refetchReviews()
      }
    } catch (err) {
      setReviewError(err.message || 'Gagal mengirim review.')
    }
  }

  const handleVote = async (reviewId, vote) => {
    try {
      await voteReview({ reviewId, gunId: gun.id, vote })
      refetchReviews()
    } catch {
      /* ignore */
    }
  }

  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault()
    try {
      await updateReview({
        reviewId,
        reviewData: { rating: editRating, comment: editComment.trim() },
        gunId: gun.id,
      })
      setEditingReviewId(null)
      refetchReviews()
    } catch {
      /* ignore */
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Hapus review ini?')) return
    try {
      await deleteReview({ reviewId, gunId: gun.id })
      refetchReviews()
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="detail">
      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      {/* Hero */}
      <div className="detail-hero">
        <img className="detail-img" src={imgSrc} alt={gun.name} />
        <div className="detail-info">
          <h1 className="display">{gun.name}</h1>
          <p className="type">
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price">{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating">
              <Star size={16} fill="var(--brass)" stroke="var(--brass)" />
              {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary" size="sm" onClick={handleAddToCart}>
              <ShoppingCart size={16} className="mr-1" /> Tambah ke Keranjang
            </Button>
            <FavoriteButton gunId={gun.id || gun.name} />
            <ShareButton gun={gun} />
            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                Delete
              </button>
            )}
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
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reviews Section */}
      <section className="detail-section">
        <h2>Reviews &amp; Ratings ({reviews.length})</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Tulis ulasan Anda…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
        </form>

        {/* Existing reviews */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => {
              const userVote = rev.user_votes?.[userId]
              const upvotes = rev.upvotes || 0
              const downvotes = rev.downvotes || 0
              const isOwner =
                rev.user_id === userId ||
                rev.user_identifier === userId ||
                !rev.user_id ||
                rev.user_identifier === 'Operator' ||
                String(rev.id).startsWith('local-')

              if (editingReviewId === rev.id) {
                return (
                  <li key={rev.id} className="review-item review-item--editing">
                    <form onSubmit={(e) => handleUpdateReview(e, rev.id)}>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className="star-btn"
                            onClick={() => setEditRating(n)}
                            aria-label={`${n} star`}
                          >
                            <Star
                              size={20}
                              fill={n <= editRating ? 'var(--brass)' : 'none'}
                              stroke={n <= editRating ? 'var(--brass)' : 'var(--steel)'}
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
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <Button type="submit" variant="primary" size="sm">
                          <Check size={14} /> Simpan
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEditingReviewId(null)}>
                          Batal
                        </Button>
                      </div>
                    </form>
                  </li>
                )
              }

              return (
                <li key={rev.id} className="review-item">
                  <div className="review-head">
                    <span className="review-user">{rev.user_identifier || 'Operator'}</span>
                    <span className="review-stars-display">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? 'var(--brass)' : 'none'}
                          stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                        />
                      ))}
                    </span>
                  </div>
                  {rev.comment && <p className="review-comment">{rev.comment}</p>}

                  <div className="review-votes" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                    <Button
                      variant={userVote === 'up' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote(rev.id, 'up')}
                      title="Thumbs Up"
                    >
                      <ThumbsUp size={14} /> {upvotes}
                    </Button>
                    <Button
                      variant={userVote === 'down' ? 'danger' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote(rev.id, 'down')}
                      title="Thumbs Down"
                    >
                      <ThumbsDown size={14} /> {downvotes}
                    </Button>

                    {isOwner && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingReviewId(rev.id)
                            setEditRating(rev.rating)
                            setEditComment(rev.comment || '')
                          }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete"
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
          <p className="detail-empty">Belum ada review. Jadilah yang pertama!</p>
        )}
      </section>
    </div>
  )
}
