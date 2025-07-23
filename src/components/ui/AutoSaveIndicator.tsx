'use client'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  hasChanges: boolean
  lastSavedText: string
  onSave?: () => void
}

export function AutoSaveIndicator({
  isSaving,
  hasChanges,
  lastSavedText,
  onSave
}: AutoSaveIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {isSaving ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
          <span className="text-gray-400">Lagrer...</span>
        </>
      ) : hasChanges ? (
        <>
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-400">Ulagrede endringer</span>
          {onSave && (
            <button
              onClick={onSave}
              className="text-nordvik-400 hover:text-nordvik-300 font-medium"
            >
              Lagre nå
            </button>
          )}
        </>
      ) : lastSavedText ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-gray-400">{lastSavedText}</span>
        </>
      ) : null}
    </div>
  )
}