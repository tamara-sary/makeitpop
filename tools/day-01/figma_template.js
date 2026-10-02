// Make It Pop - Day 1 Figma builder (Brightloop spend overview)
// HOW TO RUN: open a NEW empty Figma design file > Plugins > Development > Show/Hide console > paste all > Enter.
// Builds on ONE page (Starter plan friendly): colour variables, components, and sections Original / Your remix / Share / Components.
// Safe to re-run: it removes its own previous variables first.

{
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
await figma.loadFontAsync({ family: "Inter", style: "Bold" });

const A = __ASSETS__;
const EUR = "€", DOT = "·";

// ---------- tokens as Figma variables ----------
const HEX = { page: "E9ECF2", panel: "FFFFFF", surface: "F5F6F8", ink: "16181D", ink2: "3C4049", muted: "6B7180", line: "E6E8EE", blue: "2F6BFF", blueSoft: "EAF0FF", barSoft: "DBE5FF", green: "1F9D55", greenSoft: "E6F6EC", greenLine: "A9DFBD", amber: "B45309", amberSoft: "FFF3E0", red: "D93B3B", redSoft: "FDECEC", peach: "FFD9C2", peachInk: "8A3B12", sticky: "FFE14D" };
function rgb(h) { return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; }
for (const old of await figma.variables.getLocalVariableCollectionsAsync()) { if (old.name === "Brightloop tokens") old.remove(); }
const coll = figma.variables.createVariableCollection("Brightloop tokens");
const MODE = coll.modes[0].modeId;
const V = {};
for (const k of Object.keys(HEX)) {
  const v = figma.variables.createVariable("color/" + k, coll, "COLOR");
  v.setValueForMode(MODE, rgb(HEX[k]));
  V[k] = v;
}
function paint(k) { return [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: rgb(HEX[k]) }, "color", V[k])]; }

// ---------- helpers ----------
function box(name, dir, gap, pad, fill) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.itemSpacing = gap || 0;
  const p = Array.isArray(pad) ? pad : [pad || 0, pad || 0, pad || 0, pad || 0];
  f.paddingTop = p[0]; f.paddingRight = p[1]; f.paddingBottom = p[2]; f.paddingLeft = p[3];
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = fill ? paint(fill) : [];
  f.clipsContent = false;
  return f;
}
function txt(s, size, style, color, name) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: style || "Regular" };
  t.characters = s;
  t.fontSize = size;
  t.fills = paint(color || "ink");
  t.name = name || s.slice(0, 28);
  return t;
}
function add(parent, child, h, v) {
  parent.appendChild(child);
  if (h) child.layoutSizingHorizontal = h;
  if (v) child.layoutSizingVertical = v;
  return child;
}
function stroke(f, k, w) { f.strokes = paint(k); f.strokeWeight = w || 1; f.strokeAlign = "INSIDE"; }
function card(name) { const c = box(name, "VERTICAL", 12, 20, "panel"); c.cornerRadius = 16; stroke(c, "line"); return c; }
function svgNode(str, name) { const n = figma.createNodeFromSvg(str); n.name = name; return n; }
function iconSvg(key, hex) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#' + hex + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + A.icons[key] + "</svg>";
}

// ---------- pages ----------
// ---------- sections on the current page (no new pages) ----------
const PAGE = figma.currentPage; PAGE.name = "Make It Pop " + DOT + " Day 1";
for (const n of PAGE.children.slice()) { if (n.type === "SECTION" && ["Original", "Your remix", "Share", "Components"].indexOf(n.name) >= 0) n.remove(); }
function section(name) { const s = figma.createSection(); s.name = name; PAGE.appendChild(s); return s; }
const pOriginal = section("Original"), pRemix = section("Your remix"), pShare = section("Share"), pComp = section("Components");

// ---------- components ----------
const compBoard = box("Components", "VERTICAL", 40, 40, "panel");
pComp.appendChild(compBoard);
const iconRow = box("Icons", "HORIZONTAL", 16, 0); add(compBoard, iconRow);
const ICON = {};
for (const key of Object.keys(A.icons)) {
  const c = figma.createComponent();
  c.name = "Icon/" + key;
  c.resize(18, 18);
  c.fills = [];
  const g = svgNode(iconSvg(key, "3C4049"), "glyph");
  c.appendChild(g); g.x = 0; g.y = 0;
  iconRow.appendChild(c);
  ICON[key] = c;
}

