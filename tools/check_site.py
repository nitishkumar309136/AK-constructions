"""Pre-push site check: run `python tools/check_site.py` from the project folder.

Catches the problems that hurt SEO or break the site: broken links, canonical/sitemap
mismatches, FAQ schema drift, heading skips, long titles, missing alt text, inline
styles, wrong WhatsApp/phone/GST details and mixed CSS/JS versions.
Exit code 1 when an error is found.
"""
import collections, glob, html, json, os, re, sys
from urllib.parse import unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
D = "https://akconstructionandhomedesign.com"
WA_MSG = "hello sir, aapke pas kab time hai mujhe ghar banwane ke baare me aapse baat krni thi"
GST, PHONE2 = "10FDFPK4008F1Z6", "+91 70494 09269"

pages = sorted(p.replace(os.sep, "/") for p in glob.glob("*.html") + glob.glob("hi/*.html"))
sitemap = open("sitemap.xml", encoding="utf-8").read()
redirects = open("_redirects", encoding="utf-8").read()
errors, warnings = [], []
versions = collections.Counter()


def err(p, m): errors.append(f"{p}: {m}")
def warn(p, m): warnings.append(f"{p}: {m}")


def clean_url(p):
    p = p[:-5]
    return D + ("/" if p == "index" else "/hi/" if p == "hi/index" else "/" + p)


def page_for(url):
    path = url.replace(D, "").strip("/")
    return "index.html" if not path else "hi/index.html" if path == "hi" else path + ".html"


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def resolves(ref, page):
    ref = ref.split("#")[0].split("?")[0]
    if not ref:
        return True
    loc = ref.lstrip("/") if ref.startswith("/") else os.path.join(os.path.dirname(page), ref)
    if loc == "" or loc.endswith("/"):
        return os.path.exists(os.path.join(loc, "index.html"))
    return os.path.exists(loc) or os.path.exists(loc + ".html")


for p in pages:
    h = open(p, encoding="utf-8").read()
    body = h.split("<body>", 1)[1] if "<body>" in h else h
    lds = []
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try:
            o = json.loads(block)
            lds += o if isinstance(o, list) else [o]
        except ValueError as e:
            err(p, f"broken JSON-LD: {e}")
    if h.count('class="faq-q"') != sum(len(j.get("mainEntity", [])) for j in lds if j.get("@type") == "FAQPage"):
        err(p, "FAQ structured data does not match the visible FAQ")
    if len(re.findall(r"<h1[\s>]", body)) != 1:
        err(p, "page must have exactly one <h1>")
    levels = [int(x) for x in re.findall(r"<h([1-6])[\s>]", body)]
    for a, b in zip(levels, levels[1:]):
        if b > a + 1:
            warn(p, f"heading skips a level (h{a} -> h{b})"); break
    for ref in re.findall(r'(?:href|src)="([^"]+)"', body):
        if not re.match(r"(https?:|tel:|mailto:|//|#)", ref) and not resolves(ref, p):
            err(p, f"broken link/file: {ref}")
    for img in re.findall(r"<img[^>]*>", body):
        if not re.search(r'alt="[^"]+"', img):
            err(p, "image without alt text")
    if re.search(r'href="(?!https?:)[^"]*\.html', body):
        err(p, "internal link uses .html (use clean URL like /patna)")
    inline = len(re.findall(r'\sstyle="', body))
    if inline:
        warn(p, f"{inline} inline style attribute(s)")
    for w in re.findall(r'https://wa\.me/[^"\']*', h):
        if not w.startswith("https://wa.me/918770418045?text=") or unquote(w.split("text=")[1]) != WA_MSG:
            err(p, "WhatsApp link without the standard message")
    for needle, what in [(PHONE2, "second phone"), (GST, "GST number")]:
        if needle not in h:
            err(p, f"{what} missing")
    versions.update(re.findall(r"(?:style\.css|main\.js)\?v=(\d+)", h))
    if p == "404.html":
        continue
    title = html.unescape(re.search(r"<title>(.*?)</title>", h, re.S).group(1))
    desc = re.search(r'name="description" content="([^"]*)"', h)
    if len(title) > 68: warn(p, f"title is {len(title)} chars (Google shows ~60)")
    if not desc: err(p, "missing meta description")
    elif len(html.unescape(desc.group(1))) > 165: warn(p, "meta description over 165 chars")
    can = re.search(r'rel="canonical" href="([^"]+)"', h)
    if not can:
        err(p, "missing canonical"); continue
    c = can.group(1)
    if c != clean_url(p): err(p, f"canonical {c} should be {clean_url(p)}")
    if f"<loc>{c}</loc>" not in sitemap: err(p, "not listed in sitemap.xml")
    if not p.endswith("index.html") and f"/{p} " not in redirects: err(p, "no 301 for old .html address in _redirects")
    lang = re.search(r'<html lang="([^"]+)"', h).group(1)
    meta_lang = re.search(r'content-language" content="([^"]+)"', h)
    if meta_lang and not meta_lang.group(1).lower().startswith(lang.split("-")[0].lower()):
        err(p, f"content-language {meta_lang.group(1)} contradicts <html lang=\"{lang}\">")
    for hl, u in re.findall(r'hreflang="(en-IN|hi-IN)" href="([^"]+)"', h):
        other = page_for(u)
        if u != c and (not os.path.exists(other) or c not in open(other, encoding="utf-8").read()):
            err(p, f"hreflang to {u} is not returned")

if len(versions) > 1:
    err("pages", f"mixed CSS/JS versions {dict(versions)} - use one ?v= number everywhere")
for loc in re.findall(r"<loc>([^<]+)</loc>", sitemap):
    if not os.path.exists(page_for(loc)):
        err("sitemap.xml", f"lists a page that does not exist: {loc}")
for img in re.findall(r"<image:loc>([^<]+)</image:loc>", sitemap):
    if not os.path.exists(img.replace(D + "/", "")):
        err("sitemap.xml", f"image does not exist: {img}")

print(f"Checked {len(pages)} pages, CSS/JS version {', '.join(versions) or '-'}")
for title_, items in (("ERRORS", errors), ("WARNINGS", warnings)):
    print(f"\n{title_} ({len(items)})")
    for line in items:
        print("  " + line)
sys.exit(1 if errors else 0)
