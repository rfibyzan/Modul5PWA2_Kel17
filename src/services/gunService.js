import { apiClient, IS_SUPABASE } from '../config/api'
import GUNS_LOCAL from '../data/guns'
import {
  getArchivedGunsFromStorage,
  archiveGunToStorage,
  restoreGunFromStorage,
  permanentlyDeleteFromStorage,
} from '../utils/archiveStorage'

// ---------------------------------------------------------------------------
// Normalizer — standardizes product shape whether received from Supabase
// (public.products) or from the university API (/api/v1/recipes).
// ---------------------------------------------------------------------------
export const normalizeProduct = (item) => {
  if (!item) return null

  // Resolve specifications from Supabase `specs` (text array) or API `ingredients`
  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: `spec-${idx}`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return {
          id: `spec-${idx}`,
          name: 'Specification',
          quantity: s.trim(),
        }
      }
      return s
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }

  // Resolve steps
  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : ['Verify firearm is completely unloaded and point in safe direction.', 'Inspect receiver and mechanism for maintenance.']

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: item.image_url || item.image || '/guns/pistol.svg',
    image: item.image_url || item.image || '/guns/pistol.svg',
    ingredients: specsList,
    steps: stepsList,
    deleted_at: item.deleted_at ?? null,
  }
}

// ---------------------------------------------------------------------------
// GunService — wraps backend CRUD endpoints.
// Supports both Supabase PostgREST table (/rest/v1/products) and
// standard REST API (/api/v1/recipes).
// ---------------------------------------------------------------------------
class GunService {
  /**
   * Fetch a paginated, filterable list of products.
   */
  async getGuns(params = {}) {
    if (IS_SUPABASE) {
      const queryParts = ['select=*']

      // Database doesn't have deleted_at column - show all products
      // if (!params.includeArchived) {
      //   queryParts.push('deleted_at=is.null')
      // }

      if (params.search) {
        queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
      }

      if (params.category && params.category !== 'All') {
        queryParts.push(`type=eq.${encodeURIComponent(params.category)}`)
      }

      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(`order=${encodeURIComponent(params.sort_by)}.${order}`)
      } else {
        queryParts.push('order=created_at.desc')
      }

      if (params.limit) {
        queryParts.push(`limit=${params.limit}`)
      }

      if (params.page) {
        const offset = (params.page - 1) * (params.limit || 50)
        queryParts.push(`offset=${offset}`)
      }

      const queryString = queryParts.join('&')
      const data = await apiClient.get(`/rest/v1/products?${queryString}`)
      const list = Array.isArray(data) ? data.map(normalizeProduct) : []

      return {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
    }

    // Fallback: university REST API
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    )
    return apiClient.get('/api/v1/recipes', { params: clean })
  }

  /**
   * Fetch archived (soft-deleted) products.
   */
  async getArchivedGuns(params = {}) {
    const localArchived = getArchivedGunsFromStorage()
    return {
      success: true,
      data: localArchived,
      pagination: { total: localArchived.length, page: 1, limit: params.limit || 50 }
    }
  }

  /**
   * Fetch a single product by ID.
   */
  async getGunById(id) {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get(`/rest/v1/products?id=eq.${id}&select=*`)
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: normalizeProduct(data[0]) }
        }
      } catch {
        // Fallback below
      }
    } else {
      try {
        const data = await apiClient.get(`/api/v1/recipes/${id}`)
        if (data) return { success: true, data: normalizeProduct(data.data || data) }
      } catch {
        // Fallback below
      }
    }

    // Check archived guns
    const archived = getArchivedGunsFromStorage().find((g) => String(g.id) === String(id) || g.name === id)
    if (archived) return { success: true, data: archived }

    // Fallback to local catalog
    const local = GUNS_LOCAL.find((g, idx) => String(g.id || `local-${idx}`) === String(id) || g.name === id)
    if (local) {
      return { success: true, data: { ...local, id: local.id || id } }
    }

    throw new Error('Hardware item not found.')
  }

  /**
   * Create a new product.
   */
  async createGun(data) {
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => `${i.name}: ${i.quantity}`)
        : Array.isArray(data.specs)
        ? data.specs
        : []

      const payload = {
        name: data.name,
        type: data.type || (data.category === 'minuman' ? 'Rifle' : 'Pistol'),
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? data.cook_time ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: data.image_url || null,
        deleted_at: null,
      }

      const res = await apiClient.post('/rest/v1/products', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(created) }
    }
    return apiClient.post('/api/v1/recipes', data)
  }

  /**
   * Update existing product.
   */
  async updateGun(id, data) {
    if (IS_SUPABASE) {
      const specsArray = Array.isArray(data.ingredients)
        ? data.ingredients.map((i) => `${i.name}: ${i.quantity}`)
        : Array.isArray(data.specs)
        ? data.specs
        : undefined

      const payload = {
        updated_at: new Date().toISOString(),
      }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined || data.cook_time !== undefined) {
        payload.price = Number(data.price ?? data.cook_time ?? 0)
      }
      if (data.description !== undefined) payload.description = data.description
      if (specsArray !== undefined) payload.specs = specsArray
      if (data.image_url !== undefined) payload.image_url = data.image_url

      const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeProduct(updated) }
    }
    return apiClient.put(`/api/v1/recipes/${id}`, data)
  }

  /**
   * Partial update (PATCH).
   */
  async patchGun(id, data) {
    if (IS_SUPABASE) {
      return this.updateGun(id, data)
    }
    return apiClient.patch(`/api/v1/recipes/${id}`, data)
  }

  /**
   * Soft delete (archive) a product.
   */
  async archiveGun(gunOrId) {
    let gun = gunOrId
    if (typeof gunOrId === 'string' || typeof gunOrId === 'number') {
      try {
        const fetched = await this.getGunById(gunOrId)
        gun = fetched.data
      } catch {
        gun = { id: gunOrId, name: `Item ${gunOrId}` }
      }
    }
    const archived = archiveGunToStorage(gun)
    return { success: true, data: archived }
  }

  /**
   * Restore an archived product.
   */
  async restoreGun(id) {
    const restored = restoreGunFromStorage(id)
    return { success: true, data: restored }
  }

  /**
   * Hard delete a product (permanent).
   */
  async deleteGun(id) {
    permanentlyDeleteFromStorage(id)
    if (IS_SUPABASE) {
      try {
        await apiClient.delete(`/rest/v1/products?id=eq.${id}`)
      } catch {
        // Ignored if offline
      }
      return { success: true }
    }
    try {
      await apiClient.delete(`/api/v1/recipes/${id}`)
    } catch {
      // Ignored if offline
    }
    return { success: true }
  }
}

export default new GunService()