function navComponent(active) {
  const c = figma.createComponent();
  c.name = active ? "Nav item/Active" : "Nav item/Default";
  c.layoutMode = "HORIZONTAL"; c.itemSpacing = 12;
  c.paddingTop = 9; c.paddingBottom = 9; c.paddingLeft = 10; c.paddingRight = 10;
  c.primaryAxisSizingMode = "FIXED"; c.counterAxisSizingMode = "AUTO"; c.counterAxisAlignItems = "CENTER";
  c.resize(204, 38);
  c.cornerRadius = 10;
  c.fills = active ? paint("blueSoft") : [];
  const ic = ICON.grid.createInstance(); ic.name = "icon"; c.appendChild(ic);
  const label = txt("Overview", 14, active ? "Semi Bold" : "Medium", active ? "blue" : "ink2", "label");
  c.appendChild(label);
  const kL = c.addComponentProperty("Label", "TEXT", "Overview");
  label.componentPropertyReferences = { characters: kL };
  const kI = c.addComponentProperty("Icon", "INSTANCE_SWAP", ICON.grid.id);
  ic.componentPropertyReferences = { mainComponent: kI };
  return { c: c, kL: kL, kI: kI };
}
const NAV = navComponent(false), NAV_ON = navComponent(true);
const navRow = box("Nav items", "HORIZONTAL", 16, 0); add(compBoard, navRow); navRow.appendChild(NAV.c); navRow.appendChild(NAV_ON.c);

function buttonComponent(kind) {
  const c = figma.createComponent();
  c.name = "Button/" + kind;
  c.layoutMode = "HORIZONTAL"; c.itemSpacing = 8; c.counterAxisAlignItems = "CENTER";
  c.primaryAxisSizingMode = "AUTO"; c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = 999;
  if (kind === "Primary") { c.paddingTop = 11; c.paddingBottom = 11; c.paddingLeft = 18; c.paddingRight = 18; c.fills = paint("blue"); }
  else { c.paddingTop = 6; c.paddingBottom = 6; c.paddingLeft = 12; c.paddingRight = 12; c.fills = paint("panel"); stroke(c, "line"); }
  const label = txt(kind === "Primary" ? "Share with founders" : "Review", kind === "Primary" ? 14 : 12.5, "Semi Bold", kind === "Primary" ? "panel" : "ink", "label");
  c.appendChild(label);
  const k = c.addComponentProperty("Label", "TEXT", label.characters);
  label.componentPropertyReferences = { characters: k };
  return { c: c, k: k };
}
const BTN = buttonComponent("Primary"), GHOST = buttonComponent("Ghost");
const btnRow = box("Buttons", "HORIZONTAL", 16, 0); add(compBoard, btnRow); btnRow.appendChild(BTN.c); btnRow.appendChild(GHOST.c);

function navItem(label, iconKey, active) {
  const N = active ? NAV_ON : NAV;
  const i = N.c.createInstance();
  const props = {}; props[N.kL] = label; props[N.kI] = ICON[iconKey].id;
  i.setProperties(props);
  i.name = "Nav/" + label;
  return i;
}
function ghost(label) { const i = GHOST.c.createInstance(); const p = {}; p[GHOST.k] = label; i.setProperties(p); return i; }
function chip(label, fg, bg) {
  const c = box("Chip", "HORIZONTAL", 4, [4, 10, 4, 10], bg); c.cornerRadius = 999;
  c.appendChild(txt(label, 12.5, "Semi Bold", fg)); return c;
}

// ---------- the dashboard ----------
const root = box("Day 01 " + DOT + " Brightloop spend overview", "VERTICAL", 0, 24, "page");
pOriginal.appendChild(root);
const app = box("App", "HORIZONTAL", 0, 0, "panel"); app.cornerRadius = 24;
app.effects = [{ type: "DROP_SHADOW", color: { r: 0.12, g: 0.16, b: 0.27, a: 0.08 }, offset: { x: 0, y: 20 }, radius: 60, spread: 0, visible: true, blendMode: "NORMAL" }];
add(root, app);
app.primaryAxisSizingMode = "FIXED"; app.resize(1392, 960); app.counterAxisSizingMode = "AUTO";

