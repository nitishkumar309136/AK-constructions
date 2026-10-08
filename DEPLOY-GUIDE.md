# Website Live Karne Ka Guide — akconstructionandhomedesign.com

Hosting **free** hai (Netlify free plan). Sirf domain ka kharcha lagta hai, jo aap pehle hi de chuke hain.
Total time: ~30 minute kaam + DNS update hone mein 1–24 ghante.

> **Aapki site Cloudflare Pages par live hai** (Netlify par nahi). Neeche ke Netlify steps sirf reference ke liye hain —
> Cloudflare ke zaroori settings yeh hain:
>
> 1. **Always Use HTTPS:** Cloudflare dashboard → apna domain → **SSL/TLS → Edge Certificates → Always Use HTTPS = On**
> 2. **www jodein:** Workers & Pages → apna project → **Custom domains → Set up a domain** → `www.akconstructionandhomedesign.com`
> 3. **www → bina-www redirect:** domain → **Rules → Redirect Rules → Create rule** → "Redirect from WWW to root" template
>    (Hostname equals `www.akconstructionandhomedesign.com` → `https://akconstructionandhomedesign.com` + path, **301**, preserve query string)
> 4. Har `git push` ke baad Cloudflare apne-aap naya version deploy karta hai (Workers & Pages → Deployments mein dikhega).
> 5. `_redirects` (purane `.html` links → naye links, 301) aur `_headers` (cache) files Cloudflare khud padhta hai. `netlify.toml` Cloudflare par kaam nahi karta.

---

## Step 1 — Code GitHub par push karein

Aapka repo pehle se hai: `github.com/keshavkumar4699/AK-constructions`

Project folder mein terminal kholein aur chalayein:

```bash
git add -A
git commit -m "Website ready for launch"
git push origin main
```

## Step 2 — Netlify par site banayein (free)

1. <https://app.netlify.com/signup> kholein → **Sign up with GitHub**.
2. **Add new site → Import an existing project → GitHub** → `AK-constructions` repo chunein.
3. Settings:
   - **Branch:** `main`
   - **Build command:** *khaali chhod dein*
   - **Publish directory:** `.` (ek dot) — `netlify.toml` mein pehle se set hai
4. **Deploy** dabayein. 1 minute mein site `something-random.netlify.app` par live ho jaayegi — kholkar check karein.
5. **Site configuration → Change site name** → `akconstruction` jaisa naam rakh dein (optional).

Ab se jab bhi `git push` karenge, Netlify website apne-aap update kar dega.

## Step 3 — Apna domain jodein

1. Netlify mein **Domain management → Add a domain** → `akconstructionandhomedesign.com` likhein → **Verify → Add domain**.
2. Netlify `www.akconstructionandhomedesign.com` bhi apne-aap jod dega.

## Step 4 — Domain ki DNS settings (jahan domain khareeda — GoDaddy / Hostinger / BigRock / Namecheap)

Domain provider ke dashboard mein **DNS / Manage DNS** kholein. Do tarike hain — **ek hi** chunein:

### Tarika A (aasaan) — Netlify DNS use karein
1. Netlify mein domain ke saamne **Set up Netlify DNS** dabayein → aage badhte jaayein.
2. Netlify 4 **nameservers** dega (jaise `dns1.p01.nsone.net` …).
3. Domain provider par **Nameservers → Custom / Change nameservers** mein yeh 4 daal kar save karein.

### Tarika B — provider ki DNS mein records daalein
Purane `A` / `CNAME` records (@ aur www wale, jaise "Parked" ya "WebsiteBuilder") pehle **delete** karein, phir:

| Type  | Name / Host | Value                              |
|-------|-------------|------------------------------------|
| A     | `@`         | `75.2.60.5`                        |
| CNAME | `www`       | `<aapka-site-naam>.netlify.app`    |

> Email ke `MX` records ko **mat chhediye**.

## Step 5 — HTTPS (free SSL)

DNS update hone ke baad (1–24 ghante) Netlify → **Domain management → HTTPS → Verify DNS configuration → Provision certificate**.
Aam taur par yeh apne-aap ho jaata hai. Phir `https://akconstructionandhomedesign.com` par taala (🔒) dikhega.

Check karein: domain kholein, WhatsApp button, call button, cost calculator, aur ek naksha page.

---

## Step 6 — Google mein dikhne ke liye (launch ke din hi karein)

1. **Google Search Console** — <https://search.google.com/search-console>
   - **Add property → Domain** → `akconstructionandhomedesign.com`
   - Google ek `TXT` record dega → DNS mein daalein (Tarika A: Netlify DNS mein; Tarika B: provider par) → **Verify**
   - **Sitemaps** → `sitemap.xml` likh kar **Submit**
   - **URL Inspection** → home page ka URL daal kar **Request indexing** (Hindi page `/hi/` ke liye bhi)
2. **Bing Webmaster Tools** — <https://www.bing.com/webmasters> → "Import from Google Search Console" (2 click).
3. **Google Business Profile** (Maps ke liye sabse zaroori) — business.google.com:
   - **Website:** `https://akconstructionandhomedesign.com`
   - **Hours:** Tuesday–Sunday 9:00 AM – 6:00 PM, **Monday: Closed**
   - **Additional phone:** +91 70494 09269
   - Nayi photos (renders + site photos) wahan bhi upload karein
4. **Facebook page, Justdial, IndiaMART** — website link aur timing wahi update karein
   (naam, pata, phone har jagah bilkul same hona chahiye).

---

## Baad mein badlaav karna

- Kisi bhi file mein badlaav → `git add -A && git commit -m "..." && git push` → 1 minute mein live.
- **CSS ya JS badla ho** to sabhi pages mein `style.css?v=6` / `main.js?v=6` ka number badha dein (v=7…),
  warna purane visitors ko purana design dikhega.

## Kuch galat ho to

| Problem | Hal |
|---|---|
| Domain kholne par provider ka "parked" page dikhe | DNS abhi update nahi hua, ya purana A record delete nahi hua — Step 4 dobara check karein |
| "Not secure" dikhe | DNS update ke baad Step 5 karein |
| Site purani dikhe | Phone par browser cache clear karein / incognito mein kholein |
| Deploy fail ho | Netlify → **Deploys** → error padhein; publish directory `.` hona chahiye |
