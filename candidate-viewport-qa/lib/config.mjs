import { resolve, relative, isAbsolute } from 'node:path';
export const VIEWPORTS = Object.freeze([
  {id: 'desktop', width: 1180, height: 757},
  {id: 'narrow', width: 390, height: 844}
]);
export function within(root, path) {
  const result = resolve(root, path), rel = relative(resolve(root), result);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Path escapes repository: ${path}`);
  return result;
}
export function validateConfig(c) {
  const allowed = ['id','branch','adapter','packageRoot','build','outputDirectory','startPath','expectedCampaignId'];
  if (!c || Object.keys(c).some(k => !allowed.includes(k))) throw new Error('Unknown config property');
  if (!['a','b','c','c3d'].includes(c.id) || c.adapter !== c.id) throw new Error('Unknown candidate adapter');
  if (typeof c.branch !== 'string' || !/^candidate\/[a-zA-Z0-9._/-]+$/.test(c.branch)) throw new Error('Only explicit candidate branches are supported');
  for (const key of ['packageRoot','outputDirectory']) {
    if (typeof c[key] !== 'string' || !c[key] || isAbsolute(c[key]) || c[key].split(/[\\/]/).includes('..')) throw new Error(`Invalid ${key}`);
  }
  if (c.outputDirectory === '.') throw new Error('Serve a built output directory, never the repository');
  if (typeof c.startPath !== 'string' || !/^\/(?!\/)/.test(c.startPath) || /[?#\\]/.test(c.startPath) || decodeURIComponent(c.startPath).split('/').includes('..')) throw new Error('Invalid local startPath');
  if (!Array.isArray(c.build) || !c.build.length || c.build.some(cmd => !Array.isArray(cmd) || !['node','npm'].includes(cmd[0]) || cmd.length < 2 || cmd.some(a => typeof a !== 'string'))) throw new Error('Build requires explicit command arrays');
  for (const [command,...args] of c.build) {
    const nodeScript=command==='node' && args.length===1 && /^[a-zA-Z0-9_./-]+\.mjs$/.test(args[0]) && !isAbsolute(args[0]) && !args[0].split('/').includes('..');
    const dependencyInstall=command==='npm' && JSON.stringify(args)===JSON.stringify(['ci','--ignore-scripts','--no-audit','--no-fund']);
    if (!nodeScript && !dependencyInstall) throw new Error('Only a relative Node build script or locked npm ci with lifecycle scripts disabled is accepted');
  }
  if (c.id !== 'a' && c.expectedCampaignId !== (c.id === 'b' ? 'forest-b' : 'voyage-c')) throw new Error('Incorrect campaign identity');
  return c;
}
export function requireCi(env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.CI !== 'true') throw new Error('Browser capture is CI-only. Do not run Chrome in the restricted local executor.');
}
export function chromeArgs(profile, port, viewport) {
  return ['--headless=new', '--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, `--window-size=${viewport.width},${viewport.height}`, 'about:blank'];
}
export function verifyOneMove(before, after) {
  if (!before || !after || before.region !== after.region || Math.abs(before.x-after.x)+Math.abs(before.y-after.y) !== 1) throw new Error('UI action did not produce exactly one adjacent move in the same region');
  if (after.victory) throw new Error('Unexpected victory state');
  return true;
}