// sidebar
const side = box("Sidebar", "VERTICAL", 24, [24, 14, 24, 14]);
app.appendChild(side); side.layoutAlign = "STRETCH"; side.primaryAxisSizingMode = "FIXED"; side.counterAxisSizingMode = "FIXED"; side.resize(232, 900);
const brand = box("Brand", "HORIZONTAL", 10, [0, 10, 0, 10]); brand.counterAxisAlignItems = "CENTER"; add(side, brand);
const mark = figma.createRectangle(); mark.name = "Logo mark"; mark.resize(26, 26); mark.cornerRadius = 8; mark.fills = paint("blue"); brand.appendChild(mark);
brand.appendChild(txt("Brightloop", 17, "Bold"));
const nav = box("Nav", "VERTICAL", 2, 0); add(side, nav, "FILL");
const NAVS = [["Overview", "grid", true], ["Spend", "spend"], ["Cards", "card"], ["Bills", "bill"], ["Receipts", "receipt"], ["Budgets", "budget"], ["Teams", "team"], ["Reports", "report"]];
for (const n of NAVS) {
  const it = navItem(n[0], n[1], !!n[2]); add(nav, it, "FILL");
  if (n[0] === "Receipts") {
    // badge floats over the nav item (absolute inside a wrapper), so the component stays simple
    const wrap = box("Receipts row", "HORIZONTAL", 0, 0);
    nav.insertChild(nav.children.indexOf(it), wrap); wrap.layoutSizingHorizontal = "FILL"; add(wrap, it, "FILL");
    const b = box("Badge", "HORIZONTAL", 0, [2, 7, 2, 7], "blue"); b.cornerRadius = 99; b.appendChild(txt("7", 11, "Semi Bold", "panel"));
    wrap.appendChild(b); b.layoutPositioning = "ABSOLUTE"; b.constraints = { horizontal: "MAX", vertical: "CENTER" };
    b.x = wrap.width - b.width - 10; b.y = (wrap.height - b.height) / 2;
  }
}
const spacer = box("Spacer", "VERTICAL", 0, 0); side.appendChild(spacer); spacer.layoutAlign = "STRETCH"; spacer.layoutGrow = 1;
const sideBottom = box("Sidebar bottom", "VERTICAL", 2, 0); add(side, sideBottom, "FILL");
add(sideBottom, navItem("Settings", "gear", false), "FILL");
add(sideBottom, navItem("Help & support", "help", false), "FILL");
const me = box("Account", "HORIZONTAL", 10, 10, "panel"); me.cornerRadius = 12; stroke(me, "line"); me.counterAxisAlignItems = "CENTER"; add(sideBottom, me, "FILL"); me.paddingTop = 10;
function avatar(size) { const a = box("Avatar", "HORIZONTAL", 0, 0, "peach"); a.primaryAxisSizingMode = "FIXED"; a.counterAxisSizingMode = "FIXED"; a.resize(size, size); a.cornerRadius = size / 2; a.primaryAxisAlignItems = "CENTER"; a.counterAxisAlignItems = "CENTER"; a.appendChild(txt("MO", 12, "Bold", "peachInk")); return a; }
me.appendChild(avatar(34));
const meTxt = box("Name", "VERTICAL", 0, 0); me.appendChild(meTxt); meTxt.appendChild(txt("Maya Ortiz", 13, "Semi Bold")); meTxt.appendChild(txt("Operations", 12, "Regular", "muted"));

// main area
const main = box("Main", "VERTICAL", 0, 0, "surface"); main.cornerRadius = 20;
add(app, main, "FILL");
app.paddingTop = 10; app.paddingBottom = 10; app.paddingRight = 10;
const topBar = box("Top bar", "HORIZONTAL", 16, [14, 20, 14, 20], "panel"); topBar.counterAxisAlignItems = "CENTER"; topBar.primaryAxisAlignItems = "SPACE_BETWEEN";
topBar.topLeftRadius = 20; topBar.topRightRadius = 20; topBar.strokes = paint("line"); topBar.strokeTopWeight = 0; topBar.strokeLeftWeight = 0; topBar.strokeRightWeight = 0; topBar.strokeBottomWeight = 1;
add(main, topBar, "FILL");
const pill = box("Workspace", "HORIZONTAL", 6, [8, 14, 8, 14], "panel"); pill.cornerRadius = 99; stroke(pill, "line"); pill.counterAxisAlignItems = "CENTER";
pill.appendChild(ICON.chev.createInstance()); pill.appendChild(txt("Brightloop " + DOT + " October 2026", 14, "Medium")); topBar.appendChild(pill);
const search = box("Search", "HORIZONTAL", 8, [8, 14, 8, 14], "surface"); search.cornerRadius = 99; stroke(search, "line"); search.counterAxisAlignItems = "CENTER";
search.primaryAxisSizingMode = "FIXED"; search.resize(380, 38); search.appendChild(ICON.search.createInstance()); search.appendChild(txt("Search transactions, suppliers…", 14, "Regular", "muted")); topBar.appendChild(search);
const topR = box("Actions", "HORIZONTAL", 10, 0); topR.counterAxisAlignItems = "CENTER"; topBar.appendChild(topR);
for (const k of ["sun", "bell"]) { const r = box("Icon button", "HORIZONTAL", 0, 9, "panel"); r.cornerRadius = 99; stroke(r, "line"); r.appendChild(ICON[k].createInstance()); topR.appendChild(r); }
topR.appendChild(avatar(36));

