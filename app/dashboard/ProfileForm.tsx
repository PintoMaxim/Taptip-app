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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

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

  const handleAvatarError = (errorMsg: string) => {
    setMessage({ type: 'error', text: errorMsg })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="w-full">
      {/* Message de feedback */}
      {message && (
        <div
          className={`mb-5 p-3 rounded-xl text-center text-xs font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar */}
      <div className="mb-6">
        <AvatarEditor
          currentAvatarUrl={avatarUrl}
          userInitial={userInitial}
          onSuccess={handleAvatarSuccess}
          onError={handleAvatarError}
        />
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Prénom</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Votre prénom"
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Nom</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Votre nom"
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Métier</label>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="Ex: Serveur, Barman, Coiffeur..."
            className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1 ml-1">Bio courte</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Une phrase qui vous décrit..."
            rows={3}
            maxLength={120}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-black placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none resize-none"
          />
          <p className="text-[10px] text-gray-400 text-right mt-1">
            {formData.bio.length}/120
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-xl bg-black text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 mt-2"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>

      {/* Lien page publique */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider mb-2">Votre page publique</p>
        <a
          href={`/p/${userId}`}
          target="_blank"
          className="block w-full text-center text-xs text-black font-medium py-3 px-4 rounded-xl bg-gray-50 border border-gray-100 active:scale-[0.98] transition-transform truncate"
        >
          taptip.fr/p/{userId.slice(0, 8)}...
        </a>
      </div>
    </div>
  )
}
