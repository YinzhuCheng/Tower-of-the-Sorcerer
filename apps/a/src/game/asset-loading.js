export const ASSET_LOAD_TIMEOUT_MS = 20_000;

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
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = url;
  });
}
