import math
daily=[620,540,980,1150,300,180,4200,890,760,1320,280,150,3600,1100,940,1210,350,210,9800,2660]
assert sum(daily)==31240
cum=[];t=0
for d in daily: t+=d; cum.append(t)
W,H=620,210; ymax=45000
X=lambda day:(day-1)/30*W
Y=lambda v:H-v/ymax*H
pts=[(X(i+1),Y(v)) for i,v in enumerate(cum)]
line="M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts)
area=line+f" L{pts[-1][0]:.1f},{H} L0,{H} Z"
pace=f"M0,{H} L{W},{Y(42000):.1f}"
tx,ty=pts[-1]
grid="".join(f'<line x1="0" x2="{W}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" class="grid"/><text x="-10" y="{Y(v)+4:.1f}" class="ylab" text-anchor="end">€{v//1000}k</text>' for v in [0,10000,20000,30000,40000])
xl="".join(f'<text x="{X(d):.1f}" y="{H+22}" class="xlab" text-anchor="middle">{d} Oct</text>' for d in [1,8,15,22,29])
by=Y(42000)
svg=f'''<svg viewBox="-44 -10 {W+60} {H+40}" class="chart" role="img" aria-label="Cumulative spend this month: 31,240 euros by 20 October, above the even budget pace line">
  <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F6BFF" stop-opacity=".22"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/></linearGradient></defs>
  {grid}
  <line x1="0" x2="{W}" y1="{by:.1f}" y2="{by:.1f}" class="budget"/>
  <text x="{W}" y="{by-8:.1f}" class="blab" text-anchor="end">Budget €42,000</text>
  <path d="{pace}" class="pace"/>
  <path d="{area}" fill="url(#fill)"/>
  <path d="{line}" class="spend"/>
  <line x1="{tx:.1f}" x2="{tx:.1f}" y1="0" y2="{H}" class="cursor"/>
  <circle cx="{tx:.1f}" cy="{ty:.1f}" r="5" class="dot"/>
  {xl}
</svg>'''
tipL=(tx+44)/(W+60)*100; tipT=(ty+10)/(H+40)*100

# gauge
cx,cy,r=110,118,88
def pt(f): a=math.radians(180-180*f); return cx+r*math.cos(a), cy-r*math.sin(a)
def arc(f0,f1,cls):
    (x0,y0),(x1,y1)=pt(f0),pt(f1); return f'<path d="M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f}" class="arc {cls}"/>'
gap=0.012
arcs=arc(0,0.65-gap,'a1')+arc(0.65+gap,0.9-gap,'a2')+arc(0.9+gap,1,'a3')
mx_,my_=pt(0.74)
marker=f'<circle cx="{mx_:.1f}" cy="{my_:.1f}" r="8" class="gm"/>'
def lab(f,t,dy=0):
    a=math.radians(180-180*f); x=cx+(r+26)*math.cos(a); y=cy-(r+26)*math.sin(a)+dy
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" class="glab">{t}</text>'
glabs=lab(0.2,'On track')+lab(0.77,'Watch')+lab(0.97,'Over',4)

I={'grid':'<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>',
'spend':'<path d="M3 15l4-5 3 3 6-8"/><path d="M12 5h4v4"/>',
'card':'<rect x="2.5" y="5" width="15" height="10" rx="2"/><path d="M2.5 8.5h15"/>',
'bill':'<path d="M5 2.5h10v15l-2.5-1.5-2.5 1.5-2.5-1.5L5 17.5z"/><path d="M8 7h4M8 10h4"/>',
'receipt':'<rect x="4" y="2.5" width="12" height="15" rx="2"/><path d="M7 7h6M7 10h6M7 13h3"/>',
'budget':'<circle cx="10" cy="10" r="7"/><path d="M10 3v7l5 4"/>',
'team':'<circle cx="7" cy="7" r="3"/><circle cx="14" cy="8" r="2.5"/><path d="M2 17c0-3 2.5-5 5-5s5 2 5 5M12 13c3 0 6 1.5 6 4"/>',
'report':'<path d="M4 17V9M10 17V4M16 17v-6"/>',
'gear':'<circle cx="10" cy="10" r="2.5"/><path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8"/>',
'help':'<circle cx="10" cy="10" r="7.5"/><path d="M7.8 7.8a2.3 2.3 0 1 1 3 2.2c-.6.3-.8.7-.8 1.3v.4M10 14.2v.3"/>',
'search':'<circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/>',
'bell':'<path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 2h-13z"/><path d="M8.5 18h3"/>',
'chev':'<path d="M7 8l3 3 3-3"/>',
'share':'<path d="M10 3v10M6 7l4-4 4 4M4 13v3h12v-3"/>',
'up':'<path d="M10 16V4M5 9l5-5 5 5"/>',
'repeat':'<path d="M4 8a6 6 0 0 1 10.5-3.5L16 6M16 2.5V6h-3.5M16 12a6 6 0 0 1-10.5 3.5L4 14M4 17.5V14h3.5"/>',
'copy':'<rect x="6" y="6" width="10" height="11" rx="2"/><path d="M4 13V4.5A1.5 1.5 0 0 1 5.5 3H13"/>',
'sun':'<circle cx="10" cy="10" r="3.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"/>'}
def ic(n): return f'<svg class="ic" viewBox="0 0 20 20" aria-hidden="true">{I[n]}</svg>'
AC=' aria-current="page"'
nav=[('grid','Overview',True,''),('spend','Spend',False,''),('card','Cards',False,''),('bill','Bills',False,''),('receipt','Receipts',False,'7'),('budget','Budgets',False,''),('team','Teams',False,''),('report','Reports',False,'')]
navh=""
for i,tt,a,b in nav:
    badge=f'<b class="badge">{b}</b>' if b else ''
    navh+=f'<a href="#" class="nav{" on" if a else ""}"{AC if a else ""}>{ic(i)}<span>{tt}</span>{badge}</a>'
