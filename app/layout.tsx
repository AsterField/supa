import "./globals.css";
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})
import Header from '@/components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} mx-auto text-xl `} >
        <Header />
        <main
          className="mt-24 min-h-screen bg-[#f7f6f3]"
        >          {children}
        </main>
      </body>
    </html>
  )
}