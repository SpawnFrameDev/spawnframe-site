"""Put a new GoldCraft Companion build on the website (run by the companion repo's release workflow).

    python tools/companion_release.py 0.2.1 path/to/GoldCraftCompanion-0.2.1.zip

Copies the zip to goldcraft/download/ (removing older builds; git history keeps them), and updates
the GoldCraft page's download link, version, size and SHA-256. Then run tools/stamp.py.
"""
import hashlib, re, shutil, sys
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
print(f"{name}: {mb}, sha256 {sha[:16]}..., {n} page edits")
