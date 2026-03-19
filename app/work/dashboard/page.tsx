'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

type Side = 'left1' | 'left2' | 'right1' | 'right2'

interface TemplateItem {
  id: string
  block_id: string
  label: string
  content: string
  sort_order: number
}

interface TemplateBlock {
  id: string
  label: string
  emoji: string
  side: Side
  sort_order: number
  items: TemplateItem[]
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  title, fields, onSave, onClose,
}: {
  title: string
  fields: { key: string; label: string; value: string; multiline?: boolean }[]
  onSave: (v: Record<string, string>) => void
  onClose: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, f.value]))
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-stone-800">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">×</button>
        </div>
        <div className="flex flex-col gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs text-stone-400 uppercase tracking-widest font-medium block mb-1.5">{f.label}</label>
              {f.multiline ? (
                <textarea
                  value={values[f.key]}
                  onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                  rows={7}
                />
              ) : (
                <input
                  type="text"
                  value={values[f.key]}
                  onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
          <button onClick={() => { onSave(values); onClose() }} className="px-4 py-2 text-sm font-medium bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-colors">Save</button>
        </div>
      </div>
    </div>
  )
}

// ── Block column ──────────────────────────────────────────────────────────────

function BlockColumn({
  side, label, blocks, activeBlock, onSelect, onAdd, onEdit, onDelete,
}: {
  side: Side
  label: string
  blocks: TemplateBlock[]
  activeBlock: TemplateBlock | null
  onSelect: (b: TemplateBlock) => void
  onAdd: () => void
  onEdit: (b: TemplateBlock) => void
  onDelete: (id: string) => void
}) {
  const col = blocks.filter(b => b.side === side)
  return (
    <div className="flex flex-col gap-2 w-28 flex-shrink-0">
      <button
        onClick={onAdd}
        className="w-full py-2 border-2 border-dashed border-stone-200 rounded-xl text-xs text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
      >
        + {label}
      </button>
      {col.map(block => (
        <div
          key={block.id}
          onClick={() => onSelect(block)}
          className={`
            group relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border
            cursor-pointer transition-all text-center
            ${activeBlock?.id === block.id
              ? 'bg-stone-800 border-stone-800 text-white shadow-md'
              : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:shadow-sm hover:-translate-y-0.5'
            }
          `}
        >
          <span className="text-lg">{block.emoji}</span>
          <span className="text-xs font-medium leading-tight">{block.label}</span>

          <button
            onClick={e => { e.stopPropagation(); onEdit(block) }}
            className={`absolute -top-2 -left-2 w-5 h-5 rounded-full text-xs items-center justify-center hidden group-hover:flex transition-colors ${activeBlock?.id === block.id ? 'bg-stone-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            title="Edit"
          >✎</button>

          <button
            onClick={e => { e.stopPropagation(); onDelete(block.id) }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-100 text-red-400 text-xs items-center justify-center hidden group-hover:flex hover:bg-red-200 transition-colors"
            title="Delete"
          >×</button>
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TemplatePage() {
  const [blocks, setBlocks] = useState<TemplateBlock[]>([])
  const [activeBlock, setActiveBlock] = useState<TemplateBlock | null>(null)
  const [activeItem, setActiveItem] = useState<TemplateItem | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editBlockModal, setEditBlockModal] = useState<TemplateBlock | null>(null)
  const [editItemModal, setEditItemModal] = useState<TemplateItem | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────

  const fetchAll = async () => {
    const [{ data: blocksData, error: blocksError }, { data: itemsData }] = await Promise.all([
      supabase.from('template_blocks').select('*').order('sort_order'),
      supabase.from('template_items').select('*').order('sort_order'),
    ])

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError)
      setLoading(false)
      return
    }

    if (blocksData) {
      setBlocks(blocksData.map(b => ({
        ...b,
        items: (itemsData ?? []).filter(i => i.block_id === b.id),
      })))
    }

    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (activeBlock) {
      const updated = blocks.find(b => b.id === activeBlock.id)
      if (updated) setActiveBlock(updated)
    }
  }, [blocks])

  // ── Block CRUD ─────────────────────────────────────────────────────

  const addBlock = async (side: Side) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('template_blocks')
      .insert({ user_id: user.id, label: 'New Block', emoji: '📄', side, sort_order: blocks.filter(b => b.side === side).length })
      .select().single()
    if (error) { console.error('Error adding block:', error); return }
    if (data) {
      const nb = { ...data, items: [] }
      setBlocks(p => [...p, nb])
      setEditBlockModal(nb)
    }
  }

  const updateBlock = async (id: string, changes: Partial<TemplateBlock>) => {
    const { error } = await supabase.from('template_blocks').update(changes).eq('id', id)
    if (error) { console.error('Error updating block:', error); return }
    setBlocks(p => p.map(b => b.id === id ? { ...b, ...changes } : b))
  }

  const deleteBlock = async (id: string) => {
    if (!confirm('Delete this block and all its items?')) return
    await supabase.from('template_blocks').delete().eq('id', id)
    setBlocks(p => p.filter(b => b.id !== id))
    if (activeBlock?.id === id) { setActiveBlock(null); setActiveItem(null); setContent('') }
  }

  // ── Item CRUD ──────────────────────────────────────────────────────

  const addItem = async (blockId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const block = blocks.find(b => b.id === blockId)
    const { data, error } = await supabase
      .from('template_items')
      .insert({ user_id: user.id, block_id: blockId, label: 'New Item', content: '', sort_order: block?.items.length ?? 0 })
      .select().single()
    if (error) { console.error('Error adding item:', error); return }
    if (data) {
      setBlocks(p => p.map(b => b.id === blockId ? { ...b, items: [...b.items, data] } : b))
      setEditItemModal(data)
    }
  }

  const updateItem = async (itemId: string, blockId: string, changes: Partial<TemplateItem>) => {
    const { error } = await supabase.from('template_items').update(changes).eq('id', itemId)
    if (error) { console.error('Error updating item:', error); return }
    setBlocks(p => p.map(b =>
      b.id === blockId ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, ...changes } : i) } : b
    ))
    if (activeItem?.id === itemId) setActiveItem(p => p ? { ...p, ...changes } : null)
  }

  const deleteItem = async (itemId: string, blockId: string) => {
    await supabase.from('template_items').delete().eq('id', itemId)
    setBlocks(p => p.map(b =>
      b.id === blockId ? { ...b, items: b.items.filter(i => i.id !== itemId) } : b
    ))
    if (activeItem?.id === itemId) { setActiveItem(null); setContent('') }
  }

  // ── Select ─────────────────────────────────────────────────────────

  const selectBlock = (block: TemplateBlock) => {
    setActiveBlock(p => p?.id === block.id ? null : block)
    setActiveItem(null)
    setContent('')
  }

  const selectItem = (item: TemplateItem) => {
    setActiveItem(item)
    setContent(item.content)
    setSaved(false)
  }

  // ── Save / Copy ────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!activeItem) return
    setSaving(true)
    await updateItem(activeItem.id, activeItem.block_id, { content })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render ─────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  )

  const colProps = { blocks, activeBlock, onSelect: selectBlock, onEdit: setEditBlockModal, onDelete: deleteBlock }

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="w-full mx-auto px-6 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Template Builder</h1>
          <p className="text-stone-400 text-sm mt-1">Select a block → pick an item → edit and save.</p>
        </div>

        {/* ── 5 column layout ───────────────────────────────────────── */}
        <div className="flex gap-4 items-start">

          <BlockColumn side="left1"  label="Left 1"  onAdd={() => addBlock('left1')}  {...colProps} />
          <BlockColumn side="left2"  label="Left 2"  onAdd={() => addBlock('left2')}  {...colProps} />

          {/* Center */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Sub-items */}
            {activeBlock && (
              <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">
                    {activeBlock.emoji} {activeBlock.label}
                  </p>
                  <button
                    onClick={() => addItem(activeBlock.id)}
                    className="text-xs text-stone-500 border border-stone-200 px-2.5 py-1 rounded-lg hover:bg-stone-50 hover:text-stone-800 transition-colors"
                  >
                    + Add item
                  </button>
                </div>
                {activeBlock.items.length === 0 ? (
                  <p className="text-xs text-stone-300 py-1">No items yet — click "+ Add item"</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeBlock.items.map(item => (
                      <div key={item.id} className="group relative">
                        <button
                          onClick={() => selectItem(item)}
                          className={`
                            px-4 py-1.5 rounded-full border text-sm font-medium transition-all
                            ${activeItem?.id === item.id
                              ? 'bg-stone-800 border-stone-800 text-white'
                              : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-800 hover:text-white hover:border-stone-800'
                            }
                          `}
                        >
                          {item.label}
                        </button>
                        <button
                          onClick={() => setEditItemModal(item)}
                          className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-stone-100 text-stone-500 text-xs items-center justify-center hidden group-hover:flex hover:bg-stone-200"
                          title="Edit"
                        >✎</button>
                        <button
                          onClick={() => deleteItem(item.id, activeBlock.id)}
                          className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-100 text-red-400 text-xs items-center justify-center hidden group-hover:flex hover:bg-red-200"
                          title="Delete"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Textarea */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  {activeItem && (
                    <span className="text-xs text-stone-400 ml-2">
                      Editing: <span className="text-stone-600 font-medium">{activeItem.label}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-300">{content.length} chars</span>
                  <button
                    onClick={() => { setContent(''); setActiveItem(null) }}
                    disabled={!content}
                    className="text-xs text-stone-400 hover:text-stone-600 disabled:opacity-30 px-2 py-1 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={content}
                onChange={e => { setContent(e.target.value); setSaved(false) }}
                placeholder="Select a block → pick an item → edit here freely..."
                className="w-full px-6 py-5 text-base text-stone-700 bg-transparent resize-none outline-none leading-relaxed placeholder:text-stone-300"
                style={{ minHeight: 520, fontFamily: 'inherit' }}
              />

              <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50/50">
                <p className="text-xs text-stone-400">
                  {activeItem ? `Saving will update "${activeItem.label}"` : 'Select an item to enable saving'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!content}
                    className="px-3 py-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg bg-white hover:bg-stone-50 disabled:opacity-30 transition-all"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!content || !activeItem || saving}
                    className="px-4 py-1.5 text-xs font-medium bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-40 transition-all"
                  >
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <BlockColumn side="right1" label="Right 1" onAdd={() => addBlock('right1')} {...colProps} />
          <BlockColumn side="right2" label="Right 2" onAdd={() => addBlock('right2')} {...colProps} />

        </div>
      </div>

      {/* Modals */}
      {editBlockModal && (
        <EditModal
          title="Edit Block"
          fields={[
            { key: 'emoji', label: 'Emoji', value: editBlockModal.emoji },
            { key: 'label', label: 'Label', value: editBlockModal.label },
          ]}
          onSave={v => updateBlock(editBlockModal.id, { emoji: v.emoji, label: v.label })}
          onClose={() => setEditBlockModal(null)}
        />
      )}

      {editItemModal && (
        <EditModal
          title="Edit Item"
          fields={[
            { key: 'label', label: 'Label', value: editItemModal.label },
            { key: 'content', label: 'Template Content', value: editItemModal.content, multiline: true },
          ]}
          onSave={v => updateItem(editItemModal.id, editItemModal.block_id, { label: v.label, content: v.content })}
          onClose={() => setEditItemModal(null)}
        />
      )}
    </div>
  )
}