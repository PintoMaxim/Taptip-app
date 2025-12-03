'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { uploadAvatar } from '@/app/actions/profile'

interface AvatarEditorProps {
  currentAvatarUrl?: string
  userInitial: string
  onSuccess: (url: string) => void
  onError: (message: string) => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function AvatarEditor({ 
  currentAvatarUrl, 
  userInitial, 
  onSuccess, 
  onError 
}: AvatarEditorProps) {
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl || '')
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      onError('Sélectionnez une image')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '')
      setIsEditing(true)
    })
    reader.readAsDataURL(file)
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }, [])

  const getCroppedImg = async (): Promise<{ blob: Blob | null; dataUrl: string | null }> => {
    if (!imgRef.current || !completedCrop) return { blob: null, dataUrl: null }

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return { blob: null, dataUrl: null }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Taille finale de l'avatar (300x300 pour bonne qualité)
    const outputSize = 300
    canvas.width = outputSize
    canvas.height = outputSize

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize,
    )

    // Récupérer le dataUrl pour preview locale
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve({ blob, dataUrl }),
        'image/jpeg',
        0.9
      )
    })
  }

  const handleSave = async () => {
    setUploading(true)

    try {
      const { blob: croppedBlob, dataUrl } = await getCroppedImg()
      
      if (!croppedBlob || !dataUrl) {
        onError('Erreur lors du recadrage')
        setUploading(false)
        return
      }

      // Afficher immédiatement la preview locale
      setPreviewUrl(dataUrl)
      setIsEditing(false)
      setImgSrc('')

      // Essayer d'uploader vers Supabase
      const formData = new FormData()
      formData.append('avatar', croppedBlob, 'avatar.jpg')

      const result = await uploadAvatar(formData)

      if (result.error) {
        // Upload échoué mais on garde la preview locale
        onError(`${result.error} (image visible localement)`)
      } else if (result.url) {
        // Upload réussi - mettre à jour avec l'URL Supabase
        setPreviewUrl(result.url + '?t=' + Date.now())
        onSuccess(result.url)
      }
    } catch {
      onError('Erreur lors du traitement')
    }

    setUploading(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setImgSrc('')
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Avatar cliquable */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative group"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg border-4 border-white">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-400">
                  {userInitial}
                </span>
              </div>
            )}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">📷</span>
          </div>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <p className="text-xs text-gray-400 mt-2">Appuyez pour modifier</p>
      </div>

      {/* Modal d'édition */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white safe-area-inset-top">
            <button 
              onClick={handleCancel}
              className="text-base font-medium px-2 py-1"
            >
              Annuler
            </button>
            <span className="font-semibold">Recadrer</span>
            <button 
              onClick={handleSave}
              disabled={uploading || !completedCrop}
              className="text-base font-semibold text-blue-400 disabled:opacity-50 px-2 py-1"
            >
              {uploading ? '⏳' : 'OK'}
            </button>
          </div>

          {/* Zone de crop */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Photo à recadrer"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] max-w-full object-contain"
                />
              </ReactCrop>
            )}
          </div>

          {/* Instructions */}
          <div className="p-6 text-center safe-area-inset-bottom">
            <p className="text-white/70 text-sm">
              Glissez pour centrer votre visage dans le cercle
            </p>
          </div>
        </div>
      )}
    </>
  )
}
