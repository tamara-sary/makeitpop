<!-- Shared rules for every AI agent in this repo (Cursor reads this file, Claude Code imports it via CLAUDE.md). Edit HERE only. -->

# Make It Pop design system

## Source of truth
- Tokens live in `tokens/tokens.json` (W3C DTCG format). It is mirrored in Figma Variables
  (collections "Primitives" and "Semantic").
- `src/styles/tokens.css`, `src/styles/tokens.theme.css`, `tokens/figma-sync.js`, `tokens/figma-plugin/code.js`
  and `tokens/figma-mcp-sync.js` are GENERATED.
  Never edit them by hand. Edit tokens.json, then run `npm run tokens`.

## Token sync (code -> Figma)
- Code owns the values. Figma is a mirror: never change a token value in Figma first.
- Change a token: edit `tokens/tokens.json` -> `npm run tokens` -> sync the Figma library
  "Make It Pop · Design System" (file key `29xEu8ptoS1vCNG9Kfdvr9`) by running the contents of
  `tokens/figma-mcp-sync.js` with the Figma MCP `use_figma` tool. It returns `{ created, updated, unchanged, figmaOnly }`.
- "Check Figma drift": run the same script with `const DRY = false;` changed to `const DRY = true;` (read-only).
  Anything in `updated` / `created` = Figma is behind code; `figmaOnly` = variable added in Figma by hand:
  ask the owner whether to add it to tokens.json or delete it in Figma. The script never deletes.
- After a sync, the owner publishes the library in Figma (Assets -> Publish) so files using it get the update.

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
- Text contrast >= 4.5:1, UI/borders >= 3:1. Focus ring = ink outline (global :focus-visible; pink was invisible on the pink hero), never remove it.
- Respect `prefers-reduced-motion` for any new animation.
- Hit targets >= 24x24px. Status never colour-only.

## Workflow
- Small focused diffs, one concern per change. Do not reformat unrelated code.
- After UI changes run `npm run tokens:check` and `npm run build`.
- Deploys happen on push to `main` (Vercel). Work on a branch; never push to main without the owner's OK.
