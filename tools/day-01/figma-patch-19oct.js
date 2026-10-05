// Make It Pop - Day 1 PATCH: Monday 19 October data fix (no rebuild needed)
// HOW TO RUN: open your Day 1 Figma file > Plugins > Development > Show/Hide console > paste all > Enter.
// Changes every copy on the page (Original, Your remix, Share thumbnail):
//   date + numbers, the spend line (now ends on 19 Oct), tooltip position, and the cut-off "Over" gauge label.

{
const EUR = "\u20ac", DOT = "\u00b7";
const CHART = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"680\" height=\"250\" viewBox=\"-44 -10 680 250\">\n<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#2F6BFF\" stop-opacity=\"0.22\"/><stop offset=\"1\" stop-color=\"#2F6BFF\" stop-opacity=\"0\"/></linearGradient></defs>\n<line x1=\"0\" x2=\"620\" y1=\"210.0\" y2=\"210.0\" stroke=\"#E6E8EE\" stroke-width=\"1\"/><text x=\"-10\" y=\"214.0\" text-anchor=\"end\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">EUR0k</text><line x1=\"0\" x2=\"620\" y1=\"163.3\" y2=\"163.3\" stroke=\"#E6E8EE\" stroke-width=\"1\"/><text x=\"-10\" y=\"167.3\" text-anchor=\"end\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">EUR10k</text><line x1=\"0\" x2=\"620\" y1=\"116.7\" y2=\"116.7\" stroke=\"#E6E8EE\" stroke-width=\"1\"/><text x=\"-10\" y=\"120.7\" text-anchor=\"end\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">EUR20k</text><line x1=\"0\" x2=\"620\" y1=\"70.0\" y2=\"70.0\" stroke=\"#E6E8EE\" stroke-width=\"1\"/><text x=\"-10\" y=\"74.0\" text-anchor=\"end\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">EUR30k</text><line x1=\"0\" x2=\"620\" y1=\"23.3\" y2=\"23.3\" stroke=\"#E6E8EE\" stroke-width=\"1\"/><text x=\"-10\" y=\"27.3\" text-anchor=\"end\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">EUR40k</text>\n<line x1=\"0\" x2=\"620\" y1=\"14.0\" y2=\"14.0\" stroke=\"#D93B3B\" stroke-width=\"1.2\" stroke-dasharray=\"2 4\"/>\n<text x=\"620\" y=\"6.0\" text-anchor=\"end\" fill=\"#D93B3B\" font-size=\"11\" font-weight=\"600\" font-family=\"Inter\">Budget EUR42,000</text>\n<path d=\"M0,210 L620,14.0\" stroke=\"#A3A9B7\" stroke-width=\"1.5\" stroke-dasharray=\"6 5\" fill=\"none\"/>\n<path d=\"M0.0,207.1 L20.7,204.6 L41.3,200.0 L62.0,194.6 L82.7,193.2 L103.3,192.4 L124.0,172.8 L144.7,168.7 L165.3,165.1 L186.0,158.9 L206.7,156.9 L227.3,140.1 L248.0,135.0 L268.7,130.6 L289.3,125.0 L310.0,123.3 L330.7,122.4 L351.3,76.6 L372.0,64.2 L372.0,210 L0,210 Z\" fill=\"url(#g)\"/>\n<path d=\"M0.0,207.1 L20.7,204.6 L41.3,200.0 L62.0,194.6 L82.7,193.2 L103.3,192.4 L124.0,172.8 L144.7,168.7 L165.3,165.1 L186.0,158.9 L206.7,156.9 L227.3,140.1 L248.0,135.0 L268.7,130.6 L289.3,125.0 L310.0,123.3 L330.7,122.4 L351.3,76.6 L372.0,64.2\" stroke=\"#2F6BFF\" stroke-width=\"2.5\" fill=\"none\" stroke-linejoin=\"round\"/>\n<line x1=\"372.0\" x2=\"372.0\" y1=\"0\" y2=\"210\" stroke=\"#9AA1B0\" stroke-dasharray=\"3 3\"/>\n<circle cx=\"372.0\" cy=\"64.2\" r=\"5\" fill=\"#16181D\" stroke=\"#FFFFFF\" stroke-width=\"2\"/>\n<text x=\"0.0\" y=\"232\" text-anchor=\"middle\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">1 Oct</text><text x=\"144.7\" y=\"232\" text-anchor=\"middle\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">8 Oct</text><text x=\"289.3\" y=\"232\" text-anchor=\"middle\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">15 Oct</text><text x=\"434.0\" y=\"232\" text-anchor=\"middle\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">22 Oct</text><text x=\"578.7\" y=\"232\" text-anchor=\"middle\" fill=\"#6B7180\" font-size=\"11\" font-family=\"Inter\">29 Oct</text>\n</svg>".split("EUR").join(EUR);
const TIP_X = 416.0, TIP_Y = 74.21333333333334, SVG_W = 680;

// 1) text
const SWAPS = [
  ["74% used, 65% of the month gone", "74% of the budget used, 12 days to go"],
  ["11 days to go", "12 days to go"],
  ["11 days left this month", "12 days left this month"],
  ["4,143", "5,498"],
  ["27,097", "25,742"],
  ["by 20 Oct", "by 19 Oct"],
  ["around 27 Oct", "around 26 Oct"]
];
let changed = 0;
const texts = figma.currentPage.findAll(function (n) { return n.type === "TEXT"; });
for (const t of texts) {
  let s = t.characters;
  const before = s;
  if (s.indexOf("Monday, 20 October") === 0) s = "Monday, 19 October " + DOT + " 12 days left this month";
  for (const p of SWAPS) s = s.split(p[0]).join(p[1]);
  if (s !== before) {
    for (const f of t.getRangeAllFontNames(0, t.characters.length)) await figma.loadFontAsync(f);
    t.characters = s;
    changed++;
  }
}

// 2) spend chart: replace the vector, keep size + position, move the tooltip to the new end point
let charts = 0;
const olds = figma.currentPage.findAll(function (n) { return n.name === "Spend vs pace (vector)"; });
for (const old of olds) {
  const parent = old.parent;
  const fresh = figma.createNodeFromSvg(CHART);
  fresh.name = "Spend vs pace (vector)";
  fresh.clipsContent = false;
  fresh.rescale(old.width / fresh.width);
  parent.insertChild(parent.children.indexOf(old), fresh);
  fresh.x = old.x; fresh.y = old.y;
  const k = fresh.width / SVG_W;
  const tip = parent.children.find(function (c) { return c.name === "Tooltip"; });
  if (tip) { tip.x = fresh.x + TIP_X * k - tip.width - 14 * (fresh.width / 652); tip.y = fresh.y + TIP_Y * k - tip.height / 2; }
  old.remove();
  charts++;
}

// 3) gauge: the SVG frame clipped the "Over" label
let gauges = 0;
for (const g of figma.currentPage.findAll(function (n) { return n.name === "Gauge arcs (vector)" || n.name === "Gauge"; })) { if ("clipsContent" in g) { g.clipsContent = false; gauges++; } }

figma.notify("Day 1 patched: " + changed + " texts, " + charts + " charts, " + gauges + " gauge frames");
console.log("Day 1 patched:", changed, "texts,", charts, "charts,", gauges, "gauge frames");
}