const content = box("Content", "VERTICAL", 20, 24); add(main, content, "FILL");
const hello = box("Greeting", "HORIZONTAL", 16, 0); hello.primaryAxisAlignItems = "SPACE_BETWEEN"; hello.counterAxisAlignItems = "MAX"; add(content, hello, "FILL");
const hi = box("Heading", "VERTICAL", 4, 0); hello.appendChild(hi);
hi.appendChild(txt("Good morning, Maya", 26, "Bold")); hi.appendChild(txt("Monday, 20 October " + DOT + " 11 days left this month", 14, "Regular", "muted"));
const share = BTN.c.createInstance(); hello.appendChild(share);

const grid = box("Grid", "HORIZONTAL", 20, 0); add(content, grid, "FILL");
const left = box("Left column", "VERTICAL", 20, 0); add(grid, left, "FILL");
const right = box("Right column", "VERTICAL", 20, 0); add(grid, right, "FIXED"); right.resize(392, right.height);

// spend card
const spend = card("Card " + DOT + " Spent this month"); add(left, spend, "FILL");
const sh = box("Header", "HORIZONTAL", 16, 0); sh.primaryAxisAlignItems = "SPACE_BETWEEN"; add(spend, sh, "FILL");
const sl = box("Numbers", "VERTICAL", 6, 0); sh.appendChild(sl);
sl.appendChild(txt("Spent this month", 15, "Semi Bold", "ink2"));
const bigRow = box("Big number", "HORIZONTAL", 8, 0); bigRow.counterAxisAlignItems = "BASELINE"; sl.appendChild(bigRow);
bigRow.appendChild(txt(EUR + "31,240", 34, "Bold")); bigRow.appendChild(txt("of " + EUR + "42,000 budget", 15, "Medium", "muted"));
const chips = box("Status", "HORIZONTAL", 10, 0); chips.counterAxisAlignItems = "CENTER"; sl.appendChild(chips);
chips.appendChild(chip(EUR + "4,143 ahead of pace", "amber", "amberSoft")); chips.appendChild(txt("74% of the budget used, 11 days to go", 13, "Regular", "muted"));
function seg(labels, small) {
  const s = box("Segmented", "HORIZONTAL", 2, 3, "surface"); s.cornerRadius = 10;
  labels.forEach(function (l, i) {
    const b = box("Option/" + l, "HORIZONTAL", 0, small ? [5, 10, 5, 10] : [6, 12, 6, 12], i === 0 ? "panel" : null); b.cornerRadius = 8;
    if (i === 0) b.effects = [{ type: "DROP_SHADOW", color: { r: 0.08, g: 0.12, b: 0.24, a: 0.12 }, offset: { x: 0, y: 1 }, radius: 3, spread: 0, visible: true, blendMode: "NORMAL" }];
    b.appendChild(txt(l, small ? 12.5 : 14, "Medium", i === 0 ? "ink" : "muted")); s.appendChild(b);
  });
  return s;
}
sh.appendChild(seg(["1M", "3M", "6M", "1Y"]));
const chartWrap = figma.createFrame(); chartWrap.name = "Chart"; chartWrap.fills = []; chartWrap.clipsContent = false;
spend.appendChild(chartWrap);
const chart = svgNode(A.chart.split("EUR").join(EUR), "Spend vs pace (vector)");
const scale = 652 / chart.width; chart.rescale(scale);
chartWrap.resize(652, chart.height); chartWrap.appendChild(chart); chart.x = 0; chart.y = 0;
const tip = box("Tooltip", "VERTICAL", 4, [10, 12, 10, 12], "panel"); tip.cornerRadius = 12; stroke(tip, "line");
tip.effects = [{ type: "DROP_SHADOW", color: { r: 0.08, g: 0.12, b: 0.24, a: 0.12 }, offset: { x: 0, y: 10 }, radius: 30, spread: 0, visible: true, blendMode: "NORMAL" }];
const tc = chip("+" + EUR + "4,143 vs pace", "amber", "amberSoft"); tc.paddingTop = 2; tc.paddingBottom = 2; tip.appendChild(tc);
tip.appendChild(txt(EUR + "31,240", 17, "Bold"));
function legend(label, k) { const l = box("Legend", "HORIZONTAL", 6, 0); l.counterAxisAlignItems = "CENTER"; const sw = figma.createRectangle(); sw.resize(12, 3); sw.cornerRadius = 2; sw.fills = paint(k); l.appendChild(sw); l.appendChild(txt(label, 12, "Regular", "ink2")); return l; }
tip.appendChild(legend("Spent by 20 Oct", "blue")); tip.appendChild(legend(EUR + "27,097 at even pace", "muted"));
chartWrap.appendChild(tip);
tip.x = A.tipX * scale - tip.width - 14; tip.y = A.tipY * scale - tip.height / 2;

