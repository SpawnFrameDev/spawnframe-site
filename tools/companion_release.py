"""Put a new GoldCraft Companion build on the website (run by the companion repo's release workflow).

    python tools/companion_release.py 0.2.1 path/to/GoldCraftCompanion-0.2.1.zip [whats-new.txt]

Copies the zip to goldcraft/download/ (removing older builds; git history keeps them), and updates
the GoldCraft page's download link, version, size and SHA-256, and goldcraft/companion.json, which
the Companion reads to offer updates (min_version there is kept: raise it by hand when old versions
must stop syncing). Then run tools/stamp.py.
"""
import hashlib, json, re, shutil, sys, time
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
version, src = sys.argv[1], Path(sys.argv[2])
if not re.fullmatch(r"\d+\.\d+\.\d+", version):
    sys.exit(f"bad version: {version}")
dl = SITE / "goldcraft" / "download"
dl.mkdir(parents=True, exist_ok=True)
name = f"GoldCraftCompanion-{version}.zip"
for old in dl.glob("GoldCraftCompanion-*.zip"):
    if old.name != name:
        old.unlink()
shutil.copyfile(src, dl / name)
data = (dl / name).read_bytes()
sha, mb = hashlib.sha256(data).hexdigest(), f"{len(data) / 1_000_000:.1f} MB"

page = SITE / "goldcraft" / "index.html"
s = page.read_text(encoding="utf-8")
n = 0
for pat, rep in [
    (r"/goldcraft/download/GoldCraftCompanion-[\d.]+\.zip", f"/goldcraft/download/{name}"),
    (r"Download the Companion [\d.]+ for Windows", f"Download the Companion {version} for Windows"),
    (r'(<p class="dl-note">)[\d.]+ MB', rf"\g<1>{mb}"),
    (r"(SHA-256 <code>)[0-9a-f]{64}(</code>)", rf"\g<1>{sha}\g<2>"),
]:
    s, k = re.subn(pat, rep, s)
    if not k:
        sys.exit(f"pattern not found on the page: {pat}")
    n += k
page.write_text(s, encoding="utf-8")

# the Companion card on the home page
home = SITE / "index.html"
h = home.read_text(encoding="utf-8")
for pat, rep in [
    (r"/goldcraft/download/GoldCraftCompanion-[\d.]+\.zip", f"/goldcraft/download/{name}"),
    (r'<span class="meta">v[\d.]+ · Windows · free</span>', f'<span class="meta">v{version} · Windows · free</span>'),
]:
    h, k = re.subn(pat, rep, h)
    if not k:
        sys.exit(f"pattern not found on the home page: {pat}")
    n += k
home.write_text(h, encoding="utf-8")
# what the Companion checks for updates
info_path = SITE / "goldcraft" / "companion.json"
try:
    old = json.loads(info_path.read_text(encoding="utf-8"))
except (OSError, ValueError):
    old = {}
notes = []
if len(sys.argv) > 3 and Path(sys.argv[3]).is_file():
    notes = [l.strip().lstrip("-* ").strip() for l in Path(sys.argv[3]).read_text(encoding="utf-8").splitlines() if l.strip()]
info = {
    "version": version,
    "url": f"https://spawnframe.dev/goldcraft/download/{name}",
    "sha256": sha,
    "bytes": len(data),
    "released": old.get("released") if old.get("version") == version else time.strftime("%Y-%m-%d"),
    "min_version": old.get("min_version", "0.0.0"),
    "notes": notes or (old.get("notes", []) if old.get("version") == version else []),
}
info_path.write_text(json.dumps(info, indent=2) + "\n", encoding="utf-8")
print(f"{name}: {mb}, sha256 {sha[:16]}..., {n} page edits")
