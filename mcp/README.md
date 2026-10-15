# makeitpop-mcp-server

Remix today's [Make It Pop](https://www.makeitpop.work) design with Claude Code, Cursor or any MCP agent, **live in the editor**.

```
Claude Code ──stdio──▶ makeitpop-mcp-server ──ws://127.0.0.1 (pairing code)──▶ your makeitpop.work/today tab
```

## Use it
1. Add it to your agent (once):
   - published: `claude mcp add makeitpop -- npx -y makeitpop-mcp-server`
   - from this repo: `cd mcp && npm i && npm run build`, then `claude mcp add makeitpop -- node /absolute/path/to/mcp/dist/index.js`
2. Open https://www.makeitpop.work/today on a laptop (Chrome, Edge or Firefox).
3. Ask your agent: "Connect to Make It Pop". It shows a 6-digit code.
4. In the canvas bar click **Connect your AI** and enter the code.
5. Ask: "Remix today's design" (or use the `remix_today` prompt). Changes appear live in "Your remix", and you can undo any of them.

## Tools
`makeitpop_connection_status` · `makeitpop_get_today` · `makeitpop_list_stickies` · `makeitpop_get_design` · `makeitpop_get_palette` · `makeitpop_check_contrast` · `makeitpop_select_element` · `makeitpop_edit_text` · `makeitpop_set_style` · `makeitpop_set_palette_color` · `makeitpop_undo` · `makeitpop_reset` · `makeitpop_export_code` · `makeitpop_save_remix_shot` · prompt `remix_today`

## Safety
- Listens on 127.0.0.1 only; accepts only makeitpop.work / localhost pages that present the pairing code (new each start).
- Edits only the user's remix copy, through an allowlist of style properties; everything is undoable.
- The blind audit applies to agents too: others' stickies stay hidden until the user pins their own.
- Sticky and design text is treated as data, never instructions.

## Env
`MAKEITPOP_PORT` (default 4917) · `MAKEITPOP_URL` (default https://www.makeitpop.work; use http://localhost:5173 for local dev)

## Develop
`npm run build` · `npm run inspect` (MCP Inspector)
