// Exact existing-art reuse, independently reviewed against visible place/time/object state.
// Old 179 background, 117 safe and 38 stateful rows remain unchanged.
import {readForestTurnSnapshot} from '../campaigns/b/story/state-snapshot.js';
import {forestGalExactArtRow} from './forest-gal-cg-contract.js';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const FOREST_GAL_REUSE_CONTRACT=freeze([
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1539",
    "sourceLine": 1539,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "0e3976134805b7aed404a48a09ec367da4299eba57d5b7b8c846334eb026a1db",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1541",
    "sourceLine": 1541,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "1b74061bad73ffab800cd172ffc5e757123da8de92494f1a1c48a5922305779c",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1543",
    "sourceLine": 1543,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "f5d5c90d90bf9b3f47074ed864fc1e74c2ffc83eaf2899794dac3c3827bc3fc2",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1545",
    "sourceLine": 1545,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "860b89a080bdf129faa9cb3e4cd051a6d527e8e7a41f94ad65e1b3c62ef0def5",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1547",
    "sourceLine": 1547,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "12a3d75820fc4414b98f3d27daf9918f1ed7624f3f238be344ff606794b30ba3",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1549",
    "sourceLine": 1549,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "39cd2c7d24b38686ee414d599fcfaec66cfe71dde85339916bf47dd09fedb7f1",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1551",
    "sourceLine": 1551,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "e581e208e893fd4c588bcdd97ad07ca4da808914c0c7702ca326ea1240f806ff",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1553",
    "sourceLine": 1553,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "8c49def201f1327628c9e7bda38938deabaf9279bdd2af94804b7438bdfc235d",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1555",
    "sourceLine": 1555,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "0622b285f21b7f52537189eadb8f0797054eec16f5222c3e44ca8b1bc73740ce",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1557",
    "sourceLine": 1557,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "9ac44ed17eb89b240de2f13bc85a87d774b6971683c7028076a26f8bd02d9142",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1559",
    "sourceLine": 1559,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "ec4a75046ada1d27dbc23a07da9ab5e58cf90851ad9da52649132d9defae4339",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1561",
    "sourceLine": 1561,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "51134b4b0119efd08d73b7a287cb49eb1ff4f4aca38ef9dff96780023e4e746b",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1563",
    "sourceLine": 1563,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "3ef67036bfbdbcc45e4ac96bc6e6eb219ca92335c3422c7b358acf0a860b1883",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1565",
    "sourceLine": 1565,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "9c3b3895f3011910609fc4e89ca6f96da685b0dcf2dc7e287cad776c978cbc15",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1567",
    "sourceLine": 1567,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "d383b307c26c0d1fc395fbe4cd92b40c13d09b506ba18c91d1f757465205518e",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1569",
    "sourceLine": 1569,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "88e2bc0bb2bcf61f7ad5d2f1923eeaf0d15c4f09085b7c5ce6ab23285ef6322b",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b25_noctia",
    "turnId": "b25_noctia.L1571",
    "sourceLine": 1571,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "3bdafc31dbff6fd60384977059e7c41aae39276a77354c4aa16cef304d9f1d94",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_25:noctia",
    "camera": "scene",
    "assetId": "B_ENV_03",
    "semanticLocationId": "B-03.tree-heart-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L991",
    "sourceLine": 991,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "ab06ae77f68725403eab0f96e46a6ab8b8be9b2150b834fe492c6af371eb787b",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L993",
    "sourceLine": 993,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "f363ab66f9aec68699c27d4483717d62944f977e0e3ccaf499d39329efab1a54",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L995",
    "sourceLine": 995,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "ba9ed0a24b28c9678d766530aee243442ef21e05d6c4e89afba2c9a2912b0361",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L997",
    "sourceLine": 997,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "ece347a021fdb1ffc577ea5e9235eb3e903bf8903fa4f971f842b818be8a8799",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L999",
    "sourceLine": 999,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "49a9456bc2e0d4977b6861a34d2c11add1d9cabc364f19e6b42890ae62cada55",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1001",
    "sourceLine": 1001,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "8b5b03f05e9a1515d1ac48828a1651e51258d838e9fd840db8f0e63f92b3e63b",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1003",
    "sourceLine": 1003,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "db6c6bb18fbb4fbb77d930e2256f34c1306272567196f25f7f16c7838798ebb8",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1005",
    "sourceLine": 1005,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "86faf00b3e65f03041e9de06be97ab0d092a74849bca993436f940a6af84fa29",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1007",
    "sourceLine": 1007,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "86e8bdba0ea49281b1921d04b09e7bae76c4c5013686cc0581135494f272a646",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1009",
    "sourceLine": 1009,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "156acea55cdb690a10d646f75098128bdb35855c0c945ad694754b76ba87cf5d",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1011",
    "sourceLine": 1011,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "4a3322d08a4fe96424d6e458cd875d8cee1c6617a8b26d749472470643e45c32",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1013",
    "sourceLine": 1013,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "b0c079dc75f281e129a55c474f5d35fce8a2c31e027876624816b13a71712ae4",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1015",
    "sourceLine": 1015,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "03a99ea19298ed2de8c56f13bd205138dbffcc9718c22560a4ef21f8ae185e1d",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1017",
    "sourceLine": 1017,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "484ebe37a0b4c590152849ddc4a671ac9c6618a8d656c7a95116b7a88e791c2e",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1019",
    "sourceLine": 1019,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "1fe3b87530aba53e378066c3d9c9047a3797aa178bbb52efe930464dcbd2e9e8",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b17_enter",
    "turnId": "b17_enter.L1021",
    "sourceLine": 1021,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "b72548851ff541ac6b96521493fc674bc543d587954520d6536bef3f7238bef1",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:enter",
    "camera": "scene",
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.warm-greenhouse",
    "requiredEquals": {
      "warm.frozen": false,
      "warm.greenhouse": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L901",
    "sourceLine": 901,
    "branch": "common",
    "phase": "delivery",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "410d6934d8e425e16c6f1d5f95145674897747f59764c216a07f9a28827258f2",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L903",
    "sourceLine": 903,
    "branch": "common",
    "phase": "delivery",
    "speaker": "货场工人",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "c8264aa482ce8112dc13fd6f1f1b074303d5dfb77baac22652e1ffce9cea77b3",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L905",
    "sourceLine": 905,
    "branch": "common",
    "phase": "delivery",
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "37af51c323ab4df3c2c6d319d36f29926fa3456a0789bfd4a3efdb5b7916834b",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L907",
    "sourceLine": 907,
    "branch": "common",
    "phase": "delivery",
    "speaker": "货场工人",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "b9553dd1f0208df98448fc7315961e04cb946a99bcf73a075d2a39b23ca090b1",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L909",
    "sourceLine": 909,
    "branch": "common",
    "phase": "delivery",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "fe1761b64e9f8c90e07fd72e9f3be3a027247be4fa08885872bc336d070243dc",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L911",
    "sourceLine": 911,
    "branch": "common",
    "phase": "delivery",
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "d601ed7afec5942f293adabdf288d22e3cd6d62d18a92f27278bb15648e43cf2",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L913",
    "sourceLine": 913,
    "branch": "common",
    "phase": "delivery",
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "8188dd8ef7a9cc9b2d5088c12fd8ba4639ced11597e3e8f56325fd8e6c3c609b",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L915",
    "sourceLine": 915,
    "branch": "common",
    "phase": "delivery",
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "2e8dc604f859a23987d8f4f06b8e7ec3e920026a92e2e394b680c47e5ee0100f",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L917",
    "sourceLine": 917,
    "branch": "common",
    "phase": "delivery",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "30cb1d7c56d4c5e5f344dd203db58f6696374239c9a505d90442d73a94f3d5bc",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L919",
    "sourceLine": 919,
    "branch": "common",
    "phase": "delivery",
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "0e7c811ff832cf6257f7f2371219766ba492b1ba5b00fcf5c4156d8e09608b0d",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L921",
    "sourceLine": 921,
    "branch": "common",
    "phase": "delivery",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "9c6252fd17050c00ff4ef01216c68791f199f0620e1374978c72163547334388",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.cargo-ropeway",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1763",
    "sourceLine": 1763,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "73adbaaeb4bec310839aaefb43788ac32fdcbbac7a7288b485fd00040f44fb3b",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1765",
    "sourceLine": 1765,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "fa1bdfc4c8231a5a22f5197dbb4b8b18222ba8cd28d8cb9fc03c13bff5d720a4",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1767",
    "sourceLine": 1767,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "5c7a9f97adb5bed9d4c6aca666dffd0e37fda970ebcfc2c8c0060523a483e295",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1769",
    "sourceLine": 1769,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "80c0d11df4cbc829bc23aeb592aebcffa54665a1a354f152983c95620c7314f0",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1771",
    "sourceLine": 1771,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "portrait": "fox_boss",
    "kind": "dialogue",
    "textSha256": "634eb24974a960cc5f10aa88531767cc425a8c08dba8580181394fcadbc61d6f",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1773",
    "sourceLine": 1773,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "8cb3b05119bf03e9f374922ed32bc18a19bc29f00455b3a66a3d58379f71f4e7",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1775",
    "sourceLine": 1775,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "887c65091c61e314845708574b2c28a25afec663b01ed26866ec6ee8b8326c12",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1777",
    "sourceLine": 1777,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "b764b8e4a1da1caa1ea1b3449854ff6a1912e1333ca20432d63c5d4d2863f12f",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1779",
    "sourceLine": 1779,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "d5ee8afb5ff1897b82e70f42f336e6ea13cc362d7c6eaef5e2d5e1095f28d7df",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b29_enter",
    "turnId": "b29_enter.L1781",
    "sourceLine": 1781,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "cdabe7aaaa7b890544b5b93ba6b9aedea9b13ade0b6c67e643a0458e13e35a64",
    "locationId": "B-29",
    "backdropAssetId": "B_ENV_29:enter",
    "camera": "scene",
    "assetId": "B_REUSE_29_COLD_MOON",
    "semanticLocationId": "B-02.cold-moonlight-square",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L243",
    "sourceLine": 243,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "3ec0910b1da76fafdc93f7c5cb4e1a8e5a8934763e4eb443c65c316ab326e2e9",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L245",
    "sourceLine": 245,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "a4de831e619bea7b9bc74666a1a8a36924d796bde6cd100f35e1306ead838ea8",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L247",
    "sourceLine": 247,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "25061f14c41a561351dccc69848ef8baf9dd26524d954c6db48136afd218bba2",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L249",
    "sourceLine": 249,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "portrait": "cat_boss",
    "kind": "dialogue",
    "textSha256": "e395bf620838634424ed7b7dd225f8afb7951438f03c6b966c93188acfceabba",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L251",
    "sourceLine": 251,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "38c74c8c2eb8c594da1f6d61a530463a38b80469b8271d2ed4e06028c84f7b53",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L253",
    "sourceLine": 253,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "26593d092e14a478a56c43839f84e441df449375bc3ef26d223ac7b078c67569",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L255",
    "sourceLine": 255,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "d709dcaa87a73f916cd6696b4ee8f8930a18e2884e578eb7f8f3e8b78fad2f38",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L257",
    "sourceLine": 257,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "4d351f97dca20872486d877bff361e6af3deef8f95a98af4a60d5f527c12781f",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L259",
    "sourceLine": 259,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "bd995d5d13609f216adf9b6ee04960ca84296c57ae3bd75a3a1bf2003e434492",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b04_enter",
    "turnId": "b04_enter.L261",
    "sourceLine": 261,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "d58764582d5e7c3c6e72b053d45bf7f82d223513a790d3c9c83de7957e3a3f3d",
    "locationId": "B-04",
    "backdropAssetId": "B_ENV_04:enter",
    "camera": "scene",
    "assetId": "B_REUSE_04_SCHOOL",
    "semanticLocationId": "B-04.old-school-interior",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_shop",
    "turnId": "b13_shop.L773",
    "sourceLine": 773,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "204737fd79408ba52db82fada8950b9c89c3e66e54f5134d577f22f95dae631e",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:shop",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L777",
    "sourceLine": 777,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "051ee61c3d2cce1bf7ab877d7e3031b2f7b4a8f2ff0ef5448aff9e02659ad55a",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L779",
    "sourceLine": 779,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "8b7cd7eb8c400f0b839073116315d41104bbffee20ff60ff124b5102ee64bd79",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L781",
    "sourceLine": 781,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "ef84674f790bd60a62e4dd18c7663db21131473b0932a8825ce8fb5a4ed2743d",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L783",
    "sourceLine": 783,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "80c85c2b5a4cf144eaf25c3d149ad6b0d97a0fe5ed75f4bd5047110038991f1c",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L785",
    "sourceLine": 785,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "d767f44b3cf363327b436e6034fec52547ac82c788d2c17931ec442f76d4ea79",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L787",
    "sourceLine": 787,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "a1a676a94dea23b92c9bcc7526c1c7bbcf0491e0abfac8da567f1c7d66c6905c",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L789",
    "sourceLine": 789,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "72df63b0c1fd1def3c825721711d6e0ff029bdc7f67c7cb139d2b955601cab05",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b13_depart",
    "turnId": "b13_depart.L791",
    "sourceLine": 791,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": "merchant",
    "kind": "dialogue",
    "textSha256": "1b1f0d307755e4f91aba14f86091519ec7d6dc5c044f3928bfa8ba19e69ec51f",
    "locationId": "B-13",
    "backdropAssetId": "B_ENV_13:depart",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B13_freight_planned",
    "semanticLocationId": "B-13.stonefoot-freight-yard",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b10_exit",
    "turnId": "b10_exit.L609",
    "sourceLine": 609,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "1aed5d3942f13309e8d66f987d99f64f87f65ba55e68576d0c33ac4b8df8e2e6",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:exit",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B10_valve_stable",
    "semanticLocationId": "B-10.westbranch-valve",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b10_exit",
    "turnId": "b10_exit.L611",
    "sourceLine": 611,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "074c34fa357cbe0120e94058d5cf9f200cb6b5a6180cb6faa7978c201ce34df7",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:exit",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B10_valve_stable",
    "semanticLocationId": "B-10.westbranch-valve",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b10_exit",
    "turnId": "b10_exit.L613",
    "sourceLine": 613,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "1288a47e9ddbf6b2d558325971412ad3bf8fb46eaa835ab07d48264a56f25fb7",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:exit",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B10_valve_stable",
    "semanticLocationId": "B-10.westbranch-valve",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b10_exit",
    "turnId": "b10_exit.L615",
    "sourceLine": 615,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "c8b244034b9b430cb71ddb7166a04e19f0129bcac06f756ee434a7f88cb5836b",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:exit",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B10_valve_stable",
    "semanticLocationId": "B-10.westbranch-valve",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1101",
    "sourceLine": 1101,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "15a19aeeddb1f460d23408380c3fef7bf44b031542125a8cc19e93ed9fd17966",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1103",
    "sourceLine": 1103,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "39bb26ade513dfaabb9ea6fd9f9bdf580463d8dd653e457884c6d13e22d1ee6c",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1105",
    "sourceLine": 1105,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "ce3dbf8a6407054dab8e3f88c96d5d6da63361e965b0aa2b7b5056852e6fa876",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1107",
    "sourceLine": 1107,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "10ea9e8ba71b9fa36e190c681c605cd2c011cd68e2f128c44a6b8c091d6d1164",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1109",
    "sourceLine": 1109,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "960160a018a722221c45265d1389929f1debf3f331d38aafd7d88f9afe927e6e",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b18_private",
    "turnId": "b18_private.L1111",
    "sourceLine": 1111,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": "hero",
    "kind": "dialogue",
    "textSha256": "b208245f79086ba2418cde817208ea4081348207423dedb6c40c2bb60b346fc2",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:private",
    "camera": "scene",
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.old-pear-slope",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1625",
    "sourceLine": 1625,
    "branch": "common",
    "phase": "review",
    "speaker": "诺克缇娅",
    "portrait": "final_queen",
    "kind": "dialogue",
    "textSha256": "4fae81c87c105cdb7ab41bc5a3e8e69db394fa39d83eae5765740d3f5af8bb74",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene",
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.twilight-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1627",
    "sourceLine": 1627,
    "branch": "common",
    "phase": "review",
    "speaker": "纱雾",
    "portrait": "guide",
    "kind": "dialogue",
    "textSha256": "7fcf1489912352ef27191d8e9a0d33e58f0343207182dc3e889d2ebc9f7cfc46",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene",
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.twilight-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1629",
    "sourceLine": 1629,
    "branch": "common",
    "phase": "review",
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "6bd32b94295467748de58e8f959a290ba248b284818d7665aa19e07b18516e8b",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene",
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.twilight-veranda",
    "requiredEquals": {
      "warm.frozen": false
    }
  },
  {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1659",
    "sourceLine": 1659,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "f4123fd666a68e1e8bb20dec1640f7c341df2f75668d6ee72753e7c6dfbd86c0",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene",
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.twilight-veranda",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1671",
    "sourceLine": 1671,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "845e6be62c135915b659a7661b9ba85129f2176dc3e5cd174cfdca2677d1163e",
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene",
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.twilight-veranda",
    "requiredEquals": {
      "warm.frozen": true
    }
  },
  {
    "sceneId": "b30_relationship_offer",
    "turnId": "b30_relationship_offer.L1949",
    "sourceLine": 1949,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "e3bc441d85d523e67e1583001c933e2467b8be9adb36d6aaafbeb24834be3f7c",
    "locationId": "B-30.shawu-room",
    "backdropAssetId": "B_ENV_30:relationship_offer",
    "camera": "interior-closeup",
    "assetId": "B30.shawu-packed-by-door",
    "semanticLocationId": "B-26.shawu-bedroom",
    "requiredEquals": {
      "warm.frozen": true
    }
  }
]);
export function forestGalReuseArtRow(scene,turn){
 let snapshot;
 try {snapshot=readForestTurnSnapshot(turn,{sceneId:scene?.sceneId});} catch {return null;}
 if(!snapshot||snapshot.origin!=='runtime-resolve')return null;
 const row=forestGalExactArtRow(FOREST_GAL_REUSE_CONTRACT,scene,turn);
 if(!row||!Object.entries(row.requiredEquals).every(([path,value])=>path.split('.').reduce((item,key)=>item?.[key],snapshot)===value))return null;
 return row;
}
