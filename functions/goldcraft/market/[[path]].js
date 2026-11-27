// Public market pages: spawnframe.dev/goldcraft/market/ and /goldcraft/market/<profession>/.
// Built on request from the GoldCraft Companion's shared auction house numbers (public_market() in
// Supabase: prices, usual prices and sales a day, nothing about any player), cached for 3 hours.
// The maths follows GoldCraftForever's own rules: a price counts at most 1.6x its usual price, items
// only a few people list and nobody's seen buying are left out, profit buys every material at today's
// price or from a vendor (whichever is cheaper), after the auction house cut (5%, Neutral 15%).
import RECIPES from "../../_lib/recipes.js";

const SUPABASE = "https://xdvellqxqjttokqttoss.supabase.co";
const KEY = "sb_publishable_7c7qeppwded9w-zod4ex6Q_5Ds6L5t6"; // public key: it can only call public functions
const HOUSES = [
  ["US:Normal:Alliance", "Alliance", 0.05],
  ["US:Normal:Horde", "Horde", 0.05],
  ["US:Normal:Neutral", "Neutral", 0.15],
];
const CACHE_SECONDS = 3 * 3600;
const TEMPLATE = "2"; // bump when the page design changes, so cached pages are rebuilt at once
const SHARE = 0.2;      // gold a day assumes you sell 20% of what the house sells a day (as the addon does)
const ODD_HIGH = 1.6;
const THIN = 5;

const slug = (p) => p.toLowerCase().replace(/[^a-z]+/g, "-");
const PROFS = Object.keys(RECIPES.professions).sort();
const BY_SLUG = Object.fromEntries(PROFS.map((p) => [slug(p), p]));

export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const parts = (params.path || []).filter(Boolean);
  if (parts.length > 1 || (parts.length === 1 && !BY_SLUG[parts[0]])) return notFound();
  if (!url.pathname.endsWith("/")) return Response.redirect(url.origin + url.pathname + "/", 301);
  const prof = parts.length ? BY_SLUG[parts[0]] : null;

  const cache = caches.default;
  const key = new Request(url.origin + url.pathname + "?t=" + TEMPLATE);
  const hit = await cache.match(key);
  if (hit) return hit;

  let data = null;
  try { data = await load(); } catch (e) { data = null; }
  const html = data ? (prof ? professionPage(prof, data) : overviewPage(data)) : unavailablePage(prof);
  const res = new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": data ? "public, max-age=1800" : "no-store",
    },
  });
  if (data) {
    const stored = res.clone();
    const h = new Headers(stored.headers); h.set("Cache-Control", `public, max-age=${CACHE_SECONDS}`);
    context.waitUntil(cache.put(key, new Response(stored.body, { headers: h })));
  }
  return res;
}

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
}

// ---------------------------------------------------------------- data

