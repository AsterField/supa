'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
    const supabase = createClient()
    const router = useRouter()
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        // get current session
        supabase.auth.getUser().then(({ data: { user } }) => {
            setEmail(user?.email ?? null)
        })

        // listen for auth changes — fires on sign in and sign out
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setEmail(session?.user?.email ?? null)
            router.refresh()
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/signin')
    }

    return (
        <header style={{
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            {/* logo */}
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>🇮🇹 Italian Study</strong>
            </Link>

            {/* navigation */}
            {email && (
                <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <Link href="/">Dashboard</Link>
                    <Link href="/vocabulary">Vocabulary</Link>
                    <Link href="/flashcards">Flashcards</Link>
                    <Link href="/notes">Notes</Link>   {/* ✅ add this */}
                </nav>
            )}

            {/* auth */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {email ? (
                    <>
                        <span style={{ color: '#666', fontSize: 14 }}>{email}</span>
                        <button
                            onClick={handleSignOut}
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                cursor: 'pointer',
                                backgroundColor: '#fff'
                            }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/signin">Sign In</Link>
                        <Link href="/signup" style={{
                            padding: '8px 16px',
                            backgroundColor: '#2563eb',
                            color: '#fff',
                            borderRadius: 8,
                            textDecoration: 'none'
                        }}>
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}