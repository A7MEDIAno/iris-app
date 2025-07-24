import { useRouter } from 'next/navigation'
import { Plus, Camera, Users, Package } from 'lucide-react'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      id: 'new-order',
      label: 'Nytt oppdrag',
      icon: Plus,
      onClick: () => router.push('/orders/new'),
      color: 'bg-nordvik-500 hover:bg-nordvik-600'
    },
    {
      id: 'new-customer',
      label: 'Ny kunde',
      icon: Users,
      onClick: () => router.push('/customers/new'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'new-photographer',
      label: 'Ny fotograf',
      icon: Camera,
      onClick: () => router.push('/photographers/new'),
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      id: 'new-product',
      label: 'Nytt produkt',
      icon: Package,
      onClick: () => router.push('/products/new'),
      color: 'bg-green-500 hover:bg-green-600'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-800/30">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Hurtighandlinger</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.color} p-4 rounded-lg text-white transition-all transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center space-y-2`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}