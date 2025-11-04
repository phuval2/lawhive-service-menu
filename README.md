Lawhive Service Menu
=====================

This is a minimal Netlify-ready static frontend plus a Netlify Function that proxies the Airtable `Master Products` table and returns a simplified JSON payload used by the frontend.

Quick start
-----------
1. Set Netlify environment variables in Site settings → Build & deploy → Environment:
   - `AIRTABLE_TOKEN` — your Airtable API key
   - (optional) `AIRTABLE_BASE` — defaults to `appHuFySGdecIs6Cq`
   - (optional) `AIRTABLE_TABLE` — defaults to `Master Products`

2. Commit & push to GitHub and connect the repo in Netlify. Ensure `netlify.toml` is present.

3. Deploy (no build step required).

Local preview (optional)
------------------------
Install Netlify CLI and run:

```bash
npm install -g netlify-cli
netlify dev
```

This will run a local server and locally emulate Netlify Functions.

Files created
-------------
- `public/index.html` — frontend shell
- `public/styles.css` — UI styles
- `public/app.mjs` — frontend logic (fetch + render + filters)
- `netlify/functions/products.js` — serverless proxy to Airtable
- `netlify.toml` — Netlify config

If you want additional UI tweaks (CSV export, pagination, or improved styling), tell me which and I'll add them.
