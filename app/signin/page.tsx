'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignInPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)
    router.push('/') // redirect after sign in
  }

  return (
    <div>
      <h1>Sign In</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  )
}