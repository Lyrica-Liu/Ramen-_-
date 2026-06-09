import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '../VocabMemo/src/main/ingredients');
const OUT_DIR = path.join(__dirname, '../public');

const VALID = {
  broth:   ['tonkotsu', 'shoyu', 'miso', 'shio', 'spicymiso'],
  protein: ['chashu', 'chickenbreast', 'grilledtofu', 'porkshoulder', 'shrimptempura', 'steak'],
  veggies: ['bambooshoots', 'beansprouts', 'bokchoy', 'corn', 'spinach'],
  addons:  ['ajitama', 'chilioil', 'garlicchips', 'narutomaki', 'nori'],
};

const ZONES = {
  protein: { cx: 0.37, cy: 0.42, sizeFrac: 0.53 },
  veggies: { cx: 0.66, cy: 0.39, sizeFrac: 0.40, spread: 0.08 },
  addons:  { cx: 0.55, cy: 0.53, sizeFrac: 0.54, spread: 0.07 },
};

// Per-ingredient size multipliers relative to zone sizeFrac.
const SIZE_MULTIPLIERS = {
  'add_ajitama':        1.1,
  'add_chilioil':       0.6,
  'add_garlicchips':    0.7,
  'add_nori':           0.69,
  'veggies_bokchoy':     1.2,
  'veggies_beansprouts': 0.85,
  'veggies_corn':        1.1,
};

// Per-protein anchor overrides — content centroid will land here instead of the zone default.
const PROTEIN_ANCHORS = {
  'grilledtofu': { cx: 0.37, cy: 0.43, skipBowlConstraint: true },
};

// Per-protein size multipliers relative to zone sizeFrac.
const PROTEIN_SIZE_MULTIPLIERS = {
  'chickenbreast': 0.85,
  'chashu':        0.88,
};

// Bowl opening approximated as an ellipse (fractions of image size).
const BOWL = { cx: 0.50, cy: 0.38, rx: 0.40, ry: 0.30 };

function asset(name) {
  const p = path.join(ASSETS, name);
  if (!fs.existsSync(p)) {
    console.warn(`  [skip] missing: ${name}`);
    return null;
  }
  return p;
}

// Returns raw RGBA buffer with white background stripped if the image had no alpha.
async function toRGBA(filePath) {
  const meta = await sharp(filePath).metadata();
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (!meta.hasAlpha) {
    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
      if (r > 235 && g > 235 && b > 235) data[i * 4 + 3] = 0;
    }
  }
  return { data, info };
}

// Resize ingredient to targetSize×targetSize from an already-processed RGBA buffer.
async function resizeRGBA(data, info, targetSize) {
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(targetSize, targetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Compute x-offsets for N items spread around a zone center.
function spreadOffsets(count, spread) {
  if (count === 1) return [0];
  const total = (count - 1) * spread;
  return Array.from({ length: count }, (_, i) => Math.round(-total / 2 + i * spread));
}

// Build composite layer for the protein ingredient.
// Positions the canvas so the ingredient's content centroid always lands at the
// protein anchor (ZONES.protein.cx / cy), then shifts up only if the actual
// content bottom-left corner goes outside the bowl ellipse.
async function buildProteinLayer(name, baseW, baseH) {
  const filePath = asset(`protein_${name}.png`);
  if (!filePath) return null;

  const { data, info } = await toRGBA(filePath);
  const targetSize = Math.round(baseW * ZONES.protein.sizeFrac * (PROTEIN_SIZE_MULTIPLIERS[name] ?? 1));

  // Scan pixels to find content centroid and bounding box.
  let sumX = 0, sumY = 0, count = 0;
  let cL = info.width, cR = 0, cB = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 10) {
        sumX += x; sumY += y; count++;
        if (x < cL) cL = x;
        if (x > cR) cR = x;
        if (y > cB) cB = y;
      }
    }
  }
  if (count === 0) return null;

  const centX = sumX / count / info.width;
  const centY = sumY / count / info.height;
  const leftFrac   = cL / info.width;
  const rightFrac  = cR / info.width;
  const bottomFrac = cB / info.height;

  // Use per-protein anchor if defined, otherwise fall back to zone default.
  const anchor = PROTEIN_ANCHORS[name] ?? { cx: ZONES.protein.cx, cy: ZONES.protein.cy };
  let left = Math.round(anchor.cx * baseW - centX * targetSize);
  let top  = Math.round(anchor.cy * baseH - centY * targetSize);

  // Bowl edge check: shift up only if actual content corners exit the bowl.
  // Checks both bottom-left and bottom-right so centered proteins are handled correctly.
  // Skipped for proteins with skipBowlConstraint: true in PROTEIN_ANCHORS.
  if (!anchor.skipBowlConstraint) {
    const bottomY = (top + bottomFrac * targetSize) / baseH;
    function bowlShift(ptX) {
      const nx = (ptX - BOWL.cx) / BOWL.rx;
      if (Math.abs(nx) >= 1) return 0;
      const maxY = BOWL.cy + BOWL.ry * Math.sqrt(1 - nx * nx);
      return Math.max(0, bottomY - maxY);
    }
    const blX = (left + leftFrac  * targetSize) / baseW;
    const brX = (left + rightFrac * targetSize) / baseW;
    const shift = Math.max(bowlShift(blX), bowlShift(brX));
    if (shift > 0) top -= Math.round(shift * baseH);
  }

  left = Math.max(0, Math.min(baseW - targetSize, left));
  top  = Math.max(0, Math.min(baseH - targetSize, top));

  const buffer = await resizeRGBA(data, info, targetSize);
  return { input: buffer, blend: 'over', left, top };
}