teams=[('Eng',12900),('Mkt',8350),('Sales',4700),('Ops',3190),('Design',2100)]
bars=""
for i,(l,v) in enumerate(teams):
    hi=' class="hi"' if i==0 else ''
    bars+=f'<div class="bar"><span class="bv">€{v/1000:.1f}k</span><i style="height:{v/14000*100:.0f}%"{hi}></i><span class="bl">{l}</span></div>'
attn=[('up','warn','AWS is 38% higher than last month','Software · Engineering','€4,120','Review'),
('repeat','info','Notion renews in 5 days','Annual plan · €2,880 per year','€2,880','Check plan'),
('receipt','warn','7 card payments are missing receipts','Oldest from 3 Oct','€1,486','Remind team'),
('copy','bad','Possible duplicate charge','Linear · 14 Oct · charged twice','€96','Dispute')]
rows="".join(f'<tr><td><span class="ti {k}">{ic(i)}</span></td><td><strong>{t}</strong><small>{d}</small></td><td class="num">{a}</td><td class="act"><button class="ghost">{b}</button></td></tr>' for i,k,t,d,a,b in attn)

html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Brightloop · Spend overview</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
<link rel="stylesheet" href="styles.css" />
</head>
<body>
<!-- Make It Pop · Day 1 · Finance dashboard: spend overview for a small team. Free to remix, credit Make It Pop. -->
<div class="app">
  <aside class="side">
    <div class="brand"><span class="mark" aria-hidden="true"></span>Brightloop</div>
    <nav aria-label="Main">{navh}</nav>
    <div class="side-bottom">
      <a href="#" class="nav">{ic('gear')}<span>Settings</span></a>
      <a href="#" class="nav">{ic('help')}<span>Help &amp; support</span></a>
      <div class="me"><span class="av">MO</span><div><strong>Maya Ortiz</strong><small>Operations</small></div></div>
    </div>
  </aside>
  <div class="main">
    <header class="top">
      <button class="pill">{ic('chev')}Brightloop · October 2026</button>
      <label class="search">{ic('search')}<input placeholder="Search transactions, suppliers…" aria-label="Search" /></label>
      <div class="top-r">
        <button class="round" aria-label="Light mode">{ic('sun')}</button>
        <button class="round" aria-label="Notifications">{ic('bell')}<i class="dotn"></i></button>
        <span class="av sm">MO</span>
      </div>
    </header>
    <div class="content">
      <div class="hello">
        <div><h1>Good morning, Maya</h1><p>Monday, 20 October · 11 days left this month</p></div>
        <button class="primary">{ic('share')}Share with founders</button>
      </div>
      <div class="grid">
        <div class="col">
        <section class="card spend">
          <div class="card-h">
            <div>
              <h2>Spent this month</h2>
              <div class="big">€31,240 <span class="of">of €42,000 budget</span></div>
              <div class="chips"><span class="chip warn">€4,143 ahead of pace</span><span class="muted">74% of the budget used, 11 days to go</span></div>
            </div>
            <div class="seg" role="group" aria-label="Range"><button class="on">1M</button><button>3M</button><button>6M</button><button>1Y</button></div>
          </div>
          <div class="chart-wrap">
            {svg}
            <div class="tip" style="left:{tipL:.1f}%;top:{tipT:.1f}%">
              <span class="chip warn sm">+€4,143 vs pace</span>
              <strong>€31,240</strong>
              <span class="lg"><i class="sw b"></i>Spent by 20 Oct</span>
              <span class="lg"><i class="sw g"></i>€27,097 at even pace</span>
            </div>
          </div>
        </section>
        <section class="card attn">
          <div class="row"><h2>Needs your attention</h2><a href="#" class="link">See all</a></div>
          <table>
            <thead><tr><th><span class="sr">Type</span></th><th>Issue</th><th class="num">Amount</th><th><span class="sr">Action</span></th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </section>
        </div>
        <div class="col">
        <section class="card runway">
          <div class="row"><h2 class="g">Months of money left</h2><span class="tag ok">Healthy</span></div>
          <div class="big">12 <span class="of">months</span></div>
          <p class="muted">€612,000 in the bank<br/>Spending about €51,000 a month</p>
        </section>
        <section class="card teams">
          <h2>Where it went</h2>
          <div class="seg sm" role="group" aria-label="Group by"><button class="on">By team</button><button>By category</button><button>Suppliers</button></div>
          <div class="bars">{bars}</div>
        </section>
        <section class="card gauge">
          <div class="row"><h2>Budget used</h2><button class="more" aria-label="More options">•••</button></div>
          <svg viewBox="0 0 220 132" class="gsvg" role="img" aria-label="74 percent of the monthly budget used, in the Watch zone">
            {arcs}{marker}{glabs}
            <text x="110" y="100" text-anchor="middle" class="gval">74%</text>
            <text x="110" y="120" text-anchor="middle" class="gsub">€31,240 of €42,000</text>
          </svg>
          <p class="muted c">At this pace you'll reach the budget around 27 Oct</p>
        </section>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>
