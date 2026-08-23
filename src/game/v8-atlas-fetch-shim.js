(() => {
  const nativeFetch = window.fetch.bind(window);
  const target = '/assets/anime/map/atlases/v8/generated-v8-01.b64';
  const chunks = [1, 2, 3, 4, 5, 6].map((index) =>
    `/assets/anime/map/atlases/v8/generated-v8-${String(index).padStart(2, '0')}.b64`
  );

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (!url || !url.endsWith(target)) return nativeFetch(input, init);

    const parts = await Promise.all(chunks.map(async (chunkUrl) => {
      const response = await nativeFetch(chunkUrl, { ...init, cache: 'force-cache' });
      if (!response.ok) throw new Error(`V8 图集分块加载失败：${chunkUrl} (HTTP ${response.status})`);
      return (await response.text()).trim();
    }));

    return new Response(parts.join(''), {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  };
})();
