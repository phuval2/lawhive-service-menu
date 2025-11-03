# Lawhive Service Menu# Lawhive Service Menu



This project is a small Express app that serves a Lawhive-branded service menu frontend and proxies to Airtable to fetch records from the "Master Products" table.This project provides a simple Lawhive-branded service menu that reads records from an Airtable `Master Products` table and displays them in a grouped, searchable UI.



FeaturesFeatures

- Simple Express server serving static frontend from `/public`- Server-side Airtable proxy to keep API token secret

- `/api/products` endpoint that fetches from Airtable (or returns sample data when no token is set)- Frontend grouped by Parent Category and Sub Category

- Clean, table-like responsive UI- Search and category filter



Quick startGetting started (macOS / zsh)

1. Copy `.env.example` -> `.env` and add your Airtable API key:

1. Copy `.env.example` to `.env` and set `AIRTABLE_TOKEN`:

```env

AIRTABLE_TOKEN=sk_xxx```bash

AIRTABLE_BASE=appHuFySGdecIs6Cqcp .env.example .env

AIRTABLE_TABLE=Master Products# Edit .env and set AIRTABLE_TOKEN

PORT=3000```

```

2. Install dependencies:

2. Install dependencies and run dev server:

```bash

```bashnpm install

cd /Users/patrickhuval/Desktop/Form/Service_Menu```

npm install

# Lawhive Service Menu

This repo contains a small static frontend and a Netlify Function that proxies Airtable's "Master Products" table and returns a simplified JSON payload the frontend consumes.

## Git Setup

To initialize and connect this project to your GitHub repository:

```bash
# Initialize a new git repository
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit"

# Add the remote repository
git remote add origin git@github.com:lawhive/lawhive-service-menu.git

# Push to main branch
git push -u origin main
```

What you get
- Static responsive UI in `public/` (search, category + subcategory grouping, clean table-like layout)
- Serverless proxy at `/.netlify/functions/products` that reads `AIRTABLE_TOKEN` from Netlify environment variables

Quick deploy (Netlify)
1. Push this repository to GitHub.
2. In Netlify, create a new site and connect your repository.
3. In Site settings → Build & deploy → Environment, add `AIRTABLE_TOKEN` with your Airtable API key. Optionally set `AIRTABLE_BASE` and `AIRTABLE_TABLE` (defaults are in code).
4. Netlify will build and serve the `public/` folder and the function will be available at `/.netlify/functions/products`.

Local preview with Netlify Dev (optional)
1. Install Netlify CLI: `npm i -g netlify-cli`
2. From the project root run:

```bash
npm install
netlify dev
```

This runs a local dev server and proxies function calls so you can preview the deployed behavior without setting secrets in files.

Notes
- The frontend first tries `/api/products` (for a local Express proxy if you keep one) and falls back to `/.netlify/functions/products`.
- Do NOT commit your real `AIRTABLE_TOKEN`. Use Netlify environment variables instead.

If you'd like, I can also:
- Add automatic deployment instructions for GitHub → Netlify.
- Add a simple GitHub Actions workflow that runs tests or formatting before deploy.
