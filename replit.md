# Lawhive Service Menu

## Project Overview
A Netlify-based static frontend application with serverless functions that displays a service menu for Lawhive. The application connects to Airtable's "Master Products" table and displays products grouped by category and subcategory with pricing and scope information.

**Current State**: Fully configured and running on Replit with Netlify CLI development server.

## Recent Changes
- **2024-11-04**: Initial GitHub import configured for Replit environment
  - Installed netlify-cli as dev dependency
  - Configured dev server to run on port 5000
  - Set up workflow for automatic server startup
  - Created development configuration (netlify.dev.toml)

## Architecture

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML, CSS
- **Backend**: Netlify Functions (serverless)
- **Data Source**: Airtable API
- **Dev Server**: Netlify CLI

### Project Structure
```
├── public/                 # Static frontend files
│   ├── index.html         # Main HTML page
│   ├── app.mjs            # Frontend logic (fetch, render, filters)
│   └── styles.css         # UI styling
├── netlify/
│   └── functions/         # Serverless functions
│       ├── products.js    # Main Airtable proxy (CommonJS)
│       └── getCategories.mjs  # Alternative endpoint (ESM)
├── netlify.toml           # Production Netlify config
├── netlify.dev.toml       # Development server config
└── package.json           # Node.js dependencies
```

### How It Works
1. Frontend loads and fetches data from `/.netlify/functions/products`
2. Netlify Function proxies request to Airtable API
3. Data is transformed and returned to frontend
4. UI renders products grouped by category/subcategory with filters

### Environment Variables
- `AIRTABLE_TOKEN` (optional): Airtable API key for live data
- `AIRTABLE_BASE` (optional): Defaults to `appHuFySGdecIs6Cq`
- `AIRTABLE_TABLE` (optional): Defaults to `Master Products`

**Note**: When no Airtable token is provided, the application shows sample data so development can proceed without API access.

## Development

### Running Locally
The dev server automatically starts via the configured workflow:
- Port: 5000
- Command: `npm start` (runs `netlify dev --port 5000`)
- Access: Use the Replit webview preview

### Key Features
- **Search**: Real-time search across products, categories, and scopes
- **Filters**: Category and subcategory dropdowns
- **Responsive**: Mobile-friendly grid layout
- **Sample Data**: Works without Airtable credentials for development

## Deployment
This project is designed for Netlify deployment. The build process is minimal (static files only). Configure environment variables in Netlify's dashboard before deploying to production.