// attention card
const attn = card("Card " + DOT + " Needs your attention"); add(left, attn, "FILL");
const ah = box("Header", "HORIZONTAL", 8, 0); ah.primaryAxisAlignItems = "SPACE_BETWEEN"; add(attn, ah, "FILL");
ah.appendChild(txt("Needs your attention", 15, "Semi Bold", "ink2")); ah.appendChild(txt("See all", 13, "Semi Bold", "blue"));
const th = box("Table header", "HORIZONTAL", 12, [8, 10, 8, 10], "surface"); th.cornerRadius = 8; add(attn, th, "FILL");
const thSp = box("Icon col", "HORIZONTAL", 0, 0); thSp.primaryAxisSizingMode = "FIXED"; thSp.resize(32, 14); th.appendChild(thSp);
add(th, txt("Issue", 12, "Medium", "muted"), "FILL"); const thA = txt("Amount", 12, "Medium", "muted"); th.appendChild(thA); const thB = box("Action col", "HORIZONTAL", 0, 0); thB.primaryAxisSizingMode = "FIXED"; thB.resize(104, 14); th.appendChild(thB);
const ROWS = [["up", "amber", "amberSoft", "AWS is 38% higher than last month", "Software " + DOT + " Engineering", EUR + "4,120", "Review"],
  ["repeat", "blue", "blueSoft", "Notion renews in 5 days", "Annual plan " + DOT + " " + EUR + "2,880 per year", EUR + "2,880", "Check plan"],
  ["receipt", "amber", "amberSoft", "7 card payments are missing receipts", "Oldest from 3 Oct", EUR + "1,486", "Remind team"],
  ["copy", "red", "redSoft", "Possible duplicate charge", "Linear " + DOT + " 14 Oct " + DOT + " charged twice", EUR + "96", "Dispute"]];
ROWS.forEach(function (r, i) {
  const row = box("Row/" + r[3].slice(0, 20), "HORIZONTAL", 12, [12, 10, 12, 10]); row.counterAxisAlignItems = "CENTER"; add(attn, row, "FILL");
  if (i < ROWS.length - 1) { row.strokes = paint("line"); row.strokeTopWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; row.strokeBottomWeight = 1; }
  const t = box("Type", "HORIZONTAL", 0, 7, r[2]); t.cornerRadius = 9; const ic = svgNode(iconSvg(r[0], HEX[r[1]]), "icon"); t.appendChild(ic); row.appendChild(t);
  const tx = box("Text", "VERTICAL", 2, 0); add(row, tx, "FILL"); tx.appendChild(txt(r[3], 14, "Semi Bold")); tx.appendChild(txt(r[4], 12.5, "Regular", "muted"));
  const amt = txt(r[5], 14, "Semi Bold"); amt.textAlignHorizontal = "RIGHT"; row.appendChild(amt);
  const act = box("Action", "HORIZONTAL", 0, 0); act.primaryAxisSizingMode = "FIXED"; act.resize(104, 30); act.primaryAxisAlignItems = "MAX"; act.counterAxisAlignItems = "CENTER"; row.appendChild(act); act.appendChild(ghost(r[6]));
});

