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
    instagram_url?: string
    tiktok_url?: string
    booking_url?: string
  } | null
  userId: string
}

const inputStyle = {
  width: '100%',
  height: '48px',
  padding: '0 16px',
  borderRadius: '12px',
  background: '#0c0c0d',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f4f4f4',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 200ms',
}

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    job_title: initialData?.job_title || '',
    bio: initialData?.bio || '',
    instagram_url: initialData?.instagram_url || '',
    tiktok_url: initialData?.tiktok_url || '',
    booking_url: initialData?.booking_url || '',
  })
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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

  const getFocusStyle = (field: string) =>
    focusedField === field
      ? { ...inputStyle, borderColor: 'oklch(0.78 0.18 155)' }
      : inputStyle

  return (
    <div className="w-full">
      {message && (
        <div
          className="mb-5 p-3 rounded-xl text-center text-xs font-medium"
          style={
            message.type === 'success'
              ? { background: 'oklch(0.78 0.18 155 / 0.12)', color: 'oklch(0.78 0.18 155)', border: '1px solid oklch(0.78 0.18 155 / 0.3)' }
              : { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
          }
        >
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <AvatarEditor
          currentAvatarUrl={avatarUrl}
          userInitial={userInitial}
          onSuccess={handleAvatarSuccess}
          onError={(m) => setMessage({ type: 'error', text: m })}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Prénom"
          style={getFocusStyle('first_name')}
          onFocus={() => setFocusedField('first_name')}
          onBlur={() => setFocusedField(null)}
        />
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Nom"
          style={getFocusStyle('last_name')}
          onFocus={() => setFocusedField('last_name')}
          onBlur={() => setFocusedField(null)}
        />
        <input
          type="text"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          placeholder="Métier"
          style={getFocusStyle('job_title')}
          onFocus={() => setFocusedField('job_title')}
          onBlur={() => setFocusedField(null)}
        />
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Bio"
          rows={3}
          maxLength={120}
          style={{
            ...getFocusStyle('bio'),
            height: 'auto',
            padding: '12px 16px',
            resize: 'none',
          }}
          onFocus={() => setFocusedField('bio')}
          onBlur={() => setFocusedField(null)}
        />

        {/* Séparateur réseaux sociaux */}
        <div
          className="pt-2 pb-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px' }}
        >
          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-jetbrains), monospace', color: '#4a4a4c' }}
          >
            Liens optionnels
          </p>

          {/* Instagram */}
          <div className="relative mb-3">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none select-none"
              style={{ color: '#4a4a4c' }}
            >
              instagram.com/
            </span>
            <input
              type="text"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="votre_pseudo"
              style={{
                ...getFocusStyle('instagram_url'),
                paddingLeft: '116px',
              }}
              onFocus={() => setFocusedField('instagram_url')}
              onBlur={() => setFocusedField(null)}
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>

          {/* TikTok */}
          <div className="relative mb-3">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none select-none"
              style={{ color: '#4a4a4c' }}
            >
              tiktok.com/@
            </span>
            <input
              type="text"
              name="tiktok_url"
              value={formData.tiktok_url}
              onChange={handleChange}
              placeholder="votre_pseudo"
              style={{
                ...getFocusStyle('tiktok_url'),
                paddingLeft: '108px',
              }}
              onFocus={() => setFocusedField('tiktok_url')}
              onBlur={() => setFocusedField(null)}
              autoComplete="off"
              autoCapitalize="none"
            />
          </div>

          {/* Lien de réservation */}
          <input
            type="url"
            name="booking_url"
            value={formData.booking_url}
            onChange={handleChange}
            placeholder="Lien de réservation (Planity, Calendly…)"
            style={getFocusStyle('booking_url')}
            onFocus={() => setFocusedField('booking_url')}
            onBlur={() => setFocusedField(null)}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-xl font-semibold text-[15px] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </form>

      <div
        className="mt-6 pt-5 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p
          className="text-[10px] uppercase mb-2 tracking-widest"
          style={{ fontFamily: 'var(--font-jetbrains), monospace', color: '#4a4a4c' }}
        >
          Votre lien
        </p>
        <code
          className="text-[10px] break-all"
          style={{ color: '#8b8b8d', fontFamily: 'var(--font-jetbrains), monospace' }}
        >
          app.taptip.fr/p/{userId}
        </code>
      </div>
    </div>
  )
}
