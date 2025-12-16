'use client'

interface ActivityItem {
  id: string
  type: 'tip' | 'review'
  amount?: number
  rating?: number
  comment?: string | null
  created_at: string
}

interface ActivityListProps {
  activities: ActivityItem[]
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes}min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export default function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
        </div>
        <p className="text-gray-400 text-xs">Aucune activité pour le moment</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 stagger-children">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-default"
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            activity.type === 'tip' ? 'bg-black' : 'bg-gray-200'
          }`}>
            <span className={`text-sm ${activity.type === 'tip' ? 'text-white' : ''}`}>
              {activity.type === 'tip' ? '€' : '★'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-black">
              {activity.type === 'tip' ? 'Pourboire reçu' : 'Nouvel avis'}
            </p>
            {activity.type === 'review' && activity.comment && (
              <p className="text-[10px] text-gray-400 truncate">
                &ldquo;{activity.comment}&rdquo;
              </p>
            )}
            <p className="text-[10px] text-gray-400">
              {formatDate(activity.created_at)}
            </p>
          </div>

          <div className="text-right">
            {activity.type === 'tip' ? (
              <span className="text-base font-bold text-black">
                +{formatAmount(activity.amount!)}
              </span>
            ) : (
              <div className="flex items-center gap-0.5">
                <span className="text-black text-xs">★</span>
                <span className="font-semibold text-black text-sm">{activity.rating}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
