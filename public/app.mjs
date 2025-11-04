// Frontend: fetch products from Netlify function and render grouped UI

function formatPrice(v){
  if (v === null || v === undefined || v === '') return '—';
  const n = parseFloat(String(v).replace(/[^0-9.-]+/g,''));
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n);
}
function formatPercent(v){
  if (v === null || v === undefined || v === '') return '—';
  const s = String(v).trim();
  if (s.endsWith('%')) return s;
  const n = parseFloat(s.replace(/[^0-9.-]+/g,''));
  if (Number.isNaN(n)) return s;
  const pct = n <= 1 ? n*100 : n;
  return (Math.abs(pct - Math.round(pct)) < 0.01 ? Math.round(pct) : Math.round(pct*10)/10) + '%';
}

async function fetchProducts(){
  const resp = await fetch('/.netlify/functions/products');
  if (!resp.ok) throw new Error('Failed to fetch products: '+resp.status);
  return await resp.json();
}

function groupProducts(products){
  const groups = {};
  for (const p of products){
    const parent = p.parentCategory || 'Uncategorized';
    const sub = p.subCategory || 'General';
    groups[parent] = groups[parent] || {};
    groups[parent][sub] = groups[parent][sub] || [];
    groups[parent][sub].push(p);
  }
  return groups;
}

function createOption(select, value){
  const opt = document.createElement('option');opt.value = value;opt.textContent = value;select.appendChild(opt);
}

function renderMenu(groups, container){
  container.innerHTML = '';
  for (const [parent, subs] of Object.entries(groups)){
    const cat = document.createElement('div');cat.className='category';
    const header = document.createElement('div');header.className='category-header';header.textContent = parent;cat.appendChild(header);
    for (const [sub, items] of Object.entries(subs)){
      const subwrap = document.createElement('div');subwrap.className='subcategory';
      const subh = document.createElement('div');subh.className='subcategory-header';subh.textContent=sub;subwrap.appendChild(subh);
      const prodwrap = document.createElement('div');prodwrap.className='products';
      for (const p of items){
        const row = document.createElement('div');row.className='product';
        const name = document.createElement('div');name.className='name';name.textContent = p.productName;row.appendChild(name);
        const price = document.createElement('div');price.className='price';price.textContent = formatPrice(p.lineItemPrice);row.appendChild(price);
        const firm = document.createElement('div');firm.className='firm';firm.textContent = formatPercent(p.percentFirmSplit);row.appendChild(firm);
        const lawhive = document.createElement('div');lawhive.className='lawhive';lawhive.textContent = formatPercent(p.percentLawhiveSplit);row.appendChild(lawhive);
        const scopes = document.createElement('div');scopes.className='scopes';
        if (p.includedScope) scopes.innerHTML += `<div class="included">✓ ${p.includedScope.replace(/\n/g,'<br>')}</div>`;
        if (p.excludedScope) scopes.innerHTML += `<div class="excluded">✗ ${p.excludedScope.replace(/\n/g,'<br>')}</div>`;
        row.appendChild(scopes);
        prodwrap.appendChild(row);
      }
      subwrap.appendChild(prodwrap);
      cat.appendChild(subwrap);
    }
    container.appendChild(cat);
  }
}

// Wire up search and filters
let allProducts = [];
let grouped = {};

async function init(){
  const menu = document.getElementById('menu');
  const search = document.getElementById('search');
  const catSelect = document.getElementById('categoryFilter');
  const subSelect = document.getElementById('subCategoryFilter');

  try{
    allProducts = await fetchProducts();
  }catch(err){
    menu.innerHTML = `<p>Error loading products: ${err.message}</p>`;return;
  }

  grouped = groupProducts(allProducts);

  // populate category select
  const categories = Object.keys(grouped).sort();
  for (const c of categories){ createOption(catSelect,c); }

  // when category changes, update subcategory select
  catSelect.addEventListener('change', () => {
    const val = catSelect.value;
    subSelect.innerHTML = '<option value="">All subcategories</option>';
    if (!val) {
      // show all
      const allSubs = new Set();
      for (const c of Object.keys(grouped)) for (const s of Object.keys(grouped[c])) allSubs.add(s);
      Array.from(allSubs).sort().forEach(s => createOption(subSelect,s));
    } else {
      Object.keys(grouped[val]||{}).sort().forEach(s => createOption(subSelect,s));
    }
    applyFilters();
  });

  subSelect.addEventListener('change', applyFilters);
  search.addEventListener('input', ()=>{ clearTimeout(window._deb); window._deb = setTimeout(applyFilters, 180); });

  applyFilters();
}

function applyFilters(){
  const searchVal = (document.getElementById('search').value||'').toLowerCase().trim();
  const catVal = document.getElementById('categoryFilter').value;
  const subVal = document.getElementById('subCategoryFilter').value;

  let filtered = allProducts.filter(p => {
    if (catVal && (p.parentCategory||'') !== catVal) return false;
    if (subVal && (p.subCategory||'') !== subVal) return false;
    if (!searchVal) return true;
    const hay = [p.parentCategory,p.subCategory,p.productName,p.includedScope,p.excludedScope].map(x => (x||'').toLowerCase()).join(' ');
    return hay.includes(searchVal);
  });

  const g = groupProducts(filtered);
  renderMenu(g, document.getElementById('menu'));
}

init();
