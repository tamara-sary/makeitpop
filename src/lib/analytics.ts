// Product analytics (PostHog, EU cloud).
// Privacy model: cookieless by default (memory-only persistence, no session replay), so visits and funnel events
// are counted without a cookie banner. Only if the visitor clicks "Allow" do we persist an anonymous ID and record
// sessions (inputs masked). The choice is remembered per browser.
import posthog from 'posthog-js'
import { load, save } from './store'

const KEY = 'phc_zKYiDiCNfkdxWXA8XFBZdMSvv3coQkfcB6bX8oTvZH9u' // project key: public by design
export type Consent = 'unset' | 'granted' | 'denied'
const CONSENT_KEY = 'analytics-consent'
let ready = false

export const consent = () => load<Consent>(CONSENT_KEY, 'unset')

export function initAnalytics() {
  if (ready || typeof window === 'undefined' || location.hostname === 'localhost' && !location.search.includes('ph=1')) return
  const granted = consent() === 'granted'
  posthog.init(KEY, {
    api_host: 'https://eu.i.posthog.com',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24', // SPA page views on history changes, current recommended settings
    person_profiles: 'identified_only',
    persistence: granted ? 'localStorage+cookie' : 'memory',
    disable_session_recording: !granted,
    session_recording: { maskAllInputs: true },
    autocapture: true,
  })
  ready = true
}

export function setConsent(c: Exclude<Consent, 'unset'>) {
  save(CONSENT_KEY, c)
  if (!ready) return
  if (c === 'granted') {
    posthog.set_config({ persistence: 'localStorage+cookie' })
    posthog.startSessionRecording()
  } else {
    posthog.stopSessionRecording()
    posthog.set_config({ persistence: 'memory' })
  }
}

// Named product events for the core funnel. Safe to call anywhere; no-ops until init.
export type EventName =
  | 'landing_cta_clicked' | 'brief_started' | 'sticky_pinned' | 'stickies_unlocked'
  | 'editor_opened' | 'remix_edit' | 'remix_shot_saved' | 'code_downloaded'
  | 'figma_copy_clicked' | 'code_kit_opened' | 'caption_copied'
  | 'ai_connect_opened' | 'ai_connected' | 'steam_room_opened' | 'profile_created'
  | 'sign_in_google' | 'magic_link_sent'

export function track(event: EventName, props?: Record<string, string | number | boolean>) {
  if (ready) posthog.capture(event, props)
}
