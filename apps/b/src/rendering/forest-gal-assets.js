// Exact reviewed character bytes copied into B's own portable asset namespace.
// B01 background pixels reviewed as the rain-wet, empty village environment.
export const FOREST_GAL_BACKDROP=Object.freeze({id:'b01-village-entrance',file:'assets/forest-gal/b01-village-entrance.png',width:1672,height:941,sha256:'035cd5ab3ba60fa3eecb125580f27e644730c1f1bf15a5ee508550519c00e092'});
export const FOREST_GAL_CAST=Object.freeze({
 hero:{name:'璃',file:'assets/forest-canonical/hero-neutral.png',width:1024,height:1536,sha256:'bc7e81506ad41225bfe5ef548889d66e67d4c8db963c64650ebb601737d49b76'},
 guide:{name:'纱雾',file:'assets/forest-gal/guide-gentle.webp',width:1024,height:1536,sha256:'a52d900ac91755263fcccf29ba05ccc0fc3c23cd05e6e8712b1935bc369ed15b'},
 merchant:{name:'珂珂',file:'assets/forest-gal/merchant-keke.png',width:1024,height:1536,sha256:'7025aed9bfa08bcaff356806424242a7b8030de65e2f11a19e9c7c9bac2daa75'},
 cat_boss:{name:'米露',file:'assets/forest-gal/cat-boss-alert.webp',width:1024,height:1536,sha256:'aa54a17f60a0ced84a05256dc62e7a90984403f536e563a147b20ebe1d9c89ca'}
});
export const FOREST_GAL_ENVIRONMENTS=Object.freeze({
  "B_ENV_02": {
    "width": 1672,
    "height": 941,
    "sha256": "7ab553c0a6f16871528902d139fcf076fd5137505487c5aedf0c93e27dfbdf61",
    "id": "B_ENV_02",
    "file": "assets/forest-gal/b02-return-branch-square.webp",
    "label": "回枝广场 · 冬料与旧窗框",
    "alt": "回枝广场：根盘、堆放的粮筐与窗框，雨后的石路通往村内"
  },
  "B_ENV_03": {
    "width": 1672,
    "height": 941,
    "sha256": "2d91618621404c82480876d168f12b5de1ef631ab3e20163b054b054ea160169",
    "id": "B_ENV_03",
    "file": "assets/forest-gal/b03-tree-heart-veranda.webp",
    "label": "树心外廊 · 温标与根流",
    "alt": "树心外廊：温标架、三枚红菱封印片与桌上的饭碗"
  },
  "B_PROP_03": {
    "width": 1672,
    "height": 941,
    "sha256": "fd2cc5d21e52085273ccc02dc8ebf3560d6278d4e137438b6e478445e87328b4",
    "id": "B_PROP_03",
    "file": "assets/forest-gal/b03-eight-heat-pouches-open.webp",
    "label": "节火匣 · 八份暖脂",
    "alt": "打开的节火匣：恰好八只储热囊，后排四个标记小盖全部打开"
  }
});
export const FOREST_GAL_DAILY_CAST=Object.freeze({
  "hero": {
    "width": 1024,
    "height": 1536,
    "sha256": "b295a4c881a70443e9457ae58ad1a48467fd6d5d40381b0d404819b70c0b6aaf",
    "id": "hero-daily-sheathed-r1",
    "name": "璃",
    "file": "assets/forest-gal/hero-daily-sheathed-r1.webp"
  },
  "cat_boss": {
    "width": 1024,
    "height": 1536,
    "sha256": "8709089914838f28a1b9b492c057ca46fa9ff939e1cbd91bc152a666eab52158",
    "id": "milu-daily-empty-hands-r1",
    "name": "米露",
    "file": "assets/forest-gal/milu-daily-empty-hands-r1.webp"
  },
  "guide": {
    "width": 1024,
    "height": 1536,
    "sha256": "d63255f86008f499b5186b734186f1f14e5a4b3cc04bc1e854499f2c20235241",
    "id": "shawu-daily-lowered-hands-r1",
    "name": "纱雾",
    "file": "assets/forest-gal/shawu-daily-lowered-hands-r1.webp"
  }
});
export const FOREST_GAL_ASSETS=Object.freeze([FOREST_GAL_BACKDROP,...Object.values(FOREST_GAL_CAST),...Object.values(FOREST_GAL_ENVIRONMENTS),...Object.values(FOREST_GAL_DAILY_CAST)]);
