'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write something...'
}: {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder })
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
      {/* toolbar */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: 8,
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{ fontWeight: editor.isActive('bold') ? 'bold' : 'normal', padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('bold') ? '#e5e7eb' : '#fff' }}
        >B</button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ fontStyle: 'italic', padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('italic') ? '#e5e7eb' : '#fff' }}
        >I</button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ textDecoration: 'line-through', padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('strike') ? '#e5e7eb' : '#fff' }}
        >S</button>
        <div style={{ width: 1, backgroundColor: '#e5e7eb', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('heading', { level: 1 }) ? '#e5e7eb' : '#fff' }}
        >H1</button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('heading', { level: 2 }) ? '#e5e7eb' : '#fff' }}
        >H2</button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('heading', { level: 3 }) ? '#e5e7eb' : '#fff' }}
        >H3</button>
        <div style={{ width: 1, backgroundColor: '#e5e7eb', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('bulletList') ? '#e5e7eb' : '#fff' }}
        >• List</button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('orderedList') ? '#e5e7eb' : '#fff' }}
        >1. List</button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('codeBlock') ? '#e5e7eb' : '#fff' }}
        >Code</button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: editor.isActive('blockquote') ? '#e5e7eb' : '#fff' }}
        >❝</button>
        <div style={{ width: 1, backgroundColor: '#e5e7eb', margin: '0 4px' }} />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: '#fff' }}
        >↩</button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', cursor: 'pointer', backgroundColor: '#fff' }}
        >↪</button>
      </div>

      {/* editor */}
      <EditorContent
        editor={editor}
        style={{ padding: 16, minHeight: 200 }}
      />
    </div>
  )
}