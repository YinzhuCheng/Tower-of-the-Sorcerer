// Reviewed snapshot-only art contracts. No live state, inferred facts, or queue changes.
import {readForestTurnSnapshot} from '../campaigns/b/story/state-snapshot.js';
import {forestGalExactArtRow} from './forest-gal-cg-contract.js';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const FOREST_GAL_STATEFUL_CONTRACT=freeze([
 {
  "stateKey": "B27.packed",
  "requiredEquals": {
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1693",
    "sourceLine": 1693,
    "branch": "common",
    "phase": "packed",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "111f5afb792a30bb45536b30e3d19303aaecd15aa91f23483447a3a0d3bd2aba",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene"
   },
   {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1695",
    "sourceLine": 1695,
    "branch": "common",
    "phase": "packed",
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "5daf069d41c70e2a0627291ee695cda9457e209010fbea7163ad4161121cdf2d",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B30.noctia-winter-before-lunch",
  "requiredEquals": {
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b30_enter",
    "turnId": "b30_enter.L1831",
    "sourceLine": 1831,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "65ed038241f4da0b26bc6930dff6c23f2b3b057eb724e25c904991009f51efb6",
    "locationId": "B-29.home",
    "backdropAssetId": "B_ENV_30:enter",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_enter",
    "turnId": "b30_enter.L1833",
    "sourceLine": 1833,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "4b4d6b7994f867c64cc18a4a86830cf1cd887960b58ac9f001f7a4902f93dc98",
    "locationId": "B-29.home",
    "backdropAssetId": "B_ENV_30:enter",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_enter",
    "turnId": "b30_enter.L1835",
    "sourceLine": 1835,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "49073163d88dc790fb0891751ff5d6ab507418acd88c6051e8b77955acd89a4c",
    "locationId": "B-29.home",
    "backdropAssetId": "B_ENV_30:enter",
    "camera": "interior-closeup"
   }
  ]
 },
 {
  "stateKey": "B30.shawu-packed-by-door",
  "requiredEquals": {
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1943",
    "sourceLine": 1943,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "10fa0fa7cf6786f00acee7604647f3e06d35c98d9bdf56afe2074bd98d306052",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1945",
    "sourceLine": 1945,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "e2de5abf877a97500adf11f50547e4ce1e787a5f5495c3f2e6861a91c28c6607",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1947",
    "sourceLine": 1947,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "12ecfe8d99dd992194e0c7aae211e412baaef61e76ec0661f89b1101e331caec",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1951",
    "sourceLine": 1951,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "807ba54261b76b00cf0ad8c00059f1aa8cea9d72a68fc47f6005c600c05ab18a",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1953",
    "sourceLine": 1953,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "9111025c3d9e62e8cc5a892e0ea4cfa4b76a9a39fa345a67724cab885edd82c6",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1955",
    "sourceLine": 1955,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "2804429276708e44ddb88cdc449701838501ddcb3208c7abeb3abb207dbff5b7",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   },
   {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1957",
    "sourceLine": 1957,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "11c8bc1b23386c2a08a51de920182de11d6ccdc0390b65c4de4a0f75390a2eb9",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup"
   }
  ]
 },
 {
  "stateKey": "B26.twilight-veranda",
  "requiredEquals": {},
  "exactMatch": [
   {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1631",
    "sourceLine": 1631,
    "branch": "common",
    "phase": "review",
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "ab587fbd12f1e203b80bf5d1c14f076d8ec768b382d75ef9bd10d993c2135db4",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene"
   },
   {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1647",
    "sourceLine": 1647,
    "branch": "confirm",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "586f55a13c30f2ecd039dabca63fc427ed167c2c2594e0b983eb1ea1f9151ce3",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene"
   },
   {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1649",
    "sourceLine": 1649,
    "branch": "confirm",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "71465953f77a630a0d061025a699105401b7c6dfadadcf5dae7881e453a74a35",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1657",
    "sourceLine": 1657,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "0e873ac55c96d4f3183c064cb83f72ec84c50c2033b79740891e4677d8c22443",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1661",
    "sourceLine": 1661,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "bd8a382e1f3c3cbdff0014746dff2e8da42b0d17a1cae7f7e88b491da7ef884b",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1663",
    "sourceLine": 1663,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "f4d1809aed5d45223710db2fc00f07557b22156155d4b195d6b7375680418bc6",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1665",
    "sourceLine": 1665,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "7b3c1cbf0b869960c24666d558629d8916921ca19bf9b69b24114628c081beb0",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1667",
    "sourceLine": 1667,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "34d7bb1f4b5524d652dff64e7fd604acebc633b30d91d04e28b66bd6de3ab099",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1669",
    "sourceLine": 1669,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "2d738e6ba58c503d372b05e77be0e9c78eed8a861264e70dd9f3ea8016d717d2",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   },
   {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1673",
    "sourceLine": 1673,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "42156bb3f4490cb504be1b0395ef098a16cdbdd58584e0cb91afa867471cffe2",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B16.both-complete",
  "requiredEquals": {
   "routes.16.originalCleared": true,
   "routes.16.originalWorksDone": true,
   "routes.16.rootFixed": true,
   "routes.16.rootWorksDone": true
  },
  "exactMatch": [
   {
    "sceneId": "b16_route",
    "turnId": "b16_route.L973",
    "sourceLine": 973,
    "branch": "originalPost",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "db414c928b7cbfb5757c511edaa606ee8072cb68410688e89cabaabb452bd28a",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene"
   },
   {
    "sceneId": "b16_route",
    "turnId": "b16_route.L975",
    "sourceLine": 975,
    "branch": "originalPost",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "425c233fec567ec57bdf508d238a6cb8cf821cb3e8e51a84d7841a79e6236956",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B21.both-complete",
  "requiredEquals": {
   "routes.21.originalCleared": true,
   "routes.21.originalWorksDone": true,
   "routes.21.rootFixed": true,
   "routes.21.rootWorksDone": true
  },
  "exactMatch": [
   {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1317",
    "sourceLine": 1317,
    "branch": "originalPost",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "a09fab848c8169c5e7187c9823cacb2d30d8936b4f9af89ff462a603f38bebf6",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene"
   },
   {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1319",
    "sourceLine": 1319,
    "branch": "originalPost",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "b452c2369dbf9f114d8f42fab77ac316f2ee753d646bc1dc17fa15f66a64903c",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B24.both-complete",
  "requiredEquals": {
   "routes.24.originalCleared": true,
   "routes.24.originalWorksDone": true,
   "routes.24.rootFixed": true,
   "routes.24.rootWorksDone": true
  },
  "exactMatch": [
   {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1497",
    "sourceLine": 1497,
    "branch": "originalPost",
    "phase": "retrieved",
    "speaker": "工队住民",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "9e6967ea09bed54d58c5a9074b5f7d2f8f044ad99286bba09893235ff742baab",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B07.original-only-complete",
  "requiredEquals": {
   "routes.07.originalCleared": true,
   "routes.07.originalWorksDone": true,
   "routes.07.rootFixed": false,
   "routes.07.rootWorksDone": false
  },
  "exactMatch": [
   {
    "sceneId": "b07_stone_post",
    "turnId": "b07_stone_post.L439",
    "sourceLine": 439,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "72256d526f4162be1141e5ea112432727d2095aa8ad45f8c7132cf8768308688",
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:stone_post",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B07.both-complete",
  "requiredEquals": {
   "routes.07.originalCleared": true,
   "routes.07.originalWorksDone": true,
   "routes.07.rootFixed": true,
   "routes.07.rootWorksDone": true
  },
  "exactMatch": [
   {
    "sceneId": "b07_stone_post",
    "turnId": "b07_stone_post.L439",
    "sourceLine": 439,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "72256d526f4162be1141e5ea112432727d2095aa8ad45f8c7132cf8768308688",
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:stone_post",
    "camera": "scene"
   },
   {
    "sceneId": "b07_revisit",
    "turnId": "b07_revisit.L445",
    "sourceLine": 445,
    "branch": "rootReady",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "a76af8922bfca4888a8c030c3d70bfbe87a5b4d75fe488e2b924028b277fd3af",
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:revisit",
    "camera": "scene"
   }
  ]
 },
 {
  "stateKey": "B17.winter-retained",
  "requiredEquals": {
   "warm.greenhouse": true,
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1849",
    "sourceLine": 1849,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "bcbd752d67fd0248b973cdfa5e25dc3ef6088c836ae19bdb4ccf665b9564fcf3",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouse_lodge",
    "camera": "winter-interior-closeup"
   },
   {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1925.2",
    "sourceLine": 1925,
    "branch": "greenhouseOn",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "b8d2aa9cc7b0d40b92996ec0d476f5c56477c2652bc68901cb9cee9326d5a919",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOn",
    "camera": "winter-interior-closeup"
   }
  ]
 },
 {
  "stateKey": "B18.winter-retained-new-slope",
  "requiredEquals": {
   "warm.pear": true,
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1875",
    "sourceLine": 1875,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "b9455daa27db9478ab6e3819a122e4447747b2203191e15232aff1b10db44d9b",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot"
   },
   {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1889",
    "sourceLine": 1889,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "dfbe2321fcc2310579d2a55bd2c7ca2a8fdb7fa1444dd388c699d876b438677a",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot"
   },
   {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1891",
    "sourceLine": 1891,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "42aaf096e23b1f227ffba9a81ecc99cc08a7a7a9bc9ba0f7a93a3480e5ad20dd",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot"
   },
   {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1893",
    "sourceLine": 1893,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "45761c30d00ae7dcead1e8c42f480c096035e879937020711886f580ed01aafc",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot"
   },
   {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1929.2",
    "sourceLine": 1929,
    "branch": "pearOn",
    "phase": null,
    "speaker": "纱雾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "3ce97c92f74a337d34a855b8a8d54ec7319d3ef48bd535fc274446164401fbcb",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOn",
    "camera": "exterior-empty-shot"
   }
  ]
 },
 {
  "stateKey": "B19.winter-retained-warm-lodge",
  "requiredEquals": {
   "warm.lodge": true,
   "warm.frozen": true
  },
  "exactMatch": [
   {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1933.2",
    "sourceLine": 1933,
    "branch": "lodgeOn",
    "phase": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOn",
    "camera": "winter-interior-closeup",
    "textSha256": "1e227f9bfca2c97ba68e6a1923aab441d4a10639ce1ee8734647b095a423314a",
    "speaker": "住民",
    "portrait": null,
    "kind": "dialogue"
   }
  ]
 }
]);
export function forestGalStatefulArtRow(scene,turn){
 // Older, damaged, review and future metadata remain unknown. In particular do
 // not consult the current session or recapture facts for a historical turn.
 let snapshot;
 try { snapshot=readForestTurnSnapshot(turn,{sceneId:scene?.sceneId}); }
 catch { return null; }
 if(!snapshot||snapshot.origin!=='runtime-resolve'||!scene?.sceneId)return null;
 for(const state of FOREST_GAL_STATEFUL_CONTRACT){
  if(!Object.entries(state.requiredEquals).every(([path,value])=>path.split('.').reduce((item,key)=>item?.[key],snapshot)===value))continue;
  // Predicate first: B07 L439 intentionally has two separate state contracts.
  const row=forestGalExactArtRow(state.exactMatch,scene,turn);
  if(row)return {...row,stateKey:state.stateKey};
 }
 return null;
}
