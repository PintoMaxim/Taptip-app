import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col items-center justify-center px-6 page-transition">

        {/* Logo */}
        <div className="mb-14">
          <Image
            src="/logo.png"
            alt="TapTip Logo"
            width={110}
            height={110}
            className="drop-shadow-sm"
            priority
          />
        </div>

        {/* Boutons */}
        <div className="flex w-full flex-col gap-3">
          <Link
            href="/activate"
            className="flex h-14 w-full items-center justify-center rounded-xl text-base font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#f4f4f4',
            }}
          >
            Activer un Badge
          </Link>
          <Link
            href="/login"
            className="flex h-14 w-full items-center justify-center rounded-xl text-base font-semibold transition-all duration-200 active:scale-[0.98] hover:brightness-110"
            style={{
              background: 'oklch(0.78 0.18 155)',
              color: '#000',
            }}
          >
            Espace Client
          </Link>
        </div>

      </div>
    </div>
  )
}