async function load() {
  const ids = new Set();
  for (const rows of Object.values(RECIPES.professions))
    for (const [, out, , mats] of rows) { ids.add(out); for (let i = 0; i < mats.length; i += 2) ids.add(mats[i]); }
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/public_market`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [...ids] }),
  });
  if (!r.ok) throw new Error("public_market " + r.status);
  const j = await r.json();
  const prices = {};
  for (const [mk, id, t, now, depth, qty, usual, days, perDay] of j.prices || []) {
    (prices[mk] ||= {})[id] = { t, now, depth, qty: qty || 0, usual, days: days || 0, perDay: perDay || 0 };
  }
  const stats = {};
  for (const s of j.stats || []) stats[s.market_key] = s;
  return { now: j.now, items: j.items || {}, prices, stats };
}

const nameOf = (d, id) => (d.items[id] && d.items[id][0]) || `Item ${id}`;
const vendorOf = (d, id) => (d.items[id] && d.items[id][1]) || 0;

function valueUnit(p) {
  let v = p.now;
  if (p.usual && p.days >= 3 && v > p.usual * ODD_HIGH) v = p.usual * ODD_HIGH;
  return v;
}
const unproven = (p) => p.qty < THIN && !(p.perDay > 0);

function matUnit(d, mk, id) {
  const p = d.prices[mk] && d.prices[mk][id];
  const opts = [];
  if (p && p.now > 0 && p.qty > 0) opts.push(p.now);
  const v = vendorOf(d, id);
  if (v > 0) opts.push(v);
  return opts.length ? Math.min(...opts) : null;
}

// every recipe that can be priced at a house: sale after the cut, cost buying everything, profit
function crafts(d, house, onlyProf) {
  const [mk, , cut] = house;
  const out = [];
  for (const prof of onlyProf ? [onlyProf] : PROFS) {
    for (const [name, item, qty, mats, cd] of RECIPES.professions[prof]) {
      const p = d.prices[mk] && d.prices[mk][item];
      if (!p || !(p.now > 0) || unproven(p)) continue;
      let cost = 0, ok = true;
      for (let i = 0; i < mats.length; i += 2) {
        const u = matUnit(d, mk, mats[i]);
        if (u == null) { ok = false; break; }
        cost += u * mats[i + 1];
      }
      if (!ok || cost <= 0) continue;
      const sale = valueUnit(p) * qty * (1 - cut);
      const profit = sale - cost;
      const perDay = p.perDay > 0 ? p.perDay / qty : 0;      // crafts a day the house takes
      out.push({ prof, name, item, cd: cd || 0, cost, sale, profit, perDay, unitsDay: p.perDay || 0, goldDay: profit > 0 ? profit * perDay * SHARE : 0, listed: p.qty });
    }
  }
  return out;
}

// crafts that sell come first by gold a day, then the rest by profit per craft
function byValue(a, b) {
  if ((a.goldDay > 0) !== (b.goldDay > 0)) return a.goldDay > 0 ? -1 : 1;
  return a.goldDay > 0 ? b.goldDay - a.goldDay : b.profit - a.profit;
}

function sellers(d, house) {
  const [mk] = house;
  const out = [];
  for (const [id, p] of Object.entries(d.prices[mk] || {})) {
    if (!(p.perDay > 0) || !(p.now > 0)) continue;
    out.push({ id, name: nameOf(d, id), price: valueUnit(p), perDay: p.perDay, listed: p.qty, volume: valueUnit(p) * p.perDay });
  }
  return out.sort((a, b) => b.volume - a.volume);
}

function movers(d, house) {
  const [mk] = house;
  const out = [];
  for (const [id, p] of Object.entries(d.prices[mk] || {})) {
    if (!(p.usual > 0) || p.days < 5 || p.qty < THIN || !(p.now > 0) || p.usual < 20 || !(p.perDay > 0)) continue;
    out.push({ id, name: nameOf(d, id), now: p.now, usual: p.usual, ratio: p.now / p.usual });
  }
  const up = out.filter((x) => x.ratio >= 1.25).sort((a, b) => b.ratio - a.ratio).slice(0, 8);
  const down = out.filter((x) => x.ratio <= 0.8).sort((a, b) => a.ratio - b.ratio).slice(0, 8);
  return { up, down };
}

// ---------------------------------------------------------------- formatting

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function money(c) {
  c = Math.round(c);
  const neg = c < 0; c = Math.abs(c);
  const g = Math.floor(c / 10000), s = Math.floor((c % 10000) / 100), k = c % 100;
  const parts = [];
  if (g) parts.push(`${g.toLocaleString("en-US")}<i class="coin g" title="gold"></i>`);
  if (s && g < 100) parts.push(`${s}<i class="coin s" title="silver"></i>`);
  if (!g && (k || !s)) parts.push(`${k}<i class="coin c" title="copper"></i>`);
  return `<span class="money">${neg ? "−" : ""}${parts.join(" ")}</span>`;
}
const num = (n) => (n >= 100 ? Math.round(n).toLocaleString("en-US") : n >= 10 ? n.toFixed(0) : n.toFixed(1));

function ago(now, t) {
  if (!t) return "never";
  const m = Math.max(0, Math.round((now - t) / 60));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

function houseStats(d) {
  return `<div class="houses mk-houses">${HOUSES.map(([mk, label]) => {
    const s = d.stats[mk] || {};
    return `<div class="house ${HOUSE_CLASS[label]}"><b>${label}</b><span>${s.items ? s.items.toLocaleString("en-US") : 0} items priced<br>freshest scan ${ago(d.now, s.freshest)}<br>${s.players_week || 0} sharing this week</span></div>`;
  }).join("")}</div>`;
}

function craftTable(rows, showProf) {
  if (!rows.length) return `<p class="dim">Not enough shared prices for this yet. They fill in as more players share.</p>`;
  return `<div class="tbl"><table><thead><tr><th>Craft</th>${showProf ? "<th>Profession</th>" : ""}<th>Materials</th><th>Sells for</th><th>Profit</th><th>Sold a day</th><th>Gold a day</th></tr></thead><tbody>${rows
    .map((r) => `<tr><td>${esc(r.name)}${cooldown(r.cd)}</td>${showProf ? `<td><a href="/goldcraft/market/${slug(r.prof)}/">${esc(r.prof)}</a></td>` : ""}<td>${money(r.cost)}</td><td>${money(r.sale)}</td><td class="${r.profit >= 0 ? "pos" : "neg"}">${money(r.profit)}</td><td>${r.unitsDay ? num(r.unitsDay) : "—"}</td><td>${r.goldDay ? money(r.goldDay) : "—"}</td></tr>`)
    .join("")}</tbody></table></div>`;
}

// "once a day" / "once every 4 days" for crafts on a cooldown: their profit can't be repeated at will
function cooldown(sec) {
  if (!sec) return "";
  const days = sec / 86400;
  const txt = days >= 1.5 ? `once every ${Math.round(days)} days` : days >= 0.9 ? "once a day" : `once every ${Math.round(sec / 3600)} h`;
  return ` <span class="dim">(cooldown: ${txt})</span>`;
}

function sellerTable(rows) {
  if (!rows.length) return `<p class="dim">No sales measured here yet.</p>`;
  return `<div class="tbl"><table><thead><tr><th>Item</th><th>Price</th><th>Sold a day</th><th>Listed</th></tr></thead><tbody>${rows
    .map((r) => `<tr><td>${esc(r.name)}</td><td>${money(r.price)}</td><td>${num(r.perDay)}</td><td>${r.listed.toLocaleString("en-US")}</td></tr>`)
    .join("")}</tbody></table></div>`;
}

function moverList(m) {
  const li = (x) => `<li>${esc(x.name)}: ${money(x.now)} <span class="dim">(usually ${money(x.usual)}, ${x.ratio >= 1 ? "+" : "−"}${Math.round(Math.abs(x.ratio - 1) * 100)}%)</span></li>`;
  if (!m.up.length && !m.down.length) return `<p class="dim">Nothing far from its usual price.</p>`;
  return `<div class="cols"><div><h4>Above usual</h4><ul>${m.up.map(li).join("") || "<li class=dim>none</li>"}</ul></div><div><h4>Below usual</h4><ul>${m.down.map(li).join("") || "<li class=dim>none</li>"}</ul></div></div>`;
}

const METHOD = `<details class="method"><summary>How these numbers work</summary><p>Prices are shared by players who use the free <a href="/goldcraft/">GoldCraft Companion</a>: auction house data only, nothing about anyone. A price is from the last 3 days; "usually" is the median of the last 14 days, and a price counts at most 1.6× that, so one lone overpriced listing can't make something look valuable. Items with fewer than 5 listed that nobody has been seen buying are left out. <b>Materials</b> is buying everything at today's price or from a vendor, whichever is cheaper. <b>Sells for</b> is after the auction house cut (5%, or 15% at the Neutral houses). <b>Sold a day</b> is measured by comparing scans, with at least 2 hours of data. <b>Gold a day</b> assumes you sell a fifth of what the house sells a day; crafts with measured sales are listed first, then the rest by profit per craft. A guide to what's worth a look, not a promise: prices move.</p></details>`;

const HOUSE_CLASS = { Alliance: "a", Horde: "h", Neutral: "n" };

function page({ title, description, canonical, h1, lead, body, now }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#1b120b">
<link rel="canonical" href="https://spawnframe.dev${canonical}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="https://spawnframe.dev${canonical}">
<meta property="og:image" content="https://spawnframe.dev/goldcraft/art/og.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="GoldCraftForever">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/goldcraft/goldcraft.css">
<link rel="stylesheet" href="/goldcraft/market.css">
</head>
<body>
<header class="top"><div class="wrap">
  <a class="mk-brand" href="/goldcraft/"><img src="/goldcraft/art/icon.webp" alt="" width="26" height="26"> GoldCraftForever</a>
  <nav><a href="/goldcraft/market/">Today's market</a><a href="/goldcraft/start/">Getting started</a><a href="https://www.curseforge.com/wow/addons/goldcraftforever">CurseForge</a></nav>
</div></header>
<main class="wrap market">
<section class="hero mk-hero">
  <img class="crest-img" src="/goldcraft/art/emblem_market.webp" alt="" width="76" height="76">
  <p class="crumbs"><a href="/goldcraft/">GoldCraftForever</a> › <a href="/goldcraft/market/">WoW Forever market</a></p>
  <h1>${h1}</h1>
  ${lead}
  <p class="updated">Updated ${new Date(now * 1000).toUTCString().replace(/:\d\d GMT/, " UTC")} · refreshed every few hours</p>
</section>
${body}
${METHOD}
<div class="note mk-cta"><p><strong>See this for your own characters, in game:</strong> what to craft with what you have, what to post where, and a daily plan. GoldCraftForever is free.</p>
<div class="cta"><a class="btn gold" href="https://www.curseforge.com/wow/addons/goldcraftforever">Download on CurseForge</a> <a class="btn" href="/goldcraft/start/">Getting started</a> <a class="btn" href="/goldcraft/">About GoldCraftForever</a></div></div>
<nav class="profs"><span>By profession</span>${PROFS.map((p) => `<a href="/goldcraft/market/${slug(p)}/">${esc(p)}</a>`).join("")}</nav>
</main>
<footer class="foot"><div class="wrap">
  <span>GoldCraftForever by SpawnFrame · Item names are from World of Warcraft. Not affiliated with Blizzard Entertainment.</span>
  <nav><a href="/">SpawnFrame</a><a href="/goldcraft/">GoldCraftForever</a><a href="/privacy/">Privacy</a><a href="mailto:hello@spawnframe.dev">hello@spawnframe.dev</a></nav>
</div></footer>
</body>
</html>`;
}

function overviewPage(d) {
  let body = "";
  const best = {};
  for (const h of HOUSES) {
    const all = crafts(d, h);
    const top = all.filter((r) => r.profit > 0).sort(byValue).slice(0, 15);
    for (const r of all) if (r.profit > 0) {
      const b = (best[r.prof] ||= { prof: r.prof, count: 0, top: null });
      b.count++;
      if (!b.top || r.profit > b.top.profit) b.top = { ...r, house: h[1] };
    }
    body += `<section class="mk-house ${HOUSE_CLASS[h[1]]}"><h2>${h[1]} auction house</h2>
<h3>Most profitable crafts</h3>${craftTable(top, true)}
<h3>What sells most</h3>${sellerTable(sellers(d, h).slice(0, 12))}
<h3>Prices far from usual</h3>${moverList(movers(d, h))}</section>`;
  }
  const profRows = Object.values(best).sort((a, b) => b.top.profit - a.top.profit);
  const profTable = profRows.length
    ? `<div class="tbl"><table><thead><tr><th>Profession</th><th>Best craft right now</th><th>Profit each</th><th>Profitable crafts</th></tr></thead><tbody>${profRows
        .map((b) => `<tr><td><a href="/goldcraft/market/${slug(b.prof)}/">${esc(b.prof)}</a></td><td>${esc(b.top.name)} <span class="dim">(${b.top.house})</span></td><td>${money(b.top.profit)}</td><td>${b.count}</td></tr>`)
        .join("")}</tbody></table></div>`
    : `<p class="dim">Not enough shared prices yet.</p>`;
  return page({
    title: "WoW Forever auction house prices and most profitable crafts today · GoldCraftForever",
    description: "Today's most profitable crafts, best sellers and price moves at all three WoW Forever auction houses (Alliance, Horde, Neutral), from prices shared by GoldCraft Companion players. Updated every few hours.",
    canonical: "/goldcraft/market/",
    h1: "WoW Forever market today",
    lead: `<p class="lede">What's worth crafting, what's selling and what's moved at the three WoW Forever auction houses, from prices shared by GoldCraft Companion players.</p>${houseStats(d)}`,
    body: `<section class="mk-best"><h2>Best craft in each profession today</h2>${profTable}</section>` + body,
    now: d.now,
  });
}

