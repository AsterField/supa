import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  const { data: words } = await supabase
    .from('vocabulary')
    .select('*, examples(*)')

  const total = words?.length ?? 0
  const learned = words?.filter(w => w.learned).length ?? 0
  const unlearned = words?.filter(w => !w.learned).length ?? 0
  const withImages = words?.filter(w => w.image_url).length ?? 0
  const totalReviews = words?.reduce((sum, w) => sum + (w.times_reviewed ?? 0), 0) ?? 0
  const totalExamples = words?.reduce((sum, w) => sum + (w.examples?.length ?? 0), 0) ?? 0
  const progressPercent = total > 0 ? Math.round((learned / total) * 100) : 0

  return (
 <div className={` mx-auto p-6 max-w-2xl`}>

      <h1>🇮🇹 Italian Study Dashboard</h1>
      <p style={{ color: '#666' }}>Welcome back, {user.email}</p>

      {/* progress bar */}
      <div style={{ marginTop: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Overall Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div style={{ backgroundColor: '#e5e7eb', borderRadius: 999, height: 12 }}>
          <div style={{
            backgroundColor: '#22c55e',
            borderRadius: 999,
            height: 12,
            width: `${progressPercent}%`,
            transition: 'width 0.3s'
          }} />
        </div>
        <p style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
          {learned} of {total} words learned
        </p>
      </div>

      {/* stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>📚</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{total}</p>
          <p style={{ color: '#666', margin: 0 }}>Total Words</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>✅</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{learned}</p>
          <p style={{ color: '#666', margin: 0 }}>Learned</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>⏳</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{unlearned}</p>
          <p style={{ color: '#666', margin: 0 }}>To Learn</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>🔄</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{totalReviews}</p>
          <p style={{ color: '#666', margin: 0 }}>Total Reviews</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>💬</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{totalExamples}</p>
          <p style={{ color: '#666', margin: 0 }}>Examples</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center' }}>
          <p style={{ fontSize: 32, margin: 0 }}>🖼️</p>
          <p style={{ fontSize: 28, fontWeight: 'bold', margin: '8px 0 4px' }}>{withImages}</p>
          <p style={{ color: '#666', margin: 0 }}>With Images</p>
        </div>
      </div>

      {/* quick actions */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/flashcards" style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none'
        }}>
          🃏 Study Flashcards
        </Link>
        <Link href="/vocabulary/new" style={{
          padding: '12px 24px',
          backgroundColor: '#22c55e',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none'
        }}>
          + Add Word
        </Link>
        <Link href="/vocabulary" style={{
          padding: '12px 24px',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          textDecoration: 'none'
        }}>
          📖 View All Words
        </Link>
      </div>

      {/* recently added */}
      {words && words.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2>Recently Added</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {words.slice(0, 5).map(word => (
              <Link
                key={word.id}
                href={`/vocabulary/${word.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 12,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <span>{word.italian} — {word.english}</span>
                <span>{word.learned ? '✅' : '⏳'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}