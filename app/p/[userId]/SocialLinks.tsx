interface SocialLinksProps {
  instagramHandle?: string | null
  tiktokHandle?: string | null
  bookingUrl?: string | null
}

export default function SocialLinks({ instagramHandle, tiktokHandle, bookingUrl }: SocialLinksProps) {
  const hasInstagram = !!instagramHandle?.trim()
  const hasTiktok = !!tiktokHandle?.trim()
  const hasBooking = !!bookingUrl?.trim()

  if (!hasInstagram && !hasTiktok && !hasBooking) return null

  return (
    <div className="w-full max-w-[380px] mt-4 mb-2">

      {/* Icônes réseaux sociaux */}
      {(hasInstagram || hasTiktok) && (
        <div className="flex gap-3 justify-center mb-3">

          {hasInstagram && (
            <a
              href={`https://instagram.com/${instagramHandle!.trim().replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profil Instagram"
              className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-white border-2 border-gray-100 hover:border-gray-200 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              {/* Instagram SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5" fill="url(#ig-grad)" />
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
              </svg>
              <span className="text-sm font-semibold text-gray-700">Instagram</span>
            </a>
          )}

          {hasTiktok && (
            <a
              href={`https://tiktok.com/@${tiktokHandle!.trim().replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Profil TikTok"
              className="flex items-center gap-2 px-4 h-11 rounded-2xl bg-white border-2 border-gray-100 hover:border-gray-200 active:scale-[0.97] transition-all duration-200 shadow-sm"
            >
              {/* TikTok SVG */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.18 8.18 0 004.78 1.52V6.94a4.85 4.85 0 01-1.01-.25z" fill="#010101"/>
              </svg>
              <span className="text-sm font-semibold text-gray-700">TikTok</span>
            </a>
          )}

        </div>
      )}

      {/* Bouton de réservation */}
      {hasBooking && (
        <a
          href={bookingUrl!.trim()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Prendre rendez-vous"
          className="flex items-center justify-center gap-2 w-full h-13 rounded-2xl bg-black text-white font-semibold text-sm active:scale-[0.98] transition-all duration-200 shadow-lg shadow-black/15 hover:bg-gray-900"
          style={{ height: '52px' }}
        >
          {/* Calendrier SVG */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Prendre rendez-vous
        </a>
      )}

    </div>
  )
}
