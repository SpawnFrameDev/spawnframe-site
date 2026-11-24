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
