import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import reviewService from '../services/reviewService'
import { getUserIdentifier } from '../services/userService'
import { queryKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// useReviews — fetch reviews for a specific product.
// ---------------------------------------------------------------------------

export function useReviews(gunId, params = {}) {
  const queryKey = queryKeys.reviews(gunId, params)

  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey,
    queryFn: () => reviewService.getReviews(gunId),
    enabled: !!gunId,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  return {
    reviews: data?.data || [],
    loading: isLoading,
    error: isError ? (error?.message || 'Failed to fetch reviews.') : null,
    refetch,
  }
}

// ---------------------------------------------------------------------------
// useCreateReview — submit a new review for a product.
// ---------------------------------------------------------------------------

export function useCreateReview() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ gunId, reviewData }) => reviewService.createReview(gunId, reviewData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.gunId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.gunDetail(variables.gunId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
    },
  })

  const createReview = async (gunIdOrObj, maybeReviewData) => {
    let gunId, reviewData
    if (typeof gunIdOrObj === 'object' && gunIdOrObj !== null && 'gunId' in gunIdOrObj) {
      gunId = gunIdOrObj.gunId
      reviewData = gunIdOrObj.reviewData
    } else {
      gunId = gunIdOrObj
      reviewData = maybeReviewData
    }
    return mutation.mutateAsync({ gunId, reviewData })
  }

  return {
    ...mutation,
    createReview,
    loading: mutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// useUpdateReview — update an existing review.
// ---------------------------------------------------------------------------

export function useUpdateReview() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ reviewId, reviewData }) => reviewService.updateReview(reviewId, reviewData),
    onSuccess: (_, variables) => {
      if (variables.gunId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.gunId) })
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] })
      }
    },
  })

  const updateReview = async (reviewIdOrObj, maybeReviewData, maybeGunId) => {
    let reviewId, reviewData, gunId
    if (typeof reviewIdOrObj === 'object' && reviewIdOrObj !== null && 'reviewId' in reviewIdOrObj) {
      reviewId = reviewIdOrObj.reviewId
      reviewData = reviewIdOrObj.reviewData
      gunId = reviewIdOrObj.gunId
    } else {
      reviewId = reviewIdOrObj
      reviewData = maybeReviewData
      gunId = maybeGunId
    }
    return mutation.mutateAsync({ reviewId, reviewData, gunId })
  }

  return {
    ...mutation,
    updateReview,
    loading: mutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// useDeleteReview — delete a review.
// ---------------------------------------------------------------------------

export function useDeleteReview() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ reviewId }) => reviewService.deleteReview(reviewId),
    onSuccess: (_, variables) => {
      if (variables.gunId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.gunId) })
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] })
      }
    },
  })

  const deleteReview = async (reviewIdOrObj, maybeGunId) => {
    let reviewId, gunId
    if (typeof reviewIdOrObj === 'object' && reviewIdOrObj !== null && 'reviewId' in reviewIdOrObj) {
      reviewId = reviewIdOrObj.reviewId
      gunId = reviewIdOrObj.gunId
    } else {
      reviewId = reviewIdOrObj
      gunId = maybeGunId
    }
    return mutation.mutateAsync({ reviewId, gunId })
  }

  return {
    ...mutation,
    deleteReview,
    loading: mutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// useVoteReview — upvote/downvote a review.
// ---------------------------------------------------------------------------

export function useVoteReview() {
  const queryClient = useQueryClient()
  const userId = getUserIdentifier()

  const mutation = useMutation({
    mutationFn: ({ reviewId, vote }) => reviewService.voteReview(reviewId, vote, userId),
    onSuccess: (_, variables) => {
      if (variables.gunId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews(variables.gunId) })
      } else {
        queryClient.invalidateQueries({ queryKey: ['reviews'] })
      }
    },
  })

  const voteReview = async (reviewIdOrObj, maybeVote, maybeGunId) => {
    let reviewId, vote, gunId
    if (typeof reviewIdOrObj === 'object' && reviewIdOrObj !== null && 'reviewId' in reviewIdOrObj) {
      reviewId = reviewIdOrObj.reviewId
      vote = reviewIdOrObj.vote
      gunId = reviewIdOrObj.gunId
    } else {
      reviewId = reviewIdOrObj
      vote = maybeVote
      gunId = maybeGunId
    }
    return mutation.mutateAsync({ reviewId, vote, gunId })
  }

  return {
    ...mutation,
    voteReview,
    loading: mutation.isPending,
  }
}

export { getUserIdentifier }
