const fetch = require('node-fetch');// Netlify Function to proxy Airtable Master Products table// using global fetch (available in modern Node runtimes)



const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;// Reads AIRTABLE_TOKEN (and optional AIRTABLE_BASE / AIRTABLE_TABLE) from Netlify env vars

const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';

const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';// Netlify Function: proxies Airtable Master Products table



exports.handler = async function(event, context) {exports.handler = async function (event, context) {// Expects AIRTABLE_TOKEN and optional AIRTABLE_BASE/AIRTABLE_TABLE set in Netlify env vars

  if (!AIRTABLE_TOKEN) {

    return {  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

      statusCode: 500,

      body: JSON.stringify({ error: 'Missing AIRTABLE_TOKEN environment variable' })  const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

    };

  }  const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';



  try {const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';

    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;

    let records = [];  const headers = {

    let offset = null;

    'Content-Type': 'application/json',function field(record, ...names) {

    do {

      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;    'Access-Control-Allow-Origin': '*'  for (const n of names) {

      const resp = await fetch(url, {

        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }  };    if (record.fields && record.fields[n] !== undefined) return record.fields[n];

      });

  }

      if (!resp.ok) {

        const text = await resp.text();  // Sample fallback data when no token set (useful for preview)  return undefined;

        throw new Error(`Airtable response ${resp.status}: ${text}`);

      }  const SAMPLE = [}



      const data = await resp.json();    {

      offset = data.offset;

      id: 'recSample1',export async function handler(event, context) {

      records = records.concat(data.records.map(record => ({

        id: record.id,      parentCategory: 'Corporate',  if (!AIRTABLE_TOKEN) {

        parentCategory: record.fields['Parent Category'] || '',

        subCategory: record.fields['Sub Category'] || '',      subCategory: 'Formation',    return { statusCode: 500, body: JSON.stringify({ error: 'Missing AIRTABLE_TOKEN in environment' }) };

        productName: record.fields['Product Name'] || '',

        includedScope: record.fields['Included Scope'] || '',      productName: 'LLC Formation',  }

        excludedScope: record.fields['Excluded Scope'] || '',

        lineItemPrice: record.fields['Line Item Price'] || 0,      includedScope: 'Prepare articles; file with state',

        percentFirmSplit: record.fields['% Firm Split'] || 0,

        percentLawhiveSplit: record.fields['% Lawhive Split'] || 0      excludedScope: 'Registered agent fees',  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;

      })));

    } while (offset);      lineItemPrice: 500,  let records = [];



    return {      percentFirmSplit: 60,  let offset = null;

      statusCode: 200,

      headers: {      percentLawhiveSplit: 40

        'Content-Type': 'application/json',

        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes    }  try {

      },

      body: JSON.stringify(records)  ];    do {

    };

  } catch (error) {      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;

    console.error('Error:', error);

    return {  if (!AIRTABLE_TOKEN) {      const resp = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });

      statusCode: 500,

      body: JSON.stringify({ error: error.message })    return {      if (!resp.ok) {

    };

  }      statusCode: 200,        const text = await resp.text();

};
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
