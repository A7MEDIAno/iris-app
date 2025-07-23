'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { showToast } from '../components/ui/Toast'

interface AutoSaveOptions {
  key: string // Unik nøkkel for localStorage
  delay?: number // Millisekunder før auto-save (default: 30000)
  onSave?: (data: any) => Promise<void> // Custom save function
  enabled?: boolean
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
) {
  const {
    key,
    delay = 30000,
    onSave,
    enabled = true
  } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const previousDataRef = useRef<string>()

  // Sjekk om data har endret seg
  useEffect(() => {
    const currentData = JSON.stringify(data)
    if (previousDataRef.current && previousDataRef.current !== currentData) {
      setHasChanges(true)
    }
    previousDataRef.current = currentData
  }, [data])

  // Auto-save logic
  const performSave = useCallback(async () => {
    if (!enabled || !hasChanges) return

    setIsSaving(true)
    try {
      // Lagre til localStorage
      localStorage.setItem(`draft_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }))

      // Kjør custom save hvis definert
      if (onSave) {
        await onSave(data)
      }

      setLastSaved(new Date())
      setHasChanges(false)
      
      // Ikke vis toast hver gang, bare ved manuell lagring
    } catch (error) {
      console.error('Auto-save error:', error)
      showToast({
        type: 'error',
        title: 'Kunne ikke auto-lagre',
        message: 'Endringene dine er midlertidig lagret lokalt'
      })
    } finally {
      setIsSaving(false)
    }
  }, [data, key, onSave, enabled, hasChanges])

  // Set up auto-save timer
  useEffect(() => {
    if (!enabled || !hasChanges) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(performSave, delay)

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [performSave, delay, enabled, hasChanges])

  // Manuell save
  const save = useCallback(async () => {
    await performSave()
    showToast({
      type: 'success',
      title: 'Lagret',
      message: 'Alle endringer er lagret'
    })
  }, [performSave])

  // Hent draft
  const loadDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(`draft_${key}`)
      if (savedDraft) {
        const { data, timestamp } = JSON.parse(savedDraft)
        return {
          data,
          timestamp: new Date(timestamp)
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return null
  }, [key])

  // Slett draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${key}`)
    setHasChanges(false)
  }, [key])

  // Format sist lagret tid
  const getLastSavedText = useCallback(() => {
    if (!lastSaved) return ''
    
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return 'Lagret nå'
    if (seconds < 3600) return `Lagret for ${Math.floor(seconds / 60)} minutter siden`
    if (seconds < 86400) return `Lagret for ${Math.floor(seconds / 3600)} timer siden`
    return `Lagret ${lastSaved.toLocaleDateString('nb-NO')}`
  }, [lastSaved])

  return {
    isSaving,
    hasChanges,
    lastSaved,
    lastSavedText: getLastSavedText(),
    save,
    loadDraft,
    clearDraft
  }
}