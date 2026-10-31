// ---------------------------------------------------------------------------
// archiveStorage.js — local storage persistence for soft-deleted / archived guns.
// Ensures soft delete / archive works seamlessly both online and offline,
// even if the backend database lacks a `deleted_at` column.
// ---------------------------------------------------------------------------

const ARCHIVE_STORAGE_KEY = 'bore_barrel_archived_guns'

export const getArchivedGunsFromStorage = () => {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to read archived guns from storage:', err)
    return []
  }
}

export const saveArchivedGunsToStorage = (guns) => {
  try {
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(guns))
    // Trigger storage event so other tabs and components update
    window.dispatchEvent(new Event('archived_guns_updated'))
  } catch (err) {
    console.error('Failed to save archived guns to storage:', err)
  }
}

export const isGunArchived = (gunId) => {
  if (!gunId) return false
  const list = getArchivedGunsFromStorage()
  return list.some((g) => String(g.id) === String(gunId) || g.name === gunId)
}

export const archiveGunToStorage = (gun) => {
  if (!gun) return false
  const list = getArchivedGunsFromStorage()
  const exists = list.some((g) => String(g.id) === String(gun.id))
  if (!exists) {
    const archivedItem = {
      ...gun,
      deleted_at: new Date().toISOString(),
      archived_at: new Date().toISOString(),
    }
    const updated = [archivedItem, ...list]
    saveArchivedGunsToStorage(updated)
    return archivedItem
  }
  return null
}

export const restoreGunFromStorage = (gunId) => {
  const list = getArchivedGunsFromStorage()
  const found = list.find((g) => String(g.id) === String(gunId) || g.name === gunId)
  if (found) {
    const updated = list.filter((g) => String(g.id) !== String(gunId) && g.name !== gunId)
    saveArchivedGunsToStorage(updated)
    return found
  }
  return null
}

export const permanentlyDeleteFromStorage = (gunId) => {
  const list = getArchivedGunsFromStorage()
  const updated = list.filter((g) => String(g.id) !== String(gunId) && g.name !== gunId)
  saveArchivedGunsToStorage(updated)
  return true
}
