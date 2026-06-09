---
name: ramen-bowl
description: Generate a customized ramen bowl image by compositing PNG ingredient layers
---

Ask the user to customize their ramen bowl. Present each category clearly and wait for their selections.

## Options

**Broth** (pick one — required, includes the bowl):
- `tonkotsu` — rich creamy pork broth
- `shoyu` — clear soy sauce broth
- `miso` — golden miso broth
- `shio` — pale clear salt broth
- `spicymiso` — spicy miso broth

**Protein** (pick one — optional):
- `chashu` — braised pork belly
- `chickenbreast` — poached chicken
- `grilledtofu` — grilled tofu
- `porkshoulder` — pork shoulder
- `shrimptempura` — shrimp tempura
- `steak` — beef steak

**Veggies** (pick any):
- `bambooshoots`, `beansprouts`, `bokchoy`, `corn`, `spinach`

**Add-ons** (pick any):
- `ajitama` — marinated soft egg
- `chilioil` — chili oil drizzle
- `garlicchips` — crispy garlic chips
- `narutomaki` — fish cake swirl
- `nori` — dried seaweed

## After the user chooses

Run this command (omit flags for unpicked categories):

!node scripts/generate-bowl.mjs --broth=<broth> --protein=<protein> --veggies=<v1,v2> --addons=<a1,a2>

Example (spicy miso, chashu, corn + bokchoy, ajitama + nori):
!node scripts/generate-bowl.mjs --broth=spicymiso --protein=chashu --veggies=corn,bokchoy --addons=ajitama,nori

After it runs, tell the user their bowl was saved to `public/custom-bowl.png`.
Note any skipped ingredients (missing PNGs) — assets live in `VocabMemo/src/main/ingredients/`.
