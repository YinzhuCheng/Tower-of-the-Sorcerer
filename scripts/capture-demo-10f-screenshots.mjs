#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const AUTO_SAVE_KEY = 'lost-magic-tower:auto:v1';
const FLOOR_COUNT = 10;

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function readOptions(argv) {
  const options = {
    url: 'http://127.0.0.1:4173/',
    output: '/tmp/tower-10f-screenshots',
    chromePort: 9229
  };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--url') options.url = argv[++index];
    if (value === '--output') options.output = argv[++index];
    if (value === '--chrome-port') options.chromePort = Number(argv[++index]);
  }
  return options;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    'google-chrome',
    'chromium',
    'chromium-browser'
  ].filter(Boolean);
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (result.status === 0) return candidate;
  }
  throw new Error('No Chrome/Chromium binary found. Set CHROME_BIN to override detection.');
}

async function requestJson(url, attempts = 50) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(120);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready: ${lastError?.message ?? 'unknown error'}`);
}

class DevToolsClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    await new Promise((resolveConnect, rejectConnect) => {
      this.socket.addEventListener('open', resolveConnect, { once: true });
      this.socket.addEventListener('error', () => rejectConnect(new Error('Unable to connect to Chrome DevTools.')), { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
      else pending.resolve(message.result);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolveSend, rejectSend) => {
      this.pending.set(id, { resolve: resolveSend, reject: rejectSend });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    for (const pending of this.pending.values()) pending.reject(new Error('Chrome DevTools connection closed.'));
    this.pending.clear();
    this.socket.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? 'Browser evaluation failed.');
  return response.result?.value;
}

async function waitFor(check, message, attempts = 80) {
  for (let index = 0; index < attempts; index += 1) {
    if (await check()) return;
    await sleep(100);
  }
  throw new Error(message);
}

function floorLoadExpression(floorIndex) {
  return `(() => {
    const storageKey = ${JSON.stringify(AUTO_SAVE_KEY)};
    const serialized = localStorage.getItem(storageKey);
    if (!serialized) throw new Error('Capture state is missing from localStorage.');
    const state = JSON.parse(serialized);
    const map = state.floorStates[${floorIndex}]?.map;
    if (!map) throw new Error('Requested floor is missing from the demo save.');
    const find = (token) => {
      for (let y = 0; y < map.length; y += 1) {
        const x = map[y].indexOf(token);
        if (x >= 0) return { x, y };
      }
      return null;
    };
    const fallback = find('.') ?? find('D') ?? find('S');
    const anchor = ${floorIndex} === 0 ? state.start : find('D') ?? fallback;
    if (!anchor) throw new Error('Requested floor has no visible anchor tile.');
    state.floor = ${floorIndex};
    state.x = anchor.x;
    state.y = anchor.y;
    state.visitedFloors = Array.from({ length: state.floorStates.length }, (_, index) => index);
    state.relics = { ...state.relics, codex: true, compass: true };
    state.logs = [\`截图模式：第 ${floorIndex + 1} 阵地图总览。\`];
    localStorage.setItem(storageKey, JSON.stringify(state));
    document.querySelector('#btn-load')?.click();
    document.querySelector('#modal-root')?.classList.add('hidden');
    return { floor: ${floorIndex + 1}, anchor };
  })()`;
}

async function stopProcess(processHandle) {
  if (processHandle.exitCode !== null) return;
  processHandle.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveStop) => processHandle.once('exit', resolveStop)),
    sleep(2_000)
  ]);
  if (processHandle.exitCode === null) processHandle.kill('SIGKILL');
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  const output = resolve(options.output);
  await mkdir(output, { recursive: true });

  const chrome = spawn(findChrome(), [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    `--remote-debugging-port=${options.chromePort}`,
    '--window-size=1600,1060',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let client = null;
  try {
    const targets = await requestJson(`http://127.0.0.1:${options.chromePort}/json/list`);
    const target = targets.find((entry) => entry.type === 'page' && entry.webSocketDebuggerUrl);
    if (!target) throw new Error('Chrome DevTools did not expose a page target.');

    client = new DevToolsClient(target.webSocketDebuggerUrl);
    await client.connect();
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1600,
      height: 1060,
      deviceScaleFactor: 1,
      mobile: false
    });
    await client.send('Page.navigate', { url: options.url });
    await waitFor(
      () => evaluate(client, "Boolean(document.querySelector('#game-container canvas') && localStorage.getItem('lost-magic-tower:auto:v1'))"),
      'The 10F demo did not finish booting with a canvas renderer.'
    );

    const manifest = [];
    for (let floorIndex = 0; floorIndex < FLOOR_COUNT; floorIndex += 1) {
      await evaluate(client, floorLoadExpression(floorIndex));
      await waitFor(
        () => evaluate(client, `document.querySelector('#floor-number')?.textContent === '第 ${floorIndex + 1} 阵'`),
        `Floor ${floorIndex + 1} did not become active in the rendered demo.`
      );
      await sleep(250);
      const image = await client.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: true
      });
      const fileName = `floor-${String(floorIndex + 1).padStart(2, '0')}.png`;
      await writeFile(join(output, fileName), Buffer.from(image.data, 'base64'));
      manifest.push({
        floor: floorIndex + 1,
        title: await evaluate(client, "document.querySelector('#floor-title')?.textContent ?? ''"),
        file: fileName
      });
      console.log(`Captured ${fileName}`);
    }
    await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  } finally {
    client?.close();
    await stopProcess(chrome);
  }
}

main().catch((error) => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
