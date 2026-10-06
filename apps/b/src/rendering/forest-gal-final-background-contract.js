// Approved exact final-environment additions. Preserve source, saved stages, and actor permissions.
import {readForestTurnSnapshot} from '../campaigns/b/story/state-snapshot.js';
import {forestGalExactArtRow} from './forest-gal-cg-contract.js';
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const same=(a,b)=>a===b||(a!==null&&b!==null&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)&&Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.hasOwn(b,k)&&same(a[k],b[k])));
export const FOREST_GAL_FINAL_BACKGROUND_CONTRACT=freeze([
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L279",
    "sourceLine": 279,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "d691eec0883843a8a663119105f98923edc4d25c5bbe13c68141f351676d5aa1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L281",
    "sourceLine": 281,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "textSha256": "6eafa77f6033362bee371fdc84121bd70c9f1027bf19c159038864e603fa2235",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L283",
    "sourceLine": 283,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "c0a98a9831638927f575735ae22dbb4bc6ccfce906cb41040a68a1e08d81dfbb",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L285",
    "sourceLine": 285,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "edca8f6256850f4dba0233570898a5aa7a31158c084dd7bc48be7b37bb1ab33e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L287",
    "sourceLine": 287,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "c2677d3f7610e496b53725143987559ac6c9d65cdc995065249a70e28ffc22ba",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L289",
    "sourceLine": 289,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "980331bde333b8c07b27925e8aa80cadec0fcd8e3b4642b75f4c4f7d62bbf9a7",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:pre",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:pre",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b05_valve",
    "turnId": "b05_valve.L297",
    "sourceLine": 297,
    "branch": "common",
    "phase": "valve",
    "speaker": "纱雾",
    "textSha256": "335420bdd0eb309e87060ec1dd392c8a347246bb81ee2ec69901046bad543db0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-05",
    "backdropAssetId": "B_ENV_05:valve",
    "camera": "scene",
    "stage": {
      "locationId": "B-05",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_05:valve",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_05",
    "semanticLocationId": "B-05.reviewed-exact-environment"
  },
  {
    "sceneId": "b10_enter",
    "turnId": "b10_enter.L571",
    "sourceLine": 571,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "1397c4552da5995bbad24c5ba85ed60e61f7ffbc490a6862cba4ee73bc29c7d1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-10",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_10:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_010P",
    "semanticLocationId": "B-10.reviewed-exact-environment"
  },
  {
    "sceneId": "b10_enter",
    "turnId": "b10_enter.L573",
    "sourceLine": 573,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "textSha256": "a9fde6b8971855f35eba9fe5938295932c3772e33964c35691ad3c468c47e1ea",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-10",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_10:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_010P",
    "semanticLocationId": "B-10.reviewed-exact-environment"
  },
  {
    "sceneId": "b10_enter",
    "turnId": "b10_enter.L575",
    "sourceLine": 575,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "bdc47f20253c7e7027e791951cae2f5d261f6bc5ee8b16ec676e84730acd17cf",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-10",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_10:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_010P",
    "semanticLocationId": "B-10.reviewed-exact-environment"
  },
  {
    "sceneId": "b10_enter",
    "turnId": "b10_enter.L577",
    "sourceLine": 577,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "4e5ecc29a4c7d6262cb5b030c5f18fe119ceb0abe32763fce867a196c13bff5e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-10",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_10:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_010P",
    "semanticLocationId": "B-10.reviewed-exact-environment"
  },
  {
    "sceneId": "b10_enter",
    "turnId": "b10_enter.L579",
    "sourceLine": 579,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "36575777553236b8c34c8880ffc9267414ba0e693fd5392da8e0f44779d16c97",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-10",
    "backdropAssetId": "B_ENV_10:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-10",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_10:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_010P",
    "semanticLocationId": "B-10.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L647",
    "sourceLine": 647,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "textSha256": "5c9b9d2f128952a04ba3e26389a918644106d6d075b68a604f597c389181f32e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "merchant",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L649",
    "sourceLine": 649,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "dc261443d85045b760f360f817af3026949f5b52de8a584a5bdb90ac4e3a6acc",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L651",
    "sourceLine": 651,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "4b4d6b7994f867c64cc18a4a86830cf1cd887960b58ac9f001f7a4902f93dc98",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L653",
    "sourceLine": 653,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "b5fe0d8e42bf214a74916d31523446825fcbfb509c8929304c4bb2d2cdcac3d8",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L655",
    "sourceLine": 655,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "textSha256": "09dec843c1ebf52ca3b9568d28e6439e19d26e037e653d5ef2c1243fa9f02fb1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "merchant",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L657",
    "sourceLine": 657,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "4ff9564ea21f264ec409d23487309c3c326c791936dd1457a85a98a332de3f0c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L659",
    "sourceLine": 659,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "c2a1b6f9adfa60176889d8ee5018c6e7afee8fa8a78497258e63f70f3e8b1f67",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-11",
    "backdropAssetId": "B_ENV_11:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-11",
      "actors": {
        "merchant": {
          "position": "scene-merchant"
        },
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_11:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_B11_ENV_001",
    "semanticLocationId": "B-11.reviewed-exact-environment"
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L923",
    "sourceLine": 923,
    "branch": "common",
    "phase": "delivery",
    "speaker": "旁白",
    "textSha256": "5b32ec2f34dc670be9c44df9d5d0b3a1c8529c72fed5cbdfa45831762626d98a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-15",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        },
        "merchant": {
          "position": "scene-merchant"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_15:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.reviewed-exact-environment"
  },
  {
    "sceneId": "b15_post",
    "turnId": "b15_post.L925",
    "sourceLine": 925,
    "branch": "common",
    "phase": "delivery",
    "speaker": "珂珂",
    "textSha256": "9c8a372a2d9c253682b9c19c5799fd3aab86aac5c6a1251bf9261aafa7ee23b0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "merchant",
    "locationId": "B-15",
    "backdropAssetId": "B_ENV_15:post",
    "camera": "scene",
    "stage": {
      "locationId": "B-15",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        },
        "merchant": {
          "position": "scene-merchant"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_15:post",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_15_REPAIRED",
    "semanticLocationId": "B-15.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L941",
    "sourceLine": 941,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "c093f07ec83825106d7c68f864e0669d329cac11e4ccd5ada2c210be91a7e20c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L943",
    "sourceLine": 943,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "b17fac998b735b41e5c27cbc08bf15ab2ab56b0df831793e359bdb0528007aed",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L945",
    "sourceLine": 945,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "3739d57a9c3a449d39cfb15f29e75462b2f88d37acfe6776a1a112ccf68e1aa2",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L947",
    "sourceLine": 947,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "aafa7be8d1416c077a305713ee8344d17ac11f14f8455476b188e1e130c3a3f2",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L949",
    "sourceLine": 949,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "7253f032a219ffac3a6104e43d0c4f187d7974508b78defb82efe3aeabd45b98",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L951",
    "sourceLine": 951,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "464bdf9a37882d035d980c0e7a0e205b493fb40173ba6af99e2a18ac96f1fcfe",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_enter",
    "turnId": "b16_enter.L953",
    "sourceLine": 953,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "4bb2d45eff5f3660138f46bb370ca3ae599acfd65300fcb4f390fea5bc720b59",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L973",
    "sourceLine": 973,
    "branch": "originalPost",
    "phase": null,
    "speaker": "璃",
    "textSha256": "db414c928b7cbfb5757c511edaa606ee8072cb68410688e89cabaabb452bd28a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016B",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L975",
    "sourceLine": 975,
    "branch": "originalPost",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "425c233fec567ec57bdf508d238a6cb8cf821cb3e8e51a84d7841a79e6236956",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_016B",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_enter",
    "turnId": "b21_enter.L1285",
    "sourceLine": 1285,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "a1137f932965a026e2e8137f2738a79cdec887c77ef11ef65530cfe79858c922",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_enter",
    "turnId": "b21_enter.L1287",
    "sourceLine": 1287,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "7fbdb2f5c0b7bfa2c94a8e2961e6c50b72a97f77dadce524eef7b080e87982d4",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_enter",
    "turnId": "b21_enter.L1289",
    "sourceLine": 1289,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "b259099bca58c25a531d146df95d436997943493385eafe563d3453d1768b763",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_enter",
    "turnId": "b21_enter.L1291",
    "sourceLine": 1291,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "c9e4bedb9b05a84cbff92efdac5aa309bf421487e684bb64ca36f810948abb69",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1309",
    "sourceLine": 1309,
    "branch": "originalPre",
    "phase": null,
    "speaker": "璃",
    "textSha256": "29239d87261863ad0888e53120a02871e3f3388cc0de2e4949d543770db05911",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1309",
    "sourceLine": 1309,
    "branch": "originalPre",
    "phase": null,
    "speaker": "璃",
    "textSha256": "29239d87261863ad0888e53120a02871e3f3388cc0de2e4949d543770db05911",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1311",
    "sourceLine": 1311,
    "branch": "originalPre",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "275ba4a14f471fca3f8442050d814afac037fb7a76ff1f0eb3aac12d2448e2b0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1311",
    "sourceLine": 1311,
    "branch": "originalPre",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "275ba4a14f471fca3f8442050d814afac037fb7a76ff1f0eb3aac12d2448e2b0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1317",
    "sourceLine": 1317,
    "branch": "originalPost",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "a09fab848c8169c5e7187c9823cacb2d30d8936b4f9af89ff462a603f38bebf6",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1319",
    "sourceLine": 1319,
    "branch": "originalPost",
    "phase": null,
    "speaker": "璃",
    "textSha256": "b452c2369dbf9f114d8f42fab77ac316f2ee753d646bc1dc17fa15f66a64903c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1323",
    "sourceLine": 1323,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "3b5ccc3b9be7b1e4d5e6ffd65059a2dc01914c7cace08b3c97efd0db8f529c51",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1323",
    "sourceLine": 1323,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "3b5ccc3b9be7b1e4d5e6ffd65059a2dc01914c7cace08b3c97efd0db8f529c51",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1325",
    "sourceLine": 1325,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "a6410439067f0f9b5177791e1972fdea2c5809f9658f2115655544e5ce6c7d85",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1325",
    "sourceLine": 1325,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "a6410439067f0f9b5177791e1972fdea2c5809f9658f2115655544e5ce6c7d85",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1327",
    "sourceLine": 1327,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "a512661c69f09e9c4c4304d6e4385314641157c642a4788716e2c0d98ab180c1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1327",
    "sourceLine": 1327,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "a512661c69f09e9c4c4304d6e4385314641157c642a4788716e2c0d98ab180c1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1329",
    "sourceLine": 1329,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "b40a60f4b65d038f0e88922e4bfbd2da2f049f6cb11130b66180ef4658c76b68",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1329",
    "sourceLine": 1329,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "b40a60f4b65d038f0e88922e4bfbd2da2f049f6cb11130b66180ef4658c76b68",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1331",
    "sourceLine": 1331,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "78f732beb6d59d0e19e87a88a78b334b4140c30e4f2e47cb820cd904fb5c4199",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_021O",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_exit",
    "turnId": "b21_exit.L1331",
    "sourceLine": 1331,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "78f732beb6d59d0e19e87a88a78b334b4140c30e4f2e47cb820cd904fb5c4199",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:exit",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:exit",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_enter",
    "turnId": "b24_enter.L1469",
    "sourceLine": 1469,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "1570a755557394c1d7c306bae52601630f6a0dad7c3204e171b1dbf10b871d04",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_enter",
    "turnId": "b24_enter.L1471",
    "sourceLine": 1471,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "textSha256": "f5abe564d4923e660a0b4dc40bedd88752aecd3dba1e9fa7b678b1413b710edc",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_enter",
    "turnId": "b24_enter.L1473",
    "sourceLine": 1473,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "44492795c86c9a292cc08aa486a4a0aad6372afb57580794f4a16e5227fa6ded",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_enter",
    "turnId": "b24_enter.L1475",
    "sourceLine": 1475,
    "branch": "common",
    "phase": null,
    "speaker": "工队住民",
    "textSha256": "3e7a0531830e1e654263ee9a2b19d9a1728b144ebab3f0a9e932565f17ec6506",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1491",
    "sourceLine": 1491,
    "branch": "originalPre",
    "phase": null,
    "speaker": "璃",
    "textSha256": "30da5dee45b2f56c690739d7587779e4c44bf5949b85d5f8f8070ac69aa25d4d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1491",
    "sourceLine": 1491,
    "branch": "originalPre",
    "phase": null,
    "speaker": "璃",
    "textSha256": "30da5dee45b2f56c690739d7587779e4c44bf5949b85d5f8f8070ac69aa25d4d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_024R",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1497",
    "sourceLine": 1497,
    "branch": "originalPost",
    "phase": "retrieved",
    "speaker": "工队住民",
    "textSha256": "9e6967ea09bed54d58c5a9074b5f7d2f8f044ad99286bba09893235ff742baab",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": false,
        "rootWorksDone": false
      }
    },
    "assetId": "B_FINAL_BENV_024O",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b25_valve",
    "turnId": "b25_valve.L1531",
    "sourceLine": 1531,
    "branch": "common",
    "phase": "valve",
    "speaker": "纱雾",
    "textSha256": "3e443c4fbfea1a9793d95ff0ff6ed8d223c1f7f7962bf707d7d3237360fecfae",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-25",
    "backdropAssetId": "B_ENV_25:valve",
    "camera": "scene",
    "stage": {
      "locationId": "B-25",
      "actors": {
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_25:valve",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_025",
    "semanticLocationId": "B-25.reviewed-exact-environment"
  },
  {
    "sceneId": "b25_valve",
    "turnId": "b25_valve.L1533",
    "sourceLine": 1533,
    "branch": "common",
    "phase": "waterTest",
    "speaker": "旁白",
    "textSha256": "6c848a8b9e637e79856617fb8fdd64e0f7bc28b72591447041c0f9371131272e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-25",
    "backdropAssetId": "B_ENV_25:valve",
    "camera": "scene",
    "stage": {
      "locationId": "B-25",
      "actors": {
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_25:valve",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_025",
    "semanticLocationId": "B-25.reviewed-exact-environment"
  },
  {
    "sceneId": "b17_offer",
    "turnId": "b17_offer.L1029",
    "sourceLine": 1029,
    "branch": "invest",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "39a71b95852b1d2e72dd04ac3113f4d6ea313ac5dfa5f286f173f80d650997a4",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b17_offer",
    "turnId": "b17_offer.L1031",
    "sourceLine": 1031,
    "branch": "invest",
    "phase": null,
    "speaker": "璃",
    "textSha256": "71923721c03713cd22efd09c0abaa3d2923a3a343c33c329370b9454dc968e67",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b17_offer",
    "turnId": "b17_offer.L1033",
    "sourceLine": 1033,
    "branch": "invest",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "ab90293167a637ad654e90a632d501e316c9a2eef022d410c11eabf5db39cca3",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b17_offer",
    "turnId": "b17_offer.L1035",
    "sourceLine": 1035,
    "branch": "invest",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "b8aba7fe93070c5319abaff557b1cfe7515ce037157a42f2306bc53ec2a02ac0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_REUSE_17_PRECHOICE",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b18_offer",
    "turnId": "b18_offer.L1121",
    "sourceLine": 1121,
    "branch": "invest",
    "phase": null,
    "speaker": "璃",
    "textSha256": "56a57f9bff5c084990a193d5d6a8577f83dd720cfccba5a143e37130bd721ef5",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-18",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_18:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b18_offer",
    "turnId": "b18_offer.L1123",
    "sourceLine": 1123,
    "branch": "invest",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "9921f2a8de781802415d0459117f8131cef0f6a53b3e12666c64cb0d94287477",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-18",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_18:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B18_original_live_tree",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b26_review",
    "turnId": "b26_review.L1651",
    "sourceLine": 1651,
    "branch": "confirm",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "d9769cf6bc7249a4b29da8b29d7fa108d1e28651e8e1f5e360deebff4d88cb77",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:review",
    "camera": "scene",
    "stage": {
      "locationId": "B-03",
      "actors": {
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        },
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_26:review",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.reviewed-exact-environment"
  },
  {
    "sceneId": "b26_noctia",
    "turnId": "b26_noctia.L1655",
    "sourceLine": 1655,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "afb3e09cefc74ca4cd58dff4d559002db32ebaf40f1e046958ea6e8376639ebe",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-03",
    "backdropAssetId": "B_ENV_26:noctia",
    "camera": "scene",
    "stage": {
      "locationId": "B-03",
      "actors": {
        "cat_boss": {
          "position": "scene-cat_boss"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "fox_boss": {
          "position": "scene-fox_boss"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_26:noctia",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B26.twilight-veranda",
    "semanticLocationId": "B-03.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1677",
    "sourceLine": 1677,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "旁白",
    "textSha256": "7876fc11183dc40dd2ce33bd8a07bc23af0ab000e186b795299fa13c5f2b0e15",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1679",
    "sourceLine": 1679,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "璃",
    "textSha256": "58f33c4de5ea8859ed2a422a49a23cfe0a54a9ea07a2c0f9325155839707555b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1681",
    "sourceLine": 1681,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "诺克缇娅",
    "textSha256": "55a21a9c3153935b808748b4f329a761e2ab662b4c5dfab2d487c192da9de652",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "final_queen",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1683",
    "sourceLine": 1683,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "纱雾",
    "textSha256": "2eb929b3784692e97e67b6a13e6bb6ecec86f5aeb84ba462bae4b94b370cb4a9",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1685",
    "sourceLine": 1685,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "诺克缇娅",
    "textSha256": "c709580f31a26271fdbe5b0c1125194064d65ba3ea080a4dedae567dc08d2c30",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "final_queen",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1687",
    "sourceLine": 1687,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "璃",
    "textSha256": "1d5c2fdb7ea5d2509bd65ead2f75f1c8e98243a5f6663c5a4460fa9a50ee4963",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b27_enter",
    "turnId": "b27_enter.L1689",
    "sourceLine": 1689,
    "branch": "common",
    "phase": "beforePack",
    "speaker": "诺克缇娅",
    "textSha256": "8b72b9e7188a20daddc957918e943fc35bb6b417c538f8a53c6d05af214a53b1",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "final_queen",
    "locationId": "B-27",
    "backdropAssetId": "B_ENV_27:enter",
    "camera": "scene",
    "stage": {
      "locationId": "B-27",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "final_queen": {
          "position": "scene-final_queen"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_27:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_FINAL_BENV_027",
    "semanticLocationId": "B-27.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_enter",
    "turnId": "b30_enter.L1829",
    "sourceLine": 1829,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "d4cab4f168918eb6547bc5191f6bf6e8189bf976508cfb5cd99a211ad86bf1c2",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-29.home",
    "backdropAssetId": "B_ENV_30:enter",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-29.home",
      "actors": {
        "final_queen": {
          "position": "window"
        },
        "cat_boss": {
          "position": "door"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B30.noctia-winter-before-lunch",
    "semanticLocationId": "B-29.home.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_enter",
    "turnId": "b30_enter.L1837",
    "sourceLine": 1837,
    "branch": "common",
    "phase": null,
    "speaker": "诺克缇娅",
    "textSha256": "caf7fd8995c4750c97be13c990e958cc13b5739d37f42b1263988103c80827ec",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "final_queen",
    "locationId": "B-29.home",
    "backdropAssetId": "B_ENV_30:enter",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-29.home",
      "actors": {
        "final_queen": {
          "position": "window"
        },
        "cat_boss": {
          "position": "door"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:enter",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B30.noctia-winter-before-lunch",
    "semanticLocationId": "B-29.home.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1877",
    "sourceLine": 1877,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "2fe85c2c64f52af90c652b3e10e76616d6a4a5a309013a3efd9efa86d515e799",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B18.winter-retained-new-slope",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1881",
    "sourceLine": 1881,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "textSha256": "697b9f9918787b1e92cb6f9dd26bd236186966e7ac6cf183b1aa6bbfa6dabfdb",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "cat_boss",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-greenhouse_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "hero": {
          "position": "lodge-door"
        },
        "cat_boss": {
          "position": "ordinary-stove"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-greenhouse_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1885",
    "sourceLine": 1885,
    "branch": "common",
    "phase": null,
    "speaker": "米露",
    "textSha256": "35105f9e020f05d227b9c1c0eb9bcaf7bde5fb5d7cc8e59749311ff663d8f8c9",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "cat_boss",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-greenhouse_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "hero": {
          "position": "lodge-door"
        },
        "cat_boss": {
          "position": "ordinary-stove"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-greenhouse_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_pear",
    "turnId": "b30_heat_greenhouse_pear.L1887",
    "sourceLine": 1887,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "3a6a6da0da6bdfa689abcc8556cac6121fcd78f373b4f52285200e7bc5960e67",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B18.winter-retained-new-slope",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2041",
    "sourceLine": 2041,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "1f263bb92768b463897bc32fdb2dc87465a377f6224851ad865d7a5054f14d89",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-14.riverbank-greenhouse",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.riverbank-greenhouse",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_ordinary_greenhouse",
    "semanticLocationId": "B-14.riverbank-greenhouse.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2043",
    "sourceLine": 2043,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "6b7215a85d4b4d2fca3f51c761a09cc00026304ca8f1387bb465ba5d20182ef3",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-14.riverbank-greenhouse",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.riverbank-greenhouse",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_ordinary_greenhouse",
    "semanticLocationId": "B-14.riverbank-greenhouse.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2045",
    "sourceLine": 2045,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "4e9819128d2967531a1e92ee5be30401f1249ad54e48c70c170cd1918fe73056",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-14.riverbank-greenhouse",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.riverbank-greenhouse",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_ordinary_greenhouse",
    "semanticLocationId": "B-14.riverbank-greenhouse.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2047",
    "sourceLine": 2047,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "4a214d128a218aa7d532b19c5e9c956723ab360a198923aa2abf82bcb0113c22",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2049",
    "sourceLine": 2049,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "e2cc81f0b343a648272f5a40d975af4742d6e250c492765cda7b1fba87ba1d81",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2051",
    "sourceLine": 2051,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "f136ea8e34d85302aa756c488240297ada1f33cbda7bd524f448b869f1617fed",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2053",
    "sourceLine": 2053,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "6b1291b39beec12d3710b6f1ef4ba557720b9185dbbccc87c8f06e065b80e01b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2055",
    "sourceLine": 2055,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "646a7a500a93f3289a8384993cbf43bf896b34e5eb51265898b4f24b597b4294",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_end_two_ends",
    "turnId": "b30_end_two_ends.L2057",
    "sourceLine": 2057,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "e23e69d1bc5658baf7cbd1bacf1de004c80560bb11811e31a9336593f848a84b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-14.inn-table",
    "backdropAssetId": "B_ENV_30:end_two_ends",
    "camera": "interior-closeup",
    "stage": {
      "locationId": "B-14.inn-table",
      "actors": {
        "hero": {
          "position": "door"
        },
        "guide": {
          "position": "map-table"
        }
      },
      "offscreen": {},
      "camera": "interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "cgAssetId": "B_CG_b30_end_two_ends:approved-canon-interior",
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B14_inn_common_room",
    "semanticLocationId": "B-14.inn-table.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "7f009f53053114b24131c203984c3dd9dcaee48ec3375142528acc4bcbc49a1a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "7f009f53053114b24131c203984c3dd9dcaee48ec3375142528acc4bcbc49a1a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "7f009f53053114b24131c203984c3dd9dcaee48ec3375142528acc4bcbc49a1a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927.2",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "6248c43c6710005f83e6ce222da150c1ce8139902febc83e90722b919cef43a0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927.2",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "6248c43c6710005f83e6ce222da150c1ce8139902febc83e90722b919cef43a0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1927.2",
    "sourceLine": 1927,
    "branch": "greenhouseOff",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "6248c43c6710005f83e6ce222da150c1ce8139902febc83e90722b919cef43a0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouseOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "e3536a238a5c5533f7e06977e2bb2a40e17acb6b48711092fa5423f023644f2a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "e3536a238a5c5533f7e06977e2bb2a40e17acb6b48711092fa5423f023644f2a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "e3536a238a5c5533f7e06977e2bb2a40e17acb6b48711092fa5423f023644f2a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931.2",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "e31fbc765c64e13df0d689d6a93f9245f0c1a578c7929af3264f1424510b280a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931.2",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "e31fbc765c64e13df0d689d6a93f9245f0c1a578c7929af3264f1424510b280a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1931.2",
    "sourceLine": 1931,
    "branch": "pearOff",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "e31fbc765c64e13df0d689d6a93f9245f0c1a578c7929af3264f1424510b280a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOff",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "a3729454410b8fdde758bd8eb23925cbf107507a5429fc98df3e50b4e48e686a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "a3729454410b8fdde758bd8eb23925cbf107507a5429fc98df3e50b4e48e686a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "a3729454410b8fdde758bd8eb23925cbf107507a5429fc98df3e50b4e48e686a",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935.2",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "米露",
    "textSha256": "7b09a2a6477df374bb1aeeaef1e6e535b5b86f68e5ee1e4225901f25f1e46bde",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "cat_boss",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935.2",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "米露",
    "textSha256": "7b09a2a6477df374bb1aeeaef1e6e535b5b86f68e5ee1e4225901f25f1e46bde",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "cat_boss",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1935.2",
    "sourceLine": 1935,
    "branch": "lodgeOff",
    "phase": null,
    "speaker": "米露",
    "textSha256": "7b09a2a6477df374bb1aeeaef1e6e535b5b86f68e5ee1e4225901f25f1e46bde",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "cat_boss",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-lodgeOff",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "fox_boss": {
          "position": "scene-fox_boss"
        },
        "guide": {
          "position": "scene-guide"
        },
        "cat_boss": {
          "position": "scene-cat_boss"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-lodgeOff",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L963",
    "sourceLine": 963,
    "branch": "root",
    "phase": "works",
    "speaker": "工队住民",
    "textSha256": "ba0f4fd063f3c63d69084e91ed91491bb62396c3254c4ffd2935a13513526d6c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_016A",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L963",
    "sourceLine": 963,
    "branch": "root",
    "phase": "works",
    "speaker": "工队住民",
    "textSha256": "ba0f4fd063f3c63d69084e91ed91491bb62396c3254c4ffd2935a13513526d6c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B16.both-complete",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L965",
    "sourceLine": 965,
    "branch": "root",
    "phase": "works",
    "speaker": "璃",
    "textSha256": "d203a3a07e779d580315c0c7051012b1976f3a98a2d7a7f6d2167568245b3e14",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_016A",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L967",
    "sourceLine": 967,
    "branch": "root",
    "phase": "works",
    "speaker": "纱雾",
    "textSha256": "769fedb185b8f5e8273d07532779a432d18a93d0a34a04f2f63d9c88f0b297c0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_016A",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L967",
    "sourceLine": 967,
    "branch": "root",
    "phase": "works",
    "speaker": "纱雾",
    "textSha256": "769fedb185b8f5e8273d07532779a432d18a93d0a34a04f2f63d9c88f0b297c0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B16.both-complete",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b19_offer",
    "turnId": "b19_offer.L1177",
    "sourceLine": 1177,
    "branch": "invest",
    "phase": null,
    "speaker": "璃",
    "textSha256": "1c4c50db72f1a60ac64d6171b06acbdaaf4d392e908b03925c0b16308cc8ba31",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B19_ordinary_lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b19_offer",
    "turnId": "b19_offer.L1181",
    "sourceLine": 1181,
    "branch": "invest",
    "phase": null,
    "speaker": "工队住民",
    "textSha256": "feb17e07bb9da0871084ff89074c417d58b4fd5622f46e1e392d10927af43a0f",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B19_ordinary_lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b19_offer",
    "turnId": "b19_offer.L1183",
    "sourceLine": 1183,
    "branch": "invest",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "39f9274f655bb50171fff50f8ddbd8f5b99f0543d68d117e5919a53958995a5c",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:offer",
    "camera": "scene",
    "stage": {
      "locationId": "B-19",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:offer",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {},
    "assetId": "B_ENV_STATE_B19_ordinary_lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b07_choice",
    "turnId": "b07_choice.L429",
    "sourceLine": 429,
    "branch": "originalPre",
    "phase": null,
    "speaker": "璃",
    "textSha256": "a21035d70800608ece79f3306ed8a7ebdc52a227ac44b645a0ec5cf49a06efaf",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:choice",
    "camera": "scene",
    "stage": {
      "locationId": "B-07",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_07:choice",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.07": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_REMAINING_ROOTONLY",
    "semanticLocationId": "B-07.reviewed-exact-environment"
  },
  {
    "sceneId": "b07_choice",
    "turnId": "b07_choice.L431",
    "sourceLine": 431,
    "branch": "originalPre",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "479e2d55b56a9845d23f52d727abda6e29cb49558c04c0e3cbc8603e02ed74eb",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:choice",
    "camera": "scene",
    "stage": {
      "locationId": "B-07",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_07:choice",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.07": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_REMAINING_ROOTONLY",
    "semanticLocationId": "B-07.reviewed-exact-environment"
  },
  {
    "sceneId": "b07_choice",
    "turnId": "b07_choice.L433",
    "sourceLine": 433,
    "branch": "originalPre",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "6a7d2f70915029f5c5eb35a6aa23e7777273c22b2738c997276483442e1e7446",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-07",
    "backdropAssetId": "B_ENV_07:choice",
    "camera": "scene",
    "stage": {
      "locationId": "B-07",
      "actors": {
        "guide": {
          "position": "scene-guide"
        },
        "hero": {
          "position": "scene-hero"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_07:choice",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.07": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_REMAINING_ROOTONLY",
    "semanticLocationId": "B-07.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1847",
    "sourceLine": 1847,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "ce08619c82872794e80f6cdad1ed69989e0d83e1264d2564f71d0510fbfa8a4d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-greenhouse_lodge",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "fox_boss": {
          "position": "greenhouse-inner-room"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B17.winter-retained",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1851",
    "sourceLine": 1851,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "53adef5d64324efed8e29e5c70b2b9c6336bcea8cde33a7388a6abf5f400f3a3",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-19",
    "backdropAssetId": "B_ENV_19:winter-greenhouse_lodge",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-19",
      "actors": {},
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_19:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B19.winter-retained-warm-lodge",
    "semanticLocationId": "B-19.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1853",
    "sourceLine": 1853,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "18092b8cfcbef1478482c4019a435f48812be344c0ca3c1731b75560c42c1e6d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1855",
    "sourceLine": 1855,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "11badd24e8e73586d30b17fe97667e6c9f846300a2e8d10c5e2ebf2fb4911252",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1857",
    "sourceLine": 1857,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "765409265290ad91a7c1eaec02ac7062cd806c28cfc34efb8ccee5e97344a6a5",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1859",
    "sourceLine": 1859,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "68ed8b7b5f6ee1034a0691d49e78723dd68b79fcba299e55ca16accb02cb632f",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1861",
    "sourceLine": 1861,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "96a4a849ba21750aa8021646d091e68c9e2f22022e7aa80c24e7dbc8f20697f7",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1863",
    "sourceLine": 1863,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "4dd7657efa3bb8449222810153caa0c8273dac8874385c8a6f67f4dbf5069cac",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1865",
    "sourceLine": 1865,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "8cd54df26c437a9e8d8a6a592edc2b85c58974429e4c1e90cef4ee8ebb9cdd39",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_greenhouse_lodge",
    "turnId": "b30_heat_greenhouse_lodge.L1867",
    "sourceLine": 1867,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "32b3f91262026017267b8d89b43fe53155832d4c5806ea853deab79fcd84e49b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-greenhouse_lodge",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": true,
        "pear": false,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_018L",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1301",
    "sourceLine": 1301,
    "branch": "root",
    "phase": "works",
    "speaker": "璃",
    "textSha256": "c6907d1726633f53c8a023c25b557edc6235d0250563c10b0a3a375604fa5911",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1303",
    "sourceLine": 1303,
    "branch": "root",
    "phase": "works",
    "speaker": "工队住民",
    "textSha256": "fc125b22dc5c63fa5b58fbd4fa907d4ea9f076340d707149cb9740ca76291977",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1303",
    "sourceLine": 1303,
    "branch": "root",
    "phase": "works",
    "speaker": "工队住民",
    "textSha256": "fc125b22dc5c63fa5b58fbd4fa907d4ea9f076340d707149cb9740ca76291977",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": null,
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B21.both-complete",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1305",
    "sourceLine": 1305,
    "branch": "root",
    "phase": "works",
    "speaker": "纱雾",
    "textSha256": "19e4c7979cdc2dad532d6c04277075f3bc6fda1e1ccf08af723f7e889df3fc55",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_021R",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1305",
    "sourceLine": 1305,
    "branch": "root",
    "phase": "works",
    "speaker": "纱雾",
    "textSha256": "19e4c7979cdc2dad532d6c04277075f3bc6fda1e1ccf08af723f7e889df3fc55",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B21.both-complete",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1485",
    "sourceLine": 1485,
    "branch": "root",
    "phase": "retrieved",
    "speaker": "璃",
    "textSha256": "1a8888baa28fe40205a13b274e2f339dd57abb7da9b49954c9866ec4fd314d3b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_024R",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b24_route",
    "turnId": "b24_route.L1487",
    "sourceLine": 1487,
    "branch": "root",
    "phase": "retrieved",
    "speaker": "纱雾",
    "textSha256": "d9e9e76abc54c28d3b09837d2bc0c23fe3265d6d8e75d2da886d3c2570a6428f",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-24",
    "backdropAssetId": "B_ENV_24:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-24",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_24:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.24": {
        "originalCleared": false,
        "originalWorksDone": false,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B_FINAL_BENV_024R",
    "semanticLocationId": "B-24.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1903",
    "sourceLine": 1903,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "c69321f4722039167684b26e0fc2355c6227a74d32dffe026d638c109188cf54",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1905",
    "sourceLine": 1905,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "61e8456efe215dd9ffc16d296d444c54ed02f6e1803841546bda30e71b071916",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1907",
    "sourceLine": 1907,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "52d3f80efb087da84e9488d493e1b88dd8ad5085d18c7353224305b5b19df462",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1909",
    "sourceLine": 1909,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "textSha256": "267cff841378c6c13297601cba99bdd3e64193e5382c3f6eaf2d7732c25fa82e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1911",
    "sourceLine": 1911,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "9b744d0f04b6ca5c11cb86321f5904ffb051d0c4fe1efa964fd847f56cd401e0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1915",
    "sourceLine": 1915,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "textSha256": "4e48560ffad38033fa77eee16cb803c55de9b8fba5ac96b7d8f5ead095465fa0",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "guide",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_lodge_pear",
    "turnId": "b30_heat_lodge_pear.L1917",
    "sourceLine": 1917,
    "branch": "common",
    "phase": null,
    "speaker": "绯叶",
    "textSha256": "7cac8240ea2d4f9ec4e52be401411df8f5f7f32619ebaf74668cf84ebf2b943b",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "fox_boss",
    "locationId": "B-17",
    "backdropAssetId": "B_ENV_17:winter-lodge_pear",
    "camera": "winter-interior-closeup",
    "stage": {
      "locationId": "B-17",
      "actors": {
        "hero": {
          "position": "greenhouse-outer-room"
        },
        "guide": {
          "position": "greenhouse-outer-room"
        },
        "fox_boss": {
          "position": "specimen-table"
        }
      },
      "offscreen": {},
      "camera": "winter-interior-closeup",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_17:winter-lodge_pear",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": true,
        "frozen": true
      }
    },
    "assetId": "B_FINAL_BENV_017L",
    "semanticLocationId": "B-17.reviewed-exact-environment"
  },
  {
    "sceneId": "b16_route",
    "turnId": "b16_route.L965",
    "sourceLine": 965,
    "branch": "root",
    "phase": "works",
    "speaker": "璃",
    "textSha256": "7aef65247519c2a86a4806b56cd52589fdce87143f1f73ebee29857c49c25603",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-16",
    "backdropAssetId": "B_ENV_16:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-16",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_16:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.16": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B16.both-complete",
    "semanticLocationId": "B-16.reviewed-exact-environment"
  },
  {
    "sceneId": "b21_route",
    "turnId": "b21_route.L1301",
    "sourceLine": 1301,
    "branch": "root",
    "phase": "works",
    "speaker": "璃",
    "textSha256": "a6c00a147f512f518a26d4ae5a14d161f072652867346fecaf3dc14c3ff7809d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "dialogue",
    "portrait": "hero",
    "locationId": "B-21",
    "backdropAssetId": "B_ENV_21:route",
    "camera": "scene",
    "stage": {
      "locationId": "B-21",
      "actors": {
        "hero": {
          "position": "scene-hero"
        },
        "guide": {
          "position": "scene-guide"
        }
      },
      "offscreen": {},
      "camera": "scene",
      "portraitAllowed": true,
      "backdropAssetId": "B_ENV_21:route",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": null
    },
    "requiredFacts": {
      "routes.21": {
        "originalCleared": true,
        "originalWorksDone": true,
        "rootFixed": true,
        "rootWorksDone": true
      }
    },
    "assetId": "B21.both-complete",
    "semanticLocationId": "B-21.reviewed-exact-environment"
  },
  {
    "sceneId": "b30_heat_partial",
    "turnId": "b30_heat_partial.L1929",
    "sourceLine": 1929,
    "branch": "pearOn",
    "phase": null,
    "speaker": "旁白",
    "textSha256": "1d648e6a98649881ab7d27d2518256411b376f1026e605b60833f9f298ceabd6",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "kind": "narration",
    "portrait": null,
    "locationId": "B-18",
    "backdropAssetId": "B_ENV_18:winter-pearOn",
    "camera": "exterior-empty-shot",
    "stage": {
      "locationId": "B-18",
      "actors": {},
      "offscreen": {
        "hero": "winter-clothed-outside-frame",
        "guide": "winter-clothed-outside-frame"
      },
      "camera": "exterior-empty-shot",
      "portraitAllowed": false,
      "backdropAssetId": "B_ENV_18:winter-pearOn",
      "cgAssetId": null,
      "assetStatus": "pending-validation",
      "clearActors": true,
      "allowImplicitHero": false,
      "allowLegacyBackdropFallback": false,
      "backgroundUrl": null,
      "cgUrl": null,
      "winterClothing": "worn-outside-not-rendered-in-unapproved-art"
    },
    "requiredFacts": {
      "warm": {
        "greenhouse": false,
        "pear": true,
        "lodge": false,
        "frozen": true
      }
    },
    "assetId": "B18.winter-retained-new-slope",
    "semanticLocationId": "B-18.reviewed-exact-environment"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.01",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "fadf8b0e965c1726a8a286168db78eb9ebd516d3927d9061cf028c48db529435",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.02",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "珂珂",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "ea9b2b8aff84ac30202fd35a42c66304098714a68aacb6810e53eb9b731abd51",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.03",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "冠蛾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "310c6bb09d5b36df9edd6599ddae3344be81dad459b3bc0eb63ef59aaf3d8bfe",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": "anthro"
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": "anthro",
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.04",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "cf51d3f4fb44bc1c4dd3bfe8d85c29146068f1f558e45574db84b193bf0d40b5",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.05",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "纱雾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "04c12bc7cc2e2e1f4fa82b90d663d785dea078a107f9198c055db4c65fda3fda",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.06",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "冠蛾",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "6682c4d081950067d8a63b0abf3c5eca1bd9c3e120f4d7afae631a82a7c131c5",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": "anthro"
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": "anthro",
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.07",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "璃",
    "portrait": null,
    "kind": "dialogue",
    "textSha256": "6c7e6a3132ac2b7e8dbd37862d7d503667286ed1135908aaefbdcdccddc6582e",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  },
  {
    "sceneId": "b06_moth_before",
    "turnId": "B.MON.R1.moth.before.08",
    "sourceLine": 0,
    "branch": "common",
    "phase": null,
    "speaker": "旁白",
    "portrait": null,
    "kind": "narration",
    "textSha256": "e58d46f551d3d0efab7727cd03292eeefd518ff9f2669deae72c0f44f6fc656d",
    "sourceHash": "8b85d53a010847119d95b1f3d8b75b7796a95617926a842fc75faaca34ca6320",
    "locationId": "B-06",
    "backdropAssetId": "B_ENV_06:moth",
    "camera": "scene",
    "stage": {
      "locationId": "B-06",
      "backdropAssetId": "B_ENV_06:moth",
      "camera": "scene",
      "portraitAllowed": false,
      "actors": {},
      "monsterForm": null
    },
    "requiredFacts": {},
    "monsterStoryRevision": "forest-species-r1",
    "monsterForm": null,
    "assetId": "B_FINAL_BENV_006M",
    "semanticLocationId": "B-06.moth-side-ledge"
  }
]);
export function forestGalFinalBackgroundRow(scene,turn){
 const candidates=FOREST_GAL_FINAL_BACKGROUND_CONTRACT.filter(row=>row.sceneId===scene?.sceneId&&row.turnId===turn?.id);
 if(!candidates.length)return null;
 let snapshot;try{snapshot=readForestTurnSnapshot(turn,{sceneId:scene.sceneId});}catch{return null;}
 if(!snapshot||snapshot.origin!=='runtime-resolve')return null;
 for(const row of candidates){
  if(snapshot.sourceHash!==row.sourceHash||!same(turn.stage,row.stage))continue;
  if(row.monsterStoryRevision&&(scene.monsterStoryRevision!==row.monsterStoryRevision||turn.monsterStoryRevision!==row.monsterStoryRevision||snapshot.monsterStoryRevision!==row.monsterStoryRevision||(turn.monsterForm??null)!==row.monsterForm))continue;
  if(!Object.entries(row.requiredFacts).every(([path,value])=>same(path.split('.').reduce((item,key)=>item?.[key],snapshot),value)))continue;
  // Existing reviewed dual-text adapter authorizes exactly the 24 species lines.
  // Match candidates separately because one turn can have several historic facts/texts.
  if(forestGalExactArtRow([row],scene,turn))return row;
 }
 return null;
}
