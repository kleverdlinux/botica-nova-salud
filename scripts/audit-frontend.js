import fs from 'fs';
import path from 'path';

// 1. Audit products.ts
const productsContent = fs.readFileSync('./frontend/src/data/products.ts', 'utf8');

// Check duplicate slugs or IDs
const slugMatches = [...productsContent.matchAll(/slug:\s*["']([^"']+)["']/g)].map(m => m[1]);
const idMatches = [...productsContent.matchAll(/id:\s*["']([^"']+)["']/g)].map(m => m[1]);

console.log('Total slugs found:', slugMatches.length);
console.log('Total IDs found:', idMatches.length);

const duplicateSlugs = slugMatches.filter((s, i) => slugMatches.indexOf(s) !== i);
console.log('Duplicate slugs:', duplicateSlugs);

const duplicateIds = idMatches.filter((id, i) => idMatches.indexOf(id) !== i);
console.log('Duplicate IDs:', duplicateIds);
