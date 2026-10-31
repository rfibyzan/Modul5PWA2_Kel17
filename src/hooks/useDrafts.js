import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback, useRef } from 'react'
import { queryKeys } from '../lib/queryClient'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  getAllDraftIds,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'

// ---------------------------------------------------------------------------
// useDrafts — manage form drafts in localStorage with TanStack Query
// ---------------------------------------------------------------------------

export function useDrafts() {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.drafts(),
    queryFn: () => {
      const draftIds = getAllDraftIds()
      return draftIds.map(id => {
        const draft = loadDraft(id)
        const timestamp = getDraftTimestamp(id)
        return {
          id,
          ...draft,
          savedAt: timestamp,
          timeAgo: formatDraftTime(timestamp),
          isCreate: id === 'create',
        }
      }).filter(Boolean)
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 60 * 1000,
  })

  const saveDraftMutation = useMutation({
    mutationFn: ({ draftData, draftId }) => saveDraft(draftData, draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts() })
    },
  })

  const loadDraftMutation = useMutation({
    mutationFn: (draftId) => loadDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts() })
    },
  })

  const deleteDraftMutation = useMutation({
    mutationFn: (draftId) => deleteDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts() })
    },
  })

  return {
    drafts: data || [],
    loading: isLoading,
    refetch,
    saveDraft: saveDraftMutation.mutateAsync,
    loadDraft: loadDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
  }
}

// ---------------------------------------------------------------------------
// useAutoSaveDraft — auto-save draft on form changes with debounce
// ---------------------------------------------------------------------------

export function useAutoSaveDraft(draftId, getFormData, options = {}) {
  const { debounceMs = 1000, enabled = true, onSave } = options
  const timeoutRef = useRef(null)
  const { saveDraft } = useDrafts()

  const save = useCallback(async (notify = false) => {
    const draftData = getFormData()
    if (!draftData) return
    try {
      await saveDraft({ draftData, draftId })
      if (notify && onSave) onSave()
    } catch (err) {
      console.warn('Auto-save failed:', err)
    }
  }, [draftId, getFormData, saveDraft, onSave])

  // Debounced auto-save
  useEffect(() => {
    if (!enabled) return
    const handleChange = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => save(false), debounceMs)
    }
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener('storage', handleChange)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [enabled, debounceMs, save])

  // Manual save
  const manualSave = useCallback(() => save(true), [save])

  return { save: manualSave, autoSave: save }
}