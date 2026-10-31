import ReviewItem from './ReviewItem'
import ReviewForm from './ReviewForm'
import { useReviews } from '../../hooks/useReviews'

/**
 * Review list with submission form.
 */
export default function ReviewList({ gunId }) {
  const { reviews, loading, error, refetch } = useReviews(gunId)

  const handleReviewChange = () => refetch()

  if (loading) {
    return <p className="detail-loading">Loading reviews…</p>
  }

  if (error) {
    return <p className="detail-error">Failed to load reviews: {error}</p>
  }

  return (
    <section className="detail-section">
      <h2>Reviews</h2>

      {/* Submit review */}
      <ReviewForm gunId={gunId} onReviewSubmit={handleReviewChange} />

      {/* Existing reviews */}
      {reviews.length > 0 ? (
        <ul className="review-list">
          {reviews.map((rev) => (
            <ReviewItem
              key={rev.id}
              review={rev}
              gunId={gunId}
              onReviewChange={handleReviewChange}
            />
          ))}
        </ul>
      ) : (
        <p className="detail-empty">No reviews yet. Be the first!</p>
      )}
    </section>
  )
}