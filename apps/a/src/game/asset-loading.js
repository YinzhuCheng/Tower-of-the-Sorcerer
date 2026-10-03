export const ASSET_LOAD_TIMEOUT_MS = 20_000;

// A downloaded image is not ready to reveal until decoding has completed.
export function loadImage(url, { timeoutMs = ASSET_LOAD_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    image.decoding = 'async';
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode();
        finish(image.naturalWidth > 0 && image.naturalHeight > 0 ? image : null);
      } catch { finish(null); }
    };
    image.onerror = () => finish(null);
    image.src = url;
  });
}

export async function fetchAsset(url, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ASSET_LOAD_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`素材加载失败：${url} (HTTP ${response.status})`);
    // Include response-body reading in the timeout, not only the headers.
    const text = await response.text();
    return { ok: true, json: () => JSON.parse(text), text: () => text };
  } finally { window.clearTimeout(timer); }
}
