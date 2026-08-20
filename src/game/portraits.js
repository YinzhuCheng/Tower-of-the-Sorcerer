const PORTRAITS = {
  hero: { name: '绫星·璃', hair: '#8d79ff', hair2: '#ff8fc8', eye: '#74e0ff', bg: '#20144d', accent: '#ffd5f0', accessory: 'star' },
  mote: { name: '符文软泥娘', hair: '#72d9c2', hair2: '#b7ffe8', eye: '#4e6fdf', bg: '#123a48', accent: '#d1fff4', accessory: 'droplet' },
  cat_scout: { name: '月影猫娘', hair: '#3e3a58', hair2: '#81779d', eye: '#ffd36e', bg: '#211c39', accent: '#ffb4db', accessory: 'cat' },
  cat_mage: { name: '铃术猫娘', hair: '#7d4fb5', hair2: '#d895ff', eye: '#7ff1ff', bg: '#28144c', accent: '#ffd36e', accessory: 'cat_bell' },
  cat_boss: { name: '猫卫长·米露', hair: '#d46f93', hair2: '#ffbdd2', eye: '#ffe174', bg: '#4a1831', accent: '#fff0c2', accessory: 'cat_crown' },
  fox_acolyte: { name: '青叶狐巫', hair: '#8c5b3e', hair2: '#f1a766', eye: '#75efc4', bg: '#263f2f', accent: '#ffe0a8', accessory: 'fox' },
  fox_archer: { name: '赤羽狐弓', hair: '#b94545', hair2: '#ff8974', eye: '#ffe078', bg: '#4a1d25', accent: '#ffe6be', accessory: 'fox_ribbon' },
  fox_boss: { name: '狐祝·绯叶', hair: '#e0654e', hair2: '#ffbd76', eye: '#9affdf', bg: '#51221d', accent: '#fff0c6', accessory: 'fox_crown' },
  whale_singer: { name: '鲸歌术士', hair: '#256aa3', hair2: '#6fd6f3', eye: '#e4fbff', bg: '#102f51', accent: '#bfefff', accessory: 'whale' },
  tide_lancer: { name: '潮汐枪姬', hair: '#224f80', hair2: '#5ea5db', eye: '#a7f1ff', bg: '#112840', accent: '#d1e9ff', accessory: 'fin' },
  whale_boss: { name: '深蓝歌姬·澜音', hair: '#3b5bd6', hair2: '#8ee8ff', eye: '#fff3ad', bg: '#172357', accent: '#d8f8ff', accessory: 'whale_crown' },
  sword_apprentice: { name: '银锋学徒', hair: '#c8c9d8', hair2: '#f2f1ff', eye: '#8e7bff', bg: '#2d3042', accent: '#d9e7ff', accessory: 'sword' },
  sword_knight: { name: '蔷薇剑士', hair: '#812f50', hair2: '#dd718b', eye: '#ffd8e8', bg: '#3f1727', accent: '#ffe6ef', accessory: 'sword_rose' },
  sword_boss: { name: '剑圣·塞蕾娜', hair: '#e5d6c4', hair2: '#fff3db', eye: '#78a7ff', bg: '#353244', accent: '#ffe9ad', accessory: 'tiara' },
  dragon_whelp: { name: '幼焰龙娘', hair: '#b33730', hair2: '#ff7d45', eye: '#ffe56c', bg: '#491913', accent: '#ffd6a2', accessory: 'horns' },
  flame_caster: { name: '赤炎术姬', hair: '#7c2330', hair2: '#f55555', eye: '#ffc56f', bg: '#3e1118', accent: '#ffd7bd', accessory: 'flame' },
  dragon_boss: { name: '龙姬·焰璃', hair: '#c53b24', hair2: '#ffb34f', eye: '#fff092', bg: '#50180c', accent: '#fff0c0', accessory: 'dragon_crown' },
  star_witch: { name: '星图魔女', hair: '#302861', hair2: '#8071dc', eye: '#ffcbff', bg: '#18143c', accent: '#b9e8ff', accessory: 'witch' },
  mirror_doll: { name: '镜界人偶', hair: '#c9d9f0', hair2: '#f9fbff', eye: '#ff92c7', bg: '#28354b', accent: '#dff7ff', accessory: 'mirror' },
  astral_boss: { name: '天穹魔女·露米', hair: '#4e3ca3', hair2: '#d38bff', eye: '#83efff', bg: '#21145a', accent: '#fff0be', accessory: 'witch_crown' },
  shadow_ninja: { name: '影缝忍姬', hair: '#1b1b2c', hair2: '#5b4a72', eye: '#ff7193', bg: '#12121f', accent: '#b9a7d7', accessory: 'mask' },
  void_priestess: { name: '虚空祭司', hair: '#442757', hair2: '#9d4da8', eye: '#e795ff', bg: '#25112e', accent: '#e8c4ff', accessory: 'halo' },
  shadow_boss: { name: '影织姬·鸦羽', hair: '#17131e', hair2: '#64396c', eye: '#ff5f9a', bg: '#190e22', accent: '#e2b7ef', accessory: 'raven_crown' },
  silence_guard: { name: '寂静近卫', hair: '#d6d7e4', hair2: '#888ba8', eye: '#7e6bff', bg: '#2a2a42', accent: '#edf0ff', accessory: 'guard' },
  eclipse_mage: { name: '蚀月法师', hair: '#362754', hair2: '#8c5aad', eye: '#ff9ad6', bg: '#1c1530', accent: '#d9c7ff', accessory: 'eclipse' },
  final_queen: { name: '无声女王·诺克缇娅', hair: '#f0edf9', hair2: '#b07bd7', eye: '#ff4d9b', bg: '#261332', accent: '#ffe7a8', accessory: 'queen' },
  void_core: { name: '黯星魔阵核心', hair: '#10101e', hair2: '#7f1f65', eye: '#ffdf69', bg: '#070711', accent: '#f88bd2', accessory: 'void' },
  merchant: { name: '阵间商人·珂珂', hair: '#5b3843', hair2: '#c87983', eye: '#8ff0c7', bg: '#293729', accent: '#ffe6a8', accessory: 'merchant' },
  guide: { name: '残响精灵·纱雾', hair: '#bcdfff', hair2: '#f4fbff', eye: '#a586ff', bg: '#24304f', accent: '#fff4d5', accessory: 'halo_star' }
};