// runway card
const run = card("Card " + DOT + " Months of money left"); add(right, run, "FILL");
const rh = box("Header", "HORIZONTAL", 8, 0); rh.primaryAxisAlignItems = "SPACE_BETWEEN"; rh.counterAxisAlignItems = "CENTER"; add(run, rh, "FILL");
rh.appendChild(txt("Months of money left", 15, "Semi Bold", "green"));
const tag = box("Tag", "HORIZONTAL", 0, [4, 10, 4, 10], "greenSoft"); tag.cornerRadius = 8; stroke(tag, "greenLine"); tag.appendChild(txt("Healthy", 12.5, "Semi Bold", "green")); rh.appendChild(tag);
const rb = box("Big number", "HORIZONTAL", 8, 0); rb.counterAxisAlignItems = "BASELINE"; run.appendChild(rb); rb.appendChild(txt("12", 40, "Bold")); rb.appendChild(txt("months", 15, "Medium", "muted"));
const rp = txt(EUR + "612,000 in the bank\nSpending about " + EUR + "51,000 a month", 14, "Regular", "muted"); rp.lineHeight = { value: 22, unit: "PIXELS" }; run.appendChild(rp);

// teams card
const teams = card("Card " + DOT + " Where it went"); add(right, teams, "FILL");
teams.appendChild(txt("Where it went", 15, "Semi Bold", "ink2"));
teams.appendChild(seg(["By team", "By category", "Suppliers"], true));
const bars = box("Bars", "HORIZONTAL", 14, [22, 0, 0, 0]); bars.counterAxisAlignItems = "MAX"; add(teams, bars, "FILL");
const TEAMS = [["Eng", 12900], ["Mkt", 8350], ["Sales", 4700], ["Ops", 3190], ["Design", 2100]];
TEAMS.forEach(function (t, i) {
  const col = box("Bar/" + t[0], "VERTICAL", 6, 0); col.counterAxisAlignItems = "CENTER"; add(bars, col, "FILL");
  col.appendChild(txt(EUR + (t[1] / 1000).toFixed(1) + "k", 11.5, "Semi Bold", "ink2"));
  const b = figma.createRectangle(); b.name = "Bar"; b.resize(34, Math.round(t[1] / 14000 * 150)); b.topLeftRadius = 8; b.topRightRadius = 8; b.bottomLeftRadius = 4; b.bottomRightRadius = 4; b.fills = paint(i === 0 ? "blue" : "barSoft"); col.appendChild(b);
  col.appendChild(txt(t[0], 12, "Regular", "muted"));
});

// gauge card
const gauge = card("Card " + DOT + " Budget used"); add(right, gauge, "FILL"); gauge.counterAxisAlignItems = "CENTER";
const gh = box("Header", "HORIZONTAL", 8, 0); gh.primaryAxisAlignItems = "SPACE_BETWEEN"; add(gauge, gh, "FILL");
gh.appendChild(txt("Budget used", 15, "Semi Bold", "ink2")); gh.appendChild(txt("•••", 14, "Bold", "muted"));
const gw = figma.createFrame(); gw.name = "Gauge"; gw.fills = []; gw.clipsContent = false; gauge.appendChild(gw);
const gsv = svgNode(A.gauge, "Gauge arcs (vector)"); gsv.rescale(1.15); gw.resize(gsv.width, gsv.height); gw.appendChild(gsv); gsv.x = 0; gsv.y = 0;
const gval = txt("74%", 32, "Bold"); gw.appendChild(gval); gval.x = gw.width / 2 - gval.width / 2; gval.y = gw.height - 64;
const gsub = txt(EUR + "31,240 of " + EUR + "42,000", 12, "Regular", "muted"); gw.appendChild(gsub); gsub.x = gw.width / 2 - gsub.width / 2; gsub.y = gw.height - 24;
gauge.appendChild(txt("At this pace you'll reach the budget around 27 Oct", 13, "Regular", "muted"));

root.locked = false;

