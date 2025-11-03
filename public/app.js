// Frontend logic: fetch products from Netlify Function and render
// Uses simple DOM rendering, search + category/subcategory grouping

const tryPaths = ['/.netlify/functions/products', '/api/products'];

async function fetchProducts() {

  try {function formatPrice(val) {

    const res = await fetch('/api/products');  if (val === null || val === undefined || val === '') return '—';

    if (!res.ok) throw new Error('Network response not ok');  // If already contains a $ assume it's formatted

    return await res.json();  if (typeof val === 'string' && val.trim().startsWith('$')) return val;

  } catch (err) {  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));

    console.warn('Could not fetch products from API, using sample data:', err);  if (Number.isNaN(num)) return String(val);

    // If server returned error, fall back to a small sample so UI still shows  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return [}

      {

        id: 'sample1',function formatPercent(val) {

        parentCategory: 'Corporate',  if (val === null || val === undefined || val === '') return '—';

        subCategory: 'Formation',  // Strip percent sign if present

        productName: 'LLC Formation',  const s = String(val).trim();

        includedScope: 'Prepare articles; file with state',  if (s.endsWith('%')) return s;

        excludedScope: 'Registered agent fees',  const num = parseFloat(s.replace(/[^0-9.-]+/g, ''));

        lineItemPrice: 500,  if (Number.isNaN(num)) return s;

        percentFirmSplit: 60,  // If value looks like a decimal between 0 and 1, convert to percent

        percentLawhiveSplit: 40  const pct = num <= 1 ? num * 100 : num;

      }  // Show as integer percent if it's effectively whole, else one decimal

    ];  const rounded = Math.abs(pct - Math.round(pct)) < 0.01 ? Math.round(pct) : Math.round(pct * 10) / 10;

  }  return `${rounded}%`;

}}



