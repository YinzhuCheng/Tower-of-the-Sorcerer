// Byte-identical, accepted canonical runtime face crops; no A gameplay dependency.
export const FOREST_CAST_ART = Object.freeze({
  "hero": {
    "name": "璃",
    "file": "assets/forest-canonical/hero-avatar.webp",
    "sha256": "3a077f2acf3357b1b69d8a0073ff04a5fdc0de4d132973965d892dd7bebfc756",
    "width": 512,
    "height": 512
  },
  "merchant": {
    "name": "珂珂",
    "file": "assets/forest-canonical/merchant-avatar.webp",
    "sha256": "7b471c82c9cab45e524020277b6ae4ad19e6f4dae81695b550513e7fb2f52902",
    "width": 512,
    "height": 512
  },
  "guide": {
    "name": "纱雾",
    "file": "assets/forest-canonical/guide-avatar.webp",
    "sha256": "e7d359301060c0880f70ecbe04aee48785049aa5ce3e0b31c90a51843745b87a",
    "width": 512,
    "height": 512
  },
  "cat_boss": {
    "name": "米露",
    "file": "assets/forest-canonical/cat_boss-avatar.webp",
    "sha256": "b17f918c2dcdbac6ce302a8a129272342386da2227262e4d82ca270dae22249b",
    "width": 512,
    "height": 512
  }
});
export const FOREST_CHARACTER_ASSETS = Object.values(FOREST_CAST_ART);
export function forestPortrait(turn) { if (turn?.stage?.portraitAllowed === false) return null; return FOREST_CAST_ART[turn?.portrait] ?? null; }
export function applyForestPortrait(image, turn) {
 const art = forestPortrait(turn); image.hidden = !art;
 if (!art) return null;
 image.src = new URL('../../' + art.file, import.meta.url).href; image.alt = art.name + ' · 已验收角色头像';
 image.dataset.characterId = turn.portrait;
 image.onerror = () => { image.hidden = true; };
 return art;
}
