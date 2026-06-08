---
name: ramen-bowl
description: Generate a customized ramen bowl image by compositing PNG layers
---

Ask the user to customize their ramen bowl by choosing from the options below.
Present the choices clearly and wait for their selections.

## Options

**Broth** (pick one — required, includes the bowl):
- `tonkotsu` — rich creamy white pork broth
- `shoyu` — clear brown soy sauce broth
- `miso` — cloudy golden miso broth
- `shio` — pale clear salt broth

**Protein** (pick one — optional):
- `chashu` — braised pork belly
- `egg` — soft-boiled marinated egg
- `tofu` — silken tofu
- `chicken` — poached chicken

**Toppings** (pick any combination):
- `nori` — dried seaweed sheet
- `corn` — sweet corn kernels
- `scallions` — sliced green onions
- `bamboo` — bamboo shoots
- `mushrooms` — shiitake or wood-ear mushrooms
- `beansprouts` — fresh bean sprouts

## After the user chooses

Run this command with their selections:

!node scripts/generate-bowl.mjs --broth=<broth> --protein=<protein> --toppings=<topping1,topping2>

Omit `--protein` if they chose none. Omit `--toppings` if they chose none.

Example (tonkotsu, chashu, nori + scallions):
!node scripts/generate-bowl.mjs --broth=tonkotsu --protein=chashu --toppings=nori,scallions

After the command runs, tell the user their bowl was saved to `public/custom-bowl.png`.
Let them know which assets were skipped (missing PNGs) — they go in `VocabMemo/src/main/ingredients/`.