// Build composite layers for one non-protein zone (veggies or add-ons).
async function zoneToLayers(names, prefix, zone, baseW, baseH) {
  const { cx, cy, sizeFrac, spread } = zone;
  const baseSize = Math.round(baseW * sizeFrac);
  const paths = names.map(n => asset(`${prefix}${n}.png`)).filter(Boolean);
  if (paths.length === 0) return [];

  const xOffsets = spreadOffsets(paths.length, Math.round(baseW * spread));
  const layers = [];

  for (let i = 0; i < paths.length; i++) {
    const key = `${prefix}${names[i]}`;
    const size = Math.round(baseSize * (SIZE_MULTIPLIERS[key] ?? 1));

    const centerX = Math.round(baseW * cx) + xOffsets[i];
    const centerY = Math.round(baseH * cy);

    const { data, info } = await toRGBA(paths[i]);
    const buf = await resizeRGBA(data, info, size);

    layers.push({
      input: buf,
      blend: 'over',
      left: Math.max(0, Math.min(baseW - size, centerX - Math.floor(size / 2))),
      top:  Math.max(0, Math.min(baseH - size, centerY - Math.floor(size / 2))),
    });
  }
  return layers;
}

async function compose({ broth, protein, veggies, addons }) {
  const errors = [];
  if (!VALID.broth.includes(broth))
    errors.push(`Unknown broth "${broth}". Valid: ${VALID.broth.join(', ')}`);
  if (protein && !VALID.protein.includes(protein))
    errors.push(`Unknown protein "${protein}". Valid: ${VALID.protein.join(', ')}`);
  veggies.forEach(v => {
    if (!VALID.veggies.includes(v))
      errors.push(`Unknown veggie "${v}". Valid: ${VALID.veggies.join(', ')}`);
  });
  addons.forEach(a => {
    if (!VALID.addons.includes(a))
      errors.push(`Unknown addon "${a}". Valid: ${VALID.addons.join(', ')}`);
  });
  if (errors.length) { errors.forEach(e => console.error('Error:', e)); process.exit(1); }

  const base = asset(`broth_${broth}.png`);
  if (!base) { console.error(`Error: broth_${broth}.png not found`); process.exit(1); }

  const { width, height } = await sharp(base).metadata();

  // Composite order: veggies (back) → protein → add-ons (front)
  const veggieLayers  = await zoneToLayers(veggies, 'veggies_', ZONES.veggies, width, height);
  const proteinLayer  = protein ? await buildProteinLayer(protein, width, height) : null;
  const addonLayers   = await zoneToLayers(addons, 'add_', ZONES.addons, width, height);

  const layers = [...veggieLayers, ...(proteinLayer ? [proteinLayer] : []), ...addonLayers];

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, 'custom-bowl.png');

  await sharp(base).composite(layers).toFile(outFile);
  console.log(`Bowl generated → ${outFile}`);
}

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => a.slice(2).split('='))
);

if (!args.broth) {
  console.error('Usage: node scripts/generate-bowl.mjs --broth=<type> [--protein=<type>] [--veggies=<a,b>] [--addons=<a,b>]');
  console.error('  broth:  ', VALID.broth.join(' | '));
  console.error('  protein:', VALID.protein.join(' | '));
  console.error('  veggies:', VALID.veggies.join(' | '));
  console.error('  addons: ', VALID.addons.join(' | '));
  process.exit(1);
}

compose({
  broth:   args.broth,
  protein: args.protein ?? null,
  veggies: args.veggies ? args.veggies.split(',').map(s => s.trim()) : [],
  addons:  args.addons  ? args.addons.split(',').map(s => s.trim())  : [],
});