function formatPrice(v) {async function load() {

  if (v === null || v === undefined || v === '') return '—';  // Try local /api/products (Express) first, then fall back to Netlify Function path

  if (typeof v === 'string') {  const tryPaths = ['/api/products', '/.netlify/functions/products'];

    const n = Number(v.replace(/[^0-9.-]+/g, ''));  let products = null;

    if (!isFinite(n)) return v;

    v = n;  for (const p of tryPaths) {

  }    try {

  if (typeof v === 'number') return new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);      const res = await fetch(p);

  return String(v);      if (!res.ok) {

}        // try next

        continue;

function formatPercent(v) {      }

  if (v === null || v === undefined || v === '') return '—';      products = await res.json();

  if (typeof v === 'string') {      break;

    if (v.includes('%')) return v.trim();    } catch (err) {

    const n = Number(v.replace(/[^0-9.-]+/g, ''));      // network error — try next

    if (!isFinite(n)) return v;      continue;

    v = n;    }

  }  }

  if (typeof v === 'number') return `${v}%`;

  return String(v);  if (!products) {

}    console.error('Failed to load products from known endpoints');

    $$('#menu').innerHTML = '<div class="error">Failed to load products — check server logs or set AIRTABLE_TOKEN</div>';

function render(products) {    return;

  const container = document.getElementById('menu');  }

  container.innerHTML = '';

  window.__products = products;

  // Group by parentCategory  render(products);

  const map = {};  populateCategoryFilter(products);

  for (const p of products) {}

    const pc = p.parentCategory || 'Uncategorized';

    map[pc] = map[pc] || [];function populateCategoryFilter(products) {

    map[pc].push(p);  const select = $$('#categoryFilter');

  }  const cats = Array.from(new Set(products.map(p => p.parentCategory))).sort();

  for (const c of cats) {

  for (const pc of Object.keys(map).sort()) {    const opt = document.createElement('option');

    const catEl = document.createElement('div');    opt.value = c; opt.textContent = c;

    catEl.className = 'category';    select.appendChild(opt);

    const h2 = document.createElement('h2');  }

    h2.textContent = pc;  select.addEventListener('change', applyFilters);

    catEl.appendChild(h2);  $$('#search').addEventListener('input', debounce(applyFilters, 200));

}

    const table = document.createElement('div');

    table.className = 'products';function applyFilters() {

  const search = $$('#search').value.trim().toLowerCase();

    // Sort by name within category  const cat = $$('#categoryFilter').value;

    map[pc].sort((a, b) => a.productName.localeCompare(b.productName));  const products = window.__products || [];

  const filtered = products.filter(p => {

    for (const p of map[pc]) {    if (cat && p.parentCategory !== cat) return false;

      const row = document.createElement('div');    if (!search) return true;

      row.className = 'product';    const hay = [p.productName, p.includedScope, p.excludedScope, p.parentCategory, p.subCategory].join(' \n ').toLowerCase();

    return hay.includes(search);

      // Name + scopes column  });

      const mainCol = document.createElement('div');  render(filtered);

      const name = document.createElement('h4');}

      name.textContent = p.productName;

      mainCol.appendChild(name);function render(products) {

  const menu = $$('#menu');

      if (p.includedScope || p.excludedScope) {  menu.innerHTML = '';

        const scopes = document.createElement('div');

        scopes.className = 'scopes';  // Group by parentCategory

        if (p.includedScope) {  const map = {};

          const inc = document.createElement('div');  for (const p of products) {

          inc.className = 'scope-included';    const pc = p.parentCategory || 'Uncategorized';

          inc.textContent = `Included: ${p.includedScope}`;    map[pc] = map[pc] || [];

          scopes.appendChild(inc);    map[pc].push(p);

        }  }

        if (p.excludedScope) {

          const exc = document.createElement('div');  for (const pc of Object.keys(map).sort()) {

          exc.className = 'scope-excluded';    const catEl = document.createElement('div');

          exc.textContent = `Excluded: ${p.excludedScope}`;    catEl.className = 'category';

          scopes.appendChild(exc);    const h2 = document.createElement('h2'); 

        }    h2.textContent = pc; 

        mainCol.appendChild(scopes);    catEl.appendChild(h2);

      }

    const table = document.createElement('div');

      // Meta column (price + splits)    table.className = 'products';

      const meta = document.createElement('div');

      meta.className = 'meta';    // Sort by name within category

      meta.innerHTML = `    map[pc].sort((a, b) => a.productName.localeCompare(b.productName));

        <div>

          <div>${formatPrice(p.lineItemPrice)}</div>    for (const p of map[pc]) {

          <div style="color:var(--muted);margin-top:4px">      const row = document.createElement('div');

            Firm: ${formatPercent(p.percentFirmSplit)} •       row.className = 'product';

            Lawhive: ${formatPercent(p.percentLawhiveSplit)}

          </div>      // Name + scopes column

        </div>      const mainCol = document.createElement('div');

      `;      const name = document.createElement('h4');

      name.textContent = p.productName;

      row.appendChild(mainCol);      mainCol.appendChild(name);

      row.appendChild(meta);

      table.appendChild(row);      if (p.includedScope || p.excludedScope) {

    }        const scopes = document.createElement('div');

        scopes.className = 'scopes';

    catEl.appendChild(table);        if (p.includedScope) {

    container.appendChild(catEl);          const inc = document.createElement('div');

  }          inc.className = 'scope-included';

}          inc.textContent = `Included: ${p.includedScope}`;

          scopes.appendChild(inc);

async function boot() {        }

  const products = await fetchProducts();        if (p.excludedScope) {

  render(products);          const exc = document.createElement('div');

          exc.className = 'scope-excluded';

  // Wire search and category filter          exc.textContent = `Excluded: ${p.excludedScope}`;

  const queryInput = document.getElementById('query');          scopes.appendChild(exc);

  const categorySelect = document.getElementById('categoryFilter');        }

        mainCol.appendChild(scopes);

  const categories = Array.from(new Set(products.map(p => p.parentCategory || 'Uncategorized'))).sort();      }

  for (const c of categories) {

    const opt = document.createElement('option'); opt.value = c; opt.textContent = c; categorySelect.appendChild(opt);      // Meta column (price + splits)

  }      const meta = document.createElement('div');

      meta.className = 'meta';

  function applyFilters() {      meta.innerHTML = `

    const q = queryInput.value.trim().toLowerCase();        <div>

    const cat = categorySelect.value;          <div>${formatPrice(p.lineItemPrice)}</div>

    const filtered = products.filter(p => {          <div style="color:var(--muted);margin-top:4px">

      if (cat && (p.parentCategory || '') !== cat) return false;            Firm: ${formatPercent(p.percentFirmSplit)} • 

      if (!q) return true;            Lawhive: ${formatPercent(p.percentLawhiveSplit)}

      const hay = [p.productName, p.includedScope, p.excludedScope, p.subCategory, p.parentCategory].join(' ').toLowerCase();          </div>

      return hay.includes(q);        </div>

    });      `;

    render(filtered);

  }      row.appendChild(mainCol);

      row.appendChild(meta);

  queryInput.addEventListener('input', applyFilters);      table.appendChild(row);

  categorySelect.addEventListener('change', applyFilters);

}      }



boot();    catEl.appendChild(table);

    container.appendChild(catEl);
  }
}

function debounce(fn, wait){
  let t;
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

load();
