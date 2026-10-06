// Exact parallel contracts, only the 24 reviewed changed lines. Original rows stay intact.
import {readForestTurnSnapshot} from '../campaigns/b/story/state-snapshot.js';
import {NEW_MONSTER_REVISION} from '../campaigns/b/story/monster-identity.js';
export const FOREST_MONSTER_TEXT_CONTRACT=Object.freeze([
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L279",
    "legacyTextSha256": "d691eec0883843a8a663119105f98923edc4d25c5bbe13c68141f351676d5aa1",
    "textSha256": "1d67f499c0597cb1f77833fca017372d81960973cdef47a9da7e756f0cef2bd6"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L283",
    "legacyTextSha256": "c0a98a9831638927f575735ae22dbb4bc6ccfce906cb41040a68a1e08d81dfbb",
    "textSha256": "3241a7ad7ee960ceb405b66b41a7e97eaa9761156480c93b224fe422d97d94d1"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L285",
    "legacyTextSha256": "edca8f6256850f4dba0233570898a5aa7a31158c084dd7bc48be7b37bb1ab33e",
    "textSha256": "e7b766216cafe00746a21aed4d2abf3e00dc7ef59d2e2b73da9a46990aa4ac85"
  },
  {
    "sceneId": "b05_pre",
    "turnId": "b05_pre.L287",
    "legacyTextSha256": "c2677d3f7610e496b53725143987559ac6c9d65cdc995065249a70e28ffc22ba",
    "textSha256": "3b89e017e34dd9ff397c8822d49b1796c5f89b59d1e87fb945ac567c3d8d9039"
  },
  {
    "sceneId": "b05_valve",
    "turnId": "b05_valve.L295",
    "legacyTextSha256": "6afd13b7d4ce392026cfe8b4b0faf3c87bd52b1f18b58ba374f884b372c205f1",
    "textSha256": "30e6da5438da454b1248a1e33041e2e66cc609828b8add1b5184ee08873f4780"
  },
  {
    "sceneId": "b06_enter",
    "turnId": "b06_enter.L343",
    "legacyTextSha256": "9abad04ca50acb2f17c7c78b8561f838359a9ca7706e5b52e54f75afbfe3f362",
    "textSha256": "938ff92167f1738acc2422dbd0ac8d3650f8aa45d368a78c8d726fed6b4b072c"
  },
  {
    "sceneId": "b06_enter",
    "turnId": "b06_enter.L345",
    "legacyTextSha256": "a99cf9ab963d4bb46143bc4eefcefeabcbfdda19769f389c624146fb64461a22",
    "textSha256": "b331c6b7d6e4980c62e8830ca951a3824d9fb417e509e559821645e00cd6c2fd"
  },
  {
    "sceneId": "b06_enter",
    "turnId": "b06_enter.L347",
    "legacyTextSha256": "12086cc4665e0a43f23539df8cb7bc711caf607f9067a1fa8f688a8b7a83404c",
    "textSha256": "93b982391b98c14bac8a9f0c1f6ce1347d145198db784e598021fb55b11f2ecd"
  },
  {
    "sceneId": "b06_enter",
    "turnId": "b06_enter.L349",
    "legacyTextSha256": "0691aa85ef5c45589f9fd55d87b4d8f8f9f2b38f9b210a17a227c02b619ab41b",
    "textSha256": "928cba6744754e278ed4d2ca9f7a0299f918299a404499dc818a3a1b0513075e"
  },
  {
    "sceneId": "b06_pre",
    "turnId": "b06_pre.L353",
    "legacyTextSha256": "7621922247a354d87181b4319affc383933f906f9f8ca53a002109624d4d63e9",
    "textSha256": "a47f834ab131b1211eb8dfa0b47f84e5e87996b99d97930670da70ebcf10c4e2"
  },
  {
    "sceneId": "b06_pre",
    "turnId": "b06_pre.L355",
    "legacyTextSha256": "16f4faa6cf8f2e9d0ea2a4bd096b2365cd1cb9cf9068360591c899122a1cee10",
    "textSha256": "04b8ac2e3b223943f940436ec456d194ddb0b42b8a69c8623a74ab88f5a954ce"
  },
  {
    "sceneId": "b06_post",
    "turnId": "b06_post.L361",
    "legacyTextSha256": "7260d5de6d9ba64381cb7f4554d986b39bbcb2f113b0ae41876d1734c45eba73",
    "textSha256": "6c3d8e709d3b51c51000ec19ead242289a7e186fec04bf04ee6338313373a528"
  },
  {
    "sceneId": "b11_enter",
    "turnId": "b11_enter.L621",
    "legacyTextSha256": "bf577cab43732d235c2c78c29798e282e7725b56e06a00be9452a01e828f0c52",
    "textSha256": "2900a6e65538abe05107c732f159c9188d8ef886282f72fac996698bf209847f"
  },
  {
    "sceneId": "b11_enter",
    "turnId": "b11_enter.L623",
    "legacyTextSha256": "fa780b5bea10385c87b5c6b59b4f1bc6eb5b9e4f7bd6f79a95320ee749f5d5fd",
    "textSha256": "b7687873e8d2b3d1f61dbe9aff4b86180a1e41bbdb9ba9c05a527770e51b9881"
  },
  {
    "sceneId": "b11_enter",
    "turnId": "b11_enter.L625",
    "legacyTextSha256": "b27255fc2fbcbbef0aff58212d28bdf4df8180bea9a80db0f9250a62a834e535",
    "textSha256": "d7c0a7c3ec5ff41f4f408490f5e68690876088b0703ffaca4269781e3c402ff4"
  },
  {
    "sceneId": "b11_enter",
    "turnId": "b11_enter.L627",
    "legacyTextSha256": "2aaee3db651c1fa075dccf8894d43ff2a45201904f09276b79ddb3f44bd266ae",
    "textSha256": "ce1cb51d9aa0ebc35cc27ed9614da393e7a815534050aab3112cfeb22875adec"
  },
  {
    "sceneId": "b11_enter",
    "turnId": "b11_enter.L629",
    "legacyTextSha256": "42e147d0db7d36e11f51d0c62ce1e1dbcb410f0a4c3d435865a5eff25ca38f1b",
    "textSha256": "6168dc2997fa3ae177560972c8de6a89effd357ff3fe73fe48979a35048699d4"
  },
  {
    "sceneId": "b11_pre",
    "turnId": "b11_pre.L635",
    "legacyTextSha256": "9c7ae85e379871943d78b59893f3dd2d0bf3bd40f06c1bd8999aa3f23f6c97b3",
    "textSha256": "f0f192513321d6fe33ca771dcdeab368cc11f636460b656d7c0172c79cc7763c"
  },
  {
    "sceneId": "b11_pre",
    "turnId": "b11_pre.L637",
    "legacyTextSha256": "589d2dfd5e1ee5ca0fc113cfed45037fdcced93dc82cfcadf6fcaff22e3beec5",
    "textSha256": "435f97a3b92b25f515d50171367d76f0a99a710ab283bb818f018288f508d5be"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L645",
    "legacyTextSha256": "33d38a266e84de81184d9af8fefbb2645d31d851548e5c7e712c569e3b98ef95",
    "textSha256": "7269ea8d0fb72d824423a52e95645aeebebadbf19eeef30a48fc761d25409454"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L649",
    "legacyTextSha256": "dc261443d85045b760f360f817af3026949f5b52de8a584a5bdb90ac4e3a6acc",
    "textSha256": "096b19acd631280f76f7290da8eda434ce40d82c4f14b185a7f2779cfd862a07"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L651",
    "legacyTextSha256": "4b4d6b7994f867c64cc18a4a86830cf1cd887960b58ac9f001f7a4902f93dc98",
    "textSha256": "f81c393dc2243fb48bdf72402ee6b911f714708ebc4c9f2b7903407940e05dba"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L653",
    "legacyTextSha256": "b5fe0d8e42bf214a74916d31523446825fcbfb509c8929304c4bb2d2cdcac3d8",
    "textSha256": "60c2cf54b4e7d70c40efea05ffe2749306b671fa896c71956e70c991e0631fcc"
  },
  {
    "sceneId": "b11_post",
    "turnId": "b11_post.L655",
    "legacyTextSha256": "09dec843c1ebf52ca3b9568d28e6439e19d26e037e653d5ef2c1243fa9f02fb1",
    "textSha256": "91f68d41e44892506bc4e628898257e86792b8c9b46839e3cb32055caf37170d"
  }
]);
export function forestMonsterArtRow(row,sceneId,turn){
 const change=FOREST_MONSTER_TEXT_CONTRACT.find(c=>c.turnId===turn?.id&&c.sceneId===sceneId&&c.legacyTextSha256===row?.textSha256);
 if(!change||turn.monsterStoryRevision!==NEW_MONSTER_REVISION)return null;
 const snapshot=readForestTurnSnapshot(turn,{sceneId});
 if(!snapshot||snapshot.monsterStoryRevision!==NEW_MONSTER_REVISION||snapshot.authoredTextSha256!==change.legacyTextSha256||snapshot.resolvedTextSha256!==change.textSha256)return null;
 return {...row,textSha256:change.textSha256,monsterStoryRevision:NEW_MONSTER_REVISION};
}
