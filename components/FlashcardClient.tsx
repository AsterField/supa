'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function FlashcardClient({ words }: { words: any[] }) {
  const supabase = createClient()
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [learned, setLearned] = useState(0)

  const word = words[current]

  const handleFlip = () => setFlipped(!flipped)

  const handleKnow = async () => {
    // mark as learned in Supabase
    await supabase
      .from('vocabulary')
      .update({
        learned: true,
        times_reviewed: (word.times_reviewed ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', word.id)

    setLearned(learned + 1)
    nextCard()
  }

  const handleDontKnow = async () => {
    // just increment review counter
    await supabase
      .from('vocabulary')
      .update({
        times_reviewed: (word.times_reviewed ?? 0) + 1,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', word.id)

    nextCard()
  }

  const nextCard = () => {
    setFlipped(false)
    if (current + 1 >= words.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
    }
  }

  // finished all cards
  if (done) {
    return (
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <h2>🎉 Session Complete!</h2>
        <p>You reviewed <strong>{words.length}</strong> words</p>
        <p>You marked <strong>{learned}</strong> as learned</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <a href="/flashcards">Study Again</a>
          <a href="/vocabulary">Back to List</a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* progress */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: '#666' }}>{current + 1} / {words.length}</p>
        <div style={{ backgroundColor: '#e5e7eb', borderRadius: 999, height: 8 }}>
          <div style={{
            backgroundColor: '#2563eb',
            borderRadius: 999,
            height: 8,
            width: `${((current + 1) / words.length) * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* card */}
      <div
        onClick={handleFlip}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          padding: 48,
          textAlign: 'center',
          cursor: 'pointer',
          minHeight: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: flipped ? '#eff6ff' : '#fff',
          transition: 'background-color 0.3s'
        }}
      >
        {!flipped ? (
          // front — Italian
          <div>
            <p style={{ color: '#6b7280', marginBottom: 8 }}>🇮🇹 Italian</p>
            <h2 style={{ fontSize: 36, margin: 0 }}>{word.italian}</h2>
            {word.part_of_speech && (
              <p style={{ color: '#9ca3af', marginTop: 8 }}>
                {word.part_of_speech} {word.gender ? `· ${word.gender}` : ''}
              </p>
            )}
            <p style={{ color: '#9ca3af', marginTop: 24, fontSize: 14 }}>
              Click to reveal
            </p>
          </div>
        ) : (
          // back — English + details
          <div>
            <p style={{ color: '#6b7280', marginBottom: 8 }}>🇬🇧 English</p>
            <h2 style={{ fontSize: 36, margin: 0 }}>{word.english}</h2>

            {/* examples */}
            {word.examples?.length > 0 && (
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <strong>Examples:</strong>
                {word.examples.slice(0, 2).map((ex: any) => (
                  <div key={ex.id} style={{ marginTop: 8 }}>
                    <p style={{ margin: 0, fontSize: 14 }}>🇮🇹 {ex.italian}</p>
                    <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>🇬🇧 {ex.english}</p>
                  </div>
                ))}
              </div>
            )}

            {/* synonyms */}
            {word.word_relations?.filter((r: any) => r.type === 'synonym').length > 0 && (
              <p style={{ marginTop: 12, fontSize: 14 }}>
                <strong>Synonyms: </strong>
                {word.word_relations.filter((r: any) => r.type === 'synonym').map((r: any) => r.related_word).join(', ')}
              </p>
            )}

            {/* image */}
            {word.image_url && (
              <img
                src={word.image_url}
                alt={word.italian}
                style={{ marginTop: 16, maxHeight: 120, borderRadius: 8, objectFit: 'cover' }}
              />
            )}
          </div>
        )}
      </div>

      {/* actions — only show after flip */}
      {flipped && (
        <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
          <button
            onClick={handleDontKnow}
            style={{
              padding: '12px 32px',
              borderRadius: 8,
              border: '1px solid #ef4444',
              color: '#ef4444',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            ❌ Still learning
          </button>
          <button
            onClick={handleKnow}
            style={{
              padding: '12px 32px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#22c55e',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            ✅ I know it!
          </button>
        </div>
      )}

      {/* hint */}
      {!flipped && (
        <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: 16 }}>
          Click the card to see the answer
        </p>
      )}
    </div>
  )
}