"""Version-stamp the site's own CSS, JS and SVG links (?v=<hash of the file>) in every HTML page.
Cloudflare lets browsers keep these files for hours; a new stamp makes them fetch the new copy.
Run before every commit:  python3 tools/stamp.py"""
import hashlib, pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
def stamp(m):
    attr, path = m.group(1), m.group(2)
    f = root / path.lstrip("/")
    if not f.is_file():
        return m.group(0)
    h = hashlib.md5(f.read_bytes()).hexdigest()[:8]
    return f'{attr}="{path}?v={h}"'
pat = re.compile(r'(href|src)="(/[^"?#]+\.(?:css|js|svg))(?:\?v=[0-9a-f]+)?"')
for page in root.rglob("*.html"):
    text = page.read_text(encoding="utf-8")
    new = pat.sub(stamp, text)
    if new != text:
        page.write_text(new, encoding="utf-8")
        print("stamped", page.relative_to(root))

# the market pages are built by a function: keep its stylesheet versions in step too
fn = root / "functions/goldcraft/market/[[path]].js"
if fn.is_file():
    text = fn.read_text(encoding="utf-8")
    h = lambda f: hashlib.md5((root / f).read_bytes()).hexdigest()[:8]
    new = re.sub(r'const CSS_V = "[0-9a-f]+"', f'const CSS_V = "{h("goldcraft/market.css")}"', text)
    new = re.sub(r'/goldcraft/goldcraft\.css\?v=[0-9a-f]+', f'/goldcraft/goldcraft.css?v={h("goldcraft/goldcraft.css")}', new)
    if new != text:
        fn.write_text(new, encoding="utf-8")
        print("stamped", fn.relative_to(root))
