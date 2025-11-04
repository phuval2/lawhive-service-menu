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

function formatScopeList(scopeText){
  if (!scopeText) return '';
  const items = scopeText.split('\n').filter(line => line.trim()).map(line => {
    let clean = line.trim();
    if (clean.startsWith('-')) clean = clean.substring(1).trim();
    if (clean.startsWith('•')) clean = clean.substring(1).trim();
    return clean;
  });
  if (items.length === 0) return '';
  return '<ul>' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
}

function renderMenu(groups, container){
  container.innerHTML = '';
  const sortedParents = Object.keys(groups).sort();
  for (const parent of sortedParents){
    const subs = groups[parent];
    const cat = document.createElement('div');cat.className='category';
    const header = document.createElement('div');header.className='category-header';
    header.innerHTML = `<span class="category-title">${parent}</span><span class="expand-icon">▼</span>`;
    header.style.cursor = 'pointer';
    cat.appendChild(header);
    
    const content = document.createElement('div');
    content.className = 'category-content collapsed';
    
    const sortedSubs = Object.keys(subs).sort();
    for (const sub of sortedSubs){
      const items = subs[sub];
      const subwrap = document.createElement('div');subwrap.className='subcategory';
      const subh = document.createElement('div');subh.className='subcategory-header';subh.textContent=sub;subwrap.appendChild(subh);
      
      const tableHeader = document.createElement('div');
      tableHeader.className='table-header';
      tableHeader.innerHTML = `
        <div>Product Name</div>
        <div>Price</div>
        <div>Firm Split</div>
        <div>Lawhive Split</div>
        <div>Included Scope</div>
        <div>Excluded Scope</div>
      `;
      subwrap.appendChild(tableHeader);
      
      const prodwrap = document.createElement('div');prodwrap.className='products';
      const sortedItems = items.sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
      
      for (const p of sortedItems){
        const row = document.createElement('div');row.className='product';
        const name = document.createElement('div');name.className='name';name.textContent = p.productName;row.appendChild(name);
        const price = document.createElement('div');price.className='price';price.textContent = formatPrice(p.lineItemPrice);row.appendChild(price);
        
        const firmSplit = document.createElement('div');firmSplit.className='firm';
        const firmPercent = p.percentFirmSplit || 0;
        const firmAmount = (p.lineItemPrice || 0) * (firmPercent <= 1 ? firmPercent : firmPercent / 100);
        firmSplit.innerHTML = `<span class="percent">${formatPercent(firmPercent)}</span><span class="amount">${formatPrice(firmAmount)}</span>`;
        row.appendChild(firmSplit);
        
        const lawhiveSplit = document.createElement('div');lawhiveSplit.className='lawhive';
        const lawhivePercent = p.percentLawhiveSplit || 0;
        const lawhiveAmount = (p.lineItemPrice || 0) * (lawhivePercent <= 1 ? lawhivePercent : lawhivePercent / 100);
        lawhiveSplit.innerHTML = `<span class="percent">${formatPercent(lawhivePercent)}</span><span class="amount">${formatPrice(lawhiveAmount)}</span>`;
        row.appendChild(lawhiveSplit);
        
        const includedScope = document.createElement('div');
        includedScope.className='scope-list included-scope';
        includedScope.innerHTML = formatScopeList(p.includedScope);
        row.appendChild(includedScope);
        
        const excludedScope = document.createElement('div');
        excludedScope.className='scope-list excluded-scope';
        excludedScope.innerHTML = formatScopeList(p.excludedScope);
        row.appendChild(excludedScope);
        
        prodwrap.appendChild(row);
      }
      subwrap.appendChild(prodwrap);
      content.appendChild(subwrap);
    }
    cat.appendChild(content);
    
    header.addEventListener('click', () => {
      content.classList.toggle('collapsed');
      const icon = header.querySelector('.expand-icon');
      icon.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
    });
    
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
