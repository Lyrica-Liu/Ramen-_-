import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '../VocabMemo/src/main/ingredients');
const OUT_DIR = path.join(__dirname, '../public');

const VALID = {
  broth:   ['tonkotsu', 'shoyu', 'miso', 'shio'],
  protein: ['chashu', 'egg', 'tofu', 'chicken'],
  topping: ['nori', 'corn', 'scallions', 'bamboo', 'mushrooms', 'beansprouts'],
};

function asset(name) {
  const p = path.join(ASSETS, name);
  if (!fs.existsSync(p)) {
    console.warn(`  [skip] missing asset: ${name}`);
    return null;
  }
  return p;
}

async function compose({ broth, protein, toppings }) {
  const errors = [];
  if (!VALID.broth.includes(broth))   errors.push(`Unknown broth "${broth}". Valid: ${VALID.broth.join(', ')}`);
  if (protein && !VALID.protein.includes(protein)) errors.push(`Unknown protein "${protein}". Valid: ${VALID.protein.join(', ')}`);
  toppings.forEach(t => { if (!VALID.topping.includes(t)) errors.push(`Unknown topping "${t}". Valid: ${VALID.topping.join(', ')}`); });
  if (errors.length) { errors.forEach(e => console.error('Error:', e)); process.exit(1); }

  const base = asset(`broth_${broth}.png`);
  if (!base) { console.error(`Error: broth_${broth}.png not found in`, ASSETS); process.exit(1); }

  // Layer order: noodles → protein → toppings (broth is the base)
  const layers = [
    asset('noodles.png'),
    protein ? asset(`protein_${protein}.png`) : null,
    ...toppings.map(t => asset(`topping_${t}.png`)),
  ].filter(Boolean).map(input => ({ input, blend: 'over' }));

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, 'custom-bowl.png');

  await sharp(base).composite(layers).toFile(outFile);
  console.log(`Bowl generated → ${outFile}`);
}

// Parse --key=value args
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);

if (!args.broth) {
  console.error('Usage: node scripts/generate-bowl.mjs --broth=<type> [--protein=<type>] [--toppings=<a,b,c>]');
  console.error('  broth:   ', VALID.broth.join(' | '));
  console.error('  protein: ', VALID.protein.join(' | '));
  console.error('  toppings:', VALID.topping.join(' | '));
  process.exit(1);
}

compose({
  broth:    args.broth,
  protein:  args.protein ?? null,
  toppings: args.toppings ? args.toppings.split(',').map(s => s.trim()) : [],
});
