(() => {
  const nativeFetch = window.fetch.bind(window);
  const target = '/assets/anime/map/atlases/v8/generated-v8-01.b64';
  const revision = 'v83';
  const chunks = [
    'generated-v8-01.b64',
    'generated-v8-02a.b64',
    'generated-v8-02b.b64',
    'generated-v8-03.b64',
    'generated-v8-04.b64',
    'generated-v8-05.b64',
    'generated-v8-06.b64'
  ].map((name) => `/assets/anime/map/atlases/v8/${name}?rev=${revision}`);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (!url || !url.endsWith(target)) return nativeFetch(input, init);

    const parts = await Promise.all(chunks.map(async (chunkUrl) => {
      const response = await nativeFetch(chunkUrl, { ...init, cache: 'reload' });
      if (!response.ok) throw new Error(`V8 图集分块加载失败：${chunkUrl} (HTTP ${response.status})`);
      return (await response.text()).trim();
    }));

    return new Response(parts.join(''), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  };
})();