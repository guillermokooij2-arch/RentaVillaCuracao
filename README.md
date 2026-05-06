# RentaVillaCuracao — Deployment Guide

## File Structure

```
/your-domain.com/
│
├── index.html              ← Main page (HTML only)
│
├── css/
│   └── styles.css          ← All CSS styles (402 lines, 26 sections)
│
├── js/
│   └── main.js             ← All JavaScript (776 lines, 18 sections)
│
├── images/
│   ├── hero-bg.webp        ← Hero background photo
│   ├── logo.webp           ← Logo image
│   ├── about-host.webp     ← Hostess photo
│   │
│   ├── casa-dushi-dolores/
│   │   ├── hero.webp
│   │   ├── woonkamer.webp
│   │   ├── pool1.webp
│   │   ├── keuken.webp
│   │   ├── porch.webp
│   │   ├── palapa.webp
│   │   ├── slaapkamer.webp
│   │   ├── badkamer.webp
│   │   └── slaapkamer2.webp
│   │
│   ├── casa-prikichi/
│   │   ├── hero.webp
│   │   ├── voorkant.webp
│   │   ├── woonkamer.webp
│   │   ├── keuken.webp
│   │   ├── badkamer.webp
│   │   ├── slaapkamer.webp
│   │   ├── slaapkamer2.webp
│   │   ├── slaapkamer3.webp
│   │   ├── pool.webp
│   │   ├── porch.webp
│   │   └── porch2.webp
│   │
│   ├── villa-c7/
│   │   ├── hero.webp
│   │   ├── voorkant.webp
│   │   ├── woonkamer.webp
│   │   ├── keuken.webp
│   │   ├── slaapkamer.webp
│   │   ├── slaapkamer2.webp
│   │   ├── badkamer.webp
│   │   ├── pool.webp
│   │   ├── porch.webp
│   │   └── poolporch.webp
│   │
│   ├── villa-dushi-bida/
│   │   ├── hero.webp
│   │   ├── voorkant.webp
│   │   ├── woonkamer.webp
│   │   ├── woonkamer2.webp
│   │   ├── slaapkamer.webp
│   │   ├── badkamer.webp
│   │   ├── porch.webp
│   │   └── porchpool.webp
│   │
│   ├── villa-abdo/
│   │   ├── hero.webp
│   │   ├── voorkant.webp
│   │   ├── woonkamer.webp
│   │   ├── keuken.webp
│   │   ├── slaapkamer.webp
│   │   ├── badkamer.webp
│   │   ├── pool.webp
│   │   └── porch.webp
│   │
│   ├── kas-granjero/
│   │   ├── hero.webp
│   │   ├── voorkant.webp
│   │   ├── woonkamer.webp
│   │   ├── woonkamer2.webp
│   │   ├── badkamer.webp
│   │   ├── badkamer2.webp
│   │   ├── slaapkamer.webp
│   │   ├── slaapkamer2.webp
│   │   ├── slaapkamer3.webp
│   │   ├── porch.webp
│   │   ├── porch2.webp
│   │   └── pool.webp
│   │
│   ├── veranosol/
│   │   ├── hero.webp
│   │   ├── chillings.webp
│   │   ├── woonkamer.webp
│   │   ├── woonkamer2.webp
│   │   ├── keuken.webp
│   │   ├── badkamer.webp
│   │   ├── slaapkamer.webp
│   │   ├── slaapkamer2.webp
│   │   ├── slaapkamer3.webp
│   │   ├── palapabar.webp
│   │   ├── onderpalapa.webp
│   │   ├── pool.webp
│   │   └── badkamerbuiten.webp
│   │
│   └── cars/
│       ├── hyundaitucson2012.webp
│       ├── vwpolo2022.webp
│       └── kiasorento2012.webp
│
├── calendars/              ← iCal files for availability
│   ├── casa-dushi-dolores.ics
│   ├── casa-prikichi.ics
│   ├── villa-dushi.ics
│   ├── villa-dushi-bida.ics
│   ├── villa-abdo.ics
│   ├── kas-granjero.ics
│   └── veranosol.ics
│
├── .htaccess               ← Performance & security headers
└── README.md               ← This file
```

---

## Setup Checklist

### 1. Supabase + Resend backend
Booking requests, contact messages, email delivery, and availability sync now use Supabase Edge Functions and Resend instead of EmailJS.

See `BACKEND_SETUP.md` for database setup, function deployment, secrets, and test commands.

### 2. iCal Calendar Sync (availability)
For production, add your Airbnb, Booking.com, or Google Calendar iCal URLs to the Supabase `calendar_sources` table and run the `sync-calendars` function.

The local `.ics` files remain as a fallback. If you use local files, filenames should match:
- `calendars/casa-dushi-dolores.ics`
- `calendars/casa-prikichi.ics`
- `calendars/villa-dushi.ics`
- `calendars/villa-dushi-bida.ics`
- `calendars/villa-abdo.ics`
- `calendars/kas-granjero.ics`
- `calendars/veranosol.ics`

> The site first asks the Supabase availability API. If that is not available yet, it falls back to these local files.

### 3. Google Maps links
In `js/main.js`, the Google Maps buttons are auto-generated from GPS coordinates already stored in `HOUSES_DATA`. No action needed.

### 4. Affiliate / Partner links
In `index.html`, find the Discover section cards. Each `<a>` tag has:
- `href` — replace the placeholder URL with your real affiliate link
- `data-promo` — optional promo code shown or used in your tracking

### 5. WhatsApp number
In `js/main.js`, find the `CONFIG` object:
```js
whatsappNumber: '59996779250',  // update if number changes
```

---

## Deployment

### Option A — cPanel / FTP (most hosting providers)
1. Upload the entire folder structure via FTP or cPanel File Manager
2. Make sure `index.html` is in the root of your domain's `public_html` folder
3. Done — no build step needed

### Option B — Netlify (free, recommended)
1. Go to https://netlify.com and sign up
2. Drag and drop the entire site folder onto the Netlify dashboard
3. Your site is live in 30 seconds
4. Connect your custom domain in Site Settings > Domain Management

### Option C — GitHub Pages
1. Push the folder to a GitHub repository
2. Go to Settings > Pages > Source: main branch / root
3. Site is live at `https://yourusername.github.io/repo-name`

---

## Making changes

| What you want to change        | File to edit              |
|-------------------------------|---------------------------|
| Colors, fonts, spacing        | `css/styles.css`          |
| Hero text, section text       | `index.html`              |
| Villa descriptions or photos  | `js/main.js` → HOUSES_DATA|
| Booking logic, WhatsApp msg   | `js/main.js`              |
| Calendar availability         | `calendars/*.ics` files   |
| Affiliate partner links       | `index.html` → Discover   |
| Car rental prices             | `index.html` + `js/main.js` |

---

## Performance Tips
- Convert all images to `.webp` format (already done)
- Images should be max 1200px wide for hero, 800px for property photos
- The `.htaccess` file enables browser caching and gzip compression
