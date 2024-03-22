import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import Sidebar from '@/component/sidebar'
import SupabaseProvider from '@/Provider/SupabaseProvider'
import UserProvider from '@/Provider/userProvider'
import ModalProvider from '@/Provider/ModalProvider'
import ToasterProvider from '@/Provider/ToasterProvider'
import getSongsByUserId from '@/actions/getSongsByUserId'
import Player from '@/component/Player'

const font = Figtree({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spotofy',
  description: 'Listen to music',
}

export const revalidate = 0

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userSongs = await getSongsByUserId();
  return (
    <html lang="en">
      <body className={font.className}>
        <ToasterProvider/>
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider/>
            <Sidebar songs={userSongs}>
              {children}
            </Sidebar>
            <Player/>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  ) 
}
