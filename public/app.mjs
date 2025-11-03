// Helper functions for formatting
function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '—';
  const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(num)) return val;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

function formatPercent(val) {
  if (val === null || val === undefined || val === '') return '—';
  const s = String(val).trim();
  if (s.endsWith('%')) return s;
  
  const num = parseFloat(s.replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(num)) return s;
  
  const pct = num <= 1 ? num * 100 : num;
  const rounded = Math.abs(pct - Math.round(pct)) < 0.01 ? Math.round(pct) : Math.round(pct * 10) / 10;
  return `${rounded}%`;
}

// Main rendering logic
async function render() {
  const menu = document.getElementById('menu');
  const searchInput = document.getElementById('search');
  const query = (searchInput?.value || '').toLowerCase();

  let products = [];
  try {
    // First try Netlify function
    const resp = await fetch('/.netlify/functions/products');
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    products = await resp.json();
  } catch (err) {
    console.warn('Error fetching from Netlify function:', err);
    try {
      // Fall back to local dev server
      const resp = await fetch('/api/products');
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
      products = await resp.json();
    } catch (err) {
      console.error('Error fetching products:', err);
      menu.innerHTML = '<p>Error loading menu. Please check the console.</p>';
      return;
    }
  }

  // Filter by search query
  if (query) {
    products = products.filter(p => {
      const searchable = [
        p.parentCategory,
        p.subCategory,
        p.productName,
        p.includedScope,
        p.excludedScope
      ].map(s => (s || '').toLowerCase()).join(' ');
      return searchable.includes(query);
    });
  }

  // Group by parent category and subcategory
  const grouped = {};
  for (const p of products) {
    const parent = p.parentCategory || 'Uncategorized';
    const sub = p.subCategory || 'General';
    if (!grouped[parent]) grouped[parent] = {};
    if (!grouped[parent][sub]) grouped[parent][sub] = [];
    grouped[parent][sub].push(p);
  }

  // Render the menu
  menu.innerHTML = '';

  // Add headers once at the top
  const headerRow = document.createElement('div');
  headerRow.className = 'product product-header';
  headerRow.innerHTML = `
    <div>Product</div>
    <div>Price</div>
    <div>Firm</div>
    <div>Law Hive</div>
    <div>Scope</div>
  `;
  menu.appendChild(headerRow);

  // Render each category
  for (const [parent, subs] of Object.entries(grouped)) {
    const category = document.createElement('div');
    category.className = 'category';
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.textContent = parent;
    category.appendChild(categoryHeader);

    for (const [sub, products] of Object.entries(subs)) {
      const subcategory = document.createElement('div');
      subcategory.className = 'subcategory';
      
      const subHeader = document.createElement('div');
      subHeader.className = 'subcategory-header';
      subHeader.textContent = sub;
      subcategory.appendChild(subHeader);

      for (const p of products) {
        const product = document.createElement('div');
        product.className = 'product';
        
        const name = document.createElement('div');
        name.textContent = p.productName;
        product.appendChild(name);

        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = formatPrice(p.lineItemPrice);
        product.appendChild(price);

        const firm = document.createElement('div');
        firm.className = 'splits';
        firm.textContent = formatPercent(p.percentFirmSplit);
        product.appendChild(firm);

        const lawhive = document.createElement('div');
        lawhive.className = 'splits';
        lawhive.textContent = formatPercent(p.percentLawhiveSplit);
        product.appendChild(lawhive);

        const scopes = document.createElement('div');
        scopes.className = 'scopes';
        if (p.includedScope) {
          scopes.innerHTML += `<div class="included">✓ ${p.includedScope}</div>`;
        }
        if (p.excludedScope) {
          scopes.innerHTML += `<div class="excluded">✗ ${p.excludedScope}</div>`;
        }
        product.appendChild(scopes);

        subcategory.appendChild(product);
      }

      category.appendChild(subcategory);
    }

    menu.appendChild(category);
  }
}

// Initial render
render();

// Set up search
const searchInput = document.getElementById('search');
if (searchInput) {
  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(render, 250);
  });
}