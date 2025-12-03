import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/logo.png"
            alt="TapTip Logo"
            width={120}
            height={120}
            className="drop-shadow-sm"
            priority
          />
        </div>

        {/* Boutons */}
        <div className="flex w-full flex-col gap-4">
          <Link
            href="/activate"
            className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-black bg-white text-base font-semibold text-black transition-all active:scale-[0.98]"
          >
            Activer un Badge
          </Link>
          <Link
            href="/login"
            className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-black bg-black text-base font-semibold text-white transition-all active:scale-[0.98]"
          >
            Espace Client
          </Link>
        </div>
      </div>
    </div>
  )
}
