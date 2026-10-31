import { apiClient, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// ReviewService — product reviews & ratings with voting support.
// Stores upvotes/downvotes locally and syncs with backend when available.
// ---------------------------------------------------------------------------

const REVIEW_VOTES_KEY = 'bore_barrel_review_votes'
const LOCAL_REVIEWS_KEY = 'bore_barrel_local_reviews'

const getStoredVotes = () => {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_VOTES_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveStoredVotes = (votes) => {
  try {
    localStorage.setItem(REVIEW_VOTES_KEY, JSON.stringify(votes))
  } catch {
    /* ignore */
  }
}

const getLocalReviews = (gunId) => {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_REVIEWS_KEY) || '[]')
    return gunId ? all.filter((r) => String(r.product_id) === String(gunId)) : all
  } catch {
    return []
  }
}

const saveLocalReview = (review) => {
  try {
    const all = getLocalReviews()
    const updated = [review, ...all.filter((r) => String(r.id) !== String(review.id))]
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(updated))
  } catch {
    /* ignore */
  }
}

const deleteLocalReview = (reviewId) => {
  try {
    const all = getLocalReviews()
    const updated = all.filter((r) => String(r.id) !== String(reviewId))
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(updated))
  } catch {
    /* ignore */
  }
}

class ReviewService {
  /**
   * Fetch all reviews for a given product.
   */
  async getReviews(gunId) {
    let list = []

    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get(
          `/rest/v1/reviews?product_id=eq.${gunId}&select=*&order=created_at.desc`,
        )
        if (Array.isArray(data)) {
          list = data.map((r) => ({
            id: r.id,
            product_id: r.product_id,
            user_identifier: r.user_id ? `Operator ${String(r.user_id).substring(0, 8)}` : 'Anonymous',
            user_id: r.user_id,
            rating: Number(r.rating || 5),
            comment: r.comment || '',
            created_at: r.created_at,
          }))
        }
      } catch (err) {
        console.warn('Failed to fetch reviews from Supabase, using local fallback:', err)
      }
    } else {
      try {
        const res = await apiClient.get(`/api/v1/recipes/${gunId}/reviews`)
        list = Array.isArray(res?.data) ? res.data : []
      } catch (err) {
        console.warn('Failed to fetch reviews from API, using local fallback:', err)
      }
    }

    // Merge with any offline / local reviews
    const local = getLocalReviews(gunId)
    const combined = [...local, ...list]
    const seen = new Set()
    const unique = []
    for (const r of combined) {
      if (!seen.has(String(r.id))) {
        seen.add(String(r.id))
        unique.push(r)
      }
    }

    // Attach upvotes / downvotes from storage
    const allVotes = getStoredVotes()
    const enriched = unique.map((r) => {
      const v = allVotes[r.id] || { upvotes: 0, downvotes: 0, userVotes: {} }
      return {
        ...r,
        upvotes: v.upvotes || 0,
        downvotes: v.downvotes || 0,
        user_votes: v.userVotes || {},
      }
    })

    return { success: true, data: enriched }
  }

  /**
   * Submit a new review.
   */
  async createReview(gunId, reviewData) {
    const localReview = {
      id: `local-rev-${Date.now()}`,
      product_id: gunId,
      user_id: reviewData.user_id || reviewData.user_identifier,
      user_identifier: reviewData.user_identifier || 'Operator',
      rating: Number(reviewData.rating),
      comment: reviewData.comment || '',
      created_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      user_votes: {},
    }

    if (IS_SUPABASE) {
      try {
        const payload = {
          product_id: Number(gunId) || gunId,
          user_id: reviewData.user_id || reviewData.user_identifier,
          rating: Number(reviewData.rating),
          comment: reviewData.comment || '',
        }
        const res = await apiClient.post('/rest/v1/reviews', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const created = Array.isArray(res) ? res[0] : res
        return { success: true, data: created }
      } catch (err) {
        console.warn('Supabase createReview failed, saving to local store:', err)
        saveLocalReview(localReview)
        return { success: true, data: localReview }
      }
    }

    try {
      const res = await apiClient.post(`/api/v1/recipes/${gunId}/reviews`, reviewData)
      return { success: true, data: res?.data || localReview }
    } catch {
      saveLocalReview(localReview)
      return { success: true, data: localReview }
    }
  }

  /**
   * Edit an existing review.
   */
  async updateReview(reviewId, reviewData) {
    if (IS_SUPABASE) {
      try {
        const res = await apiClient.patch(
          `/rest/v1/reviews?id=eq.${reviewId}`,
          {
            rating: Number(reviewData.rating),
            comment: reviewData.comment,
          },
          { headers: { Prefer: 'return=representation' } },
        )
        return { success: true, data: Array.isArray(res) ? res[0] : res }
      } catch (err) {
        console.warn('Supabase updateReview failed, updating locally:', err)
      }
    }

    // Update in local store
    const local = getLocalReviews()
    const found = local.find((r) => String(r.id) === String(reviewId))
    if (found) {
      found.rating = Number(reviewData.rating)
      found.comment = reviewData.comment
      saveLocalReview(found)
    }

    return { success: true, data: { id: reviewId, ...reviewData } }
  }

  /**
   * Delete a review.
   */
  async deleteReview(reviewId) {
    deleteLocalReview(reviewId)

    if (IS_SUPABASE) {
      try {
        await apiClient.delete(`/rest/v1/reviews?id=eq.${reviewId}`)
      } catch (err) {
        console.warn('Supabase deleteReview failed:', err)
      }
      return { success: true }
    }

    try {
      await apiClient.delete(`/api/v1/reviews/${reviewId}`)
    } catch (err) {
      console.warn('API deleteReview failed:', err)
    }
    return { success: true }
  }

  /**
   * Vote on a review (upvote/downvote).
   */
  async voteReview(reviewId, vote, customUserId) {
    if (!['up', 'down'].includes(vote)) {
      throw new Error('Vote must be "up" or "down"')
    }

    const allVotes = getStoredVotes()
    const v = allVotes[reviewId] || { upvotes: 0, downvotes: 0, userVotes: {} }
    const userId = customUserId || 'current-operator'
    const prevVote = v.userVotes[userId]

    let up = v.upvotes || 0
    let down = v.downvotes || 0

    if (prevVote === vote) {
      // Toggle off
      delete v.userVotes[userId]
      if (vote === 'up') up = Math.max(0, up - 1)
      if (vote === 'down') down = Math.max(0, down - 1)
    } else {
      if (prevVote === 'up') up = Math.max(0, up - 1)
      if (prevVote === 'down') down = Math.max(0, down - 1)
      v.userVotes[userId] = vote
      if (vote === 'up') up += 1
      if (vote === 'down') down += 1
    }

    v.upvotes = up
    v.downvotes = down
    allVotes[reviewId] = v
    saveStoredVotes(allVotes)

    return { success: true, data: v }
  }
}

export default new ReviewService()
