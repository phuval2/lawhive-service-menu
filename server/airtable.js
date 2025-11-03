import dotenv from 'dotenv';import dotenv from 'dotenv';



dotenv.config();dotenv.config();



const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';const AIRTABLE_BASE = process.env.AIRTABLE_BASE || 'appHuFySGdecIs6Cq';

const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';const TABLE_NAME = process.env.AIRTABLE_TABLE || 'Master Products';



function field(record, ...names) {function field(record, ...names) {

  for (const n of names) {  for (const n of names) {

    if (record.fields && record.fields[n] !== undefined) return record.fields[n];    if (record.fields && record.fields[n] !== undefined) return record.fields[n];

  }  }

  return undefined;  return undefined;

}}



// For local dev: if AIRTABLE_TOKEN is not set, return a small sample datasetexport async function getProducts() {

const SAMPLE = [  if (!AIRTABLE_TOKEN) throw new Error('Missing AIRTABLE_TOKEN in environment');

  {

    id: 'recSample1',  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;

    parentCategory: 'Corporate',

    subCategory: 'Formation',  let records = [];

    productName: 'LLC Formation',  let offset = null;

    includedScope: 'Prepare articles; file with state',

    excludedScope: 'Registered agent fees',  try {

    lineItemPrice: 500,    do {

    percentFirmSplit: 60,      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;

    percentLawhiveSplit: 40      const resp = await fetch(url, {

  },        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }

  {      });

    id: 'recSample2',

    parentCategory: 'Agreements',      if (!resp.ok) {

    subCategory: 'Contracts',        const text = await resp.text();

    productName: 'Employment Agreement (standard)',        throw new Error(`Airtable response ${resp.status}: ${text}`);

    includedScope: 'Drafting up to 2 rounds',      }

    excludedScope: 'Litigation or negotiation beyond scope',

    lineItemPrice: 1200,      const data = await resp.json();

    percentFirmSplit: 70,      if (!data.records) break;

    percentLawhiveSplit: 30

  }      records.push(...data.records);

];      offset = data.offset;

    } while (offset);

export async function getProducts() {

  if (!AIRTABLE_TOKEN) {    // Map to desired output fields with sensible fallbacks

    // Return sample so UI can be developed without secrets    const mapped = records.map(r => {

    return SAMPLE;      return {

  }        id: r.id,

        parentCategory: field(r, 'Parent Category', 'Category'),

  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(TABLE_NAME)}`;        subCategory: field(r, 'Sub Category', 'SubCategory', 'Sub-Category') || 'Uncategorized',

        productName: field(r, 'Product Name', 'Name') || '',

  let records = [];        includedScope: field(r, 'Included Scope', 'Included') || '',

  let offset = null;        excludedScope: field(r, 'Excluded Scope', 'Excluded') || '',

        lineItemPrice: field(r, 'Line item price', 'Line item price (Number)', 'Price') || '',

  try {        percentFirmSplit: field(r, '% Firm Split', 'Firm Split') || '',

    do {        percentLawhiveSplit: field(r, '%Lawhive Split', '% Lawhive Split', 'Lawhive Split') || ''

      const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;      };

      const resp = await fetch(url, {    }).filter(p => p.parentCategory && p.productName);

        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }

      });    return mapped;

  } catch (err) {

      if (!resp.ok) {    console.error('Error fetching Airtable records:', err);

        const text = await resp.text();    throw err;

        throw new Error(`Airtable response ${resp.status}: ${text}`);  }

      }}


      const data = await resp.json();
      if (!data.records) break;

      records.push(...data.records);
      offset = data.offset;
    } while (offset);

    // Map to desired output fields with sensible fallbacks
    const mapped = records.map(r => {
      return {
        id: r.id,
        parentCategory: field(r, 'Parent Category', 'Category') || 'Uncategorized',
        subCategory: field(r, 'Sub Category', 'SubCategory', 'Sub-Category') || 'Uncategorized',
        productName: field(r, 'Product Name', 'Name') || '',
        includedScope: field(r, 'Included Scope', 'Included') || '',
        excludedScope: field(r, 'Excluded Scope', 'Excluded') || '',
        lineItemPrice: field(r, 'Line item price', 'Line item price (Number)', 'Price') || '',
        percentFirmSplit: field(r, '% Firm Split', 'Firm Split') || '',
        percentLawhiveSplit: field(r, '%Lawhive Split', '% Lawhive Split', 'Lawhive Split') || ''
      };
    }).filter(p => p.parentCategory && p.productName);

    return mapped;
  } catch (err) {
    console.error('Error fetching Airtable records:', err);
    throw err;
  }
}
