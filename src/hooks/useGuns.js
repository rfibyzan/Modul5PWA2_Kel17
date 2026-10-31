import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import gunService from '../services/gunService'
import { queryKeys } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// useGuns — fetch the paginated / filtered product list from the API.
// Uses TanStack Query for caching, deduplication, and background refetch.
// ---------------------------------------------------------------------------

export function useGuns(params = {}) {
  const queryKey = queryKeys.guns(params)

  const { data, isLoading, error, refetch, isError, isFetching } = useQuery({
    queryKey,
    queryFn: () => gunService.getGuns(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData, // keep old data while fetching
  })

  return {
    guns: data?.data || [],
    loading: isLoading,
    error: isError ? (error?.message || 'Failed to fetch products.') : null,
    pagination: data?.pagination || null,
    refetch,
    isFetching,
  }
}

// ---------------------------------------------------------------------------
// useInfiniteGuns — infinite scroll version for catalog
// ---------------------------------------------------------------------------

export function useInfiniteGuns(baseParams = {}) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useQuery({
    queryKey: queryKeys.guns({ ...baseParams, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...baseParams, page: pageParam, limit: baseParams.limit || 20 }
      return gunService.getGuns(params)
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination) return undefined
      const { page, limit, total } = lastPage.pagination
      if (page * limit >= total) return undefined
      return page + 1
    },
    initialPageParam: 1,
  })

  const guns = data?.pages.flatMap(page => page.data) || []

  return {
    guns,
    loading: isLoading,
    error: error?.message || null,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  }
}

// ---------------------------------------------------------------------------
// useGunDetail — fetch a single product by its UUID.
// ---------------------------------------------------------------------------

export function useGunDetail(id) {
  const queryKey = queryKeys.gunDetail(id)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => gunService.getGunById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  })

  return {
    gun: data?.data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  }
}

// ---------------------------------------------------------------------------
// useCreateGun — create a new product with optimistic updates
// ---------------------------------------------------------------------------

export function useCreateGun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => gunService.createGun(data),
    onMutate: async (newGun) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.guns() })

      // Snapshot previous value
      const previousGuns = queryClient.getQueryData(queryKeys.guns())

      // Optimistically add to the list
      queryClient.setQueryData(queryKeys.guns(), (old) => {
        if (!old) return old
        const optimisticGun = {
          ...newGun,
          id: `optimistic-${Date.now()}`,
          created_at: new Date().toISOString(),
        }
        return {
          ...old,
          data: [optimisticGun, ...(old.data || [])],
          pagination: old.pagination ? { ...old.pagination, total: old.pagination.total + 1 } : null,
        }
      })

      return { previousGuns }
    },
    onError: (err, newGun, context) => {
      if (context?.previousGuns) {
        queryClient.setQueryData(queryKeys.guns(), context.previousGuns)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
    },
  })
}

// ---------------------------------------------------------------------------
// useUpdateGun — update an existing product
// ---------------------------------------------------------------------------

export function useUpdateGun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => gunService.updateGun(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.guns() })
      await queryClient.cancelQueries({ queryKey: queryKeys.gunDetail(id) })

      const previousGuns = queryClient.getQueryData(queryKeys.guns())
      const previousDetail = queryClient.getQueryData(queryKeys.gunDetail(id))

      // Optimistically update in list
      queryClient.setQueryData(queryKeys.guns(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map(gun => gun.id === id ? { ...gun, ...data, updated_at: new Date().toISOString() } : gun),
        }
      })

      // Optimistically update in detail
      queryClient.setQueryData(queryKeys.gunDetail(id), (old) => {
        if (!old) return old
        return { ...old, data: { ...old.data, ...data, updated_at: new Date().toISOString() } }
      })

      return { previousGuns, previousDetail }
    },
    onError: (err, variables, context) => {
      if (context?.previousGuns) {
        queryClient.setQueryData(queryKeys.guns(), context.previousGuns)
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(queryKeys.gunDetail(variables.id), context.previousDetail)
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
      queryClient.invalidateQueries({ queryKey: queryKeys.gunDetail(variables.id) })
    },
  })
}

