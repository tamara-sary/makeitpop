# Day 1 generators

- `gen_day1.py` — writes `challenges/day-01/index.html` (chart + gauge SVG maths, shared data) and `figma_assets.json`. Run from `challenges/day-01/`: `python3 ../../tools/day-01/gen_day1.py` (paths: run from repo root and adjust if needed).
- `figma_template.js` — the Figma builder source. `__ASSETS__` gets replaced with `figma_assets.json`, then every non-ASCII char is escaped (\uXXXX) because the Figma console chokes on them. Output: `challenges/day-01/figma-builder.js`.
