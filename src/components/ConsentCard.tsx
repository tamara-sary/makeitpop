import { useState } from 'react'
import { consent, setConsent } from '../lib/analytics'

// Small, one-time ask (not a wall): the site works fully either way.
// "No thanks" keeps cookieless, anonymous counting only; "Allow" turns on session recordings (inputs masked).
export function ConsentCard() {
  const [open, setOpen] = useState(() => consent() === 'unset')
  if (!open) return null
  const choose = (c: 'granted' | 'denied') => { setConsent(c); setOpen(false) }
  return (
    <section aria-label="Help improve Make It Pop" className="win fixed bottom-4 left-1/2 z-50 w-[min(420px,calc(100%-32px))] -translate-x-1/2 p-4">
      <p className="text-body-sm"><b>Help make it better?</b> Let us record anonymous sessions so we can see where the site is confusing. Anything you type stays hidden.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm" onClick={() => choose('granted')}>Allow</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose('denied')}>No thanks</button>
      </div>
    </section>
  )
}
