import { useState } from 'react'
import { Star, Send, Loader } from 'lucide-react'
import { useCreateReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { Button } from '../ui'

/**
 * Review submission form.
 */
export default function ReviewForm({ gunId, onReviewSubmit }) {
  const { createReview, loading } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5.')
      return
    }

    const result = await createReview({ gunId, reviewData: {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim(),
    }})

    if (result) {
      setComment('')
      setRating(5)
      onReviewSubmit?.()
    } else {
      setError('Could not submit review. The server may be unavailable.')
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
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
        placeholder="Write a short review (optional)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={loading || !gunId}
      >
        {loading ? (
          <>
            <Loader size={16} className="spin" /> Submitting…
          </>
        ) : (
          <>
            <Send size={16} /> Submit Review
          </>
        )}
      </Button>

      {error && <p className="form-error">{error}</p>}
      {!gunId && (
        <p className="form-hint">
          Reviews require a server-generated product ID. This product is local-only.
        </p>
      )}
    </form>
  )
}