const cache = new Map();

function escapeXml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function accessorySvg(kind, accent, hair2) {
  const common = `stroke="${accent}" stroke-width="5" stroke-linejoin="round"`;
  if (kind.startsWith('cat')) {
    let extra = `<path d="M29 49 L45 16 L65 45 Z" fill="${hair2}" ${common}/><path d="M99 45 L119 16 L135 50 Z" fill="${hair2}" ${common}/>`;
    if (kind.includes('bell')) extra += '<circle cx="82" cy="139" r="8" fill="#ffd55f" stroke="#6e4b20" stroke-width="3"/>';
    if (kind.includes('crown')) extra += `<path d="M60 25 L68 5 L82 22 L97 4 L105 27" fill="none" ${common}/>`;
    return extra;
  }
  if (kind.startsWith('fox')) {
    let extra = `<path d="M21 53 L39 8 L66 47 Z" fill="${hair2}" ${common}/><path d="M100 47 L128 8 L142 55 Z" fill="${hair2}" ${common}/>`;
    if (kind.includes('ribbon')) extra += '<path d="M116 44 q24 3 24 20 q-18 4-28-8 q-4 16-19 14 q-2-20 23-26z" fill="#ffcfdf"/>';
    if (kind.includes('crown')) extra += `<circle cx="82" cy="17" r="11" fill="none" ${common}/><path d="M82 1 v32 M66 17 h32" ${common}/>`;
    return extra;
  }
  if (kind === 'horns' || kind === 'dragon_crown') {
    let extra = `<path d="M41 50 Q22 30 32 7 Q57 18 62 42" fill="${accent}" stroke="#6b2d1c" stroke-width="4"/><path d="M103 42 Q110 18 134 7 Q143 31 124 52" fill="${accent}" stroke="#6b2d1c" stroke-width="4"/>`;
    if (kind === 'dragon_crown') extra += '<path d="M64 24 l9-18 10 16 12-17 7 21" fill="#ffdf72" stroke="#8b451d" stroke-width="3"/>';
    return extra;
  }
  if (kind === 'whale' || kind === 'whale_crown') {
    let extra = `<path d="M21 75 Q3 60 8 42 Q32 44 45 62" fill="${hair2}" ${common}/><path d="M139 74 Q157 58 151 41 Q128 44 116 62" fill="${hair2}" ${common}/>`;
    if (kind === 'whale_crown') extra += '<path d="M67 19 q15-18 30 0 q-8 9-15 3 q-8 7-15-3z" fill="#d5f8ff" stroke="#6cc5e9" stroke-width="3"/>';
    return extra;
  }
  if (kind === 'fin') return `<path d="M22 81 Q1 67 11 39 Q37 47 47 67" fill="${hair2}" ${common}/>`;
  if (kind.startsWith('sword') || kind === 'tiara' || kind === 'guard') {
    let extra = `<path d="M119 29 L139 7" ${common}/><path d="M130 5 l12 12" ${common}/><path d="M116 32 l16 16" ${common}/>`;
    if (kind === 'sword_rose') extra += '<circle cx="43" cy="42" r="12" fill="#ef6d95"/><path d="M43 28 v28 M29 42 h28" stroke="#ffd2df" stroke-width="3"/>';
    if (kind === 'tiara') extra += '<path d="M56 31 L67 11 L82 27 L98 10 L109 32" fill="none" stroke="#ffe08b" stroke-width="5"/>';
    if (kind === 'guard') extra += '<path d="M52 24 Q82 5 112 24 L105 45 H59 Z" fill="#9ea5c7" stroke="#e7eaff" stroke-width="4"/>';
    return extra;
  }
  if (kind === 'witch' || kind === 'witch_crown') {
    let extra = `<path d="M35 46 Q69 18 83 -2 Q100 23 128 47 Z" fill="${hair2}" stroke="${accent}" stroke-width="5"/><path d="M25 48 Q82 34 139 49" fill="none" ${common}/>`;
    if (kind === 'witch_crown') extra += '<path d="M80 4 l6 12 13 2-10 9 3 13-12-7-12 7 3-13-10-9 13-2z" fill="#ffe484"/>';
    return extra;
  }
  if (kind === 'mask') return '<path d="M48 84 Q82 67 116 84 L107 104 Q82 112 57 104 Z" fill="#272338" opacity=".92"/><path d="M58 88 l18 5 M106 88 l-18 5" stroke="#ff779f" stroke-width="3"/>';
  if (kind === 'halo' || kind === 'halo_star') {
    let extra = `<ellipse cx="82" cy="22" rx="34" ry="12" fill="none" ${common}/>`;
    if (kind === 'halo_star') extra += '<path d="M82 1 l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#fff1aa"/>';
    return extra;
  }
  if (kind === 'raven_crown') return `<path d="M49 38 Q43 9 17 17 Q36 33 56 47 M115 39 Q122 9 147 18 Q129 34 108 47" fill="${hair2}" ${common}/><path d="M62 24 l9-17 11 15 12-16 9 20" fill="#2b1b32" ${common}/>`;
  if (kind === 'eclipse') return `<circle cx="116" cy="30" r="20" fill="none" ${common}/><circle cx="124" cy="24" r="18" fill="#1c1530"/>`;
  if (kind === 'queen') return '<path d="M49 34 L55 4 L75 25 L84 1 L95 25 L116 4 L113 38 Z" fill="#f4d277" stroke="#8d5a26" stroke-width="4"/><circle cx="84" cy="15" r="5" fill="#ff4d9b"/>';
  if (kind === 'void') return `<circle cx="82" cy="32" r="28" fill="none" stroke="${accent}" stroke-width="7" stroke-dasharray="8 7"/><path d="M82 3 l7 20 21 1-17 13 6 21-17-12-18 12 7-21-18-13 22-1z" fill="#ffde68" opacity=".9"/>`;
  if (kind === 'flame') return '<path d="M119 55 q28-27 8-49 q-2 19-17 25 q4-20-11-27 q-5 29 20 51z" fill="#ff8051" stroke="#ffd06e" stroke-width="4"/>';
  if (kind === 'mirror') return `<path d="M112 30 q26 0 26 25 v36 q0 25-26 25 q-14-18 0-36 q-14-20 0-50z" fill="#bcecff" opacity=".55" ${common}/>`;
  if (kind === 'droplet') return `<path d="M82 3 Q105 34 105 50 Q105 73 82 73 Q59 73 59 50 Q59 34 82 3Z" fill="${hair2}" opacity=".8" ${common}/>`;
  if (kind === 'merchant') return '<path d="M47 37 q35-25 70 0 l-8 18H55z" fill="#d39a55" stroke="#ffe2a2" stroke-width="4"/><circle cx="113" cy="41" r="9" fill="#8ff0c7"/>';
  if (kind === 'star') return '<path d="M119 17 l5 11 12 2-9 8 3 12-11-6-11 6 3-12-9-8 12-2z" fill="#ffe691" stroke="#fff7d1" stroke-width="3"/>';
  return '';
}

