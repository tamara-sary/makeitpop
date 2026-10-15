# Design tokens: how Figma and code stay in sync

```
tokens/tokens.json            single source of truth (in git, reviewed in PRs)
   │  npm run tokens
   ├─► src/styles/tokens.css        CSS variables the site uses
   ├─► src/styles/tokens.theme.css  Tailwind classes (bg-pink, text-ui, shadow-pop-md)
   └─► tokens/figma-sync.js         paste in Figma plugin console → Figma Variables
.cursor/rules/design-system.mdc     keeps AI-generated code on the tokens
npm run tokens:check                flags raw hex / one-off sizes (guardrail)
```

## Two layers
- **Primitives** = names for raw values (`color/pink/400 = #ff7ac6`). Hidden from Figma pickers.
- **Semantic** = what a value is for (`color/pink` = primary action + focus). Components and Figma fills use these.

## Change a token
1. Edit `tokens/tokens.json`
2. `npm run tokens` (regenerates CSS + Figma script)
3. Figma: Plugins → Development → Open console → paste `tokens/figma-sync.js` → Enter
4. Commit on a branch → PR → preview deploy → merge

## Change came from Figma first?
Update the value in tokens.json to match, then steps 2-4. tokens.json always wins; Figma mirrors it.

Why not Figma as the source? Figma's Variables REST API needs an Enterprise plan, and code is what ships.
JSON in git gives history, review and one place for both tools to read from.
