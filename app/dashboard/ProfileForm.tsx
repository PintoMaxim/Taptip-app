'use client'

import { useState } from 'react'
import { updateProfile, type ProfileData } from '@/app/actions/profile'
import AvatarEditor from './AvatarEditor'

interface ProfileFormProps {
  initialData: {
    first_name?: string
    last_name?: string
    job_title?: string
    bio?: string
    avatar_url?: string
    email?: string
  } | null
  userId: string
}

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    job_title: initialData?.job_title || '',
    bio: initialData?.bio || '',
  })
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const userInitial = formData.first_name?.[0]?.toUpperCase() || initialData?.email?.[0]?.toUpperCase() || '?'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const result = await updateProfile(formData)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profil mis à jour !' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAvatarSuccess = (url: string) => {
    setAvatarUrl(url + '?t=' + Date.now())
    setMessage({ type: 'success', text: 'Photo mise à jour !' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="w-full">
      {message && (
        <div className={`mb-5 p-3 rounded-xl text-center text-xs font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <AvatarEditor currentAvatarUrl={avatarUrl} userInitial={userInitial} onSuccess={handleAvatarSuccess} onError={(m) => setMessage({ type: 'error', text: m })} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Prénom" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200" />
        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Nom" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200" />
        <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} placeholder="Métier" className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 resize-none" rows={3} maxLength={120} />
        <button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-black text-white font-semibold active:scale-[0.98] disabled:opacity-50">
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 uppercase mb-2">Votre lien</p>
        <code className="text-[10px] text-gray-500 break-all">app.taptip.fr/p/{userId}</code>
      </div>
    </div>
  )
}
