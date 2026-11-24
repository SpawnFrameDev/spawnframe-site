// GoldCraftForever, the interactive tour: the addon's window rebuilt from its own code and art,
// with sample data. Layout numbers come from UI/MainWindow.lua and UI/Tabs/*.lua.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var ART = "/goldcraft/art/", SPRITE = "/goldcraft/icons.svg?v=f414ef93";

  // ---------- money, exactly like ns.Money / ns.MoneyShort / ns.Signed ----------
  var COIN = { g: '<img class="coin" src="' + ART + 'coin_g.webp" alt="g">', s: '<img class="coin" src="' + ART + 'coin_s.webp" alt="s">', c: '<img class="coin" src="' + ART + 'coin_c.webp" alt="c">' };
  function M(c) { // full: 1g 23s 45c
    var neg = c < 0; c = Math.round(Math.abs(c));
    var g = Math.floor(c / 10000), s = Math.floor(c % 10000 / 100), cp = c % 100, t;
    if (g > 0) t = g + COIN.g + " " + s + COIN.s + " " + cp + COIN.c;
    else if (s > 0) t = s + COIN.s + " " + cp + COIN.c;
    else t = cp + COIN.c;
    return '<span class="m">' + (neg ? "-" : "") + t + "</span>";
  }
  function shortText(c) {
    var v = Math.abs(c);
    if (v >= 1000000) return Math.round(v / 10000) + "g";
    if (v >= 10000) return (v / 10000).toFixed(1).replace(/\.0$/, "") + "g";
    if (v >= 100) return Math.round(v / 100) + "s";
    return Math.round(v) + "c";
  }
  function MS(c) { // short, with coin letters
    var t = shortText(c), u = t.slice(-1);
    return '<span class="m">' + (c < 0 ? "-" : "") + t.slice(0, -1) + COIN[u] + "</span>";
  }
  function SG(c, short) { // signed: green +x / red -x, plain letters
    var t = short ? shortText(c) : plain(c);
    return '<span class="' + (c >= 0 ? "gr" : "rd") + '">' + (c >= 0 ? "+" : "-") + t + "</span>";
  }
  function plain(c) { c = Math.round(Math.abs(c)); var g = Math.floor(c / 10000), s = Math.floor(c % 10000 / 100), cp = c % 100;
    return g > 0 ? g + "g " + s + "s " + cp + "c" : s > 0 ? s + "s " + cp + "c" : cp + "c"; }

  // ---------- icons (game-icons.net glyphs standing in for the game's own icons) ----------
  var IC = {
    // sections and menus
    home: ["coins", "#e8b13a", "#5a3a08"], professions: ["anvil", "#9aa3ad", "#2e333a"], market: ["spyglass", "#c69a5a", "#3b2a12"],
    materials: ["herbs-bundle", "#7fb54a", "#22400f"], shopping: ["knapsack", "#b87a42", "#3d2410"], budget: ["two-coins", "#e0b048", "#4f3508"],
    bags: ["backpack", "#a5693a", "#371f0d"], ledger: ["book-cover", "#8e5a3a", "#2c160b"], friends: ["person", "#4f8fd6", "#11284a"],
    plan: ["scroll-unfurled", "#e2c27a", "#5a4114"], ideas: ["light-bulb", "#ffe27a", "#5a4a08"], alerts: ["alarm-clock", "#c9c9c9", "#3a3a3a"],
    export: ["scroll-quill", "#d9c08a", "#4a3a1a"], news: ["envelope", "#e8dcc0", "#5a4a30"], clock: ["pocket-watch", "#e0c060", "#4a3a10"],
    alliance: ["vertical-banner", "#3f74d6", "#0c1f4f"], horde: ["vertical-banner", "#c9372b", "#4a0c08"], neutral: ["coins", "#e8b13a", "#5a3a08"],
    overview: ["book-pile", "#b58a5a", "#3a2614"], leveling: ["upgrade", "#7fd16a", "#1f4a14"], disenchant: ["magic-swirl", "#b07ae0", "#2e1250"],
    routes: ["treasure-map", "#d8b878", "#4a3a1a"], staples: ["wheat", "#e0c060", "#5a4210"], flips: ["trade", "#e8b13a", "#4a3008"],
    mine: ["backpack", "#a5693a", "#371f0d"], trade: ["envelope", "#e8dcc0", "#5a4a30"], mail: ["envelope", "#e8dcc0", "#5a4a30"],
    Alchemy: ["round-bottom-flask", "#5fd0e0", "#0e3f4a"], Blacksmithing: ["anvil", "#9aa3ad", "#2e333a"], Cooking: ["cooking-pot", "#e08a3a", "#4a2208"],
    Enchanting: ["sparkles", "#c27ae8", "#381255"], Engineering: ["gears", "#c9a45a", "#3a2a0e"], "First Aid": ["bandage-roll", "#e05a4a", "#4a0e0a"],
    Fishing: ["fishing-pole", "#6a8fe0", "#142650"], Herbalism: ["herbs-bundle", "#7fb54a", "#22400f"], Leatherworking: ["leather-armor", "#b07a48", "#3a2010"],
    Mining: ["mining", "#b0b0b0", "#3a3a3a"], Skinning: ["animal-hide", "#c08a5a", "#3a2412"], Tailoring: ["sewing-needle", "#c8a8e8", "#3a2a55"],
    // items
    tin: ["rock", "#b9bcc4", "#3c3f46"], copper: ["rock", "#d88a4a", "#4a2410"], egg: ["big-egg", "#efe7d6", "#6a6050"], shadowgem: ["gems", "#b05ae0", "#2e0f4a"],
    silverleaf: ["curled-leaf", "#cfe0d0", "#3a5a40"], earthroot: ["plant-roots", "#b88a5a", "#3a2412"], boarmeat: ["meat", "#d86a5a", "#4a1410"],
    agate: ["crystal-cluster", "#7fd18a", "#1a4a22"], murloc: ["beast-eye", "#e0d05a", "#3a3a08"], peacebloom: ["dandelion-flower", "#f2f0d8", "#5a6a2a"],
    swiftthistle: ["thorny-vine", "#9fd06a", "#264a10"], briarthorn: ["thorny-vine", "#b86a8a", "#3a1022"], bruiseweed: ["leaf-swirl", "#8fbf5a", "#22400f"],
    clam: ["meat", "#e0b0a0", "#5a3a30"], coarsestone: ["stone-block", "#a8a094", "#3a362e"], copperbar: ["metal-bar", "#e09a5a", "#4a2a10"],
    coyote: ["meat", "#c86a4a", "#3a140a"], spidermeat: ["spider-alt", "#b08a6a", "#3a2a1a"], vial: ["vial", "#cfe8f0", "#3a4a55"],
    fireoil: ["drop", "#ff8a3a", "#5a1a08"], lichen: ["mushroom-gills", "#9ad0b0", "#1f4a3a"], gravemoss: ["mushrooms", "#9aa36a", "#2a3010"],
    healpot: ["round-potion", "#ff5a5a", "#4a0a0a"], milk: ["coffee-mug", "#f2f0e8", "#5a5550"], kingsblood: ["rose", "#d8304a", "#4a0814"],
    essence: ["sparkles", "#8fa8ff", "#14205a"], manapot: ["round-potion", "#5a8aff", "#0a1a4a"], liferoot: ["tree-roots", "#9ac06a", "#2a3a10"],
    lighthide: ["animal-hide", "#d0a070", "#4a2a10"], cerulean: ["paint-bucket", "#4ab0ff", "#0a2a5a"], swiftness: ["standing-potion", "#7ae07a", "#0e4a14"],
    agility: ["bubbling-flask", "#7ae0a0", "#0e4a2a"], magenta: ["paint-bucket", "#e04ac0", "#4a0a3a"], freeaction: ["standing-potion", "#ffd84a", "#5a4a0a"],
    lodestone: ["rock", "#8a8fa8", "#22253a"], blackmouth: ["oil-can", "#4a4a4a", "#101010"], snapper: ["fish-cooked", "#e0a05a", "#4a2a10"],
    fishbowl: ["fish-bucket", "#6ab0e0", "#0e2a4a"], smallfish: ["angler-fish", "#7ab0d0", "#14304a"], sharpening: ["stone-block", "#c0b8a8", "#3a362e"],
    candle: ["candle-light", "#ffd27a", "#4a3010"], acid: ["chemical-drop", "#c0ff4a", "#2a4a0a"], ribs: ["meat", "#c86a4a", "#3a140a"],
    manawell: ["chalice-drops", "#6ab0ff", "#0a224a"], smelt: ["metal-bar", "#e09a5a", "#4a2a10"], chair: ["campfire", "#d0904a", "#3a1a08"],
    rage: ["potion-ball", "#ff4a4a", "#4a0a0a"], wool: ["wool", "#e8e0d0", "#5a5040"], linen: ["rolled-cloth", "#e8dcc0", "#5a4a30"],
    mageroyal: ["flower-star", "#c070e0", "#3a1050"], silverbar: ["metal-bar", "#dcdcdc", "#4a4a4a"], vulture: ["meat", "#c87a5a", "#3a1a0a"],
    silk: ["sewing-string", "#f0f0f0", "#4a4a5a"], flamesac: ["fire", "#ff6a2a", "#4a0a08"], shot: ["bullets", "#c0a060", "#3a2a10"],
    dragonscale: ["gems", "#4a8aff", "#0a1a4a"], cloak: ["cloak", "#6a9a5a", "#1a2a10"], gloves: ["gloves", "#a07a4a", "#2a1a0a"],
    robe: ["robe", "#8a6ac0", "#22104a"], belt: ["belt", "#9a7a4a", "#2a1a0a"], boots: ["boots", "#8a6a4a", "#2a1a0a"], sword: ["broadsword", "#c0c8d8", "#2a3040"],
    mail: ["mail-shirt", "#a8b0c0", "#2a3040"], feather: ["feather", "#e8e8f0", "#4a4a5a"], hearthstone: ["rock", "#8acfe0", "#14304a"]
  };
  function ic(k, cls) {
    var d = IC[k] || ["barbed-star", "#888", "#333"];
    return '<i class="wi' + (cls ? " " + cls : "") + '" style="--a:' + d[1] + ";--b:" + d[2] + '"><svg><use href="' + SPRITE + "#i-" + d[0] + '"/></svg></i>';
  }
  var NAME = { tin: "Tin Ore", copper: "Copper Ore", egg: "Small Egg", shadowgem: "Shadowgem", silverleaf: "Silverleaf", earthroot: "Earthroot",
    boarmeat: "Chunk of Boar Meat", agate: "Moss Agate", murloc: "Murloc Eye", peacebloom: "Peacebloom", swiftthistle: "Swiftthistle", briarthorn: "Briarthorn",
    bruiseweed: "Bruiseweed", clam: "Clam Meat", coarsestone: "Coarse Stone", copperbar: "Copper Bar", coyote: "Coyote Meat", spidermeat: "Crisp Spider Meat",
    vial: "Empty Vial", fireoil: "Fire Oil", lichen: "Frilled Lichen", gravemoss: "Grave Moss", healpot: "Healing Potion", milk: "Ice Cold Milk",
    kingsblood: "Kingsblood", essence: "Lesser Magic Essence", manapot: "Lesser Mana Potion", liferoot: "Liferoot", lighthide: "Light Hide",
    cerulean: "Cerulean Dye", swiftness: "Swiftness Potion", agility: "Elixir of Minor Agility", magenta: "Magenta Dye", freeaction: "Free Action Potion",
    lodestone: "Lodestone", blackmouth: "Blackmouth Oil", snapper: "Longjaw Mud Snapper", fishbowl: "Fish Bowl", smallfish: "Raw Brilliant Smallfish",
    sharpening: "Rough Sharpening Stone", candle: "Incense Candle", acid: "Sulfuric Acid", ribs: "Dry Pork Ribs", manawell: "Mana Well", smelt: "Smelt Copper",
    chair: "Camp Chair", rage: "Rage Potion", wool: "Wool Cloth", linen: "Linen Cloth", mageroyal: "Mageroyal", silverbar: "Silver Bar",
    vulture: "Stringy Vulture Meat", silk: "Spider's Silk", flamesac: "Small Flame Sac", shot: "Crafted Light Shot", dragonscale: "Blue Dragonscale" };
  function it(k, cls) { return ic(k) + '<span class="' + (cls || "h") + '">' + NAME[k] + "</span>"; }

  // ---------- small builders ----------
  function btn(t, cls, w) { return '<span class="b' + (cls ? " " + cls : "") + '"' + (w ? ' style="width:' + w + 'px"' : "") + ">" + t + "</span>"; }
  function chk(t, on) { return '<span class="chk' + (on ? " on" : "") + '"><i></i>' + t + "</span>"; }
  function search(t, w) { return '<span class="inp" style="width:' + w + 'px"><svg viewBox="0 0 512 512"><use href="' + SPRITE + '#i-magnifying-glass"/></svg>' + t + "</span>"; }
  function at(x, y, html, extra) { return '<div class="ab" style="left:' + x + "px;top:" + y + "px;" + (extra || "") + '">' + html + "</div>"; }
  // cols: [title, width or null (flex), "l" for left]; rows: arrays of cells, or {cells, cls, data}
  function table(cols, rows, opts) {
    opts = opts || {};
    var h = '<table class="tb"' + (opts.id ? ' id="' + opts.id + '"' : "") + "><colgroup>" + cols.map(function (c) { return "<col" + (c[1] ? ' style="width:' + c[1] + 'px"' : "") + ">"; }).join("") + "</colgroup><tr>" +
      cols.map(function (c) { return '<th class="' + (c[2] || "") + '">' + c[0] + "</th>"; }).join("") + "</tr>";
    rows.forEach(function (r) {
      var cells = r.cells || r;
      h += "<tr" + (r.cls ? ' class="' + r.cls + '"' : "") + (r.data ? " " + r.data : "") + ">" + cells.map(function (v, i) { return '<td class="' + (cols[i][2] || "") + '">' + v + "</td>"; }).join("") + "</tr>";
    });
    return h + "</table>";
  }
  function heading(t, extra) { return '<div class="hd">' + t + (extra || "") + "</div>"; }
  function tile(x, y, w, icon, name, sub, val, cap, extra) {
    return '<div class="tile" style="left:' + x + "px;top:" + y + "px;width:" + w + 'px"' + (extra || "") + ">" + ic(icon) + '<div class="n">' + name + '</div><div class="s">' + sub +
      '</div><div class="v">' + val + '</div><div class="c">' + cap + "</div></div>";
  }

  // ---------- the window frame ----------
  var SECTIONS = [
    { key: "home", title: "Home", em: "emblem_home" }, { key: "professions", title: "Professions", em: "emblem_recipes" },
    { key: "market", title: "Market", em: "emblem_market" }, { key: "materials", title: "Materials" }, { key: "shopping", title: "Shopping" },
    { key: "budget", title: "Budget" }, { key: "bags", title: "Bags" }, { key: "ledger", title: "Ledger" }, { key: "friends", title: "Friends" }
  ];
  var st = { sec: "home", page: "home", homeMode: "plan", market: "tin", recipe: 0, prof: "Alchemy", marketView: "all" };

  function sideEntry(icon, label, note, on, go, dim) {
    return '<div class="se' + (on ? " on" : "") + (dim ? " dim" : "") + '"' + (go ? ' data-go="' + go + '"' : "") + ">" + ic(icon, dim ? "dim" : "") + "<span>" + label + "</span>" +
      '<span class="nt">' + (note || "") + "</span></div>";
  }
  var RULE = '<div class="srule"></div>';
  function side() {
    var s = st.sec;
    if (s === "home") return '<div id="side-plan">' + sideEntry("plan", "Today's plan", "2/12", st.homeMode === "plan", "home:plan") + sideEntry("ideas", "Ideas", "", st.homeMode === "ideas", "home:ideas") + "</div>" + RULE +
      sideEntry("alerts", "Price alerts", "", false, "market") + sideEntry("export", "Export for AI") + sideEntry("news", "What's new") + RULE +
      '<div id="side-scans">' + sideEntry("alliance", "Alliance", '<span class="h">12 min</span>') + sideEntry("horde", "Horde", '<span class="g">3 hr</span>') +
      sideEntry("neutral", "Neutral", '<span class="h">1 hr</span>') + sideEntry("clock", "Next scan", "3 min") + "</div>" +
      sideEntry("mail", "Gold on its way", "38 min");
    if (s === "professions") {
      var profs = [["Alchemy", 187], ["Cooking", 150], ["First Aid", 225], ["Fishing", 177], ["Herbalism", 177], ["Blacksmithing"], ["Enchanting"], ["Engineering"], ["Leatherworking"], ["Mining"], ["Skinning"], ["Tailoring"]];
      return sideEntry("overview", "Overview", "", st.page === "professions", "professions") +
        profs.map(function (p) { return sideEntry(p[0], p[0], p[1] || "", st.page === "recipes" && st.prof === p[0], "recipes:" + p[0], !p[1]); }).join("") + RULE +
        sideEntry("leveling", "Leveling") + sideEntry("disenchant", "Disenchant") + sideEntry("routes", "Routes", "", st.page === "routes", "routes");
    }
    if (s === "market") {
      return [["market", "All items", "all"], ["staples", "Staples", "staples"], ["flips", "Flips", "flips"], ["professions", "My professions", "prof"], ["mine", "I have", "mine"], ["alerts", "Price alerts", "alerts"]]
        .map(function (v) { return sideEntry(v[0], v[1], "", st.marketView === v[2], "mview:" + v[2]); }).join("") + RULE + sideEntry("trade", "Trade chat deals");
    }
    return "";
  }
  function footer() {
    return '<div class="st"><span class="g">Scanned</span>&nbsp; ' + ic("alliance") + ' Alliance <span class="h">12 min ago</span>&nbsp;&nbsp; ' + ic("horde") +
      ' Horde <span class="g">3 hr ago</span>&nbsp;&nbsp; ' + ic("neutral") + ' Neutral <span class="h">1 hr ago</span></div>' + btn("Scan AH", "off") + '<div class="grip"></div>';
  }

  // ---------- Home (UI/Tabs/HomeTab.lua) ----------
  var PLAN = [
    { ph: "At the auction house" },
    { done: true, t: "Scan the Alliance auction house", g: " (last scan 12 min ago)" },
    { done: true, t: "Post 14 Silverleaf at Alliance", g: " (32% above usual, about 11s each)" },
    { t: "Buy 18 Swiftthistle at Neutral", g: " (up to 3s each, about 50s)", act: "Search" },
    { t: "Buy 40 Rosecap at Neutral", g: " (up to 10s each, about 4.1g)", act: "Search" },
    { t: "Buy 9 Empty Vial from a vendor", g: " (about 16s)" },
    { ph: "Crafting" },
    { t: "Get 6 Silverleaf from your other characters", g: " (mail or bank)" },
    { t: "Craft 20 x Elixir of Minor Agility", g: " (", gain: 6100, g2: " over selling the materials)" },
    { t: "Craft 20 x Magenta Dye", g: " (", gain: 7100, g2: " over selling the materials)" },
    { ph: "Back at the auction house" },
    { t: "Post 20 Elixir of Minor Agility at Alliance", g: " (sells about 741 a day, about 6s each)", act: "Post" },
    { t: "Post 20 Magenta Dye at Alliance", g: " (sells about 390 a day, about 25s each)", act: "Post" }
  ];
  function home() {
    var W = 894, tw = (W - 24) / 4, h = "";
    h += at(2, 2, '<span class="g">Server 20:14 · your time 20:14</span><span class="d">&nbsp;&nbsp; New day in 3h 46m (server midnight)</span>', "font-size:10.5px");
    h += at(W - 120 - 8 - 120, 4, '<span class="d sm">Last export 2d ago</span>', "width:120px;text-align:right") + at(W - 120, 0, btn("Export for AI", "", 120));
    h += at(2, 26, "Played 2.4 h today vs 3.1 h yesterday. You earned 7.7g per hour played vs 3.9g — <span class=gr>better</span>.", "color:var(--gold);width:" + W + "px");
    h += at(2, 44, '<span class="d">Set a daily or weekly gold goal in Settings (or /gcf goal 2g 10g) to track it here.</span>', "font-size:10.5px");
    var tiles = [["Played", "2.4 h", 'Yesterday 3.1 h  ·  avg day 2.2 h', "Money-making today 1.3 h, avg 1.1 h"],
      ["Net gold", '<span class="gr">+18.4g</span>', 'Yesterday <span class=gr>+12.1g</span>  ·  avg day <span class=gr>+9.6g</span>', "37 sold today, avg 22"],
      ["Per hour played", "7.7g", "Yesterday 3.9g  ·  avg day 4.4g", 'vs yesterday <span class=gr>(+97%)</span>  vs avg <span class=gr>(+75%)</span>'],
      ["Per money-making hour", "14.2g", "Yesterday 8.1g  ·  avg day 9.3g", 'vs yesterday <span class=gr>(+75%)</span>  vs avg <span class=gr>(+53%)</span>']];
    h += '<div id="home-tiles">';
    tiles.forEach(function (t, i) {
      h += '<div class="pnl" style="left:' + (i * (tw + 8)) + 'px;top:62px;width:' + tw + 'px;height:78px"><div class="t">' + t[0] + '</div><div class="bg">' + t[1] + '</div><div class="s1">' + t[2] + '</div><div class="s2">' + t[3] + "</div></div>";
    });
    h += "</div>";
    var cw = Math.floor(W * 0.58);
    h += at(2, 152, 'This week<span class="d">  line: net gold per day   </span><span style="color:#73cc59">bars: hours played</span>', "color:var(--gold)");
    h += '<div class="chart" style="left:0;top:168px;width:' + cw + 'px;height:160px">' + weekChart(cw, 160) + "</div>";
    h += at(cw + 12, 152, "Week's best", "color:var(--gold)");
    var best = [["Your top seller (material):", " Swiftness Potion " + M(40502) + ' <span class="d">(87 sold)</span>'],
      ["Your top seller (crafted):", " Cerulean Dye " + M(205136) + ' <span class="d">(34 sold)</span>'],
      ["Account worth:", " 86.4g " + '<span class="d">(gold 67.1g, items 19.3g)</span> <span class=gr>+12.8g</span>'],
      ["Spent outside the market:", " 6.7g " + '<span class="d">(training 4.6g, flights 1g)</span>'],
      ["Your strongest market:", ' Cloth <span class="d">(100% sold, 30 days)</span>'],
      ["Fastest seller you can make:", ' Crafted Light Shot <span class="d">(22163 a day)</span>'],
      ["Best recipe right now:", " Elixir of Minor Agility 22.9g/h"],
      ["Biggest staple move:", ' Blue Dragonscale <span class=rd>-68%</span> <span class="d">vs its 30 days</span>']];
    h += '<div id="home-best">';
    best.forEach(function (b, i) { h += at(cw + 12, 168 + 2 + i * 20, '<span class="g">' + b[0] + "</span>" + b[1], "font-size:10.5px;width:" + (W - cw - 14) + "px;white-space:nowrap;overflow:hidden"); });
    h += "</div>";
    var py = 336;
    h += '<div id="home-plan">';
    h += at(0, py, btn("Today's plan", st.homeMode === "plan" ? "off" : "", 90) + " " + btn("Ideas", st.homeMode === "ideas" ? "off" : "", 60), "display:flex;gap:4px");
    if (st.homeMode === "plan") {
      h += at(164, py + 4, '<span class="g">2/12</span>&nbsp; <span class="d">12 steps, about 30 min, expect </span>' + SG(126000, true) + '<span class="d"> profit, 1.1g from selling what you hold, uses 4.6g of your 42.2g.  Today so far: </span>' + SG(184200, true),
        "font-size:10.5px;width:" + (W - 164 - 90) + "px;white-space:nowrap;overflow:hidden");
      h += at(W - 80, py, btn("New plan", "", 80));
      var y = py + 28, fit = 12, shown = PLAN.slice(0, fit);
      shown.forEach(function (p, idx) {
        var more = idx === fit - 1 ? '<span class="d">   (scroll for ' + (PLAN.length - fit) + " more)</span>" : "";
        if (p.ph) { h += at(0, y, '<span class="g">' + p.ph + "</span>" + more); y += 18; return; }
        var text = p.t + '<span class="d">' + p.g + (p.gain ? "</span>" + SG(p.gain, true) + '<span class="d">' + p.g2 : "") + "</span>";
        if (p.done) text = '<span class="d">' + (p.t + p.g + (p.gain ? "+" + shortText(p.gain) + p.g2 : "")) + "</span>";
        h += at(0, y, chk("", p.done) + '<span style="margin-left:6px">' + text + more + "</span>", "display:flex;align-items:center;width:" + (W - 70) + "px");
        if (p.act) h += at(W - 60, y - 1, btn(p.act, "", 60), "height:18px");
        y += 18;
      });
    } else {
      var ideas = ["Buy 40 Linen Cloth at Neutral for 7s 10c, resell at Alliance: <span class=gr>+2s 40c</span> each, about 140 sell a day",
        "1 more Copper Bar unlocks 3 profitable recipes", "Your Kingsblood is 31% above usual at Alliance: a good time to sell 28",
        "Free Action Potion is listed 22% under its usual price at Neutral (alert)", "Briarthorn at Neutral sells for less than a vendor pays: buy 12, +4s each"];
      ideas.forEach(function (t, i) { h += at(0, py + 28 + i * 18, '<span class="g">' + (i + 1) + ".</span> " + t); });
    }
    h += "</div>";
    h += at(2, 588, '<span class="g">Gold on all characters</span>&nbsp; ' + M(670512), "font-size:10.5px");
    return h;
  }
  function weekChart(w, h) {
    var net = [3.1, -1.2, 9.6, 4.3, 7.8, 12.1, 18.4], hrs = [2.0, 0.4, 3.1, 1.2, 2.4, 3.1, 2.4], avg = 7.7, days = ["Nov 18", "", "", "", "", "", "Nov 24"];
    var L = 36, R = 34, T = 14, B = 18, max = 20, min = -2, s = "", n = net.length;
    var x = function (i) { return L + i * (w - L - R) / (n - 1); }, y = function (v) { return T + (max - v) / (max - min) * (h - T - B); };
    hrs.forEach(function (v, i) { var bh = v / 3.5 * (h - T - B); s += '<rect x="' + (x(i) - 9) + '" y="' + (h - B - bh) + '" width="18" height="' + bh + '" fill="#2f7a2a" opacity="0.85"/>'; });
    s += '<polyline fill="none" stroke="#8c8c8c" stroke-width="1.5" points="' + net.map(function (v, i) { return x(i) + "," + y(avg); }).join(" ") + '"/>';
    net.forEach(function (v, i) { s += '<rect x="' + (x(i) - 2.5) + '" y="' + (y(avg) - 2.5) + '" width="5" height="5" fill="#8c8c8c"/>'; });
    s += '<polyline fill="none" stroke="#ffd100" stroke-width="2" points="' + net.map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>';
    net.forEach(function (v, i) { s += '<rect x="' + (x(i) - 3) + '" y="' + (y(v) - 3) + '" width="6" height="6" fill="#ffd100"/>'; });
    s += '<text x="4" y="' + (y(18.4) + 4) + '" fill="#fff" font-size="10">18.4g</text><text x="4" y="' + (h - B + 2) + '" fill="#fff" font-size="10">0c</text>';
    s += '<text x="' + (w - 4) + '" y="' + (T + 8) + '" fill="#73cc59" font-size="10" text-anchor="end">3.1</text><text x="' + (w - 4) + '" y="' + (T + 20) + '" fill="#73cc59" font-size="10" text-anchor="end">h</text>';
    s += '<text x="' + x(0) + '" y="' + (h - 4) + '" fill="#fff" font-size="10" text-anchor="middle">' + days[0] + '</text><text x="' + x(n - 1) + '" y="' + (h - 4) + '" fill="#fff" font-size="10" text-anchor="middle">' + days[6] + "</text>";
    return '<svg viewBox="0 0 ' + w + " " + h + '">' + s + "</svg>";
  }

  // ---------- Professions overview (UI/Tabs/ProfessionsTab.lua, with 0.26.2's ranking) ----------
  function professions() {
    var W = 894, h = at(2, 0, "Pick a profession to see what every recipe earns at each auction house, how fast it sells, and what to craft today.", "font-size:11px");
    h += at(0, 16, heading("Your professions"), "width:" + W + "px");
    var mine = [["Alchemy", "Skill 187/225 · 41 known", 239166], ["Cooking", "Skill 150/150 · 20 known", 13050], ["First Aid", "Skill 225/225 · 12 known", 5374],
      ["Fishing", "Skill 177/225 · 1 known", 9261], ["Herbalism", "Skill 177/225 · 1 known", 1581]], cw3 = (W - 16) / 3;
    mine.forEach(function (p, i) { h += tile((i % 3) * (cw3 + 8), 44 + Math.floor(i / 3) * 54, cw3, p[0], p[0], p[1], M(p[2]), "best per hour"); });
    h += at(0, 152, heading("Best to craft right now"), "width:" + W + "px");
    var bestc = [["freeaction", "Free Action Potion", "Alchemy · sell at Alliance · about 618 a day", 239166, 387], ["magenta", "Magenta Dye", "Alchemy · sell at Alliance · about 540 a day", 166575, 380],
      ["cerulean", "Cerulean Dye", "Alchemy · sell at Alliance · about 729 a day", 145944, 203], ["swiftness", "Swiftness Potion", "Alchemy · sell at Neutral · about 45 a day", 128192, 2827]];
    var cw2 = (W - 8) / 2;
    bestc.forEach(function (b, i) { h += tile((i % 2) * (cw2 + 8), 180 + Math.floor(i / 2) * 54, cw2, b[0], b[1], b[2], M(b[3]) + ' <span class="d">/h</span>', 'profit <span class="gr">+' + plain(b[4]) + "</span>"); });
    h += '<div id="ranked">' + at(0, 288, heading("Professions ranked", btn("Rank again", "", 110)), "width:" + W + "px");
    h += at(0, 312, '<span class="d">Realistic gold a day: the best 10 items that have been listed and sold, at your 20% share of a day\'s sales, buying every material at today\'s prices. Worked out 2 min ago.</span>', "font-size:10.5px;width:" + W + "px;white-space:nowrap;overflow:hidden");
    var R = [["Tailoring", "#1", false, 264000, 38, "212 of 468", "Brown Linen Robe"], ["Alchemy", "#2", true, 211000, 22, "140 of 194", "Elixir of Minor Agility"],
      ["Leatherworking", "#3", false, 148500, 31, "260 of 590", "Medium Leather"], ["First Aid", "#4", true, 97200, 6, "28 of 32", "Heavy Linen Bandage"],
      ["Cooking", "#5", true, 71000, 17, "92 of 131", "Longjaw Mud Snapper"], ["Engineering", "#6", false, 52400, 12, "101 of 270", "Rough Boomstick"],
      ["Blacksmithing", "#7", false, 38800, 9, "150 of 471", "Copper Chain Belt"], ["Enchanting", "", false, 0, 0, "31 of 81", ""]];
    R.forEach(function (r, i) {
      h += tile((i % 3) * (cw3 + 8), 334 + Math.floor(i / 3) * 54, cw3, r[0], (r[1] ? r[1] + "&nbsp; " : "") + r[0] + (r[2] ? '<span class="d">&nbsp; (yours)</span>' : ""),
        (r[4] ? r[4] + " selling items" : "0 selling items") + "  ·  " + r[5] + " priced", r[3] ? MS(r[3]) + '<span class="d"> /day</span>' : '<span class="d">nothing sells at a profit</span>', r[6] ? "best: " + r[6] : "");
    });
    var G = [["Herbalism", "4 items you've gathered", 92000, "best: Silverleaf"], ["Mining", "2 items you've gathered", 72000, "best: Copper Ore"], ["Skinning", "not measured yet: gather for 10 minutes", 0, "gathering"]];
    G.forEach(function (g, i) { h += tile((2 + i) % 3 * (cw3 + 8), 334 + Math.floor((8 + i) / 3) * 54, cw3, g[0], g[0], g[1], g[2] ? MS(g[2]) + '<span class="d"> /h</span>' : '<span class="d">-</span>', g[3]); });
    return h + "</div>";
  }

  // ---------- Recipes (UI/Tabs/RecipesTab.lua) ----------
  var RECIPES = [
    { k: "cerulean", sk: 50, buy: 5800, farm: 4, sale: 6000, h: "Alliance", pb: 200, pf: 6000, ret: "4%", day: 729, gph: "15.1g", can: 0 },
    { k: "swiftness", sk: 90, buy: 300, farm: 4, sale: 3100, h: "Neutral", pb: 2800, pf: 3100, ret: "956%", day: 45, gph: "12.8g", can: 2 },
    { k: "agility", sk: 80, buy: 200, farm: 4, sale: 400, h: "Alliance", pb: 200, pf: 400, ret: "63%", day: 516, gph: "7.9g", can: 2 },
    { k: "freeaction", sk: 150, buy: 5500, farm: 4, sale: 9900, h: "Alliance", pb: 4400, pf: 9900, ret: "80%", day: 618, gph: "23.9g", can: 7 },
    { k: "blackmouth", sk: 80, buy: 84, farm: 4, sale: 200, h: "Neutral", pb: 116, pf: 196, ret: "151%", day: 102, gph: "1.3g", can: 0 }
  ];
  function recipes() {
    var W = 894, h = "";
    h += at(0, 0, btn("Alchemy  v", "", 134) + search("Filter recipes...", 116) + btn("Price: average", "", 96) + chk("Profitable only", true) + chk("Only learned", true) + chk("I have materials", true), "display:flex;gap:12px;align-items:center");
    h += at(0, 26, '<span style="color:#7fff7f">You have Alchemy (187/225).</span><span class="d"> Gray = not learned. Click a title to sort. Right-click a recipe to queue it.</span>', "font-size:10.5px");
    h += at(0, 42, table([["Recipe", null, "l"], ["Skill", 40], ["Cost to buy", 78], ["If farmed", 70], ["Sells for", 112], ["Profit buying", 88], ["Profit farming", 92], ["Return", 56], ["Sells/day", 62], ["Gold/hour v", 74], ["Can make", 64]],
      RECIPES.map(function (r, i) {
        return { cls: "k" + (i === st.recipe ? " sel" : ""), data: 'data-recipe="' + i + '"', cells: [it(r.k), r.sk, M(r.buy), M(r.farm), M(r.sale) + ' <span class="d">' + r.h + "</span>", SG(r.pb, true), SG(r.pf, true), r.ret, r.day, MS(Math.round(parseFloat(r.gph) * 10000)), '<span class="' + (r.can ? "bl" : "d") + '">' + r.can + "</span>"] };
      }), { id: "rc-table" }), "width:" + W + "px");
    var r = RECIPES[st.recipe], nm = NAME[r.k];
    var y = 140;
    h += '<div id="rc-detail">' + at(0, y, '<span class="g lg">' + nm + '</span><span class="d">&nbsp; Alchemy</span>') + at(W - 170, y, '<span class="h sm">How many:</span>&nbsp;<span class="inp box" style="width:34px;justify-content:center">1</span>&nbsp;' + btn("Add to queue", "", 96), "display:flex;align-items:center");
    h += at(0, y + 20, 'Makes 1 x ' + nm + '&nbsp; Skill: <span class="g">yellow ' + r.sk + '</span>, <span class="gr">green ' + (r.sk + 20) + '</span>, <span class="d">gray ' + (r.sk + 40) + "</span>", "font-size:10.5px");
    h += at(0, y + 34, '<span class="g">Learn:</span> Learn it from a trainer (or a quest).', "font-size:10.5px") + at(0, y + 48, '<span class="d">Known by Kaelthar</span>', "font-size:10.5px");
    h += at(0, y + 66, table([["Material", null, "l"], ["Need", 40], ["Have", 40], ["Get it from", 120, "l"], ["Vendor", 60], ["Alliance", 70], ["Horde", 60], ["Neutral", 70], ["Best price", 100], ["Cost", 60], ["If farmed", 60]],
      [[it("lichen"), 2, 1, '<span class="bl">AH or farm</span>', "-", M(2900), "-", M(3000), M(2900) + ' <span class="d">Alliance</span>', M(5800), '<span class="gr">free</span>'],
       [it("vial"), 1, '<span class="bl">12</span>', '<span class="bl">Vendor or AH</span>', M(4), M(6), "-", M(59), M(4) + ' <span class="d">Vendor</span>', M(4), M(4)]]), "width:" + W + "px");
    var L = [['<span class="gr">Sell it: Alliance AH ' + M(6000) + ' (best)</span>&nbsp;&nbsp; Neutral AH ' + M(6700) + "&nbsp;&nbsp; Vendor " + M(75) + '&nbsp;&nbsp; <span class="d">after the AH cut</span>', 13],
      ['<span class="g">If you buy everything:</span> costs ' + M(5798) + ' &nbsp;-&gt;&nbsp; profit ' + SG(210), 13],
      ['<span class="g">If you farm the raw materials:</span> costs ' + M(4) + ' <span class="d">(vendor items only)</span> &nbsp;-&gt;&nbsp; profit ' + SG(6004), 13],
      ['<span class="d">Selling the farmed materials instead would earn 55s 57c. Crafting earns more. Listing deposit 15c (24h, lost if it doesn\'t sell; risk already taken off).</span>', 10.5],
      ['<span class="g">Making 1:</span> buy 1 Frilled Lichen <span class="d">(29s)</span> -&gt; you\'ll spend 28s 97c. Uses yours: 1 Frilled Lichen, 1 Empty Vial.', 10.5],
      ["Selling all 1 brings 60s 6c, so you end up " + SG(3100, true) + ' after what you spend. That\'s ' + SG(300, true) + " compared with selling the materials you used (worth 28s 28c).", 10.5],
      ['<span class="g">Gold per hour:</span> buy the rest (58s) + craft (5s) -&gt; 15g 13s 44c an hour. Sells about 30/hour, 729/day, 5106/week.', 10.5],
      ['<span class="g">In short:</span> You don\'t have the materials. Expected profit ' + SG(3100, true) + '. Your sell-through for it is 100% (8 of 8). <span class="gr">Better than selling the materials (+3s).</span>', 10.5]];
    var ly = y + 128;
    L.forEach(function (l) { h += at(0, ly, l[0], "font-size:" + l[1] + "px;width:" + W + "px;white-space:nowrap;overflow:hidden"); ly += l[1] > 12 ? 18 : 15; });
    return h + "</div>";
  }

  // ---------- Routes (UI/Tabs/RoutesTab.lua) ----------
  function routes() {
    var W = 894, rows = [
      ["gloves", "Buy and disenchant", "Buy Firebane Cloak at Neutral for 24s  &gt;  Disenchant it  &gt;  Sell the materials", 4400, "528g"],
      ["gloves", "Buy and disenchant", "Buy Toughened Leather Gloves at Alliance for 39s  &gt;  Disenchant it  &gt;  Sell the materials", 3800, "461g"],
      ["robe", "Buy and disenchant", "Buy Scholarly Robes at Neutral for 45s  &gt;  Disenchant it  &gt;  Sell the materials", 2300, "276g"],
      ["cloak", "Buy and disenchant", "Buy Hibernal Cloak at Neutral for 76s  &gt;  Disenchant it  &gt;  Sell the materials", 1300, "161g"],
      ["belt", "Buy and disenchant", "Buy Thorium Bracers at Alliance for 93s  &gt;  Disenchant it  &gt;  Sell the materials", 1300, "160g"],
      ["sword", "Buy and disenchant", "Buy Bronze Shortsword at Neutral for 12s  &gt;  Disenchant it  &gt;  Sell the materials", 900, "108g"],
      ["mail", "Craft and disenchant", "Buy the materials  &gt;  Craft Gemmed Copper Boots  &gt;  Disenchant it  &gt;  Sell the materials", 6200, "79.2g"],
      ["essence", "Essence conversion", "Buy 3 Lesser Magic Essence at Neutral  &gt;  Combine them  &gt;  Sell Greater Magic Essence at Alliance", 2100, "-"],
      ["boots", "Buy and disenchant", "Buy Fortified Belt at Neutral for 11s  &gt;  Disenchant it  &gt;  Sell the materials", 400, "47.1g"],
      ["briarthorn", "Vendor flip", "Buy 12 Briarthorn at Neutral for 18c  &gt;  Sell to any vendor for 25c", 84, "-"],
      ["agility", "Craft and sell", "Buy the materials  &gt;  Craft Elixir of Ogre Strength  &gt;  Sell at Neutral", 1000, "5.6g"],
      ["cerulean", "Craft and sell", "Buy the materials  &gt;  Craft Cerulean Dye  &gt;  Sell at Neutral", 1600, "4.5g"],
      ["swiftness", "Craft and sell", "Buy the materials  &gt;  Craft Swiftness Potion  &gt;  Sell at Neutral", 700, "4.4g"],
      ["fireoil", "Craft and sell", "Buy the materials  &gt;  Craft Fire Oil  &gt;  Sell at Neutral", 700, "1.6g"],
      ["coyote", "Craft and sell", "Buy the materials  &gt;  Craft Coyote Steak  &gt;  Sell at Neutral", 800, "1.2g"]];
    var h = at(0, 0, '<span class="g">60 routes</span>') + at(0, 16, '<span class="d">From your last scans. Gold per hour counts crafting, gathering and cast times, not buying and posting; routes without a cast time are ranked by profit.</span>', "font-size:10.5px");
    h += at(W - 230, 0, btn("All routes  &gt;", "", 116) + " " + btn("Work out", "", 106), "display:flex;gap:6px");
    h += '<div id="routes-table">' + at(0, 36, table([["Route", 150, "l"], ["Steps", null, "l"], ["Profit", 70], ["Gold/hour v", 84]],
      rows.map(function (r) { return [ic(r[0]) + r[1], r[2], SG(r[3], true), r[4]]; })), "width:" + W + "px") + "</div>";
    return h;
  }

  // ---------- Market (UI/Tabs/MarketTab.lua) ----------
  var MK = [
    { k: "tin", now: 200, usual: 200, ch: "+7%", day: 2975, listed: 4062, farm: "48s" }, { k: "copper", now: 100, usual: 90, ch: "+11%", day: 7266, listed: 11620, farm: "34s" },
    { k: "egg", now: 28, usual: 28, ch: "0%", day: 3256, listed: 6501, farm: "26s" }, { k: "shadowgem", now: 300, usual: 300, ch: "0%", day: 448, listed: 448, farm: "24s" },
    { k: "silverleaf", now: 20, usual: 18, ch: "+11%", day: 3886, listed: 3886, farm: "19s" }, { k: "earthroot", now: 31, usual: 35, ch: "-11%", day: 2906, listed: 4504, farm: "15s" },
    { k: "boarmeat", now: 30, usual: 30, ch: "0%", day: 4831, listed: 4831, farm: "14s" }, { k: "agate", now: 700, usual: 700, ch: "0%", day: 337, listed: 337, farm: "13s" },
    { k: "murloc", now: 40, usual: 23, ch: "+74%", day: 403, listed: 403, farm: "10s" }, { k: "peacebloom", now: 30, usual: 44, ch: "-32%", day: 5664, listed: 9066, farm: "8s" }
  ];
  function market() {
    var W = 894, h = "";
    h += at(0, 0, search("Find an item...", 140) + btn("All crafting items  v", "", 150) + btn("Alliance  v", "", 100) + chk("Farmable only", true), "display:flex;gap:10px;align-items:center");
    h += at(0, 26, '<span class="d">Farming view: gather it and sell it as is. Rates come only from your own focused gathering (and friends\'), outside dungeons.</span>', "font-size:10.5px");
    h += '<div id="mk-table">' + at(0, 42, table([["Item", null, "l"], ["Price now", 76], ["Usual", 62], ["Change", 62], ["Trend", 56], ["Sells/day", 70], ["Listed", 62], ["Farm/hour v", 78]],
      MK.map(function (m) {
        var c = m.ch.charAt(0) === "+" ? "gr" : m.ch.charAt(0) === "-" ? "rd" : "d";
        return { cls: "k" + (m.k === st.market ? " sel" : ""), data: 'data-item="' + m.k + '"', cells: [it(m.k), M(m.now) + ' <span class="d">A</span>', M(m.usual), '<span class="' + c + '">' + m.ch + "</span>", '<span class="d">-</span>', m.day, m.listed, '<span class="gr">' + m.farm + "</span>"] };
      })), "width:" + W + "px") + "</div>";
    var m = MK.filter(function (x) { return x.k === st.market; })[0];
    h += '<div id="mk-chart">' + at(0, 222, '<span class="g">' + NAME[m.k] + '</span>&nbsp;&nbsp; <span class="d">price per item:</span> <span style="color:#5b8cff">Alliance</span>&nbsp; <span class="g">Neutral</span>&nbsp;&nbsp; <span style="color:#73cc59">bars: sold per day (your houses)</span>');
    h += at(W - 200, 218, btn("Rule: none", "", 96) + " " + btn("Alert...", "", 96), "display:flex;gap:6px");
    h += '<div class="chart" style="left:0;top:244px;width:' + W + 'px;height:300px">' + priceChart(m, W, 300) + "</div>";
    h += at(0, 550, '<span class="sm">Alliance: sells about ' + Math.round(m.day / 24) + '/hour, ' + m.day + '/day, ' + m.day * 7 + '/week&nbsp;&nbsp; Neutral: sells about 36/hour, 875/day, 6125/week (capped at what\'s listed)&nbsp;&nbsp; You gather 28 an hour in Westfall.</span>', "white-space:nowrap") + "</div>";
    return h;
  }
  function seeded(s) { return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function priceChart(m, w, h) {
    var n = 7, rnd = seeded(m.now * 7 + m.day), A = [], N = [], sold = [];
    for (var i = 0; i < n; i++) { A.push(m.usual * (0.75 + rnd() * 0.6)); N.push(i >= 5 ? m.usual * (0.9 + rnd() * 0.5) : null); sold.push(i === 3 ? 0.18 : i === 5 ? 1 : i === 6 ? 0.12 : 0); }
    A[n - 1] = m.now;
    var all = A.concat(N.filter(function (v) { return v !== null; })), max = Math.max.apply(null, all) * 1.05, min = Math.min.apply(null, all) * 0.8;
    var L = 46, R = 50, T = 12, B = 18, s = "";
    var x = function (i) { return L + i * (w - L - R) / (n - 1); }, y = function (v) { return T + (max - v) / (max - min) * (h - T - B); };
    sold.forEach(function (v, i) { if (!v) return; var bh = v * (h - T - B); s += '<rect x="' + (x(i) - 9) + '" y="' + (h - B - bh) + '" width="18" height="' + bh + '" fill="#2f7a2a" opacity="0.9"/>'; });
    s += '<polyline fill="none" stroke="#5b8cff" stroke-width="2" points="' + A.map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>';
    A.forEach(function (v, i) { s += '<rect x="' + (x(i) - 2.5) + '" y="' + (y(v) - 2.5) + '" width="5" height="5" fill="#5b8cff"/>'; });
    s += '<polyline fill="none" stroke="#ffd100" stroke-width="2" points="' + x(5) + "," + y(N[5]) + " " + x(6) + "," + y(N[6]) + '"/>';
    [5, 6].forEach(function (i) { s += '<rect x="' + (x(i) - 2.5) + '" y="' + (y(N[i]) - 2.5) + '" width="5" height="5" fill="#ffd100"/>'; });
    s += '<text x="8" y="' + (T + 8) + '" fill="#fff" font-size="10">' + shortText(max) + '</text><text x="8" y="' + (h - B) + '" fill="#fff" font-size="10">' + shortText(min) + "</text>";
    s += '<text x="' + (w - 8) + '" y="' + (T + 10) + '" fill="#73cc59" font-size="10" text-anchor="end">' + m.day + '</text><text x="' + (w - 8) + '" y="' + (T + 22) + '" fill="#73cc59" font-size="10" text-anchor="end">/day</text>';
    s += '<text x="' + x(0) + '" y="' + (h - 4) + '" fill="#fff" font-size="10" text-anchor="middle">Nov 18</text><text x="' + x(n - 1) + '" y="' + (h - 4) + '" fill="#fff" font-size="10" text-anchor="middle">Nov 24</text>';
    return '<svg viewBox="0 0 ' + w + " " + h + '">' + s + "</svg>";
  }

  // ---------- Materials (UI/Tabs/MaterialsTab.lua) ----------
  function materials() {
    var W = 1096, rows = [
      ["ribs", 2, 1, 200, "Neutral", 400, 800, '<span class="gr">COOK</span> -&gt; Dry Pork Ribs'], ["briarthorn", 6, 2, 9100, "Alliance", 2900, 17000, '<span class="gr">BREW</span> -&gt; Swiftness Potion'],
      ["bruiseweed", 9, 0, 9700, "Alliance", 0, 900, '<span class="gr">SELL (AH)</span>'], ["clam", 8, 0, 2700, "Alliance", 0, 200, '<span class="g">HOLD</span> <span class="d">(price dip)</span>'],
      ["coarsestone", 12, 0, 7400, "Alliance", 0, 900, '<span class="gr">SELL (AH)</span>'], ["copperbar", 1, 0, 100, "Alliance", 0, 100, '<span class="g">SAVE UP</span>'],
      ["copper", 22, 0, 9700, "Alliance", 0, 2100, '<span class="gr">SELL (AH)</span>'], ["coyote", 1, 0, 400, "Alliance", 0, 400, '<span class="g">HOLD</span> <span class="d">(price dip)</span>'],
      ["spidermeat", 1, 0, 5000, "Vendor", 0, 5000, '<span class="gr">SELL (vendor)</span>'], ["earthroot", 7, 1, 7900, "Alliance", 400, 2700, '<span class="gr">BREW</span> -&gt; Elixir of Minor Strength'],
      ["vial", 12, 13, 4900, "Neutral", 2800, 34000, '<span class="gr">BREW</span> -&gt; Swiftness Potion'], ["fireoil", 46, 0, 4000, "Neutral", 0, 1900, '<span class="g">SAVE UP</span>'],
      ["lichen", 1, 1, 2800, "Alliance", 3000, 2800, '<span class="gr">SELL (AH)</span>'], ["gravemoss", 3, 0, 300, "Neutral", 0, 900, '<span class="gr">SELL (AH)</span>'],
      ["healpot", 1, 0, 100, "Alliance", 0, 100, '<span class="g">SAVE UP</span>'], ["milk", 30, 0, 2500, "Alliance", 0, 800, '<span class="gr">SELL (AH)</span>'],
      ["kingsblood", 28, 0, 9900, "Alliance", 0, 2800, '<span class="g">HOLD</span> <span class="d">(price dip)</span>'], ["essence", 3, 0, 200, "Neutral", 0, 500, '<span class="gr">SELL (AH)</span>'],
      ["manapot", 9, 0, 200, "Alliance", 0, 1600, '<span class="gr">SELL (AH)</span>'], ["liferoot", 2, 0, 300, "Neutral", 0, 500, '<span class="g">SAVE UP</span>'],
      ["lighthide", 2, 0, 400, "Alliance", 0, 700, '<span class="gr">SELL (AH)</span>']];
    var h = at(56, 0, search("Find a material...", 172) + chk("Only learned", true) + chk("Beats selling only", true), "display:flex;gap:16px;align-items:center");
    h += at(0, 24, '<span class="g">Crafting materials your characters have</span>') + at(0, 40, '<span class="d">Click a material for everything it makes. Shift-click an item in your bags while typing in the box to jump to it.</span>', "font-size:10.5px");
    h += '<div id="mat-table">' + at(0, 58, table([["Material ^", null, "l"], ["You have", 70], ["Recipes", 60], ["Sell one for", 110], ["Best craft", 80], ["Yours worth", 80], ["Do this", 260, "l"]],
      rows.map(function (r) { return [it(r[0]), '<span class="gr">' + r[1] + "</span>", r[2], M(r[3]) + ' <span class="d">' + r[4] + "</span>", r[5] ? M(r[5]) : '<span class="d">-</span>', MS(r[6]), r[7]]; })), "width:" + W + "px") + "</div>";
    return h;
  }

  // ---------- Shopping (UI/Tabs/ShoppingTab.lua) ----------
  function shopping() {
    var W = 1096, h = "";
    h += '<div id="shop-queue">' + at(0, 2, '<span class="g">Crafting queue</span>&nbsp;&nbsp; <span class="sm">3 crafts of 2 recipes.  Materials ' + MS(15400) + ', sells for ' + MS(41000) + ", profit " + SG(25600, true) + "</span>");
    h += at(W - 300, 0, btn("-1", "", 30) + btn("+1", "", 30) + btn("+5", "", 30) + btn("Remove", "", 84) + btn("Clear all", "", 84), "display:flex;gap:6px");
    h += at(0, 26, table([["Queued recipe ^", null, "l"], ["Profession", 110, "l"], ["How many", 70], ["Who can craft", 170, "l"], ["Cost", 70], ["Profit", 70]],
      [{ cls: "sel", cells: [it("agility"), '<span class="d">Alchemy</span>', 2, "Kaelthar, Mirabel", MS(4400), SG(16000, true)] }, [it("fishbowl"), '<span class="d">Fishing</span>', 1, "Kaelthar", MS(2700), SG(9600, true)]]), "width:" + W + "px") + "</div>";
    h += '<div id="shop-list">' + at(0, 190, '<span class="g">Shopping list</span>&nbsp;&nbsp; <span class="sm">2 of 4 materials still needed. Buying costs about ' + MS(1400) + '.</span>&nbsp; <span class="d sm">About 2 bag slots (46 free). Blue = on your alts.</span>');
    h += at(W - 100, 186, btn("Search AH", "", 100));
    h += at(0, 212, table([["Material", null, "l"], ["Need", 50], ["Have here", 70], ["On alts / friends", 140, "l"], ["To buy v", 70], ["Stacks", 60, "l"], ["Best way", 190, "l"], ["Each", 60], ["Cost", 70]],
      [[it("smallfish"), 1, '<span class="d">0</span>', "-", '<span class="bl">1</span>', "1 of 20", '<span class="g">BUY</span> <span class="d">Alliance AH</span>', M(14), M(14)],
       [it("swiftthistle"), 4, "1", '<span class="bl">Mirabel 2</span>', '<span class="bl">1</span>', "1 of 20", '<span class="gr">GATHER</span> <span class="d">6 min in Elwynn Forest</span>', M(300), M(300)],
       [it("vial"), 2, '<span class="bl">6</span>', '<span class="bl">Mirabel 6</span>', '<span class="gr">done</span>', "-", "-", M(4), "-"],
       [it("peacebloom"), 2, '<span class="bl">8</span>', "-", '<span class="gr">done</span>', "-", "-", M(30), "-"]]), "width:" + W + "px") + "</div>";
    return h;
  }

  // ---------- Budget (UI/Tabs/BudgetTab.lua) ----------
  function budget() {
    var W = 1096, h = "";
    h += at(0, 0, '<span class="g">This character:</span> ' + M(86634) + '&nbsp;&nbsp; <span class="g">All your characters:</span> ' + M(139815) + ' <span class="d sm">&nbsp;(gold on alts isn\'t counted unless you type a bigger amount)</span>');
    h += at(W - 110, -2, btn("Queue this plan", "", 110));
    h += at(0, 22, '<span class="g">Spend up to:</span>&nbsp; <span class="inp box" style="width:76px">8g</span>&nbsp; ' + btn("All my gold", "", 84) + '&nbsp;&nbsp;&nbsp; <span class="h">Always keep:</span> <span class="inp box" style="width:56px"></span>&nbsp;&nbsp; ' + chk("Use my alts' materials", true) + "&nbsp; " + chk("Alts' recipes too", true), "display:flex;align-items:center;gap:4px");
    h += '<div id="budget-sum">' + at(0, 48, 'With 8<img src="' + ART + 'coin_g.webp" style="height:.8em">: 400 crafts of 13 recipes. Spend 2.1g, use 1g of your materials, sell for 26.9g &nbsp;-&gt; profit ' + SG(238000, true) + ' <span class="d">(5.9g left over)</span>') +
      at(0, 64, '<span class="or">Bag space: this plan needs about 60 slots and you have 46 free. Craft and sell in batches, or clear some room.</span>', "font-size:10.5px") + "</div>";
    var rows = [["swiftness", "Alchemy", 45, 1100, 14000, 141000, 126000, "9.3g"], ["lodestone", "Mining", 47, 100, 5400, 91000, 85000, "15.8g"], ["agility", "Alchemy", 35, 2200, 1000, 15000, 11000, "11.7g"],
      ["fishbowl", "Fishing", 37, 0, 900, 7800, 7000, "8g"], ["sharpening", "Blacksmithing", 45, 100, 100, 3600, 3300, "33.3g"], ["snapper", "Cooking", 121, 17, 200, 3400, 3100, "14.4g"],
      ["candle", "Herbalism", 38, 2900, 0, 3500, 600, "free"], ["acid", "Alchemy", 1, 400, 0, 800, 500, "free"], ["ribs", "Cooking", 2, 500, 0, 800, 300, "free"],
      ["manawell", "Alchemy", 5, 200, 18, 400, 200, "9.8g"], ["smelt", "Mining", 22, 2100, 0, 2300, 200, "free"], ["chair", "Skinning", 1, 200, 0, 300, 100, "free"], ["rage", "Alchemy", 1, 200, 0, 200, 48, "free"]];
    h += '<div id="budget-table">' + at(0, 84, table([["Craft", null, "l"], ["Profession", 130, "l"], ["How many", 70], ["Uses yours", 80], ["Gold to spend", 96], ["Sells for", 80], ["Profit v", 80], ["Per 1g spent", 90]],
      rows.map(function (r) { return [it(r[0]), '<span class="d">' + r[1] + "</span>", r[2], MS(r[3]), r[4] ? MS(r[4]) : '<span class="gr">nothing</span>', MS(r[5]), SG(r[6], true), r[7] === "free" ? '<span class="gr">free</span>' : r[7]]; })), "width:" + W + "px") + "</div>";
    return h;
  }

  // ---------- Bags (UI/Tabs/BagsTab.lua, Auction view) ----------
  function bagGroup(x, y, tag, title, val, sub, slots) {
    return '<div class="bgrp" style="left:' + x + "px;top:" + y + 'px"><div class="t">[' + tag + "]<b>" + title + "</b><span>" + val + "</span>&nbsp;&nbsp; " + (sub || "") + '</div><div class="slots">' +
      slots.map(function (s) { return '<div class="slot"><div class="ico">' + ic(s[0]) + (s[1] > 1 ? '<span class="q">' + s[1] + "</span>" : "") + '<span class="bd ' + tag + '">' + tag + '</span></div><div>' + MS(s[2]) + "</div></div>"; }).join("") + "</div></div>";
  }
  function bags() {
    var W = 1096, h = at(0, 0, btn("Auction view", "on", 96) + btn("Category view", "", 96) + search("Search: name, sell, hold...", 124), "display:flex;gap:6px;align-items:center");
    h += at(W - 230, 0, '<span class="h">Worth</span> ' + M(17462) + "&nbsp;&nbsp; " + btn("Open bags", "", 84), "display:flex;align-items:center;gap:6px");
    h += '<div id="bags-view">';
    h += bagGroup(0, 30, "PLAN", "Shopping for", MS(300), "", [["vial", 6, 300]]);
    h += bagGroup(150, 30, "SELL", "Sell now", "1.2g", "worth posting", [["kingsblood", 1, 6100], ["agate", 1, 2800], ["manapot", 9, 1600], ["shadowgem", 1, 1000], ["linen", 4, 500], ["milk", 5, 100], ["lighthide", 3, 100]]);
    h += bagGroup(480, 30, "HOLD", "Hold", MS(1900), "the price is in a dip", [["briarthorn", 15, 900], ["clam", 1, 400], ["copper", 12, 300], ["coyote", 1, 100], ["essence", 5, 95], ["milk", 1, 71]]);
    h += bagGroup(0, 130, "CRAFT", "Craft into", MS(1300), "", [["earthroot", 19, 600], ["peacebloom", 6, 500], ["coyote", 1, 200]]);
    h += bagGroup(150, 130, "KEEP", "Keep", MS(1700), "yours to use", [["fireoil", 1, 1700], ["hearthstone", 1, 0], ["feather", 7, 0], ["silk", 1, 0]]).replace(/bd KEEP">KEEP/g, 'bd">');
    h += bagGroup(520, 130, "VEND", "Vendor", MS(100), "", [["spidermeat", 1, 50], ["ribs", 1, 33], ["healpot", 1, 25], ["boarmeat", 2, 12]]);
    return h + "</div>";
  }

  // ---------- Ledger (UI/Tabs/LedgerTab.lua) ----------
  function ledger() {
    var W = 1096, h = '<div id="ledger-top">';
    h += at(0, 0, '<span class="g">Last 7 days:</span> AH: sold 224 for 24.3' + COIN.g + ", bought 10 for 2.4" + COIN.g + ", 13 expired. Vendor: sold 3.4" + COIN.g + ", bought 4" + COIN.s + " &nbsp;-&gt; net " + SG(254000, true));
    h += at(0, 17, '<span class="g">Last 30 days:</span> AH: sold 224 for 24.3' + COIN.g + ", bought 10 for 2.4" + COIN.g + ", 13 expired. Vendor: sold 3.4" + COIN.g + ", bought 4" + COIN.s + " &nbsp;-&gt; net " + SG(254000, true));
    h += at(0, 34, '<span class="g">This week:</span> you earned 14g 29s 5c per money-making hour <span class="d">(7.7 h: gathering 0.2, crafting 0.0, trading 7.4; dungeons, questing and AFK don\'t count)</span>', "font-size:10.5px");
    h += at(0, 49, 'Gold on all characters: 67g 5s 12c&nbsp;&nbsp; <span class="d">Kaelthar 42.2g, Mirabel 24.8g, Bankalt 8s&nbsp;&nbsp; Last AI export: 2d ago</span>', "font-size:10.5px");
    h += at(0, 64, '<span class="g">Your markets (30 days, share of auctions sold):</span> Herbs 96% <span class="d">(75)</span>, Leather 100% <span class="d">(18)</span>, Fish &amp; meat 92% <span class="d">(50)</span>', "font-size:10.5px");
    h += at(W - 124, 0, btn("Show recent", "", 124)) + "</div>";
    var rows = [["cerulean", 8, "-", 0, "100%", 83000, 0], ["briarthorn", 13, "-", 1, "93%", 15000, 0], ["bruiseweed", 15, "-", 1, "94%", 14000, 0], ["lighthide", 8, "-", 0, "100%", 10000, 0],
      ["agility", 3, "-", 0, "100%", 9800, 0], ["earthroot", 12, "-", 0, "100%", 7800, 0], ["blackmouth", 8, "-", 2, "80%", 7600, 0], ["silverleaf", 11, "-", 0, "100%", 9900, 2900],
      ["murloc", 4, "-", 0, "100%", 5800, 60], ["mageroyal", 12, "-", 1, "92%", 5700, 0], ["silverbar", 4, "-", 0, "100%", 5500, 0], ["coyote", 4, "-", 0, "100%", 5300, 0],
      ["vulture", 7, "-", 0, "100%", 5200, 67], ["swiftthistle", 2, "-", 0, "100%", 4900, 0], ["silk", 2, "-", 0, "100%", 4100, 0], ["ribs", 4, "-", 0, "100%", 4100, 0],
      ["swiftness", 2, "-", 0, "100%", 3800, 0], ["wool", 5, "-", 0, "100%", 3800, 0], ["egg", 9, 3, 0, "100%", 2900, 0]];
    h += '<div id="ledger-table">' + at(0, 86, table([["Item", null, "l"], ["Sold", 50], ["Vendored", 76], ["Expired", 60], ["Sells", 60], ["Income", 80], ["Spent", 80], ["Net v", 90]],
      rows.map(function (r) { return [NAME[r[0]], r[1], r[2], r[3] ? '<span class="g">' + r[3] + "</span>" : 0, r[4], MS(r[5]), r[6] ? MS(r[6]) : "-", SG(r[5] - r[6], true)]; })), "width:" + W + "px") + "</div>";
    return h;
  }

  // ---------- Friends (UI/Tabs/FriendsTab.lua) ----------
  function friends() {
    var W = 1096, h = at(0, 0, "Add a friend by character name (same faction) or BattleTag like Name#1234 (any faction, Battle.net friends). You both need each other on this list. Each house's newer scan wins; recipes, loot sources and disenchant results are added to yours.", "font-size:11px;width:" + W + "px;white-space:normal");
    h += at(0, 34, '<span class="inp box" style="width:200px;color:#808080">Name or BattleTag#1234</span>&nbsp; ' + btn("Add", "", 70) + " " + btn("Remove", "", 80) + " " + btn("Sync", "", 90) + " " + btn("Sync all", "", 90) + "&nbsp;&nbsp; " + chk("Sync when I log in", true) + "&nbsp; " + chk("Share my materials", false), "display:flex;align-items:center;gap:4px");
    h += at(0, 64, table([["Friend", 170, "l"], ["Through", 80, "l"], ["Status", null, "l"], ["Their crafters", 200, "l"], ["Last data", 90]],
      [{ cls: "sel", cells: ['<span class="bl">Tovrin#1795</span>', "Battle.net", '<span class="gr">synced: Horde scan 3 hr ago, 41 recipes</span>', "Tovrin (Tailoring, Enchanting)", "3 hr ago"] },
       ["Mirelle", "Guild", '<span class="d">not synced this session</span>', "Mirelle (Leatherworking)", "2 days ago"]]), "width:" + W + "px");
    h += at(0, 120, heading("Export / import (backup when syncing doesn't work)"), "width:" + W + "px") + at(0, 148, btn("Export", "", 90) + " " + btn("Import", "", 90), "display:flex;gap:6px");
    return h;
  }

  // ---------- separate windows ----------
  function auctionsWindow() {
    return '<div class="ft">My auctions</div>' + btn("✕", "x") + at(12, 30, '<span class="d sm">Alliance auction house: 3 auctions worth 3.4g, 1 undercut.&nbsp;&nbsp; * from your last scan</span>') +
      at(12, 50, table([["Item", null, "l"], ["Count", 54], ["Yours each", 86], ["Cheapest other", 100], ["Status ^", 100], ["Repost at", 80], ["Time left", 70]],
        [{ cls: "sel", cells: [it("flamesac"), 1, M(600), M(590) + " *", '<span class="rd">UNDERCUT</span>', M(589), "1h"] },
         [it("agility"), 20, M(600), M(610), '<span class="gr">cheapest</span>', "-", "12h"], [it("magenta"), 20, M(2500), M(2600), '<span class="gr">cheapest</span>', "-", "12h"]]), "width:806px") +
      at(12, 262, btn("Check prices", "", 140) + btn("Cancel selected", "", 162) + btn("Post at repost price", "", 186), "display:flex;gap:10px") + at(706, 262, btn("Refresh", "", 104));
  }
  function bagWindow() {
    var fill = [["ribs", 4, "CRAFT"], ["coarsestone", 1], ["linen", 2, "CRAFT"], ["healpot", 4, "VEND"], ["manapot", 1, "VEND"], ["agate", 1, "HOLD"], ["milk", 1, "HOLD"], ["boarmeat", 8, "PLAN"], ["coyote", 7, "SELL"], ["fireoil", 1, "VEND"],
      ["kingsblood", 1, "SELL"], ["egg", 8], ["copperbar", 4, "SELL"], ["snapper", 1, "HOLD"], ["vial", 5], ["silverbar", 1, "SELL"], ["sword", 1], ["mail", 1], ["essence", 1, "HOLD"], ["swiftthistle", 1, "SELL"],
      ["spidermeat", 1, "VEND"], ["lichen", 1], ["hearthstone", 1]], h = '<div class="ab" style="left:12px;top:10px">' + ic("neutral").replace('class="wi"', 'class="wi" style="width:34px;height:34px;border-radius:50%"') + "</div>";
    h += '<div class="ab lg" style="left:54px;top:8px;color:#fff">Bags</div><div class="ab g sm" style="left:54px;top:28px">23 of 62 slots used</div>' + btn("✕", "x");
    h += at(10, 56, search("Search: name, sell...", 126)) + at(426, 54, btn("Bags", "on", 64) + btn("Sections", "", 86), "display:flex;gap:6px");
    h += '<div class="ab bagslots" style="left:12px;top:92px">';
    for (var i = 0; i < 30; i++) {
      var f = fill[i];
      h += '<div class="slot"><div class="ico">' + (f ? ic(f[0]) + (f[1] > 1 ? '<span class="q">' + f[1] + "</span>" : "") + (f[2] ? '<span class="bd ' + f[2] + '">' + f[2] + "</span>" : "") : '<i class="wi" style="--a:#2a2118;--b:#120d08"></i>') + "</div></div>";
    }
    h += "</div>" + at(14, 270, '<span class="g">Free</span> 39 / 62&nbsp;&nbsp;&nbsp;&nbsp; ' + M(17462)) + at(420, 266, btn("Clean up", "", 106));
    return h;
  }
  function tooltip() {
    return '<div class="lg" style="color:#fff">Swiftthistle</div><div>Common</div><div class="bl">Crafting Reagent</div><div>Sell Price: 75c</div><br>' +
      '<div class="r"><span class="g">Stacks to 20</span><span class="d">full stack: auction 59s 80c, vendor 15s 0c</span></div>' +
      '<div class="r"><span class="g">Alliance AH</span><span>2s 99c <span class="d">(2,184 listed, 12m ago)</span></span></div>' +
      '<div class="r ind"><span>Sells</span><span>about 54/hour, 1294/day, 9060/week</span></div><div class="r ind"><span>Usual price (6 days)</span><span>2s 88c</span></div>' +
      '<div class="r"><span class="g">Neutral AH</span><span>4s 0c <span class="d">(939 listed, 1h ago)</span></span></div>' +
      '<div class="r"><span class="g">Your auctions</span><span>2 sold, 0 expired</span></div><div class="r"><span class="g">Vendor pays</span><span>15c</span></div>' +
      '<div class="r"><span class="g">Best use:</span><span><span class="gr">Elixir of Minor Agility</span> -&gt; 5s per Swiftthistle <span class="d">(selling: 4s)</span></span></div>' +
      '<div class="g">Used to make <span class="d">(profit per craft, buying the materials):</span></div>' +
      '<div class="r ind"><span class="h">Elixir of Minor Agility <span class="d">(needs 1)</span></span><span class="gr">+2s</span></div>' +
      '<div class="r ind"><span class="h">Swiftness Potion <span class="d">(needs 1)</span></span><span class="gr">+1s</span></div>' +
      '<div class="r ind"><span class="h">Swim Speed Potion <span class="d">(needs 1)</span></span><span class="rd">-4s</span></div>' +
      '<div class="g">Gathered in:</div><div class="r ind"><span class="h">Redridge Mountains</span><span>4 looted</span></div>' +
      '<div class="g">Total: 7</div><div class="r ind"><span class="bl">Kaelthar</span><span class="bl">5</span></div><div class="r ind"><span>Mirabel</span><span>(bank) 2</span></div>';
  }

  // ---------- render ----------
  var PAGES = { home: home, professions: professions, recipes: recipes, routes: routes, market: market, materials: materials, shopping: shopping, budget: budget, bags: bags, ledger: ledger, friends: friends };
  var SECTION_OF = { recipes: "professions", routes: "professions" };
  function render() {
    st.sec = SECTION_OF[st.page] || st.page;
    $("#w-tabs").innerHTML = SECTIONS.map(function (s) { return '<div class="w-tab' + (s.key === st.sec ? " on" : "") + '" data-go="' + s.key + '">' + ic(s.key) + s.title + "</div>"; }).join("");
    var sd = side(), sec = SECTIONS.filter(function (s) { return s.key === st.sec; })[0];
    $("#w-side").style.display = sd ? "" : "none";
    if (sd) $("#w-side").innerHTML = '<img class="em" src="' + ART + sec.em + '.webp" alt=""><div class="tt">' + sec.title + '</div><div class="list">' + sd + "</div>";
    var main = $("#w-main");
    main.className = "w-main" + (sd ? " side" : "");
    main.innerHTML = PAGES[st.page]();
    $("#w-foot").innerHTML = footer();
    highlight();
  }

  // ---------- the tour ----------
  var STEPS = [
    { page: "home", el: "#home-tiles", title: "Home: your day at a glance",
      text: "Type /gcf or click the minimap button. Home compares today with yesterday and your average day, per hour, so a short session isn't judged against a long one. Week's best lists your top sellers, what your account is worth and the best recipe right now.",
      best: "Glance here when you log in. Gold per money-making hour (gathering, crafting and trading only) tells you whether what you're doing is paying off." },
    { page: "home", el: "#side-scans", title: "Scan the auction houses",
      text: "Open an auction house and it scans by itself. The game allows one full scan every 15 minutes for your whole account, so the side menu shows each house's last scan and when the next one is possible. Ages are coloured: white fresh, yellow a few hours, orange old, red never.",
      best: "Scan your own faction's house every session, and the Neutral house (Gadgetzan, Booty Bay, Everlook) when you pass. Friends' scans fill in the rest." },
    { page: "home", el: "#home-plan", title: "Follow today's plan",
      text: "One checklist in the order you'd do it: at the auction house, crafting, then back at the auction house. It never spends more than your gold, aims for 20% of a day's sales so you don't flood the market, and shows the expected profit.",
      best: "Work top to bottom. Steps tick themselves off from your bags and scans. Search and Post fill the game's panels; you always press the game's own button." },
    { page: "market", el: "#mk-chart", title: "Market: what actually sells",
      text: "Every crafting item you've scanned: price now, usual price, change, sells per day and how many are listed. Click any row (try it) for its chart: price per item at each house and green bars for how many sold each day.",
      best: "Sort by Sells/day before you craft anything. A big margin on something nobody buys isn't profit." },
    { page: "market", el: "#tipw", tip: true, title: "Tooltips: all three houses on every item",
      text: "Hover any item in the game and the tooltip shows the cheapest price at each house, how many sell a day, your own sales, what a vendor pays, its best use, what it's used to make and which of your characters has it.",
      best: "Hold Shift for the full version. Each section can be turned off in Settings › Tooltips." },
    { page: "professions", el: "#ranked", title: "Which profession earns the most?",
      text: "New in 0.26.2: Rank them works out realistic gold a day for every crafting profession, whether you have it or not. Only items that have been listed and sold count: profit buying every material, times what you could sell at your 20% share of a day's sales. Gathering shows gold an hour from your own measured gathering.",
      best: "Use it when choosing or swapping a profession. A low \"priced\" count means it needs more scans before you trust its rank." },
    { page: "recipes", el: "#rc-detail", title: "Recipes: cost, profit and gold per hour",
      text: "Every recipe of the profession with what it costs to buy or farm, what it sells for and where, profit both ways, sales per day and gold per hour. Pick one (click another row to try it) for its materials at every house and an \"In short\" verdict.",
      best: "Tick \"I have materials\" to see what you can make right now. Right-click a recipe to queue it." },
    { page: "routes", el: "#routes-table", title: "Routes: chains that make gold",
      text: "The best chains of steps from your latest scans: buy gear and disenchant it, craft and disenchant, essence conversions, vendor flips and craft and sell, ranked by gold per hour where the time is known.",
      best: "Press Work out after a fresh scan. Buy-and-disenchant routes need an enchanter on your account." },
    { page: "materials", el: "#mat-table", title: "Materials: what to do with what you have",
      text: "Every crafting material on all your characters, with a verdict: craft it into something (COOK, BREW, SEW...), SELL (AH or vendor), HOLD while the price is in a dip, SAVE UP for a stack worth the deposit, or KEEP.",
      best: "Check it after a farming trip, before you post anything." },
    { page: "budget", el: "#budget-sum", title: "Budget: \"I have 8g. What should I craft?\"",
      text: "Type an amount and press Calculate for the most profitable crafting plan you can afford. It uses your own materials first, walks the real listings for what it buys, never plans to sell more than about a day of real sales, and warns when you'd run out of bag space.",
      best: "Queue this plan sends it to Shopping in one click." },
    { page: "shopping", el: "#shop-list", title: "Shopping: one list for your queue",
      text: "Queue recipes and get one shopping list: what you need, what's in your bags, what's on your alts (blue), and for each material whether to BUY (and where) or GATHER (and how long it takes you).",
      best: "At the auction house, Shopping run steps through the list one item at a time." },
    { page: "shopping", el: "#aucw", win: "aucw", title: "My auctions: undercuts and reposts",
      text: "A My auctions button sits by the auction house. Check prices looks up each of your items live and marks anything UNDERCUT, with a repost price 1 copper under the cheapest other seller, never under what yours cost or what a vendor pays.",
      best: "Press Check prices each visit and repost only what's undercut. Posting always ends with the game's own Post button." },
    { page: "bags", el: "#bags-view", title: "Bags that know what things are worth",
      text: "Auction view sorts everything by what to do with it: Shopping for, Sell now, Hold, Craft into, Keep and Vendor, with the value of each group. Badges show on GoldCraftForever's bag window, the game's bags, Bagnon, Baganator and BagSmith.",
      best: "Open it on the way to the auction house: everything under Sell now goes up first." },
    { page: "bags", el: "#bagw", win: "bagw", title: "The bag window",
      text: "GoldCraftForever's own bag window (B, the bag bar, vendors, mail and the bank open it) keeps every slot in its real place, Bagnon-style, with SELL, HOLD, CRAFT, PLAN and VEND badges. Sections groups them instead, and Clean up sorts your bags.",
      best: "Using another bag addon? GoldCraftForever leaves your bags alone and just adds its badges." },
    { page: "ledger", el: "#ledger-top", title: "Ledger: what actually sold",
      text: "Auction mail is read when you open the mailbox, so the ledger knows what sold, what expired, your income and net per item, gold on every character and which markets you sell best in.",
      best: "Open your mailbox after sales, even if you don't take the mail. That's what makes sales rates and gold per hour accurate." },
    { page: null, title: "Now look around",
      text: "Click any tab, any item in Market or any recipe in Professions. Everything here is sample data; in the game it's all your own scans and play.",
      best: "Ready? Install it from CurseForge, type /gcf, and open an auction house." }
  ];
  var step = 0;
  // the highlight is a frame of its own over the window, around everything in the group: many groups
  // are wrappers whose pieces are positioned one by one, so the wrapper itself has no size
  function frameAround(el) {
    var box = $("#tour-box"), scaler = $("#demo-scaler"), win = $("#gcf-win");
    if (!el) { box.style.display = "none"; return; }
    var k = scaler.getBoundingClientRect().width / 1120 || 1, base = scaler.getBoundingClientRect();
    var r = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
    [el].concat(Array.prototype.slice.call(el.querySelectorAll("*"))).forEach(function (n) {
      var b = n.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      r.l = Math.min(r.l, b.left); r.t = Math.min(r.t, b.top); r.r = Math.max(r.r, b.right); r.b = Math.max(r.b, b.bottom);
    });
    if (r.l === Infinity) { box.style.display = "none"; return; }
    // keep it inside the window (or the separate window it belongs to), with a little air
    var w = (el.closest(".fw, .tipw") || win).getBoundingClientRect(), pad = 4 * k;
    var L = Math.max(r.l - pad, w.left + 2 * k), T = Math.max(r.t - pad, w.top + 2 * k), R = Math.min(r.r + pad, w.right - 2 * k), B = Math.min(r.b + pad, w.bottom - 2 * k);
    box.style.display = "block";
    box.style.left = (L - base.left) / k + "px"; box.style.top = (T - base.top) / k + "px";
    box.style.width = (R - L) / k + "px"; box.style.height = (B - T) / k + "px";
  }
  function highlight() {
    var s = STEPS[step];
    $("#aucw").classList.toggle("show", !!(s && s.win === "aucw" && st.page === s.page));
    $("#bagw").classList.toggle("show", !!(s && s.win === "bagw" && st.page === s.page));
    $("#tipw").classList.toggle("show", !!(s && s.tip && st.page === s.page));
    frameAround(s && s.el && s.page === st.page ? $(s.el) : null);
  }
  function go(i) {
    step = Math.max(0, Math.min(STEPS.length - 1, i));
    var s = STEPS[step];
    if (s.page) st.page = s.page;
    render();
    $("#tour-step").textContent = "Step " + (step + 1) + " of " + STEPS.length;
    $("#tour-title").textContent = s.title;
    $("#tour-text").textContent = s.text;
    $("#tour-best").innerHTML = "<b>Best way to use it:</b> " + s.best;
    $("#tour-prev").disabled = step === 0;
    $("#tour-next").textContent = step === STEPS.length - 1 ? "Start over" : "Next";
    document.querySelectorAll("#tour-dots button").forEach(function (b, k) { b.classList.toggle("on", k === step); });
  }

  $("#gcf-win").addEventListener("click", function (e) {
    var t = e.target.closest("[data-go],[data-item],[data-recipe]");
    if (!t) return;
    var g = t.dataset.go;
    if (g) {
      var p = g.split(":");
      if (p[0] === "home" && p[1]) { st.page = "home"; st.homeMode = p[1]; }
      else if (p[0] === "recipes") { st.page = "recipes"; if (p[1]) st.prof = p[1]; }
      else if (p[0] === "mview") { st.page = "market"; st.marketView = p[1]; }
      else st.page = p[0];
    }
    if (t.dataset.item) st.market = t.dataset.item;
    if (t.dataset.recipe) st.recipe = +t.dataset.recipe;
    render();
  });
  ["#aucw", "#bagw"].forEach(function (id) { $(id).addEventListener("click", function (e) { if (e.target.closest(".b.x")) this.classList.remove("show"); }); });
  $("#tour-next").addEventListener("click", function () { go(step === STEPS.length - 1 ? 0 : step + 1); });
  $("#tour-prev").addEventListener("click", function () { go(step - 1); });
  $("#tour-dots").innerHTML = STEPS.map(function (_, i) { return '<button type="button" aria-label="Step ' + (i + 1) + '"></button>'; }).join("");
  $("#tour-dots").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) go(Array.prototype.indexOf.call(this.children, b)); });

  $("#aucw").innerHTML = auctionsWindow();
  $("#bagw").innerHTML = bagWindow();
  $("#tipw").innerHTML = tooltip();

  function fit() {
    var stage = $("#demo-stage"), k = Math.min(1, stage.clientWidth / 1120);
    $("#demo-scaler").style.transform = "scale(" + k + ")";
    stage.style.height = 760 * k + "px";
  }
  window.addEventListener("resize", function () { fit(); highlight(); });
  fit();
  go(0);
})();