// ---------- read me (Original page) ----------
function note(title, lines, w) {
  const n = box(title, "VERTICAL", 10, 24, "sticky"); n.primaryAxisSizingMode = "AUTO"; n.counterAxisSizingMode = "FIXED"; n.resize(w || 420, n.height);
  stroke(n, "ink", 2);
  n.effects = [{ type: "DROP_SHADOW", color: { r: 0.09, g: 0.09, b: 0.09, a: 1 }, offset: { x: 5, y: 5 }, radius: 0, spread: 0, visible: true, blendMode: "NORMAL" }];
  add(n, txt(title, 22, "Bold"), "FILL");
  for (const l of lines) { const t = txt(l, 15, "Regular"); add(n, t, "FILL"); t.textAutoResize = "HEIGHT"; t.lineHeight = { value: 22, unit: "PIXELS" }; }
  return n;
}
const readme = note("Make It Pop " + DOT + " Day 1", [
  "Finance dashboard: spend overview for a small team.",
  "WHO: Maya, operations lead at Brightloop, a 22-person startup with no finance team. Every Monday she has 5 minutes before the founders' meeting.",
  "SHE NEEDS: 1) Are we on track? 2) Where did the money go? 3) What needs me?",
  "She isn't a finance person. If she has to think about what a number means, the dashboard failed.",
  "HOW TO REMIX: work in the 'Your remix' section. When you're done, export the 2 slides in the 'Share' section and post them on LinkedIn.",
  "Free to remix. Just credit Make It Pop when you post. makeitpop.work/day/1"
], 440);
pOriginal.appendChild(readme); readme.x = root.width + 80; readme.y = 0;
root.locked = true;

// ---------- Your remix page ----------
const remix = root.clone(); remix.name = "Day 01 " + DOT + " your remix"; pRemix.appendChild(remix); remix.locked = false; remix.x = 0; remix.y = 0;
const start = note("Start here", [
  "Can Maya answer her 3 questions in 5 seconds?",
  "Check today's crits on makeitpop.work/day/1 and pick the one you'd fix first.",
  "Tip: duplicate this frame before big changes so you keep your steps."
], 400);
pRemix.appendChild(start); start.x = remix.width + 80; start.y = 0;

// ---------- Share page (LinkedIn carousel 1080 x 1350) ----------
function slide(name, label, x) {
  const s = box(name, "VERTICAL", 32, 64, "panel"); s.primaryAxisSizingMode = "FIXED"; s.counterAxisSizingMode = "FIXED"; s.resize(1080, 1350);
  s.primaryAxisAlignItems = "SPACE_BETWEEN";
  pShare.appendChild(s); s.x = x; s.y = 0;
  const head = box("Label", "HORIZONTAL", 0, [8, 16, 8, 16], "sticky"); stroke(head, "ink", 2); head.appendChild(txt(label, 28, "Bold")); s.appendChild(head);
  const slot = box("Design slot", "VERTICAL", 0, 0, "page"); slot.primaryAxisSizingMode = "FIXED"; slot.counterAxisSizingMode = "FIXED"; slot.resize(952, 900); slot.cornerRadius = 16;
  slot.primaryAxisAlignItems = "CENTER"; slot.counterAxisAlignItems = "CENTER"; slot.clipsContent = true; s.appendChild(slot);
  const foot = box("Credit", "HORIZONTAL", 0, 0); foot.primaryAxisAlignItems = "SPACE_BETWEEN"; add(s, foot, "FILL");
  foot.appendChild(txt("Remixed from Make It Pop " + DOT + " Day 1", 24, "Semi Bold"));
  foot.appendChild(txt("makeitpop.work", 24, "Regular", "muted"));
  return slot;
}
const beforeSlot = slide("Slide 1 " + DOT + " Before", "BEFORE", 0);
const thumb = root.clone(); thumb.locked = false; thumb.rescale(0.62); beforeSlot.appendChild(thumb);
const afterSlot = slide("Slide 2 " + DOT + " After", "AFTER (your remix)", 1160);
afterSlot.appendChild(txt("Paste a copy of your remix here and scale it to fit", 22, "Medium", "muted"));

// fit each section around its content and lay them out left to right
function fit(sec) {
  const kids = sec.children; let maxX = 0, maxY = 0;
  for (const k of kids) { k.x += 80; k.y += 120; maxX = Math.max(maxX, k.x + k.width); maxY = Math.max(maxY, k.y + k.height); }
  sec.resizeWithoutConstraints(maxX + 80, maxY + 80);
}
let cursor = 0;
for (const sec of [pOriginal, pRemix, pShare, pComp]) { fit(sec); sec.x = cursor; sec.y = 0; cursor += sec.width + 200; }
figma.viewport.scrollAndZoomIntoView([pOriginal]);
figma.notify("Make It Pop Day 1 built: Original, Your remix, Share, Components");
}
