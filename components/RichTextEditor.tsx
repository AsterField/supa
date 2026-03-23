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
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-editor',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content])

  if (!editor) return null

  return (
    <>
      <style>{`
        .prose-editor {
          outline: none;
          min-height: 100%;
          font-size: 15px;
          line-height: 1.8;
          color: #1c1917;
          font-family: 'Georgia', serif;
          caret-color: #78716c;
        }
        .prose-editor p { margin: 0 0 0.75em; }
        .prose-editor p:last-child { margin-bottom: 0; }
        .prose-editor h1 { font-size: 1.6em; font-weight: 700; margin: 1.2em 0 0.4em; color: #0c0a09; letter-spacing: -0.02em; }
        .prose-editor h2 { font-size: 1.3em; font-weight: 600; margin: 1em 0 0.35em; color: #1c1917; }
        .prose-editor h3 { font-size: 1.1em; font-weight: 600; margin: 0.9em 0 0.3em; color: #292524; }
        .prose-editor ul { padding-left: 1.4em; margin: 0.5em 0; }
        .prose-editor ol { padding-left: 1.4em; margin: 0.5em 0; }
        .prose-editor li { margin: 0.25em 0; }
        .prose-editor blockquote {
          border-left: 3px solid #e7e5e4;
          padding-left: 1em;
          margin: 0.75em 0;
          color: #78716c;
          font-style: italic;
        }
        .prose-editor code {
          background: #f5f5f4;
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.88em;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #92400e;
        }
        .prose-editor pre {
          background: #1c1917;
          border-radius: 10px;
          padding: 16px 18px;
          margin: 0.75em 0;
          overflow-x: auto;
        }
        .prose-editor pre code {
          background: none;
          color: #d6d3d1;
          padding: 0;
          font-size: 0.85em;
        }
        .prose-editor strong { font-weight: 700; color: #0c0a09; }
        .prose-editor em { font-style: italic; color: #44403c; }
        .prose-editor s { text-decoration: line-through; color: #a8a29e; }
        .prose-editor hr { border: none; border-top: 1px solid #e7e5e4; margin: 1.5em 0; }
        .prose-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #c4b5b0;
          pointer-events: none;
          height: 0;
          font-style: italic;
          font-family: 'Georgia', serif;
        }
      `}</style>
      <EditorContent editor={editor} style={{ height: '100%' }} />
    </>
  )
}