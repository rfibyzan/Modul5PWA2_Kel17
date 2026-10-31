import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import gunService from '../services/gunService'
import { queryKeys } from '../lib/queryClient'
import { toast } from '../components/ui'

// ---------------------------------------------------------------------------
// useArchivedGuns — fetch archived (soft-deleted) products
// ---------------------------------------------------------------------------

export function useArchivedGuns(params = {}) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.archivedGuns(params),
    queryFn: () => gunService.getArchivedGuns(params),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  return {
    guns: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    pagination: data?.pagination || null,
    refetch,
    isFetching,
  }
}

// ---------------------------------------------------------------------------
// useArchiveGun — soft delete / archive a product
// ---------------------------------------------------------------------------

export function useArchiveGun() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (gunOrId) => {
      return gunService.archiveGun(gunOrId)
    },
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedGuns() })
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
      const gunName = variables?.name || 'Item'
      toast.success('Berhasil Diarsipkan', `${gunName} telah dipindahkan ke arsip.`)
    },
    onError: (err) => {
      toast.error('Gagal Mengarsipkan', err.message || 'Terjadi kesalahan saat mengarsipkan.')
    },
  })

  return {
    ...mutation,
    archiveGun: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}

// ---------------------------------------------------------------------------
// useRestoreGun — restore an archived product
// ---------------------------------------------------------------------------

export function useRestoreGun() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id) => {
      return gunService.restoreGun(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.archivedGuns() })
      queryClient.invalidateQueries({ queryKey: queryKeys.guns() })
      toast.success('Berhasil Dipulihkan', 'Item telah dikembalikan ke katalog.')
    },
    onError: (err) => {
      toast.error('Gagal Memulihkan', err.message || 'Terjadi kesalahan saat memulihkan.')
    },
  })

  return {
    ...mutation,
    restoreGun: mutation.mutateAsync,
    loading: mutation.isPending,
  }
}
