'use client'
import Link from 'next/link'
import { Droplets, LogOut, BookOpen } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/isAdmin'
import NotificationBell from '@/components/NotificationBell'

export default function Navbar() {
  const path = usePathname()
  const router = useRouter()
  const { user, username } = useAuth()
  const { t, lang, toggleLang } = useLang()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = username || user?.email?.split('@')[0] || 'User'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 font-bold text-blue-700">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Droplets size={14} className="text-white" />
          </div>
          <span className="text-sm">{t.appName}</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              path === '/'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.liveMap}
          </Link>

          {!isAdmin(user) && (
            <Link
              href="/report"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                path === '/report'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.reportIssue}
            </Link>
          )}

          {!isAdmin(user) && (
            <Link
              href="/guide"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${
                path === '/guide'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={13} />
              Guide
            </Link>
          )}

          {isAdmin(user) && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                path === '/admin'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.admin}
            </Link>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {lang === 'en' ? 'বাং' : 'EN'}
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {user && !isAdmin(user) && <NotificationBell />}

          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-700 font-medium max-w-[100px] truncate">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <LogOut size={13} />
                {t.signOut}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition-colors ml-1"
            >
              {t.signIn}
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}