'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ImageUpload({
  wordId,
  existingUrl,
  onUpload
}: {
  wordId: string
  existingUrl?: string
  onUpload: (url: string) => void
}) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingUrl ?? '')
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // validate file type and size
    if (!file.type.startsWith('image/')) return setError('Please upload an image file')
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5MB')

    setUploading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // upload to Supabase Storage
    const filePath = `${user.id}/${wordId}-${Date.now()}.${file.name.split('.').pop()}`

    const { error: uploadError } = await supabase.storage
      .from('vocabulary-images')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    // get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vocabulary-images')
      .getPublicUrl(filePath)

    // update vocabulary row with image URL
    await supabase
      .from('vocabulary')
      .update({ image_url: publicUrl })
      .eq('id', wordId)

    setPreview(publicUrl)
    onUpload(publicUrl)
    setUploading(false)
  }

  const handleRemove = async () => {
    await supabase
      .from('vocabulary')
      .update({ image_url: null })
      .eq('id', wordId)

    setPreview('')
    onUpload('')
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Image</h2>

      {preview ? (
        <div>
          <img
            src={preview}
            alt="Word illustration"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <label style={{ cursor: 'pointer', color: '#2563eb' }}>
              Replace image
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
            <button onClick={handleRemove} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #e5e7eb',
          borderRadius: 8,
          padding: 32,
          cursor: 'pointer',
          color: '#6b7280'
        }}>
          {uploading ? (
            <p>Uploading...</p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 32 }}>📷</p>
              <p style={{ margin: 8 }}>Click to upload an image</p>
              <p style={{ margin: 0, fontSize: 12 }}>PNG, JPG up to 5MB</p>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      )}

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </div>
  )
}