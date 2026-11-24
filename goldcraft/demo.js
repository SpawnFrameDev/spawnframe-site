// GoldCraftForever, the interactive walkthrough: the addon's window rebuilt with sample data,
// plus a guided tour. All numbers here are made up for the demo; nothing is fetched.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  // ---------- money, like the addon: big numbers, small coloured g s c ----------
  function money(c, sign) {
    var neg = c < 0; c = Math.round(Math.abs(c));
    var g = Math.floor(c / 10000), s = Math.floor(c / 100) % 100, cp = c % 100, out = [];
    if (g) out.push(g + '<span class="g">g</span>');
    if (s || (g && cp)) out.push(s + '<span class="s">s</span>');
    if (cp && !g) out.push(cp + '<span class="c">c</span>');
    if (!out.length) out.push('0<span class="c">c</span>');
    return '<span class="m">' + (neg ? "−" : (sign ? "+" : "")) + out.join(" ") + "</span>";
  }

  // ---------- sample data ----------
  var COL = { herb: "#3f8f3a", cloth: "#d8cfb8", ore: "#b5703a", bar: "#b9bcc4", potion: "#b8385a", leather: "#8b5a2b",
              bandage: "#efe7d6", food: "#c9823d", thread: "#9a8f7a", gem: "#3a8fc9", gear: "#5f6f8a", ess: "#8a5cc9" };
  function icon(kind) { return '<i class="ic" style="background:' + (COL[kind] || "#777") + '"></i>'; }
  var ITEMS = {
    linen: { n: "Linen Cloth", k: "cloth" }, bolt: { n: "Bolt of Linen Cloth", k: "cloth" }, wool: { n: "Wool Cloth", k: "cloth" },
    peace: { n: "Peacebloom", k: "herb" }, silver: { n: "Silverleaf", k: "herb" }, earth: { n: "Earthroot", k: "herb" }, mage: { n: "Mageroyal", k: "herb" },
    copper: { n: "Copper Ore", k: "ore" }, cbar: { n: "Copper Bar", k: "bar" }, tin: { n: "Tin Ore", k: "ore" },
    lleather: { n: "Light Leather", k: "leather" }, mleather: { n: "Medium Leather", k: "leather" },
    heal: { n: "Minor Healing Potion", k: "potion" }, lion: { n: "Elixir of Lion's Strength", k: "potion" }, agil: { n: "Elixir of Minor Agility", k: "potion" },
    hband: { n: "Heavy Linen Bandage", k: "bandage" }, wband: { n: "Wool Bandage", k: "bandage" },
    thread: { n: "Coarse Thread", k: "thread" }, vial: { n: "Empty Vial", k: "thread" }, snapper: { n: "Longjaw Mud Snapper", k: "food" },
    shirt: { n: "Brown Linen Robe", k: "gear", q: 2 }, ess: { n: "Lesser Magic Essence", k: "ess", q: 2 }
  };
  function item(id, cls) { var it = ITEMS[id]; return icon(it.k) + '<span class="' + (cls || ("q" + (it.q || 1))) + '">' + it.n + "</span>"; }

  // ---------- the window ----------
  var SECTIONS = [
    { key: "home", title: "Home", em: "home", ic: "#d9a43a" },
    { key: "professions", title: "Professions", em: "recipes", ic: "#8a8f99" },
    { key: "market", title: "Market", em: "market", ic: "#6d8fb3" },
    { key: "materials", title: "Materials", em: "materials", ic: "#3f8f3a" },
    { key: "shopping", title: "Shopping", em: "materials", ic: "#b5703a" },
    { key: "bags", title: "Bags", em: "materials", ic: "#8b5a2b" },
    { key: "ledger", title: "Ledger", em: "home", ic: "#7a4e8f" }
  ];
  var state = { sec: "home", sub: "overview", item: "silver", recipe: 0 };

  function sideItem(label, ic, note, opts) {
    opts = opts || {};
    return '<div class="side-item' + (opts.on ? " on" : "") + '"' + (opts.id ? ' id="' + opts.id + '"' : "") + (opts.go ? ' data-go="' + opts.go + '"' : "") + ">" +
      '<i style="background:' + ic + '"></i><span>' + label + "</span>" + (note ? '<span class="snote ' + (opts.nc || "") + '">' + note + "</span>" : "") + "</div>";
  }
  function SIDE() {
    var s = state.sec, h = "";
    if (s === "home") {
      h += '<div id="t-scans">' +
        sideItem("Alliance", "#3b6fc9", "12 min ago<br>you", { nc: "ok" }) +
        sideItem("Horde", "#b83a2e", "3 h ago<br>friend", { nc: "warn" }) +
        sideItem("Neutral", "#c9a24a", "1 h ago<br>community") +
        sideItem("Next scan", "#7a6a4a", "in 3 min") + "</div>" +
        '<div class="side-sep"></div>' +
        sideItem("Today's plan", "#d9a43a", "2 of 7", { on: true }) + sideItem("Ideas", "#9b7bd4", "3") +
        sideItem("Price alerts", "#7a6a4a", "1") + sideItem("Export for AI", "#a08a5a") +
        '<div class="side-sep"></div>' + sideItem("Gold on its way", "#c9a24a", money(48000) + "<br>in 38 min", { nc: "ok" });
    } else if (s === "professions") {
      h += sideItem("Overview", "#8a8f99", "", { on: state.sub === "overview", go: "professions:overview" }) +
        sideItem("Alchemy", "#b8385a", "187", { on: state.sub === "recipes", go: "professions:recipes" }) +
        sideItem("First Aid", "#efe7d6", "225", { go: "professions:recipes" }) +
        sideItem("Leveling", "#a08a5a") + sideItem("Disenchant", "#8a5cc9") + sideItem("Routes", "#6d8fb3");
    } else if (s === "market") {
      h += sideItem("All items", "#6d8fb3", "", { on: true }) + sideItem("Flips", "#d9a43a", "4") + sideItem("Vendor flips", "#b5703a", "2") +
        sideItem("Staples", "#3f8f3a", "30 days") + sideItem("Farming", "#2b5a46") + sideItem("Price alerts", "#7a6a4a", "1");
    }
    return h;
  }

  function PANEL() {
    var s = state.sec;
    if (s === "home") return home();
    if (s === "professions") return state.sub === "recipes" ? recipes() : professions();
    if (s === "market") return market();
    if (s === "materials") return materials();
    if (s === "shopping") return shopping();
    if (s === "bags") return bags();
    if (s === "ledger") return ledger();
    return "";
  }

  // ---------- Home ----------
  var PLAN = [
    { done: true, t: "Scan the Alliance auction house", d: "done 12 min ago" },
    { done: true, t: "Post 14 " + item("silver") + " at Alliance", d: "selling 32% over usual", p: 21000 },
    { t: "Buy 40 " + item("linen") + " at Neutral, up to " + money(980) + " each", d: "cheapest there", cost: 36800, btn: "Search" },
    { t: "Buy 12 " + item("peace") + " at Alliance", d: "you have 8 of 20", cost: 9600, btn: "Search" },
    { t: "Craft 20 " + item("hband"), d: "First Aid · sells 23 a day", p: 61000 },
    { t: "Craft 10 " + item("agil"), d: "Alchemy · sells 11 a day", p: 44000 },
    { t: "Post what you made at Alliance", d: "1 copper under the cheapest real listing", btn: "Post" }
  ];
  function home() {
    var week = [6.1, 9.4, 3.2, 12.05, 8.6, 14.9, 18.42], hours = [1.5, 2.2, 0.8, 3.1, 2.0, 2.6, 2.4];
    var h = '<div class="stats" id="t-stats">' +
      stat("Played", "2.4 h", "yesterday 3.1 h · avg day 2.2 h") +
      stat("Net gold", '<span class="good">' + money(184200, true) + "</span>", "yesterday " + money(120500, true) + " · 37 sold") +
      stat("Per hour played", money(76800), "yesterday " + money(38900) + " · avg " + money(52000)) +
      stat("Per money-making hour", money(142000), "crafting and trading only") + "</div>";
    h += '<div class="row2"><div class="box plan" id="t-plan"><div class="h">Today\'s plan <small>sized to your 42g and 20% of a day\'s sales</small></div><ol>';
    PLAN.forEach(function (p, i) {
      h += '<li class="' + (p.done ? "done" : "") + '"><span class="chk">' + (p.done ? "✓" : "") + '</span><span class="what">' + (i + 1) + ". " + p.t +
        '<br><span class="muted">' + p.d + (p.p ? " · " + '<span class="good">' + money(p.p, true) + "</span>" : "") + (p.cost ? " · " + money(p.cost) : "") +
        "</span></span>" + (p.btn ? '<span class="act"><span class="gcf-btn">' + p.btn + "</span></span>" : "") + "</li>";
    });
    h += '</ol><div class="plan-sum"><span>Expected profit <b class="good">' + money(126000, true) + '</b></span><span class="muted">about 35 min · spends ' + money(46400) + " of " + money(421700) + "</span></div></div>";
    h += '<div><div class="box"><div class="h">This week <small>line: net gold a day · bars: hours played</small></div>' + weekChart(week, hours) + "</div>" +
      '<div class="box" style="margin-top:10px" id="t-ideas"><div class="h">Ideas</div>' +
      '<div style="margin-bottom:5px">Buy ' + item("linen") + " at Neutral for " + money(710) + ", sell at Alliance: <span class=good>" + money(240, true) + "</span> each, 140 sell a day</div>" +
      '<div style="margin-bottom:5px">1 more ' + item("cbar") + " unlocks 3 profitable recipes</div>" +
      "<div>" + item("shirt") + " disenchants for more than it sells: " + money(3500, true) + "</div></div></div></div>";
    return h;
  }
  function stat(k, v, d) { return '<div class="box stat"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="d">' + d + "</div></div>"; }
  function weekChart(v, hrs) {
    var W = 360, H = 130, pad = 22, max = Math.max.apply(null, v), days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"], s = "";
    var x = function (i) { return pad + i * (W - pad - 8) / (v.length - 1); }, y = function (n) { return H - 18 - n / max * (H - 30); };
    hrs.forEach(function (hh, i) { var bh = hh / 4 * (H - 30); s += '<rect x="' + (x(i) - 7) + '" y="' + (H - 18 - bh) + '" width="14" height="' + bh + '" fill="#3f8f3a" opacity="0.45"/>'; });
    s += '<polyline fill="none" stroke="#f2c94c" stroke-width="2" points="' + v.map(function (n, i) { return x(i) + "," + y(n); }).join(" ") + '"/>';
    v.forEach(function (n, i) { s += '<rect x="' + (x(i) - 3) + '" y="' + (y(n) - 3) + '" width="6" height="6" fill="#f2c94c"/><text x="' + x(i) + '" y="' + (H - 4) + '" fill="#a8987a" font-size="10" text-anchor="middle">' + days[i] + "</text>"; });
    s += '<text x="' + x(6) + '" y="' + (y(v[6]) + 16) + '" fill="#f2d17f" font-size="11" text-anchor="end">18g 42s</text>';
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" style="height:130px">' + s + "</svg>";
  }

  // ---------- Professions ----------
  var RANKED = [
    { p: "Tailoring", c: "#d8cfb8", g: 264000, n: 38, pr: "212 of 468", best: "Brown Linen Robe" },
    { p: "Alchemy", c: "#b8385a", g: 211000, n: 22, pr: "140 of 194", best: "Elixir of Minor Agility", mine: 187 },
    { p: "Leatherworking", c: "#8b5a2b", g: 148500, n: 31, pr: "260 of 590", best: "Medium Leather" },
    { p: "First Aid", c: "#efe7d6", g: 97200, n: 6, pr: "28 of 32", best: "Heavy Linen Bandage", mine: 225 },
    { p: "Cooking", c: "#c9823d", g: 71000, n: 17, pr: "92 of 131", best: "Longjaw Mud Snapper" },
    { p: "Engineering", c: "#8a8f99", g: 52400, n: 12, pr: "101 of 270", best: "Rough Boomstick" },
    { p: "Blacksmithing", c: "#b9bcc4", g: 38800, n: 9, pr: "150 of 471", best: "Copper Chain Belt" },
    { p: "Enchanting", c: "#8a5cc9", g: 0, n: 0, pr: "31 of 81", best: null }
  ];
  function professions() {
    var h = '<div class="h">Your professions</div><div class="tiles" style="grid-template-columns:1fr 1fr;margin-bottom:12px">' +
      tile("#b8385a", "Alchemy", "Skill 187 of 225 · 41 recipes known", money(98000) + "/h", "best: Elixir of Minor Agility") +
      tile("#efe7d6", "First Aid", "Skill 225 of 225 · 9 recipes known", money(71000) + "/h", "best: Heavy Linen Bandage") + "</div>";
    h += '<div id="t-ranked"><div class="h">Professions ranked <small>realistic gold a day · best 10 items that have been listed and sold · your 20% share</small>' +
      '<span class="gcf-btn" style="margin-left:auto">Rank again</span></div><div class="tiles" style="grid-template-columns:1fr 1fr 1fr">';
    var r = 0;
    RANKED.forEach(function (x) {
      var earns = x.g > 0; if (earns) r++;
      h += '<div class="tile"><span class="rank">' + (earns ? "#" + r : "") + '</span><i class="ic" style="background:' + x.c + ';width:24px;height:24px;margin:0"></i><div style="min-width:0"><div class="nm">' + x.p +
        (x.mine ? ' <span class="muted" style="font-weight:400">(yours)</span>' : "") + '</div><div class="sb">' + (earns ? "best: " + x.best : "nothing sells at a profit") + '</div><div class="sb">' + (earns ? x.n + " selling · " : "") + x.pr + " priced</div></div>" +
        '<div class="vl">' + (earns ? money(x.g) + '<span class="sb">a day</span>' : "") + "</div></div>";
    });
    h += '</div><div class="tiles" style="grid-template-columns:1fr 1fr 1fr;margin-top:8px">' +
      tile("#3f8f3a", "Herbalism", "4 herbs you've gathered", money(92000) + '<span class="muted"> /h</span>', "best: Silverleaf, Elwynn Forest") +
      tile("#b5703a", "Mining", "2 ores you've gathered", money(72000) + '<span class="muted"> /h</span>', "best: Copper Ore, Westfall") +
      tile("#8b5a2b", "Skinning", "not measured yet", '<span class="muted">-</span>', "gather for 10 minutes") + "</div></div>";
    return h;
  }
  function tile(c, nm, sb, vl, vs) {
    return '<div class="tile"><i class="ic" style="background:' + c + '"></i><div><div class="nm">' + nm + '</div><div class="sb">' + sb + '</div></div><div class="vl">' + vl + '<span class="sb">' + vs + "</span></div></div>";
  }
  var RECIPES = [
    { id: "agil", cost: 4100, sell: 9700, gh: 98000, day: 11, can: 12, mats: [["peace", 2, 600], ["vial", 1, 20], ["silver", 1, 1100]] },
    { id: "lion", cost: 1900, sell: 6200, gh: 61000, day: 8, can: 7, mats: [["earth", 1, 900], ["vial", 1, 20]] },
    { id: "heal", cost: 1450, sell: 2300, gh: 22000, day: 34, can: 4, mats: [["peace", 1, 600], ["silver", 1, 1100], ["vial", 1, 20]] },
    { id: "hband", cost: 1960, sell: 5010, gh: 71000, day: 23, can: 20, mats: [["linen", 2, 980]] }
  ];
  function recipes() {
    var h = '<div class="h">Alchemy <small>skill 187 · sorted by gold per hour · prices from your home house (Alliance)</small></div><table class="tbl" id="t-recipes"><tr><th>Recipe</th><th class="r">Cost to buy</th><th class="r">Sells for</th><th class="r">Profit</th><th class="r">Gold/hour</th><th class="r">Sells/day</th><th class="r">Can make</th></tr>';
    RECIPES.forEach(function (r, i) {
      var cut = Math.round(r.sell * 0.05);
      h += '<tr class="click' + (i === state.recipe ? " sel" : "") + '" data-recipe="' + i + '"><td>' + item(r.id) + '</td><td class="r">' + money(r.cost) + '</td><td class="r">' + money(r.sell) +
        '</td><td class="r good">' + money(r.sell - cut - r.cost, true) + '</td><td class="r">' + money(r.gh) + '</td><td class="r">' + r.day + '</td><td class="r">' + r.can + "</td></tr>";
    });
    var r = RECIPES[state.recipe], cut = Math.round(r.sell * 0.05), each = r.sell - cut - r.cost, n = Math.min(r.can, Math.ceil(r.day * 0.2 * 5));
    h += '</table><div class="row2" style="margin-top:12px"><div class="box"><div class="h">' + ITEMS[r.id].n + "</div>";
    r.mats.forEach(function (m) { h += "<div>" + m[1] + " × " + item(m[0]) + ' <span class="muted">at ' + money(m[2]) + " each</span></div>"; });
    h += '<div class="tip">Sale price walks the real listings at Alliance, minus the 5% cut (' + money(cut) + ").</div></div>" +
      '<div class="box" id="t-inshort"><div class="h">In short</div><div>You can make <b>' + r.can + "</b> now from your bags and bank.</div>" +
      "<div>About <b>" + r.day + "</b> sell a day at Alliance, so plan on " + n + " over the next few days.</div>" +
      '<div>Expected profit: <b class="good">' + money(each * n, true) + "</b> (" + money(each, true) + " each)</div>" +
      '<div class="muted">Beats selling the materials by ' + Math.round(each / r.cost * 100) + "%.</div></div></div>";
    return h;
  }

  // ---------- Market ----------
  var MARKET = [
    { id: "silver", now: 1100, usual: 830, day: 46, listed: 212 },
    { id: "linen", now: 980, usual: 1020, day: 140, listed: 860 },
    { id: "peace", now: 600, usual: 640, day: 58, listed: 340 },
    { id: "copper", now: 1450, usual: 1780, day: 37, listed: 95 },
    { id: "agil", now: 9700, usual: 9100, day: 11, listed: 24 },
    { id: "hband", now: 5010, usual: 4800, day: 23, listed: 61 },
    { id: "lleather", now: 420, usual: 390, day: 72, listed: 410 }
  ];
  function market() {
    var h = '<table class="tbl"><tr><th>Item</th><th class="r">Price now</th><th class="r">Usual</th><th class="r">Change</th><th class="r">Sells/day</th><th class="r">Listed</th></tr>';
    MARKET.forEach(function (m) {
      var ch = Math.round((m.now / m.usual - 1) * 100);
      h += '<tr class="click' + (m.id === state.item ? " sel" : "") + '" data-item="' + m.id + '"><td>' + item(m.id) + '</td><td class="r">' + money(m.now) + '</td><td class="r muted">' + money(m.usual) +
        '</td><td class="r ' + (ch >= 0 ? "good" : "bad") + '">' + (ch >= 0 ? "+" : "") + ch + '%</td><td class="r">' + m.day + '</td><td class="r muted">' + m.listed + "</td></tr>";
    });
    var m = MARKET.filter(function (x) { return x.id === state.item; })[0];
    h += '</table><div class="box" style="margin-top:10px" id="t-chart"><div class="h">' + ITEMS[m.id].n + " <small>10 days at each house · bars: sold a day · gold dots: what you actually got</small></div>" + priceChart(m) +
      '<div class="legend"><span><i style="background:#3b6fc9"></i>Alliance</span><span><i style="background:#b83a2e"></i>Horde</span><span><i style="background:#c9a24a"></i>Neutral (15% cut)</span><span><i style="background:#3f8f3a"></i>sold a day</span><span><i style="background:#f2c94c;border-radius:50%"></i>your sales</span></div></div>';
    return h;
  }
  function plain(c) { c = Math.round(c); var g = Math.floor(c / 10000), s = Math.floor(c / 100) % 100, cp = c % 100; return g ? g + 'g ' + s + 's' : s ? s + 's ' + cp + 'c' : cp + 'c'; }
  function seeded(seed) { return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }; }
  function priceChart(m) {
    var W = 720, H = 170, n = 10, rnd = seeded(m.now), lines = { a: [], h: [], ne: [] }, sold = [];
    for (var i = 0; i < n; i++) {
      var t = m.usual + (m.now - m.usual) * (i / (n - 1)) + (rnd() - 0.5) * m.usual * 0.12;
      lines.a.push(t); lines.h.push(t * (1.05 + (rnd() - 0.5) * 0.1)); lines.ne.push(t * (0.9 + (rnd() - 0.5) * 0.1));
      sold.push(m.day * (0.6 + rnd() * 0.8));
    }
    var all = lines.a.concat(lines.h, lines.ne), max = Math.max.apply(null, all) * 1.08, min = Math.min.apply(null, all) * 0.85;
    var x = function (i) { return 46 + i * (W - 60) / (n - 1); }, y = function (v) { return H - 22 - (v - min) / (max - min) * (H - 34); };
    var smax = Math.max.apply(null, sold), s = "";
    sold.forEach(function (v, i) { var bh = v / smax * 50; s += '<rect x="' + (x(i) - 9) + '" y="' + (H - 22 - bh) + '" width="18" height="' + bh + '" fill="#3f8f3a" opacity="0.4"/>'; });
    [["a", "#3b6fc9"], ["h", "#b83a2e"], ["ne", "#c9a24a"]].forEach(function (L) {
      s += '<polyline fill="none" stroke="' + L[1] + '" stroke-width="2" points="' + lines[L[0]].map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>';
    });
    [3, 6, 8].forEach(function (i) { s += '<circle cx="' + x(i) + '" cy="' + y(lines.a[i] * 0.95) + '" r="5" fill="#f2c94c" stroke="#000"/>'; });
    [max * 0.98, (max + min) / 2, min * 1.05].forEach(function (v) { s += '<text x="40" y="' + (y(v) + 4) + '" fill="#a8987a" font-size="10" text-anchor="end">' + plain(v) + '</text>'; });
    for (var d = 0; d < n; d += 3) s += '<text x="' + x(d) + '" y="' + (H - 6) + '" fill="#a8987a" font-size="10" text-anchor="middle">Nov ' + (15 + d) + "</text>";
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '">' + s + "</svg>";
  }

  // ---------- Materials ----------
  function materials() {
    var rows = [
      ["linen", 64, '<span class="badge b-craft">SEW</span> → ' + item("bolt"), "beats selling by 22%"],
      ["silver", 31, '<span class="badge b-sell">SELL</span> at Alliance', "32% over usual"],
      ["copper", 22, '<span class="badge b-hold">HOLD</span>', "in a dip: 19% under usual"],
      ["peace", 8, '<span class="badge b-save">SAVE UP</span>', "too few for the deposit to be worth it"],
      ["lleather", 40, '<span class="badge b-vendor">SELL (vendor)</span>', "a vendor pays more than you'd keep"],
      ["mleather", 12, '<span class="badge b-keep">KEEP</span>', "you marked it \"don't sell\""],
      ["snapper", 6, '<span class="badge b-craft">COOK</span> → Longjaw Mud Snapper', "sells 18 a day"]
    ];
    var h = '<div class="h">Materials you own <small>bags, banks and mailboxes on all your characters</small></div><table class="tbl" id="t-verdicts"><tr><th>Material</th><th class="r">You have</th><th>What to do</th><th>Why</th></tr>';
    rows.forEach(function (r) { h += "<tr><td>" + item(r[0]) + '</td><td class="r">' + r[1] + "</td><td>" + r[2] + '</td><td class="muted">' + r[3] + "</td></tr>"; });
    return h + '</table><div class="tip">Crafting is only suggested when it beats selling by your margin (10% by default). Sell advice follows your home auction house: where you actually post.</div>';
  }

  // ---------- Shopping and My auctions ----------
  function shopping() {
    var h = '<div class="row2"><div class="box" id="t-shop"><div class="h">Shopping list <small>for your queue: 20 bandages, 10 elixirs</small></div><table class="tbl">' +
      "<tr><th>Material</th><th class=r>Need</th><th class=r>Have</th><th>How</th></tr>" +
      "<tr><td>" + item("linen") + '</td><td class="r">40</td><td class="r">12</td><td><span class="badge b-buy">BUY</span> at Neutral, ' + money(710) + "</td></tr>" +
      "<tr><td>" + item("peace") + '</td><td class="r">20</td><td class="r">8</td><td><span class="badge b-gather">GATHER</span> 6 min, Elwynn</td></tr>' +
      "<tr><td>" + item("silver") + '</td><td class="r">10</td><td class="r">31</td><td class="good">have enough</td></tr>' +
      "<tr><td>" + item("vial") + '</td><td class="r">10</td><td class="r">0</td><td><span class="badge b-vendor">VENDOR</span> ' + money(20) + "</td></tr>" +
      '</table><div style="margin-top:8px;display:flex;gap:6px"><span class="gcf-btn">Shopping run</span><span class="gcf-btn">Send to your crafter</span></div>' +
      '<div class="tip">Buy 40 for ' + money(28400) + ", or gather them in 18 minutes in Elwynn Forest: your time is worth " + money(98000) + " an hour.</div></div>";
    h += '<div class="box" id="t-auctions"><div class="h">My auctions <small>Alliance · checked 2 min ago</small></div><table class="tbl">' +
      "<tr><th>Item</th><th class=r>Yours</th><th class=r>Cheapest other</th><th></th></tr>" +
      "<tr><td>" + item("silver") + ' ×14</td><td class="r">' + money(1100) + '</td><td class="r">' + money(1080) + '</td><td><span class="badge b-under">UNDERCUT</span></td></tr>' +
      "<tr><td>" + item("agil") + ' ×5</td><td class="r">' + money(9700) + '</td><td class="r">' + money(9900) + '</td><td class="good">cheapest</td></tr>' +
      "<tr><td>" + item("hband") + ' ×20</td><td class="r">' + money(5010) + '</td><td class="r">' + money(5050) + '</td><td class="good">cheapest</td></tr>' +
      '</table><div style="margin-top:8px;display:flex;gap:6px"><span class="gcf-btn">Check prices</span><span class="gcf-btn">Cancel selected</span><span class="gcf-btn">Post at ' + money(1079) + "</span></div>" +
      '<div class="tip">Repost price: 1 copper under the cheapest other seller, never under what yours cost or what a vendor pays. You still press the game\'s Post button.</div></div></div>';
    return h;
  }

  // ---------- Bags ----------
  function bags() {
    var fill = [["silver", 20, "SELL"], ["silver", 11, "SELL"], ["linen", 20, "CRAFT"], ["linen", 20, "CRAFT"], ["linen", 20, "CRAFT"], ["linen", 4, "CRAFT"], ["copper", 20, "HOLD"], ["copper", 2, "HOLD"],
      ["peace", 8, "PLAN"], ["heal", 5], ["hband", 20, "SELL"], ["agil", 5, "SELL"], ["lleather", 20, "SELL"], ["lleather", 20, "SELL"], ["mleather", 12], ["snapper", 6, "CRAFT"],
      ["shirt", 1, "SELL"], ["ess", 2, "HOLD"], ["thread", 10], ["vial", 4, "PLAN"]];
    var bcls = { SELL: "b-sell", HOLD: "b-hold", CRAFT: "b-craft", PLAN: "b-buy" }, h = '<div class="bagwrap"><div class="box" id="t-bags"><div class="h">Backpack and bags <small>worth ' + money(612400) + "</small></div><div class=slots>";
    for (var i = 0; i < 32; i++) {
      var f = fill[i];
      h += '<div class="slot">' + (f ? '<i class="ic" style="background:' + COL[ITEMS[f[0]].k] + '"></i>' + (f[1] > 1 ? '<span class="n">' + f[1] + "</span>" : "") +
        (f[2] ? '<span class="bd badge ' + bcls[f[2]] + '">' + f[2] + "</span>" : "") : "") + "</div>";
    }
    h += '</div><div class="tip">Badges show on the game\'s bags, Bagnon, Baganator and BagSmith too. Right-click, Shift-click and dragging work as usual.</div></div>';
    h += '<div class="box"><div class="h">Sections view <small>one click groups everything</small></div>' +
      group("Sell now", [["silver", 31], ["hband", 20], ["agil", 5], ["lleather", 40]], 321000) +
      group("Craft into", [["linen", 64], ["snapper", 6]], 71400) + group("Hold", [["copper", 22], ["ess", 2]], 34000) +
      group("Shopping for", [["peace", 8], ["vial", 4]], 4900) + "</div></div>";
    return h;
  }
  function group(t, list, v) {
    return '<div style="margin-bottom:8px"><div style="display:flex"><b class="gold-t">' + t + '</b><span style="margin-left:auto">' + money(v) + "</span></div>" +
      list.map(function (x) { return '<span style="margin-right:10px">' + x[1] + " × " + item(x[0]) + "</span>"; }).join("") + "</div>";
  }

  // ---------- Ledger ----------
  function ledger() {
    var h = '<div class="stats" id="t-ledger">' + stat("Sold, 7 days", money(864000), "212 items · 30 days " + money(3104000)) + stat("Bought, 7 days", money(311000), "materials and flips") +
      stat("Cut and deposits", money(43000), "5% faction · 15% Neutral") + stat("Earned per hour", money(142000), "money-making time only") + "</div>";
    h += '<div class="row2"><div class="box"><div class="h">Recent sales</div><table class="tbl">' +
      [["agil", 5, 48500, "Alliance", "2 h ago"], ["hband", 20, 100200, "Alliance", "5 h ago"], ["silver", 20, 22000, "Alliance", "yesterday"], ["linen", 40, 39200, "Alliance", "yesterday"], ["shirt", 1, 7800, "Neutral", "2 days ago"]]
        .map(function (r) { return "<tr><td>" + r[1] + " × " + item(r[0]) + '</td><td class="r">' + money(r[2]) + '</td><td class="muted">' + r[3] + '</td><td class="muted r">' + r[4] + "</td></tr>"; }).join("") +
      '</table></div><div class="box"><div class="h">Where your gold went <small>7 days</small></div><table class="tbl">' +
      [["Auction purchases", -311000], ["Repairs", -42300], ["Flights", -8400], ["Training", -15000], ["Postage", -1800], ["Vendor sales", 52200], ["Quests", 96000]]
        .map(function (r) { return "<tr><td>" + r[0] + '</td><td class="r ' + (r[1] < 0 ? "bad" : "good") + '">' + money(r[1], true) + "</td></tr>"; }).join("") +
      "</table></div></div>";
    return h;
  }

  // ---------- the tour ----------
  var STEPS = [
    { sec: "home", el: "#t-stats", title: "Home: your day at a glance",
      text: "Type /gcf or click the minimap button. Home compares today with yesterday and your average day, by the hour, so a short session isn't judged against a long one.",
      best: "Glance here when you log in. Gold per money-making hour tells you whether crafting and trading are paying off." },
    { sec: "home", el: "#t-scans", title: "Scan the auction houses",
      text: "Open an auction house and it scans by itself. The game allows one full scan every 15 minutes for your whole account, so GoldCraftForever shows when the next one is possible and who each house's latest scan came from.",
      best: "Scan your own faction's house every session and the Neutral house (Gadgetzan, Booty Bay, Everlook) when you pass by. Friends' scans fill in the rest." },
    { sec: "home", el: "#t-plan", title: "Follow today's plan",
      text: "One checklist in the order you'd do it: post what's selling high, buy materials, craft, post what you made. It never spends more than your gold and aims for your share of a day's sales, so it doesn't flood the market.",
      best: "Work top to bottom. Steps tick themselves off from your bags and scans. Search and Post fill the game's panels; you always press the final button." },
    { sec: "market", el: "#t-chart", title: "Market: what actually sells",
      text: "Every item you've scanned, with the price now, its usual price, and how many sell a day at each house. Click an item for its chart: price lines per house, bars for sales, and gold dots for what you actually got after the cut.",
      best: "Sort by Sells/day before you craft anything. A big margin on something nobody buys is not profit." },
    { sec: "professions", sub: "overview", el: "#t-ranked", title: "Which profession earns the most?",
      text: "Rank them works out realistic gold a day for every crafting profession, whether you have it or not: profit buying every material at today's prices, times what you could sell at your share of a day's sales. Gathering shows gold an hour from your own measured gathering.",
      best: "Use it when choosing or swapping a profession. A low \"priced\" count means it just needs more scans before you trust its rank." },
    { sec: "professions", sub: "recipes", el: "#t-inshort", title: "Recipes: cost, profit and gold per hour",
      text: "Every recipe with its cost to buy, what it sells for after the cut, gold per hour and sales per day. Pick one and \"In short\" sums it up: how many you can make, how many will sell, and the expected profit.",
      best: "Click the other recipes in the table to compare. Sort by Gold/hour and check Sells/day before queueing." },
    { sec: "materials", el: "#t-verdicts", title: "Materials: what to do with what you have",
      text: "Every material on all your characters gets a verdict: craft it into something, sell it (and where), hold it while the price is in a dip, save up for a bigger stack, sell to a vendor, or keep it.",
      best: "Check it after a farming trip, before you post anything." },
    { sec: "shopping", el: "#t-auctions", title: "Shopping and your auctions",
      text: "Queue recipes and get one shopping list, with BUY or GATHER for each material depending on what your time is worth. At the auction house, Shopping run steps through it, and My auctions finds anything undercut with a repost price.",
      best: "Press Check prices in My auctions each visit. Repost only what's undercut; your own listings are never counted against you." },
    { sec: "bags", el: "#t-bags", title: "Bags that know what things are worth",
      text: "SELL, HOLD, CRAFT and PLAN badges on your items, and one click groups them by what to do with each, with the value of every stack.",
      best: "Use Sections view on the way to the auction house: everything under Sell now goes up first." },
    { sec: "ledger", el: "#t-ledger", title: "Ledger: what actually sold",
      text: "Auction mail is read when you open the mailbox, so the ledger knows what sold, for how much, and where your gold went: repairs, flights, training and more.",
      best: "Open your mailbox after sales, even if you don't take the mail. That's what makes sales rates and gold per hour accurate." },
    { sec: null, el: null, title: "Now look around",
      text: "Click any tab in the window, any item in Market, or any recipe in Professions. Everything here is sample data; in the game it's all your own scans and play.",
      best: "Ready? Install it from CurseForge, type /gcf, and open an auction house." }
  ];
  var step = 0;

  function render() {
    $("#gcf-tabs").innerHTML = SECTIONS.map(function (s) {
      return '<div class="gcf-tab' + (s.key === state.sec ? " on" : "") + '" data-sec="' + s.key + '"><i style="background:' + s.ic + '"></i>' + s.title + "</div>";
    }).join("");
    var sec = SECTIONS.filter(function (s) { return s.key === state.sec; })[0], side = SIDE();
    $("#gcf-side").style.display = side ? "" : "none";
    $("#gcf-side").innerHTML = side ? '<div class="side-head"><img src="/goldcraft/art/emblem_' + sec.em + '.webp" alt=""><b>' + sec.title + "</b></div>" + side : "";
    $("#gcf-main").innerHTML = PANEL();
    highlight();
  }
  function highlight() {
    document.querySelectorAll(".tour-hi").forEach(function (e) { e.classList.remove("tour-hi"); });
    var s = STEPS[step];
    if (s && s.el && s.sec === state.sec && (!s.sub || s.sub === state.sub)) { var e = $(s.el); if (e) { e.classList.add("tour-hi"); var mn = $("#gcf-main"); mn.scrollTop = Math.max(0, e.offsetTop - 8); } }
  }
  function go(i) {
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    var s = STEPS[step];
    if (s.sec) { state.sec = s.sec; if (s.sub) state.sub = s.sub; }
    render();
    $("#tour-step").textContent = "Step " + (step + 1) + " of " + STEPS.length;
    $("#tour-title").textContent = s.title;
    $("#tour-text").textContent = s.text;
    $("#tour-best").innerHTML = "<b>Best way to use it:</b> " + s.best;
    $("#tour-prev").disabled = step === 0;
    $("#tour-next").textContent = step === STEPS.length - 1 ? "Start over" : "Next";
    document.querySelectorAll("#tour-dots button").forEach(function (b, k) { b.classList.toggle("on", k === step); });
  }

  // clicks inside the window
  $("#gcf-win").addEventListener("click", function (e) {
    var t = e.target.closest("[data-sec],[data-go],[data-item],[data-recipe]");
    if (!t) return;
    if (t.dataset.sec) { state.sec = t.dataset.sec; if (state.sec === "professions") state.sub = "overview"; }
    if (t.dataset.go) { var p = t.dataset.go.split(":"); state.sec = p[0]; state.sub = p[1]; }
    if (t.dataset.item) state.item = t.dataset.item;
    if (t.dataset.recipe) state.recipe = +t.dataset.recipe;
    render();
  });
  $("#tour-next").addEventListener("click", function () { go(step === STEPS.length - 1 ? 0 : step + 1); });
  $("#tour-prev").addEventListener("click", function () { go(step - 1); });
  $("#tour-dots").innerHTML = STEPS.map(function (_, i) { return '<button type="button" aria-label="Step ' + (i + 1) + '"></button>'; }).join("");
  $("#tour-dots").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    go(Array.prototype.indexOf.call(this.children, b));
  });

  // scale the 1000px window to fit the page
  function fit() {
    var stage = $("#demo-stage"), sc = $("#demo-scaler"), w = stage.clientWidth, k = Math.min(1, w / 1000);
    sc.style.transform = "scale(" + k + ")";
    stage.style.height = 650 * k + "px";
  }
  window.addEventListener("resize", fit);
  fit();
  go(0);
})();