function renderPortrait(id, portrait) {
  const name = escapeXml(portrait.name);
  const accessory = accessorySvg(portrait.accessory, portrait.accent, portrait.hair2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164 164" role="img" aria-labelledby="title-${id}">
<title id="title-${id}">${name}</title>
<defs>
  <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${portrait.bg}"/><stop offset="1" stop-color="#090916"/></linearGradient>
  <linearGradient id="hair-${id}" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="${portrait.hair2}"/><stop offset="1" stop-color="${portrait.hair}"/></linearGradient>
  <radialGradient id="glow-${id}"><stop stop-color="${portrait.accent}" stop-opacity=".45"/><stop offset="1" stop-color="${portrait.accent}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="164" height="164" rx="24" fill="url(#bg-${id})"/>
<circle cx="82" cy="72" r="68" fill="url(#glow-${id})"/>
<g>${accessory}</g>
<path d="M18 164 Q24 122 55 112 Q82 101 109 112 Q140 122 146 164Z" fill="${portrait.hair}" opacity=".85"/>
<path d="M67 104 h30 v27 q-15 13-30 0z" fill="#f3c9ba"/>
<ellipse cx="82" cy="78" rx="43" ry="49" fill="#f7d7c8" stroke="${portrait.accent}" stroke-opacity=".28" stroke-width="3"/>
<path d="M38 80 Q34 30 82 25 Q129 31 126 82 Q113 58 104 48 Q91 64 57 59 Q49 70 38 80Z" fill="url(#hair-${id})"/>
<path d="M39 82 Q30 55 47 37 M125 82 Q137 57 119 38" fill="none" stroke="${portrait.hair}" stroke-width="12" stroke-linecap="round"/>
<path d="M49 63 Q57 42 82 31 Q82 55 68 68" fill="${portrait.hair2}" opacity=".8"/>
<ellipse cx="63" cy="82" rx="10" ry="13" fill="#fff"/><ellipse cx="101" cy="82" rx="10" ry="13" fill="#fff"/>
<ellipse cx="64" cy="84" rx="6" ry="9" fill="${portrait.eye}"/><ellipse cx="100" cy="84" rx="6" ry="9" fill="${portrait.eye}"/>
<circle cx="66" cy="81" r="2.4" fill="#fff"/><circle cx="102" cy="81" r="2.4" fill="#fff"/>
<path d="M52 67 q11-7 22 0 M90 67 q11-7 22 0" fill="none" stroke="${portrait.hair}" stroke-width="4" stroke-linecap="round"/>
<path d="M76 102 q6 5 12 0" fill="none" stroke="#c36f7c" stroke-width="3" stroke-linecap="round"/>
<path d="M28 164 Q37 128 66 121 L82 142 L98 121 Q128 128 137 164Z" fill="${portrait.accent}" opacity=".88"/>
<path d="M65 122 l17 20 17-20" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4"/>
<circle cx="82" cy="143" r="6" fill="${portrait.eye}"/>
</svg>`;
}

export function portraitSvg(id) {
  const portrait = PORTRAITS[id];
  if (!portrait) throw new Error(`Unknown portrait: ${id}`);
  if (!cache.has(id)) cache.set(id, renderPortrait(id, portrait));
  return cache.get(id);
}

export function portraitUrl(id) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portraitSvg(id))}`;
}

export function hydratePortraits(root = document) {
  root.querySelectorAll('[data-portrait]').forEach((image) => {
    const id = image.dataset.portrait;
    if (id && PORTRAITS[id]) image.src = portraitUrl(id);
  });
}

export function portraitName(id) {
  return PORTRAITS[id]?.name ?? id;
}

export const PORTRAIT_IDS = Object.freeze(Object.keys(PORTRAITS));