// ---------------------------------------------------------------------------
// useDeleteGun — delete a product (hard delete)
// ---------------------------------------------------------------------------

export function useDeleteGun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => gunService.deleteGun(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.guns() })

      const previousGuns = queryClient.getQueryData(queryKeys.guns())

      queryClient.setQueryData(queryKeys.guns(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter(gun => gun.id !== id),
          pagination: old.pagination ? { ...old.pagination, total: old.pagination.total - 1 } : null,
        }
      })

      return { previousGuns }
    },
    onError: (err, id, context) => {
      if (context?.previousGuns) {
        queryClient.setQueryData(queryKeys.guns(), context.previousGuns)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
    },
  })
}

// ---------------------------------------------------------------------------
// useArchiveGun — soft delete (archive) a product
// ---------------------------------------------------------------------------

export function useArchiveGun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => gunService.archiveGun(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.guns() })
      await queryClient.cancelQueries({ queryKey: queryKeys.gunDetail(id) })
      await queryClient.cancelQueries({ queryKey: queryKeys.archivedGuns() })

      const previousGuns = queryClient.getQueryData(queryKeys.guns())
      const previousDetail = queryClient.getQueryData(queryKeys.gunDetail(id))
      const previousArchived = queryClient.getQueryData(queryKeys.archivedGuns())

      // Move from active to archived optimistically
      queryClient.setQueryData(queryKeys.guns(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter(g => g.id !== id),
          pagination: old.pagination ? { ...old.pagination, total: old.pagination.total - 1 } : null,
        }
      })

      // Add to archived list
      if (previousArchived?.data && previousDetail?.data) {
        queryClient.setQueryData(queryKeys.archivedGuns(), (old) => ({
          ...old,
          data: [previousDetail.data, ...(old?.data || [])],
        }))
      }

      return { previousGuns, previousDetail, previousArchived }
    },
    onError: (err, id, context) => {
      if (context?.previousGuns) queryClient.setQueryData(queryKeys.guns(), context.previousGuns)
      if (context?.previousDetail) queryClient.setQueryData(queryKeys.gunDetail(id), context.previousDetail)
      if (context?.previousArchived) queryClient.setQueryData(queryKeys.archivedGuns(), context.previousArchived)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedGuns() })
    },
  })
}

// ---------------------------------------------------------------------------
// useRestoreGun — restore an archived product
// ---------------------------------------------------------------------------

export function useRestoreGun() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => gunService.restoreGun(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.guns() })
      await queryClient.cancelQueries({ queryKey: queryKeys.archivedGuns() })
      await queryClient.cancelQueries({ queryKey: queryKeys.gunDetail(id) })

      const previousGuns = queryClient.getQueryData(queryKeys.guns())
      const previousArchived = queryClient.getQueryData(queryKeys.archivedGuns())
      const previousDetail = queryClient.getQueryData(queryKeys.gunDetail(id))

      // Move from archived to active
      queryClient.setQueryData(queryKeys.archivedGuns(), (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter(g => g.id !== id),
        }
      })

      if (previousDetail?.data) {
        queryClient.setQueryData(queryKeys.guns(), (old) => ({
          ...old,
          data: [previousDetail.data, ...(old?.data || [])],
          pagination: old.pagination ? { ...old.pagination, total: old.pagination.total + 1 } : null,
        }))
      }

      return { previousGuns, previousArchived, previousDetail }
    },
    onError: (err, id, context) => {
      if (context?.previousGuns) queryClient.setQueryData(queryKeys.guns(), context.previousGuns)
      if (context?.previousArchived) queryClient.setQueryData(queryKeys.archivedGuns(), context.previousArchived)
      if (context?.previousDetail) queryClient.setQueryData(queryKeys.gunDetail(id), context.previousDetail)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedGuns() })
    },
  })
}