'''
open('index.html','w').write(html)
print('ok',round(tipL,1),round(tipT,1))

# ---------- inline-attribute SVGs for Figma (no CSS classes) ----------
F='font-family="Inter"'
gridF="".join(f'<line x1="0" x2="{W}" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="#E6E8EE" stroke-width="1"/><text x="-10" y="{Y(v)+4:.1f}" text-anchor="end" fill="#6B7180" font-size="11" {F}>EUR{v//1000}k</text>' for v in [0,10000,20000,30000,40000])
xlF="".join(f'<text x="{X(d):.1f}" y="{H+22}" text-anchor="middle" fill="#6B7180" font-size="11" {F}>{d} Oct</text>' for d in [1,8,15,22,29])
chartF=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W+60}" height="{H+40}" viewBox="-44 -10 {W+60} {H+40}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F6BFF" stop-opacity="0.22"/><stop offset="1" stop-color="#2F6BFF" stop-opacity="0"/></linearGradient></defs>
{gridF}
<line x1="0" x2="{W}" y1="{by:.1f}" y2="{by:.1f}" stroke="#D93B3B" stroke-width="1.2" stroke-dasharray="2 4"/>
<text x="{W}" y="{by-8:.1f}" text-anchor="end" fill="#D93B3B" font-size="11" font-weight="600" {F}>Budget EUR42,000</text>
<path d="{pace}" stroke="#A3A9B7" stroke-width="1.5" stroke-dasharray="6 5" fill="none"/>
<path d="{area}" fill="url(#g)"/>
<path d="{line}" stroke="#2F6BFF" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
<line x1="{tx:.1f}" x2="{tx:.1f}" y1="0" y2="{H}" stroke="#9AA1B0" stroke-dasharray="3 3"/>
<circle cx="{tx:.1f}" cy="{ty:.1f}" r="5" fill="#16181D" stroke="#FFFFFF" stroke-width="2"/>
{xlF}
</svg>'''
def arcF(f0,f1,col):
    (x0,y0),(x1,y1)=pt(f0),pt(f1); return f'<path d="M{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f}" fill="none" stroke="{col}" stroke-width="16" stroke-linecap="round"/>'
def labF(f,t,dy=0):
    a=math.radians(180-180*f); x=cx+(r+24)*math.cos(a); y=cy-(r+24)*math.sin(a)+dy
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" fill="#6B7180" font-size="10.5" {F}>{t}</text>'
gaugeF=f'''<svg xmlns="http://www.w3.org/2000/svg" width="240" height="140" viewBox="-10 -6 240 140">
{arcF(0,0.65-gap,'#1F9D55')}{arcF(0.65+gap,0.9-gap,'#F0A12B')}{arcF(0.9+gap,1,'#D93B3B')}
<circle cx="{mx_:.1f}" cy="{my_:.1f}" r="8" fill="#FFFFFF" stroke="#16181D" stroke-width="3"/>
{labF(0.18,'On track')}{labF(0.77,'Watch')}{labF(0.97,'Over',4)}
</svg>'''
import json
json.dump({'chart':chartF,'gauge':gaugeF,'tipX':(tx+44),'tipY':(ty+10),'icons':I},open('tools/day-01/figma_assets.json','w'))
print('assets ok')
