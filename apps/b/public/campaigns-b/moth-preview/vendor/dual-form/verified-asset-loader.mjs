/**
 * Hash bytes before decoding. Dependencies use the app's existing asset fetcher;
 * no network operation runs merely by importing this module.
 * decode(bytes, mime) must await image.decode() or createImageBitmap() and return
 * {image, width, height}. Never resolve from an img.src assignment alone.
 */
export function createVerifiedAssetLoader(dependencies) {
  // Lazy validation lets the scene gate receive failures and leave loading safely.
  // Calling this factory with malformed dependencies never starts I/O.
  return async (asset, url) => {
    if (!dependencies || typeof dependencies !== 'object' || typeof dependencies.fetchAsset !== 'function' || typeof dependencies.sha256 !== 'function' || typeof dependencies.decode !== 'function') throw new TypeError('Asset loader requires fetchAsset, sha256 and decode functions');
    if (!asset || typeof asset !== 'object' || typeof asset.assetId !== 'string' || typeof url !== 'string' || !url) throw new TypeError('Asset loader requires an asset and URL');
    const {fetchAsset,sha256,decode}=dependencies;
    const response=await fetchAsset(url,{cache:'force-cache'});
    if (!response?.ok) throw new Error(`Asset request failed: ${asset.assetId}`);
    if (typeof response.arrayBuffer !== 'function') throw new TypeError(`Asset response body is missing: ${asset.assetId}`);
    const bytes=await response.arrayBuffer();
    const hash=await sha256(bytes);
    if(hash!==asset.sha256) throw new Error(`SHA-256 mismatch: ${asset.assetId}`);
    const result=await decode(bytes,asset.mime);
    if(!result?.image || result.width!==asset.width || result.height!==asset.height) throw new Error(`Decoded dimensions mismatch: ${asset.assetId}`);
    return {...result,sha256:hash};
  };
}
