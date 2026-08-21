const INDIVIDUAL = Object.freeze({
  cat_scout: 'catScout',
  cat_mage: 'catMage',
  fox_acolyte: 'foxAcolyte',
  fox_archer: 'foxArcher',
  whale_singer: 'whaleSinger'
});

const BUNDLES = Object.freeze([
  {
    file: 'bundle0.json',
    portraits: {
      tide_lancer: 'tideLancer',
      sword_apprentice: 'swordApprentice',
      sword_knight: 'swordKnight',
      dragon_whelp: 'dragonWhelp',
      flame_caster: 'flameCaster'
    }
  },
  {
    file: 'bundle1.json',
    portraits: {
      void_priestess: 'voidPriestess',
      shadow_boss: 'shadowBoss',
      mirror_doll: 'mirrorDoll',
      astral_boss: 'astralBoss',
      cat_boss: 'catBoss'
    }
  },
  {
    file: 'bundle2.json',
    portraits: {
      fox_boss: 'foxBoss',
      whale_boss: 'whaleBoss',
      dragon_boss: 'dragonBoss',
      silence_guard: 'silenceGuard',
      eclipse_mage: 'eclipseMage'
    }
  }
]);

const urls = new Map();
let preloadPromise = null;

function toDataUrl(base64) {
  return `data:image/webp;base64,${base64}`;
}

async function loadText(path) {
  const response = await fetch(path, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`敌人素材加载失败：${path}`);
  return (await response.text()).trim();
}

export async function preloadEnemyAssets() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = Promise.all([
    ...Object.entries(INDIVIDUAL).map(async ([portrait, id]) => {
      try {
        const base64 = await loadText(`/assets/anime/b64/enemies/${id}.b64`);
        urls.set(portrait, toDataUrl(base64));
      } catch (error) {
        console.warn(error);
      }
    }),
    ...BUNDLES.map(async ({ file, portraits }) => {
      try {
        const payload = JSON.parse(await loadText(`/assets/anime/b64/enemies/${file}`));
        for (const [portrait, id] of Object.entries(portraits)) {
          if (payload[id]) urls.set(portrait, toDataUrl(payload[id]));
        }
      } catch (error) {
        console.warn(error);
      }
    })
  ]).then(() => urls);
  return preloadPromise;
}

export function getEnemyAsset(portrait) {
  return urls.get(portrait) ?? null;
}

export function hasEnemyAsset(portrait) {
  return urls.has(portrait);
}
