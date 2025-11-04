// Netlify Function: getCategories
// Reads AIRTABLE_TOKEN from Netlify env vars, proxies Airtable Master Products table

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';
const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';

const SAMPLE = [
  {
    id: 'recSample1',
    parentCategory: 'Intellectual Property',
    subCategory: 'Trademark',
    productName: 'Basic Trademark Application: In Use',
    includedScope: '- Direct hit search\n- 30 minute consultation with attorney\n- Review and recommendations',
    excludedScope: '- Any search beyond a direct hit',
    lineItemPrice: 549,
    percentFirmSplit: 70,
    percentLawhiveSplit: 30
  }
];

export async function handler(event, context) {
  const headersOut = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!AIRTABLE_TOKEN) {
    return {
      statusCode: 200,
      headers: headersOut,
      body: JSON.stringify(SAMPLE)
    };
  }

  try {
    const base = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;
    let records = [];
    let offset = null;

    do {
      const url = offset ? `${base}?offset=${offset}` : base;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
      if (!resp.ok) {
        const text = await resp.text();
        return { statusCode: resp.status, headers: headersOut, body: text };
      }
      const data = await resp.json();
      if (data.records && data.records.length) records.push(...data.records);
      offset = data.offset;
    } while (offset);

    // Map Airtable records to desired shape
    const mapped = records.map(r => {
      const f = name => (r.fields && r.fields[name] !== undefined) ? r.fields[name] : undefined;
      return {
        id: r.id,
        parentCategory: f('Category') || f('Parent Category') || '',
        subCategory: f('Sub Category') || f('Subcategory') || '',
        productName: f('Product Name') || f('Name') || '',
        includedScope: f('Included Scope') || '',
        excludedScope: f('Excluded Scope') || '',
        lineItemPrice: f('Line item price') || f('Price') || 0,
        percentFirmSplit: f('% Firm Split') || f('Firm Split') || 0,
        percentLawhiveSplit: f('% Lawhive Split') || f('Lawhive Split') || 0
      };
    }).filter(p => p.productName);

    return {
      statusCode: 200,
      headers: headersOut,
      body: JSON.stringify(mapped)
    };
  } catch (err) {
    console.error('Error fetching Airtable:', err);
    return {
      statusCode: 500,
      headers: headersOut,
      body: JSON.stringify({ error: String(err) })
    };
  }
}
