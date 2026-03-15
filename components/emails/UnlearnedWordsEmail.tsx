export default function UnlearnedWordsEmail({ words }: { words: any[] }) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ color: '#2563eb' }}>🇮🇹 Your Italian Words to Study Today</h1>
      <p>You have <strong>{words.length}</strong> words still to learn:</p>

      {words.map(word => (
        <div key={word.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          
          {/* word */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, color: '#1d4ed8' }}>{word.italian}</h2>
            <span style={{ color: '#6b7280' }}>{word.part_of_speech} {word.gender ? `(${word.gender})` : ''}</span>
          </div>
          <p style={{ color: '#374151', marginTop: 4 }}>{word.english}</p>

          {/* examples */}
          {word.examples?.length > 0 && (
            <div style={{ marginTop: 12, backgroundColor: '#f9fafb', padding: 12, borderRadius: 6 }}>
              <strong>Examples:</strong>
              {word.examples.map((ex: any) => (
                <div key={ex.id} style={{ marginTop: 8 }}>
                  <p style={{ margin: 0 }}>🇮🇹 {ex.italian}</p>
                  <p style={{ margin: 0, color: '#6b7280' }}>🇬🇧 {ex.english}</p>
                </div>
              ))}
            </div>
          )}

          {/* synonyms */}
          {word.word_relations?.filter((r: any) => r.type === 'synonym').length > 0 && (
            <p style={{ marginTop: 8 }}>
              <strong>Synonyms: </strong>
              {word.word_relations
                .filter((r: any) => r.type === 'synonym')
                .map((r: any) => r.related_word)
                .join(', ')}
            </p>
          )}

          {/* antonyms */}
          {word.word_relations?.filter((r: any) => r.type === 'antonym').length > 0 && (
            <p style={{ marginTop: 8 }}>
              <strong>Antonyms: </strong>
              {word.word_relations
                .filter((r: any) => r.type === 'antonym')
                .map((r: any) => r.related_word)
                .join(', ')}
            </p>
          )}

        </div>
      ))}

      <p style={{ color: '#6b7280', fontSize: 14 }}>
        Visit your app to mark words as learned once you know them!
      </p>
    </div>
  )
}