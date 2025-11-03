import express from "express";import express from "express";

import dotenv from "dotenv";import dotenv from "dotenv";

import path from "path";import path from "path";

import { fileURLToPath } from "url";import { fileURLToPath } from "url";

import { getProducts } from "./airtable.js";import { getProducts } from "./airtable.js";



dotenv.config();dotenv.config();



const __filename = fileURLToPath(import.meta.url);const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);const __dirname = path.dirname(__filename);



// Debug: show whether AIRTABLE_TOKEN is present (masked) to help local troubleshooting// Debug: show whether AIRTABLE_TOKEN is present (masked) to help local troubleshooting

const maskedToken = process.env.AIRTABLE_TOKEN ? `${process.env.AIRTABLE_TOKEN.slice(0,6)}...` : null;const maskedToken = process.env.AIRTABLE_TOKEN ? `${process.env.AIRTABLE_TOKEN.slice(0,6)}...` : null;

console.log('AIRTABLE_TOKEN present:', maskedToken ? maskedToken : 'no');console.log('AIRTABLE_TOKEN present:', maskedToken ? maskedToken : 'no');



const app = express();const app = express();

const PORT = process.env.PORT || 3000;const PORT = process.env.PORT || 3001;



// Serve static frontend// Serve static frontend

app.use(express.static(path.join(__dirname, "..", "public")));app.use(express.static(path.join(__dirname, "..", "public")));



// API: proxy to Airtable// API: proxy to Airtable

app.get('/api/products', async (req, res) => {app.get('/api/products', async (req, res) => {

  try {  try {

    const products = await getProducts();    const products = await getProducts();

    // Minimal caching    // Minimal caching

    res.set('Cache-Control', 'public, max-age=60');    res.set('Cache-Control', 'public, max-age=60');

    res.json(products);    res.json(products);

  } catch (err) {  } catch (err) {

    console.error('Error in /api/products:', err);    console.error('Error in /api/products:', err);

    res.status(500).json({ error: 'Failed to fetch products' });    res.status(500).json({ error: 'Failed to fetch products' });

  }  }

});});



// Fallback to index.html for SPA-like behavior// Fallback to index.html for SPA-like behavior

app.get('*', (req, res) => {app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));

});});



app.listen(PORT, () => {app.listen(PORT, () => {

  console.log(`Service menu server listening on http://localhost:${PORT}`);  console.log(`Service menu server listening on http://localhost:${PORT}`);

});});

