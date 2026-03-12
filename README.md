# Contact Your MP — Canadian-Iranian Community Action Tool

A single-page civic-action web app that helps Canadian-Iranians find and email
their federal Member of Parliament to urge action on IRGC-linked violence in Canada.

**Live user flow:**

1. Enter your Canadian postal code
2. The app looks up your federal MP via [Represent.ca](https://represent.opennorth.ca/)
3. Your MP's name, riding, and email are displayed
4. A pre-written, fully-editable message is shown
5. Click **"Open in Email Client"** — your email app opens with the subject and body pre-filled, ready to send

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (Pages Router) |
| Hosting | [Netlify](https://netlify.com/) |
| Serverless functions | Next.js API routes (handled by `@netlify/plugin-nextjs`) |
| MP data | [Represent.ca API](https://represent.opennorth.ca/) (Open North) |
| Styling | Plain CSS with CSS custom properties — no external CSS framework |

---

## Local Development

### Prerequisites

- Node.js 18 or 20
- npm (or yarn/pnpm)

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd contact-your-mp

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The `/api/mp` route proxies requests to Represent.ca automatically — no
environment variables are required for local development.

---

## Deploying to Netlify

### Option A — Netlify UI (recommended for first deploy)

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Log in to [app.netlify.com](https://app.netlify.com) and click **"Add new site → Import an existing project"**.
3. Connect your Git provider and select this repository.
4. Netlify will auto-detect the `netlify.toml` settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Click **"Deploy site"**. The first build takes ~2 minutes.
6. Your site will be live at a Netlify subdomain (e.g. `your-site.netlify.app`).
   Add a custom domain in **Site settings → Domain management** if desired.

### Option B — Netlify CLI

```bash
# Install the CLI globally (once)
npm install -g netlify-cli

# Log in
netlify login

# Link to an existing site or create a new one
netlify init

# Deploy a preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Environment variables

No environment variables are required. The app calls Represent.ca from the
server-side API route, so there are no API keys to configure.

---

## Project Structure

```
.
├── pages/
│   ├── _app.js          # Global CSS import
│   ├── index.js         # Main UI — postal code form, MP card, message editor
│   └── api/
│       └── mp.js        # Server-side proxy to Represent.ca API
├── styles/
│   └── globals.css      # All styles (Lion & Sun palette, mobile-first)
├── public/
│   └── favicon.svg
├── netlify.toml         # Build config + Next.js plugin + security headers
├── next.config.js
├── package.json
└── README.md
```

---

## How the MP Lookup Works

`GET /api/mp?postalCode=M5V3L9`

1. Normalizes the postal code (strips spaces, uppercases).
2. Validates the format (`A1A1A1`).
3. Fetches `https://represent.opennorth.ca/postcodes/{POSTAL_CODE}/`.
4. Filters `representatives_centroid` for entries where `elected_office === "MP"`.
5. Returns `{ name, riding, party, email, url }` — or a descriptive error.

The API route acts as a server-side proxy so the browser never hits
Represent.ca directly (avoids CORS issues and keeps the response lean).

---

## Customising the Message

The default email body is defined in `pages/index.js` inside the
`buildEmailBody(mpName)` function. Edit it there to change the pre-filled
content. The MP's name from the Represent.ca lookup is automatically
substituted into the salutation.

---

## Privacy

This tool does **not** collect, store, or transmit any personal data.
Postal codes are only used to query the public Represent.ca API.
No analytics or tracking scripts are included.

---

## Credits & Data Sources

- MP / riding data: [Represent.ca](https://represent.opennorth.ca/) by [Open North](https://opennorth.ca/) (CC BY)
- Built by Canadian-Iranians, for Canadian-Iranians.
