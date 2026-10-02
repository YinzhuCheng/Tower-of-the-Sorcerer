// Root-only packaging for the historical A/B/C candidate. App sources stay intact.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
// Each historical app keeps its own build semantics and output directory.
const built = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build:apps'], {
  cwd: root, stdio: 'inherit'
});
if (built.error) throw built.error;
if (built.status !== 0) process.exit(built.status ?? 1);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const [app, dir] of [['a', 'dist'], ['b', 'dist-b-preview'], ['c', 'dist']]) {
  await cp(join(root, 'apps', app, dir), join(out, app), { recursive: true });
}

// A's historical files assume an origin-root deployment. Rewrite ONLY copied
// output URL prefixes (including manifest basePath values); do not use <base>,
// which cannot fix origin-absolute URLs and would change relative URL semantics.
// B/C already use relative module, import-map and import.meta.url asset paths.
const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.json']);
const roots = 'assets/|src/|gal-only/|art-audit/|favicon\\.svg|(?:styles|anime|ui-v8-4|ui-v8-5|ui-v10-cinematics)\\.css';
const prefix = new RegExp('(["\'`(=])/(?!/)(?=' + roots + ')', 'g');
let changedFiles = 0;
async function rebaseA(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) { await rebaseA(path); continue; }
    if (!textExtensions.has(extname(path))) continue;
    const original = await readFile(path, 'utf8');
    let result = original.replace(prefix, '$1/a/');
    // Navigation back to A, not the candidate selector. Do not rewrite '/' in
    // generic path-normalization code such as endsWith('/').
    if (extname(path) === '.html') result = result.replace(/(href=["'])\/(?=["'])/g, '$1/a/');
    if (extname(path) === '.js') result = result.replace(/(["'`])\/(?=\?)/g, '$1/a/');
    if (result !== original) { await writeFile(path, result); changedFiles += 1; }
  }
}
await rebaseA(join(out, 'a'));

await writeFile(join(out, 'index.html'), `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>魔塔 · 历史骨架候选</title>
<style>body{font:18px/1.7 system-ui,sans-serif;max-width:760px;margin:4rem auto;padding:0 1.5rem;color:#253246;background:#f7f8fa}h1{line-height:1.3}li{margin:1.2rem 0}a{color:#174d95}small{color:#556274}</style></head>
<body><h1>魔塔 · 历史骨架候选</h1><p>从历史来源重建的 A / B / C 独立预览入口。不是失落的最新本地版本，也不代表最终美术验收。</p>
<ul><li><a href="/a/">A · 少女魔塔</a><br><small>历史核心保留，猫书房已接入确认背景；完整美术验收尚未完成。</small></li>
<li><a href="/b/campaigns-b/">B · 山路把冬天带回家</a><br><small>B01–B03 连续世界几何技术试作，镜头跟随静态角色；可切回旧美术或格子模式，尚非最终自然风格美术。</small></li>
<li><a href="/c/campaigns/">C · 双灯夜航</a><br><small>固定视角试作，暂用几何色块；六张历史材质缺失，实机 WebGL、遮挡及性能尚未验收。</small></li></ul>
<p>本页只统一入口与静态文件路径。发布是否成功、实际画面、玩法和存读档仍需在可访问的浏览器中逐项验证。</p></body></html>\n`);
console.log(`Historical candidate packaged in dist; ${changedFiles} generated A text files rebased; no app source files edited.`);