function professionPage(prof, d) {
  let body = "", any = 0;
  for (const h of HOUSES) {
    const all = crafts(d, h, prof);
    const selling = all.filter((r) => r.profit > 0).sort(byValue).slice(0, 25);
    any += all.length;
    body += `<section class="mk-house ${HOUSE_CLASS[h[1]]}"><h2>${h[1]} auction house</h2>
<h3>Most profitable ${esc(prof)} crafts</h3>${craftTable(selling, false)}
<p class="dim">${all.length} ${esc(prof)} recipes priced here (all materials and the result have a recent price).</p></section>`;
  }
  return page({
    title: `WoW Forever ${prof}: most profitable crafts today (all 3 auction houses)`,
    description: `The most profitable ${prof} crafts in WoW Forever today at the Alliance, Horde and Neutral auction houses: cost of materials, sale price after the cut, profit and how many sell a day. Updated every few hours.`,
    canonical: `/goldcraft/market/${slug(prof)}/`,
    h1: `WoW Forever ${esc(prof)}: what's profitable today`,
    lead: `<p class="lede">Every ${esc(prof)} recipe in WoW Forever, priced at all three auction houses from prices shared by GoldCraft Companion players. Ranked by profit per craft; where sales have been measured, the table also shows how many sell a day.</p>${houseStats(d)}${any ? "" : `<p class="dim">No ${esc(prof)} recipes can be priced yet.</p>`}`,
    body,
    now: d.now,
  });
}

function unavailablePage(prof) {
  return page({
    title: "WoW Forever market · GoldCraftForever",
    description: "WoW Forever auction house prices and profitable crafts.",
    canonical: prof ? `/goldcraft/market/${slug(prof)}/` : "/goldcraft/market/",
    h1: "WoW Forever market",
    lead: `<p class="lede">Shared prices can't be loaded right now. Try again in a few minutes.</p>`,
    body: "",
    now: Math.floor(Date.now() / 1000),
  });
}
