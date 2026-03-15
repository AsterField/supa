'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return setError(error.message)
    router.push('/') // redirect after sign up
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p>{error}</p>}
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  )
}