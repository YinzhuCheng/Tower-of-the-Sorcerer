import { getMapAsset, preloadMapAssets } from './map-assets.js';

const CARD_UI_ASSET = Object.freeze({
  sun: 'card-sun-ui-v4',
  moon: 'card-moon-ui-v4',
  star: 'card-star-ui-v4'
});

function installStyles() {
  const style = document.createElement('style');
  style.dataset.visualCleanup = 'v7';
  style.textContent = `
    .story-dialogue.dialogue-grid{display:block}
    .story-dialogue.dialogue-grid>img{display:none!important}
    .story-dialogue .dialogue-copy{max-width:760px}
    .story-dialogue .dialogue-copy strong{display:block;margin-bottom:8px;font-size:1rem}
    .story-dialogue .dialogue-copy p{margin:0;font-size:1rem;line-height:2}
    .card-token span.card-art-v7{background-color:transparent!important;background-repeat:no-repeat!important;background-position:center!important;background-size:contain!important;color:transparent!important;border-radius:5px;filter:drop-shadow(0 2px 5px rgba(0,0,0,.35))}
  `;
  document.head.append(style);
}

function imageUrl(source) {
  if (!source) return null;
  if (typeof source.toDataURL === 'function') return source.toDataURL('image/png');
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  if (!width || !height) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(source, 0, 0);
  return canvas.toDataURL('image/png');
}

async function hydrateCardHud() {
  await preloadMapAssets();
  for (const [kind, assetName] of Object.entries(CARD_UI_ASSET)) {
    const target = document.querySelector(`.card-token.${kind} span`);
    const source = getMapAsset(assetName);
    const url = imageUrl(source);
    if (!target || !url) {
      console.error(`[V7] HUD 卡牌素材未加载: card=${kind}, asset=${assetName}`);
      continue;
    }
    target.classList.add('card-art-v7');
    target.style.backgroundImage = `url("${url}")`;
    target.textContent = '';
    target.setAttribute('aria-label', `${kind} card`);
  }
}

function updateDialogueLayout() {
  const root = document.getElementById('modal-root');
  const body = document.getElementById('modal-body');
  const kicker = document.getElementById('modal-kicker');
  if (!root || !body || !kicker) return;

  const grid = body.querySelector('.dialogue-grid');
  if (!grid) return;
  const isShop = kicker.textContent.includes('商店') || kicker.textContent.includes('珂珂');
  grid.classList.toggle('story-dialogue', !isShop);
}

function observeModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  const observer = new MutationObserver(updateDialogueLayout);
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  updateDialogueLayout();
}

installStyles();
observeModal();
hydrateCardHud().catch((error) => console.error('[V7] HUD 卡牌初始化失败', error));
