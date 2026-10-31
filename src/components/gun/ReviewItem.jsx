import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react'
import { useUpdateReview, useDeleteReview, useVoteReview } from '../../hooks/useReviews'
import { getUserIdentifier } from '../../services/userService'
import { Button } from '../ui'
import { formatDistanceToNow } from 'date-fns'

/**
 * Individual review item with vote and edit/delete for owner.
 */
export default function ReviewItem({ review, gunId, onReviewChange }) {
  const userId = getUserIdentifier()
  const isOwner = review.user_id === userId || review.user_identifier === userId

  const { updateReview } = useUpdateReview()
  const { deleteReview } = useDeleteReview()
  const { voteReview } = useVoteReview()

  const [isEditing, setIsEditing] = useState(false)
  const [editRating, setEditRating] = useState(review.rating)
  const [editComment, setEditComment] = useState(review.comment || '')

  const userVote = review.user_votes?.[userId]
  const upvotes = review.upvotes || 0
  const downvotes = review.downvotes || 0

  const handleVote = async (vote) => {
    await voteReview({ reviewId: review.id, gunId, vote })
    onReviewChange?.()
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    await updateReview({ reviewId: review.id, reviewData: { rating: editRating, comment: editComment }, gunId })
    setIsEditing(false)
    onReviewChange?.()
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this review?')) return
    await deleteReview({ reviewId: review.id, gunId })
    onReviewChange?.()
  }

  if (isEditing) {
    return (
      <li className="review-item review-item--editing">
        <form onSubmit={handleUpdate} className="review-edit-form">
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setEditRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
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
            placeholder="Edit your review…"
          />
          <div className="review-edit-actions">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save
            </Button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="review-item">
      <div className="review-head">
        <span className="review-user">{review.user_identifier || 'Anonymous'}</span>
        <div className="review-meta">
          <span className="review-stars-display">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < review.rating ? 'var(--brass)' : 'none'}
                stroke={i < review.rating ? 'var(--brass)' : 'var(--line)'}
              />
            ))}
          </span>
          {review.created_at && (
            <time className="review-time" dateTime={review.created_at}>
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </time>
          )}
        </div>
      </div>

      {review.comment && <p className="review-comment">{review.comment}</p>}

      <div className="review-votes">
        <Button
          variant="ghost"
          size="icon"
          className={userVote === 'up' ? 'voted-up' : ''}
          onClick={() => handleVote('up')}
          aria-label={userVote === 'up' ? 'Remove upvote' : 'Upvote'}
          title={userVote === 'up' ? 'Remove upvote' : 'Upvote'}
        >
          <ThumbsUp size={16} fill={userVote === 'up' ? 'var(--brass)' : 'none'} stroke={userVote === 'up' ? 'var(--brass)' : 'var(--steel)'} />
          <span className="vote-count">{upvotes}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={userVote === 'down' ? 'voted-down' : ''}
          onClick={() => handleVote('down')}
          aria-label={userVote === 'down' ? 'Remove downvote' : 'Downvote'}
          title={userVote === 'down' ? 'Remove downvote' : 'Downvote'}
        >
          <ThumbsDown size={16} fill={userVote === 'down' ? '#c0392b' : 'none'} stroke={userVote === 'down' ? '#c0392b' : 'var(--steel)'} />
          <span className="vote-count">{downvotes}</span>
        </Button>

        {isOwner && (
          <div className="review-owner-actions">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} title="Edit">
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete" className="text-red-600">
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </li>
  )
}