// Netlify Function to proxy Airtable Master Products table// using global fetch (available in modern Node runtimes)

// Reads AIRTABLE_TOKEN (and optional AIRTABLE_BASE / AIRTABLE_TABLE) from Netlify env vars

// Netlify Function: proxies Airtable Master Products table

exports.handler = async function (event, context) {// Expects AIRTABLE_TOKEN and optional AIRTABLE_BASE/AIRTABLE_TABLE set in Netlify env vars

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';

const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';

  const headers = {

    'Content-Type': 'application/json',function field(record, ...names) {

    'Access-Control-Allow-Origin': '*'  for (const n of names) {

  };    if (record.fields && record.fields[n] !== undefined) return record.fields[n];

  }

  // Sample fallback data when no token set (useful for preview)  return undefined;

  const SAMPLE = [}

    {

      id: 'recSample1',export async function handler(event, context) {

      parentCategory: 'Corporate',  if (!AIRTABLE_TOKEN) {

      subCategory: 'Formation',    return { statusCode: 500, body: JSON.stringify({ error: 'Missing AIRTABLE_TOKEN in environment' }) };

      productName: 'LLC Formation',  }

      includedScope: 'Prepare articles; file with state',

      excludedScope: 'Registered agent fees',  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;

      lineItemPrice: 500,  let records = [];

      percentFirmSplit: 60,  let offset = null;

      percentLawhiveSplit: 40

    }  try {

  ];    do {

      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;

  if (!AIRTABLE_TOKEN) {      const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });

    return {      if (!resp.ok) {

      statusCode: 200,        const text = await resp.text();

      headers,        return { statusCode: resp.status, body: text };

      body: JSON.stringify(SAMPLE)      }

    };      const data = await resp.json();

  }      if (!data.records) break;

      records.push(...data.records);

  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;      offset = data.offset;

    } while (offset);

  try {

    let records = [];    const mapped = records.map(r => ({

    let offset = null;      id: r.id,

    do {      parentCategory: field(r, 'Parent Category', 'Category'),

      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;      subCategory: field(r, 'Sub Category', 'SubCategory', 'Sub-Category') || 'Uncategorized',

      const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });      productName: field(r, 'Product Name', 'Name') || '',

      if (!resp.ok) {      includedScope: field(r, 'Included Scope', 'Included') || '',

        const text = await resp.text();      excludedScope: field(r, 'Excluded Scope', 'Excluded') || '',

        return { statusCode: resp.status, headers, body: JSON.stringify({ error: text }) };      lineItemPrice: field(r, 'Line item price', 'Price') || '',

      }      percentFirmSplit: field(r, '% Firm Split', 'Firm Split') || '',

      const data = await resp.json();      percentLawhiveSplit: field(r, '%Lawhive Split', '% Lawhive Split', 'Lawhive Split') || ''

      if (!data.records) break;    })).filter(p => p.parentCategory && p.productName);

      records.push(...data.records);

      offset = data.offset;    return {

    } while (offset);      statusCode: 200,

      headers: { 'Cache-Control': 'public, max-age=60', 'Content-Type': 'application/json' },

    // map fields      body: JSON.stringify(mapped)

    const field = (r, ...names) => {    };

      for (const n of names) if (r.fields && r.fields[n] !== undefined) return r.fields[n];  } catch (err) {

      return undefined;    console.error('Netlify function error fetching Airtable:', err);

    };    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch Airtable records' }) };

  }

    const mapped = records.map(r => ({}

      id: r.id,
      parentCategory: field(r, 'Parent Category', 'Category') || 'Uncategorized',
      subCategory: field(r, 'Sub Category', 'SubCategory', 'Sub-Category') || 'Uncategorized',
      productName: field(r, 'Product Name', 'Name') || '',
      includedScope: field(r, 'Included Scope', 'Included') || '',
      excludedScope: field(r, 'Excluded Scope', 'Excluded') || '',
      lineItemPrice: field(r, 'Line item price', 'Line item price (Number)', 'Price') || '',
      percentFirmSplit: field(r, '% Firm Split', 'Firm Split') || '',
      percentLawhiveSplit: field(r, '%Lawhive Split', '% Lawhive Split', 'Lawhive Split') || ''
    })).filter(p => p.productName);

    return { statusCode: 200, headers, body: JSON.stringify(mapped) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
};
