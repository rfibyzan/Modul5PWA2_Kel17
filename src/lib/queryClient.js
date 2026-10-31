import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Query keys factory
export const queryKeys = {
  guns: (params = {}) => ['guns', params],
  gunDetail: (id) => ['gun', id],
  favorites: (userId) => ['favorites', userId],
  reviews: (gunId, params = {}) => ['reviews', gunId, params],
  drafts: () => ['drafts'],
  archivedGuns: () => ['archivedGuns'],
  userProfile: (userId) => ['userProfile', userId],
  cart: () => ['cart'],
}