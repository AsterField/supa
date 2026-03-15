import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import UnlearnedWordsEmail from '@/components/emails/UnlearnedWordsEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // protect the route with a secret key
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No user found' }, { status: 401 })

  // fetch unlearned words with examples and relations
  const { data: words, error } = await supabase
    .from('vocabulary')
    .select(`
      *,
      examples (*),
      word_relations (*)
    `)
    .eq('learned', false)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!words?.length) return Response.json({ message: 'No unlearned words' })

  // send email
  const { error: emailError } = await resend.emails.send({
    from: 'Italian Study <onboarding@resend.dev>', // change to your domain later
    to: user.email!,
    subject: `🇮🇹 ${words.length} Italian words to study today`,
    react: UnlearnedWordsEmail({ words }),
  })

  if (emailError) return Response.json({ error: emailError }, { status: 500 })

  return Response.json({ success: true, wordsSent: words.length })
}