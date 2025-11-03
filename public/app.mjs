// Frontend logic: fetch products from Netlify Function and render
// Uses simple DOM rendering, search + category/subcategory grouping

const tryPaths = ['/.netlify/functions/products', '/api/products'];

async function fetchProducts() {
  for (const p of tryPaths) {
    try {
      const res = await fetch(p);
      if (!res.ok) throw new Error(`fetch ${p} failed: ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      // try next
      console.warn('fetch failed for', p, err);
      continue;
    }
  }

  // final fallback sample so UI still works without a token
  return [
    {
      id: 'sample1',
      parentCategory: 'Corporate',
      subCategory: 'Formation',
      productName: 'LLC Formation',
      includedScope: 'Prepare articles; file with state',
      excludedScope: 'Registered agent fees',
      lineItemPrice: 500,
      percentFirmSplit: 60,
      percentLawhiveSplit: 40
    }
  ];
}

function formatPrice(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.-]+/g, ''));
    if (!isFinite(n)) return v;
    v = n;
  }
  if (typeof v === 'number') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  return String(v);
}

function formatPercent(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string') {
    const s = v.trim();
    if (s.endsWith('%')) return s;
    const n = Number(s.replace(/[^0-9.-]+/g, ''));
    if (!isFinite(n)) return s;
    v = n;
  }
  // if decimal between 0 and 1, treat as fraction
  if (typeof v === 'number') {
    const pct = v <= 1 ? v * 100 : v;
    const rounded = Math.abs(pct - Math.round(pct)) < 0.01 ? Math.round(pct) : Math.round(pct * 10) / 10;
    return `${rounded}%`;
  }
  return String(v);
}

function createEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function render(products) {
  const container = document.getElementById('menu');
  container.innerHTML = '';

  // Group by parentCategory -> subCategory
  const map = {};
  for (const p of products) {
    const pc = p.parentCategory || 'Uncategorized';
    const sc = p.subCategory || 'Uncategorized';
    map[pc] = map[pc] || {};
    map[pc][sc] = map[pc][sc] || [];
    map[pc][sc].push(p);
  }

  for (const pc of Object.keys(map).sort()) {
    const catEl = createEl('div', 'category');
    catEl.appendChild(createEl('h2', '', pc));

    for (const sc of Object.keys(map[pc]).sort()) {
      const sub = createEl('div', 'subcategory');
      sub.appendChild(createEl('h3', '', sc));

      const table = createEl('div', 'products');

      map[pc][sc].sort((a, b) => a.productName.localeCompare(b.productName));

      for (const p of map[pc][sc]) {
        const row = createEl('div', 'product');

        const main = createEl('div', 'main');
        main.appendChild(createEl('h4', '', p.productName || ''));

        if (p.includedScope) main.appendChild(createEl('div', 'scope-included', `Included: ${p.includedScope}`));
        if (p.excludedScope) main.appendChild(createEl('div', 'scope-excluded', `Excluded: ${p.excludedScope}`));

        const meta = createEl('div', 'meta');
        const price = createEl('div', 'price', formatPrice(p.lineItemPrice));
        const splits = createEl('div', '', `Firm: ${formatPercent(p.percentFirmSplit)} • Lawhive: ${formatPercent(p.percentLawhiveSplit)}`);
        splits.style.color = 'var(--muted)';
        splits.style.marginTop = '6px';

        meta.appendChild(price);
        meta.appendChild(splits);

        row.appendChild(main);
        row.appendChild(meta);
        table.appendChild(row);
      }

      sub.appendChild(table);
      catEl.appendChild(sub);
    }

    container.appendChild(catEl);
  }
}

function populateCategoryFilter(products) {
  const categorySelect = document.getElementById('categoryFilter');
  categorySelect.innerHTML = '<option value="">All categories</option>';
  const cats = Array.from(new Set(products.map(p => p.parentCategory || 'Uncategorized'))).sort();
  for (const c of cats) {
    const opt = createEl('option', '', c);
    opt.value = c;
    categorySelect.appendChild(opt);
  }
}

function applyFilters(products) {
  const q = document.getElementById('query').value.trim().toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const filtered = products.filter(p => {
    if (cat && (p.parentCategory || '') !== cat) return false;
    if (!q) return true;
    const hay = [p.productName, p.includedScope, p.excludedScope, p.subCategory, p.parentCategory].join(' ').toLowerCase();
    return hay.includes(q);
  });
  render(filtered);
}

async function boot() {
  const products = await fetchProducts();
  window.__products = products;
  populateCategoryFilter(products);
  render(products);

  document.getElementById('query').addEventListener('input', () => applyFilters(products));
  document.getElementById('categoryFilter').addEventListener('change', () => applyFilters(products));
}

boot();

export default {};
