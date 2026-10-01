import { useState, type FormEvent } from 'react'
import type { Comment } from '../data/days'

// A familiar comment section (LinkedIn-like behaviour) in Make It Pop style.

const AV = ['bg-sun', 'bg-mint', 'bg-pink', 'bg-paper']
const ago = (t: number) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000))
  return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`
}

function Avatar({ name }: { name: string }) {
  const bg = AV[name.charCodeAt(0) % AV.length]
  return <span className={`grid h-10 w-10 flex-none place-items-center border-2 border-ink font-display text-lg font-extrabold ${bg}`} aria-hidden="true">{name[0]?.toUpperCase()}</span>
}

function Composer({ onPost, placeholder, autoFocus, id }: { onPost: (t: string) => void; placeholder: string; autoFocus?: boolean; id: string }) {
  const [text, setText] = useState('')
  const [focus, setFocus] = useState(!!autoFocus)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onPost(text.trim())
    setText('')
  }
  return (
    <form onSubmit={submit} className="flex items-start gap-3">
      <Avatar name="You" />
      <div className="grid flex-1 gap-2">
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <textarea id={id} autoFocus={autoFocus} rows={focus || text ? 3 : 1} className="field resize-none" placeholder={placeholder}
          value={text} onChange={(e) => setText(e.target.value)} onFocus={() => setFocus(true)} />
        {(focus || text) && (
          <div className="flex justify-end">
            <button type="submit" className="btn btn-sm" disabled={!text.trim()}>Post</button>
          </div>
        )}
      </div>
    </form>
  )
}

function Item({ c, liked, onLike, onReply, isReply }: {
  c: Comment; liked: (id: string) => boolean; onLike: (id: string) => void; onReply?: (text: string) => void; isReply?: boolean
}) {
  const [replying, setReplying] = useState(false)
  return (
    <li className="grid gap-2">
      <div className="flex items-start gap-3">
        <Avatar name={c.name} />
        <div className="grid flex-1 gap-1">
          <div className="border-2 border-ink bg-paper p-3">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <strong>{c.name}</strong>
              <span className="text-[13px] text-muted">{c.level} designer</span>
              {c.sample && <span className="font-pixel text-[10px]">SAMPLE</span>}
              <span className="ml-auto text-[13px] text-muted">{ago(c.at)}</span>
            </div>
            <p className="mt-1 text-[15px]">{c.text}</p>
          </div>
          <div className="flex items-center gap-4 pl-1 text-[13px] font-semibold">
            <button type="button" className={'cursor-pointer border-0 bg-transparent p-0 ' + (liked(c.id) ? 'text-ink underline' : 'text-muted hover:text-ink')} aria-pressed={liked(c.id)} onClick={() => onLike(c.id)}>
              Like{c.likes + (liked(c.id) ? 1 : 0) > 0 ? ` · ${c.likes + (liked(c.id) ? 1 : 0)}` : ''}
            </button>
            {!isReply && onReply && (
              <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-ink" onClick={() => setReplying((r) => !r)}>Reply</button>
            )}
            {!isReply && c.replies.length > 0 && <span className="text-muted">{c.replies.length} repl{c.replies.length > 1 ? 'ies' : 'y'}</span>}
          </div>
        </div>
      </div>
      {(c.replies.length > 0 || replying) && (
        <ul className="m-0 grid list-none gap-3 border-l-2 border-ink/20 pl-4 sm:ml-12">
          {c.replies.map((r) => <Item key={r.id} c={r} liked={liked} onLike={onLike} isReply />)}
          {replying && onReply && (
            <li><Composer id={`reply-${c.id}`} autoFocus placeholder={`Reply to ${c.name}…`} onPost={(t) => { onReply(t); setReplying(false) }} /></li>
          )}
        </ul>
      )}
    </li>
  )
}

export function Comments({ comments, likedIds, onLike, onAdd, onReply }: {
  comments: Comment[]
  likedIds: string[]
  onLike: (id: string) => void
  onAdd: (text: string) => void
  onReply: (parentId: string, text: string) => void
}) {
  const [sort, setSort] = useState<'relevant' | 'newest'>('relevant')
  const liked = (id: string) => likedIds.includes(id)
  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0)
  const sorted = [...comments].sort((a, b) =>
    sort === 'newest' ? b.at - a.at : b.likes + b.replies.length * 2 - (a.likes + a.replies.length * 2),
  )

  return (
    <section className="grid max-w-3xl gap-5" aria-labelledby="comments-h">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="comments-h" className="text-3xl">Comments <span className="font-sans text-lg font-semibold text-muted">({total})</span></h2>
        <label className="flex items-center gap-2 text-[14px] font-semibold" htmlFor="comment-sort">Sort
          <select id="comment-sort" className="field w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as 'relevant' | 'newest')}>
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>
      <Composer id="comment-new" placeholder="Add a comment…" onPost={onAdd} />
      <ul className="m-0 grid list-none gap-5 p-0">
        {sorted.map((c) => (
          <Item key={c.id} c={c} liked={liked} onLike={onLike} onReply={(t) => onReply(c.id, t)} />
        ))}
      </ul>
    </section>
  )
}
