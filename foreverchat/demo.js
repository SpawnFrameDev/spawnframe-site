// ForeverChat page demo: a chat window with ForeverChat's tabs and sample lines.
// Click a tab to see what lands there and where you'd talk (like the addon's tab click).
(function () {
  var TABS = [
    { name: "General", say: ["c-say", "Say:"], fixed: false, lines: [
      ["c-trade", "[2. Trade] [Ginevera]: LF enchanter, Minor Agility on bracers, tipping 2g"],
      ["c-say", "[Thrall]: Anyone know where the Defias Pillager spawns?"],
      ["c-yell", "[Grimbeard] yells: LFG Deadmines, need tank!"],
      ["c-say", "[Aeris]: West of the farm, by the tower."] ] },
    { name: "Combat Log", fixed: true, lines: [] },
    { name: "Group", say: ["c-party", "Party:"], lines: [
      ["c-party", "[Party] [Aeris]: Pulling in 3"],
      ["c-party", "[Party Leader] [You]: Wait for mana please"],
      ["c-raid", "[Raid Warning] [Kel]: Stack on the tank for this one"] ] },
    { name: "Guild", say: ["c-guild", "Guild:"], lines: [
      ["c-guild", "[Guild] [Mira]: Grats on the Mooncloth!"],
      ["c-guild", "[Officer] [Dax]: Guild bank run tonight at 8"] ] },
    { name: "Friends", say: ["c-whisper", "Tell Aeris:"], lines: [
      ["c-whisper", "[Aeris] whispers: you still need Copper Ore?"],
      ["c-whisper", "To [Aeris]: yes! 40 if you have it"],
      ["c-bn", "[Sam]: logging in after dinner"] ] },
    { name: "Loot", say: ["c-say", "Say:"], lines: [
      ["c-loot", "You receive loot: <span class='c-item'>[Small Egg]</span>."],
      ["c-money", "You loot 34 Copper"],
      ["c-sys", "A buyer has been found for your auction of <span class='c-item'>[Linen Cloth]</span>."],
      ["c-white", "Vendor: <span class='c-item'>+1g 20s</span>"] ] },
    { name: "Professions", say: ["c-say", "Say:"], lines: [
      ["c-white", "You create: <span class='c-white'>Bolt of Linen Cloth</span>."],
      ["c-skill", "Your skill in Tailoring has increased to 76."],
      ["c-loot", "You receive loot: <span class='c-white'>[Raw Brilliant Smallfish]</span>."],
      ["c-white", "Raiilla Silverine creates Bolt of Linen Cloth."] ] },
    { name: "System", say: ["c-say", "Say:"], lines: [
      ["c-sys", "Aeris has come online."],
      ["c-sys", "You have earned the achievement [Level 20]!"],
      ["c-sys", "Reputation with Stormwind increased by 25."],
      ["c-white", "GoldCraftForever: Scan done, 6,204 items."] ] }
  ];

  function start() {
    var demo = document.getElementById("demo");
    if (!demo) return;
    var bar = demo.querySelector(".fc-tabs"), box = demo.querySelector(".fc-lines"), say = demo.querySelector(".fc-say");
    var buttons = [];

    function show(i) {
      var tab = TABS[i];
      buttons.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; });
      box.innerHTML = tab.lines.length
        ? tab.lines.map(function (l) { return "<div class='" + l[0] + "'>" + l[1] + "</div>"; }).join("")
        : "<div class='empty'>Combat Log is left alone.</div>";
      if (tab.say) { say.className = "fc-say " + tab.say[0]; say.textContent = tab.say[1]; }
    }

    TABS.forEach(function (tab, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "fc-tab" + (tab.fixed ? " fixed" : ""); b.textContent = tab.name;
      b.setAttribute("role", "tab");
      b.addEventListener("click", function () { show(i); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        var n = (i + d + TABS.length) % TABS.length; show(n); buttons[n].focus(); e.preventDefault();
      });
      bar.appendChild(b); buttons.push(b);
    });
    show(0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
