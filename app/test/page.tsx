import { createClient } from '@/utils/supabase/server'

type Place = {
  id: string
  name: string
  italian: string
  location: string
  photo_url: string
  description: string
  rating: number
  created_at: string
}
type Vocal = {
  id: string
  italian: string
}

export default async function Test() {
const supabase = await createClient()

const [
  { data: places, error: placesError },
  { data: vocabulary, error: vocabularyError }
] = await Promise.all([
  supabase.from('places').select('*').order('created_at', { ascending: false }),
  supabase.from('vocabulary').select('*').order('created_at', { ascending: false })
])

if (placesError) console.error(placesError)
if (vocabularyError) console.error(vocabularyError)

  return (
    <div className="mt-26 p-6">
      {places && vocabulary && places.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {places.map((place: Place) => (
            <div key={place.id} className="border rounded-xl shadow p-4">
              
              <h2 className="text-lg font-semibold">{place.name}</h2>
            </div>
          ))}
          {vocabulary.map((vocal: Vocal)=>(
            <div key={vocal.id}>{vocal.italian}</div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No places found.</p>
      )}
    </div>
  )
}