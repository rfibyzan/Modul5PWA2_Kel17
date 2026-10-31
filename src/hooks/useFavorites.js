import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import favoriteService from '../services/favoriteService'
import { getUserIdentifier } from '../services/userService'
import { queryKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// localStorage fallback — used when the backend is unavailable so that
// favourites are still fully functional offline.
// ---------------------------------------------------------------------------

const LOCAL_KEY = 'bore_barrel_favorites'

const readLocalFavs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeLocalFavs = (ids) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
  } catch {
    /* quota exceeded — silently fail */
  }
}

// ---------------------------------------------------------------------------
// useFavorites — list all favourited product IDs.
// Uses TanStack Query with fallback to localStorage.
// ---------------------------------------------------------------------------

export function useFavorites() {
  const userIdentifier = getUserIdentifier()
  const queryKey = queryKeys.favorites(userIdentifier)

  const { data, isLoading, error, refetch, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await favoriteService.getFavorites(userIdentifier)
        if (response.success) {
          return { data: response.data || [], isLocal: false }
        }
        throw new Error(response.message)
      } catch {
        // Fallback to localStorage
        return { data: readLocalFavs(), isLocal: true }
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return {
    favorites: data?.data || [],
    loading: isLoading,
    error: isError ? (error?.message || null) : null,
    isLocal: data?.isLocal ?? false,
    refetch,
  }
}

// ---------------------------------------------------------------------------
// useToggleFavorite — toggle a product in/out of favourites.
// Optimistic update with TanStack Query.
// ---------------------------------------------------------------------------

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const userIdentifier = getUserIdentifier()
  const queryKey = queryKeys.favorites(userIdentifier)

  const mutation = useMutation({
    mutationFn: async (gunId) => {
      try {
        const response = await favoriteService.toggleFavorite({
          recipe_id: gunId,
          user_identifier: userIdentifier,
        })
        if (response.success) return response.data
        throw new Error(response.message)
      } catch {
        // Fallback: toggle in localStorage
        const current = readLocalFavs()
        const idx = current.findIndex((id) => String(id) === String(gunId))
        let isFavorited
        if (idx === -1) {
          current.push(gunId)
          isFavorited = true
        } else {
          current.splice(idx, 1)
          isFavorited = false
        }
        writeLocalFavs(current)
        return { is_favorited: isFavorited }
      }
    },
    onMutate: async (gunId) => {
      await queryClient.cancelQueries({ queryKey })

      const previousFavorites = queryClient.getQueryData(queryKey)

      // Optimistically toggle
      queryClient.setQueryData(queryKey, (old) => {
        if (!old?.data) return old
        const current = old.data
        const favId = gunId
        const idx = current.findIndex(f => {
          const id = typeof f === 'object' && f !== null ? (f.id ?? f.product_id ?? f.recipe_id) : f
          return String(id) === String(favId)
        })
        let newData
        if (idx === -1) {
          newData = [...current, { id: gunId, recipe_id: gunId }]
        } else {
          newData = current.filter((_, i) => i !== idx)
        }
        return { ...old, data: newData, isLocal: false }
      })

      return { previousFavorites }
    },
    onError: (err, gunId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKey, context.previousFavorites)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    ...mutation,
    toggleFavorite: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// useIsFavorited — convenience wrapper for a single product.
// ---------------------------------------------------------------------------

export function useIsFavorited(gunId) {
  const { favorites, loading: fetchLoading, refetch } = useFavorites()
  const { toggleFavorite, loading: toggleLoading } = useToggleFavorite()

  // Check both server-format (objects with .id) and local-format (plain ids)
  const isFavorited = favorites.some((fav) => {
    const favId = typeof fav === 'object' && fav !== null ? (fav.id ?? fav.product_id ?? fav.recipe_id) : fav
    return String(favId) === String(gunId)
  })

  const handleToggle = async () => {
    const result = await toggleFavorite(gunId)
    if (result) await refetch()
    return result
  }

  return {
    isFavorited,
    loading: fetchLoading || toggleLoading,
    toggleFavorite: handleToggle,
  }
}

export { getUserIdentifier }