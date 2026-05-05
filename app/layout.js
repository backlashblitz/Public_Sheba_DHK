import './globals.css'
import { AuthProvider } from '@/lib/AuthContext'
import { LangProvider } from '@/lib/LangContext'
import AuthGuard from '@/components/AuthGuard'

export const metadata = {
  title: 'Public Sheba DHK',
  description: 'Real-time utility monitoring for Dhaka',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <LangProvider>
          <AuthProvider>
            <AuthGuard>
              <main>{children}</main>
            </AuthGuard>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  )
}