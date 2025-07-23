'use client'

interface User {
  id: string
  name: string
  avatar?: string
  currentPage?: string
}

interface RealtimeIndicatorProps {
  isConnected: boolean
  activeUsers: User[]
  currentPage?: string
}

export function RealtimeIndicator({ 
  isConnected, 
  activeUsers, 
  currentPage 
}: RealtimeIndicatorProps) {
  // Filtrer ut brukere på samme side
  const usersOnSamePage = activeUsers.filter(
    user => user.currentPage === currentPage
  )

  return (
    <div className="flex items-center gap-4">
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`} />
        <span className="text-xs text-gray-500">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Active users on same page */}
      {usersOnSamePage.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Ser også på:</span>
          <div className="flex -space-x-2">
            {usersOnSamePage.slice(0, 3).map(user => (
              <div
                key={user.id}
                className="w-8 h-8 bg-nordvik-800 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-900"
                title={user.name}
              >
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            ))}
            {usersOnSamePage.length > 3 && (
              <div className="w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-dark-900">
                +{usersOnSamePage.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}