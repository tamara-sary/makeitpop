<!-- Shared rules for every AI agent in this repo (Cursor reads this file, Claude Code imports it via CLAUDE.md). Edit HERE only. -->

# Make It Pop design system

## Source of truth
- Tokens live in `tokens/tokens.json` (W3C DTCG format). It is mirrored in Figma Variables
  (collections "Primitives" and "Semantic").
- `src/styles/tokens.css`, `src/styles/tokens.theme.css` and `tokens/figma-sync.js` are GENERATED.
  Never edit them by hand. Edit tokens.json, then run `npm run tokens`.

## Using tokens
- NEVER write raw hex colours, rgb() or one-off `text-[13px]` sizes in components.
- Colours: use semantic Tailwind classes: `bg-paper`, `bg-desk`, `bg-cream`, `text-ink`, `text-muted`,
  `border-ink`, `bg-pink`, `bg-sun`, `bg-mint`, `bg-sky`, `text-leaf`, `bg-sticky-{sun|mint|pink|sky}`,
  editor UI: `bg-chrome-bg`, `text-chrome-text`, `border-chrome-border`, `bg-chrome-subtle`,
  `bg-chrome-selected`, `bg-canvas`, `bg-canvas-section`, `border-canvas-section-border`.
- In inline styles / canvas code use the CSS variable: `var(--color-sky)`, or read it with
  `getComputedStyle(document.documentElement).getPropertyValue('--color-paper')`.
- Type sizes: `text-micro` 11, `text-caption` 12, `text-ui` 13, `text-body-sm` 14, `text-body` 15,
  `text-lead` 17, `text-title-sm` 22, `text-title` 30. If a size is not in the scale, propose a token, do not invent one.
- Shadows: `shadow-pop-sm` / `shadow-pop-md` / `shadow-pop-lg` (hard ink offset).
- Fonts: `font-display` (Bricolage), `font-sans` (Figtree), `font-pixel` (Silkscreen).
- Missing token? STOP and propose an addition to tokens.json (primitive + semantic), never a raw value.
- Exception: `src/components/DesignPreview.tsx` draws the sample design members critique; its colours are content.

## Brand components (src/index.css @layer components)
- Reuse `.win`, `.tbar`, `.btn` (+ `.btn-ghost`, `.btn-sun`, `.btn-mint`, `.btn-sm`), `.chip`, `.field`, `.note`, `.pop-sticker`.
- Look: 2px ink borders, hard offset shadows, no rounded corners on brand components, playful tilt.
- Copy rule: UI says "sticky/stickies", never "crit".

## Accessibility (WCAG 2.2 AA)
- Text contrast >= 4.5:1, UI/borders >= 3:1. Focus ring = pink outline (global :focus-visible), never remove it.
- Respect `prefers-reduced-motion` for any new animation.
- Hit targets >= 24x24px. Status never colour-only.

## Workflow
- Small focused diffs, one concern per change. Do not reformat unrelated code.
- After UI changes run `npm run tokens:check` and `npm run build`.
- Deploys happen on push to `main` (Vercel). Work on a branch; never push to main without the owner's OK.
