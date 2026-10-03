// B prose depth pass 2026-10-03. Turn IDs, branch gates, runtime and saved queues are unchanged.
export const FOREST_STORY_CONTENT = {
  "id": "forest-b-gal-v1.1",
  "schemaVersion": 1,
  "status": "new-opening-r1-plus-reviewed-dialogue-r1; B-environments-await-validation",
  "source": {
    "full-v1.1.md": {
      "path": "sources/full-v1.1.md",
      "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
    },
    "outline-v1.2.md": {
      "path": "sources/outline-v1.2.md",
      "sha256": "cd7ec8c8ae0835cc8cb02d069c1d8d5dc22d935ba77ff214337860773e63b350"
    },
    "road-semantics-v1.1.md": {
      "path": "sources/road-semantics-v1.1.md",
      "sha256": "9f7c70715421e2869514ed429639ba27b320434e017dd9a5ae6b17a2f90c3dc2"
    }
  },
  "order": [
    "b01_enter",
    "b01_pre",
    "b01_post",
    "b02_enter",
    "b02_choice",
    "b03_enter",
    "b03_rules",
    "b03_exit",
    "b04_enter",
    "b04_exit",
    "b05_pre",
    "b05_valve",
    "b05_revisit",
    "b06_enter",
    "b06_pre",
    "b06_post",
    "b07_enter",
    "b07_rules",
    "b07_choice",
    "b07_stone_post",
    "b07_revisit",
    "b08_enter",
    "b08_night",
    "b09_enter",
    "b09_pre",
    "b09_post",
    "b10_enter",
    "b10_valve",
    "b10_exit",
    "b11_enter",
    "b11_pre",
    "b11_post",
    "b12_enter",
    "b12_choice",
    "b13_enter",
    "b13_shop",
    "b13_depart",
    "b14_enter",
    "b14_after",
    "b14_greenhouse",
    "b15_enter",
    "b15_pre",
    "b15_post",
    "b15_exit",
    "b16_enter",
    "b16_route",
    "b16_exit",
    "b17_enter",
    "b17_offer",
    "b17_revisit",
    "b18_enter",
    "b18_private",
    "b18_offer",
    "b18_revisit",
    "b19_enter",
    "b19_offer",
    "b19_revisit",
    "b20_enter",
    "b20_valve",
    "b20_exit",
    "b21_enter",
    "b21_route",
    "b21_exit",
    "b22_enter",
    "b22_after",
    "b23_enter",
    "b23_home",
    "b23_shawu_reply",
    "b24_enter",
    "b24_route",
    "b24_warning",
    "b25_enter",
    "b25_valve",
    "b25_noctia",
    "b25_exit",
    "b26_enter",
    "b26_shawu",
    "b26_review",
    "b26_noctia",
    "b27_enter",
    "b27_before",
    "b28_pre",
    "b28_post",
    "b29_enter",
    "b29_home",
    "b29_shawu",
    "b30_enter",
    "b30_heat_greenhouse_lodge",
    "b30_heat_greenhouse_pear",
    "b30_heat_lodge_pear",
    "b30_heat_partial",
    "b30_relationship_offer",
    "b30_end_together",
    "b30_end_two_ends"
  ],
  "cast": {
    "hero": {
      "name": "璃",
      "portrait": "hero",
      "expression": "guarded"
    },
    "guide": {
      "name": "纱雾",
      "portrait": "guide",
      "expression": "gentle"
    },
    "merchant": {
      "name": "珂珂",
      "portrait": "merchant",
      "expression": "knowing"
    },
    "cat_boss": {
      "name": "米露",
      "portrait": "cat_boss",
      "expression": "alert"
    },
    "fox_boss": {
      "name": "绯叶",
      "portrait": "fox_boss",
      "expression": "watchful"
    },
    "final_queen": {
      "name": "诺克缇娅",
      "portrait": "final_queen",
      "expression": "cold"
    }
  },
  "scenes": {
    "b01_enter": {
      "id": "b01_enter",
      "title": "南坡村口",
      "regionId": "B-01",
      "turns": [
        {
          "id": "B.OPEN.R1.b01_enter.T001",
          "sourceLine": 7,
          "speaker": "旁白",
          "portrait": null,
          "text": "离村四年，璃还是记得南坡最后几级石阶。她跟着珂珂的货队回来，山下的冷风尚未吹干披肩，迎面已经暖了。屋檐滴着昨夜的雨，倒扣的木盆旁长出一簇嫩草。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T002",
          "sourceLine": 9,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "再帮我扶一下。别扶灯，扶背包下边。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T003",
          "sourceLine": 11,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃赶紧托住背包底下的木框。珂珂腾出一只手扶墙，跨过歪斜的台阶；挂在包上的灯轻轻撞了一下，璃等她站稳才松手。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T004",
          "sourceLine": 13,
          "speaker": "璃",
          "portrait": "hero",
          "text": "小心这级，右边低。我小时候在这里摔过，没想到四年了，它还等着绊我。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T005",
          "sourceLine": 15,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "那你回来得正好，认路的人多出点力。等车上的东西卸完，我得找米露说说这块石头。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T006",
          "sourceLine": 17,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "……璃？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T007",
          "sourceLine": 19,
          "speaker": "旁白",
          "portrait": null,
          "text": "门楼下，纱雾把一张旧地图捏在手里，原本要说的话停住了。璃望见她，手还托在已经离开的背包下面，过了一会儿才收回来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T008",
          "sourceLine": 21,
          "speaker": "璃",
          "portrait": "hero",
          "text": "珂珂这趟送货上山，我就跟来了。也想回来看看你。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T009",
          "sourceLine": 23,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你还知道回来。我刚才远远看着，怕又认错人。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T010",
          "sourceLine": 25,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "人是我带到门口了，车可还在下面。你们慢慢说，先让我把这个包放下，肩膀快跟木框长在一起了。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T011",
          "sourceLine": 27,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃接住珂珂卸下的一边背带，借着弯腰避开纱雾的目光。纱雾朝村里让了让，手中的地图却没有收好，纸角贴着指节。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T012",
          "sourceLine": 29,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "放门楼里面吧，地是干的。广场烧了热水……璃，你也先喝一口，披肩还湿着。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T013",
          "sourceLine": 31,
          "speaker": "旁白",
          "portrait": null,
          "text": "两位住民提着行囊从村里出来。窄道只能错开身子过，其中一人把包换到另一只手，朝纱雾招呼。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T014",
          "sourceLine": 33,
          "speaker": "住民",
          "portrait": null,
          "text": "我们去河谷看屋子。米露问起来，你替我说一声，后天回来搬箱子。还有一箱沉的，得等车。",
          "branch": "common"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T015",
          "sourceLine": 35,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "好。下坡的湿石头滑，别走最边上。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T016",
          "sourceLine": 37,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这就要搬下山了？出了什么事？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T017",
          "sourceLine": 39,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾送他们走过门洞，才低头把地图沿旧折痕压平。方才见到璃的那一点笑意已经收了。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T018",
          "sourceLine": 41,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "今年要停暖。老师一直守着树心，可它已经撑不了下一冬。有人先去河谷找住处，留下的人也得准备炉子和冬衣。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T019",
          "sourceLine": 43,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃的目光落回木盆旁的嫩草。她小时候总在这里脱下厚外套，进村就用不着了；眼前的屋檐、热气，几乎都没有变。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T020",
          "sourceLine": 45,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我一路还在想，回来就能暖和了。树都这样了，怎么还在发热？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T021",
          "sourceLine": 47,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它还在用以前留下的。老师会跟你说清楚。先进去吧，大家都在广场。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_enter.T022",
          "sourceLine": 49,
          "speaker": "旁白",
          "portrait": null,
          "text": "话音未落，窄道里响起木轮刮石的声音。刚过去的住民抱着行囊退回来，一只包掉在转角，木头重重撞上了墙。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_01:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
        "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
        "clarificationPatch": {
          "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
          "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
        },
        "authorship": "new-opening-r1-not-historical-restoration",
        "inheritedChoiceSource": {
          "file": "sources/full-v1.1.md",
          "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
        }
      },
      "branches": []
    },
    "b01_pre": {
      "id": "b01_pre",
      "title": "运木偶堵住窄口",
      "regionId": "B-01",
      "turns": [
        {
          "id": "B.OPEN.R1.b01_pre.T001",
          "sourceLine": 53,
          "speaker": "旁白",
          "portrait": null,
          "text": "旧运木偶横在窄口，载着木头的身子歪向挡土墙。前轮已经断了，后轮仍不停地推。住民伸手想捡行囊，载木臂忽然从他头顶抬起，碎屑落在包上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T002",
          "sourceLine": 55,
          "speaker": "璃",
          "portrait": "hero",
          "text": "回来！东西先放着，人退到我身后。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T003",
          "sourceLine": 57,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它还在往溪边送木头。以前这里没有这面墙，路改了，它一直照旧走。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T004",
          "sourceLine": 59,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "我拦着后面的人。璃，这里两边都是墙，行李和小车都挤不过去。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T005",
          "sourceLine": 61,
          "speaker": "璃",
          "portrait": "hero",
          "text": "纱雾，墙边那个开关还能用吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T006",
          "sourceLine": 63,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我试过，关不住。线断在底座里面了；它一动，就把那个口压住。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T007",
          "sourceLine": 65,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃等住民退过门楼，右手拔出剑。她沿墙看清木臂来回扫过的位置，又把落在脚边的行囊踢到身后。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_pre.T008",
          "sourceLine": 67,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我去拆驱动核。纱雾，帮我看住转角；珂珂，别让人过来抢东西，等轮子彻底停下再搬。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 69,
          "text": "【动态提示：预览运木偶固定战斗，可取消。】"
        }
      ],
      "backdropAssetId": "B_ENV_01:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
        "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
        "clarificationPatch": {
          "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
          "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
        },
        "authorship": "new-opening-r1-not-historical-restoration",
        "inheritedChoiceSource": {
          "file": "sources/full-v1.1.md",
          "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
        }
      },
      "branches": []
    },
    "b01_post": {
      "id": "b01_post",
      "title": "窄口通了",
      "regionId": "B-01",
      "turns": [
        {
          "id": "B.OPEN.R1.b01_post.T001",
          "sourceLine": 73,
          "speaker": "旁白",
          "portrait": null,
          "text": "载木臂终于垂下来。璃仍盯着后轮，等最后一声空转停了，才把剑收回左腰。两位住民试着搬开轻些的木块，将行囊从窄口一件件递过去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_post.T002",
          "sourceLine": 75,
          "speaker": "住民",
          "portrait": null,
          "text": "这个核，我们搬去废料棚？",
          "branch": "common"
        },
        {
          "id": "B.OPEN.R1.b01_post.T003",
          "sourceLine": 77,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先别碰，还烫着。拿那块石头垫住轮子，等核凉了再搬。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_post.T004",
          "sourceLine": 79,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃弯腰去提自己的包，手指碰到背带时，才发觉纱雾还站在身后。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_post.T005",
          "sourceLine": 81,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "璃，等一下。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_post.T006",
          "sourceLine": 83,
          "speaker": "旁白",
          "portrait": null,
          "text": "她转过身。纱雾看了一眼已经安静的木偶，又看回她，绷着的肩这才慢慢放下来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_post.T007",
          "sourceLine": 85,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "下回弄好了，跟我们说一声。我刚才一直看着你的手，还以为你哪里受伤了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b01_post.T008",
          "sourceLine": 87,
          "speaker": "璃",
          "portrait": "hero",
          "text": "没受伤。刚才顾着看轮子，忘了你们还在等。……现在好了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b01_post.T009",
          "sourceLine": 89,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾伸手替她拨开挂在背带上的一小片木屑。动作做到一半，两人都停了停，随后纱雾把那片木屑捏下来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b01_post.T010",
          "sourceLine": 91,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那就进去。刚才有好多话想问你，一急，都忘了。先把水喝了再说。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_01:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
        "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
        "clarificationPatch": {
          "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
          "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
        },
        "authorship": "new-opening-r1-not-historical-restoration",
        "inheritedChoiceSource": {
          "file": "sources/full-v1.1.md",
          "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
        }
      },
      "branches": []
    },
    "b02_enter": {
      "id": "b02_enter",
      "title": "回枝广场",
      "regionId": "B-02",
      "turns": [
        {
          "id": "B.OPEN.R1.b02_enter.T001",
          "sourceLine": 95,
          "speaker": "旁白",
          "portrait": null,
          "text": "回枝广场比璃记忆中挤了许多。装粮的筐靠着根盘，拆下的窗框一面面排在墙边。米露把圆盾靠在桌腿旁，抱着一摞布起身，尾巴险些扫进脚边的水洼。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T002",
          "sourceLine": 97,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "封门缝的布都放学舍了，按各家的窗拿，别一卷全抱走。要下山搬东西的，今晚来告诉我得用几趟车，我好给你们留位置。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T003",
          "sourceLine": 99,
          "speaker": "旁白",
          "portrait": null,
          "text": "有人举着窗框问钉子放在哪里，另一边又在喊缺一个粮筐。璃等米露放下手里的布才走过去，目光仍停在那些行囊上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T004",
          "sourceLine": 101,
          "speaker": "璃",
          "portrait": "hero",
          "text": "纱雾说树心撑不住了。要不先把人送到河谷？路上那些坏木偶我来清，别等冷起来了还困在这里。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T005",
          "sourceLine": 103,
          "speaker": "旁白",
          "portrait": null,
          "text": "抱窗框的住民没有接话，只把压在臂弯里的旧木头抱紧了些。璃这才认出他是在往家里搬。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T006",
          "sourceLine": 105,
          "speaker": "住民",
          "portrait": null,
          "text": "我先不走。窑在这里，粮也晒在这里，到了下面怎么过日子，还没想好。这窗框补一补能用，我先把自己屋里弄暖。",
          "branch": "common"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T007",
          "sourceLine": 107,
          "speaker": "另一位住民",
          "portrait": null,
          "text": "我倒想早点下去。昨天看的屋子靠着灶，价钱还得再问问。你要清路，先让我能带着箱子过就好。",
          "branch": "common"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T008",
          "sourceLine": 109,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好。想下去的先走，留下的……我也把上来的路清出来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T009",
          "sourceLine": 111,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "对，先让车过得去。下山的行李、上山的砖和柴，都等同一条路。你能跨过去的地方，车轮可跨不过去。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T010",
          "sourceLine": 113,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露去抽茶杯底下的路图，杯子晃了一下，热水沿货场的位置洇开。珂珂连忙托住纸角，把干布塞过去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T011",
          "sourceLine": 115,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "先救救我的货场。真正的砖还没运上来，图上的倒快泡烂了。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T012",
          "sourceLine": 117,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露把图铺平。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T013",
          "sourceLine": 119,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你看，南坡这条窄道能走人，大车进不来。车得走西石道，下到河谷，再绕北坡回来；几段桥坏了，旧木偶也还占着路。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T014",
          "sourceLine": 121,
          "speaker": "璃",
          "portrait": "hero",
          "text": "工队跟着我们走？有些地方连工具都不好搬。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T015",
          "sourceLine": 123,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "他们能沿小径背工具，整块门板就没办法了。你们清出能站人的地方，他们再补桥、接管；先别替大家把所有活都揽下来。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T016",
          "sourceLine": 125,
          "speaker": "璃",
          "portrait": "hero",
          "text": "离下雪还有多久？要先把哪几段赶出来？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T017",
          "sourceLine": 127,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "照往年，还有六周。可一车装不下这么多户的东西，雨天又走得慢。前面多耽误一趟，后面就得有人半夜收箱子。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T018",
          "sourceLine": 129,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "先用两周把这轮停暖做完。门窗补过还得试炉子，运货也得留余地。哪一段来不及，回来告诉我，我们再排。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T019",
          "sourceLine": 131,
          "speaker": "旁白",
          "portrait": null,
          "text": "那位住民抱着窗框想挪到墙边，腾不出手。璃扶住另一端，和他一起把它靠稳；木框上磨亮的一处，刚好容下一只手。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T020",
          "sourceLine": 133,
          "speaker": "璃",
          "portrait": "hero",
          "text": "刚才我连你们要留下什么都没问，就想往下送了。车回来的时候，我会看着把东西带上来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T021",
          "sourceLine": 135,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "好。等你回来，看看这窗装得怎么样。我还欠他半袋灰呢。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T022",
          "sourceLine": 137,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾在旁边听了许久，把旧地图仔细收好，走到米露摊开的路图前。她的指尖从暖溪往西，沿着熟悉的根路划过去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T023",
          "sourceLine": 139,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这边几条根路我都走过，阀口也认得。我陪璃去，工队不用到地方再找入口。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T024",
          "sourceLine": 141,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你出去这一趟，树心那边谁接？老师这些天可没怎么合过眼。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T025",
          "sourceLine": 143,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾的手停在图上。她朝外廊方向看了一眼，刚才已经走近桌边的半步又收了回去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "B.OPEN.R1.b02_enter.T026",
          "sourceLine": 145,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我先去跟老师说。把能交的都交清楚，再出发。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_02:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
        "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
        "clarificationPatch": {
          "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
          "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
        },
        "authorship": "new-opening-r1-not-historical-restoration",
        "inheritedChoiceSource": {
          "file": "sources/full-v1.1.md",
          "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
        }
      },
      "branches": []
    },
    "b02_choice": {
      "id": "b02_choice",
      "title": "璃怎么回应",
      "regionId": "B-02",
      "turns": [
        {
          "id": "B.OPEN.R1.b02_choice.T001",
          "sourceLine": 151,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先从哪一段动手？你告诉我现在最急的，我照着来。",
          "branch": "response1",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_choice.T002",
          "sourceLine": 153,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "先到树心找老师，把停暖的事问清楚。出来经过学舍，再去暖溪看管口，沿西石道往河谷走。别到了岔口才猜。",
          "branch": "response1",
          "expression": "alert"
        },
        {
          "id": "B.OPEN.R1.b02_choice.T003",
          "sourceLine": 157,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我刚才说得太快了。等回来，我想听听他们各家怎么打算，省得帮了倒忙。",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "B.OPEN.R1.b02_choice.T004",
          "sourceLine": 159,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "有的是机会。先帮我把车道接出来，他们想带什么、想住哪儿，才有得选。",
          "branch": "response2",
          "expression": "alert"
        }
      ],
      "choices": [
        {
          "id": "response1",
          "label": "先问米露最缺什么。",
          "sourceLine": 143
        },
        {
          "id": "response2",
          "label": "承认自己问得太快。",
          "sourceLine": 149
        }
      ],
      "directives": [
        {
          "sourceLine": 155,
          "text": "（两项合流，无能力加成、隐藏好感奖惩或去留强制变更。）"
        }
      ],
      "backdropAssetId": "B_ENV_02:choice",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
        "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
        "clarificationPatch": {
          "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
          "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
        },
        "authorship": "new-opening-r1-not-historical-restoration",
        "inheritedChoiceSource": {
          "file": "sources/full-v1.1.md",
          "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
        }
      },
      "branches": [
        "response1",
        "response2"
      ]
    },
    "b03_enter": {
      "id": "b03_enter",
      "title": "树心外廊",
      "regionId": "B-03",
      "turns": [
        {
          "id": "b03_enter.L159",
          "sourceLine": 159,
          "speaker": "旁白",
          "portrait": null,
          "text": "外廊比广场更热。墙上的温标排得密密麻麻，桌边一碗饭已经凉了。纱雾放轻脚步：这是她平日跟着老师照看根流的地方。诺克缇娅正把三枚红菱封印片中的一枚向下移，听见脚步也没有回头。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_enter.L161",
          "sourceLine": 161,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "铜板上别站人，会烫。纱雾，把他们领到桌子这边来。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_enter.L163",
          "sourceLine": 163,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（挪开脚，望了一眼凉饭）外面的人在搬家，你这里却还这么热。真的一点办法也没有了？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b03_enter.L165",
          "sourceLine": 165,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "大家都这样问。我若还能稳稳当当地许下一冬，早就去广场说了。绯叶，把那只囊给她看。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_enter.L167",
          "sourceLine": 167,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "（把干瘪的树脂囊放在布上）去年长的，捏这里，已经空了。今年我们查过所有能长新囊的地方，一个也没有。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_enter.L169",
          "sourceLine": 169,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "可我每天看温标，它还升得上去。昨天外侧那根，摸起来也还是热的。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_enter.L171",
          "sourceLine": 171,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "那是它还在消耗旧的。存粮能再吃几顿，田里这一年没长出粮食，这件事却不会自己过去。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_enter.L173",
          "sourceLine": 173,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "让它歇下来，还有恢复的机会。继续撑着，我们连剩下的组织也保不住；至于明年春天能醒多少，我现在不敢答应你们。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_enter.L175",
          "sourceLine": 175,
          "speaker": "旁白",
          "portrait": null,
          "text": "温标的红线又抬了一点。诺克缇娅停下话，把三枚封印片一起压低。几个人都没有再开口，直到红线缓缓落回刻线间。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_enter.L177",
          "sourceLine": 177,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "先把村里过冬的办法安排好。树什么时候能醒，谁都说不准，总不能叫大家一直等着。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_enter.L179",
          "sourceLine": 179,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你已经守多久了？如果先把你带出去，让它自己慢慢停呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b03_enter.L181",
          "sourceLine": 181,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "几处回水会先倒灌，连新接的冬用管也会冲坏。我得守到支流一处处关好，才能放开这里。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_enter.L183",
          "sourceLine": 183,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "四处支阀都关好，再动总阀。我认识那些阀口，带璃过去会快些。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_enter.L185",
          "sourceLine": 185,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好。失控的维护偶交给璃，根流你来看。米露的工队接管、补石基。哪边还没稳，就等他们稳了再关，别为了让我早点出去冒险。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_03:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b03_rules": {
      "id": "b03_rules",
      "title": "节火匣",
      "regionId": "B-03",
      "turns": [
        {
          "id": "b03_rules.L189",
          "sourceLine": 189,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶把隔热匣搬到空处，掀开盖子。八只小囊嵌在软衬里，深蜜色的囊中各有一线暖光。纱雾凑近了看，脸上也映出那种熟悉的颜色。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_rules.L191",
          "sourceLine": 191,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "去年晒场上的光就是这样。我还记得大家把这些一只只收进去，以为今年能换新的。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_rules.L193",
          "sourceLine": 193,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "我也这么想。封起来的还保存得好，只是等了一年，替换的没长出来。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L195",
          "sourceLine": 195,
          "speaker": "璃",
          "portrait": "hero",
          "text": "能用的，就这八份了？还有没有别处存着的？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b03_rules.L197",
          "sourceLine": 197,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "完整封住热量的只剩这些。路上那些干树脂能点灯、补缝，攒得再多也做不回储热囊。你们别为了这个多跑冤枉路。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L199",
          "sourceLine": 199,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅指了指匣中四个带标盖的位置。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_rules.L201",
          "sourceLine": 201,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "四个支阀各留一份。暖脂沿旧槽进去，抱着阀轴的活根才会松开。从外面烧，只会先烧裂根皮。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_rules.L203",
          "sourceLine": 203,
          "speaker": "璃",
          "portrait": "hero",
          "text": "拿这八份去养树呢？先撑过冬天，哪怕村里少暖一点。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b03_rules.L205",
          "sourceLine": 205,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "我试算过。它们够暖一间小屋，补不了整棵树坏掉的蓄热组织。给了树，几处支阀也没东西用了。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L207",
          "sourceLine": 207,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（把四个标盖逐一合好）那这四份谁都别动。剩下四份，要用在哪儿？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_rules.L209",
          "sourceLine": 209,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "暖生温室的内间要两份；老梨树脱暖移栽要一份；半山候车屋留一冬底温，要两份。每一处都有要紧的缘故。到温室和梨树那边我带你们看，候车屋就问修屋的人。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L211",
          "sourceLine": 211,
          "speaker": "璃",
          "portrait": "hero",
          "text": "加起来五份。少的这一份，真没有办法补上？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b03_rules.L213",
          "sourceLine": 213,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "没有。所以至少有一处得照普通办法过冬。能留下多少、留不下什么，我都会说清楚。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L215",
          "sourceLine": 215,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃伸出去的手停在匣沿。八只囊挨得很近，看上去还满满当当；纱雾合上的四个盖子，却已经占去了一半。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_rules.L217",
          "sourceLine": 217,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "先别打开剩下的。我们把三处都看过，听完那里的人怎么说，再决定，行吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_rules.L219",
          "sourceLine": 219,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "行。只要还封着，就能等。送进根槽以后抽不回来，想得慢一点没关系。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b03_rules.L221",
          "sourceLine": 221,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "粮柴和学舍的炉子已经另有安排，四份暖脂不用再拿去补这些。村里商量过，留给那三处；你们把情况看明白，回来一起核对。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_rules.L223",
          "sourceLine": 223,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我会把每一处都看清。用不上的那边，也得把能做的做好，不能关上匣子就走。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 225,
          "text": "【动态提示：暖脂八份，四份保留、四份可分配；展示三暖点用途。拾取与商店不能补充。】"
        }
      ],
      "backdropAssetId": "B_ENV_03:rules",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b03_exit": {
      "id": "b03_exit",
      "title": "出发以前",
      "regionId": "B-03",
      "turns": [
        {
          "id": "b03_exit.L229",
          "sourceLine": 229,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我陪璃走到河谷，再从北边绕回来。第三排温标这几天总往上抬，我要不要先——",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_exit.L231",
          "sourceLine": 231,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "米露已经安排人来看，也有人送饭。红线过刻度就按铃，他们认得；复杂的我来做。你把看路的东西带齐。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_exit.L233",
          "sourceLine": 233,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我再留两天也行。等这边平一点，追上她们。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b03_exit.L235",
          "sourceLine": 235,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "外面的新管也等着你看。去吧，回来告诉我哪段路能走，哪段扶手还松着，我出门时好有个数。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b03_exit.L237",
          "sourceLine": 237,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾点了头，仍在桌边站着。诺克缇娅将凉饭端到面前，拿起筷子，见她不走，又抬起眼。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b03_exit.L239",
          "sourceLine": 239,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "还看着我做什么，怕我又把饭放凉？行，我现在吃。你们出门的时候，替我把外头的风挡一挡。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_03:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b04_enter": {
      "id": "b04_enter",
      "title": "旧学舍",
      "regionId": "B-04",
      "turns": [
        {
          "id": "b04_enter.L243",
          "sourceLine": 243,
          "speaker": "旁白",
          "portrait": null,
          "text": "旧课桌被搬到墙边。靠窗的住民正用细布检查门缝，另一人拿着从河谷带回的灶图。脚边堆着砖、灰和普通木柴。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b04_enter.L245",
          "sourceLine": 245,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "先试烧，再封最后一面。谁要是头疼，立刻开门，别觉得忍一忍就过去了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b04_enter.L247",
          "sourceLine": 247,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这里能住多少人？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b04_enter.L249",
          "sourceLine": 249,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "愿意临时来住的几户已经各自看过了。床位不拿来堆货。还差的门板，西路通了就送来。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b04_enter.L251",
          "sourceLine": 251,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（摸了摸一张旧桌的刻痕）这是我以前坐的位置。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b04_enter.L253",
          "sourceLine": 253,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你那时候一直说窗边太热。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b04_enter.L255",
          "sourceLine": 255,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "以后坐这里的人，可能就喜欢晒太阳了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b04_enter.L257",
          "sourceLine": 257,
          "speaker": "旁白",
          "portrait": null,
          "text": "两位志愿者把工具分进木箱，抬起沉的那一只。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b04_enter.L259",
          "sourceLine": 259,
          "speaker": "工队住民",
          "portrait": null,
          "text": "我们先跟到溪口。你们清出来，我们就接管。别等着你一个人把砖也背完。",
          "branch": "common"
        },
        {
          "id": "b04_enter.L261",
          "sourceLine": 261,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好。我会给你们留出能搬东西的宽度。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_04:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b04_exit": {
      "id": "b04_exit",
      "title": "纱雾没有说完的话",
      "regionId": "B-04",
      "turns": [
        {
          "id": "b04_exit.L265",
          "sourceLine": 265,
          "speaker": "旁白",
          "portrait": null,
          "text": "走出学舍，纱雾又回头看了一眼。有人已经接过她刚才扶着的炉砖，蹲在那儿重新比位置。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b04_exit.L267",
          "sourceLine": 267,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这块砖我还想再看一遍。还有窗边的缝……以前每次出门，总有一处让我觉得没弄好。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b04_exit.L269",
          "sourceLine": 269,
          "speaker": "璃",
          "portrait": "hero",
          "text": "要回去跟他们说吗？我在这儿等你。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b04_exit.L271",
          "sourceLine": 271,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "他们已经看见了，正拿灰补。我再站回去，好像也只是在旁边着急。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b04_exit.L273",
          "sourceLine": 273,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那先去溪口。真漏了什么，回来时再问问。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b04_exit.L275",
          "sourceLine": 275,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾的手还搭在门框上。她看着里面的人把砖放稳，才松开手，跟上璃。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_04:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b05_pre": {
      "id": "b05_pre",
      "title": "暖溪取水口",
      "regionId": "B-05",
      "turns": [
        {
          "id": "b05_pre.L279",
          "sourceLine": 279,
          "speaker": "旁白",
          "portrait": null,
          "text": "维护根偶正把新装的普通水管往外顶。它每次收回木臂，管口就被扯离石槽一点；施工队只能把固定绳拉紧。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b05_pre.L281",
          "sourceLine": 281,
          "speaker": "工队住民",
          "portrait": null,
          "text": "它一直把新管当成堵塞。再顶两次，接口就裂了。",
          "branch": "common"
        },
        {
          "id": "b05_pre.L283",
          "sourceLine": 283,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（让完整圆环星盘停在管边）旧指令还在：这条暖水道不许被别的东西碰。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b05_pre.L285",
          "sourceLine": 285,
          "speaker": "璃",
          "portrait": "hero",
          "text": "能从这里关掉吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b05_pre.L287",
          "sourceLine": 287,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "控制线压在它的底座下面。得先让它停。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b05_pre.L289",
          "sourceLine": 289,
          "speaker": "璃",
          "portrait": "hero",
          "text": "大家松手以后退到那块石墙后。我把它引离管口。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 291,
          "text": "【动态提示：预览威胁新水管的维护偶与可用路线。】"
        }
      ],
      "backdropAssetId": "B_ENV_05:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b05_valve": {
      "id": "b05_valve",
      "title": "第一处支阀",
      "regionId": "B-05",
      "turns": [
        {
          "id": "b05_valve.L295",
          "sourceLine": 295,
          "speaker": "旁白",
          "portrait": null,
          "text": "根偶停下。工队扶正水管，纱雾把一份主路暖脂送入旧槽。活根缓缓放开阀轴，璃与工队共同转动手柄，机械锁落下。",
          "branch": "common",
          "kind": "narration",
          "phase": "valve"
        },
        {
          "id": "b05_valve.L297",
          "sourceLine": 297,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "锁住了。现在接普通管。",
          "branch": "common",
          "expression": "gentle",
          "phase": "valve"
        },
        {
          "id": "b05_valve.L299",
          "sourceLine": 299,
          "speaker": "旁白",
          "portrait": null,
          "text": "溪口的白汽渐渐变薄。水仍从石缝里流出来。",
          "branch": "common",
          "kind": "narration",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L301",
          "sourceLine": 301,
          "speaker": "璃",
          "portrait": "hero",
          "text": "冷了？",
          "branch": "common",
          "expression": "guarded",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L303",
          "sourceLine": 303,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把手伸进溪水，凉意一下爬上手腕，她很快抽了回来。看见璃蹲下，她又试着将指尖放进去。",
          "branch": "common",
          "kind": "narration",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L305",
          "sourceLine": 305,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "真凉。以前这条溪，冬天洗手都不用缩着。",
          "branch": "common",
          "expression": "gentle",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L307",
          "sourceLine": 307,
          "speaker": "璃",
          "portrait": "hero",
          "text": "要不要擦干？手一直湿着，风吹过来更冷。",
          "branch": "common",
          "expression": "guarded",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L309",
          "sourceLine": 309,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "再等一下。我以前路过河谷，总把手收在袖子里，觉得回村就好了。现在连这里也要这样了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L311",
          "sourceLine": 311,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃蹲在她旁边，指尖掠过水面。",
          "branch": "common",
          "kind": "narration",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L313",
          "sourceLine": 313,
          "speaker": "璃",
          "portrait": "hero",
          "text": "下次洗菜，我来提桶热水兑着。总有办法，不用每回都把手泡红。",
          "branch": "common",
          "expression": "guarded",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L315",
          "sourceLine": 315,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（笑了一下）我还没想到洗菜呢，你已经要提水了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L317",
          "sourceLine": 317,
          "speaker": "璃",
          "portrait": "hero",
          "text": "刚才看见你缩手，就想到了。冷得难受的时候，别硬撑。",
          "branch": "common",
          "expression": "guarded",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L319",
          "sourceLine": 319,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。刚才根一暗，我心里空了一下，还以为水也会跟着没了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L321",
          "sourceLine": 321,
          "speaker": "旁白",
          "portrait": null,
          "text": "水仍从石缝间流出来，绕过她的手指。纱雾等了一会儿，慢慢把手抽回来，甩掉指尖的水。",
          "branch": "common",
          "kind": "narration",
          "phase": "pipeWorks"
        },
        {
          "id": "b05_valve.L323",
          "sourceLine": 323,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "还好，它还在流。回去要跟学舍说一声，记得烧热水。",
          "branch": "common",
          "expression": "gentle",
          "phase": "pipeWorks"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 325,
          "text": "【动态提示：第一处支阀已关闭，扣除一份保留暖脂；普通水管接通。该状态永久保留。】"
        }
      ],
      "backdropAssetId": "B_ENV_05:valve",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b05_revisit": {
      "id": "b05_revisit",
      "title": "b05_revisit",
      "regionId": "B-05",
      "turns": [
        {
          "id": "b05_revisit.L329",
          "sourceLine": 329,
          "speaker": "工队住民",
          "portrait": null,
          "text": "接好了。回去跟学舍说，水会凉一些，照样能用。",
          "branch": "common"
        },
        {
          "id": "b05_revisit.L331",
          "sourceLine": 331,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我会说的。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_05:revisit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b06_enter": {
      "id": "b06_enter",
      "title": "雨后杉林",
      "regionId": "B-06",
      "turns": [
        {
          "id": "b06_enter.L337",
          "sourceLine": 337,
          "speaker": "旁白",
          "portrait": null,
          "text": "杉树间有一条很直的旧货道，如今被风倒木横压着。璃习惯性踏向一旁的窄隙，又看了看珂珂的背包。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b06_enter.L339",
          "sourceLine": 339,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你过不去。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b06_enter.L341",
          "sourceLine": 341,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "我能侧着挤。后面那车砖不能。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b06_enter.L343",
          "sourceLine": 343,
          "speaker": "旁白",
          "portrait": null,
          "text": "她们沿倒木走到断面。曾用来锯木的根偶把齿盘朝向树干，却连同旧石栏一并卷了进去，碎石不断弹落到路上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b06_enter.L345",
          "sourceLine": 345,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它还认得哪里有木头，但认不出石栏了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b06_enter.L347",
          "sourceLine": 347,
          "speaker": "璃",
          "portrait": "hero",
          "text": "把这些石头弹到路上，就算钻过去也没用。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b06_enter.L349",
          "sourceLine": 349,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "我在后面拦住过路的人。你们看好它转回来的方向。",
          "branch": "common",
          "expression": "knowing"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_06:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b06_pre": {
      "id": "b06_pre",
      "title": "锯木偶",
      "regionId": "B-06",
      "turns": [
        {
          "id": "b06_pre.L353",
          "sourceLine": 353,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "右侧的传动根缠在树下。左边能接近，但要过那几具拖木偶。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b06_pre.L355",
          "sourceLine": 355,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（先观察路线）不必把林子里所有会动的都拆了。我们要的是能让车过去的这一段。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 357,
          "text": "【动态提示：预览主路、可选绕路及各路固定战损。】"
        }
      ],
      "backdropAssetId": "B_ENV_06:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b06_post": {
      "id": "b06_post",
      "title": "清出来的宽度",
      "regionId": "B-06",
      "turns": [
        {
          "id": "b06_post.L361",
          "sourceLine": 361,
          "speaker": "旁白",
          "portrait": null,
          "text": "齿盘停住。工队沿已通路段赶来，开始截短倒木、搬开碎石。原来只容一个人钻过的缝逐渐成为可运货的道路。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b06_post.L363",
          "sourceLine": 363,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "剩下这些木头有些还能做支撑。让工队分，别统统当柴烧。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b06_post.L365",
          "sourceLine": 365,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（捡起一片枯杉针）树倒了，旁边倒是亮起来了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b06_post.L367",
          "sourceLine": 367,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你喜欢亮一点？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b06_post.L369",
          "sourceLine": 369,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我不知道。我以前都看它站着的样子。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b06_post.L371",
          "sourceLine": 371,
          "speaker": "旁白",
          "portrait": null,
          "text": "一只小兽穿过光斑，钻进杉林。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b06_post.L373",
          "sourceLine": 373,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那先看一会儿。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_06:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b07_enter": {
      "id": "b07_enter",
      "title": "双根涧",
      "regionId": "B-07",
      "turns": [
        {
          "id": "b07_enter.L377",
          "sourceLine": 377,
          "speaker": "旁白",
          "portrait": null,
          "text": "溪涧上方盘着两层旧树根。高处一层连着石路，低处的侧根桥面较窄，却完整搭在两岸岩座上，随着根流轻轻起伏。工人将几块桥板暂放在岸边，尚未往上铺。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b07_enter.L379",
          "sourceLine": 379,
          "speaker": "工队住民",
          "portrait": null,
          "text": "米露让把这个交给你。以前做好的，就剩两枚。",
          "branch": "common"
        },
        {
          "id": "b07_enter.L381",
          "sourceLine": 381,
          "speaker": "旁白",
          "portrait": null,
          "text": "他打开矮木箱。两枚缚根楔并排放着。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b07_enter.L383",
          "sourceLine": 383,
          "speaker": "璃",
          "portrait": "hero",
          "text": "固定低处这根？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b07_enter.L385",
          "sourceLine": 385,
          "speaker": "工队住民",
          "portrait": null,
          "text": "对。它担得住重量，就是会抬。楔进预先凿好的岩座，卡舌咬住，便取不回来了。硬拆只会把卡舌折在里面。",
          "branch": "common"
        },
        {
          "id": "b07_enter.L387",
          "sourceLine": 387,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（让星盘沿根侧移动）两头都还实。楔好，我们先过去；桥板和栏杆随后补。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b07_enter.L389",
          "sourceLine": 389,
          "speaker": "璃",
          "portrait": "hero",
          "text": "不用楔呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b07_enter.L391",
          "sourceLine": 391,
          "speaker": "工队住民",
          "portrait": null,
          "text": "走上面的石路。坏拖偶堵在那里，要先拆了。两边只要有一边能开工，我们就能接过去。",
          "branch": "common"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_07:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b07_rules": {
      "id": "b07_rules",
      "title": "两枚根楔和四处位置",
      "regionId": "B-07",
      "turns": [
        {
          "id": "b07_rules.L395",
          "sourceLine": 395,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾摊开图，逐一指给璃看。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b07_rules.L397",
          "sourceLine": 397,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这里、背阴山腰、北面风口，还有干根库的侧口。四处都留过岩座。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b07_rules.L399",
          "sourceLine": 399,
          "speaker": "璃",
          "portrait": "hero",
          "text": "两枚，四个地方。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b07_rules.L401",
          "sourceLine": 401,
          "speaker": "工队住民",
          "portrait": null,
          "text": "你们挑。桥板我们有，能撑重量的地方也都看过；楔子只管把会动的这段定住。",
          "branch": "common"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 403,
          "text": "【动态提示：获得两枚根楔，标出四点；预览各点两路的敌人、损耗、收益及不可回收。未战敌人保留。】"
        }
      ],
      "backdropAssetId": "B_ENV_07:rules",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b07_choice": {
      "id": "b07_choice",
      "title": "使用或保留",
      "regionId": "B-07",
      "turns": [
        {
          "id": "b07_choice.L409",
          "sourceLine": 409,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃把楔对准岩座。纱雾示意根部起伏最低的一刻；楔的卡舌落下，窄根不再抬动。",
          "branch": "root",
          "kind": "narration",
          "phase": "fixed"
        },
        {
          "id": "b07_choice.L411",
          "sourceLine": 411,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "试第一步，别跑。",
          "branch": "root",
          "expression": "gentle",
          "phase": "fixed"
        },
        {
          "id": "b07_choice.L413",
          "sourceLine": 413,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃跨上去，又转身伸出没有握剑的左手。",
          "branch": "root",
          "kind": "narration",
          "phase": "fixed"
        },
        {
          "id": "b07_choice.L415",
          "sourceLine": 415,
          "speaker": "璃",
          "portrait": "hero",
          "text": "现在轮到你。",
          "branch": "root",
          "expression": "guarded",
          "phase": "fixed"
        },
        {
          "id": "b07_choice.L417",
          "sourceLine": 417,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（握住她的手，过了一步便放开）这次我自己也过得去。",
          "branch": "root",
          "expression": "gentle",
          "phase": "fixed"
        },
        {
          "id": "b07_choice.L419",
          "sourceLine": 419,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人过岸后，工队才开始铺板。新栏杆沿低处旁路立起，与上方拖偶够得到的范围隔着整段岩壁。通往旧石路的岔口拉上醒目的拦绳。",
          "branch": "root",
          "kind": "narration",
          "phase": "works"
        },
        {
          "id": "b07_choice.L421",
          "sourceLine": 421,
          "speaker": "工队住民",
          "portrait": null,
          "text": "这边铺好以后，行李和分批的小车从下边走。上面那几具还在，别走错。",
          "branch": "root",
          "phase": "works"
        },
        {
          "id": "b07_choice.L423",
          "sourceLine": 423,
          "speaker": "璃",
          "portrait": "hero",
          "text": "拦绳留着。以后要拆它们，再从旧口进去。",
          "branch": "root",
          "expression": "guarded",
          "phase": "works"
        },
        {
          "id": "b07_choice.L429",
          "sourceLine": 429,
          "speaker": "璃",
          "portrait": "hero",
          "text": "后面的路还没看过。先留下。",
          "branch": "originalPre",
          "expression": "guarded"
        },
        {
          "id": "b07_choice.L431",
          "sourceLine": 431,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "好。我记住这处岩座。要回来也认得。",
          "branch": "originalPre",
          "expression": "gentle"
        },
        {
          "id": "b07_choice.L433",
          "sourceLine": 433,
          "speaker": "旁白",
          "portrait": null,
          "text": "她折好图，指向石路入口。",
          "branch": "originalPre",
          "kind": "narration"
        }
      ],
      "choices": [
        {
          "id": "root",
          "label": "消耗一枚，固定这条侧根。",
          "sourceLine": 407
        },
        {
          "id": "originalPre",
          "label": "先走普通路，留着根楔。",
          "sourceLine": 427
        }
      ],
      "directives": [
        {
          "sourceLine": 425,
          "text": "【动态提示：扣除一枚根楔，先开放侧根人物通行；铺板补栏完成后，本段旁路开放步行、驮运及分批轻车。原路敌人保留。】"
        }
      ],
      "backdropAssetId": "B_ENV_07:choice",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "root",
        "originalPre"
      ]
    },
    "b07_stone_post": {
      "id": "b07_stone_post",
      "title": "石路清开以后",
      "regionId": "B-07",
      "turns": [
        {
          "id": "b07_stone_post.L437",
          "sourceLine": 437,
          "speaker": "旁白",
          "portrait": null,
          "text": "石路上的拖偶停下。工队移开残件，补好缺掉的一段栏绳，推着空轻车试过。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b07_stone_post.L439",
          "sourceLine": 439,
          "speaker": "工队住民",
          "portrait": null,
          "text": "这一边也检查好了。以后走，认这段新栏绳。",
          "branch": "common"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 441,
          "text": "【即时状态：仅在原路战斗获胜并完成清理后播放；本段石路开放公共通行。不重复给奖励。】"
        }
      ],
      "backdropAssetId": "B_ENV_07:stone_post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b07_revisit": {
      "id": "b07_revisit",
      "title": "b07_revisit",
      "regionId": "B-07",
      "turns": [
        {
          "id": "b07_revisit.L445",
          "sourceLine": 445,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "桥板也铺好了。以后回来，认这边的栏杆。",
          "branch": "rootReady",
          "expression": "gentle"
        },
        {
          "id": "b07_revisit.L447",
          "sourceLine": 447,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "岩座还在。先把两条路的情况看清，再决定。",
          "branch": "rootAvailable",
          "expression": "gentle"
        },
        {
          "id": "b07_revisit.L449",
          "sourceLine": 449,
          "speaker": "璃",
          "portrait": "hero",
          "text": "两枚已经用在别处。这里走石路。",
          "branch": "rootUnavailable",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_07:revisit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "rootReady",
        "rootAvailable",
        "rootUnavailable"
      ]
    },
    "b08_enter": {
      "id": "b08_enter",
      "title": "空驿棚",
      "regionId": "B-08",
      "turns": [
        {
          "id": "b08_enter.L453",
          "sourceLine": 453,
          "speaker": "旁白",
          "portrait": null,
          "text": "天黑以后，三人才在空驿棚里坐下来。珂珂把木框背包靠墙放稳，将单卷床垫铺在干处，脱鞋时长长地叹了口气。普通柴火噼啪作响，纱雾却还将星盘悬在手边，光落在棚外。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_enter.L455",
          "sourceLine": 455,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "你让它歇一会儿吧。照得我总以为门口有人，鞋都不敢脱另一只。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b08_enter.L457",
          "sourceLine": 457,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我看看根流有没有变。出门这么久没盯着，总觉得少做了一件事。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_enter.L459",
          "sourceLine": 459,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "这棚子靠石柱站着，门梁也不吃暖根。真要少做什么，先把脚烤干，明早可没人背得动你。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b08_enter.L461",
          "sourceLine": 461,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾将星盘收近，终于让棚外暗下来。她把脚挪向火边，怀里的纸角露了出来；璃认出那道补过的折痕，目光停住了。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_enter.L463",
          "sourceLine": 463,
          "speaker": "璃",
          "portrait": "hero",
          "text": "冬市的图，你还留着？我记得这里裂过一道口子。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_enter.L465",
          "sourceLine": 465,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（按住纸角）修过两回了。再折坏，得重画一张。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_enter.L467",
          "sourceLine": 467,
          "speaker": "璃",
          "portrait": "hero",
          "text": "让我看看？四年了，上面的路可能都变了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_enter.L469",
          "sourceLine": 469,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "有几条街换了名字，珂珂每次回来，我都会问。新名字写在旁边，你先别把它当废图收起来。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_enter.L471",
          "sourceLine": 471,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "卖热梨饼那家还在，摊子搬过，换成女儿卖了。我给你指的那个口记清楚，顺着旧图走，就得敲人家后院的门。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b08_enter.L473",
          "sourceLine": 473,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾笑着把图展开给璃看。原先空白的边缘，已经添了细细的字；璃想用手指按住卷角，又怕碰脏，先在衣服上擦了擦手。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_enter.L475",
          "sourceLine": 475,
          "speaker": "璃",
          "portrait": "hero",
          "text": "等这条路通了，我陪你去。今年一定——",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_enter.L477",
          "sourceLine": 477,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "先等等。你知道今年哪天开，货队什么时候下山吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_enter.L479",
          "sourceLine": 479,
          "speaker": "璃",
          "portrait": "hero",
          "text": "还没问。我以为，到了再打听也来得及。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_enter.L481",
          "sourceLine": 481,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我问过了。你要去，我告诉你；别话说完又走了，留我一个人猜到底是哪一年。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_enter.L483",
          "sourceLine": 483,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃把压着纸角的手放平，没有再往下许诺。火苗晃了一下，旧图上后来添的字比原来的深。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_enter.L485",
          "sourceLine": 485,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好，你说。我这回记清楚，免得还不如你认得路。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_08:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b08_night": {
      "id": "b08_night",
      "title": "明早的柴",
      "regionId": "B-08",
      "turns": [
        {
          "id": "b08_night.L489",
          "sourceLine": 489,
          "speaker": "旁白",
          "portrait": null,
          "text": "夜里，璃被轻微的金属声惊醒。纱雾已经坐了起来，一只手摸向星盘，另一只手去找并不在身边的灯。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_night.L491",
          "sourceLine": 491,
          "speaker": "璃",
          "portrait": "hero",
          "text": "纱雾？别急，火还没灭。你在找什么？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_night.L493",
          "sourceLine": 493,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "第三排温标。我没看就睡了，老师那边——",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_night.L495",
          "sourceLine": 495,
          "speaker": "旁白",
          "portrait": null,
          "text": "她说到一半，借着火光看见石柱和珂珂靠墙的背包。棚外只有风声，方才已经抬起的手慢慢放了下来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_night.L497",
          "sourceLine": 497,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我睡糊涂了。这里没有第三排，只有这堆火。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_night.L499",
          "sourceLine": 499,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（拨开堵住进气口的短柴）嗯。珂珂也睡着，刚才还翻了个身。没有人叫你。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_night.L501",
          "sourceLine": 501,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "把你吵醒了。你白天也走了一路，躺回去吧。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_night.L503",
          "sourceLine": 503,
          "speaker": "璃",
          "portrait": "hero",
          "text": "已经醒了，我把火拨开就躺。你手凉不凉，过来烤一下？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_night.L505",
          "sourceLine": 505,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃顺手伸向剩下的柴，纱雾轻轻压住她的手腕。那一小堆是特意拣出来的干柴，最上面的一根还没有折短。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_night.L507",
          "sourceLine": 507,
          "speaker": "璃",
          "portrait": "hero",
          "text": "不用添？后半夜会更冷。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_night.L509",
          "sourceLine": 509,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "现在还暖。明早还得生火、烧水，先把那根留下，冷了我叫你。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_night.L511",
          "sourceLine": 511,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃收回手，将那根柴往干处推了推。纱雾靠近火坐了一会儿，直到呼吸慢下来，两人才重新拢好铺盖。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b08_night.L513",
          "sourceLine": 513,
          "speaker": "璃",
          "portrait": "hero",
          "text": "明天先去断栈道吧？要是你想先看西枝台，我们再改。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b08_night.L515",
          "sourceLine": 515,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "先看断栈道。我想亲眼看看车要怎么过，也省得到了后面一直惦记。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b08_night.L517",
          "sourceLine": 517,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那就先去那里。睡吧，天亮了再看图。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 519,
          "text": "【动态提示：仅按实际配置发放首次宿营补给。】"
        }
      ],
      "backdropAssetId": "B_ENV_08:night",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b09_enter": {
      "id": "b09_enter",
      "title": "断栈道",
      "regionId": "B-09",
      "turns": [
        {
          "id": "b09_enter.L523",
          "sourceLine": 523,
          "speaker": "旁白",
          "portrait": null,
          "text": "清晨，旧栈道在一处崖口断开。璃放下任务盒，借石面一撑，跃到另一侧。她落稳后回头。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b09_enter.L525",
          "sourceLine": 525,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这里可以——",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b09_enter.L527",
          "sourceLine": 527,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾没有起跳。珂珂站在她后面，背包木框比缺口旁的落脚处还宽。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b09_enter.L529",
          "sourceLine": 529,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（停住）不行。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b09_enter.L531",
          "sourceLine": 531,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你当然可以。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b09_enter.L533",
          "sourceLine": 533,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我说错了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b09_enter.L535",
          "sourceLine": 535,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃回到原侧，捡起任务盒，转向下面的旧石阶。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b09_enter.L537",
          "sourceLine": 537,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "从这里绕，能下到石基。上次运材的人在那里装过检修架。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b09_enter.L539",
          "sourceLine": 539,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "不能拿根楔撑过去。这里没有连到岩座的侧根。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b09_enter.L541",
          "sourceLine": 541,
          "speaker": "璃",
          "portrait": "hero",
          "text": "知道。先把石基清出来，再搭实在的桥。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_09:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b09_pre": {
      "id": "b09_pre",
      "title": "石基下的拖拽架",
      "regionId": "B-09",
      "turns": [
        {
          "id": "b09_pre.L545",
          "sourceLine": 545,
          "speaker": "旁白",
          "portrait": null,
          "text": "沿石阶下行，一组失控运材偶正反复拉扯废弃检修架。每次用力，架上的断梁便扫过工队需要落脚的石台。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b09_pre.L547",
          "sourceLine": 547,
          "speaker": "工队住民",
          "portrait": null,
          "text": "我们得站在那儿钉桥面。它不停，没人下得去。",
          "branch": "common"
        },
        {
          "id": "b09_pre.L549",
          "sourceLine": 549,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "牵引根全绞住了，从上面松不开。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b09_pre.L551",
          "sourceLine": 551,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我处理传动核。你们等梁完全停住，再下来，别跟着我跳。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 553,
          "text": "【动态提示：预览拖拽架战斗与路线；获胜后才可开工架桥。】"
        }
      ],
      "backdropAssetId": "B_ENV_09:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b09_post": {
      "id": "b09_post",
      "title": "桥是怎么出现的",
      "regionId": "B-09",
      "turns": [
        {
          "id": "b09_post.L557",
          "sourceLine": 557,
          "speaker": "旁白",
          "portrait": null,
          "text": "两天里，崖口都是落锤声。工人清石基、架梁、钉板；璃搬短料，纱雾看着旧根。第三天清早，栏杆接齐，珂珂先试走，再带人推过分好重量的轻车。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b09_post.L559",
          "sourceLine": 559,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "人和轻车先过。重料还得分装，外沿没补齐以前，别把整车都压上来。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b09_post.L561",
          "sourceLine": 561,
          "speaker": "工队住民",
          "portrait": null,
          "text": "我们先留在这里。上头送来的替班会沿小径过来，你们去接西石道。",
          "branch": "common"
        },
        {
          "id": "b09_post.L563",
          "sourceLine": 563,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（看着珂珂到达对岸）这次可以了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b09_post.L565",
          "sourceLine": 565,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯，这次可以。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b09_post.L567",
          "sourceLine": 567,
          "speaker": "旁白",
          "portrait": null,
          "text": "她们没有跳过最后一级，沿桥走完。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_09:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b10_enter": {
      "id": "b10_enter",
      "title": "西枝分流台",
      "regionId": "B-10",
      "turns": [
        {
          "id": "b10_enter.L571",
          "sourceLine": 571,
          "speaker": "旁白",
          "portrait": null,
          "text": "粗根紧贴岩壁。工队从旧步道肩挑分件支架过来，一人揉着肩，另一人接过最后一捆短料。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_enter.L573",
          "sourceLine": 573,
          "speaker": "工队住民",
          "portrait": null,
          "text": "我们昨天到的。零件能背，大木料还得等后面的车。这里先接好了，你们说，降哪根的力？",
          "branch": "common"
        },
        {
          "id": "b10_enter.L575",
          "sourceLine": 575,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（看星盘）靠溪那根。别同时松开，外侧会滑。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b10_enter.L577",
          "sourceLine": 577,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我在外侧扶着锁柄。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b10_enter.L579",
          "sourceLine": 579,
          "speaker": "旁白",
          "portrait": null,
          "text": "她照纱雾指的顺序移动，没有替她抢说下一步。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_10:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b10_valve": {
      "id": "b10_valve",
      "title": "第二处支阀",
      "regionId": "B-10",
      "turns": [
        {
          "id": "b10_valve.L583",
          "sourceLine": 583,
          "speaker": "旁白",
          "portrait": null,
          "text": "第二份主路暖脂进入旧槽。活根舒展，机械锁压住阀轴，石木支撑逐段承担重量。原本发亮的细根暗下去，路面没有塌。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_valve.L585",
          "sourceLine": 585,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "停住了。等一会儿再走。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b10_valve.L587",
          "sourceLine": 587,
          "speaker": "旁白",
          "portrait": null,
          "text": "众人等过一阵轻微的木声。米露带着另一组工人从新通的路上出现。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_valve.L589",
          "sourceLine": 589,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "到这里比我以为的快。断栈道那边有人该吃饭了，我让这批人去换。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b10_valve.L591",
          "sourceLine": 591,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你不是要看着村里？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b10_valve.L593",
          "sourceLine": 593,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "村里也有人看着。我出来两个时辰，不至于全都停下。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b10_valve.L595",
          "sourceLine": 595,
          "speaker": "旁白",
          "portrait": null,
          "text": "她说完，望了纱雾一眼。纱雾低头，慢慢收回星盘。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_valve.L597",
          "sourceLine": 597,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "原来你也会说这句话。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b10_valve.L599",
          "sourceLine": 599,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "怎么，只有你能放心不下？",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b10_valve.L601",
          "sourceLine": 601,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露把干粮递给替班的工人。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_valve.L603",
          "sourceLine": 603,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "去河谷吧。告诉货场，我们在把路接过去。",
          "branch": "common",
          "expression": "alert"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 605,
          "text": "【动态提示：第二处支阀关闭，扣除一份保留暖脂；西枝路由普通支架支撑，主路进度更新。】"
        }
      ],
      "backdropAssetId": "B_ENV_10:valve",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b10_exit": {
      "id": "b10_exit",
      "title": "b10_exit",
      "regionId": "B-10",
      "turns": [
        {
          "id": "b10_exit.L609",
          "sourceLine": 609,
          "speaker": "旁白",
          "portrait": null,
          "text": "走出分流台前，纱雾回望已经有人接班的桥。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b10_exit.L611",
          "sourceLine": 611,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "以前我离开的时候，都会想，等我回去得先补哪一件。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b10_exit.L613",
          "sourceLine": 613,
          "speaker": "璃",
          "portrait": "hero",
          "text": "今天呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b10_exit.L615",
          "sourceLine": 615,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "今天……好像可以先吃饭。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_10:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b11_enter": {
      "id": "b11_enter",
      "title": "风铃坡",
      "regionId": "B-11",
      "turns": [
        {
          "id": "b11_enter.L621",
          "sourceLine": 621,
          "speaker": "旁白",
          "portrait": null,
          "text": "路边残留着运货时用来报位的铃。风一吹，几只铃便撞在一起。前方一具高大的归材偶正把散落货箱一只只推下坡，连着货场的车辙也被刨出了深坑。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b11_enter.L623",
          "sourceLine": 623,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "停，别往前。它现在把所有放在路上的东西都当弃料。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b11_enter.L625",
          "sourceLine": 625,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "以前有工人跟着它走。哪里该清，哪里要停，旁边一直有人指。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b11_enter.L627",
          "sourceLine": 627,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那个人不在，它也不会问。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b11_enter.L629",
          "sourceLine": 629,
          "speaker": "旁白",
          "portrait": null,
          "text": "一根木臂伸向货场方向，拖住路边的防滑绳。坡下传来工人避让的喊声。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b11_enter.L631",
          "sourceLine": 631,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "它把绳拖走，下面的人连车都稳不住。",
          "branch": "common",
          "expression": "knowing"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_11:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b11_pre": {
      "id": "b11_pre",
      "title": "归材偶的最后一次推送",
      "regionId": "B-11",
      "turns": [
        {
          "id": "b11_pre.L635",
          "sourceLine": 635,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我从坡上逼它转身。纱雾，你看着它背上的束根，不要让它把整段栏杆一起拉下来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b11_pre.L637",
          "sourceLine": 637,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我能告诉你哪一根在吃力，不能把它定住。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b11_pre.L639",
          "sourceLine": 639,
          "speaker": "璃",
          "portrait": "hero",
          "text": "够了。其他的照看好你自己。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 641,
          "text": "【动态提示：预览归材偶精英战与确定战损，可撤回。】"
        }
      ],
      "backdropAssetId": "B_ENV_11:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b11_post": {
      "id": "b11_post",
      "title": "对一条路来说太久的工作",
      "regionId": "B-11",
      "turns": [
        {
          "id": "b11_post.L645",
          "sourceLine": 645,
          "speaker": "旁白",
          "portrait": null,
          "text": "归材偶停下。坡下工人重新拉紧防滑绳，把深车辙垫平，再将尚好的货箱搬回平地。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b11_post.L647",
          "sourceLine": 647,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "（摸了摸箱角）没全坏。这一车原本就是预备运到上面的。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b11_post.L649",
          "sourceLine": 649,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它在这里走了很久。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b11_post.L651",
          "sourceLine": 651,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我知道。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b11_post.L653",
          "sourceLine": 653,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我不是说不该拆。我只是……记得小时候觉得它特别厉害，一次能扛三根木头。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b11_post.L655",
          "sourceLine": 655,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "把还能用的木臂留给工队吧。做一段新栏杆，手再小的人也扶得住。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b11_post.L657",
          "sourceLine": 657,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾点头，将挡路的旧铃挂到不会碰到行人的高处。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b11_post.L659",
          "sourceLine": 659,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这个不用扔。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_11:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b12_enter": {
      "id": "b12_enter",
      "title": "河谷望台",
      "regionId": "B-12",
      "turns": [
        {
          "id": "b12_enter.L663",
          "sourceLine": 663,
          "speaker": "旁白",
          "portrait": null,
          "text": "走出树林，山路一下开阔了。谷底的田收割过，露出深浅不同的土色；几道炉烟沿屋顶斜着飘，桥上慢慢过去一辆车。纱雾停在望台边，望了许久。远处没有发亮的根。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b12_enter.L665",
          "sourceLine": 665,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那几块田都空着。今年不再种了吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_enter.L667",
          "sourceLine": 667,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "有的种越冬菜，有的等开春。忙完收成，也要修工具、补房顶，地歇一歇，人还有别的活。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b12_enter.L669",
          "sourceLine": 669,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "书上讲过。我还记得那张轮种的图。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_enter.L671",
          "sourceLine": 671,
          "speaker": "旁白",
          "portrait": null,
          "text": "她往前走了一步，手扶住石边。空田旁有人提着东西回屋，炉烟仍稳稳地升着，并没有谁急着去把土地填满。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b12_enter.L673",
          "sourceLine": 673,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "可我在村里看书时，总觉得这么大一块地空着，好可惜。现在他们就住在旁边，好像也没那么着急。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_enter.L675",
          "sourceLine": 675,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我第一次下来，也以为是收成不好。问了人家，才知道是刚收完，不用再抢着种。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b12_enter.L677",
          "sourceLine": 677,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你回来要是早一点，我们可以一起说这些。也用不着我每次见到珂珂，都先问你最近在哪儿。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_enter.L679",
          "sourceLine": 679,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我总想等自己把路认全了，再回来带你走，沿途哪里能住、哪里能吃东西，都安排好。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b12_enter.L681",
          "sourceLine": 681,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "可我连你什么时候回来都不知道。璃，这一等就是四年。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_enter.L683",
          "sourceLine": 683,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃低下头，拇指沿剑鞘口蹭了一下。前头的珂珂放慢脚步，绕到望台另一侧，给她们留出一段距离。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b12_enter.L685",
          "sourceLine": 685,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我知道。一直没回来，也一直没把缘故跟你说清楚。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_12:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b12_choice": {
      "id": "b12_choice",
      "title": "这次把话说完整",
      "regionId": "B-12",
      "turns": [
        {
          "id": "b12_choice.L691",
          "sourceLine": 691,
          "speaker": "璃",
          "portrait": "hero",
          "text": "刚下山时，我连落脚的地方都没有。后来能接护送的活了，就想再攒一点，把路和住处都摸熟。每次觉得还差一点，回来的日子就往后推。",
          "branch": "response1",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L693",
          "sourceLine": 693,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "第一年，我真的等过。珂珂的货队到村口，我都会过去看看。",
          "branch": "response1",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L695",
          "sourceLine": 695,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃抬起头，张了张嘴。纱雾仍望着下面的田，却把放在石边的手收回来，攥住了地图。",
          "branch": "response1",
          "kind": "narration"
        },
        {
          "id": "b12_choice.L697",
          "sourceLine": 697,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "后来我知道你不会跟着每趟车回来，就自己问冬市、问河谷。我还有想做的事，不能每一年都等你先准备好。",
          "branch": "response1",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L699",
          "sourceLine": 699,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我以为你留在树心很忙，没想到你还一直——",
          "branch": "response1",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L701",
          "sourceLine": 701,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "一直问。你现在听见了，下回就别再替我猜了。",
          "branch": "response1",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L703",
          "sourceLine": 703,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃点了点头。这一次她没有说“早知道”，也没有拿路上的难处接着解释。",
          "branch": "response1",
          "kind": "narration"
        },
        {
          "id": "b12_choice.L707",
          "sourceLine": 707,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你现在还愿意一起去吗？我想听你怎么打算，再看我们能一起走哪一段。",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L709",
          "sourceLine": 709,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "愿意。我也有想住的地方、想学的东西，去了以后，可能不会一直跟着你的货队走。",
          "branch": "response2",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L711",
          "sourceLine": 711,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你说。我以前只想过把你带出去，后面的事，自己也没有想清楚。",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L713",
          "sourceLine": 713,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那为什么不回来跟我商量？你一句也不说，我连问都不知道去哪里问。",
          "branch": "response2",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L715",
          "sourceLine": 715,
          "speaker": "璃",
          "portrait": "hero",
          "text": "怕见了面，你问我什么时候能去，我答不上来。我先把话说满了，后来每次想回来，都觉得自己还欠着你。",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L719",
          "sourceLine": 719,
          "speaker": "旁白",
          "portrait": null,
          "text": "山下一辆车停在屋前，有人推开门，帮忙扶住伸出车尾的长木板。两个人挪了几次位置，才把板抬进院子。璃望着那扇一直敞着的门。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b12_choice.L721",
          "sourceLine": 721,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我一直觉得，空着手回来见你很难看。好像当年走得那么有把握，回头就得拿出点什么。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L723",
          "sourceLine": 723,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "带不来冬市，回来吃顿饭也行。你一声不响地不回来，我才真的不知道该怎么办。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L725",
          "sourceLine": 725,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃看向她，终于把搁在剑鞘旁的手放下来。纱雾眼圈有些红，仍直直看着她，等一个回答。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b12_choice.L727",
          "sourceLine": 727,
          "speaker": "璃",
          "portrait": "hero",
          "text": "以后有话我会回来跟你说。没准备好的，也告诉你，不让你去问一趟趟货队。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L729",
          "sourceLine": 729,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那我也先告诉你。我想在河谷住一冬，学照料普通温室。什么时候开窗，什么时候别浇水，不用根流也能养好植物，我想试。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L731",
          "sourceLine": 731,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你准备去哪里问？我陪你过去，到了门口，你先说。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b12_choice.L733",
          "sourceLine": 733,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "好。我在心里练过好多遍，你别一看我停顿，就替我全答了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b12_choice.L735",
          "sourceLine": 735,
          "speaker": "旁白",
          "portrait": null,
          "text": "珂珂在前头指了指货场的方向，仍靠着路边等。璃应了一声，没有马上迈步；纱雾把地图收好，两人又看了一会儿谷底的烟，才并肩追上去。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [
        {
          "id": "response1",
          "label": "说出自己为什么一直没回来。",
          "sourceLine": 689
        },
        {
          "id": "response2",
          "label": "先问她现在想怎样。",
          "sourceLine": 705
        }
      ],
      "directives": [],
      "backdropAssetId": "B_ENV_12:choice",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "response1",
        "response2"
      ]
    },
    "b13_enter": {
      "id": "b13_enter",
      "title": "石脚货场",
      "regionId": "B-13",
      "turns": [
        {
          "id": "b13_enter.L739",
          "sourceLine": 739,
          "speaker": "旁白",
          "portrait": null,
          "text": "抵达货场时，已经是离村后的第六天。车棚里挂着晒干的封窗布，第一批冬料还在等西石道的消息。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b13_enter.L741",
          "sourceLine": 741,
          "speaker": "旁白",
          "portrait": null,
          "text": "货场里有人垫车轮，有人用布盖住砖料。璃刚走近，就有工人指了指她们身后的路。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b13_enter.L743",
          "sourceLine": 743,
          "speaker": "货场工人",
          "portrait": null,
          "text": "西石道到哪儿能过车了？",
          "branch": "common"
        },
        {
          "id": "b13_enter.L745",
          "sourceLine": 745,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "分流台下接上了。断栈那段走分批轻车，重料在这里拆载。米露的人还在补外沿。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_enter.L747",
          "sourceLine": 747,
          "speaker": "货场工人",
          "portrait": null,
          "text": "那我们先装门板和管套，重砖后送。",
          "branch": "common"
        },
        {
          "id": "b13_enter.L749",
          "sourceLine": 749,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "冬衣呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b13_enter.L751",
          "sourceLine": 751,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "压在车棚里，没让雨打着。住户之前各自选过的尺寸都分开了，别到了山上才一件件翻。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_enter.L753",
          "sourceLine": 753,
          "speaker": "旁白",
          "portrait": null,
          "text": "她把账本交给负责货运的人，指清村里卖出果干与木料已经换好的那批货，再留下一角桌面给旅人购买用品。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b13_enter.L755",
          "sourceLine": 755,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "村里的冬料是一批，你们路上要用的东西是另一批。别把人家封窗的布买去拆成绷带。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_enter.L757",
          "sourceLine": 757,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我不会。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b13_enter.L759",
          "sourceLine": 759,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "（看她一眼）以前你会。觉得反正都是布。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_enter.L761",
          "sourceLine": 761,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（侧过头）这个我倒不知道。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b13_enter.L763",
          "sourceLine": 763,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那时候我真的受伤了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b13_enter.L765",
          "sourceLine": 765,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "所以这次先看清楚，缺什么买什么。钱花完了，路上的坏木头也不会自己长回来给你卖。",
          "branch": "common",
          "expression": "knowing"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_13:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b13_shop": {
      "id": "b13_shop",
      "title": "购物接口",
      "regionId": "B-13",
      "turns": [
        {
          "id": "b13_shop.L773",
          "sourceLine": 773,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "装好了吗？我要去看装车。想再看看就来这里，桌子不会跑。",
          "branch": "common",
          "expression": "knowing"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 769,
          "text": "【动态提示：打开商店，显示真实价格、效果、购买次数与库存规则。】"
        }
      ],
      "backdropAssetId": "B_ENV_13:shop",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b13_depart": {
      "id": "b13_depart",
      "title": "商人也要回家",
      "regionId": "B-13",
      "turns": [
        {
          "id": "b13_depart.L777",
          "sourceLine": 777,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你会一直跟着我们到停暖吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b13_depart.L779",
          "sourceLine": 779,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "货路通了，我把这一批交给米露，就回河谷。第一场大雪前，我得回家一趟。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_depart.L781",
          "sourceLine": 781,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "如果山上临时还有事呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b13_depart.L783",
          "sourceLine": 783,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "能随这趟带的，我就带。下一趟让别的货队接，装车的人又不止我一个。我若一直不回，家里的人也得天天等消息。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_depart.L785",
          "sourceLine": 785,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（摸着账本边的带子）要是有人急着用，怪你偏偏这时候走呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b13_depart.L787",
          "sourceLine": 787,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "那就先帮他找接货的人，把哪班能到说清楚。耽误了当然难受，可我总得回去，不能嘴上答应家里，日子却一推再推。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b13_depart.L789",
          "sourceLine": 789,
          "speaker": "旁白",
          "portrait": null,
          "text": "珂珂将账本的带子系紧，又解开，检查了一遍夹在里面的货单。纱雾看着她，没有再问第三次。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b13_depart.L791",
          "sourceLine": 791,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "去客舍吧。天黑以前回来吃饭，我在那边的桌上给你们留位置。",
          "branch": "common",
          "expression": "knowing"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_13:depart",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b14_enter": {
      "id": "b14_enter",
      "title": "河谷客舍",
      "regionId": "B-14",
      "turns": [
        {
          "id": "b14_enter.L795",
          "sourceLine": 795,
          "speaker": "旁白",
          "portrait": null,
          "text": "客舍窗下叠着厚被，灶旁挂着水壶。几名旅客提着行李从楼上下来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_enter.L797",
          "sourceLine": 797,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "那几户来过两趟了。还想再看看也行，有人怕楼梯，有人想离灶近。",
          "branch": "common"
        },
        {
          "id": "b14_enter.L799",
          "sourceLine": 799,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你们还有地方？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_enter.L801",
          "sourceLine": 801,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "说好的那些留着。人数变了，就再谈，不能一张嘴叫整村人都挤进来。",
          "branch": "common"
        },
        {
          "id": "b14_enter.L803",
          "sourceLine": 803,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "帮忙做饭、修篱笆，也是之前说过的？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_enter.L805",
          "sourceLine": 805,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "愿意做的，换一部分食宿；做不了的另算，先说清楚。",
          "branch": "common"
        },
        {
          "id": "b14_enter.L807",
          "sourceLine": 807,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾仔细看了看灶边一张温室通风图，主动指向图上的门。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_enter.L809",
          "sourceLine": 809,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这间温室，在这里附近吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_enter.L811",
          "sourceLine": 811,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "河那边。我姐姐管的。她冬里要教两个帮手，你想问就去问。会看根流未必用得上，会盯着湿度、不怕搬土就行。",
          "branch": "common"
        },
        {
          "id": "b14_enter.L813",
          "sourceLine": 813,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（几乎同时开口）她会——",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_enter.L815",
          "sourceLine": 815,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃停住。纱雾没有看她，继续向前。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_enter.L817",
          "sourceLine": 817,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我会照料植物，但没管过会结霜的温室。明天能去问问吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_enter.L819",
          "sourceLine": 819,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "行。我带你们过河。",
          "branch": "common"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_14:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b14_after": {
      "id": "b14_after",
      "title": "从自己的嘴里说出来",
      "regionId": "B-14",
      "turns": [
        {
          "id": "b14_after.L823",
          "sourceLine": 823,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人在客舍内廊躲雨。通向院子的门虚掩着。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_after.L825",
          "sourceLine": 825,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你早就想问了？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_after.L827",
          "sourceLine": 827,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。在心里问过好多遍。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_after.L829",
          "sourceLine": 829,
          "speaker": "璃",
          "portrait": "hero",
          "text": "从什么时候？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_after.L831",
          "sourceLine": 831,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "去年开始。后来一直想着，再等树心不那么忙的时候。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_after.L833",
          "sourceLine": 833,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你想让我陪你吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_after.L835",
          "sourceLine": 835,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（望着雨外）想。但我也想自己去。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_after.L837",
          "sourceLine": 837,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好。明天到门口我等你，要我陪着就叫我。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_after.L839",
          "sourceLine": 839,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "陪着可以，说话让我先来。刚才听见你开口，我差一点又把练好的话咽回去了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_after.L841",
          "sourceLine": 841,
          "speaker": "旁白",
          "portrait": null,
          "text": "院子里的雨声已经停了。璃往内侧让开，手离开了门闩，让出门前的位置。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_after.L843",
          "sourceLine": 843,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那你来。我跟着。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_after.L845",
          "sourceLine": 845,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾推开门，先跑进雨停后变亮的院子。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_14:after",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b14_greenhouse": {
      "id": "b14_greenhouse",
      "title": "次日的温室门口",
      "regionId": "B-14",
      "turns": [
        {
          "id": "b14_greenhouse.L849",
          "sourceLine": 849,
          "speaker": "旁白",
          "portrait": null,
          "text": "次日，客舍主人带她们过河。纱雾等门里那盆苗落稳，才开口。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_greenhouse.L851",
          "sourceLine": 851,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我想学一冬。不用暖根，怎么开窗、盖土，我都还不会。春天想回村试种。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_greenhouse.L853",
          "sourceLine": 853,
          "speaker": "温室主人",
          "portrait": null,
          "text": "先从搬土和看湿度学。上午跟我，下午和另一位帮手轮班。住客舍，帮工抵一部分食宿，余下的你算算够不够。",
          "branch": "common"
        },
        {
          "id": "b14_greenhouse.L855",
          "sourceLine": 855,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾低头算了一会儿。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_greenhouse.L857",
          "sourceLine": 857,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我攒的够。第一场雪前后的货班到，我跟着来，可以吗？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_greenhouse.L859",
          "sourceLine": 859,
          "speaker": "温室主人",
          "portrait": null,
          "text": "正好换冬苗。山上若没收尾，托货队带话，我给你留到下一班。",
          "branch": "common"
        },
        {
          "id": "b14_greenhouse.L861",
          "sourceLine": 861,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "好，我会提前说。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_greenhouse.L863",
          "sourceLine": 863,
          "speaker": "客舍主人",
          "portrait": null,
          "text": "房间给你留好。来了就找我，还是昨天那扇窗。",
          "branch": "common"
        },
        {
          "id": "b14_greenhouse.L865",
          "sourceLine": 865,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃一直等在门边。出来时，纱雾手上沾了土。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b14_greenhouse.L867",
          "sourceLine": 867,
          "speaker": "璃",
          "portrait": "hero",
          "text": "已经开始搬了？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_greenhouse.L869",
          "sourceLine": 869,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "她在试我是不是光会说。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_greenhouse.L871",
          "sourceLine": 871,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你以前就会搬。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b14_greenhouse.L873",
          "sourceLine": 873,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道。她今天才知道。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b14_greenhouse.L875",
          "sourceLine": 875,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃递过擦手布，等她伸手才松开。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_14:greenhouse",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b15_enter": {
      "id": "b15_enter",
      "title": "旧运材索道",
      "regionId": "B-15",
      "turns": [
        {
          "id": "b15_enter.L879",
          "sourceLine": 879,
          "speaker": "旁白",
          "portrait": null,
          "text": "几只结实的货筐悬在索道边。货场这端的卷轴台缺少润滑和制动检查，工人已经拆开外壳。控制卷轴的维护偶却在不断收紧绳，筐子一靠近台边便猛烈晃动。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b15_enter.L881",
          "sourceLine": 881,
          "speaker": "货场工人",
          "portrait": null,
          "text": "它把负载不够当作需要加速。空筐也不停。",
          "branch": "common"
        },
        {
          "id": "b15_enter.L883",
          "sourceLine": 883,
          "speaker": "璃",
          "portrait": "hero",
          "text": "为什么不先断开绳？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b15_enter.L885",
          "sourceLine": 885,
          "speaker": "货场工人",
          "portrait": null,
          "text": "断了还得重新架跨谷线。我们有替换卷轴，没办法现在把整根线重新送上去。",
          "branch": "common"
        },
        {
          "id": "b15_enter.L887",
          "sourceLine": 887,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "让我看一下收力的方向。先卸旁边这只空筐，免得它甩过来。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_15:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b15_pre": {
      "id": "b15_pre",
      "title": "卷索维护偶",
      "regionId": "B-15",
      "turns": [
        {
          "id": "b15_pre.L891",
          "sourceLine": 891,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃等工人退到安全栏外，才接近卷轴底座。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b15_pre.L893",
          "sourceLine": 893,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我拆它的驱动，卷轴留下。它停了也别立刻放货，制动片还要重新装。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 895,
          "text": "【动态提示：预览卷索偶战斗；胜利后仍须检修、试载。】"
        }
      ],
      "backdropAssetId": "B_ENV_15:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b15_post": {
      "id": "b15_post",
      "title": "第一箱上山的冬料",
      "regionId": "B-15",
      "turns": [
        {
          "id": "b15_post.L899",
          "sourceLine": 899,
          "speaker": "旁白",
          "portrait": null,
          "text": "又过了一天。工人检查制动、逐筐试载，再将管套和门板装进货筐。绳缓缓上行，货物没有再撞向台边。",
          "branch": "common",
          "kind": "narration",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L901",
          "sourceLine": 901,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "现在人能坐吗？",
          "branch": "common",
          "expression": "gentle",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L903",
          "sourceLine": 903,
          "speaker": "货场工人",
          "portrait": null,
          "text": "不能。货筐和制动都按货做的。人走刚修好的路，别图快。",
          "branch": "common",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L905",
          "sourceLine": 905,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（望着渐小的货筐）上面谁接？",
          "branch": "common",
          "expression": "guarded",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L907",
          "sourceLine": 907,
          "speaker": "货场工人",
          "portrait": null,
          "text": "半山候车屋旁的卸料坪，米露派了两个人守着。管套和短门板从那里沿旧工用路送回村。重砖还走西石道，分小车，一趟趟上。",
          "branch": "common",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L909",
          "sourceLine": 909,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "学舍的窗能先封上了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L911",
          "sourceLine": 911,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "嗯。你们继续往北走。我押下一趟轻车回村，把货交完再下来。",
          "branch": "common",
          "expression": "knowing",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L913",
          "sourceLine": 913,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾看了一会儿客舍所在的方向，又把路图展开到北面。",
          "branch": "common",
          "kind": "narration",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L915",
          "sourceLine": 915,
          "speaker": "璃",
          "portrait": "hero",
          "text": "温室那边，还有什么想问的吗？",
          "branch": "common",
          "expression": "guarded",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L917",
          "sourceLine": 917,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "昨天都谈好了。开课还在后面，我们先回山上，做完这次的事。",
          "branch": "common",
          "expression": "gentle",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L919",
          "sourceLine": 919,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好。回山的路还长，有想停下来做的事就跟我说，我们一起商量。",
          "branch": "common",
          "expression": "guarded",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L921",
          "sourceLine": 921,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这回我想清楚了。温室那边也等得到，我们先把山上的事做完，再按约好的日子下来。",
          "branch": "common",
          "expression": "gentle",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L923",
          "sourceLine": 923,
          "speaker": "旁白",
          "portrait": null,
          "text": "珂珂与她们在货场分开。",
          "branch": "common",
          "kind": "narration",
          "phase": "delivery"
        },
        {
          "id": "b15_post.L925",
          "sourceLine": 925,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "那就村里见。北坡风大，别走太晚。",
          "branch": "common",
          "expression": "knowing",
          "phase": "delivery"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_15:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b15_exit": {
      "id": "b15_exit",
      "title": "b15_exit",
      "regionId": "B-15",
      "turns": [
        {
          "id": "b15_exit.L929",
          "sourceLine": 929,
          "speaker": "旁白",
          "portrait": null,
          "text": "向北的山路在暮光里转入树林。身后还有货轮转动的声音。纱雾回望一次，继续向前。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b15_exit.L931",
          "sourceLine": 931,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这回我知道下面有人住着了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b15_exit.L933",
          "sourceLine": 933,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你以前也知道。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b15_exit.L935",
          "sourceLine": 935,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "以前是地图上的字。现在我知道水壶挂在哪里。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_15:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b16_enter": {
      "id": "b16_enter",
      "title": "背阴山腰",
      "regionId": "B-16",
      "turns": [
        {
          "id": "b16_enter.L941",
          "sourceLine": 941,
          "speaker": "旁白",
          "portrait": null,
          "text": "次日下午，山路转入背阴处，湿地还未结冰。靠谷的石道较远，近处侧根两端都有旧石台。冷风从谷底上来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b16_enter.L943",
          "sourceLine": 943,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（搓了搓手指）这里比早上凉。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b16_enter.L945",
          "sourceLine": 945,
          "speaker": "璃",
          "portrait": "hero",
          "text": "去背风处再看图。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b16_enter.L947",
          "sourceLine": 947,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人在岩壁凹处停下，将图纸铺在干石上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b16_enter.L949",
          "sourceLine": 949,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "第二个楔座在侧台。走过去能避开石道下的拖架。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b16_enter.L951",
          "sourceLine": 951,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先看它现在拖着什么。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b16_enter.L953",
          "sourceLine": 953,
          "speaker": "旁白",
          "portrait": null,
          "text": "石道下方，失控拖架把废弃货斗拉进通行道，又拖回去；普通路线确实可走，但必须解除占道的维护偶，不能在它运动时挤过。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_16:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b16_route": {
      "id": "b16_route",
      "title": "第二处根楔分岔",
      "regionId": "B-16",
      "turns": [
        {
          "id": "b16_route.L961",
          "sourceLine": 961,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人固定侧根，先步行过岸。",
          "branch": "root",
          "kind": "narration",
          "phase": "fixed"
        },
        {
          "id": "b16_route.L961.2",
          "sourceLine": 961,
          "speaker": "旁白",
          "portrait": null,
          "text": "接应的工队沿已清开的路送来短桥板，将侧根与两端石台接平；最后在拖架转动范围外补上护栏。",
          "branch": "root",
          "kind": "narration",
          "phase": "works"
        },
        {
          "id": "b16_route.L963",
          "sourceLine": 963,
          "speaker": "工队住民",
          "portrait": null,
          "text": "货斗够不到这里。铺完这段，轻车分批走；旧石道先拦着。",
          "branch": "root",
          "phase": "works"
        },
        {
          "id": "b16_route.L965",
          "sourceLine": 965,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（看着另一边仍在往返的拖架）旧口的标记别拆。它还没有停。",
          "branch": "root",
          "expression": "guarded",
          "phase": "works"
        },
        {
          "id": "b16_route.L967",
          "sourceLine": 967,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我把新路和旧路分开画。回来的时候，不用凭印象找。",
          "branch": "root",
          "expression": "gentle",
          "phase": "works"
        },
        {
          "id": "b16_route.L971",
          "sourceLine": 971,
          "speaker": "旁白",
          "portrait": null,
          "text": "工队搬走废货斗与松动轨架，沿原石道推过一辆轻车。",
          "branch": "originalPost",
          "kind": "narration"
        },
        {
          "id": "b16_route.L973",
          "sourceLine": 973,
          "speaker": "璃",
          "portrait": "hero",
          "text": "现在不会横过来了。",
          "branch": "originalPost",
          "expression": "guarded"
        },
        {
          "id": "b16_route.L975",
          "sourceLine": 975,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这条也接上了。我画给后面来的人。",
          "branch": "originalPost",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 957,
          "text": "【动态提示：比较本处两路的敌人、战损、收益；使用根楔需一枚，无楔仍可选原路。】"
        },
        {
          "sourceLine": 977,
          "text": "【即时状态：所选路线完成对应普通施工后，本段才开放公共通行。】"
        }
      ],
      "backdropAssetId": "B_ENV_16:route",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "root",
        "originalPost"
      ]
    },
    "b16_exit": {
      "id": "b16_exit",
      "title": "温室门外",
      "regionId": "B-16",
      "turns": [
        {
          "id": "b16_exit.L981",
          "sourceLine": 981,
          "speaker": "旁白",
          "portrait": null,
          "text": "前方能看见温室的玻璃反光，绯叶站在门外，脚边放着准备移栽的土盆。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b16_exit.L983",
          "sourceLine": 983,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "我从村里的旧工用路来，刚才在候车屋接了一筐管套。这些盆也是大家分批抬来的。你们那边的路接上了？",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b16_exit.L985",
          "sourceLine": 985,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "接上了。我们把接好的路画给工队了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b16_exit.L987",
          "sourceLine": 987,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "那先洗手。里面有几盆，昨天才碰了一下就掉叶。",
          "branch": "common",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_16:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b17_enter": {
      "id": "b17_enter",
      "title": "暖生温室",
      "regionId": "B-17",
      "turns": [
        {
          "id": "b17_enter.L991",
          "sourceLine": 991,
          "speaker": "旁白",
          "portrait": null,
          "text": "温室里的土腥气扑面而来。几排植物系着简单标记，搬走的盆在架上留下浅色圆印；最里侧的植株仍开着细白花，隔门一开，花瓣便轻轻颤起来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b17_enter.L993",
          "sourceLine": 993,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "外面这些耐得住，慢慢脱暖就能带走。种子也已收好了。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L995",
          "sourceLine": 995,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那还需要两份暖脂的，是里面这些？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b17_enter.L997",
          "sourceLine": 997,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "嗯，还有几个不结籽的品系。只能一株株分出来养；留了种子，也长不回它们现在的样子。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L999",
          "sourceLine": 999,
          "speaker": "璃",
          "portrait": "hero",
          "text": "加柴炉呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b17_enter.L1001",
          "sourceLine": 1001,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "外间能用，耐冷的已经搬出来了。里面的白花受不了忽冷忽热，也怕烟。两份暖脂封在内间，整冬慢慢放，才守得住那一点温度。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L1003",
          "sourceLine": 1003,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶将一盆挪进内间。盆已放稳，她的手还托着盆沿，又轻轻转了半圈，让枝头避开隔门的阴影。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b17_enter.L1005",
          "sourceLine": 1005,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这边也要朝光？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b17_enter.L1007",
          "sourceLine": 1007,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "这根侧枝只剩三个芽，得给它留光。去年还开过七朵，我每天进来都数，怕漏了一朵。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L1009",
          "sourceLine": 1009,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾也跟着数了一遍。绯叶没有催她，只将快要碰到门框的一片叶子拨回里面。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b17_enter.L1011",
          "sourceLine": 1011,
          "speaker": "璃",
          "portrait": "hero",
          "text": "如果最后给不了这两份，你这里能保下哪些？你直说，我得听明白。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b17_enter.L1013",
          "sourceLine": 1013,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "外间这些、收好的种子，还有能耐冷的分株。里面几样会死，我会留标本。花压进纸里以后，就再也开不了了。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L1015",
          "sourceLine": 1015,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "树心窗外也有这朵。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b17_enter.L1017",
          "sourceLine": 1017,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "从这里分过去的。你小时候老来问它什么时候再开。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b17_enter.L1019",
          "sourceLine": 1019,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶打开压花夹，里面夹着干净的纸。她看了一眼枝头，又把夹子合拢，手掌在封皮上停了停。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b17_enter.L1021",
          "sourceLine": 1021,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "我还没舍得摘。要是真留不住，总得挑最完整的一枝。你们先看，不用现在就回答我。",
          "branch": "common",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_17:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b17_offer": {
      "id": "b17_offer",
      "title": "温室选择前",
      "regionId": "B-17",
      "turns": [
        {
          "id": "b17_offer.L1029",
          "sourceLine": 1029,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "两份都放这里？",
          "branch": "invest",
          "expression": "watchful"
        },
        {
          "id": "b17_offer.L1031",
          "sourceLine": 1031,
          "speaker": "璃",
          "portrait": "hero",
          "text": "嗯，这两份留给内间。你照刚才说的办法做，我们帮你把门封好。",
          "branch": "invest",
          "expression": "guarded"
        },
        {
          "id": "b17_offer.L1033",
          "sourceLine": 1033,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶用指腹轻轻托开槽边的叶子，才接过暖脂。",
          "branch": "invest",
          "kind": "narration"
        },
        {
          "id": "b17_offer.L1035",
          "sourceLine": 1035,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "好。叶子别压着，盖板慢一点落。今晚我把最后那道门缝也封上。",
          "branch": "invest",
          "expression": "watchful"
        },
        {
          "id": "b17_offer.L1037",
          "sourceLine": 1037,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶点头，把暖脂送进内侧慢释槽。璃扶稳盖板，纱雾读完低限温标，三人一起关上内门。",
          "branch": "invest",
          "kind": "narration"
        },
        {
          "id": "b17_offer.L1039",
          "sourceLine": 1039,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "这一冬我守着它们，春天再试别的养法。你们下次来，先隔着玻璃看，别为了看花把热都放跑了。",
          "branch": "invest",
          "expression": "watchful"
        },
        {
          "id": "b17_offer.L1045",
          "sourceLine": 1045,
          "speaker": "璃",
          "portrait": "hero",
          "text": "盒子先不开，我还得想想。哪些盆现在就能搬？你指给我，我先把这些挪好。",
          "branch": "defer",
          "expression": "guarded"
        },
        {
          "id": "b17_offer.L1047",
          "sourceLine": 1047,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "廊下那一排，避风又能照到光。端盆底，别抓枝条，这几天叶子一碰就掉。",
          "branch": "defer",
          "expression": "watchful"
        },
        {
          "id": "b17_offer.L1049",
          "sourceLine": 1049,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾与璃各端起一个普通土盆，按绯叶指出的位置放到避风廊下。",
          "branch": "defer",
          "kind": "narration"
        }
      ],
      "choices": [
        {
          "id": "invest",
          "label": "投入两份，保温室一冬。",
          "sourceLine": 1027
        },
        {
          "id": "defer",
          "label": "先按普通办法保留植株，暖脂稍后决定。",
          "sourceLine": 1043
        }
      ],
      "directives": [
        {
          "sourceLine": 1025,
          "text": "【动态提示：温室需两份可分配暖脂。展示余量、其余可行组合和不可收回；不足则禁用投入。】"
        },
        {
          "sourceLine": 1041,
          "text": "【即时状态：扣除两份可分配暖脂，温室保温成立。】"
        },
        {
          "sourceLine": 1051,
          "text": "【即时状态：未投入，可回访。普通移栽继续进行。】"
        }
      ],
      "backdropAssetId": "B_ENV_17:offer",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invest",
        "defer"
      ]
    },
    "b17_revisit": {
      "id": "b17_revisit",
      "title": "b17_revisit",
      "regionId": "B-17",
      "turns": [
        {
          "id": "b17_revisit.L1055",
          "sourceLine": 1055,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "温标很稳。别再开内门，热留给里面。",
          "branch": "invested",
          "expression": "watchful"
        },
        {
          "id": "b17_revisit.L1057",
          "sourceLine": 1057,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "槽还空着。要用那两份，还是先留着？",
          "branch": "affordable",
          "expression": "watchful"
        },
        {
          "id": "b17_revisit.L1059",
          "sourceLine": 1059,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "能移的盆先搬到避风处。来，帮我端这一盆。",
          "branch": "unaffordable",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_17:revisit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invested",
        "affordable",
        "unaffordable"
      ]
    },
    "b18_enter": {
      "id": "b18_enter",
      "title": "老梨树坡",
      "regionId": "B-18",
      "turns": [
        {
          "id": "b18_enter.L1063",
          "sourceLine": 1063,
          "speaker": "旁白",
          "portrait": null,
          "text": "坡上的老梨树比记忆里低，树身偏向一侧。粗枝上两道旧绳痕还在，绳却早已收走。纱雾拨开树下的草，露出一截被坐得发亮的平根，伸手摸了摸。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b18_enter.L1065",
          "sourceLine": 1065,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "以前坐在这里，脚还够不到地。现在看，怎么就这么一小块？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_enter.L1067",
          "sourceLine": 1067,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你往里坐一点，我看看。……真的小了，小时候还觉得能躺下。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_enter.L1069",
          "sourceLine": 1069,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你总抢右边，说靠着路口，喊一声就有人来。我在左边，回去得抖半天领子。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_enter.L1071",
          "sourceLine": 1071,
          "speaker": "璃",
          "portrait": "hero",
          "text": "左边老掉树皮。我那时说得好听，其实是不想换过去。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_enter.L1073",
          "sourceLine": 1073,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾拢着裙摆坐到左边，抬头看她。璃蹲在右侧，摸到平根上一道旧裂纹，手指不由得沿着划了一遍。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b18_enter.L1075",
          "sourceLine": 1075,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我就知道。每回我一说硌，你就说再坐一会儿，马上有人经过了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_enter.L1077",
          "sourceLine": 1077,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那今天你坐右边吧。我试试左边到底有多难坐。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_enter.L1079",
          "sourceLine": 1079,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾用肩轻轻碰了她一下，没有立刻换。两人顺着旧绳痕望向枝头，绯叶从温室过来，在几步外蹲下，拨开一小片根土。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b18_enter.L1081",
          "sourceLine": 1081,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "先看看这里。它是暖生老品种，根这些年坏了一半；上面还绿着，底下却已经靠那条暖根撑着了。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b18_enter.L1083",
          "sourceLine": 1083,
          "speaker": "璃",
          "portrait": "hero",
          "text": "现在就包起来，慢慢停暖呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_enter.L1085",
          "sourceLine": 1085,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "挡风的东西我备好了，可光包住不够。底下得跟着旧根槽缓缓降下来，才好分根移栽。我们现成能用的，就是这一份暖脂。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b18_enter.L1087",
          "sourceLine": 1087,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "一份用完，它就能过冬？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_enter.L1089",
          "sourceLine": 1089,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "能把这次脱暖、分根和移栽做完，保住活根。开春别急着要它结果，得先让它慢慢养回来。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b18_enter.L1091",
          "sourceLine": 1091,
          "speaker": "璃",
          "portrait": "hero",
          "text": "不用呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_enter.L1093",
          "sourceLine": 1093,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "枝样能留，木料以后也能用，这棵活树留不住。停暖后会慢慢干下去；你们现在看它还有叶子，别把这当成它能熬过去。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b18_enter.L1095",
          "sourceLine": 1095,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾的笑意收了。她拂去根上的浮土，手停在那截发亮的木纹旁，没有再往上坐。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b18_enter.L1097",
          "sourceLine": 1097,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "我先去看温室。你们想问什么，再叫我，根土留着别踩。",
          "branch": "common",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_18:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b18_private": {
      "id": "b18_private",
      "title": "梨树下",
      "regionId": "B-18",
      "turns": [
        {
          "id": "b18_private.L1101",
          "sourceLine": 1101,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我想留它，是真的。听见还能移栽时，心里一下就松了，好像我们小时候坐过的地方还能再等一年。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_private.L1103",
          "sourceLine": 1103,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我也是。每次想起村里，就会想起这里。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_private.L1105",
          "sourceLine": 1105,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "可我也记得温室里那几个芽。绯叶一盆盆数过，我到了自己的梨树底下，才明白她为什么一直舍不得合上压花夹。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_private.L1107",
          "sourceLine": 1107,
          "speaker": "旁白",
          "portrait": null,
          "text": "她把手指放进旧绳磨出的浅沟，沿着沟底摸过去。璃在旁边坐下来，听她慢慢说，没有急着找一句能让她宽心的话。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b18_private.L1109",
          "sourceLine": 1109,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我想把这些告诉你。想留的有好几处，每一处都舍不得；你不用一听见我难过，就赶紧答应替我把它们全留下。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b18_private.L1111",
          "sourceLine": 1111,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那你就慢慢说。我也想再和你坐在这里，想起来的时候，一样会难过。我们可以一起惦记着。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b18_private.L1113",
          "sourceLine": 1113,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾靠过来，肩膀轻轻碰着她。两人望着枝头坐了一会儿，风把叶子翻过一面，露出淡些的背色。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_18:private",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b18_offer": {
      "id": "b18_offer",
      "title": "梨树选择前",
      "regionId": "B-18",
      "turns": [
        {
          "id": "b18_offer.L1121",
          "sourceLine": 1121,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这一份给梨树。我想过了，要把它活着搬走。绯叶，麻烦你过来看看根槽。",
          "branch": "invest",
          "expression": "guarded"
        },
        {
          "id": "b18_offer.L1123",
          "sourceLine": 1123,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "等搬好了，我们在新地方放张凳子。它刚长好的根，别再让我们坐坏了。",
          "branch": "invest",
          "expression": "gentle"
        },
        {
          "id": "b18_offer.L1125",
          "sourceLine": 1125,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃取出一份暖脂。绯叶回来接手根槽，三人按事先说好的方法围好根土。后续搬运由已到位的工队完成。",
          "branch": "invest",
          "kind": "narration"
        },
        {
          "id": "b18_offer.L1131",
          "sourceLine": 1131,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先不动这一份。去看看半山候车屋，再回来商量；根土怎么护，你再教我们一遍。",
          "branch": "defer",
          "expression": "guarded"
        },
        {
          "id": "b18_offer.L1133",
          "sourceLine": 1133,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（起身拍掉手上的土）好。现在还能好好看它，别一着急，就只顾着告别。",
          "branch": "defer",
          "expression": "gentle"
        }
      ],
      "choices": [
        {
          "id": "invest",
          "label": "投入一份，帮助梨树脱暖与移栽。",
          "sourceLine": 1119
        },
        {
          "id": "defer",
          "label": "暂不投入，先看完另一处。",
          "sourceLine": 1129
        }
      ],
      "directives": [
        {
          "sourceLine": 1117,
          "text": "【动态提示：梨树需一份，展示余量与被排除的组合；投入保证脱暖移栽完成，不随机失败，也不保证来年结果。】"
        },
        {
          "sourceLine": 1127,
          "text": "【即时状态：扣除一份可分配暖脂，脱暖与移栽成立。】"
        },
        {
          "sourceLine": 1135,
          "text": "【即时状态：不消费，可以回访。此时不砍树、不提前生成坐凳；最终放弃后才在尾声执行木料利用。】"
        }
      ],
      "backdropAssetId": "B_ENV_18:offer",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invest",
        "defer"
      ]
    },
    "b18_revisit": {
      "id": "b18_revisit",
      "title": "b18_revisit",
      "regionId": "B-18",
      "turns": [
        {
          "id": "b18_revisit.L1139",
          "sourceLine": 1139,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "绯叶开始围根土了。我们别再坐这里，会压到移栽绳。",
          "branch": "invested",
          "expression": "gentle"
        },
        {
          "id": "b18_revisit.L1141",
          "sourceLine": 1141,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这一份还留得出来。我们再看看根，再把另外两处一起想一遍，别只因为走回来就急着点头。",
          "branch": "affordable",
          "expression": "guarded"
        },
        {
          "id": "b18_revisit.L1143",
          "sourceLine": 1143,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道暖脂用到哪里了。那些地方也要紧，只是看见它还这样绿着，心里还是难受。让我坐一会儿吧。",
          "branch": "unaffordable",
          "expression": "gentle"
        },
        {
          "id": "b18_revisit.L1145",
          "sourceLine": 1145,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人安静坐了一会儿。",
          "branch": "unaffordable",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_18:revisit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invested",
        "affordable",
        "unaffordable"
      ]
    },
    "b19_enter": {
      "id": "b19_enter",
      "title": "半山候车屋",
      "regionId": "B-19",
      "turns": [
        {
          "id": "b19_enter.L1149",
          "sourceLine": 1149,
          "speaker": "旁白",
          "portrait": null,
          "text": "候车屋的门已经修好，推开时只响了一小声。厚石墙里嵌着旧暖脂槽，炉边的柴劈得整整齐齐。门外新清出的平地够停两三辆轻车，有人正把碎石踢到边上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b19_enter.L1151",
          "sourceLine": 1151,
          "speaker": "工队住民",
          "portrait": null,
          "text": "门和烟道都修好了。暖脂槽也还完整。",
          "branch": "common"
        },
        {
          "id": "b19_enter.L1153",
          "sourceLine": 1153,
          "speaker": "璃",
          "portrait": "hero",
          "text": "两份放在这里，能多做什么？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b19_enter.L1155",
          "sourceLine": 1155,
          "speaker": "工队住民",
          "portrait": null,
          "text": "墙和地面能整冬带一点底温，水壶不结冰。晚来的推门就能歇，不用先穿着湿衣服等炉子烧起来；想坐暖、煮茶，还是得添柴。",
          "branch": "common"
        },
        {
          "id": "b19_enter.L1157",
          "sourceLine": 1157,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "如果不用暖脂，赶路的人到了这里怎么办？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b19_enter.L1159",
          "sourceLine": 1159,
          "speaker": "工队住民",
          "portrait": null,
          "text": "屋子照样开，门窗和柴炉都弄好了。我们排白天的班，近处的人先来生火；天气不好就少走一趟。大家得早点出门，也得多等炉子一会儿。",
          "branch": "common"
        },
        {
          "id": "b19_enter.L1161",
          "sourceLine": 1161,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃拿起一只空杯，凉意贴住掌心。工人见她看杯子，顺手指了指炉边水壶，又弯腰把滚出来的一根柴塞回去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b19_enter.L1163",
          "sourceLine": 1163,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先来点火的人，得比货队早多久？一直让那几户跑，会不会顾不过来？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b19_enter.L1165",
          "sourceLine": 1165,
          "speaker": "工队住民",
          "portrait": null,
          "text": "几户轮着来，已经商量过这一冬怎么排。用了暖脂，也还有扫雪、关门的活；有人有事得换班，不能光把暖槽填上就都不管了。",
          "branch": "common"
        },
        {
          "id": "b19_enter.L1167",
          "sourceLine": 1167,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "等开课了，我往返也经过这里。要是有人一起等，至少能坐着把手烤干，再接着走。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b19_enter.L1169",
          "sourceLine": 1169,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把杯子放回另一只旁边，抬眼看看厚墙。这里没有她小时候的回忆，可她已经能想见自己带着行李推开这扇门的样子。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_19:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b19_offer": {
      "id": "b19_offer",
      "title": "暖屋选择前",
      "regionId": "B-19",
      "turns": [
        {
          "id": "b19_offer.L1177",
          "sourceLine": 1177,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这两份给候车屋。把槽盖打开吧。",
          "branch": "invest",
          "expression": "guarded"
        },
        {
          "id": "b19_offer.L1179",
          "sourceLine": 1179,
          "speaker": "旁白",
          "portrait": null,
          "text": "工人打开检修盖，纱雾确认槽壁完整。放入暖脂后，石墙缓慢升温。",
          "branch": "invest",
          "kind": "narration"
        },
        {
          "id": "b19_offer.L1181",
          "sourceLine": 1181,
          "speaker": "工队住民",
          "portrait": null,
          "text": "我会把使用和看炉的人手一起说清楚。暖的屋子，也得有人把门关好。",
          "branch": "invest"
        },
        {
          "id": "b19_offer.L1183",
          "sourceLine": 1183,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（把杯子放回桌面）下次有人来，就能在这里多坐一会儿。",
          "branch": "invest",
          "expression": "gentle"
        },
        {
          "id": "b19_offer.L1189",
          "sourceLine": 1189,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先按日间通行排。炉子和柴都照常准备，别等着我们。",
          "branch": "defer",
          "expression": "guarded"
        },
        {
          "id": "b19_offer.L1191",
          "sourceLine": 1191,
          "speaker": "工队住民",
          "portrait": null,
          "text": "本来就在做。你们回来时，门轴的油也该上好了。",
          "branch": "defer"
        }
      ],
      "choices": [
        {
          "id": "invest",
          "label": "投入两份，保住一冬的低暖歇脚处。",
          "sourceLine": 1175
        },
        {
          "id": "defer",
          "label": "保留普通方案，暖脂先不动。",
          "sourceLine": 1187
        }
      ],
      "directives": [
        {
          "sourceLine": 1173,
          "text": "【动态提示：暖屋需两份，展示余量、组合后果和不可收回；未投入仍用普通柴炉与日间通行，无隐藏伤亡。】"
        },
        {
          "sourceLine": 1185,
          "text": "【即时状态：扣除两份可分配暖脂，暖屋底温成立。】"
        },
        {
          "sourceLine": 1193,
          "text": "【即时状态：不消费，可回访；普通方案持续施工。】"
        }
      ],
      "backdropAssetId": "B_ENV_19:offer",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invest",
        "defer"
      ]
    },
    "b19_revisit": {
      "id": "b19_revisit",
      "title": "b19_revisit",
      "regionId": "B-19",
      "turns": [
        {
          "id": "b19_revisit.L1197",
          "sourceLine": 1197,
          "speaker": "工队住民",
          "portrait": null,
          "text": "墙热起来了。坐一会儿可以，别靠着炉子睡。",
          "branch": "invested"
        },
        {
          "id": "b19_revisit.L1199",
          "sourceLine": 1199,
          "speaker": "工队住民",
          "portrait": null,
          "text": "暖槽还空着。门窗、柴火、白天的车次，都得顾着。",
          "branch": "uninvested"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_19:revisit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "invested",
        "uninvested"
      ]
    },
    "b20_enter": {
      "id": "b20_enter",
      "title": "北枝闸室",
      "regionId": "B-20",
      "turns": [
        {
          "id": "b20_enter.L1203",
          "sourceLine": 1203,
          "speaker": "旁白",
          "portrait": null,
          "text": "闸室嵌在山壁里，透过窄窗能看见涧对面的树心外墙；中间断岩不通行，回村仍要沿北脊绕行。两座旧设施之间有一条早年穿岩铺设的金属通话管，只连接这两个固定端口。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_enter.L1205",
          "sourceLine": 1205,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（敲了两下管口）老师？我们到北枝了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_enter.L1207",
          "sourceLine": 1207,
          "speaker": "旁白",
          "portrait": null,
          "text": "管里先传来模糊的衣料声，然后是诺克缇娅的声音。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_enter.L1209",
          "sourceLine": 1209,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "听得见。你们的门关上，外面的风会把声音盖掉。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_enter.L1211",
          "sourceLine": 1211,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（关门）这里也有人新换了支架。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b20_enter.L1213",
          "sourceLine": 1213,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "工队早上装的。他们从村里背工具过来，支架拆成几件才抬得动。现在先看回水，别急着下暖脂。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_20:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b20_valve": {
      "id": "b20_valve",
      "title": "第三处支阀",
      "regionId": "B-20",
      "turns": [
        {
          "id": "b20_valve.L1217",
          "sourceLine": 1217,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾用星盘确认方向，璃检查机械卡槽。第三份主路暖脂缓慢送入；根环松开，水面先短暂升高，随后回到标线内。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1219",
          "sourceLine": 1219,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这支流闭合了，回水也平了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1221",
          "sourceLine": 1221,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好。保持锁柄不动，等我这边温标降下去。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1223",
          "sourceLine": 1223,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃握着锁柄，手心被金属硌得发白。纱雾盯住温标，等红线不再上冲，才低头看了一眼节火匣，拇指反复擦着盒角。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1225",
          "sourceLine": 1225,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "老师，我回来再多守一阵的话，能不能……",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1227",
          "sourceLine": 1227,
          "speaker": "旁白",
          "portrait": null,
          "text": "她自己停住了。管里传来轻轻的回声，后半句话却怎么也说不出来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1229",
          "sourceLine": 1229,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "你想让我再留哪一处？说给我听。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1231",
          "sourceLine": 1231,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道守再久，也不会多出一份暖脂。可走到那里，亲手摸过了，就总想再找个办法。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1233",
          "sourceLine": 1233,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "是梨树，还是温室？",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1235",
          "sourceLine": 1235,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "都有。绯叶一盆盆搬，我却想着以后去河谷。刚才忽然觉得，要是说我不走了，也许就不用眼看着这些东西少掉。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1237",
          "sourceLine": 1237,
          "speaker": "旁白",
          "portrait": null,
          "text": "通话管那头安静了一会儿。纱雾贴近管口，只听见老师挪动椅子的声音，没有听见那个她其实知道不会有的办法。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1239",
          "sourceLine": 1239,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "窗外那盆白花，我养了九年。我也想留。你肯陪我守着，我当然舍不得让你走，可我答应不了把所有花都保住。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1241",
          "sourceLine": 1241,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "九年了？我还以为那盆每年都会换新的。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1243",
          "sourceLine": 1243,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "你第一次来值房，问我花是不是纸做的。我叫你摸，你又怕摸坏了，站在那里看了半天。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1245",
          "sourceLine": 1245,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾捂着嘴笑了一下，紧接着鼻尖又酸起来。她松开节火匣的盒角，把手放在冰凉的管壁上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1247",
          "sourceLine": 1247,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "老师，我还是想去河谷。怕你这里难，也舍不得那些花，可我想去。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1249",
          "sourceLine": 1249,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "那就跟我说说，你去那里做什么。一直听你说“以后”，这回有地方了吗？",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1251",
          "sourceLine": 1251,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（仍握着锁柄）纱雾，老师听着呢，跟她说吧。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b20_valve.L1253",
          "sourceLine": 1253,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。老师，我找到地方了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1255",
          "sourceLine": 1255,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃朝她点了点头，仍替她握稳锁柄。纱雾望了她一眼，贴近管口，把接下来的话说清楚。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1257",
          "sourceLine": 1257,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "普通温室，学一冬，食宿和帮工都谈好了。春天回来试种。我已经想了很久，想看看不用暖根，自己能把苗养成什么样。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_valve.L1259",
          "sourceLine": 1259,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好。把到的日子跟人家说准，山上的事也早一点交出去。我的茶从春天放到现在，还老想着回家再喝，你可别学这个。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b20_valve.L1261",
          "sourceLine": 1261,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾应了一声，重新望向温标。等红线彻底稳住，她才发觉自己的手终于不再抓着匣角。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_valve.L1263",
          "sourceLine": 1263,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "可以松手了，璃。纱雾，走的时候把门关严，我这边听见风直往管里灌。路上说话，别又站在风口受凉。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1265,
          "text": "【即时状态：第三支阀关闭，扣除一份保留暖脂。】"
        }
      ],
      "backdropAssetId": "B_ENV_20:valve",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b20_exit": {
      "id": "b20_exit",
      "title": "b20_exit",
      "regionId": "B-20",
      "turns": [
        {
          "id": "b20_exit.L1269",
          "sourceLine": 1269,
          "speaker": "旁白",
          "portrait": null,
          "text": "到了闸室门边，璃停了一下。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b20_exit.L1271",
          "sourceLine": 1271,
          "speaker": "璃",
          "portrait": "hero",
          "text": "刚才你贴着管口半天没出声，我也跟着紧张。后来听你说到温室，才放心一点。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b20_exit.L1273",
          "sourceLine": 1273,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我怕一听见老师的声音，就又改口说我不去了。还好，说出来以后，她真的在听。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_exit.L1275",
          "sourceLine": 1275,
          "speaker": "璃",
          "portrait": "hero",
          "text": "她还记得你小时候问的那盆花。等你学回来，也带她看看新种的吧。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b20_exit.L1277",
          "sourceLine": 1277,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（折好地图，伸手去推重门）到时候再问她愿不愿意去，她还想先在自己家坐坐呢。这个门真重，帮我扶一下。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b20_exit.L1279",
          "sourceLine": 1279,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃扶住重门，等纱雾过去再关好。两人踏上北脊的石阶。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_20:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b21_enter": {
      "id": "b21_enter",
      "title": "高根风口",
      "regionId": "B-21",
      "turns": [
        {
          "id": "b21_enter.L1285",
          "sourceLine": 1285,
          "speaker": "旁白",
          "portrait": null,
          "text": "山脊的风把防风布压向同一侧。高处岩台上，旧张索偶不断收紧连着上段护栏的绳，几根栏柱已经倾斜。下方背风台与它之间隔着岩脊，台上的旧石栏尚好；由近岸岩座伸向背风台的侧根轻轻晃动。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b21_enter.L1287",
          "sourceLine": 1287,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "绳只剩这一段还连着。上面不能让人过去。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b21_enter.L1289",
          "sourceLine": 1289,
          "speaker": "璃",
          "portrait": "hero",
          "text": "从侧根绕下去呢？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b21_enter.L1291",
          "sourceLine": 1291,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "固定住，再接上桥板，就能接到下面的石栏。上面的绳拉不到它。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_21:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b21_route": {
      "id": "b21_route",
      "title": "第三处根楔分岔",
      "regionId": "B-21",
      "turns": [
        {
          "id": "b21_route.L1299",
          "sourceLine": 1299,
          "speaker": "旁白",
          "portrait": null,
          "text": "缚根楔嵌入岩座。",
          "branch": "root",
          "kind": "narration",
          "phase": "fixed"
        },
        {
          "id": "b21_route.L1299.2",
          "sourceLine": 1299,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人走到背风台，招手示意工队从已经稳住的一侧接近。短板接平台口，普通斜撑顶进岩座，栏绳沿下方接好。",
          "branch": "root",
          "kind": "narration",
          "phase": "works"
        },
        {
          "id": "b21_route.L1301",
          "sourceLine": 1301,
          "speaker": "璃",
          "portrait": "hero",
          "text": "以后往返走下面。上段旧口留着拦绳，那架张索偶还在动。",
          "branch": "root",
          "expression": "guarded",
          "phase": "works"
        },
        {
          "id": "b21_route.L1303",
          "sourceLine": 1303,
          "speaker": "工队住民",
          "portrait": null,
          "text": "知道。雪天也不借那边抄近路。",
          "branch": "root",
          "phase": "works"
        },
        {
          "id": "b21_route.L1305",
          "sourceLine": 1305,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（把通行线沿背风台改过）这段接上了。",
          "branch": "root",
          "expression": "gentle",
          "phase": "works"
        },
        {
          "id": "b21_route.L1309",
          "sourceLine": 1309,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先拆驱动，再松绳。绳在吃力的时候，别站在它回弹的方向。",
          "branch": "originalPre",
          "expression": "guarded"
        },
        {
          "id": "b21_route.L1311",
          "sourceLine": 1311,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我看着张力。你听见我叫，就别往内侧退。",
          "branch": "originalPre",
          "expression": "gentle"
        },
        {
          "id": "b21_route.L1315",
          "sourceLine": 1315,
          "speaker": "旁白",
          "portrait": null,
          "text": "张索偶停下，璃与工人分段放松绳索、扶正残存栏杆。没有被战斗破坏的栏杆可以继续使用。",
          "branch": "originalPost",
          "kind": "narration"
        },
        {
          "id": "b21_route.L1317",
          "sourceLine": 1317,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "松开一点，反而稳了。",
          "branch": "originalPost",
          "expression": "gentle"
        },
        {
          "id": "b21_route.L1319",
          "sourceLine": 1319,
          "speaker": "璃",
          "portrait": "hero",
          "text": "它原先就是这样用的。",
          "branch": "originalPost",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1295,
          "text": "【动态提示：比较两路固定代价；用楔一枚，原路敌人保留。】"
        }
      ],
      "backdropAssetId": "B_ENV_21:route",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "root",
        "originalPre",
        "originalPost"
      ]
    },
    "b21_exit": {
      "id": "b21_exit",
      "title": "b21_exit",
      "regionId": "B-21",
      "turns": [
        {
          "id": "b21_exit.L1323",
          "sourceLine": 1323,
          "speaker": "旁白",
          "portrait": null,
          "text": "到达背风处，纱雾捏紧的手指终于松开。她没有立刻说话，先把呼吸放缓。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b21_exit.L1325",
          "sourceLine": 1325,
          "speaker": "璃",
          "portrait": "hero",
          "text": "还走得动？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b21_exit.L1327",
          "sourceLine": 1327,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "走得动。我要先把刚才想说的话记牢。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b21_exit.L1329",
          "sourceLine": 1329,
          "speaker": "璃",
          "portrait": "hero",
          "text": "跟米露说的？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b21_exit.L1331",
          "sourceLine": 1331,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。免得一见到她，我又先问缺不缺人。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_21:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b22_enter": {
      "id": "b22_enter",
      "title": "山脊驿台",
      "regionId": "B-22",
      "turns": [
        {
          "id": "b22_enter.L1335",
          "sourceLine": 1335,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露蹲在驿台边，将回村的几捆工料重新捆紧。圆盾靠着腿，绳头从她指间滑了两次。看见两人，她先伸手指向上门的方向，话已经到了嘴边。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1337",
          "sourceLine": 1337,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "东边的支架到了，到上门那段也查过。正好，学舍后面几天的——",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1339",
          "sourceLine": 1339,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "米露，先让我说一件事。是我自己接下来想做的。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b22_enter.L1341",
          "sourceLine": 1341,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露抬头，仍抓着半截绳。璃挪开门边的工具箱，让送料的人过去，随后留在一旁，没有替纱雾开口。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1343",
          "sourceLine": 1343,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你说。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1345",
          "sourceLine": 1345,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这次停暖，我会做到总阀关好。之后去河谷学一冬，第一场雪前后走。学舍、苗圃，还有各家的温标，你要另外排人了；我在下面上课，不能一叫就赶回来。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b22_enter.L1347",
          "sourceLine": 1347,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露看着她，过了一会儿才把绳卷放下。脚边的工料仍有一捆松着，她却暂时没有去拉。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1349",
          "sourceLine": 1349,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你走一冬？我昨天还把学舍那班填给你了。那几位老人认得你，新人去，他们说温标不准，未必肯听。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1351",
          "sourceLine": 1351,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道他们信我。我就是一想到这个，一直不敢告诉你，可再不说，又得把整个冬天都答应下来。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b22_enter.L1353",
          "sourceLine": 1353,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你要早两天说，我至少还能先找——",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1355",
          "sourceLine": 1355,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露说到一半，见纱雾的手又攥紧了。她低头揉了揉压红的指节，吐出一口气，把那句责怪咽回去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1357",
          "sourceLine": 1357,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "我现在去找两个人。你走以前，带他们认两次标记，陪着到学舍教，行不行？老人看见是你教的，总能放心一些。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1359",
          "sourceLine": 1359,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "行，我教两次，也把容易看错的地方写下来。之后每天轮到谁、有人请假谁补，你来排，别又全写回我名字下面。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b22_enter.L1361",
          "sourceLine": 1361,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "好，我排。哪两个人定下了，今晚就告诉你。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1363",
          "sourceLine": 1363,
          "speaker": "旁白",
          "portrait": null,
          "text": "门外有人借短绳，米露把手里的递出去。回来后，她摊开图册，划掉纱雾名字旁的一笔，又留了两格，准备写新的名字。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1365",
          "sourceLine": 1365,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "头几天肯定有人认错。你教的时候，让他们自己报一遍，别看着慢，就伸手全做了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_enter.L1367",
          "sourceLine": 1367,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那你也帮我记着。等我忍不住又去看，提醒我说好的两次。可别一边提醒，一边问我能不能“就今天”。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b22_enter.L1369",
          "sourceLine": 1369,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露看了她一眼，尾巴在凳腿边扫过。纱雾仍等着，没有先笑着把自己的要求收回去。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_enter.L1371",
          "sourceLine": 1371,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "记着了。你把那一季学好，春天回来，我还想看看你带回什么新苗。",
          "branch": "common",
          "expression": "alert"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_22:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b22_after": {
      "id": "b22_after",
      "title": "米露也有一句自己的话",
      "regionId": "B-22",
      "turns": [
        {
          "id": "b22_after.L1375",
          "sourceLine": 1375,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾去跟工人核对水管标记。米露叫住璃。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_after.L1377",
          "sourceLine": 1377,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你早知道她要走？",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1379",
          "sourceLine": 1379,
          "speaker": "璃",
          "portrait": "hero",
          "text": "比你早一点。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1381",
          "sourceLine": 1381,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "怎么没先跟我说？",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1383",
          "sourceLine": 1383,
          "speaker": "璃",
          "portrait": "hero",
          "text": "她想自己说。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1385",
          "sourceLine": 1385,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露看了看正在指温标的纱雾，尾巴轻轻放到椅腿旁。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b22_after.L1387",
          "sourceLine": 1387,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "以前叫她一声，她总会过来。我就想着这件有人管了，下一件也先问她，没去想她是不是已经没空了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1389",
          "sourceLine": 1389,
          "speaker": "璃",
          "portrait": "hero",
          "text": "她怕你为难，憋了一路才开口。你刚才皱眉的时候，她又差一点往回缩。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1391",
          "sourceLine": 1391,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "我是真为难，少这么一个熟手，得挨个找人学。可她已经把想做的说清楚了，我总不能装作没听见。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1393",
          "sourceLine": 1393,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你呢？这一冬，就准备一直留在山上？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1395",
          "sourceLine": 1395,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "先把这轮巡护排稳。之后我也要下去买点自己的东西，不用每回进铺子，先掏出别人托带的单子。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1397",
          "sourceLine": 1397,
          "speaker": "璃",
          "portrait": "hero",
          "text": "哪天想好了，跟接班的人说一声。我可不想下次回来，还听你说“等忙完这阵”。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1399",
          "sourceLine": 1399,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "（抬眼看她）你才回来几天，这就管到我身上了？",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b22_after.L1401",
          "sourceLine": 1401,
          "speaker": "璃",
          "portrait": "hero",
          "text": "听着熟吧。我在路上刚挨过一遍。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b22_after.L1403",
          "sourceLine": 1403,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露终于笑了一下，拿起桌上的巡路图。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_22:after",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b23_enter": {
      "id": "b23_enter",
      "title": "回枝上门",
      "regionId": "B-23",
      "turns": [
        {
          "id": "b23_enter.L1409",
          "sourceLine": 1409,
          "speaker": "旁白",
          "portrait": null,
          "text": "上门前，小车一辆辆试过转角。有人往回程车上放行李，也有人把卸下的冬柴搬进自家院子。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b23_enter.L1411",
          "sourceLine": 1411,
          "speaker": "住民",
          "portrait": null,
          "text": "河谷的屋子看好了。我先带这两包，剩下的下趟搬。",
          "branch": "common"
        },
        {
          "id": "b23_enter.L1413",
          "sourceLine": 1413,
          "speaker": "抱窗框的住民",
          "portrait": null,
          "text": "我还是住上面。学舍给我留了位置，太冷的时候去那里。",
          "branch": "common"
        },
        {
          "id": "b23_enter.L1415",
          "sourceLine": 1415,
          "speaker": "另一位住民",
          "portrait": null,
          "text": "我先住河谷，家里的活有空就回来做。这条路你们还得多走几趟，看看雨后会不会松。",
          "branch": "common"
        },
        {
          "id": "b23_enter.L1417",
          "sourceLine": 1417,
          "speaker": "璃",
          "portrait": "hero",
          "text": "会。工队也会看，不只等我们。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b23_enter.L1419",
          "sourceLine": 1419,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾侧过身，让一辆轻车过去。车上是她在河谷见过的那批门板。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b23_enter.L1421",
          "sourceLine": 1421,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它们真的到了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b23_enter.L1423",
          "sourceLine": 1423,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你亲眼看着装上去的。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b23_enter.L1425",
          "sourceLine": 1425,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "可见到它们在这里，还是不一样。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1407,
          "text": "【入口条件：外部环路各段已清障或完成所选根楔旁路施工，详见文末；不要求尚未发生的 24 库房取材或 25 第四阀。】"
        }
      ],
      "backdropAssetId": "B_ENV_23:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b23_home": {
      "id": "b23_home",
      "title": "上门旁的行囊",
      "regionId": "B-23",
      "turns": [
        {
          "id": "b23_home.L1429",
          "sourceLine": 1429,
          "speaker": "旁白",
          "portrait": null,
          "text": "一位住民在上门旁犹豫，手里拿着空行囊。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b23_home.L1431",
          "sourceLine": 1431,
          "speaker": "住民",
          "portrait": null,
          "text": "我还没决定。",
          "branch": "common"
        },
        {
          "id": "b23_home.L1433",
          "sourceLine": 1433,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "今天先跟到候车屋，看看路。回来再说。基础住处给你留着，不催你把屋里的东西全装起来。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b23_home.L1435",
          "sourceLine": 1435,
          "speaker": "住民",
          "portrait": null,
          "text": "如果我冬里又想回来了呢？",
          "branch": "common"
        },
        {
          "id": "b23_home.L1437",
          "sourceLine": 1437,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "选个合适的天气，先跟下面打声招呼，别摸黑自己走。路修来就是要走的，不是出去一次就封上。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b23_home.L1439",
          "sourceLine": 1439,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃站在门侧，第一次没有替那位住民接下选择。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_23:home",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b23_shawu_reply": {
      "id": "b23_shawu_reply",
      "title": "可选关系短句",
      "regionId": "B-23",
      "turns": [
        {
          "id": "b23_shawu_reply.L1445",
          "sourceLine": 1445,
          "speaker": "璃",
          "portrait": "hero",
          "text": "刚回来时，我以为清出一条下山路，把大家送走就算帮上忙了。没想到光是这个窗框，就有人舍不得放。",
          "branch": "response1",
          "expression": "guarded"
        },
        {
          "id": "b23_shawu_reply.L1447",
          "sourceLine": 1447,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "现在呢？",
          "branch": "response1",
          "expression": "gentle"
        },
        {
          "id": "b23_shawu_reply.L1449",
          "sourceLine": 1449,
          "speaker": "璃",
          "portrait": "hero",
          "text": "先听他怎么住，再看看车怎么送。想走想留，都得有路可用。我也不用见一个人，就替他收一份行李。",
          "branch": "response1",
          "expression": "guarded"
        },
        {
          "id": "b23_shawu_reply.L1451",
          "sourceLine": 1451,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "站这边。你还是有点挡路。",
          "branch": "response1",
          "expression": "gentle"
        },
        {
          "id": "b23_shawu_reply.L1453",
          "sourceLine": 1453,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃挪了一步，两人一同笑起来。",
          "branch": "response1",
          "kind": "narration"
        },
        {
          "id": "b23_shawu_reply.L1457",
          "sourceLine": 1457,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我们先去树心，还是先回你家？",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "b23_shawu_reply.L1459",
          "sourceLine": 1459,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "去学舍。我答应的两次教温标，先约好时间。然后回家收拾一格抽屉。",
          "branch": "response2",
          "expression": "gentle"
        },
        {
          "id": "b23_shawu_reply.L1461",
          "sourceLine": 1461,
          "speaker": "璃",
          "portrait": "hero",
          "text": "只一格？",
          "branch": "response2",
          "expression": "guarded"
        },
        {
          "id": "b23_shawu_reply.L1463",
          "sourceLine": 1463,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我还没住过那么久的客舍。不知道自己想带多少东西。",
          "branch": "response2",
          "expression": "gentle"
        }
      ],
      "choices": [
        {
          "id": "response1",
          "label": "璃主动说她在学习什么。",
          "sourceLine": 1443
        },
        {
          "id": "response2",
          "label": "先问纱雾想去哪里。",
          "sourceLine": 1455
        }
      ],
      "directives": [
        {
          "sourceLine": 1465,
          "text": "（合流，无属性差异。）"
        }
      ],
      "backdropAssetId": "B_ENV_23:shawu_reply",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "response1",
        "response2"
      ]
    },
    "b24_enter": {
      "id": "b24_enter",
      "title": "干根库",
      "regionId": "B-24",
      "turns": [
        {
          "id": "b24_enter.L1469",
          "sourceLine": 1469,
          "speaker": "旁白",
          "portrait": null,
          "text": "干根库外是最后一处可固定的侧根岩座。库门前的装卸支道被一架失控压材偶占住；它往返压平已经空掉的料槽，活动臂扫过进门的宽道。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b24_enter.L1471",
          "sourceLine": 1471,
          "speaker": "工队住民",
          "portrait": null,
          "text": "冬用支架都领出去了，还剩检修道要换的扶手。主门被它扫着，侧口的根又在晃，木料抬不出来。",
          "branch": "common"
        },
        {
          "id": "b24_enter.L1473",
          "sourceLine": 1473,
          "speaker": "璃",
          "portrait": "hero",
          "text": "侧根后面，是原来的卸木平台？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b24_enter.L1475",
          "sourceLine": 1475,
          "speaker": "工队住民",
          "portrait": null,
          "text": "对。平台和侧门都够抬长料，两头也有石座。先把这根固定，铺上现成的短板，就能从侧口抬。否则得让压材偶停下，走正门。",
          "branch": "common"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_24:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b24_route": {
      "id": "b24_route",
      "title": "第四处根楔分岔",
      "regionId": "B-24",
      "turns": [
        {
          "id": "b24_route.L1483",
          "sourceLine": 1483,
          "speaker": "旁白",
          "portrait": null,
          "text": "侧根固定后，工人将岸边备好的短板铺上，先抬一根空扁担试过转角，再两人合力搬出扶手。正门外的拦绳仍在，压材偶的木臂没有越过石墙。",
          "branch": "root",
          "kind": "narration",
          "phase": "retrieved"
        },
        {
          "id": "b24_route.L1485",
          "sourceLine": 1485,
          "speaker": "璃",
          "portrait": "hero",
          "text": "侧口转得开。正门还不行，别为了少走两步钻进去。",
          "branch": "root",
          "expression": "guarded",
          "phase": "retrieved"
        },
        {
          "id": "b24_route.L1487",
          "sourceLine": 1487,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我在门外留了标记。来换下一根扶手，也从这边。",
          "branch": "root",
          "expression": "gentle",
          "phase": "retrieved"
        },
        {
          "id": "b24_route.L1491",
          "sourceLine": 1491,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我从它压下去以后接近。木料先别碰，免得它转过来追着料槽走。",
          "branch": "originalPre",
          "expression": "guarded"
        },
        {
          "id": "b24_route.L1495",
          "sourceLine": 1495,
          "speaker": "旁白",
          "portrait": null,
          "text": "活动臂停在低处。工队垫稳支撑，再抬出整根检修扶手。",
          "branch": "originalPost",
          "kind": "narration",
          "phase": "retrieved"
        },
        {
          "id": "b24_route.L1497",
          "sourceLine": 1497,
          "speaker": "工队住民",
          "portrait": null,
          "text": "现在能过了。我们先把扶手装上，你们进树心前不用踩那根裂开的旧木头。",
          "branch": "originalPost",
          "phase": "retrieved"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1479,
          "text": "【动态提示：最后楔点，比较正门与侧口；列出本处有限补给。】"
        }
      ],
      "backdropAssetId": "B_ENV_24:route",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "root",
        "originalPre",
        "originalPost"
      ]
    },
    "b24_warning": {
      "id": "b24_warning",
      "title": "提前说明总阀保护装置",
      "regionId": "B-24",
      "turns": [
        {
          "id": "b24_warning.L1501",
          "sourceLine": 1501,
          "speaker": "旁白",
          "portrait": null,
          "text": "干根库一面墙上画着总阀与护根机关的简图。米露用指节敲了敲其中一处。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b24_warning.L1503",
          "sourceLine": 1503,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "总阀旁有根检修副柄。拨到检修位，护臂会先抬起来；真正的总阀还没关。旧装置已经分不清卸压和断流，这一步也会拦人。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b24_warning.L1505",
          "sourceLine": 1505,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "所以四支流先停，侧压降下来。我们在检修位拆驱动，护臂不动了，老师再转总阀。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b24_warning.L1507",
          "sourceLine": 1507,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我记住了。先让护臂停，再碰总阀。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b24_warning.L1509",
          "sourceLine": 1509,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃看完图，又认了一遍副柄的位置。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1511,
          "text": "【动态提示：提前完整预览终战机制、属性、战损和前置。终局不得临时加招或消耗。】"
        }
      ],
      "backdropAssetId": "B_ENV_24:warning",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b25_enter": {
      "id": "b25_enter",
      "title": "东枝回水台",
      "regionId": "B-25",
      "turns": [
        {
          "id": "b25_enter.L1515",
          "sourceLine": 1515,
          "speaker": "旁白",
          "portrait": null,
          "text": "新装的普通重力水管已沿既有高处水源铺到村边。工队正在最后检查保温层，旧根管在一旁发出低低的声响。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_enter.L1517",
          "sourceLine": 1517,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "普通管接的是同一处泉眼。不是我们关了暖根，水就得跟着没有。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b25_enter.L1519",
          "sourceLine": 1519,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这边压得稳？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b25_enter.L1521",
          "sourceLine": 1521,
          "speaker": "工队住民",
          "portrait": null,
          "text": "试过了。流量按正常用水排，没人再拿暖水整夜浇地。",
          "branch": "common"
        },
        {
          "id": "b25_enter.L1523",
          "sourceLine": 1523,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶拧紧检修盖，收起三张测温纸符。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_enter.L1525",
          "sourceLine": 1525,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "能浇的改用普通水。不能浇的，这一季先歇着。",
          "branch": "common",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_25:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b25_valve": {
      "id": "b25_valve",
      "title": "第四处支阀",
      "regionId": "B-25",
      "turns": [
        {
          "id": "b25_valve.L1529",
          "sourceLine": 1529,
          "speaker": "旁白",
          "portrait": null,
          "text": "最后一份主路暖脂进入专用槽。纱雾照看根流，璃和工人一起把负载交到机械锁上。四处支路的光终于都不再连着树心急促跳动。",
          "branch": "common",
          "kind": "narration",
          "phase": "valve"
        },
        {
          "id": "b25_valve.L1531",
          "sourceLine": 1531,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "第四处好了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "valve"
        },
        {
          "id": "b25_valve.L1533",
          "sourceLine": 1533,
          "speaker": "旁白",
          "portrait": null,
          "text": "四人等到泉水沿普通管连续流过，才松开手。",
          "branch": "common",
          "kind": "narration",
          "phase": "waterTest"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1535,
          "text": "【即时状态：第四支阀关闭，扣除最后一份保留暖脂；可分配量不变。】"
        }
      ],
      "backdropAssetId": "B_ENV_25:valve",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b25_noctia": {
      "id": "b25_noctia",
      "title": "树心外门",
      "regionId": "B-25",
      "turns": [
        {
          "id": "b25_noctia.L1539",
          "sourceLine": 1539,
          "speaker": "旁白",
          "portrait": null,
          "text": "从回水台回到树心外廊，只走过村内一小段路。诺克缇娅已经坐下，三枚封印片停在各自的位置。她伸手摸了摸杯子，却没有像从前那样，喝到一半就起身去追温标。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_noctia.L1541",
          "sourceLine": 1541,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "刚才有一会儿，只听见窗外的人说话。我还以为温标坏了，特意又看了一遍。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1543",
          "sourceLine": 1543,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "四边都稳了，你可以先睡一会儿。我们在桌边，不乱动东西。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b25_noctia.L1545",
          "sourceLine": 1545,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "睡当然要睡。不过璃，先帮我带一样东西回来，好不好？",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1547",
          "sourceLine": 1547,
          "speaker": "璃",
          "portrait": "hero",
          "text": "什么？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b25_noctia.L1549",
          "sourceLine": 1549,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我家的备用钥匙在米露那里，前年修门闩时留下的。你去找她拿来，我怕等会儿又忙得忘了。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1551",
          "sourceLine": 1551,
          "speaker": "璃",
          "portrait": "hero",
          "text": "等总阀关好，就回家？你不用再在这里守一夜了？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b25_noctia.L1553",
          "sourceLine": 1553,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "嗯。以前每次想走，总觉得再留一夜稳妥些。明天早上有人一喊，又留下了。这回我想关好就走。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1555",
          "sourceLine": 1555,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾看向桌上的凉茶，坐到了另一把椅子上。她的手放在膝头，好一会儿没有去碰温标架。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_noctia.L1557",
          "sourceLine": 1557,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我也是。总觉得把所有事都做完了，出门才安心，可每次临走，都还能找出一件。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b25_noctia.L1559",
          "sourceLine": 1559,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "这些月根流越来越乱，我就想，再守一天，也许明天会好。后来连家里漏了雨，都是别人替我补；问我屋里东西往哪搬，我竟想不起来。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1561",
          "sourceLine": 1561,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那回去以后，先做什么？茶也放那边喝？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b25_noctia.L1563",
          "sourceLine": 1563,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "（想了一会儿）先把窗打开。再坐下来，看看我自己的屋子。我都快记不清晚上的风从哪边进来了。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1565",
          "sourceLine": 1565,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "开完窗呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b25_noctia.L1567",
          "sourceLine": 1567,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "先坐着。没有人等我报下一个温标的话，我大概能坐很久。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b25_noctia.L1569",
          "sourceLine": 1569,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾望着她，慢慢点头。椅子旁的旧根仍温热，她却没有再问明天该由谁坐在这里。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_noctia.L1571",
          "sourceLine": 1571,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我去拿钥匙。回来放在你看得见的地方，免得又随手压到图下面。",
          "branch": "common",
          "expression": "guarded"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_25:noctia",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b25_exit": {
      "id": "b25_exit",
      "title": "b25_exit",
      "regionId": "B-25",
      "turns": [
        {
          "id": "b25_exit.L1575",
          "sourceLine": 1575,
          "speaker": "旁白",
          "portrait": null,
          "text": "走到门外，璃停了一下。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b25_exit.L1577",
          "sourceLine": 1577,
          "speaker": "璃",
          "portrait": "hero",
          "text": "关好总阀以后，你想先回家，我们就陪你走那一段。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b25_exit.L1579",
          "sourceLine": 1579,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好。这里不用再留一个人。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_25:exit",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b26_enter": {
      "id": "b26_enter",
      "title": "村里最后一个暖夜",
      "regionId": "B-26",
      "turns": [
        {
          "id": "b26_enter.L1585",
          "sourceLine": 1585,
          "speaker": "旁白",
          "portrait": null,
          "text": "回村后的几天，工队补完桥沿，冬料一车车卸进院子。纱雾教过两次温标，学舍也试烧了几夜。等到第十四天傍晚，四条支路都停了暖，只有树心与广场根盘还温着。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_enter.L1587",
          "sourceLine": 1587,
          "speaker": "旁白",
          "portrait": null,
          "text": "人们把晚饭端到广场的石桌上。普通屋舍的烟囱已经在冒烟，桌下那圈老根却仍让鞋底微微发热。有人吃着饭，习惯性把凳子又往根边挪了一寸。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_enter.L1589",
          "sourceLine": 1589,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "学舍没再倒烟，漏风的那扇窗也补了。去河谷的第一批行李明早跟车走。后面几周，还有得搬。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b26_enter.L1591",
          "sourceLine": 1591,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "我也跟这班下去。再拖，家里给我留的腌梨就没了。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b26_enter.L1593",
          "sourceLine": 1593,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "给你一包果干，路上吃。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b26_enter.L1595",
          "sourceLine": 1595,
          "speaker": "珂珂",
          "portrait": "merchant",
          "text": "送我的？那我现在就收，免得你转头写进货单。",
          "branch": "common",
          "expression": "knowing"
        },
        {
          "id": "b26_enter.L1597",
          "sourceLine": 1597,
          "speaker": "旁白",
          "portrait": null,
          "text": "有人笑了。米露另盛一碗饭，压好盖子，放到纱雾身边。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_enter.L1599",
          "sourceLine": 1599,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "等会儿给老师带过去。她那边能坐下吃了，总阀还得看着。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b26_enter.L1601",
          "sourceLine": 1601,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我先把这一碗吃完。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b26_enter.L1603",
          "sourceLine": 1603,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "（把她面前快凉的汤推近一点）嗯。先吃。",
          "branch": "common",
          "expression": "alert"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_26:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b26_shawu": {
      "id": "b26_shawu",
      "title": "收拾一格抽屉",
      "regionId": "B-26",
      "turns": [
        {
          "id": "b26_shawu.L1607",
          "sourceLine": 1607,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾拉开一格抽屉，把要带走的生活用品摆到桌上，又将暂时用不上的一件放了回去。璃站在门侧，看着她来回比较，没有伸手替她装包。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_shawu.L1609",
          "sourceLine": 1609,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这几样先带着？剩下的地方，给你留空？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b26_shawu.L1611",
          "sourceLine": 1611,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯，这一格先收好。别全塞进去，我到了客舍才知道还缺什么。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b26_shawu.L1613",
          "sourceLine": 1613,
          "speaker": "璃",
          "portrait": "hero",
          "text": "缺了跟货队说。下次回来，也能自己拿。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b26_shawu.L1615",
          "sourceLine": 1615,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道。春天还回来住，这屋子又不会因为我走一冬，就不让我进了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b26_shawu.L1617",
          "sourceLine": 1617,
          "speaker": "旁白",
          "portrait": null,
          "text": "她拿起旧冬市地图，展开检查了一下折痕，放在要带走的东西最上面。这次璃看见了，她也没有往别的东西下面藏。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_shawu.L1619",
          "sourceLine": 1619,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "走吧，饭该送过去了。总阀关好以后，我想回自己的床上睡，抽屉明天再管。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_26:shawu",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b26_review": {
      "id": "b26_review",
      "title": "结束前把决定看清",
      "regionId": "B-26",
      "turns": [
        {
          "id": "b26_review.L1623",
          "sourceLine": 1623,
          "speaker": "旁白",
          "portrait": null,
          "text": "饭后，璃和纱雾带着那碗饭进入树心外廊。绯叶把节火匣放在温标架旁的空桌上。诺克缇娅已经放下调节柄，只隔一会儿看一眼内侧总温标。",
          "branch": "common",
          "kind": "narration",
          "phase": "review"
        },
        {
          "id": "b26_review.L1625",
          "sourceLine": 1625,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "（揭开碗盖）这回还热。",
          "branch": "common",
          "expression": "cold",
          "phase": "review"
        },
        {
          "id": "b26_review.L1627",
          "sourceLine": 1627,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我们都吃过了。汤在下面，先别一口气全翻出来，碗还烫。",
          "branch": "common",
          "expression": "gentle",
          "phase": "review"
        },
        {
          "id": "b26_review.L1629",
          "sourceLine": 1629,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅的手果然在碗底停了一下。她看了纱雾一眼，先夹了一口菜，三个人都笑得很轻。",
          "branch": "common",
          "kind": "narration",
          "phase": "review"
        },
        {
          "id": "b26_review.L1631",
          "sourceLine": 1631,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "进检修道前，再看看匣子。哪几处用了暖脂，哪几处得按普通办法过冬，还有想回去看的，现在就去。合上以后，这一冬就照定好的办。",
          "branch": "common",
          "expression": "watchful",
          "phase": "review"
        },
        {
          "id": "b26_review.L1637",
          "sourceLine": 1637,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我想再去一趟。",
          "branch": "return",
          "expression": "guarded"
        },
        {
          "id": "b26_review.L1639",
          "sourceLine": 1639,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "去吧。四支流都卸下来了，这几天的收尾我守得住。想清楚再回来，别走到半路又替我着急。",
          "branch": "return",
          "expression": "cold"
        },
        {
          "id": "b26_review.L1647",
          "sourceLine": 1647,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我看清楚了，就照现在的安排。剩下的也按说好的送进公共库存。",
          "branch": "confirm",
          "expression": "guarded"
        },
        {
          "id": "b26_review.L1649",
          "sourceLine": 1649,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。留不住的那些，我还是会难过。可路和屋子都准备好了，老师也该回家了，我们去关总阀。",
          "branch": "confirm",
          "expression": "gentle"
        },
        {
          "id": "b26_review.L1651",
          "sourceLine": 1651,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶合上匣盖，退到温标架旁。",
          "branch": "confirm",
          "kind": "narration"
        }
      ],
      "choices": [
        {
          "id": "return",
          "label": "回去处理未完成的暖点或岔路。",
          "sourceLine": 1635
        },
        {
          "id": "confirm",
          "label": "核对后，确认所有未投入暖点采用普通方案，准备停机。",
          "sourceLine": 1643
        }
      ],
      "directives": [
        {
          "sourceLine": 1633,
          "text": "【动态提示：核对四支阀、各项基础越冬与施工前置，缺项需先完成；展示三暖点投入及代价、剩余暖脂、已用根楔和未完成岔路。】"
        },
        {
          "sourceLine": 1641,
          "text": "【即时状态：返回既有地图，无资源刷新。停机前等待不构成按现实时间流逝的惩罚。】"
        },
        {
          "sourceLine": 1645,
          "text": "【动态确认：只显示未投入的真实后果：温室移栽取种，但部分品系消失；梨树不能活着留下；暖屋用普通柴炉、遮风与日间安排。已投不退，余量入公共储备；确认后不再调整暖点。】"
        }
      ],
      "backdropAssetId": "B_ENV_26:review",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "return",
        "confirm"
      ]
    },
    "b26_noctia": {
      "id": "b26_noctia",
      "title": "她希望大家怎样帮忙",
      "regionId": "B-26",
      "turns": [
        {
          "id": "b26_noctia.L1655",
          "sourceLine": 1655,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露从外门进来，把一把普通钥匙递给璃。璃接过，交到诺克缇娅手里。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_noctia.L1657",
          "sourceLine": 1657,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "前年修门闩留下的。还是原来那把。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b26_noctia.L1659",
          "sourceLine": 1659,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅用拇指摸了一下钥匙齿口。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_noctia.L1661",
          "sourceLine": 1661,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我今天想回去。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b26_noctia.L1663",
          "sourceLine": 1663,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "嗯。关完我们陪你走。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b26_noctia.L1665",
          "sourceLine": 1665,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "要是明天有人说炉子不热，先别敲我家门。我还不会修你们那种烟道。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b26_noctia.L1667",
          "sourceLine": 1667,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "知道。砌炉子的人自己来。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b26_noctia.L1669",
          "sourceLine": 1669,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "树的事，我看。真有要紧的，再来找你。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b26_noctia.L1671",
          "sourceLine": 1671,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅将钥匙握进手里，终于把空碗推开。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b26_noctia.L1673",
          "sourceLine": 1673,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好。那就把最后这一段做完。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_26:noctia",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b27_enter": {
      "id": "b27_enter",
      "title": "树心检修道",
      "regionId": "B-27",
      "turns": [
        {
          "id": "b27_enter.L1677",
          "sourceLine": 1677,
          "speaker": "旁白",
          "portrait": null,
          "text": "新扶手的木纹一直延伸到阀前。狭窄的检修道边折着一张床，旁边放着便当盖和两包未拆的茶。",
          "branch": "common",
          "kind": "narration",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1679",
          "sourceLine": 1679,
          "speaker": "璃",
          "portrait": "hero",
          "text": "茶放多久了？",
          "branch": "common",
          "expression": "guarded",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1681",
          "sourceLine": 1681,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "春天买的。说是放凉一点也好喝，我一直想等回家时再试。",
          "branch": "common",
          "expression": "cold",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1683",
          "sourceLine": 1683,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（看着床边修了又修的布套）你以前说这里睡着方便。",
          "branch": "common",
          "expression": "gentle",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1685",
          "sourceLine": 1685,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "起初就想省一点来回的工夫。后来根流一乱，我把铺盖也搬来了；茶都买好了，回家的那一天却一直往后挪。",
          "branch": "common",
          "expression": "cold",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1687",
          "sourceLine": 1687,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这些要一起带走吗？",
          "branch": "common",
          "expression": "guarded",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1689",
          "sourceLine": 1689,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "茶带走。便当盖也带走，给我送饭的人已经找了好几次。",
          "branch": "common",
          "expression": "cold",
          "phase": "beforePack"
        },
        {
          "id": "b27_enter.L1691",
          "sourceLine": 1691,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把茶与便当盖放进搬运小包。",
          "branch": "common",
          "kind": "narration",
          "phase": "packed"
        },
        {
          "id": "b27_enter.L1693",
          "sourceLine": 1693,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "床呢？",
          "branch": "common",
          "expression": "gentle",
          "phase": "packed"
        },
        {
          "id": "b27_enter.L1695",
          "sourceLine": 1695,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "先留着，检修的人累了还能躺一会儿。就是别像我，把整个冬天都挤在这张床上。",
          "branch": "common",
          "expression": "cold",
          "phase": "packed"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_27:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b27_before": {
      "id": "b27_before",
      "title": "总阀前",
      "regionId": "B-27",
      "turns": [
        {
          "id": "b27_before.L1699",
          "sourceLine": 1699,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅收好钥匙。三人照着先前的图，找到检修副柄与驱动核。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b27_before.L1701",
          "sourceLine": 1701,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（核对星盘）四支流都低下来了。没有哪一处还在顶主轴。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b27_before.L1703",
          "sourceLine": 1703,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我先拨副柄，让机关露出来。璃拆驱动，纱雾看回流。等护臂完全停了，我们才动这只总阀。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b27_before.L1705",
          "sourceLine": 1705,
          "speaker": "璃",
          "portrait": "hero",
          "text": "然后我落机械锁。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b27_before.L1707",
          "sourceLine": 1707,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "对。卡舌进去，就能松手。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b27_before.L1709",
          "sourceLine": 1709,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾低头看了看主轴下的卡舌，又望向老师一直绷着的手。她把星盘移近，仔细核对最后一遍。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b27_before.L1711",
          "sourceLine": 1711,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "记住了。卡好以后，我再看一遍回流，咱们一起松手。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1713,
          "text": "【动态提示：核对现有资源与 b24 已公开的终战；不补满生命。可在操作前取消并返回外廊，已确认的暖点分配保持不变。】"
        }
      ],
      "backdropAssetId": "B_ENV_27:before",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b28_pre": {
      "id": "b28_pre",
      "title": "护根机关",
      "regionId": "B-28",
      "turns": [
        {
          "id": "b28_pre.L1717",
          "sourceLine": 1717,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅让三枚红菱封印片分别对准既有导流位置，伸手拨下检修副柄。真正的总阀仍在原位，旧保护机关的护臂却已抬起，扫向副柄前的站位。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b28_pre.L1719",
          "sourceLine": 1719,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它起来了！",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b28_pre.L1721",
          "sourceLine": 1721,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（拔剑，退到看图时选好的位置）看住回流。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b28_pre.L1723",
          "sourceLine": 1723,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我在。驱动核就在护臂后面。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1725,
          "text": "【动态提示：执行已公开的固定终战，获胜后永久拆除驱动。】"
        }
      ],
      "backdropAssetId": "B_ENV_28:pre",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b28_post": {
      "id": "b28_post",
      "title": "终于安静了",
      "regionId": "B-28",
      "turns": [
        {
          "id": "b28_post.L1729",
          "sourceLine": 1729,
          "speaker": "旁白",
          "portrait": null,
          "text": "护臂在机械支点上停住，不再扫过主轴。璃确认驱动完全熄灭，将剑收回左腰剑鞘，走到锁柄旁。",
          "branch": "common",
          "kind": "narration",
          "phase": "battle"
        },
        {
          "id": "b28_post.L1731",
          "sourceLine": 1731,
          "speaker": "璃",
          "portrait": "hero",
          "text": "停了。",
          "branch": "common",
          "expression": "guarded",
          "phase": "battle"
        },
        {
          "id": "b28_post.L1733",
          "sourceLine": 1733,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "回流还稳。可以转。",
          "branch": "common",
          "expression": "gentle",
          "phase": "battle"
        },
        {
          "id": "b28_post.L1735",
          "sourceLine": 1735,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅伸手扶住总阀，三枚封印片维持原有方向。她转过第一段，停下来等纱雾看清指示，才继续转第二段。",
          "branch": "common",
          "kind": "narration",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1737",
          "sourceLine": 1737,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "这里以前很重。",
          "branch": "common",
          "expression": "cold",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1739",
          "sourceLine": 1739,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "侧流卸掉了。",
          "branch": "common",
          "expression": "gentle",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1741",
          "sourceLine": 1741,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "嗯。",
          "branch": "common",
          "expression": "cold",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1743",
          "sourceLine": 1743,
          "speaker": "旁白",
          "portrait": null,
          "text": "最后一段过后，机械锁落下。璃确认卡舌到位，松开手，后退一步。诺克缇娅也把手放下。",
          "branch": "common",
          "kind": "narration",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1745",
          "sourceLine": 1745,
          "speaker": "旁白",
          "portrait": null,
          "text": "水声渐渐低下去。三个人都还站在原处，等着习惯中的那一声警铃；许久过去，铃没有响。",
          "branch": "common",
          "kind": "narration",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1747",
          "sourceLine": 1747,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "老师，手可以放下了。你还抓着袖子。",
          "branch": "common",
          "expression": "gentle",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1749",
          "sourceLine": 1749,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "（慢慢松开手）嗯。我总觉得它下一刻就会叫，脚一挪开，就来不及回来了。",
          "branch": "common",
          "expression": "cold",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1751",
          "sourceLine": 1751,
          "speaker": "璃",
          "portrait": "hero",
          "text": "那就站一会儿。我在旁边，等你想走了再走。",
          "branch": "common",
          "expression": "guarded",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1753",
          "sourceLine": 1753,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅又听过一阵水声，收回三枚封印片。她把空出来的手落在身侧，这回没有再伸向锁柄。",
          "branch": "common",
          "kind": "narration",
          "phase": "stopped"
        },
        {
          "id": "b28_post.L1755",
          "sourceLine": 1755,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "好了。走吧，别让你们陪我在这里站一夜。",
          "branch": "common",
          "expression": "cold",
          "phase": "stopped"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1757,
          "text": "【即时状态：总阀安全停止，进入尾声。】"
        }
      ],
      "backdropAssetId": "B_ENV_28:post",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b29_enter": {
      "id": "b29_enter",
      "title": "树下冷月",
      "regionId": "B-29",
      "turns": [
        {
          "id": "b29_enter.L1761",
          "sourceLine": 1761,
          "speaker": "旁白",
          "portrait": null,
          "text": "树心脚下的暖光一节节退下去，停在早已关好的四个支口。广场根盘最后一处光也熄了。上方的叶子缓缓合拢，有一片落到石桌边。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_enter.L1763",
          "sourceLine": 1763,
          "speaker": "旁白",
          "portrait": null,
          "text": "隔着街，学舍的烟囱仍在冒烟。有人端着洗好的锅进屋，用脚带上门。水在新管里流，声音比从前清楚。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_enter.L1765",
          "sourceLine": 1765,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（把手掌贴在树皮上）凉下来了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b29_enter.L1767",
          "sourceLine": 1767,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "嗯。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b29_enter.L1769",
          "sourceLine": 1769,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这样就会醒吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b29_enter.L1771",
          "sourceLine": 1771,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "（仰头看了一会儿）我还不知道。明天再来看它。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b29_enter.L1773",
          "sourceLine": 1773,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅重新握住家门钥匙。米露试过检修道门闩。诺克缇娅走出两步，又下意识回头。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_enter.L1775",
          "sourceLine": 1775,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "钥匙……",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b29_enter.L1777",
          "sourceLine": 1777,
          "speaker": "璃",
          "portrait": "hero",
          "text": "在你手里。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b29_enter.L1779",
          "sourceLine": 1779,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅低头，看见家门钥匙被自己握得很紧。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_enter.L1781",
          "sourceLine": 1781,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我知道。刚才想找的不是这一把。",
          "branch": "common",
          "expression": "cold"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_29:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b29_home": {
      "id": "b29_home",
      "title": "回到有窗的房间",
      "regionId": "B-29",
      "turns": [
        {
          "id": "b29_home.L1785",
          "sourceLine": 1785,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅自己把钥匙插进锁孔，转了一下才推开门。屋里做过她同意的基本修补，桌椅仍在熟悉的位置。她先走到窗边，拨开窗栓，让夜里的凉气吹散积了很久的闷味。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_home.L1787",
          "sourceLine": 1787,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "慢一点开，外面已经冷了。你刚从树心出来，披肩要不要再拢上？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b29_home.L1789",
          "sourceLine": 1789,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "开一小会儿就好。我想闻闻外面的风。那盏灯，替我放桌边吧。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b29_home.L1791",
          "sourceLine": 1791,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾打开检修道带来的小包，把两包茶递给璃，又取出便当盖。璃将茶放在灯旁，纱雾把盖子交回诺克缇娅手中。普通灯光落在桌面，照出一小块久未用过的木纹。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_home.L1793",
          "sourceLine": 1793,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "明天中午，要是我还没出来，你们过来——",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b29_home.L1795",
          "sourceLine": 1795,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾立刻抬头，手还扶在包口。诺克缇娅看见她紧起来的神情，停了一下，才把话说完。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_home.L1797",
          "sourceLine": 1797,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "叫我吃饭。敲门就行，别敲警铃。我大概会睡过头。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b29_home.L1799",
          "sourceLine": 1799,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（长长呼出一口气）好。那我敲门，你得应一声，别隔着被子说了，我在外面听不见。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b29_home.L1801",
          "sourceLine": 1801,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我们先回去。窗透完气记得关，明天见。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b29_home.L1803",
          "sourceLine": 1803,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅点头，送她们到门口，自己将门合上。璃与纱雾走出几步，窗边的灯仍亮着；这回，她们没有再站在外头等铃声。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_29:home",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b29_shawu": {
      "id": "b29_shawu",
      "title": "回去睡觉",
      "regionId": "B-29",
      "turns": [
        {
          "id": "b29_shawu.L1807",
          "sourceLine": 1807,
          "speaker": "旁白",
          "portrait": null,
          "text": "回程时，纱雾走了几步，才发现自己没有把星盘举起来。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_shawu.L1809",
          "sourceLine": 1809,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "一下安静下来，真不习惯。我还在想，回去前是不是要再看一遍……",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b29_shawu.L1811",
          "sourceLine": 1811,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你在收抽屉时说，想回自己的床上睡。那边的窗关好了吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b29_shawu.L1813",
          "sourceLine": 1813,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "关好了。被子早上也收进去了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b29_shawu.L1815",
          "sourceLine": 1815,
          "speaker": "旁白",
          "portrait": null,
          "text": "说完，她自己先笑了。原来不用再想别的安排，屋里已经有一张能躺下的床，今晚也没有谁等她值夜。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b29_shawu.L1817",
          "sourceLine": 1817,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那我回去睡。你也早点休息，明天吃饭时再见。",
          "branch": "common",
          "expression": "gentle"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_29:shawu",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_enter": {
      "id": "b30_enter",
      "title": "数周以后",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_enter.L1823",
          "sourceLine": 1823,
          "speaker": "旁白",
          "portrait": null,
          "text": "停暖后的几周，最后几车冬料到了。有人搬下山，有人把学舍的床铺好，还有人白天回家做活，晚上再回来吃饭。路边新增的桥板踩得发亮，几处被雨淋淡的路标又描过一遍。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_enter.L1825",
          "sourceLine": 1825,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾留在村里收拾行李，也跟着绯叶搬了最后一批适合搬走的盆。她在客舍问好的开课日近了，早班货车已经替她留出一个行李角。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_enter.L1827",
          "sourceLine": 1827,
          "speaker": "旁白",
          "portrait": null,
          "text": "第一场雪来得很轻。雪落在曾经一直温热的根盘上，这次没有立刻消失。一个扫院子的住民停下手，看了好一会儿，才先扫出通向邻家的窄路。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_enter.L1829",
          "sourceLine": 1829,
          "speaker": "旁白",
          "portrait": null,
          "text": "诺克缇娅坐在家中窗边喝茶，手边是已经洗净送还后又被借来的便当盒。门响了两下。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_enter.L1831",
          "sourceLine": 1831,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "午饭好了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b30_enter.L1833",
          "sourceLine": 1833,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "我知道。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b30_enter.L1835",
          "sourceLine": 1835,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "你上次也说知道，结果睡过去了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b30_enter.L1837",
          "sourceLine": 1837,
          "speaker": "诺克缇娅",
          "portrait": "final_queen",
          "text": "（起身）这次没睡。我在看雪。",
          "branch": "common",
          "expression": "cold"
        },
        {
          "id": "b30_enter.L1839",
          "sourceLine": 1839,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露没有催她快一点，把门留开能让两人先后通过的宽度。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1841,
          "text": "（按实际暖点状态选取以下一组片段，再接关系尾声。）"
        }
      ],
      "backdropAssetId": "B_ENV_30:enter",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_heat_greenhouse_lodge": {
      "id": "b30_heat_greenhouse_lodge",
      "title": "温室与暖屋留下",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_heat_greenhouse_lodge.L1847",
          "sourceLine": 1847,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶在温室内侧修整枝叶。玻璃上有薄雾，白花还开着。她把落下的花瓣收进夹纸。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1849",
          "sourceLine": 1849,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "这一冬还在。够我再仔细试试别的养法。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1851",
          "sourceLine": 1851,
          "speaker": "旁白",
          "portrait": null,
          "text": "半山暖屋里，两位住在不同地方的村民正在喝茶。有人等货队，有人只是顺路来坐一会儿。杯子被放回那张修好的桌。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1853",
          "sourceLine": 1853,
          "speaker": "旁白",
          "portrait": null,
          "text": "老梨树坡下，原来的树位已经空了。用其一段木料做的粗坐凳放在避风处，表面还有粗糙的木刺。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1855",
          "sourceLine": 1855,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（手沿着熟悉的木纹走过）这里还硌手。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1857",
          "sourceLine": 1857,
          "speaker": "璃",
          "portrait": "hero",
          "text": "工队说等木料再干一点，还要磨。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1859",
          "sourceLine": 1859,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我知道。我认得这块纹。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1861",
          "sourceLine": 1861,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人在凳上坐下。璃坐到左边，纱雾看了一眼，没有揭穿她特意换了位置。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1863",
          "sourceLine": 1863,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你还难过？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1865",
          "sourceLine": 1865,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "嗯。刚才在暖屋里还忘了一会儿，坐到这里又想起来了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_lodge.L1867",
          "sourceLine": 1867,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃把左手放在凳面上。纱雾伸过手，覆住她的指节。她的掌心暖了一点。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1845,
          "text": "触发条件：温室已投入，暖屋已投入，梨树未投入。"
        }
      ],
      "backdropAssetId": "B_ENV_30:heat_greenhouse_lodge",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_heat_greenhouse_pear": {
      "id": "b30_heat_greenhouse_pear",
      "title": "温室与梨树留下",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_heat_greenhouse_pear.L1873",
          "sourceLine": 1873,
          "speaker": "旁白",
          "portrait": null,
          "text": "温室内门合得严实，绯叶留下的暖生品系继续度过这一冬。梨树已经移到避风坡，根土覆好，细枝在覆土上方轻轻摇着。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1875",
          "sourceLine": 1875,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "根还稳着。先让它安静，别天天挖开看看长没长。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1877",
          "sourceLine": 1877,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（收回想拨开覆土的手）知道了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1879",
          "sourceLine": 1879,
          "speaker": "旁白",
          "portrait": null,
          "text": "半山的普通候车屋里，米露点起柴炉，工队把日间出发时刻告诉同行的人。空着的暖槽盖得严实，石墙仍凉，大家把见面时间排早一些。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1881",
          "sourceLine": 1881,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "今天这趟吃完饭就走。别等天黑了，才说还有一句没聊完。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1883",
          "sourceLine": 1883,
          "speaker": "璃",
          "portrait": "hero",
          "text": "（帮她关严门）比有暖槽麻烦一点。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1885",
          "sourceLine": 1885,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "是。所以今天吃饭早。来，先把这块干柴递给我。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1887",
          "sourceLine": 1887,
          "speaker": "旁白",
          "portrait": null,
          "text": "屋外，两人经过移好的梨树。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1889",
          "sourceLine": 1889,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这里比原来的坡背风。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1891",
          "sourceLine": 1891,
          "speaker": "璃",
          "portrait": "hero",
          "text": "明年能再坐这里吗？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1893",
          "sourceLine": 1893,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "等它缓过来，旁边放凳子。别再坐它的根了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_greenhouse_pear.L1895",
          "sourceLine": 1895,
          "speaker": "旁白",
          "portrait": null,
          "text": "余下一份暖脂封存在公共储备匣中。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1871,
          "text": "触发条件：温室已投入，梨树已投入，暖屋未投入。"
        }
      ],
      "backdropAssetId": "B_ENV_30:heat_greenhouse_pear",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_heat_lodge_pear": {
      "id": "b30_heat_lodge_pear",
      "title": "暖屋与梨树留下",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_heat_lodge_pear.L1901",
          "sourceLine": 1901,
          "speaker": "旁白",
          "portrait": null,
          "text": "温室外间摆着能耐寒的移栽盆，几格原先放特殊品系的位置空下来。绯叶合起最后一本标本夹，把仍可播种的种子分别收好。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_lodge_pear.L1903",
          "sourceLine": 1903,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那几株白花……",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_lodge_pear.L1905",
          "sourceLine": 1905,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "没保住。最完整的一枝在这里。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_lodge_pear.L1907",
          "sourceLine": 1907,
          "speaker": "旁白",
          "portrait": null,
          "text": "她展开夹纸，熟悉的白花被压得很薄。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_lodge_pear.L1909",
          "sourceLine": 1909,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我们能帮你做什么？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_heat_lodge_pear.L1911",
          "sourceLine": 1911,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "把外面那排耐寒的搬到日照够的地方。里面空着的，让它先空着。别为了安慰我，随便找东西填满。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_lodge_pear.L1913",
          "sourceLine": 1913,
          "speaker": "旁白",
          "portrait": null,
          "text": "两人照她所说搬盆。避风坡的梨树仍然活着，半山暖屋亮着一盏普通灯，门被过路人仔细关好。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_heat_lodge_pear.L1915",
          "sourceLine": 1915,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "春天我会回来，把在下面学的试给你看。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_lodge_pear.L1917",
          "sourceLine": 1917,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "好。先看你学会哪几样，春天我们腾两排地。",
          "branch": "common",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_lodge_pear.L1919",
          "sourceLine": 1919,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾点头，把空盆叠齐。余下一份暖脂封存在公共储备匣中。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1899,
          "text": "触发条件：暖屋已投入，梨树已投入，温室未投入。"
        },
        {
          "sourceLine": 1913,
          "text": "（两人照她所说搬盆。转场后，避风坡的梨树仍然活着，半山暖屋亮着一盏普通灯，门被过路人仔细关好。）"
        }
      ],
      "backdropAssetId": "B_ENV_30:heat_lodge_pear",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_heat_partial": {
      "id": "b30_heat_partial",
      "title": "其他合法部分投入",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_heat_partial.L1925",
          "sourceLine": 1925,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶检查温标，把内门合上",
          "branch": "greenhouseOn",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1925.2",
          "sourceLine": 1925,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "这一冬保住了。以后还得学正常季节里的办法。",
          "branch": "greenhouseOn",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_partial.L1927",
          "sourceLine": 1927,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶收起最后的标本，将耐寒土盆放到日照处",
          "branch": "greenhouseOff",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1927.2",
          "sourceLine": 1927,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "有几样没能留下。能继续养的，今天还是要浇水。",
          "branch": "greenhouseOff",
          "expression": "watchful"
        },
        {
          "id": "b30_heat_partial.L1929",
          "sourceLine": 1929,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾检查避风坡上的覆土，不动根部",
          "branch": "pearOn",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1929.2",
          "sourceLine": 1929,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它还在。先让它睡，不催它开花。",
          "branch": "pearOn",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_partial.L1931",
          "sourceLine": 1931,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃和纱雾在旧木坐凳边停下",
          "branch": "pearOff",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1931.2",
          "sourceLine": 1931,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我记得它原来长在哪里。这里空了，我也还记得。",
          "branch": "pearOff",
          "expression": "gentle"
        },
        {
          "id": "b30_heat_partial.L1933",
          "sourceLine": 1933,
          "speaker": "旁白",
          "portrait": null,
          "text": "住民关门，把刚沏的茶推给后来者",
          "branch": "lodgeOn",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1933.2",
          "sourceLine": 1933,
          "speaker": "住民",
          "portrait": null,
          "text": "坐下暖一会儿。下一趟车还早。",
          "branch": "lodgeOn"
        },
        {
          "id": "b30_heat_partial.L1935",
          "sourceLine": 1935,
          "speaker": "旁白",
          "portrait": null,
          "text": "米露确认柴炉与日间出发安排",
          "branch": "lodgeOff",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1935.2",
          "sourceLine": 1935,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "屋子能挡风，柴带够。今天别拖到晚上再走。",
          "branch": "lodgeOff",
          "expression": "alert"
        },
        {
          "id": "b30_heat_partial.L1937",
          "sourceLine": 1937,
          "speaker": "旁白",
          "portrait": null,
          "text": "绯叶把匣子放稳",
          "branch": "reserve",
          "kind": "narration"
        },
        {
          "id": "b30_heat_partial.L1937.2",
          "sourceLine": 1937,
          "speaker": "绯叶",
          "portrait": "fox_boss",
          "text": "剩下的送进公用库了。匣子我来收好。",
          "branch": "reserve",
          "expression": "watchful"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1923,
          "text": "只投一处或全部未投时，按实际状态各取一个模块，接成短蒙太奇。"
        }
      ],
      "backdropAssetId": "B_ENV_30:heat_partial",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": [
        "greenhouseOn",
        "greenhouseOff",
        "pearOn",
        "pearOff",
        "lodgeOn",
        "lodgeOff",
        "reserve"
      ]
    },
    "b30_relationship_offer": {
      "id": "b30_relationship_offer",
      "title": "璃这一季想怎样过",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_relationship_offer.L1941",
          "sourceLine": 1941,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把冬衣、行李放在门边，旧冬市地图留在最上面。按约定的开课日，她该下山了。两人在屋内等货队回话。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_relationship_offer.L1943",
          "sourceLine": 1943,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我后天跟着早班下去。客舍的房间定好了，第一天先去搬土。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1945",
          "sourceLine": 1945,
          "speaker": "璃",
          "portrait": "hero",
          "text": "听起来你很期待搬土。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_relationship_offer.L1947",
          "sourceLine": 1947,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我期待知道自己搬的是什么土。以前别人一说要种什么，我就先去找哪条暖根。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1949",
          "sourceLine": 1949,
          "speaker": "旁白",
          "portrait": null,
          "text": "她看向门外已被扫过的路。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_relationship_offer.L1951",
          "sourceLine": 1951,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1953",
          "sourceLine": 1953,
          "speaker": "璃",
          "portrait": "hero",
          "text": "米露已经找好一班人，问我愿不愿意也留一季。刚接好的那几段，我确实想多走几遍。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_relationship_offer.L1955",
          "sourceLine": 1955,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那你去过冬市的事，又要往后了？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1957",
          "sourceLine": 1957,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我也想跟你去。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_relationship_offer.L1959",
          "sourceLine": 1959,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把折小的地图展开，压住卷起的一角。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_relationship_offer.L1961",
          "sourceLine": 1961,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "摊位我已经问清楚了。你要这次来，就跟我走。要留下，等下一趟货队下来，我也有空。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1963",
          "sourceLine": 1963,
          "speaker": "璃",
          "portrait": "hero",
          "text": "两次都留位置？",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_relationship_offer.L1965",
          "sourceLine": 1965,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "（看她一眼）只给你留吃饼的位置。屋子你自己找。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_relationship_offer.L1967",
          "sourceLine": 1967,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃笑了。她们把地图转过来，一起看了一会儿。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [
        {
          "id": "together",
          "label": "这一程与纱雾一起下山。",
          "sourceLine": 1971
        },
        {
          "id": "patrol",
          "label": "留下巡路一季，与纱雾约好下一趟相见。",
          "sourceLine": 1973
        }
      ],
      "directives": [
        {
          "sourceLine": 1969,
          "text": "【选择提示：只选璃本季行动；纱雾学习、暖点与居民计划不变。两项均为完整关系结局，无隐藏好感阈值。】"
        }
      ],
      "backdropAssetId": "B_ENV_30:relationship_offer",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_end_together": {
      "id": "b30_end_together",
      "title": "一起下山",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_end_together.L1977",
          "sourceLine": 1977,
          "speaker": "璃",
          "portrait": "hero",
          "text": "这趟我跟你走。到了河谷，先陪你放行李，再去货场找我的护送活。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L1979",
          "sourceLine": 1979,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "冬市那天呢？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L1981",
          "sourceLine": 1981,
          "speaker": "璃",
          "portrait": "hero",
          "text": "空出来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L1983",
          "sourceLine": 1983,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "不是“尽量”？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L1985",
          "sourceLine": 1985,
          "speaker": "璃",
          "portrait": "hero",
          "text": "空出来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L1987",
          "sourceLine": 1987,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾伸手握住她的左手。璃这次没有先转身去搬行李。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L1989",
          "sourceLine": 1989,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那先走这一段。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L1991",
          "sourceLine": 1991,
          "speaker": "旁白",
          "portrait": null,
          "text": "两日后。屋内传来穿上厚衣、收紧行囊的声音。门开了，货车铃响。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L1991.2",
          "sourceLine": 1991,
          "speaker": "旁白",
          "portrait": null,
          "text": "既定石路与桥面旁，工人在换班。米露将下一段巡路交给同伴，送她们到门口。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L1993",
          "sourceLine": 1993,
          "speaker": "米露",
          "portrait": "cat_boss",
          "text": "到下面把路况告诉货场。还有，吃饼时别把行李丢了。",
          "branch": "common",
          "expression": "alert"
        },
        {
          "id": "b30_end_together.L1995",
          "sourceLine": 1995,
          "speaker": "璃",
          "portrait": "hero",
          "text": "知道。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L1997",
          "sourceLine": 1997,
          "speaker": "旁白",
          "portrait": null,
          "text": "河谷客舍里，纱雾解开包，先把那张旧地图摊到桌上。璃将水杯挪远一点，用手掌压住总往上卷的一角。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L1999",
          "sourceLine": 1999,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "梨饼的摊从这里进去。不是后院。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L2001",
          "sourceLine": 2001,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我记着了。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L2003",
          "sourceLine": 2003,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你以前说，等一切都准备好再带我来。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L2005",
          "sourceLine": 2005,
          "speaker": "璃",
          "portrait": "hero",
          "text": "还有好多没想好。我下午要去货场问护送的活，住处也得再看看。不过冬市那天，我给自己留着。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_together.L2007",
          "sourceLine": 2007,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那就等你问完，回来这里吃饭。我把去摊位的路画好，可别再走错门。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_together.L2009",
          "sourceLine": 2009,
          "speaker": "旁白",
          "portrait": null,
          "text": "山上，诺克缇娅家里开着窗，米露把巡护交给同伴，绯叶在{{feiyeWinterWorkplace}}里继续工作。古树静静立在薄雪中。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L2011",
          "sourceLine": 2011,
          "speaker": "旁白",
          "portrait": null,
          "text": "璃点头，沿着纱雾指的街口看过去。两个人各压住地图一角，把它转向窗光；旧折痕终于平下来，能看清新添的路了。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_together.L2013",
          "sourceLine": 2013,
          "speaker": "旁白",
          "portrait": null,
          "text": "楼下有人叫吃饭。纱雾收起地图，璃替她端起水杯，两人一前一后走出房门。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [
        {
          "sourceLine": 1991,
          "text": "（两日后。屋内传来穿上厚衣、收紧行囊的声音。门开了，货车铃响。镜头沿既定石路与桥面掠过，停在换班的工人旁；屋外的远行人物不作服装特写。米露将下一段巡路交给同伴，送她们到门口。）"
        },
        {
          "sourceLine": 2009,
          "text": "（镜头回到山上。诺克缇娅家里开着窗，米露把巡护交给同伴，绯叶在适用的温室或普通苗圃里继续工作。古树静静立在薄雪中。）"
        }
      ],
      "backdropAssetId": "B_ENV_30:end_together",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    },
    "b30_end_two_ends": {
      "id": "b30_end_two_ends",
      "title": "在两端相见",
      "regionId": "B-30",
      "turns": [
        {
          "id": "b30_end_two_ends.L2017",
          "sourceLine": 2017,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我留下巡路一季。下一趟货队到下面，我跟到货场，去找你。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2019",
          "sourceLine": 2019,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那我后天先走。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2021",
          "sourceLine": 2021,
          "speaker": "璃",
          "portrait": "hero",
          "text": "嗯。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2023",
          "sourceLine": 2023,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾摸了摸手里地图的折痕，抬眼看她。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2025",
          "sourceLine": 2025,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "我会想你。还有一点生气，明明刚回来，又要分开。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2027",
          "sourceLine": 2027,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我也是。想跟着你，刚才还在想。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2029",
          "sourceLine": 2029,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你想留下的那些路，也是真的想走吧？",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2031",
          "sourceLine": 2031,
          "speaker": "璃",
          "portrait": "hero",
          "text": "嗯。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2033",
          "sourceLine": 2033,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾向前一步抱住她，额头靠在她肩侧停了一会儿。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2035",
          "sourceLine": 2035,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那你来时敲门。别像以前，站在外面觉得我忙，就自己走了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2037",
          "sourceLine": 2037,
          "speaker": "璃",
          "portrait": "hero",
          "text": "好。你不在，我就问你什么时候回来。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2039",
          "sourceLine": 2039,
          "speaker": "旁白",
          "portrait": null,
          "text": "下一趟往返。璃随货队到了河谷，在温室里看见纱雾往架上放空盆，旁边的冬苗冒出了新叶。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2041",
          "sourceLine": 2041,
          "speaker": "璃",
          "portrait": "hero",
          "text": "你先忙，我能等。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2043",
          "sourceLine": 2043,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "这一盆放好就行。今天已经有人接后面那排了。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2045",
          "sourceLine": 2045,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾放下土盆，洗净手，跟同伴打过招呼，走到璃身边。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2047",
          "sourceLine": 2047,
          "speaker": "旁白",
          "portrait": null,
          "text": "在客舍桌边，璃说石阶补好了，米露下山买了自己的东西，诺克缇娅拆开了第二包茶。纱雾说，她昨天为了让苗透气，亲手开了温室的窗。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2049",
          "sourceLine": 2049,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "学舍后来怎么样？我在温室第一次轮休那天，满脑子还是他们会不会认错温标。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2051",
          "sourceLine": 2051,
          "speaker": "璃",
          "portrait": "hero",
          "text": "有人接上了，也有做得慢的。你教过的那两次没白费，剩下的让他们继续学。你在这里，也还在一天一天学开窗和浇水呢。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2053",
          "sourceLine": 2053,
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "那我就安心再学一阵。春天回去，先试两排苗，种成什么样，再慢慢跟大家说。",
          "branch": "common",
          "expression": "gentle"
        },
        {
          "id": "b30_end_two_ends.L2055",
          "sourceLine": 2055,
          "speaker": "璃",
          "portrait": "hero",
          "text": "我到时去看。",
          "branch": "common",
          "expression": "guarded"
        },
        {
          "id": "b30_end_two_ends.L2057",
          "sourceLine": 2057,
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾把自己的杯子向璃那边碰了一下。窗边的光落在两双手上。",
          "branch": "common",
          "kind": "narration"
        },
        {
          "id": "b30_end_two_ends.L2059",
          "sourceLine": 2059,
          "speaker": "旁白",
          "portrait": null,
          "text": "这次饭吃完，璃把下一趟过来的日子说给她听。纱雾收好杯子，送她到门口，仍有些舍不得，却知道该在哪一天等那声敲门。",
          "branch": "common",
          "kind": "narration"
        }
      ],
      "choices": [],
      "directives": [],
      "backdropAssetId": "B_ENV_30:end_two_ends",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      },
      "branches": []
    }
  },
  "coverage": {
    "sourceBodyParagraphs": 921,
    "playerTurns": 858,
    "ledger": [
      {
        "line": 21,
        "sceneId": "b01_enter",
        "source": "（山下的风吹过璃的披肩。再走几步，风忽然暖起来。村口屋檐滴着昨夜的雨，一只倒扣的木盆边钻着嫩草。）",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L21"
        ]
      },
      {
        "line": 23,
        "sceneId": "b01_enter",
        "source": "珂珂：再帮我扶一下。别扶灯，扶背包下边。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L23"
        ]
      },
      {
        "line": 25,
        "sceneId": "b01_enter",
        "source": "璃：这么多年，这块台阶还是歪的。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L25"
        ]
      },
      {
        "line": 27,
        "sceneId": "b01_enter",
        "source": "珂珂：它不歪，我这趟就能少停三次。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L27"
        ]
      },
      {
        "line": 29,
        "sceneId": "b01_enter",
        "source": "（璃托住木框背包的下缘。珂珂站稳，把灯放回靠身的一侧。）",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L29"
        ]
      },
      {
        "line": 31,
        "sceneId": "b01_enter",
        "source": "纱雾：璃？",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L31"
        ]
      },
      {
        "line": 33,
        "sceneId": "b01_enter",
        "source": "（璃抬头。纱雾站在门楼下，手里捏着一张折到很小的旧地图。）",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L33"
        ]
      },
      {
        "line": 35,
        "sceneId": "b01_enter",
        "source": "璃：我……这次跟货队来的。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L35"
        ]
      },
      {
        "line": 37,
        "sceneId": "b01_enter",
        "source": "纱雾：我看见了。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L37"
        ]
      },
      {
        "line": 39,
        "sceneId": "b01_enter",
        "source": "珂珂：只跟来一个背包。车还在下面，南坡那几级台阶，我可不敢让骡子试。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L39"
        ]
      },
      {
        "line": 41,
        "sceneId": "b01_enter",
        "source": "纱雾：（向旁边让开）先进来。广场烧了热水。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L41"
        ]
      },
      {
        "line": 43,
        "sceneId": "b01_enter",
        "source": "（两位住民各提一只行囊，从门里出来，向纱雾挥手。）",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L43"
        ]
      },
      {
        "line": 45,
        "sceneId": "b01_enter",
        "source": "住民：我们先去河谷看看屋子。米露问起来，你替我说一声，后天回来搬箱子。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L45"
        ]
      },
      {
        "line": 47,
        "sceneId": "b01_enter",
        "source": "纱雾：好。下坡的湿石头滑，别走最边上。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L47"
        ]
      },
      {
        "line": 49,
        "sceneId": "b01_enter",
        "source": "璃：已经有人走了？",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L49"
        ]
      },
      {
        "line": 51,
        "sceneId": "b01_enter",
        "source": "纱雾：也有人刚回来，正教大家怎么砌不冒烟的冬灶。",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L51"
        ]
      },
      {
        "line": 53,
        "sceneId": "b01_enter",
        "source": "（纱雾把旧地图放进怀中。璃还想看清那张纸，前方已经传来木轮空转的声音。）",
        "classification": "player-text",
        "turnIds": [
          "b01_enter.L53"
        ]
      },
      {
        "line": 57,
        "sceneId": "b01_pre",
        "source": "（一具旧运木偶横在路口。前轮断了，后轮仍把木料往窄道里推；行人每靠近一步，它就抬起载木臂。）",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L57"
        ]
      },
      {
        "line": 59,
        "sceneId": "b01_pre",
        "source": "璃：它在做什么？",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L59"
        ]
      },
      {
        "line": 61,
        "sceneId": "b01_pre",
        "source": "纱雾：把木头送去溪边。路线里从前没有这面挡土墙。",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L61"
        ]
      },
      {
        "line": 63,
        "sceneId": "b01_pre",
        "source": "珂珂：人能绕，行李绕不过去。刚才那两位又被挡回来了。",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L63"
        ]
      },
      {
        "line": 65,
        "sceneId": "b01_pre",
        "source": "纱雾：我关过旁边的开关，传动线断在里面了。",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L65"
        ]
      },
      {
        "line": 67,
        "sceneId": "b01_pre",
        "source": "璃：（拔剑）那就拆掉驱动核。你们退到门楼后面，别从它手臂下面钻。",
        "classification": "player-text",
        "turnIds": [
          "b01_pre.L67"
        ]
      },
      {
        "line": 69,
        "sceneId": "b01_pre",
        "source": "【动态提示：预览运木偶固定战斗，可取消。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 73,
        "sceneId": "b01_post",
        "source": "（木臂垂下，不再转动。璃把剑收回左腰的剑鞘。两位住民搬开较轻的木块，先前的行囊终于过去。）",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L73"
        ]
      },
      {
        "line": 75,
        "sceneId": "b01_post",
        "source": "住民：这个核我们搬去废料棚？",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L75"
        ]
      },
      {
        "line": 77,
        "sceneId": "b01_post",
        "source": "璃：等它冷下来再搬。旁边那块石头很稳，先垫住轮子。",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L77"
        ]
      },
      {
        "line": 79,
        "sceneId": "b01_post",
        "source": "纱雾：（看着重新通行的窄口）你还是做完就想走。",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L79"
        ]
      },
      {
        "line": 81,
        "sceneId": "b01_post",
        "source": "璃：我还没走。",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L81"
        ]
      },
      {
        "line": 83,
        "sceneId": "b01_post",
        "source": "纱雾：我是说，你连“好了”都不说一声。",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L83"
        ]
      },
      {
        "line": 85,
        "sceneId": "b01_post",
        "source": "（璃望向她。纱雾嘴角动了一下，先转身往广场走去。）",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L85"
        ]
      },
      {
        "line": 87,
        "sceneId": "b01_post",
        "source": "纱雾：好了。现在真的先进来吧。",
        "classification": "player-text",
        "turnIds": [
          "b01_post.L87"
        ]
      },
      {
        "line": 91,
        "sceneId": "b02_enter",
        "source": "（广场摆着装粮的筐、拆下来的窗框和一壶不断续水的茶。米露把圆盾靠在桌腿旁，尾巴绕过一块沾湿的砖。）",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L91"
        ]
      },
      {
        "line": 93,
        "sceneId": "b02_enter",
        "source": "米露：西屋的人家，修门缝的布已经放在学舍。想去河谷的，今晚告诉我需要几次搬运。还没想好的也没关系，先去看一趟。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L93"
        ]
      },
      {
        "line": 95,
        "sceneId": "b02_enter",
        "source": "璃：既然要停暖，为什么不一起下山？路我可以清。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L95"
        ]
      },
      {
        "line": 97,
        "sceneId": "b02_enter",
        "source": "（米露抬眼看她，停下手里的砖。）",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L97"
        ]
      },
      {
        "line": 99,
        "sceneId": "b02_enter",
        "source": "米露：一起，是哪些人？",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L99"
        ]
      },
      {
        "line": 101,
        "sceneId": "b02_enter",
        "source": "璃：村里的人。留在这里太麻烦了。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L101"
        ]
      },
      {
        "line": 103,
        "sceneId": "b02_enter",
        "source": "（桌边一位抱着窗框的住民放慢动作。）",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L103"
        ]
      },
      {
        "line": 105,
        "sceneId": "b02_enter",
        "source": "住民：我知道河谷的冬天。我在那里住过五年。可我的窑、屋子、今年晒的粮都在这里。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L105"
        ]
      },
      {
        "line": 107,
        "sceneId": "b02_enter",
        "source": "另一位住民：我想去。屋里漏风，修起来比租一冬客舍还贵。但我想自己选住哪间。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L107"
        ]
      },
      {
        "line": 109,
        "sceneId": "b02_enter",
        "source": "米露：你看，路还没通，他们的意思也不是同一个。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L109"
        ]
      },
      {
        "line": 111,
        "sceneId": "b02_enter",
        "source": "璃：我只是想少冒些险。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L111"
        ]
      },
      {
        "line": 113,
        "sceneId": "b02_enter",
        "source": "米露：那就帮大家把能走的路修好。留下的人，也需要运进来的砖和柴。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L113"
        ]
      },
      {
        "line": 115,
        "sceneId": "b02_enter",
        "source": "（米露拿开茶杯。杯底在路图的西侧留下一个湿圈，珂珂伸手把纸角抬起来。）",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L115"
        ]
      },
      {
        "line": 117,
        "sceneId": "b02_enter",
        "source": "珂珂：别淹货场。砖还在那儿。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L117"
        ]
      },
      {
        "line": 119,
        "sceneId": "b02_enter",
        "source": "米露：南坡走人。西石道原来能过车，现在断了几段。先沿西面下到河谷，再从北坡绕回。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L119"
        ]
      },
      {
        "line": 121,
        "sceneId": "b02_enter",
        "source": "（她用指节沿山腰划过半圈。）",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L121"
        ]
      },
      {
        "line": 123,
        "sceneId": "b02_enter",
        "source": "米露：工用小径能背工具，运不了整车门板和砖。你们清出落脚处，工队跟着补桥接管。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L123"
        ]
      },
      {
        "line": 125,
        "sceneId": "b02_enter",
        "source": "璃：要赶在什么时候以前？",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L125"
        ]
      },
      {
        "line": 127,
        "sceneId": "b02_enter",
        "source": "珂珂：初秋了，照往年的雪期还有六周。明晚不会冻住屋门，可冬料和人都得一趟趟搬。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L127"
        ]
      },
      {
        "line": 129,
        "sceneId": "b02_enter",
        "source": "米露：先把路接上。我们争取前两周做完这一轮停暖，后面还得试炉子、补漏风的地方。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L129"
        ]
      },
      {
        "line": 131,
        "sceneId": "b02_enter",
        "source": "璃：（看向摊在旁边的窗框）我还以为，一下山就全能解决。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L131"
        ]
      },
      {
        "line": 133,
        "sceneId": "b02_enter",
        "source": "米露：下山也要收东西，也要挑住处。你替我们把路弄好，已经够忙的了。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L133"
        ]
      },
      {
        "line": 135,
        "sceneId": "b02_enter",
        "source": "纱雾：我认识根路。我陪她去。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L135"
        ]
      },
      {
        "line": 137,
        "sceneId": "b02_enter",
        "source": "米露：树心那边呢？",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L137"
        ]
      },
      {
        "line": 139,
        "sceneId": "b02_enter",
        "source": "纱雾：（手停在地图边上）我先去问老师。",
        "classification": "player-text",
        "turnIds": [
          "b02_enter.L139"
        ]
      },
      {
        "line": 143,
        "sceneId": "b02_choice",
        "source": "选择一：先问米露最缺什么。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 145,
        "sceneId": "b02_choice",
        "source": "璃：哪一段先通，最能帮上忙？",
        "classification": "player-text",
        "turnIds": [
          "b02_choice.L145"
        ]
      },
      {
        "line": 147,
        "sceneId": "b02_choice",
        "source": "米露：先去看暖溪的管口。再把西石道接到河谷货场。你回来得正好，但不是所有事都得由你一个人做。",
        "classification": "player-text",
        "turnIds": [
          "b02_choice.L147"
        ]
      },
      {
        "line": 149,
        "sceneId": "b02_choice",
        "source": "选择二：承认自己问得太快。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 151,
        "sceneId": "b02_choice",
        "source": "璃：我还没看过你们准备的东西，就想让人走。",
        "classification": "player-text",
        "turnIds": [
          "b02_choice.L151"
        ]
      },
      {
        "line": 153,
        "sceneId": "b02_choice",
        "source": "米露：想快一点没坏处。替别人快一点下决定，就不一定了。",
        "classification": "player-text",
        "turnIds": [
          "b02_choice.L153"
        ]
      },
      {
        "line": 155,
        "sceneId": "b02_choice",
        "source": "（两项合流，无能力加成、隐藏好感奖惩或去留强制变更。）",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 159,
        "sceneId": "b03_enter",
        "source": "（墙上是一排温标，桌上放着凉掉的饭。诺克缇娅站在三个红菱封印片前，调整其中一枚的位置。）",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L159"
        ]
      },
      {
        "line": 161,
        "sceneId": "b03_enter",
        "source": "诺克缇娅：别站在那块铜板上。会热。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L161"
        ]
      },
      {
        "line": 163,
        "sceneId": "b03_enter",
        "source": "璃：（挪开脚）你知道我要问什么？",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L163"
        ]
      },
      {
        "line": 165,
        "sceneId": "b03_enter",
        "source": "诺克缇娅：每个进来的人都先问：还能不能暖一冬。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L165"
        ]
      },
      {
        "line": 167,
        "sceneId": "b03_enter",
        "source": "绯叶：（把一截干瘪的树脂囊放在布上）这些囊是去年长成的。今年一个新的也没有。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L167"
        ]
      },
      {
        "line": 169,
        "sceneId": "b03_enter",
        "source": "纱雾：可是根里还在发热。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L169"
        ]
      },
      {
        "line": 171,
        "sceneId": "b03_enter",
        "source": "绯叶：它在用剩下的。和仓里有粮、田里今年没有收成，是两回事。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L171"
        ]
      },
      {
        "line": 173,
        "sceneId": "b03_enter",
        "source": "绯叶：它得休眠。可停下来，春天也未必能恢复。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L173"
        ]
      },
      {
        "line": 175,
        "sceneId": "b03_enter",
        "source": "（诺克缇娅将三个封印片一并压低，温标缓缓回到刻线间。）",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L175"
        ]
      },
      {
        "line": 177,
        "sceneId": "b03_enter",
        "source": "诺克缇娅：所以村子得先有别的过法。不能等它醒了才决定。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L177"
        ]
      },
      {
        "line": 179,
        "sceneId": "b03_enter",
        "source": "璃：先把你带出去呢？",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L179"
        ]
      },
      {
        "line": 181,
        "sceneId": "b03_enter",
        "source": "诺克缇娅：现在离开，几处回水会倒流。冬用管接上以后也会被冲坏。得先把这些支流关好。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L181"
        ]
      },
      {
        "line": 183,
        "sceneId": "b03_enter",
        "source": "纱雾：四个支阀，然后总阀。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L183"
        ]
      },
      {
        "line": 185,
        "sceneId": "b03_enter",
        "source": "诺克缇娅：对。你知道路，璃能处理失控的维护偶。米露的人接普通管、补石基。这几件事得一起做。",
        "classification": "player-text",
        "turnIds": [
          "b03_enter.L185"
        ]
      },
      {
        "line": 189,
        "sceneId": "b03_rules",
        "source": "（绯叶打开隔热匣。八只小囊嵌在匣内，颜色像很深的蜜。窗外并没有夕阳，囊里却各自浮着一线斜照。）",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L189"
        ]
      },
      {
        "line": 191,
        "sceneId": "b03_rules",
        "source": "纱雾：去年晒场上的光，也是这个颜色。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L191"
        ]
      },
      {
        "line": 193,
        "sceneId": "b03_rules",
        "source": "绯叶：就是去年留下的。封好了以后，它跑得慢。原想着今年有新的，再把这些换出来。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L193"
        ]
      },
      {
        "line": 195,
        "sceneId": "b03_rules",
        "source": "璃：现在只剩这八份？",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L195"
        ]
      },
      {
        "line": 197,
        "sceneId": "b03_rules",
        "source": "绯叶：只有这些完整封存的。路上能捡到的是干树脂，点灯、补缝都可以，拼不回一只储热囊。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L197"
        ]
      },
      {
        "line": 199,
        "sceneId": "b03_rules",
        "source": "（诺克缇娅指了指匣中四个带标盖的位置。）",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L199"
        ]
      },
      {
        "line": 201,
        "sceneId": "b03_rules",
        "source": "诺克缇娅：四个支阀各留一份。暖脂沿旧槽进去，抱着阀轴的活根才会松开。从外面烧，只会先烧裂根皮。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L201"
        ]
      },
      {
        "line": 203,
        "sceneId": "b03_rules",
        "source": "璃：这些给树吃，能不能等到明年？",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L203"
        ]
      },
      {
        "line": 205,
        "sceneId": "b03_rules",
        "source": "绯叶：只够暖一小块地方，长不回它蓄热的组织。它得停下来，收住剩下的力气。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L205"
        ]
      },
      {
        "line": 207,
        "sceneId": "b03_rules",
        "source": "纱雾：（合上四个标盖）这四份留给路。剩下的呢？",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L207"
        ]
      },
      {
        "line": 209,
        "sceneId": "b03_rules",
        "source": "绯叶：温室的内间，两份；老梨树脱暖移栽，一份；半山那间石屋，两份。你们到地方再看，它们各自能留下什么。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L209"
        ]
      },
      {
        "line": 211,
        "sceneId": "b03_rules",
        "source": "璃：一共五份。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L211"
        ]
      },
      {
        "line": 213,
        "sceneId": "b03_rules",
        "source": "绯叶：是。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L213"
        ]
      },
      {
        "line": 215,
        "sceneId": "b03_rules",
        "source": "（璃收回伸向匣子的手。）",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L215"
        ]
      },
      {
        "line": 217,
        "sceneId": "b03_rules",
        "source": "纱雾：可以先都看过，再开盖吗？",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L217"
        ]
      },
      {
        "line": 219,
        "sceneId": "b03_rules",
        "source": "绯叶：当然。一旦送进根槽，就抽不回来了。封着的时候，先别急。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L219"
        ]
      },
      {
        "line": 221,
        "sceneId": "b03_rules",
        "source": "诺克缇娅：粮柴、学舍的炉子另排好了。大家商量过，这四份留给那三处。你们看过再定。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L221"
        ]
      },
      {
        "line": 223,
        "sceneId": "b03_rules",
        "source": "璃：我去看。没用上的地方，也按说好的办法做完。",
        "classification": "player-text",
        "turnIds": [
          "b03_rules.L223"
        ]
      },
      {
        "line": 225,
        "sceneId": "b03_rules",
        "source": "【动态提示：暖脂八份，四份保留、四份可分配；展示三暖点用途。拾取与商店不能补充。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 229,
        "sceneId": "b03_exit",
        "source": "纱雾：我跟璃走到河谷，再从北边回来。你这边……",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L229"
        ]
      },
      {
        "line": 231,
        "sceneId": "b03_exit",
        "source": "诺克缇娅：米露已经安排人送饭和看温标。有异常就按铃，我做复杂的那部分。",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L231"
        ]
      },
      {
        "line": 233,
        "sceneId": "b03_exit",
        "source": "纱雾：我也能再留两天。",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L233"
        ]
      },
      {
        "line": 235,
        "sceneId": "b03_exit",
        "source": "诺克缇娅：你留两天，路就晚两天有人看。去吧，回来告诉我哪段扶手松了。",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L235"
        ]
      },
      {
        "line": 237,
        "sceneId": "b03_exit",
        "source": "（纱雾点头，仍站着。诺克缇娅把凉饭端离温标架。）",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L237"
        ]
      },
      {
        "line": 239,
        "sceneId": "b03_exit",
        "source": "诺克缇娅：不是在赶你。我只是想趁饭还不算太凉，吃掉它。",
        "classification": "player-text",
        "turnIds": [
          "b03_exit.L239"
        ]
      },
      {
        "line": 243,
        "sceneId": "b04_enter",
        "source": "（旧课桌被搬到墙边。靠窗的住民正用细布检查门缝，另一人拿着从河谷带回的灶图。脚边堆着砖、灰和普通木柴。）",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L243"
        ]
      },
      {
        "line": 245,
        "sceneId": "b04_enter",
        "source": "米露：先试烧，再封最后一面。谁要是头疼，立刻开门，别觉得忍一忍就过去了。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L245"
        ]
      },
      {
        "line": 247,
        "sceneId": "b04_enter",
        "source": "璃：这里能住多少人？",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L247"
        ]
      },
      {
        "line": 249,
        "sceneId": "b04_enter",
        "source": "米露：愿意临时来住的几户已经各自看过了。床位不拿来堆货。还差的门板，西路通了就送来。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L249"
        ]
      },
      {
        "line": 251,
        "sceneId": "b04_enter",
        "source": "纱雾：（摸了摸一张旧桌的刻痕）这是我以前坐的位置。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L251"
        ]
      },
      {
        "line": 253,
        "sceneId": "b04_enter",
        "source": "璃：你那时候一直说窗边太热。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L253"
        ]
      },
      {
        "line": 255,
        "sceneId": "b04_enter",
        "source": "纱雾：以后坐这里的人，可能就喜欢晒太阳了。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L255"
        ]
      },
      {
        "line": 257,
        "sceneId": "b04_enter",
        "source": "（两位志愿者把工具分进木箱，抬起沉的那一只。）",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L257"
        ]
      },
      {
        "line": 259,
        "sceneId": "b04_enter",
        "source": "工队住民：我们先跟到溪口。你们清出来，我们就接管。别等着你一个人把砖也背完。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L259"
        ]
      },
      {
        "line": 261,
        "sceneId": "b04_enter",
        "source": "璃：好。我会给你们留出能搬东西的宽度。",
        "classification": "player-text",
        "turnIds": [
          "b04_enter.L261"
        ]
      },
      {
        "line": 265,
        "sceneId": "b04_exit",
        "source": "（走出学舍时，纱雾回头看炉墙。）",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L265"
        ]
      },
      {
        "line": 267,
        "sceneId": "b04_exit",
        "source": "纱雾：我以前总觉得，不在这里看着，就会漏掉什么。",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L267"
        ]
      },
      {
        "line": 269,
        "sceneId": "b04_exit",
        "source": "璃：现在呢？",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L269"
        ]
      },
      {
        "line": 271,
        "sceneId": "b04_exit",
        "source": "纱雾：现在也觉得。不过他们好像知道自己在做什么。",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L271"
        ]
      },
      {
        "line": 273,
        "sceneId": "b04_exit",
        "source": "璃：那先漏掉这一会儿吧。",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L273"
        ]
      },
      {
        "line": 275,
        "sceneId": "b04_exit",
        "source": "（纱雾轻轻碰了碰她的披肩，没有回答“好”，却往溪口走了。）",
        "classification": "player-text",
        "turnIds": [
          "b04_exit.L275"
        ]
      },
      {
        "line": 279,
        "sceneId": "b05_pre",
        "source": "（维护根偶正把新装的普通水管往外顶。它每次收回木臂，管口就被扯离石槽一点；施工队只能把固定绳拉紧。）",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L279"
        ]
      },
      {
        "line": 281,
        "sceneId": "b05_pre",
        "source": "工队住民：它一直把新管当成堵塞。再顶两次，接口就裂了。",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L281"
        ]
      },
      {
        "line": 283,
        "sceneId": "b05_pre",
        "source": "纱雾：（让完整圆环星盘停在管边）旧指令还在：这条暖水道不许被别的东西碰。",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L283"
        ]
      },
      {
        "line": 285,
        "sceneId": "b05_pre",
        "source": "璃：能从这里关掉吗？",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L285"
        ]
      },
      {
        "line": 287,
        "sceneId": "b05_pre",
        "source": "纱雾：控制线压在它的底座下面。得先让它停。",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L287"
        ]
      },
      {
        "line": 289,
        "sceneId": "b05_pre",
        "source": "璃：大家松手以后退到那块石墙后。我把它引离管口。",
        "classification": "player-text",
        "turnIds": [
          "b05_pre.L289"
        ]
      },
      {
        "line": 291,
        "sceneId": "b05_pre",
        "source": "【动态提示：预览威胁新水管的维护偶与可用路线。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 295,
        "sceneId": "b05_valve",
        "source": "（根偶停下。工队扶正水管，纱雾把一份主路暖脂送入旧槽。活根缓缓放开阀轴，璃与工队共同转动手柄，机械锁落下。）",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L295"
        ]
      },
      {
        "line": 297,
        "sceneId": "b05_valve",
        "source": "纱雾：锁住了。现在接普通管。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L297"
        ]
      },
      {
        "line": 299,
        "sceneId": "b05_valve",
        "source": "（溪口的白汽渐渐变薄。水仍从石缝里流出来。）",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L299"
        ]
      },
      {
        "line": 301,
        "sceneId": "b05_valve",
        "source": "璃：冷了？",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L301"
        ]
      },
      {
        "line": 303,
        "sceneId": "b05_valve",
        "source": "（纱雾伸手浸进溪水，很快抽回来，接着又放进去。）",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L303"
        ]
      },
      {
        "line": 305,
        "sceneId": "b05_valve",
        "source": "纱雾：凉。不痛。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L305"
        ]
      },
      {
        "line": 307,
        "sceneId": "b05_valve",
        "source": "璃：你以为会痛？",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L307"
        ]
      },
      {
        "line": 309,
        "sceneId": "b05_valve",
        "source": "纱雾：以前冬天路过河谷，我总把手缩在袖子里。回来又觉得，没有必要试了。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L309"
        ]
      },
      {
        "line": 311,
        "sceneId": "b05_valve",
        "source": "（璃蹲在她旁边，指尖掠过水面。）",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L311"
        ]
      },
      {
        "line": 313,
        "sceneId": "b05_valve",
        "source": "璃：以后洗菜要快一点。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L313"
        ]
      },
      {
        "line": 315,
        "sceneId": "b05_valve",
        "source": "纱雾：（笑出很轻的一声）你想到的是这个？",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L315"
        ]
      },
      {
        "line": 317,
        "sceneId": "b05_valve",
        "source": "璃：不然呢？",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L317"
        ]
      },
      {
        "line": 319,
        "sceneId": "b05_valve",
        "source": "纱雾：我刚才在想，这条溪是不是已经不认识我了。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L319"
        ]
      },
      {
        "line": 321,
        "sceneId": "b05_valve",
        "source": "（她看着水从手指间过去，慢慢放松了手。）",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L321"
        ]
      },
      {
        "line": 323,
        "sceneId": "b05_valve",
        "source": "纱雾：好像也没有。",
        "classification": "player-text",
        "turnIds": [
          "b05_valve.L323"
        ]
      },
      {
        "line": 325,
        "sceneId": "b05_valve",
        "source": "【动态提示：第一处支阀已关闭，扣除一份保留暖脂；普通水管接通。该状态永久保留。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 329,
        "sceneId": "b05_revisit",
        "source": "工队住民：接好了。回去跟学舍说，水会凉一些，照样能用。",
        "classification": "player-text",
        "turnIds": [
          "b05_revisit.L329"
        ]
      },
      {
        "line": 331,
        "sceneId": "b05_revisit",
        "source": "纱雾：我会说的。",
        "classification": "player-text",
        "turnIds": [
          "b05_revisit.L331"
        ]
      },
      {
        "line": 337,
        "sceneId": "b06_enter",
        "source": "（杉树间有一条很直的旧货道，如今被风倒木横压着。璃习惯性踏向一旁的窄隙，又看了看珂珂的背包。）",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L337"
        ]
      },
      {
        "line": 339,
        "sceneId": "b06_enter",
        "source": "璃：你过不去。",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L339"
        ]
      },
      {
        "line": 341,
        "sceneId": "b06_enter",
        "source": "珂珂：我能侧着挤。后面那车砖不能。",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L341"
        ]
      },
      {
        "line": 343,
        "sceneId": "b06_enter",
        "source": "（她们沿倒木走到断面。曾用来锯木的根偶把齿盘朝向树干，却连同旧石栏一并卷了进去，碎石不断弹落到路上。）",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L343"
        ]
      },
      {
        "line": 345,
        "sceneId": "b06_enter",
        "source": "纱雾：它还认得哪里有木头，但认不出石栏了。",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L345"
        ]
      },
      {
        "line": 347,
        "sceneId": "b06_enter",
        "source": "璃：把这些石头弹到路上，就算钻过去也没用。",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L347"
        ]
      },
      {
        "line": 349,
        "sceneId": "b06_enter",
        "source": "珂珂：我在后面拦住过路的人。你们看好它转回来的方向。",
        "classification": "player-text",
        "turnIds": [
          "b06_enter.L349"
        ]
      },
      {
        "line": 353,
        "sceneId": "b06_pre",
        "source": "纱雾：右侧的传动根缠在树下。左边能接近，但要过那几具拖木偶。",
        "classification": "player-text",
        "turnIds": [
          "b06_pre.L353"
        ]
      },
      {
        "line": 355,
        "sceneId": "b06_pre",
        "source": "璃：（先观察路线）不必把林子里所有会动的都拆了。我们要的是能让车过去的这一段。",
        "classification": "player-text",
        "turnIds": [
          "b06_pre.L355"
        ]
      },
      {
        "line": 357,
        "sceneId": "b06_pre",
        "source": "【动态提示：预览主路、可选绕路及各路固定战损。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 361,
        "sceneId": "b06_post",
        "source": "（齿盘停住。工队沿已通路段赶来，开始截短倒木、搬开碎石。原来只容一个人钻过的缝逐渐成为可运货的道路。）",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L361"
        ]
      },
      {
        "line": 363,
        "sceneId": "b06_post",
        "source": "珂珂：剩下这些木头有些还能做支撑。让工队分，别统统当柴烧。",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L363"
        ]
      },
      {
        "line": 365,
        "sceneId": "b06_post",
        "source": "纱雾：（捡起一片枯杉针）树倒了，旁边倒是亮起来了。",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L365"
        ]
      },
      {
        "line": 367,
        "sceneId": "b06_post",
        "source": "璃：你喜欢亮一点？",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L367"
        ]
      },
      {
        "line": 369,
        "sceneId": "b06_post",
        "source": "纱雾：我不知道。我以前都看它站着的样子。",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L369"
        ]
      },
      {
        "line": 371,
        "sceneId": "b06_post",
        "source": "（一只小兽穿过光斑，钻进杉林。）",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L371"
        ]
      },
      {
        "line": 373,
        "sceneId": "b06_post",
        "source": "璃：那先看一会儿。",
        "classification": "player-text",
        "turnIds": [
          "b06_post.L373"
        ]
      },
      {
        "line": 377,
        "sceneId": "b07_enter",
        "source": "（溪涧上方盘着两层旧树根。高处一层连着石路，低处的侧根桥面较窄，却完整搭在两岸岩座上，随着根流轻轻起伏。工人将几块桥板暂放在岸边，尚未往上铺。）",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L377"
        ]
      },
      {
        "line": 379,
        "sceneId": "b07_enter",
        "source": "工队住民：米露让把这个交给你。以前做好的，就剩两枚。",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L379"
        ]
      },
      {
        "line": 381,
        "sceneId": "b07_enter",
        "source": "（他打开矮木箱。两枚缚根楔并排放着。）",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L381"
        ]
      },
      {
        "line": 383,
        "sceneId": "b07_enter",
        "source": "璃：固定低处这根？",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L383"
        ]
      },
      {
        "line": 385,
        "sceneId": "b07_enter",
        "source": "工队住民：对。它担得住重量，就是会抬。楔进预先凿好的岩座，卡舌咬住，便取不回来了。硬拆只会把卡舌折在里面。",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L385"
        ]
      },
      {
        "line": 387,
        "sceneId": "b07_enter",
        "source": "纱雾：（让星盘沿根侧移动）两头都还实。楔好，我们先过去；桥板和栏杆随后补。",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L387"
        ]
      },
      {
        "line": 389,
        "sceneId": "b07_enter",
        "source": "璃：不用楔呢？",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L389"
        ]
      },
      {
        "line": 391,
        "sceneId": "b07_enter",
        "source": "工队住民：走上面的石路。坏拖偶堵在那里，要先拆了。两边只要有一边能开工，我们就能接过去。",
        "classification": "player-text",
        "turnIds": [
          "b07_enter.L391"
        ]
      },
      {
        "line": 395,
        "sceneId": "b07_rules",
        "source": "（纱雾摊开图，逐一指给璃看。）",
        "classification": "player-text",
        "turnIds": [
          "b07_rules.L395"
        ]
      },
      {
        "line": 397,
        "sceneId": "b07_rules",
        "source": "纱雾：这里、背阴山腰、北面风口，还有干根库的侧口。四处都留过岩座。",
        "classification": "player-text",
        "turnIds": [
          "b07_rules.L397"
        ]
      },
      {
        "line": 399,
        "sceneId": "b07_rules",
        "source": "璃：两枚，四个地方。",
        "classification": "player-text",
        "turnIds": [
          "b07_rules.L399"
        ]
      },
      {
        "line": 401,
        "sceneId": "b07_rules",
        "source": "工队住民：你们挑。桥板我们有，能撑重量的地方也都看过；楔子只管把会动的这段定住。",
        "classification": "player-text",
        "turnIds": [
          "b07_rules.L401"
        ]
      },
      {
        "line": 403,
        "sceneId": "b07_rules",
        "source": "【动态提示：获得两枚根楔，标出四点；预览各点两路的敌人、损耗、收益及不可回收。未战敌人保留。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 407,
        "sceneId": "b07_choice",
        "source": "选择一：消耗一枚，固定这条侧根。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 409,
        "sceneId": "b07_choice",
        "source": "（璃把楔对准岩座。纱雾示意根部起伏最低的一刻；楔的卡舌落下，窄根不再抬动。）",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L409"
        ]
      },
      {
        "line": 411,
        "sceneId": "b07_choice",
        "source": "纱雾：试第一步，别跑。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L411"
        ]
      },
      {
        "line": 413,
        "sceneId": "b07_choice",
        "source": "（璃跨上去，又转身伸出没有握剑的左手。）",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L413"
        ]
      },
      {
        "line": 415,
        "sceneId": "b07_choice",
        "source": "璃：现在轮到你。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L415"
        ]
      },
      {
        "line": 417,
        "sceneId": "b07_choice",
        "source": "纱雾：（握住她的手，过了一步便放开）这次我自己也过得去。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L417"
        ]
      },
      {
        "line": 419,
        "sceneId": "b07_choice",
        "source": "（两人过岸后，工队才开始铺板。新栏杆沿低处旁路立起，与上方拖偶够得到的范围隔着整段岩壁。通往旧石路的岔口拉上醒目的拦绳。）",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L419"
        ]
      },
      {
        "line": 421,
        "sceneId": "b07_choice",
        "source": "工队住民：这边铺好以后，行李和分批的小车从下边走。上面那几具还在，别走错。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L421"
        ]
      },
      {
        "line": 423,
        "sceneId": "b07_choice",
        "source": "璃：拦绳留着。以后要拆它们，再从旧口进去。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L423"
        ]
      },
      {
        "line": 425,
        "sceneId": "b07_choice",
        "source": "【动态提示：扣除一枚根楔，先开放侧根人物通行；铺板补栏完成后，本段旁路开放步行、驮运及分批轻车。原路敌人保留。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 427,
        "sceneId": "b07_choice",
        "source": "选择二：先走普通路，留着根楔。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 429,
        "sceneId": "b07_choice",
        "source": "璃：后面的路还没看过。先留下。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L429"
        ]
      },
      {
        "line": 431,
        "sceneId": "b07_choice",
        "source": "纱雾：好。我记住这处岩座。要回来也认得。",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L431"
        ]
      },
      {
        "line": 433,
        "sceneId": "b07_choice",
        "source": "（她折好图，指向石路入口。）",
        "classification": "player-text",
        "turnIds": [
          "b07_choice.L433"
        ]
      },
      {
        "line": 437,
        "sceneId": "b07_stone_post",
        "source": "（石路上的拖偶停下。工队移开残件，补好缺掉的一段栏绳，推着空轻车试过。）",
        "classification": "player-text",
        "turnIds": [
          "b07_stone_post.L437"
        ]
      },
      {
        "line": 439,
        "sceneId": "b07_stone_post",
        "source": "工队住民：这一边也检查好了。以后走，认这段新栏绳。",
        "classification": "player-text",
        "turnIds": [
          "b07_stone_post.L439"
        ]
      },
      {
        "line": 441,
        "sceneId": "b07_stone_post",
        "source": "【即时状态：仅在原路战斗获胜并完成清理后播放；本段石路开放公共通行。不重复给奖励。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 445,
        "sceneId": "b07_revisit",
        "source": "已固定：纱雾：桥板也铺好了。以后回来，认这边的栏杆。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b07_revisit.L445"
        ]
      },
      {
        "line": 447,
        "sceneId": "b07_revisit",
        "source": "未固定且仍有楔：纱雾：岩座还在。先把两条路的情况看清，再决定。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b07_revisit.L447"
        ]
      },
      {
        "line": 449,
        "sceneId": "b07_revisit",
        "source": "未固定且无楔：璃：两枚已经用在别处。这里走石路。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b07_revisit.L449"
        ]
      },
      {
        "line": 453,
        "sceneId": "b08_enter",
        "source": "（天黑后，三人在驿棚里点起普通柴火。珂珂把木框背包靠墙放好，单卷床垫铺在干处。纱雾坐下来，却还把星盘悬在手边。）",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L453"
        ]
      },
      {
        "line": 455,
        "sceneId": "b08_enter",
        "source": "珂珂：它也要值夜？",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L455"
        ]
      },
      {
        "line": 457,
        "sceneId": "b08_enter",
        "source": "纱雾：不是。我只是想看看根流。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L457"
        ]
      },
      {
        "line": 459,
        "sceneId": "b08_enter",
        "source": "珂珂：棚柱是石头。门梁也不靠它暖，放心。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L459"
        ]
      },
      {
        "line": 461,
        "sceneId": "b08_enter",
        "source": "（纱雾把星盘移到靠近自己的一侧，没有让它继续照着棚外。）",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L461"
        ]
      },
      {
        "line": 463,
        "sceneId": "b08_enter",
        "source": "璃：你想看冬市吗？",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L463"
        ]
      },
      {
        "line": 465,
        "sceneId": "b08_enter",
        "source": "纱雾：（摸到收在怀里的地图）你看见了。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L465"
        ]
      },
      {
        "line": 467,
        "sceneId": "b08_enter",
        "source": "璃：还是以前那张？",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L467"
        ]
      },
      {
        "line": 469,
        "sceneId": "b08_enter",
        "source": "纱雾：边上几条街已经换过名字。珂珂告诉我的。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L469"
        ]
      },
      {
        "line": 471,
        "sceneId": "b08_enter",
        "source": "珂珂：那家卖热梨饼的还在，摆摊的人换成女儿了。别按旧图找入口，会走到她家后院。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L471"
        ]
      },
      {
        "line": 473,
        "sceneId": "b08_enter",
        "source": "（纱雾笑了一下，又低头把纸角压平。）",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L473"
        ]
      },
      {
        "line": 475,
        "sceneId": "b08_enter",
        "source": "璃：等路通了，我带你去。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L475"
        ]
      },
      {
        "line": 477,
        "sceneId": "b08_enter",
        "source": "纱雾：你知道今年什么时候开吗？",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L477"
        ]
      },
      {
        "line": 479,
        "sceneId": "b08_enter",
        "source": "璃：还不知道。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L479"
        ]
      },
      {
        "line": 481,
        "sceneId": "b08_enter",
        "source": "纱雾：我问过了。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L481"
        ]
      },
      {
        "line": 483,
        "sceneId": "b08_enter",
        "source": "（璃望着她，收回了下一句“到时再安排”。）",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L483"
        ]
      },
      {
        "line": 485,
        "sceneId": "b08_enter",
        "source": "璃：那你告诉我。",
        "classification": "player-text",
        "turnIds": [
          "b08_enter.L485"
        ]
      },
      {
        "line": 489,
        "sceneId": "b08_night",
        "source": "（夜里，纱雾突然坐起，伸手找星盘。璃被轻微的金属声惊醒。）",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L489"
        ]
      },
      {
        "line": 491,
        "sceneId": "b08_night",
        "source": "璃：怎么了？",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L491"
        ]
      },
      {
        "line": 493,
        "sceneId": "b08_night",
        "source": "纱雾：我忘了看第三排温标。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L493"
        ]
      },
      {
        "line": 495,
        "sceneId": "b08_night",
        "source": "（她看见棚柱和已烧短的木柴，声音慢了下来。）",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L495"
        ]
      },
      {
        "line": 497,
        "sceneId": "b08_night",
        "source": "纱雾：这里只有一堆火。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L497"
        ]
      },
      {
        "line": 499,
        "sceneId": "b08_night",
        "source": "璃：（拨开一块挡住进气口的柴）还有我。珂珂睡得挺好。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L499"
        ]
      },
      {
        "line": 501,
        "sceneId": "b08_night",
        "source": "纱雾：你不用跟我一起醒。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L501"
        ]
      },
      {
        "line": 503,
        "sceneId": "b08_night",
        "source": "璃：我已经醒了。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L503"
        ]
      },
      {
        "line": 505,
        "sceneId": "b08_night",
        "source": "（璃把手停在剩下的柴边，没有立刻添得更满。）",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L505"
        ]
      },
      {
        "line": 507,
        "sceneId": "b08_night",
        "source": "璃：还冷吗？",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L507"
        ]
      },
      {
        "line": 509,
        "sceneId": "b08_night",
        "source": "纱雾：不冷。你别把明早的也烧了。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L509"
        ]
      },
      {
        "line": 511,
        "sceneId": "b08_night",
        "source": "（两人望着同一根留下的木柴，安静了一会儿。）",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L511"
        ]
      },
      {
        "line": 513,
        "sceneId": "b08_night",
        "source": "璃：明天先看断栈道，还是先去西枝台？",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L513"
        ]
      },
      {
        "line": 515,
        "sceneId": "b08_night",
        "source": "纱雾：断栈道。我要知道以后大家从哪边走。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L515"
        ]
      },
      {
        "line": 517,
        "sceneId": "b08_night",
        "source": "璃：好。",
        "classification": "player-text",
        "turnIds": [
          "b08_night.L517"
        ]
      },
      {
        "line": 519,
        "sceneId": "b08_night",
        "source": "【动态提示：仅按实际配置发放首次宿营补给。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 523,
        "sceneId": "b09_enter",
        "source": "（清晨，旧栈道在一处崖口断开。璃放下任务盒，借石面一撑，跃到另一侧。她落稳后回头。）",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L523"
        ]
      },
      {
        "line": 525,
        "sceneId": "b09_enter",
        "source": "璃：这里可以——",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L525"
        ]
      },
      {
        "line": 527,
        "sceneId": "b09_enter",
        "source": "（纱雾没有起跳。珂珂站在她后面，背包木框比缺口旁的落脚处还宽。）",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L527"
        ]
      },
      {
        "line": 529,
        "sceneId": "b09_enter",
        "source": "璃：（停住）不行。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L529"
        ]
      },
      {
        "line": 531,
        "sceneId": "b09_enter",
        "source": "纱雾：你当然可以。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L531"
        ]
      },
      {
        "line": 533,
        "sceneId": "b09_enter",
        "source": "璃：我说错了。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L533"
        ]
      },
      {
        "line": 535,
        "sceneId": "b09_enter",
        "source": "（璃回到原侧，捡起任务盒，转向下面的旧石阶。）",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L535"
        ]
      },
      {
        "line": 537,
        "sceneId": "b09_enter",
        "source": "珂珂：从这里绕，能下到石基。上次运材的人在那里装过检修架。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L537"
        ]
      },
      {
        "line": 539,
        "sceneId": "b09_enter",
        "source": "纱雾：不能拿根楔撑过去。这里没有连到岩座的侧根。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L539"
        ]
      },
      {
        "line": 541,
        "sceneId": "b09_enter",
        "source": "璃：知道。先把石基清出来，再搭实在的桥。",
        "classification": "player-text",
        "turnIds": [
          "b09_enter.L541"
        ]
      },
      {
        "line": 545,
        "sceneId": "b09_pre",
        "source": "（沿石阶下行，一组失控运材偶正反复拉扯废弃检修架。每次用力，架上的断梁便扫过工队需要落脚的石台。）",
        "classification": "player-text",
        "turnIds": [
          "b09_pre.L545"
        ]
      },
      {
        "line": 547,
        "sceneId": "b09_pre",
        "source": "工队住民：我们得站在那儿钉桥面。它不停，没人下得去。",
        "classification": "player-text",
        "turnIds": [
          "b09_pre.L547"
        ]
      },
      {
        "line": 549,
        "sceneId": "b09_pre",
        "source": "纱雾：牵引根全绞住了，从上面松不开。",
        "classification": "player-text",
        "turnIds": [
          "b09_pre.L549"
        ]
      },
      {
        "line": 551,
        "sceneId": "b09_pre",
        "source": "璃：我处理传动核。你们等梁完全停住，再下来，别跟着我跳。",
        "classification": "player-text",
        "turnIds": [
          "b09_pre.L551"
        ]
      },
      {
        "line": 553,
        "sceneId": "b09_pre",
        "source": "【动态提示：预览拖拽架战斗与路线；获胜后才可开工架桥。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 557,
        "sceneId": "b09_post",
        "source": "（两天里，崖口都是落锤声。工人清石基、架梁、钉板；璃搬短料，纱雾看着旧根。第三天清早，栏杆接齐，珂珂先试走，再带人推过分好重量的轻车。）",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L557"
        ]
      },
      {
        "line": 559,
        "sceneId": "b09_post",
        "source": "珂珂：人和轻车先过。重料还得分装，外沿没补齐以前，别把整车都压上来。",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L559"
        ]
      },
      {
        "line": 561,
        "sceneId": "b09_post",
        "source": "工队住民：我们先留在这里。上头送来的替班会沿小径过来，你们去接西石道。",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L561"
        ]
      },
      {
        "line": 563,
        "sceneId": "b09_post",
        "source": "璃：（看着珂珂到达对岸）这次可以了。",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L563"
        ]
      },
      {
        "line": 565,
        "sceneId": "b09_post",
        "source": "纱雾：嗯，这次可以。",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L565"
        ]
      },
      {
        "line": 567,
        "sceneId": "b09_post",
        "source": "（她们没有跳过最后一级，沿桥走完。）",
        "classification": "player-text",
        "turnIds": [
          "b09_post.L567"
        ]
      },
      {
        "line": 571,
        "sceneId": "b10_enter",
        "source": "（粗根紧贴岩壁。工队从旧步道肩挑分件支架过来，一人揉着肩，另一人接过最后一捆短料。）",
        "classification": "player-text",
        "turnIds": [
          "b10_enter.L571"
        ]
      },
      {
        "line": 573,
        "sceneId": "b10_enter",
        "source": "工队住民：我们昨天到的。零件能背，大木料还得等后面的车。这里先接好了，你们说，降哪根的力？",
        "classification": "player-text",
        "turnIds": [
          "b10_enter.L573"
        ]
      },
      {
        "line": 575,
        "sceneId": "b10_enter",
        "source": "纱雾：（看星盘）靠溪那根。别同时松开，外侧会滑。",
        "classification": "player-text",
        "turnIds": [
          "b10_enter.L575"
        ]
      },
      {
        "line": 577,
        "sceneId": "b10_enter",
        "source": "璃：我在外侧扶着锁柄。",
        "classification": "player-text",
        "turnIds": [
          "b10_enter.L577"
        ]
      },
      {
        "line": 579,
        "sceneId": "b10_enter",
        "source": "（她照纱雾指的顺序移动，没有替她抢说下一步。）",
        "classification": "player-text",
        "turnIds": [
          "b10_enter.L579"
        ]
      },
      {
        "line": 583,
        "sceneId": "b10_valve",
        "source": "（第二份主路暖脂进入旧槽。活根舒展，机械锁压住阀轴，石木支撑逐段承担重量。原本发亮的细根暗下去，路面没有塌。）",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L583"
        ]
      },
      {
        "line": 585,
        "sceneId": "b10_valve",
        "source": "纱雾：停住了。等一会儿再走。",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L585"
        ]
      },
      {
        "line": 587,
        "sceneId": "b10_valve",
        "source": "（众人等过一阵轻微的木声。米露带着另一组工人从新通的路上出现。）",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L587"
        ]
      },
      {
        "line": 589,
        "sceneId": "b10_valve",
        "source": "米露：到这里比我以为的快。断栈道那边有人该吃饭了，我让这批人去换。",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L589"
        ]
      },
      {
        "line": 591,
        "sceneId": "b10_valve",
        "source": "璃：你不是要看着村里？",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L591"
        ]
      },
      {
        "line": 593,
        "sceneId": "b10_valve",
        "source": "米露：村里也有人看着。我出来两个时辰，不至于全都停下。",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L593"
        ]
      },
      {
        "line": 595,
        "sceneId": "b10_valve",
        "source": "（她说完，望了纱雾一眼。纱雾低头，慢慢收回星盘。）",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L595"
        ]
      },
      {
        "line": 597,
        "sceneId": "b10_valve",
        "source": "纱雾：原来你也会说这句话。",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L597"
        ]
      },
      {
        "line": 599,
        "sceneId": "b10_valve",
        "source": "米露：怎么，只有你能放心不下？",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L599"
        ]
      },
      {
        "line": 601,
        "sceneId": "b10_valve",
        "source": "（米露把干粮递给替班的工人。）",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L601"
        ]
      },
      {
        "line": 603,
        "sceneId": "b10_valve",
        "source": "米露：去河谷吧。告诉货场，我们在把路接过去。",
        "classification": "player-text",
        "turnIds": [
          "b10_valve.L603"
        ]
      },
      {
        "line": 605,
        "sceneId": "b10_valve",
        "source": "【动态提示：第二处支阀关闭，扣除一份保留暖脂；西枝路由普通支架支撑，主路进度更新。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 609,
        "sceneId": "b10_exit",
        "source": "（走出分流台前，纱雾回望已经有人接班的桥。）",
        "classification": "player-text",
        "turnIds": [
          "b10_exit.L609"
        ]
      },
      {
        "line": 611,
        "sceneId": "b10_exit",
        "source": "纱雾：以前我离开的时候，都会想，等我回去得先补哪一件。",
        "classification": "player-text",
        "turnIds": [
          "b10_exit.L611"
        ]
      },
      {
        "line": 613,
        "sceneId": "b10_exit",
        "source": "璃：今天呢？",
        "classification": "player-text",
        "turnIds": [
          "b10_exit.L613"
        ]
      },
      {
        "line": 615,
        "sceneId": "b10_exit",
        "source": "纱雾：今天……好像可以先吃饭。",
        "classification": "player-text",
        "turnIds": [
          "b10_exit.L615"
        ]
      },
      {
        "line": 621,
        "sceneId": "b11_enter",
        "source": "（路边残留着运货时用来报位的铃。风一吹，几只铃便撞在一起。前方一具高大的归材偶正把散落货箱一只只推下坡，连着货场的车辙也被刨出了深坑。）",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L621"
        ]
      },
      {
        "line": 623,
        "sceneId": "b11_enter",
        "source": "珂珂：停，别往前。它现在把所有放在路上的东西都当弃料。",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L623"
        ]
      },
      {
        "line": 625,
        "sceneId": "b11_enter",
        "source": "纱雾：以前有工人跟着它走。哪里该清，哪里要停，旁边一直有人指。",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L625"
        ]
      },
      {
        "line": 627,
        "sceneId": "b11_enter",
        "source": "璃：那个人不在，它也不会问。",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L627"
        ]
      },
      {
        "line": 629,
        "sceneId": "b11_enter",
        "source": "（一根木臂伸向货场方向，拖住路边的防滑绳。坡下传来工人避让的喊声。）",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L629"
        ]
      },
      {
        "line": 631,
        "sceneId": "b11_enter",
        "source": "珂珂：它把绳拖走，下面的人连车都稳不住。",
        "classification": "player-text",
        "turnIds": [
          "b11_enter.L631"
        ]
      },
      {
        "line": 635,
        "sceneId": "b11_pre",
        "source": "璃：我从坡上逼它转身。纱雾，你看着它背上的束根，不要让它把整段栏杆一起拉下来。",
        "classification": "player-text",
        "turnIds": [
          "b11_pre.L635"
        ]
      },
      {
        "line": 637,
        "sceneId": "b11_pre",
        "source": "纱雾：我能告诉你哪一根在吃力，不能把它定住。",
        "classification": "player-text",
        "turnIds": [
          "b11_pre.L637"
        ]
      },
      {
        "line": 639,
        "sceneId": "b11_pre",
        "source": "璃：够了。其他的照看好你自己。",
        "classification": "player-text",
        "turnIds": [
          "b11_pre.L639"
        ]
      },
      {
        "line": 641,
        "sceneId": "b11_pre",
        "source": "【动态提示：预览归材偶精英战与确定战损，可撤回。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 645,
        "sceneId": "b11_post",
        "source": "（归材偶停下。坡下工人重新拉紧防滑绳，把深车辙垫平，再将尚好的货箱搬回平地。）",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L645"
        ]
      },
      {
        "line": 647,
        "sceneId": "b11_post",
        "source": "珂珂：（摸了摸箱角）没全坏。这一车原本就是预备运到上面的。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L647"
        ]
      },
      {
        "line": 649,
        "sceneId": "b11_post",
        "source": "纱雾：它在这里走了很久。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L649"
        ]
      },
      {
        "line": 651,
        "sceneId": "b11_post",
        "source": "璃：我知道。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L651"
        ]
      },
      {
        "line": 653,
        "sceneId": "b11_post",
        "source": "纱雾：我不是说不该拆。我只是……记得小时候觉得它特别厉害，一次能扛三根木头。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L653"
        ]
      },
      {
        "line": 655,
        "sceneId": "b11_post",
        "source": "珂珂：把还能用的木臂留给工队吧。做一段新栏杆，手再小的人也扶得住。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L655"
        ]
      },
      {
        "line": 657,
        "sceneId": "b11_post",
        "source": "（纱雾点头，将挡路的旧铃挂到不会碰到行人的高处。）",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L657"
        ]
      },
      {
        "line": 659,
        "sceneId": "b11_post",
        "source": "纱雾：这个不用扔。",
        "classification": "player-text",
        "turnIds": [
          "b11_post.L659"
        ]
      },
      {
        "line": 663,
        "sceneId": "b12_enter",
        "source": "（山路突然开阔。谷底的田已收割，屋顶颜色深浅不一，几道炉烟向侧面飘。远处没有发亮的根，只有路、桥与分开的菜畦。）",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L663"
        ]
      },
      {
        "line": 665,
        "sceneId": "b12_enter",
        "source": "纱雾：他们把田空着。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L665"
        ]
      },
      {
        "line": 667,
        "sceneId": "b12_enter",
        "source": "珂珂：让地歇一阵。有的人种过冬的菜，有的人把活排到开春。不是每块地都得每个月长东西。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L667"
        ]
      },
      {
        "line": 669,
        "sceneId": "b12_enter",
        "source": "纱雾：我知道。书上也这么写。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L669"
        ]
      },
      {
        "line": 671,
        "sceneId": "b12_enter",
        "source": "（她又往前走了一步。）",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L671"
        ]
      },
      {
        "line": 673,
        "sceneId": "b12_enter",
        "source": "纱雾：可我以前站在村里，会觉得空下来的地方特别可惜。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L673"
        ]
      },
      {
        "line": 675,
        "sceneId": "b12_enter",
        "source": "璃：我第一次看见，也想过是不是收成不好。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L675"
        ]
      },
      {
        "line": 677,
        "sceneId": "b12_enter",
        "source": "纱雾：你从来没告诉过我。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L677"
        ]
      },
      {
        "line": 679,
        "sceneId": "b12_enter",
        "source": "璃：我总想着，等带你下来，你自己就能看见。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L679"
        ]
      },
      {
        "line": 681,
        "sceneId": "b12_enter",
        "source": "纱雾：你一走就是四年。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L681"
        ]
      },
      {
        "line": 683,
        "sceneId": "b12_enter",
        "source": "（璃的手垂在剑鞘旁，没有用别的事情接开这个话头。）",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L683"
        ]
      },
      {
        "line": 685,
        "sceneId": "b12_enter",
        "source": "璃：是。",
        "classification": "player-text",
        "turnIds": [
          "b12_enter.L685"
        ]
      },
      {
        "line": 689,
        "sceneId": "b12_choice",
        "source": "选择一：说出自己为什么一直没回来。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 691,
        "sceneId": "b12_choice",
        "source": "璃：我想先攒够钱，认全路，找个能住的地方。然后再来找你。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L691"
        ]
      },
      {
        "line": 693,
        "sceneId": "b12_choice",
        "source": "纱雾：我等过你。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L693"
        ]
      },
      {
        "line": 695,
        "sceneId": "b12_choice",
        "source": "（璃抬起头。）",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L695"
        ]
      },
      {
        "line": 697,
        "sceneId": "b12_choice",
        "source": "纱雾：第一年真的等了。后来我开始自己问冬市什么时候开。我不是每一天都坐在这里，等你回来接我。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L697"
        ]
      },
      {
        "line": 699,
        "sceneId": "b12_choice",
        "source": "璃：我知道。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L699"
        ]
      },
      {
        "line": 701,
        "sceneId": "b12_choice",
        "source": "纱雾：你刚刚才知道。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L701"
        ]
      },
      {
        "line": 703,
        "sceneId": "b12_choice",
        "source": "（璃没能接上话。）",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L703"
        ]
      },
      {
        "line": 705,
        "sceneId": "b12_choice",
        "source": "选择二：先问她现在想怎样。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 707,
        "sceneId": "b12_choice",
        "source": "璃：你现在还想跟我去吗？",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L707"
        ]
      },
      {
        "line": 709,
        "sceneId": "b12_choice",
        "source": "纱雾：想。但不是照你原先想的那样，收拾好东西，就一直跟着你走。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L709"
        ]
      },
      {
        "line": 711,
        "sceneId": "b12_choice",
        "source": "璃：我原先也没有想得那么清楚。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L711"
        ]
      },
      {
        "line": 713,
        "sceneId": "b12_choice",
        "source": "纱雾：那为什么不回来告诉我？",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L713"
        ]
      },
      {
        "line": 715,
        "sceneId": "b12_choice",
        "source": "璃：怕你发现。我连自己要去哪儿都没定，就先说了要带你看冬市。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L715"
        ]
      },
      {
        "line": 717,
        "sceneId": "b12_choice",
        "source": "合流：",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 719,
        "sceneId": "b12_choice",
        "source": "（山下有一辆车停在屋前。有人开门，替车上的人扶住一块长木板。）",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L719"
        ]
      },
      {
        "line": 721,
        "sceneId": "b12_choice",
        "source": "璃：我总觉得，空着手回来见你，很难看。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L721"
        ]
      },
      {
        "line": 723,
        "sceneId": "b12_choice",
        "source": "纱雾：你早一点回来吃顿饭，也可以。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L723"
        ]
      },
      {
        "line": 725,
        "sceneId": "b12_choice",
        "source": "（璃看了她一会儿，慢慢点头。）",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L725"
        ]
      },
      {
        "line": 727,
        "sceneId": "b12_choice",
        "source": "璃：我听见了。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L727"
        ]
      },
      {
        "line": 729,
        "sceneId": "b12_choice",
        "source": "纱雾：我想住一阵。学照料普通的温室，不用根流，什么时候开窗，什么时候别浇水。这些我已经想了很久。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L729"
        ]
      },
      {
        "line": 731,
        "sceneId": "b12_choice",
        "source": "璃：我能陪你去问吗？",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L731"
        ]
      },
      {
        "line": 733,
        "sceneId": "b12_choice",
        "source": "纱雾：能。等我说完，你再说。",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L733"
        ]
      },
      {
        "line": 735,
        "sceneId": "b12_choice",
        "source": "（前头的珂珂朝货场指了指，隔着一段路等她们。璃没有立刻催纱雾，和她再看了一会儿谷底的烟。）",
        "classification": "player-text",
        "turnIds": [
          "b12_choice.L735"
        ]
      },
      {
        "line": 739,
        "sceneId": "b13_enter",
        "source": "（抵达货场时，已经是离村后的第六天。车棚里挂着晒干的封窗布，第一批冬料还在等西石道的消息。）",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L739"
        ]
      },
      {
        "line": 741,
        "sceneId": "b13_enter",
        "source": "（货场里有人垫车轮，有人用布盖住砖料。璃刚走近，就有工人指了指她们身后的路。）",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L741"
        ]
      },
      {
        "line": 743,
        "sceneId": "b13_enter",
        "source": "货场工人：西石道到哪儿能过车了？",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L743"
        ]
      },
      {
        "line": 745,
        "sceneId": "b13_enter",
        "source": "珂珂：分流台下接上了。断栈那段走分批轻车，重料在这里拆载。米露的人还在补外沿。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L745"
        ]
      },
      {
        "line": 747,
        "sceneId": "b13_enter",
        "source": "货场工人：那我们先装门板和管套，重砖后送。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L747"
        ]
      },
      {
        "line": 749,
        "sceneId": "b13_enter",
        "source": "纱雾：冬衣呢？",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L749"
        ]
      },
      {
        "line": 751,
        "sceneId": "b13_enter",
        "source": "珂珂：压在车棚里，没让雨打着。住户之前各自选过的尺寸都分开了，别到了山上才一件件翻。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L751"
        ]
      },
      {
        "line": 753,
        "sceneId": "b13_enter",
        "source": "（她把账本交给负责货运的人，指清村里卖出果干与木料已经换好的那批货，再留下一角桌面给旅人购买用品。）",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L753"
        ]
      },
      {
        "line": 755,
        "sceneId": "b13_enter",
        "source": "珂珂：村里的冬料是一批，你们路上要用的东西是另一批。别把人家封窗的布买去拆成绷带。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L755"
        ]
      },
      {
        "line": 757,
        "sceneId": "b13_enter",
        "source": "璃：我不会。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L757"
        ]
      },
      {
        "line": 759,
        "sceneId": "b13_enter",
        "source": "珂珂：（看她一眼）以前你会。觉得反正都是布。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L759"
        ]
      },
      {
        "line": 761,
        "sceneId": "b13_enter",
        "source": "纱雾：（侧过头）这个我倒不知道。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L761"
        ]
      },
      {
        "line": 763,
        "sceneId": "b13_enter",
        "source": "璃：那时候我真的受伤了。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L763"
        ]
      },
      {
        "line": 765,
        "sceneId": "b13_enter",
        "source": "珂珂：所以这次先看清楚，缺什么买什么。钱花完了，路上的坏木头也不会自己长回来给你卖。",
        "classification": "player-text",
        "turnIds": [
          "b13_enter.L765"
        ]
      },
      {
        "line": 769,
        "sceneId": "b13_shop",
        "source": "【动态提示：打开商店，显示真实价格、效果、购买次数与库存规则。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 771,
        "sceneId": "b13_shop",
        "source": "购物退出共用短句：",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 773,
        "sceneId": "b13_shop",
        "source": "珂珂：装好了吗？我要去看装车。想再看看就来这里，桌子不会跑。",
        "classification": "player-text",
        "turnIds": [
          "b13_shop.L773"
        ]
      },
      {
        "line": 777,
        "sceneId": "b13_depart",
        "source": "纱雾：你会一直跟着我们到停暖吗？",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L777"
        ]
      },
      {
        "line": 779,
        "sceneId": "b13_depart",
        "source": "珂珂：货路通了，我把这一批交给米露，就回河谷。第一场大雪前，我得回家一趟。",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L779"
        ]
      },
      {
        "line": 781,
        "sceneId": "b13_depart",
        "source": "纱雾：如果山上临时还有事呢？",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L781"
        ]
      },
      {
        "line": 783,
        "sceneId": "b13_depart",
        "source": "珂珂：看是什么事。能在这趟带的，我带；下一趟的，换另一支货队。总不能每次都说“就多一天”。",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L783"
        ]
      },
      {
        "line": 785,
        "sceneId": "b13_depart",
        "source": "纱雾：（小声）别人不会生气吗？",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L785"
        ]
      },
      {
        "line": 787,
        "sceneId": "b13_depart",
        "source": "珂珂：有时会失望。我也会。失望完了，再想剩下的事怎么办。",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L787"
        ]
      },
      {
        "line": 789,
        "sceneId": "b13_depart",
        "source": "（珂珂系紧账本外的带子，没把这句话说成劝告。）",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L789"
        ]
      },
      {
        "line": 791,
        "sceneId": "b13_depart",
        "source": "珂珂：去客舍吧。天黑以前回来吃饭，我在那边的桌上给你们留位置。",
        "classification": "player-text",
        "turnIds": [
          "b13_depart.L791"
        ]
      },
      {
        "line": 795,
        "sceneId": "b14_enter",
        "source": "（客舍窗下叠着厚被，灶旁挂着水壶。几名旅客提着行李从楼上下来。）",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L795"
        ]
      },
      {
        "line": 797,
        "sceneId": "b14_enter",
        "source": "客舍主人：那几户来过两趟了。还想再看看也行，有人怕楼梯，有人想离灶近。",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L797"
        ]
      },
      {
        "line": 799,
        "sceneId": "b14_enter",
        "source": "璃：你们还有地方？",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L799"
        ]
      },
      {
        "line": 801,
        "sceneId": "b14_enter",
        "source": "客舍主人：说好的那些留着。人数变了，就再谈，不能一张嘴叫整村人都挤进来。",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L801"
        ]
      },
      {
        "line": 803,
        "sceneId": "b14_enter",
        "source": "纱雾：帮忙做饭、修篱笆，也是之前说过的？",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L803"
        ]
      },
      {
        "line": 805,
        "sceneId": "b14_enter",
        "source": "客舍主人：愿意做的，换一部分食宿；做不了的另算，先说清楚。",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L805"
        ]
      },
      {
        "line": 807,
        "sceneId": "b14_enter",
        "source": "（纱雾仔细看了看灶边一张温室通风图，主动指向图上的门。）",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L807"
        ]
      },
      {
        "line": 809,
        "sceneId": "b14_enter",
        "source": "纱雾：这间温室，在这里附近吗？",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L809"
        ]
      },
      {
        "line": 811,
        "sceneId": "b14_enter",
        "source": "客舍主人：河那边。我姐姐管的。她冬里要教两个帮手，你想问就去问。会看根流未必用得上，会盯着湿度、不怕搬土就行。",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L811"
        ]
      },
      {
        "line": 813,
        "sceneId": "b14_enter",
        "source": "璃：（几乎同时开口）她会——",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L813"
        ]
      },
      {
        "line": 815,
        "sceneId": "b14_enter",
        "source": "（璃停住。纱雾没有看她，继续向前。）",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L815"
        ]
      },
      {
        "line": 817,
        "sceneId": "b14_enter",
        "source": "纱雾：我会照料植物，但没管过会结霜的温室。明天能去问问吗？",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L817"
        ]
      },
      {
        "line": 819,
        "sceneId": "b14_enter",
        "source": "客舍主人：行。我带你们过河。",
        "classification": "player-text",
        "turnIds": [
          "b14_enter.L819"
        ]
      },
      {
        "line": 823,
        "sceneId": "b14_after",
        "source": "（两人在客舍内廊躲雨。通向院子的门虚掩着。）",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L823"
        ]
      },
      {
        "line": 825,
        "sceneId": "b14_after",
        "source": "璃：你早就想问了？",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L825"
        ]
      },
      {
        "line": 827,
        "sceneId": "b14_after",
        "source": "纱雾：嗯。在心里问过好多遍。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L827"
        ]
      },
      {
        "line": 829,
        "sceneId": "b14_after",
        "source": "璃：从什么时候？",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L829"
        ]
      },
      {
        "line": 831,
        "sceneId": "b14_after",
        "source": "纱雾：去年开始。后来一直想着，再等树心不那么忙的时候。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L831"
        ]
      },
      {
        "line": 833,
        "sceneId": "b14_after",
        "source": "璃：你想让我陪你吗？",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L833"
        ]
      },
      {
        "line": 835,
        "sceneId": "b14_after",
        "source": "纱雾：（望着雨外）想。但我也想自己去。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L835"
        ]
      },
      {
        "line": 837,
        "sceneId": "b14_after",
        "source": "璃：我听懂了。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L837"
        ]
      },
      {
        "line": 839,
        "sceneId": "b14_after",
        "source": "纱雾：那明天我先问。你刚才差点全替我说完了。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L839"
        ]
      },
      {
        "line": 841,
        "sceneId": "b14_after",
        "source": "（璃向里侧让开，给她空出一步。）",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L841"
        ]
      },
      {
        "line": 843,
        "sceneId": "b14_after",
        "source": "璃：你开吧。",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L843"
        ]
      },
      {
        "line": 845,
        "sceneId": "b14_after",
        "source": "（纱雾推开门，先跑进雨停后变亮的院子。）",
        "classification": "player-text",
        "turnIds": [
          "b14_after.L845"
        ]
      },
      {
        "line": 849,
        "sceneId": "b14_greenhouse",
        "source": "（次日，客舍主人带她们过河。纱雾等门里那盆苗落稳，才开口。）",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L849"
        ]
      },
      {
        "line": 851,
        "sceneId": "b14_greenhouse",
        "source": "纱雾：我想学一冬。不用暖根，怎么开窗、盖土，我都还不会。春天想回村试种。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L851"
        ]
      },
      {
        "line": 853,
        "sceneId": "b14_greenhouse",
        "source": "温室主人：先从搬土和看湿度学。上午跟我，下午和另一位帮手轮班。住客舍，帮工抵一部分食宿，余下的你算算够不够。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L853"
        ]
      },
      {
        "line": 855,
        "sceneId": "b14_greenhouse",
        "source": "（纱雾低头算了一会儿。）",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L855"
        ]
      },
      {
        "line": 857,
        "sceneId": "b14_greenhouse",
        "source": "纱雾：我攒的够。第一场雪前后的货班到，我跟着来，可以吗？",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L857"
        ]
      },
      {
        "line": 859,
        "sceneId": "b14_greenhouse",
        "source": "温室主人：正好换冬苗。山上若没收尾，托货队带话，我给你留到下一班。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L859"
        ]
      },
      {
        "line": 861,
        "sceneId": "b14_greenhouse",
        "source": "纱雾：好，我会提前说。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L861"
        ]
      },
      {
        "line": 863,
        "sceneId": "b14_greenhouse",
        "source": "客舍主人：房间给你留好。来了就找我，还是昨天那扇窗。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L863"
        ]
      },
      {
        "line": 865,
        "sceneId": "b14_greenhouse",
        "source": "（璃一直等在门边。出来时，纱雾手上沾了土。）",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L865"
        ]
      },
      {
        "line": 867,
        "sceneId": "b14_greenhouse",
        "source": "璃：已经开始搬了？",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L867"
        ]
      },
      {
        "line": 869,
        "sceneId": "b14_greenhouse",
        "source": "纱雾：她在试我是不是光会说。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L869"
        ]
      },
      {
        "line": 871,
        "sceneId": "b14_greenhouse",
        "source": "璃：你以前就会搬。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L871"
        ]
      },
      {
        "line": 873,
        "sceneId": "b14_greenhouse",
        "source": "纱雾：我知道。她今天才知道。",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L873"
        ]
      },
      {
        "line": 875,
        "sceneId": "b14_greenhouse",
        "source": "（璃递过擦手布，等她伸手才松开。）",
        "classification": "player-text",
        "turnIds": [
          "b14_greenhouse.L875"
        ]
      },
      {
        "line": 879,
        "sceneId": "b15_enter",
        "source": "（几只结实的货筐悬在索道边。货场这端的卷轴台缺少润滑和制动检查，工人已经拆开外壳。控制卷轴的维护偶却在不断收紧绳，筐子一靠近台边便猛烈晃动。）",
        "classification": "player-text",
        "turnIds": [
          "b15_enter.L879"
        ]
      },
      {
        "line": 881,
        "sceneId": "b15_enter",
        "source": "货场工人：它把负载不够当作需要加速。空筐也不停。",
        "classification": "player-text",
        "turnIds": [
          "b15_enter.L881"
        ]
      },
      {
        "line": 883,
        "sceneId": "b15_enter",
        "source": "璃：为什么不先断开绳？",
        "classification": "player-text",
        "turnIds": [
          "b15_enter.L883"
        ]
      },
      {
        "line": 885,
        "sceneId": "b15_enter",
        "source": "货场工人：断了还得重新架跨谷线。我们有替换卷轴，没办法现在把整根线重新送上去。",
        "classification": "player-text",
        "turnIds": [
          "b15_enter.L885"
        ]
      },
      {
        "line": 887,
        "sceneId": "b15_enter",
        "source": "纱雾：让我看一下收力的方向。先卸旁边这只空筐，免得它甩过来。",
        "classification": "player-text",
        "turnIds": [
          "b15_enter.L887"
        ]
      },
      {
        "line": 891,
        "sceneId": "b15_pre",
        "source": "（璃等工人退到安全栏外，才接近卷轴底座。）",
        "classification": "player-text",
        "turnIds": [
          "b15_pre.L891"
        ]
      },
      {
        "line": 893,
        "sceneId": "b15_pre",
        "source": "璃：我拆它的驱动，卷轴留下。它停了也别立刻放货，制动片还要重新装。",
        "classification": "player-text",
        "turnIds": [
          "b15_pre.L893"
        ]
      },
      {
        "line": 895,
        "sceneId": "b15_pre",
        "source": "【动态提示：预览卷索偶战斗；胜利后仍须检修、试载。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 899,
        "sceneId": "b15_post",
        "source": "（又过了一天。工人检查制动、逐筐试载，再将管套和门板装进货筐。绳缓缓上行，货物没有再撞向台边。）",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L899"
        ]
      },
      {
        "line": 901,
        "sceneId": "b15_post",
        "source": "纱雾：现在人能坐吗？",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L901"
        ]
      },
      {
        "line": 903,
        "sceneId": "b15_post",
        "source": "货场工人：不能。货筐和制动都按货做的。人走刚修好的路，别图快。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L903"
        ]
      },
      {
        "line": 905,
        "sceneId": "b15_post",
        "source": "璃：（望着渐小的货筐）上面谁接？",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L905"
        ]
      },
      {
        "line": 907,
        "sceneId": "b15_post",
        "source": "货场工人：半山候车屋旁的卸料坪，米露派了两个人守着。管套和短门板从那里沿旧工用路送回村。重砖还走西石道，分小车，一趟趟上。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L907"
        ]
      },
      {
        "line": 909,
        "sceneId": "b15_post",
        "source": "纱雾：学舍的窗能先封上了。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L909"
        ]
      },
      {
        "line": 911,
        "sceneId": "b15_post",
        "source": "珂珂：嗯。你们继续往北走。我押下一趟轻车回村，把货交完再下来。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L911"
        ]
      },
      {
        "line": 913,
        "sceneId": "b15_post",
        "source": "（纱雾看了一会儿客舍所在的方向，又把路图展开到北面。）",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L913"
        ]
      },
      {
        "line": 915,
        "sceneId": "b15_post",
        "source": "璃：温室那边，还有什么想问的吗？",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L915"
        ]
      },
      {
        "line": 917,
        "sceneId": "b15_post",
        "source": "纱雾：昨天都谈好了。开课还在后面，我们先回山上，做完这次的事。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L917"
        ]
      },
      {
        "line": 919,
        "sceneId": "b15_post",
        "source": "璃：不是因为我在等你？",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L919"
        ]
      },
      {
        "line": 921,
        "sceneId": "b15_post",
        "source": "纱雾：不是。我自己还想把它做完。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L921"
        ]
      },
      {
        "line": 923,
        "sceneId": "b15_post",
        "source": "（珂珂与她们在货场分开。）",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L923"
        ]
      },
      {
        "line": 925,
        "sceneId": "b15_post",
        "source": "珂珂：那就村里见。北坡风大，别走太晚。",
        "classification": "player-text",
        "turnIds": [
          "b15_post.L925"
        ]
      },
      {
        "line": 929,
        "sceneId": "b15_exit",
        "source": "（向北的山路在暮光里转入树林。身后还有货轮转动的声音。纱雾回望一次，继续向前。）",
        "classification": "player-text",
        "turnIds": [
          "b15_exit.L929"
        ]
      },
      {
        "line": 931,
        "sceneId": "b15_exit",
        "source": "纱雾：这回我知道下面有人住着了。",
        "classification": "player-text",
        "turnIds": [
          "b15_exit.L931"
        ]
      },
      {
        "line": 933,
        "sceneId": "b15_exit",
        "source": "璃：你以前也知道。",
        "classification": "player-text",
        "turnIds": [
          "b15_exit.L933"
        ]
      },
      {
        "line": 935,
        "sceneId": "b15_exit",
        "source": "纱雾：以前是地图上的字。现在我知道水壶挂在哪里。",
        "classification": "player-text",
        "turnIds": [
          "b15_exit.L935"
        ]
      },
      {
        "line": 941,
        "sceneId": "b16_enter",
        "source": "（次日下午，山路转入背阴处，湿地还未结冰。靠谷的石道较远，近处侧根两端都有旧石台。冷风从谷底上来。）",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L941"
        ]
      },
      {
        "line": 943,
        "sceneId": "b16_enter",
        "source": "纱雾：（搓了搓手指）这里比早上凉。",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L943"
        ]
      },
      {
        "line": 945,
        "sceneId": "b16_enter",
        "source": "璃：去背风处再看图。",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L945"
        ]
      },
      {
        "line": 947,
        "sceneId": "b16_enter",
        "source": "（两人在岩壁凹处停下，将图纸铺在干石上。）",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L947"
        ]
      },
      {
        "line": 949,
        "sceneId": "b16_enter",
        "source": "纱雾：第二个楔座在侧台。走过去能避开石道下的拖架。",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L949"
        ]
      },
      {
        "line": 951,
        "sceneId": "b16_enter",
        "source": "璃：先看它现在拖着什么。",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L951"
        ]
      },
      {
        "line": 953,
        "sceneId": "b16_enter",
        "source": "（石道下方，失控拖架把废弃货斗拉进通行道，又拖回去；普通路线确实可走，但必须解除占道的维护偶，不能在它运动时挤过。）",
        "classification": "player-text",
        "turnIds": [
          "b16_enter.L953"
        ]
      },
      {
        "line": 957,
        "sceneId": "b16_route",
        "source": "【动态提示：比较本处两路的敌人、战损、收益；使用根楔需一枚，无楔仍可选原路。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 959,
        "sceneId": "b16_route",
        "source": "消耗一枚：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 961,
        "sceneId": "b16_route",
        "source": "（两人固定侧根，先步行过岸。接应的工队沿已清开的路送来短桥板，将侧根与两端石台接平；最后在拖架转动范围外补上护栏。）",
        "classification": "split-transaction-prose",
        "turnIds": [
          "b16_route.L961",
          "b16_route.L961.2"
        ]
      },
      {
        "line": 963,
        "sceneId": "b16_route",
        "source": "工队住民：货斗够不到这里。铺完这段，轻车分批走；旧石道先拦着。",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L963"
        ]
      },
      {
        "line": 965,
        "sceneId": "b16_route",
        "source": "璃：（看着另一边仍在往返的拖架）旧口的标记别拆。它还没有停。",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L965"
        ]
      },
      {
        "line": 967,
        "sceneId": "b16_route",
        "source": "纱雾：我把新路和旧路分开画。回来的时候，不用凭印象找。",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L967"
        ]
      },
      {
        "line": 969,
        "sceneId": "b16_route",
        "source": "选择普通路并解除占道根偶后：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 971,
        "sceneId": "b16_route",
        "source": "（工队搬走废货斗与松动轨架，沿原石道推过一辆轻车。）",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L971"
        ]
      },
      {
        "line": 973,
        "sceneId": "b16_route",
        "source": "璃：现在不会横过来了。",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L973"
        ]
      },
      {
        "line": 975,
        "sceneId": "b16_route",
        "source": "纱雾：这条也接上了。我画给后面来的人。",
        "classification": "player-text",
        "turnIds": [
          "b16_route.L975"
        ]
      },
      {
        "line": 977,
        "sceneId": "b16_route",
        "source": "【即时状态：所选路线完成对应普通施工后，本段才开放公共通行。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 981,
        "sceneId": "b16_exit",
        "source": "（前方能看见温室的玻璃反光，绯叶站在门外，脚边放着准备移栽的土盆。）",
        "classification": "player-text",
        "turnIds": [
          "b16_exit.L981"
        ]
      },
      {
        "line": 983,
        "sceneId": "b16_exit",
        "source": "绯叶：我从村里的旧工用路来，刚才在候车屋接了一筐管套。这些盆也是大家分批抬来的。你们那边的路接上了？",
        "classification": "player-text",
        "turnIds": [
          "b16_exit.L983"
        ]
      },
      {
        "line": 985,
        "sceneId": "b16_exit",
        "source": "纱雾：接上了。我们把接好的路画给工队了。",
        "classification": "player-text",
        "turnIds": [
          "b16_exit.L985"
        ]
      },
      {
        "line": 987,
        "sceneId": "b16_exit",
        "source": "绯叶：那先洗手。里面有几盆，昨天才碰了一下就掉叶。",
        "classification": "player-text",
        "turnIds": [
          "b16_exit.L987"
        ]
      },
      {
        "line": 991,
        "sceneId": "b17_enter",
        "source": "（几排植物挂着简单标记，一些已移到土盆里。靠内侧的多年生植株开着细白花。）",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L991"
        ]
      },
      {
        "line": 993,
        "sceneId": "b17_enter",
        "source": "绯叶：外面这些耐得住，慢慢脱暖就能带走。种子也已收好了。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L993"
        ]
      },
      {
        "line": 995,
        "sceneId": "b17_enter",
        "source": "璃：那还需要两份暖脂的，是里面这些？",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L995"
        ]
      },
      {
        "line": 997,
        "sceneId": "b17_enter",
        "source": "绯叶：还有几个不结籽的品系。有些是慢慢分株养出来的，种子留不住它们现在的样子。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L997"
        ]
      },
      {
        "line": 999,
        "sceneId": "b17_enter",
        "source": "璃：加柴炉呢？",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L999"
        ]
      },
      {
        "line": 1001,
        "sceneId": "b17_enter",
        "source": "绯叶：外间用炉子，能留这些耐冷的。两份暖脂给的是里面那一小间，关好隔门，整冬慢慢放。那些白花经不起一会儿热、一会儿冷，也不能挨烟。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1001"
        ]
      },
      {
        "line": 1003,
        "sceneId": "b17_enter",
        "source": "（她将一盆挪进内间，又停下来，把它稍稍转了半圈。）",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1003"
        ]
      },
      {
        "line": 1005,
        "sceneId": "b17_enter",
        "source": "纱雾：这边也要朝光？",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1005"
        ]
      },
      {
        "line": 1007,
        "sceneId": "b17_enter",
        "source": "绯叶：这根侧枝只剩三个芽。它去年开了七朵，我还记着。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1007"
        ]
      },
      {
        "line": 1009,
        "sceneId": "b17_enter",
        "source": "（纱雾跟着数了一遍。）",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1009"
        ]
      },
      {
        "line": 1011,
        "sceneId": "b17_enter",
        "source": "璃：不放暖脂，能带走多少？",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1011"
        ]
      },
      {
        "line": 1013,
        "sceneId": "b17_enter",
        "source": "绯叶：外面这些，种子，能活的分株。里面有几样留不住。我会做标本。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1013"
        ]
      },
      {
        "line": 1015,
        "sceneId": "b17_enter",
        "source": "纱雾：树心窗外也有这朵。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1015"
        ]
      },
      {
        "line": 1017,
        "sceneId": "b17_enter",
        "source": "绯叶：从这里分过去的。你小时候老来问它什么时候再开。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1017"
        ]
      },
      {
        "line": 1019,
        "sceneId": "b17_enter",
        "source": "（她打开压花夹，纸还是空的。）",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1019"
        ]
      },
      {
        "line": 1021,
        "sceneId": "b17_enter",
        "source": "绯叶：我还没舍得摘。等你们看完别处再说。",
        "classification": "player-text",
        "turnIds": [
          "b17_enter.L1021"
        ]
      },
      {
        "line": 1025,
        "sceneId": "b17_offer",
        "source": "【动态提示：温室需两份可分配暖脂。展示余量、其余可行组合和不可收回；不足则禁用投入。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1027,
        "sceneId": "b17_offer",
        "source": "选择一：投入两份，保温室一冬。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1029,
        "sceneId": "b17_offer",
        "source": "绯叶：两份都放这里？",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1029"
        ]
      },
      {
        "line": 1031,
        "sceneId": "b17_offer",
        "source": "璃：嗯。别处少下来的，我们已经想过了。",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1031"
        ]
      },
      {
        "line": 1033,
        "sceneId": "b17_offer",
        "source": "（绯叶用指腹轻轻托开槽边的叶子，才接过暖脂。）",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1033"
        ]
      },
      {
        "line": 1035,
        "sceneId": "b17_offer",
        "source": "绯叶：好。今晚我把最后一道门缝封上。",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1035"
        ]
      },
      {
        "line": 1037,
        "sceneId": "b17_offer",
        "source": "（绯叶点头，把暖脂送进内侧慢释槽。璃扶稳盖板，纱雾读完低限温标，三人一起关上内门。）",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1037"
        ]
      },
      {
        "line": 1039,
        "sceneId": "b17_offer",
        "source": "绯叶：这一冬我来照看。春天以后，还得另想办法。",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1039"
        ]
      },
      {
        "line": 1041,
        "sceneId": "b17_offer",
        "source": "【即时状态：扣除两份可分配暖脂，温室保温成立。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1043,
        "sceneId": "b17_offer",
        "source": "选择二：先按普通办法保留植株，暖脂稍后决定。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1045,
        "sceneId": "b17_offer",
        "source": "璃：先不动盒子。能移的先移，等看过另外两处再回来。",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1045"
        ]
      },
      {
        "line": 1047,
        "sceneId": "b17_offer",
        "source": "绯叶：好。外面的盆现在就能搬，不用等你最后选完才干活。",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1047"
        ]
      },
      {
        "line": 1049,
        "sceneId": "b17_offer",
        "source": "（纱雾与璃各端起一个普通土盆，按绯叶指出的位置放到避风廊下。）",
        "classification": "player-text",
        "turnIds": [
          "b17_offer.L1049"
        ]
      },
      {
        "line": 1051,
        "sceneId": "b17_offer",
        "source": "【即时状态：未投入，可回访。普通移栽继续进行。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1055,
        "sceneId": "b17_revisit",
        "source": "已投入：绯叶：温标很稳。别再开内门，热留给里面。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b17_revisit.L1055"
        ]
      },
      {
        "line": 1057,
        "sceneId": "b17_revisit",
        "source": "未投入且可用足够：绯叶：槽还空着。要用那两份，还是先留着？",
        "classification": "conditional-player-text",
        "turnIds": [
          "b17_revisit.L1057"
        ]
      },
      {
        "line": 1059,
        "sceneId": "b17_revisit",
        "source": "未投入且可用不足：绯叶：不够两份了，就照说好的取种、移栽。你们来时帮我端一盆。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b17_revisit.L1059"
        ]
      },
      {
        "line": 1063,
        "sceneId": "b18_enter",
        "source": "（温室外的坡地上有一棵低而偏斜的梨树。粗枝留下两道旧绳磨过的痕迹，绳早已不在。树下露着被坐得发亮的平根。）",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1063"
        ]
      },
      {
        "line": 1065,
        "sceneId": "b18_enter",
        "source": "纱雾：这里比我记得的小。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1065"
        ]
      },
      {
        "line": 1067,
        "sceneId": "b18_enter",
        "source": "璃：是我们长高了。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1067"
        ]
      },
      {
        "line": 1069,
        "sceneId": "b18_enter",
        "source": "纱雾：你那时总坐右边，觉得靠近路口，喊一声就有人看见。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1069"
        ]
      },
      {
        "line": 1071,
        "sceneId": "b18_enter",
        "source": "璃：左边会有树皮掉到领子里。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1071"
        ]
      },
      {
        "line": 1073,
        "sceneId": "b18_enter",
        "source": "（纱雾走到左边，用手拢住裙摆，坐在露出的平根旁。璃在她身边蹲下。）",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1073"
        ]
      },
      {
        "line": 1075,
        "sceneId": "b18_enter",
        "source": "纱雾：我还以为你是故意把难坐的位置让给我。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1075"
        ]
      },
      {
        "line": 1077,
        "sceneId": "b18_enter",
        "source": "璃：也不是完全没有。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1077"
        ]
      },
      {
        "line": 1079,
        "sceneId": "b18_enter",
        "source": "（纱雾用肩轻碰了一下璃，又看回树上的旧绳痕。）",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1079"
        ]
      },
      {
        "line": 1081,
        "sceneId": "b18_enter",
        "source": "绯叶：（停在几步外，拨开一小片根土）它是个暖生老品种，根这些年又坏了一半。外头还看着绿，底下已经离不开那条暖根。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1081"
        ]
      },
      {
        "line": 1083,
        "sceneId": "b18_enter",
        "source": "璃：现在就包起来，慢慢停暖呢？",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1083"
        ]
      },
      {
        "line": 1085,
        "sceneId": "b18_enter",
        "source": "绯叶：挡风的东西我备好了，可光包住不够。底下得跟着旧根槽缓缓降下来，才好分根移栽。我们现成能用的，就是这一份暖脂。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1085"
        ]
      },
      {
        "line": 1087,
        "sceneId": "b18_enter",
        "source": "纱雾：一份用完，它就能过冬？",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1087"
        ]
      },
      {
        "line": 1089,
        "sceneId": "b18_enter",
        "source": "绯叶：这次移栽能做完，根能保下来。开春别急着要它结果。先让它活稳。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1089"
        ]
      },
      {
        "line": 1091,
        "sceneId": "b18_enter",
        "source": "璃：不用呢？",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1091"
        ]
      },
      {
        "line": 1093,
        "sceneId": "b18_enter",
        "source": "绯叶：我能留下枝样，木料以后也能用。但这棵树，照我们现在的条件，留不住。不是今晚就倒；停暖以后，它会一点点干下去。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1093"
        ]
      },
      {
        "line": 1095,
        "sceneId": "b18_enter",
        "source": "（纱雾拂去树根上的一点土，没有把露出的地方重新踩实。）",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1095"
        ]
      },
      {
        "line": 1097,
        "sceneId": "b18_enter",
        "source": "绯叶：你们坐一会儿。我去看看门里那几盆。",
        "classification": "player-text",
        "turnIds": [
          "b18_enter.L1097"
        ]
      },
      {
        "line": 1101,
        "sceneId": "b18_private",
        "source": "纱雾：我想留。刚才一听见可以移栽，心里先松了一下。",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1101"
        ]
      },
      {
        "line": 1103,
        "sceneId": "b18_private",
        "source": "璃：那就——",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1103"
        ]
      },
      {
        "line": 1105,
        "sceneId": "b18_private",
        "source": "纱雾：可我也看见温室了。绯叶连那根枝条开过几朵花都记得。",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1105"
        ]
      },
      {
        "line": 1107,
        "sceneId": "b18_private",
        "source": "（她低头摸到旧绳磨出的浅沟。）",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1107"
        ]
      },
      {
        "line": 1109,
        "sceneId": "b18_private",
        "source": "纱雾：别光因为我想留，就答应。图上还有石屋，得一起想。",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1109"
        ]
      },
      {
        "line": 1111,
        "sceneId": "b18_private",
        "source": "璃：（坐到她旁边）我也想留。",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1111"
        ]
      },
      {
        "line": 1113,
        "sceneId": "b18_private",
        "source": "（纱雾轻轻碰了碰她的肩。）",
        "classification": "player-text",
        "turnIds": [
          "b18_private.L1113"
        ]
      },
      {
        "line": 1117,
        "sceneId": "b18_offer",
        "source": "【动态提示：梨树需一份，展示余量与被排除的组合；投入保证脱暖移栽完成，不随机失败，也不保证来年结果。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1119,
        "sceneId": "b18_offer",
        "source": "选择一：投入一份，帮助梨树脱暖与移栽。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1121,
        "sceneId": "b18_offer",
        "source": "璃：留它。我也想再看到它。",
        "classification": "player-text",
        "turnIds": [
          "b18_offer.L1121"
        ]
      },
      {
        "line": 1123,
        "sceneId": "b18_offer",
        "source": "纱雾：那等它搬好了，我们去新地方坐。别让它还留在这里受风。",
        "classification": "player-text",
        "turnIds": [
          "b18_offer.L1123"
        ]
      },
      {
        "line": 1125,
        "sceneId": "b18_offer",
        "source": "（璃取出一份暖脂。绯叶回来接手根槽，三人按事先说好的方法围好根土。后续搬运由已到位的工队完成。）",
        "classification": "player-text",
        "turnIds": [
          "b18_offer.L1125"
        ]
      },
      {
        "line": 1127,
        "sceneId": "b18_offer",
        "source": "【即时状态：扣除一份可分配暖脂，脱暖与移栽成立。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1129,
        "sceneId": "b18_offer",
        "source": "选择二：暂不投入，先看完另一处。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1131,
        "sceneId": "b18_offer",
        "source": "璃：先去看半山的屋子。回来之前，我们不替这棵树说最后一句。",
        "classification": "player-text",
        "turnIds": [
          "b18_offer.L1131"
        ]
      },
      {
        "line": 1133,
        "sceneId": "b18_offer",
        "source": "纱雾：（起身拍掉手上的土）好。它也不是现在就要消失。",
        "classification": "player-text",
        "turnIds": [
          "b18_offer.L1133"
        ]
      },
      {
        "line": 1135,
        "sceneId": "b18_offer",
        "source": "【即时状态：不消费，可以回访。此时不砍树、不提前生成坐凳；最终放弃后才在尾声执行木料利用。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1139,
        "sceneId": "b18_revisit",
        "source": "已投入：纱雾：绯叶开始围根土了。我们别再坐这里，会压到移栽绳。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b18_revisit.L1139"
        ]
      },
      {
        "line": 1141,
        "sceneId": "b18_revisit",
        "source": "未投入且可用足够：璃：还可以留。代价和刚才一样，不会因为我们回来就变轻。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b18_revisit.L1141"
        ]
      },
      {
        "line": 1143,
        "sceneId": "b18_revisit",
        "source": "未投入且可用不足：纱雾：我知道用到哪里去了。让我坐一会儿，坐完再走。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b18_revisit.L1143"
        ]
      },
      {
        "line": 1145,
        "sceneId": "b18_revisit",
        "source": "（两人安静坐了一会儿。）",
        "classification": "player-text",
        "turnIds": [
          "b18_revisit.L1145"
        ]
      },
      {
        "line": 1149,
        "sceneId": "b19_enter",
        "source": "（石屋厚墙里嵌着旧暖脂槽。门前清出的平地能停两三辆轻车，炉边备着劈柴，窗扇已修好。）",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1149"
        ]
      },
      {
        "line": 1151,
        "sceneId": "b19_enter",
        "source": "工队住民：门和烟道都修好了。暖脂槽也还完整。",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1151"
        ]
      },
      {
        "line": 1153,
        "sceneId": "b19_enter",
        "source": "璃：两份放在这里，能多做什么？",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1153"
        ]
      },
      {
        "line": 1155,
        "sceneId": "b19_enter",
        "source": "工队住民：墙和地面整冬留一点底温，水壶不结冰，进门不用从头烧。要坐暖、煮茶，仍得添柴。",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1155"
        ]
      },
      {
        "line": 1157,
        "sceneId": "b19_enter",
        "source": "纱雾：不用它呢？",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1157"
        ]
      },
      {
        "line": 1159,
        "sceneId": "b19_enter",
        "source": "工队住民：门窗已经修了，柴炉也能用。我们按白天几班走，有人先来点火，天气坏就少走一趟。就是等屋里暖起来，得多穿着衣服坐一会儿。",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1159"
        ]
      },
      {
        "line": 1161,
        "sceneId": "b19_enter",
        "source": "（璃拿起桌上的空杯，杯底凉得像门外的石头。）",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1161"
        ]
      },
      {
        "line": 1163,
        "sceneId": "b19_enter",
        "source": "璃：谁先来点火？",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1163"
        ]
      },
      {
        "line": 1165,
        "sceneId": "b19_enter",
        "source": "工队住民：住近处的几户轮着来。暖脂放不放，我们都得有人关门、扫雪。他们商量的是这一冬，明年开春再排。",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1165"
        ]
      },
      {
        "line": 1167,
        "sceneId": "b19_enter",
        "source": "纱雾：等开课以后，我往返也会经过这里。",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1167"
        ]
      },
      {
        "line": 1169,
        "sceneId": "b19_enter",
        "source": "（她把杯子并回另一只旁边，先没有去碰节火匣。）",
        "classification": "player-text",
        "turnIds": [
          "b19_enter.L1169"
        ]
      },
      {
        "line": 1173,
        "sceneId": "b19_offer",
        "source": "【动态提示：暖屋需两份，展示余量、组合后果和不可收回；未投入仍用普通柴炉与日间通行，无隐藏伤亡。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1175,
        "sceneId": "b19_offer",
        "source": "选择一：投入两份，保住一冬的低暖歇脚处。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1177,
        "sceneId": "b19_offer",
        "source": "璃：这两份给这里。其他地方，我们照不投入的办法做。",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1177"
        ]
      },
      {
        "line": 1179,
        "sceneId": "b19_offer",
        "source": "（工人打开检修盖，纱雾确认槽壁完整。放入暖脂后，石墙缓慢升温。）",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1179"
        ]
      },
      {
        "line": 1181,
        "sceneId": "b19_offer",
        "source": "工队住民：我会把使用和看炉的人手一起说清楚。暖的屋子，也得有人把门关好。",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1181"
        ]
      },
      {
        "line": 1183,
        "sceneId": "b19_offer",
        "source": "纱雾：（把杯子放回桌面）下次有人来，就能在这里多坐一会儿。",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1183"
        ]
      },
      {
        "line": 1185,
        "sceneId": "b19_offer",
        "source": "【即时状态：扣除两份可分配暖脂，暖屋底温成立。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1187,
        "sceneId": "b19_offer",
        "source": "选择二：保留普通方案，暖脂先不动。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1189,
        "sceneId": "b19_offer",
        "source": "璃：先按日间通行排。炉子和柴都照常准备，别等着我们。",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1189"
        ]
      },
      {
        "line": 1191,
        "sceneId": "b19_offer",
        "source": "工队住民：本来就在做。你们回来时，门轴的油也该上好了。",
        "classification": "player-text",
        "turnIds": [
          "b19_offer.L1191"
        ]
      },
      {
        "line": 1193,
        "sceneId": "b19_offer",
        "source": "【即时状态：不消费，可回访；普通方案持续施工。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1197,
        "sceneId": "b19_revisit",
        "source": "已投入：工队住民：墙热起来了。坐一会儿可以，别靠着炉子睡。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b19_revisit.L1197"
        ]
      },
      {
        "line": 1199,
        "sceneId": "b19_revisit",
        "source": "未投入：工队住民：门不响了，日间班次也排好。暖槽还空着，要不要用，看看余量再定。",
        "classification": "conditional-player-text",
        "turnIds": [
          "b19_revisit.L1199"
        ]
      },
      {
        "line": 1203,
        "sceneId": "b20_enter",
        "source": "（闸室嵌在山壁里，透过窄窗能看见涧对面的树心外墙；中间断岩不通行，回村仍要沿北脊绕行。两座旧设施之间有一条早年穿岩铺设的金属通话管，只连接这两个固定端口。）",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1203"
        ]
      },
      {
        "line": 1205,
        "sceneId": "b20_enter",
        "source": "纱雾：（敲了两下管口）老师？我们到北枝了。",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1205"
        ]
      },
      {
        "line": 1207,
        "sceneId": "b20_enter",
        "source": "（管里先传来模糊的衣料声，然后是诺克缇娅的声音。）",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1207"
        ]
      },
      {
        "line": 1209,
        "sceneId": "b20_enter",
        "source": "诺克缇娅：听得见。你们的门关上，外面的风会把声音盖掉。",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1209"
        ]
      },
      {
        "line": 1211,
        "sceneId": "b20_enter",
        "source": "璃：（关门）这里也有人新换了支架。",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1211"
        ]
      },
      {
        "line": 1213,
        "sceneId": "b20_enter",
        "source": "诺克缇娅：工队早上装的。他们从村里背工具过来，支架拆成几件才抬得动。现在先看回水，别急着下暖脂。",
        "classification": "player-text",
        "turnIds": [
          "b20_enter.L1213"
        ]
      },
      {
        "line": 1217,
        "sceneId": "b20_valve",
        "source": "（纱雾用星盘确认方向，璃检查机械卡槽。第三份主路暖脂缓慢送入；根环松开，水面先短暂升高，随后回到标线内。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1217"
        ]
      },
      {
        "line": 1219,
        "sceneId": "b20_valve",
        "source": "纱雾：这支流闭合了，回水也平了。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1219"
        ]
      },
      {
        "line": 1221,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：好。保持锁柄不动，等我这边温标降下去。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1221"
        ]
      },
      {
        "line": 1223,
        "sceneId": "b20_valve",
        "source": "（璃握稳锁柄。纱雾盯着温标，过了一会儿，却低头看了一眼节火匣。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1223"
        ]
      },
      {
        "line": 1225,
        "sceneId": "b20_valve",
        "source": "纱雾：老师，要是我回来多守一阵……",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1225"
        ]
      },
      {
        "line": 1227,
        "sceneId": "b20_valve",
        "source": "（话刚出口，她自己停住了。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1227"
        ]
      },
      {
        "line": 1229,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：多守一阵，做什么？",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1229"
        ]
      },
      {
        "line": 1231,
        "sceneId": "b20_valve",
        "source": "纱雾：我知道。不会多出暖脂，也不能再让树过一个这样的冬天。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1231"
        ]
      },
      {
        "line": 1233,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：那你刚才想到什么了？",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1233"
        ]
      },
      {
        "line": 1235,
        "sceneId": "b20_valve",
        "source": "纱雾：梨树。还有那几盆白花。我走到一个地方，就想把它留下。好像只要我说我不走了，你就能答应。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1235"
        ]
      },
      {
        "line": 1237,
        "sceneId": "b20_valve",
        "source": "（管口那边安静了一阵。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1237"
        ]
      },
      {
        "line": 1239,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：我也想答应。窗外那盆，我养了九年。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1239"
        ]
      },
      {
        "line": 1241,
        "sceneId": "b20_valve",
        "source": "纱雾：我不知道。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1241"
        ]
      },
      {
        "line": 1243,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：你第一次来值房，问过我它是不是纸做的。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1243"
        ]
      },
      {
        "line": 1245,
        "sceneId": "b20_valve",
        "source": "（纱雾按住嘴角，笑意没能停很久。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1245"
        ]
      },
      {
        "line": 1247,
        "sceneId": "b20_valve",
        "source": "纱雾：我还想去河谷。这样说出来，好像很贪心。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1247"
        ]
      },
      {
        "line": 1249,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：你想去做什么？",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1249"
        ]
      },
      {
        "line": 1251,
        "sceneId": "b20_valve",
        "source": "璃：（仍握着锁柄）她找了一间温——",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1251"
        ]
      },
      {
        "line": 1253,
        "sceneId": "b20_valve",
        "source": "纱雾：我自己说。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1253"
        ]
      },
      {
        "line": 1255,
        "sceneId": "b20_valve",
        "source": "（璃停下。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1255"
        ]
      },
      {
        "line": 1257,
        "sceneId": "b20_valve",
        "source": "纱雾：照料普通温室。一季，已经谈好了。春天回来试种。我就是想学。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1257"
        ]
      },
      {
        "line": 1259,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：那把到的日子告诉人家。别像我，茶买了，回家的日子一年没定。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1259"
        ]
      },
      {
        "line": 1261,
        "sceneId": "b20_valve",
        "source": "（纱雾看着温标，等红线完全稳住，才松开一直拢着匣角的手。）",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1261"
        ]
      },
      {
        "line": 1263,
        "sceneId": "b20_valve",
        "source": "诺克缇娅：锁柄可以松手。纱雾，把门关好再走。你们不必为了陪我说话，一直站在风口。",
        "classification": "player-text",
        "turnIds": [
          "b20_valve.L1263"
        ]
      },
      {
        "line": 1265,
        "sceneId": "b20_valve",
        "source": "【即时状态：第三支阀关闭，扣除一份保留暖脂。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1269,
        "sceneId": "b20_exit",
        "source": "（到了闸室门边，璃停了一下。）",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1269"
        ]
      },
      {
        "line": 1271,
        "sceneId": "b20_exit",
        "source": "璃：刚才我替你说了。",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1271"
        ]
      },
      {
        "line": 1273,
        "sceneId": "b20_exit",
        "source": "纱雾：我知道你是想帮忙。",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1273"
        ]
      },
      {
        "line": 1275,
        "sceneId": "b20_exit",
        "source": "璃：下回我等你先说。",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1275"
        ]
      },
      {
        "line": 1277,
        "sceneId": "b20_exit",
        "source": "纱雾：（把地图转向山脊）也不用什么都等。那边的门，帮我扶一下。",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1277"
        ]
      },
      {
        "line": 1279,
        "sceneId": "b20_exit",
        "source": "（璃扶住重门，等纱雾过去再关好。两人踏上北脊的石阶。）",
        "classification": "player-text",
        "turnIds": [
          "b20_exit.L1279"
        ]
      },
      {
        "line": 1285,
        "sceneId": "b21_enter",
        "source": "（山脊的风把防风布压向同一侧。高处岩台上，旧张索偶不断收紧连着上段护栏的绳，几根栏柱已经倾斜。下方背风台与它之间隔着岩脊，台上的旧石栏尚好；由近岸岩座伸向背风台的侧根轻轻晃动。）",
        "classification": "player-text",
        "turnIds": [
          "b21_enter.L1285"
        ]
      },
      {
        "line": 1287,
        "sceneId": "b21_enter",
        "source": "纱雾：绳只剩这一段还连着。上面不能让人过去。",
        "classification": "player-text",
        "turnIds": [
          "b21_enter.L1287"
        ]
      },
      {
        "line": 1289,
        "sceneId": "b21_enter",
        "source": "璃：从侧根绕下去呢？",
        "classification": "player-text",
        "turnIds": [
          "b21_enter.L1289"
        ]
      },
      {
        "line": 1291,
        "sceneId": "b21_enter",
        "source": "纱雾：固定住，再接上桥板，就能接到下面的石栏。上面的绳拉不到它。",
        "classification": "player-text",
        "turnIds": [
          "b21_enter.L1291"
        ]
      },
      {
        "line": 1295,
        "sceneId": "b21_route",
        "source": "【动态提示：比较两路固定代价；用楔一枚，原路敌人保留。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1297,
        "sceneId": "b21_route",
        "source": "有楔并使用：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1299,
        "sceneId": "b21_route",
        "source": "（缚根楔嵌入岩座。两人走到背风台，招手示意工队从已经稳住的一侧接近。短板接平台口，普通斜撑顶进岩座，栏绳沿下方接好。）",
        "classification": "split-transaction-prose",
        "turnIds": [
          "b21_route.L1299",
          "b21_route.L1299.2"
        ]
      },
      {
        "line": 1301,
        "sceneId": "b21_route",
        "source": "璃：以后往返走下面。上段旧口留着拦绳，那架张索偶还在动。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1301"
        ]
      },
      {
        "line": 1303,
        "sceneId": "b21_route",
        "source": "工队住民：知道。雪天也不借那边抄近路。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1303"
        ]
      },
      {
        "line": 1305,
        "sceneId": "b21_route",
        "source": "纱雾：（把通行线沿背风台改过）这段接上了。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1305"
        ]
      },
      {
        "line": 1307,
        "sceneId": "b21_route",
        "source": "不用楔，走主石道战前：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1309,
        "sceneId": "b21_route",
        "source": "璃：先拆驱动，再松绳。绳在吃力的时候，别站在它回弹的方向。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1309"
        ]
      },
      {
        "line": 1311,
        "sceneId": "b21_route",
        "source": "纱雾：我看着张力。你听见我叫，就别往内侧退。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1311"
        ]
      },
      {
        "line": 1313,
        "sceneId": "b21_route",
        "source": "主石道战后：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1315,
        "sceneId": "b21_route",
        "source": "（张索偶停下，璃与工人分段放松绳索、扶正残存栏杆。没有被战斗破坏的栏杆可以继续使用。）",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1315"
        ]
      },
      {
        "line": 1317,
        "sceneId": "b21_route",
        "source": "纱雾：松开一点，反而稳了。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1317"
        ]
      },
      {
        "line": 1319,
        "sceneId": "b21_route",
        "source": "璃：它原先就是这样用的。",
        "classification": "player-text",
        "turnIds": [
          "b21_route.L1319"
        ]
      },
      {
        "line": 1323,
        "sceneId": "b21_exit",
        "source": "（到达背风处，纱雾捏紧的手指终于松开。她没有立刻说话，先把呼吸放缓。）",
        "classification": "player-text",
        "turnIds": [
          "b21_exit.L1323"
        ]
      },
      {
        "line": 1325,
        "sceneId": "b21_exit",
        "source": "璃：还走得动？",
        "classification": "player-text",
        "turnIds": [
          "b21_exit.L1325"
        ]
      },
      {
        "line": 1327,
        "sceneId": "b21_exit",
        "source": "纱雾：走得动。我要先把刚才想说的话记牢。",
        "classification": "player-text",
        "turnIds": [
          "b21_exit.L1327"
        ]
      },
      {
        "line": 1329,
        "sceneId": "b21_exit",
        "source": "璃：跟米露说的？",
        "classification": "player-text",
        "turnIds": [
          "b21_exit.L1329"
        ]
      },
      {
        "line": 1331,
        "sceneId": "b21_exit",
        "source": "纱雾：嗯。免得一见到她，我又先问缺不缺人。",
        "classification": "player-text",
        "turnIds": [
          "b21_exit.L1331"
        ]
      },
      {
        "line": 1335,
        "sceneId": "b22_enter",
        "source": "（米露在驿台检查回村的工料，盾靠在腿边。她见到两人，先把手里的绳卷收紧。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1335"
        ]
      },
      {
        "line": 1337,
        "sceneId": "b22_enter",
        "source": "米露：东边的支架到了，前头到上门也查过了。你们——",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1337"
        ]
      },
      {
        "line": 1339,
        "sceneId": "b22_enter",
        "source": "纱雾：米露，我想先说一件自己的事。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1339"
        ]
      },
      {
        "line": 1341,
        "sceneId": "b22_enter",
        "source": "（米露抬起头。璃退到一旁，把门口挡路的工具箱挪开，留在听得见的地方。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1341"
        ]
      },
      {
        "line": 1343,
        "sceneId": "b22_enter",
        "source": "米露：你说。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1343"
        ]
      },
      {
        "line": 1345,
        "sceneId": "b22_enter",
        "source": "纱雾：这次停暖，我做到总阀关好。之后我去河谷学一季，第一场雪前后去。学舍、苗圃和家家户户的温标，我不能再像以前那样，谁一叫就过去。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1345"
        ]
      },
      {
        "line": 1347,
        "sceneId": "b22_enter",
        "source": "（米露的手还握着绳卷。过了片刻，她才把绳放下。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1347"
        ]
      },
      {
        "line": 1349,
        "sceneId": "b22_enter",
        "source": "米露：我昨天还把学舍那一份算在你身上。那里的老人认识你，你去，他们肯听。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1349"
        ]
      },
      {
        "line": 1351,
        "sceneId": "b22_enter",
        "source": "纱雾：我知道。所以我一直不敢先说。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1351"
        ]
      },
      {
        "line": 1353,
        "sceneId": "b22_enter",
        "source": "米露：早两天说，我就……",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1353"
        ]
      },
      {
        "line": 1355,
        "sceneId": "b22_enter",
        "source": "（她说到一半，看见纱雾收紧了手，停了一下。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1355"
        ]
      },
      {
        "line": 1357,
        "sceneId": "b22_enter",
        "source": "米露：算了。我现在知道了。你走以前，教他们认两次标记，行不行？我找两个人跟着学。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1357"
        ]
      },
      {
        "line": 1359,
        "sceneId": "b22_enter",
        "source": "纱雾：行。两次做完，平时轮谁来看，你们自己排。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1359"
        ]
      },
      {
        "line": 1361,
        "sceneId": "b22_enter",
        "source": "米露：嗯。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1361"
        ]
      },
      {
        "line": 1363,
        "sceneId": "b22_enter",
        "source": "（门外的人喊了一声要借短绳。米露把手里的递出去，回来时仍皱着眉，却把图上纱雾名字旁的一笔划掉了。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1363"
        ]
      },
      {
        "line": 1365,
        "sceneId": "b22_enter",
        "source": "米露：头几天估计乱一点。你别听见乱，就又全接回去。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1365"
        ]
      },
      {
        "line": 1367,
        "sceneId": "b22_enter",
        "source": "纱雾：你也别每次都来问我“就今天”。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1367"
        ]
      },
      {
        "line": 1369,
        "sceneId": "b22_enter",
        "source": "（两人看了对方一眼。）",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1369"
        ]
      },
      {
        "line": 1371,
        "sceneId": "b22_enter",
        "source": "米露：好。你记着，我也记着。",
        "classification": "player-text",
        "turnIds": [
          "b22_enter.L1371"
        ]
      },
      {
        "line": 1375,
        "sceneId": "b22_after",
        "source": "（纱雾去跟工人核对水管标记。米露叫住璃。）",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1375"
        ]
      },
      {
        "line": 1377,
        "sceneId": "b22_after",
        "source": "米露：你早知道她要走？",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1377"
        ]
      },
      {
        "line": 1379,
        "sceneId": "b22_after",
        "source": "璃：比你早一点。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1379"
        ]
      },
      {
        "line": 1381,
        "sceneId": "b22_after",
        "source": "米露：怎么没先跟我说？",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1381"
        ]
      },
      {
        "line": 1383,
        "sceneId": "b22_after",
        "source": "璃：她想自己说。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1383"
        ]
      },
      {
        "line": 1385,
        "sceneId": "b22_after",
        "source": "（米露看了看正在指温标的纱雾，尾巴轻轻放到椅腿旁。）",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1385"
        ]
      },
      {
        "line": 1387,
        "sceneId": "b22_after",
        "source": "米露：以前我总觉得，问“能不能再帮一下”没什么。她一答应，我就放心了。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1387"
        ]
      },
      {
        "line": 1389,
        "sceneId": "b22_after",
        "source": "璃：现在她没答应。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1389"
        ]
      },
      {
        "line": 1391,
        "sceneId": "b22_after",
        "source": "米露：嗯，我得自己把剩下的排出来。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1391"
        ]
      },
      {
        "line": 1393,
        "sceneId": "b22_after",
        "source": "璃：你也想下山？",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1393"
        ]
      },
      {
        "line": 1395,
        "sceneId": "b22_after",
        "source": "米露：想。货路刚通，当然还得忙一阵。但等第一轮巡护稳了，我也要去买点不用替别人捎的东西。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1395"
        ]
      },
      {
        "line": 1397,
        "sceneId": "b22_after",
        "source": "璃：那你想好了再告诉一起排班的人。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1397"
        ]
      },
      {
        "line": 1399,
        "sceneId": "b22_after",
        "source": "米露：（看她一眼）你刚学会的话，就拿来教我了？",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1399"
        ]
      },
      {
        "line": 1401,
        "sceneId": "b22_after",
        "source": "璃：是。",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1401"
        ]
      },
      {
        "line": 1403,
        "sceneId": "b22_after",
        "source": "（米露终于笑了一下，拿起桌上的巡路图。）",
        "classification": "player-text",
        "turnIds": [
          "b22_after.L1403"
        ]
      },
      {
        "line": 1407,
        "sceneId": "b23_enter",
        "source": "【入口条件：外部环路各段已清障或完成所选根楔旁路施工，详见文末；不要求尚未发生的 24 库房取材或 25 第四阀。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1409,
        "sceneId": "b23_enter",
        "source": "（上门前，小车一辆辆试过转角。有人往回程车上放行李，也有人把卸下的冬柴搬进自家院子。）",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1409"
        ]
      },
      {
        "line": 1411,
        "sceneId": "b23_enter",
        "source": "b01 中的住民：河谷的屋子看好了。我先带这两包，剩下的下趟搬。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1411"
        ]
      },
      {
        "line": 1413,
        "sceneId": "b23_enter",
        "source": "抱窗框的住民：我还是住上面。学舍给我留了位置，太冷的时候去那里。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1413"
        ]
      },
      {
        "line": 1415,
        "sceneId": "b23_enter",
        "source": "另一位住民：我先住河谷，家里的活有空就回来做。这条路你们还得多走几趟，看看雨后会不会松。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1415"
        ]
      },
      {
        "line": 1417,
        "sceneId": "b23_enter",
        "source": "璃：会。工队也会看，不只等我们。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1417"
        ]
      },
      {
        "line": 1419,
        "sceneId": "b23_enter",
        "source": "（纱雾侧过身，让一辆轻车过去。车上是她在河谷见过的那批门板。）",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1419"
        ]
      },
      {
        "line": 1421,
        "sceneId": "b23_enter",
        "source": "纱雾：它们真的到了。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1421"
        ]
      },
      {
        "line": 1423,
        "sceneId": "b23_enter",
        "source": "璃：你亲眼看着装上去的。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1423"
        ]
      },
      {
        "line": 1425,
        "sceneId": "b23_enter",
        "source": "纱雾：可见到它们在这里，还是不一样。",
        "classification": "player-text",
        "turnIds": [
          "b23_enter.L1425"
        ]
      },
      {
        "line": 1429,
        "sceneId": "b23_home",
        "source": "（一位住民在上门旁犹豫，手里拿着空行囊。）",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1429"
        ]
      },
      {
        "line": 1431,
        "sceneId": "b23_home",
        "source": "住民：我还没决定。",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1431"
        ]
      },
      {
        "line": 1433,
        "sceneId": "b23_home",
        "source": "米露：今天先跟到候车屋，看看路。回来再说。基础住处给你留着，不催你把屋里的东西全装起来。",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1433"
        ]
      },
      {
        "line": 1435,
        "sceneId": "b23_home",
        "source": "住民：如果我冬里又想回来了呢？",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1435"
        ]
      },
      {
        "line": 1437,
        "sceneId": "b23_home",
        "source": "米露：选个合适的天气，先跟下面打声招呼，别摸黑自己走。路修来就是要走的，不是出去一次就封上。",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1437"
        ]
      },
      {
        "line": 1439,
        "sceneId": "b23_home",
        "source": "（璃站在门侧，第一次没有替那位住民接下选择。）",
        "classification": "player-text",
        "turnIds": [
          "b23_home.L1439"
        ]
      },
      {
        "line": 1443,
        "sceneId": "b23_shawu_reply",
        "source": "选择一：璃主动说她在学习什么。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1445,
        "sceneId": "b23_shawu_reply",
        "source": "璃：刚回来那天，我真觉得把大家带走就好了。",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1445"
        ]
      },
      {
        "line": 1447,
        "sceneId": "b23_shawu_reply",
        "source": "纱雾：现在呢？",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1447"
        ]
      },
      {
        "line": 1449,
        "sceneId": "b23_shawu_reply",
        "source": "璃：现在觉得我得先站开一点，别堵着他们自己走的门。",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1449"
        ]
      },
      {
        "line": 1451,
        "sceneId": "b23_shawu_reply",
        "source": "纱雾：站这边。你还是有点挡路。",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1451"
        ]
      },
      {
        "line": 1453,
        "sceneId": "b23_shawu_reply",
        "source": "（璃挪了一步，两人一同笑起来。）",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1453"
        ]
      },
      {
        "line": 1455,
        "sceneId": "b23_shawu_reply",
        "source": "选择二：先问纱雾想去哪里。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1457,
        "sceneId": "b23_shawu_reply",
        "source": "璃：我们先去树心，还是先回你家？",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1457"
        ]
      },
      {
        "line": 1459,
        "sceneId": "b23_shawu_reply",
        "source": "纱雾：去学舍。我答应的两次教温标，先约好时间。然后回家收拾一格抽屉。",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1459"
        ]
      },
      {
        "line": 1461,
        "sceneId": "b23_shawu_reply",
        "source": "璃：只一格？",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1461"
        ]
      },
      {
        "line": 1463,
        "sceneId": "b23_shawu_reply",
        "source": "纱雾：我还没住过那么久的客舍。不知道自己想带多少东西。",
        "classification": "player-text",
        "turnIds": [
          "b23_shawu_reply.L1463"
        ]
      },
      {
        "line": 1465,
        "sceneId": "b23_shawu_reply",
        "source": "（合流，无属性差异。）",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1469,
        "sceneId": "b24_enter",
        "source": "（干根库外是最后一处可固定的侧根岩座。库门前的装卸支道被一架失控压材偶占住；它往返压平已经空掉的料槽，活动臂扫过进门的宽道。）",
        "classification": "player-text",
        "turnIds": [
          "b24_enter.L1469"
        ]
      },
      {
        "line": 1471,
        "sceneId": "b24_enter",
        "source": "工队住民：冬用支架都领出去了，还剩检修道要换的扶手。主门被它扫着，侧口的根又在晃，木料抬不出来。",
        "classification": "player-text",
        "turnIds": [
          "b24_enter.L1471"
        ]
      },
      {
        "line": 1473,
        "sceneId": "b24_enter",
        "source": "璃：侧根后面，是原来的卸木平台？",
        "classification": "player-text",
        "turnIds": [
          "b24_enter.L1473"
        ]
      },
      {
        "line": 1475,
        "sceneId": "b24_enter",
        "source": "工队住民：对。平台和侧门都够抬长料，两头也有石座。先把这根固定，铺上现成的短板，就能从侧口抬。否则得让压材偶停下，走正门。",
        "classification": "player-text",
        "turnIds": [
          "b24_enter.L1475"
        ]
      },
      {
        "line": 1479,
        "sceneId": "b24_route",
        "source": "【动态提示：最后楔点，比较正门与侧口；列出本处有限补给。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1481,
        "sceneId": "b24_route",
        "source": "使用根楔后：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1483,
        "sceneId": "b24_route",
        "source": "（侧根固定后，工人将岸边备好的短板铺上，先抬一根空扁担试过转角，再两人合力搬出扶手。正门外的拦绳仍在，压材偶的木臂没有越过石墙。）",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1483"
        ]
      },
      {
        "line": 1485,
        "sceneId": "b24_route",
        "source": "璃：侧口转得开。正门还不行，别为了少走两步钻进去。",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1485"
        ]
      },
      {
        "line": 1487,
        "sceneId": "b24_route",
        "source": "纱雾：我在门外留了标记。来换下一根扶手，也从这边。",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1487"
        ]
      },
      {
        "line": 1489,
        "sceneId": "b24_route",
        "source": "选择主门战前：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1491,
        "sceneId": "b24_route",
        "source": "璃：我从它压下去以后接近。木料先别碰，免得它转过来追着料槽走。",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1491"
        ]
      },
      {
        "line": 1493,
        "sceneId": "b24_route",
        "source": "选择主门战后：",
        "classification": "branch-heading",
        "turnIds": []
      },
      {
        "line": 1495,
        "sceneId": "b24_route",
        "source": "（活动臂停在低处。工队垫稳支撑，再抬出整根检修扶手。）",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1495"
        ]
      },
      {
        "line": 1497,
        "sceneId": "b24_route",
        "source": "工队住民：现在能过了。我们先把扶手装上，你们进树心前不用踩那根裂开的旧木头。",
        "classification": "player-text",
        "turnIds": [
          "b24_route.L1497"
        ]
      },
      {
        "line": 1501,
        "sceneId": "b24_warning",
        "source": "（干根库一面墙上画着总阀与护根机关的简图。米露用指节敲了敲其中一处。）",
        "classification": "player-text",
        "turnIds": [
          "b24_warning.L1501"
        ]
      },
      {
        "line": 1503,
        "sceneId": "b24_warning",
        "source": "米露：总阀旁有根检修副柄。拨到检修位，护臂会先抬起来；真正的总阀还没关。旧装置已经分不清卸压和断流，这一步也会拦人。",
        "classification": "player-text",
        "turnIds": [
          "b24_warning.L1503"
        ]
      },
      {
        "line": 1505,
        "sceneId": "b24_warning",
        "source": "纱雾：所以四支流先停，侧压降下来。我们在检修位拆驱动，护臂不动了，老师再转总阀。",
        "classification": "player-text",
        "turnIds": [
          "b24_warning.L1505"
        ]
      },
      {
        "line": 1507,
        "sceneId": "b24_warning",
        "source": "璃：我记住了。先让护臂停，再碰总阀。",
        "classification": "player-text",
        "turnIds": [
          "b24_warning.L1507"
        ]
      },
      {
        "line": 1509,
        "sceneId": "b24_warning",
        "source": "（璃看完图，又认了一遍副柄的位置。）",
        "classification": "player-text",
        "turnIds": [
          "b24_warning.L1509"
        ]
      },
      {
        "line": 1511,
        "sceneId": "b24_warning",
        "source": "【动态提示：提前完整预览终战机制、属性、战损和前置。终局不得临时加招或消耗。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1515,
        "sceneId": "b25_enter",
        "source": "（新装的普通重力水管已沿既有高处水源铺到村边。工队正在最后检查保温层，旧根管在一旁发出低低的声响。）",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1515"
        ]
      },
      {
        "line": 1517,
        "sceneId": "b25_enter",
        "source": "纱雾：普通管接的是同一处泉眼。不是我们关了暖根，水就得跟着没有。",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1517"
        ]
      },
      {
        "line": 1519,
        "sceneId": "b25_enter",
        "source": "璃：这边压得稳？",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1519"
        ]
      },
      {
        "line": 1521,
        "sceneId": "b25_enter",
        "source": "工队住民：试过了。流量按正常用水排，没人再拿暖水整夜浇地。",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1521"
        ]
      },
      {
        "line": 1523,
        "sceneId": "b25_enter",
        "source": "（绯叶拧紧检修盖，收起三张测温纸符。）",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1523"
        ]
      },
      {
        "line": 1525,
        "sceneId": "b25_enter",
        "source": "绯叶：能浇的改用普通水。不能浇的，这一季先歇着。",
        "classification": "player-text",
        "turnIds": [
          "b25_enter.L1525"
        ]
      },
      {
        "line": 1529,
        "sceneId": "b25_valve",
        "source": "（最后一份主路暖脂进入专用槽。纱雾照看根流，璃和工人一起把负载交到机械锁上。四处支路的光终于都不再连着树心急促跳动。）",
        "classification": "player-text",
        "turnIds": [
          "b25_valve.L1529"
        ]
      },
      {
        "line": 1531,
        "sceneId": "b25_valve",
        "source": "纱雾：第四处好了。",
        "classification": "player-text",
        "turnIds": [
          "b25_valve.L1531"
        ]
      },
      {
        "line": 1533,
        "sceneId": "b25_valve",
        "source": "（四人等到泉水沿普通管连续流过，才松开手。）",
        "classification": "player-text",
        "turnIds": [
          "b25_valve.L1533"
        ]
      },
      {
        "line": 1535,
        "sceneId": "b25_valve",
        "source": "【即时状态：第四支阀关闭，扣除最后一份保留暖脂；可分配量不变。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1539,
        "sceneId": "b25_noctia",
        "source": "（从回水台回到树心外廊，只隔村内一小段路。诺克缇娅坐在桌前，三个封印片静止地放在规定位置，没有继续追着温标调整。）",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1539"
        ]
      },
      {
        "line": 1541,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：安静得有点不习惯。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1541"
        ]
      },
      {
        "line": 1543,
        "sceneId": "b25_noctia",
        "source": "纱雾：你可以先睡一会儿。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1543"
        ]
      },
      {
        "line": 1545,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：可以。但我先想拜托璃一件事。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1545"
        ]
      },
      {
        "line": 1547,
        "sceneId": "b25_noctia",
        "source": "璃：什么？",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1547"
        ]
      },
      {
        "line": 1549,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：米露那里有我家的备用钥匙。前年修门闩时留给她的。请你帮我拿来。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1549"
        ]
      },
      {
        "line": 1551,
        "sceneId": "b25_noctia",
        "source": "璃：你想先回去看一眼？",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1551"
        ]
      },
      {
        "line": 1553,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：我想总阀关好以后，就回去。不先在这里等一夜，看看还有没有谁想叫我。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1553"
        ]
      },
      {
        "line": 1555,
        "sceneId": "b25_noctia",
        "source": "（纱雾望着桌上的凉茶，过了一会儿才坐到另一把椅子上。）",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1555"
        ]
      },
      {
        "line": 1557,
        "sceneId": "b25_noctia",
        "source": "纱雾：我也想过，等一切都安稳了再走。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1557"
        ]
      },
      {
        "line": 1559,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：这几个月，根流越来越乱。我总觉得再守一天，第二天也许好一点。连屋里漏雨，都是别人去替我补的。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1559"
        ]
      },
      {
        "line": 1561,
        "sceneId": "b25_noctia",
        "source": "璃：你现在想回去做什么？",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1561"
        ]
      },
      {
        "line": 1563,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：（认真想了想）把窗打开。那里应该有很久没有人住的味道。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1563"
        ]
      },
      {
        "line": 1565,
        "sceneId": "b25_noctia",
        "source": "纱雾：然后呢？",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1565"
        ]
      },
      {
        "line": 1567,
        "sceneId": "b25_noctia",
        "source": "诺克缇娅：不知道。能不能先不知道？",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1567"
        ]
      },
      {
        "line": 1569,
        "sceneId": "b25_noctia",
        "source": "（纱雾点头。她没有立刻替老师列一张新的工作单。）",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1569"
        ]
      },
      {
        "line": 1571,
        "sceneId": "b25_noctia",
        "source": "璃：我去拿钥匙。",
        "classification": "player-text",
        "turnIds": [
          "b25_noctia.L1571"
        ]
      },
      {
        "line": 1575,
        "sceneId": "b25_exit",
        "source": "（走到门外，璃停了一下。）",
        "classification": "player-text",
        "turnIds": [
          "b25_exit.L1575"
        ]
      },
      {
        "line": 1577,
        "sceneId": "b25_exit",
        "source": "璃：关好总阀以后，你想先回家，我们就陪你走那一段。",
        "classification": "player-text",
        "turnIds": [
          "b25_exit.L1577"
        ]
      },
      {
        "line": 1579,
        "sceneId": "b25_exit",
        "source": "诺克缇娅：好。这里不用再留一个人。",
        "classification": "player-text",
        "turnIds": [
          "b25_exit.L1579"
        ]
      },
      {
        "line": 1585,
        "sceneId": "b26_enter",
        "source": "（回村后的几天，工队补完桥沿，冬料一车车卸进院子。纱雾教过两次温标，学舍也试烧了几夜。等到第十四天傍晚，四条支路都停了暖，只有树心与广场根盘还温着。）",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1585"
        ]
      },
      {
        "line": 1587,
        "sceneId": "b26_enter",
        "source": "（人们把晚饭端到广场的石桌上。普通屋舍的烟囱已经在冒烟，桌下那圈老根却仍让鞋底微微发热。有人吃着饭，习惯性把凳子又往根边挪了一寸。）",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1587"
        ]
      },
      {
        "line": 1589,
        "sceneId": "b26_enter",
        "source": "米露：学舍没再倒烟，漏风的那扇窗也补了。去河谷的第一批行李明早跟车走。后面几周，还有得搬。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1589"
        ]
      },
      {
        "line": 1591,
        "sceneId": "b26_enter",
        "source": "珂珂：我也跟这班下去。再拖，家里给我留的腌梨就没了。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1591"
        ]
      },
      {
        "line": 1593,
        "sceneId": "b26_enter",
        "source": "绯叶：给你一包果干，路上吃。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1593"
        ]
      },
      {
        "line": 1595,
        "sceneId": "b26_enter",
        "source": "珂珂：送我的？那我现在就收，免得你转头写进货单。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1595"
        ]
      },
      {
        "line": 1597,
        "sceneId": "b26_enter",
        "source": "（有人笑了。米露另盛一碗饭，压好盖子，放到纱雾身边。）",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1597"
        ]
      },
      {
        "line": 1599,
        "sceneId": "b26_enter",
        "source": "米露：等会儿给老师带过去。她那边能坐下吃了，总阀还得看着。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1599"
        ]
      },
      {
        "line": 1601,
        "sceneId": "b26_enter",
        "source": "纱雾：我先把这一碗吃完。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1601"
        ]
      },
      {
        "line": 1603,
        "sceneId": "b26_enter",
        "source": "米露：（把她面前快凉的汤推近一点）嗯。先吃。",
        "classification": "player-text",
        "turnIds": [
          "b26_enter.L1603"
        ]
      },
      {
        "line": 1607,
        "sceneId": "b26_shawu",
        "source": "（抽屉敞着，纱雾把几件生活用品摆在桌上。璃站在门侧。）",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1607"
        ]
      },
      {
        "line": 1609,
        "sceneId": "b26_shawu",
        "source": "璃：收拾好了吗？",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1609"
        ]
      },
      {
        "line": 1611,
        "sceneId": "b26_shawu",
        "source": "纱雾：这格好了。剩下的明天再看。",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1611"
        ]
      },
      {
        "line": 1613,
        "sceneId": "b26_shawu",
        "source": "璃：你真的不用一次带完。",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1613"
        ]
      },
      {
        "line": 1615,
        "sceneId": "b26_shawu",
        "source": "纱雾：我知道。春天我还会回来。",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1615"
        ]
      },
      {
        "line": 1617,
        "sceneId": "b26_shawu",
        "source": "（她拿起那张旧冬市地图，没有藏回抽屉，而是放在准备带走的东西最上面。）",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1617"
        ]
      },
      {
        "line": 1619,
        "sceneId": "b26_shawu",
        "source": "纱雾：走吧。做完之后，我想回来睡在这里。",
        "classification": "player-text",
        "turnIds": [
          "b26_shawu.L1619"
        ]
      },
      {
        "line": 1623,
        "sceneId": "b26_review",
        "source": "（饭后，璃和纱雾带着那碗饭进入树心外廊。绯叶把节火匣放在温标架旁的空桌上。诺克缇娅已经放下调节柄，只隔一会儿看一眼内侧总温标。）",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1623"
        ]
      },
      {
        "line": 1625,
        "sceneId": "b26_review",
        "source": "诺克缇娅：（揭开碗盖）这回还热。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1625"
        ]
      },
      {
        "line": 1627,
        "sceneId": "b26_review",
        "source": "纱雾：我们吃过了。你慢慢吃，还热。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1627"
        ]
      },
      {
        "line": 1629,
        "sceneId": "b26_review",
        "source": "（诺克缇娅抬了抬眉，先夹了一口菜。）",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1629"
        ]
      },
      {
        "line": 1631,
        "sceneId": "b26_review",
        "source": "绯叶：进检修道以前，把暖脂都用在哪里再看一遍。要回哪处看看，现在还能走。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1631"
        ]
      },
      {
        "line": 1633,
        "sceneId": "b26_review",
        "source": "【动态提示：核对四支阀、各项基础越冬与施工前置，缺项需先完成；展示三暖点投入及代价、剩余暖脂、已用根楔和未完成岔路。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1635,
        "sceneId": "b26_review",
        "source": "选择一：回去处理未完成的暖点或岔路。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1637,
        "sceneId": "b26_review",
        "source": "璃：我想再去一趟。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1637"
        ]
      },
      {
        "line": 1639,
        "sceneId": "b26_review",
        "source": "诺克缇娅：去吧。四支流都卸下来了，这几天的收尾我守得住。想清楚再回来，别走到半路又替我着急。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1639"
        ]
      },
      {
        "line": 1641,
        "sceneId": "b26_review",
        "source": "【即时状态：返回既有地图，无资源刷新。停机前等待不构成按现实时间流逝的惩罚。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1643,
        "sceneId": "b26_review",
        "source": "选择二：核对后，确认所有未投入暖点采用普通方案，准备停机。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1645,
        "sceneId": "b26_review",
        "source": "【动态确认：只显示未投入的真实后果：温室移栽取种，但部分品系消失；梨树不能活着留下；暖屋用普通柴炉、遮风与日间安排。已投不退，余量入公共储备；确认后不再调整暖点。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1647,
        "sceneId": "b26_review",
        "source": "璃：照这个安排走。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1647"
        ]
      },
      {
        "line": 1649,
        "sceneId": "b26_review",
        "source": "纱雾：我也知道哪些没能留下。我们去把最后的事做完。",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1649"
        ]
      },
      {
        "line": 1651,
        "sceneId": "b26_review",
        "source": "（绯叶合上匣盖，退到温标架旁。）",
        "classification": "player-text",
        "turnIds": [
          "b26_review.L1651"
        ]
      },
      {
        "line": 1655,
        "sceneId": "b26_noctia",
        "source": "（米露从外门进来，把一把普通钥匙递给璃。璃接过，交到诺克缇娅手里。）",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1655"
        ]
      },
      {
        "line": 1657,
        "sceneId": "b26_noctia",
        "source": "米露：前年修门闩留下的。还是原来那把。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1657"
        ]
      },
      {
        "line": 1659,
        "sceneId": "b26_noctia",
        "source": "（诺克缇娅用拇指摸了一下钥匙齿口。）",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1659"
        ]
      },
      {
        "line": 1661,
        "sceneId": "b26_noctia",
        "source": "诺克缇娅：我今天想回去。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1661"
        ]
      },
      {
        "line": 1663,
        "sceneId": "b26_noctia",
        "source": "米露：嗯。关完我们陪你走。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1663"
        ]
      },
      {
        "line": 1665,
        "sceneId": "b26_noctia",
        "source": "诺克缇娅：要是明天有人说炉子不热，先别敲我家门。我还不会修你们那种烟道。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1665"
        ]
      },
      {
        "line": 1667,
        "sceneId": "b26_noctia",
        "source": "米露：知道。砌炉子的人自己来。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1667"
        ]
      },
      {
        "line": 1669,
        "sceneId": "b26_noctia",
        "source": "绯叶：树的事，我看。真有要紧的，再来找你。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1669"
        ]
      },
      {
        "line": 1671,
        "sceneId": "b26_noctia",
        "source": "（诺克缇娅将钥匙握进手里，终于把空碗推开。）",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1671"
        ]
      },
      {
        "line": 1673,
        "sceneId": "b26_noctia",
        "source": "诺克缇娅：好。那就把最后这一段做完。",
        "classification": "player-text",
        "turnIds": [
          "b26_noctia.L1673"
        ]
      },
      {
        "line": 1677,
        "sceneId": "b27_enter",
        "source": "（新扶手的木纹一直延伸到阀前。狭窄的检修道边折着一张床，旁边放着便当盖和两包未拆的茶。）",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1677"
        ]
      },
      {
        "line": 1679,
        "sceneId": "b27_enter",
        "source": "璃：茶放多久了？",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1679"
        ]
      },
      {
        "line": 1681,
        "sceneId": "b27_enter",
        "source": "诺克缇娅：春天买的。说是放凉一点也好喝，我一直想等回家时再试。",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1681"
        ]
      },
      {
        "line": 1683,
        "sceneId": "b27_enter",
        "source": "纱雾：（看着床边修了又修的布套）你以前说这里睡着方便。",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1683"
        ]
      },
      {
        "line": 1685,
        "sceneId": "b27_enter",
        "source": "诺克缇娅：忙的时候，确实方便。后来根流一天比一天难控，“忙的时候”就没有停过。",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1685"
        ]
      },
      {
        "line": 1687,
        "sceneId": "b27_enter",
        "source": "璃：这些要一起带走吗？",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1687"
        ]
      },
      {
        "line": 1689,
        "sceneId": "b27_enter",
        "source": "诺克缇娅：茶带走。便当盖也带走，给我送饭的人已经找了好几次。",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1689"
        ]
      },
      {
        "line": 1691,
        "sceneId": "b27_enter",
        "source": "（纱雾把茶与便当盖放进搬运小包。）",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1691"
        ]
      },
      {
        "line": 1693,
        "sceneId": "b27_enter",
        "source": "纱雾：床呢？",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1693"
        ]
      },
      {
        "line": 1695,
        "sceneId": "b27_enter",
        "source": "诺克缇娅：先留着。以后有人进来检查设备，累了也可以躺一下。但不住在这里等下一班。",
        "classification": "player-text",
        "turnIds": [
          "b27_enter.L1695"
        ]
      },
      {
        "line": 1699,
        "sceneId": "b27_before",
        "source": "（诺克缇娅收好钥匙。三人照着先前的图，找到检修副柄与驱动核。）",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1699"
        ]
      },
      {
        "line": 1701,
        "sceneId": "b27_before",
        "source": "纱雾：（核对星盘）四支流都低下来了。没有哪一处还在顶主轴。",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1701"
        ]
      },
      {
        "line": 1703,
        "sceneId": "b27_before",
        "source": "诺克缇娅：我先拨副柄，让机关露出来。璃拆驱动，纱雾看回流。等护臂完全停了，我们才动这只总阀。",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1703"
        ]
      },
      {
        "line": 1705,
        "sceneId": "b27_before",
        "source": "璃：然后我落机械锁。",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1705"
        ]
      },
      {
        "line": 1707,
        "sceneId": "b27_before",
        "source": "诺克缇娅：对。卡舌进去，就能松手。",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1707"
        ]
      },
      {
        "line": 1709,
        "sceneId": "b27_before",
        "source": "（纱雾抬眼看她，像是刚刚又听懂了一层意思。）",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1709"
        ]
      },
      {
        "line": 1711,
        "sceneId": "b27_before",
        "source": "纱雾：我记住了。",
        "classification": "player-text",
        "turnIds": [
          "b27_before.L1711"
        ]
      },
      {
        "line": 1713,
        "sceneId": "b27_before",
        "source": "【动态提示：核对现有资源与 b24 已公开的终战；不补满生命。可在操作前取消并返回外廊，已确认的暖点分配保持不变。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1717,
        "sceneId": "b28_pre",
        "source": "（诺克缇娅让三枚红菱封印片分别对准既有导流位置，伸手拨下检修副柄。真正的总阀仍在原位，旧保护机关的护臂却已抬起，扫向副柄前的站位。）",
        "classification": "player-text",
        "turnIds": [
          "b28_pre.L1717"
        ]
      },
      {
        "line": 1719,
        "sceneId": "b28_pre",
        "source": "纱雾：它起来了！",
        "classification": "player-text",
        "turnIds": [
          "b28_pre.L1719"
        ]
      },
      {
        "line": 1721,
        "sceneId": "b28_pre",
        "source": "璃：（拔剑，退到看图时选好的位置）看住回流。",
        "classification": "player-text",
        "turnIds": [
          "b28_pre.L1721"
        ]
      },
      {
        "line": 1723,
        "sceneId": "b28_pre",
        "source": "诺克缇娅：我在。驱动核就在护臂后面。",
        "classification": "player-text",
        "turnIds": [
          "b28_pre.L1723"
        ]
      },
      {
        "line": 1725,
        "sceneId": "b28_pre",
        "source": "【动态提示：执行已公开的固定终战，获胜后永久拆除驱动。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1729,
        "sceneId": "b28_post",
        "source": "（护臂在机械支点上停住，不再扫过主轴。璃确认驱动完全熄灭，将剑收回左腰剑鞘，走到锁柄旁。）",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1729"
        ]
      },
      {
        "line": 1731,
        "sceneId": "b28_post",
        "source": "璃：停了。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1731"
        ]
      },
      {
        "line": 1733,
        "sceneId": "b28_post",
        "source": "纱雾：回流还稳。可以转。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1733"
        ]
      },
      {
        "line": 1735,
        "sceneId": "b28_post",
        "source": "（诺克缇娅伸手扶住总阀，三枚封印片维持原有方向。她转过第一段，停下来等纱雾看清指示，才继续转第二段。）",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1735"
        ]
      },
      {
        "line": 1737,
        "sceneId": "b28_post",
        "source": "诺克缇娅：这里以前很重。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1737"
        ]
      },
      {
        "line": 1739,
        "sceneId": "b28_post",
        "source": "纱雾：侧流卸掉了。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1739"
        ]
      },
      {
        "line": 1741,
        "sceneId": "b28_post",
        "source": "诺克缇娅：嗯。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1741"
        ]
      },
      {
        "line": 1743,
        "sceneId": "b28_post",
        "source": "（最后一段过后，机械锁落下。璃确认卡舌到位，松开手，后退一步。诺克缇娅也把手放下。）",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1743"
        ]
      },
      {
        "line": 1745,
        "sceneId": "b28_post",
        "source": "（沉默。没有新的警铃。）",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1745"
        ]
      },
      {
        "line": 1747,
        "sceneId": "b28_post",
        "source": "纱雾：老师？",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1747"
        ]
      },
      {
        "line": 1749,
        "sceneId": "b28_post",
        "source": "诺克缇娅：（望着自己空下来的手）我想等它再响一下。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1749"
        ]
      },
      {
        "line": 1751,
        "sceneId": "b28_post",
        "source": "璃：那就再站一会儿。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1751"
        ]
      },
      {
        "line": 1753,
        "sceneId": "b28_post",
        "source": "（诺克缇娅听过一阵水声，收回三枚封印片。）",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1753"
        ]
      },
      {
        "line": 1755,
        "sceneId": "b28_post",
        "source": "诺克缇娅：够了。走吧。",
        "classification": "player-text",
        "turnIds": [
          "b28_post.L1755"
        ]
      },
      {
        "line": 1757,
        "sceneId": "b28_post",
        "source": "【即时状态：总阀安全停止，进入尾声。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1761,
        "sceneId": "b29_enter",
        "source": "（树心脚下的暖光一节节退下去，停在早已关好的四个支口。广场根盘最后一处光也熄了。上方的叶子缓缓合拢，有一片落到石桌边。）",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1761"
        ]
      },
      {
        "line": 1763,
        "sceneId": "b29_enter",
        "source": "（隔着街，学舍的烟囱仍在冒烟。有人端着洗好的锅进屋，用脚带上门。水在新管里流，声音比从前清楚。）",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1763"
        ]
      },
      {
        "line": 1765,
        "sceneId": "b29_enter",
        "source": "纱雾：（把手掌贴在树皮上）凉下来了。",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1765"
        ]
      },
      {
        "line": 1767,
        "sceneId": "b29_enter",
        "source": "绯叶：嗯。",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1767"
        ]
      },
      {
        "line": 1769,
        "sceneId": "b29_enter",
        "source": "璃：这样就会醒吗？",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1769"
        ]
      },
      {
        "line": 1771,
        "sceneId": "b29_enter",
        "source": "绯叶：（仰头看了一会儿）我还不知道。明天再来看它。",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1771"
        ]
      },
      {
        "line": 1773,
        "sceneId": "b29_enter",
        "source": "（诺克缇娅重新握住家门钥匙。米露试过检修道门闩。诺克缇娅走出两步，又下意识回头。）",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1773"
        ]
      },
      {
        "line": 1775,
        "sceneId": "b29_enter",
        "source": "诺克缇娅：钥匙……",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1775"
        ]
      },
      {
        "line": 1777,
        "sceneId": "b29_enter",
        "source": "璃：在你手里。",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1777"
        ]
      },
      {
        "line": 1779,
        "sceneId": "b29_enter",
        "source": "（诺克缇娅低头，看见家门钥匙被自己握得很紧。）",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1779"
        ]
      },
      {
        "line": 1781,
        "sceneId": "b29_enter",
        "source": "诺克缇娅：我知道。刚才想找的不是这一把。",
        "classification": "player-text",
        "turnIds": [
          "b29_enter.L1781"
        ]
      },
      {
        "line": 1785,
        "sceneId": "b29_home",
        "source": "（诺克缇娅自己打开家门。屋里已经做过她同意的基本修补，摆设仍然是她自己的。她先开窗，让夜里的凉气进来。）",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1785"
        ]
      },
      {
        "line": 1787,
        "sceneId": "b29_home",
        "source": "纱雾：会冷。",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1787"
        ]
      },
      {
        "line": 1789,
        "sceneId": "b29_home",
        "source": "诺克缇娅：开一小会儿。我想换换气。",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1789"
        ]
      },
      {
        "line": 1791,
        "sceneId": "b29_home",
        "source": "（纱雾打开从检修道带来的小包，把两包茶递给璃，再取出便当盖。璃把茶放在桌上，纱雾把盖子交给屋主。）",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1791"
        ]
      },
      {
        "line": 1793,
        "sceneId": "b29_home",
        "source": "诺克缇娅：明天中午，如果我没出来——",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1793"
        ]
      },
      {
        "line": 1795,
        "sceneId": "b29_home",
        "source": "（纱雾的神情下意识紧了一下。）",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1795"
        ]
      },
      {
        "line": 1797,
        "sceneId": "b29_home",
        "source": "诺克缇娅：来叫我吃饭。敲门就好，不用敲警铃。",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1797"
        ]
      },
      {
        "line": 1799,
        "sceneId": "b29_home",
        "source": "纱雾：（呼出一口气）好。",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1799"
        ]
      },
      {
        "line": 1801,
        "sceneId": "b29_home",
        "source": "璃：那我们回去了。",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1801"
        ]
      },
      {
        "line": 1803,
        "sceneId": "b29_home",
        "source": "（诺克缇娅点头，自己关上门。窗边亮起一盏普通灯。）",
        "classification": "player-text",
        "turnIds": [
          "b29_home.L1803"
        ]
      },
      {
        "line": 1807,
        "sceneId": "b29_shawu",
        "source": "（回程时，纱雾走了几步，才发现自己没有把星盘举起来。）",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1807"
        ]
      },
      {
        "line": 1809,
        "sceneId": "b29_shawu",
        "source": "纱雾：我现在该做什么？",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1809"
        ]
      },
      {
        "line": 1811,
        "sceneId": "b29_shawu",
        "source": "璃：你刚才不是说，想回自己屋里睡？",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1811"
        ]
      },
      {
        "line": 1813,
        "sceneId": "b29_shawu",
        "source": "纱雾：是。",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1813"
        ]
      },
      {
        "line": 1815,
        "sceneId": "b29_shawu",
        "source": "（她轻轻笑了一下，像觉得这个答案简单得有些陌生。）",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1815"
        ]
      },
      {
        "line": 1817,
        "sceneId": "b29_shawu",
        "source": "纱雾：那我回去睡觉。",
        "classification": "player-text",
        "turnIds": [
          "b29_shawu.L1817"
        ]
      },
      {
        "line": 1823,
        "sceneId": "b30_enter",
        "source": "（停暖后的几周，最后几车冬料到了。有人搬下山，有人把学舍的床铺好，还有人白天回家做活，晚上再回来吃饭。路边新增的桥板踩得发亮，几处被雨淋淡的路标又描过一遍。）",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1823"
        ]
      },
      {
        "line": 1825,
        "sceneId": "b30_enter",
        "source": "（纱雾留在村里收拾行李，也跟着绯叶搬了最后一批适合搬走的盆。她在客舍问好的开课日近了，早班货车已经替她留出一个行李角。）",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1825"
        ]
      },
      {
        "line": 1827,
        "sceneId": "b30_enter",
        "source": "（第一场雪来得很轻。雪落在曾经一直温热的根盘上，这次没有立刻消失。一个扫院子的住民停下手，看了好一会儿，才先扫出通向邻家的窄路。）",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1827"
        ]
      },
      {
        "line": 1829,
        "sceneId": "b30_enter",
        "source": "（诺克缇娅坐在家中窗边喝茶，手边是已经洗净送还后又被借来的便当盒。门响了两下。）",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1829"
        ]
      },
      {
        "line": 1831,
        "sceneId": "b30_enter",
        "source": "米露：午饭好了。",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1831"
        ]
      },
      {
        "line": 1833,
        "sceneId": "b30_enter",
        "source": "诺克缇娅：我知道。",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1833"
        ]
      },
      {
        "line": 1835,
        "sceneId": "b30_enter",
        "source": "米露：你上次也说知道，结果睡过去了。",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1835"
        ]
      },
      {
        "line": 1837,
        "sceneId": "b30_enter",
        "source": "诺克缇娅：（起身）这次没睡。我在看雪。",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1837"
        ]
      },
      {
        "line": 1839,
        "sceneId": "b30_enter",
        "source": "（米露没有催她快一点，把门留开能让两人先后通过的宽度。）",
        "classification": "player-text",
        "turnIds": [
          "b30_enter.L1839"
        ]
      },
      {
        "line": 1841,
        "sceneId": "b30_enter",
        "source": "（按实际暖点状态选取以下一组片段，再接关系尾声。）",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1845,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "触发条件：温室已投入，暖屋已投入，梨树未投入。",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1847,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "（绯叶在温室内侧修整枝叶。玻璃上有薄雾，白花还开着。她把落下的花瓣收进夹纸。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1847"
        ]
      },
      {
        "line": 1849,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "绯叶：这一冬还在。够我再仔细试试别的养法。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1849"
        ]
      },
      {
        "line": 1851,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "（半山暖屋里，两位住在不同地方的村民正在喝茶。有人等货队，有人只是顺路来坐一会儿。杯子被放回那张修好的桌。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1851"
        ]
      },
      {
        "line": 1853,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "（老梨树坡下，原来的树位已经空了。用其一段木料做的粗坐凳放在避风处，表面还有粗糙的木刺。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1853"
        ]
      },
      {
        "line": 1855,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "纱雾：（手沿着熟悉的木纹走过）这里还硌手。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1855"
        ]
      },
      {
        "line": 1857,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "璃：工队说等木料再干一点，还要磨。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1857"
        ]
      },
      {
        "line": 1859,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "纱雾：我知道。我认得这块纹。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1859"
        ]
      },
      {
        "line": 1861,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "（两人在凳上坐下。璃坐到左边，纱雾看了一眼，没有揭穿她特意换了位置。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1861"
        ]
      },
      {
        "line": 1863,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "璃：你还难过？",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1863"
        ]
      },
      {
        "line": 1865,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "纱雾：嗯。刚才在暖屋里还忘了一会儿，坐到这里又想起来了。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1865"
        ]
      },
      {
        "line": 1867,
        "sceneId": "b30_heat_greenhouse_lodge",
        "source": "（璃把左手放在凳面上。纱雾伸过手，覆住她的指节。她的掌心暖了一点。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_lodge.L1867"
        ]
      },
      {
        "line": 1871,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "触发条件：温室已投入，梨树已投入，暖屋未投入。",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1873,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "（温室内门合得严实，绯叶留下的暖生品系继续度过这一冬。梨树已经移到避风坡，根土覆好，细枝在覆土上方轻轻摇着。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1873"
        ]
      },
      {
        "line": 1875,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "绯叶：根还稳着。先让它安静，别天天挖开看看长没长。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1875"
        ]
      },
      {
        "line": 1877,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "纱雾：（收回想拨开覆土的手）知道了。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1877"
        ]
      },
      {
        "line": 1879,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "（半山的普通候车屋里，米露点起柴炉，工队把日间出发时刻告诉同行的人。空着的暖槽盖得严实，石墙仍凉，大家把见面时间排早一些。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1879"
        ]
      },
      {
        "line": 1881,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "米露：今天这趟吃完饭就走。别等天黑了，才说还有一句没聊完。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1881"
        ]
      },
      {
        "line": 1883,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "璃：（帮她关严门）比有暖槽麻烦一点。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1883"
        ]
      },
      {
        "line": 1885,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "米露：是。所以今天吃饭早。来，先把这块干柴递给我。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1885"
        ]
      },
      {
        "line": 1887,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "（屋外，两人经过移好的梨树。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1887"
        ]
      },
      {
        "line": 1889,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "纱雾：这里比原来的坡背风。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1889"
        ]
      },
      {
        "line": 1891,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "璃：明年能再坐这里吗？",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1891"
        ]
      },
      {
        "line": 1893,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "纱雾：等它缓过来，旁边放凳子。别再坐它的根了。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1893"
        ]
      },
      {
        "line": 1895,
        "sceneId": "b30_heat_greenhouse_pear",
        "source": "（余下一份暖脂封存在公共储备匣中。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_greenhouse_pear.L1895"
        ]
      },
      {
        "line": 1899,
        "sceneId": "b30_heat_lodge_pear",
        "source": "触发条件：暖屋已投入，梨树已投入，温室未投入。",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1901,
        "sceneId": "b30_heat_lodge_pear",
        "source": "（温室外间摆着能耐寒的移栽盆，几格原先放特殊品系的位置空下来。绯叶合起最后一本标本夹，把仍可播种的种子分别收好。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1901"
        ]
      },
      {
        "line": 1903,
        "sceneId": "b30_heat_lodge_pear",
        "source": "纱雾：那几株白花……",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1903"
        ]
      },
      {
        "line": 1905,
        "sceneId": "b30_heat_lodge_pear",
        "source": "绯叶：没保住。最完整的一枝在这里。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1905"
        ]
      },
      {
        "line": 1907,
        "sceneId": "b30_heat_lodge_pear",
        "source": "（她展开夹纸，熟悉的白花被压得很薄。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1907"
        ]
      },
      {
        "line": 1909,
        "sceneId": "b30_heat_lodge_pear",
        "source": "璃：我们能帮你做什么？",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1909"
        ]
      },
      {
        "line": 1911,
        "sceneId": "b30_heat_lodge_pear",
        "source": "绯叶：把外面那排耐寒的搬到日照够的地方。里面空着的，让它先空着。别为了安慰我，随便找东西填满。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1911"
        ]
      },
      {
        "line": 1913,
        "sceneId": "b30_heat_lodge_pear",
        "source": "（两人照她所说搬盆。转场后，避风坡的梨树仍然活着，半山暖屋亮着一盏普通灯，门被过路人仔细关好。）",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_lodge_pear.L1913"
        ]
      },
      {
        "line": 1915,
        "sceneId": "b30_heat_lodge_pear",
        "source": "纱雾：春天我会回来，把在下面学的试给你看。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1915"
        ]
      },
      {
        "line": 1917,
        "sceneId": "b30_heat_lodge_pear",
        "source": "绯叶：好。先看你学会哪几样，春天我们腾两排地。",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1917"
        ]
      },
      {
        "line": 1919,
        "sceneId": "b30_heat_lodge_pear",
        "source": "（纱雾点头，把空盆叠齐。余下一份暖脂封存在公共储备匣中。）",
        "classification": "player-text",
        "turnIds": [
          "b30_heat_lodge_pear.L1919"
        ]
      },
      {
        "line": 1923,
        "sceneId": "b30_heat_partial",
        "source": "只投一处或全部未投时，按实际状态各取一个模块，接成短蒙太奇。",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1925,
        "sceneId": "b30_heat_partial",
        "source": "温室投入模块：绯叶检查温标，把内门合上；“这一冬保住了。以后还得学正常季节里的办法。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1925",
          "b30_heat_partial.L1925.2"
        ]
      },
      {
        "line": 1927,
        "sceneId": "b30_heat_partial",
        "source": "温室未投入模块：绯叶收起最后的标本，将耐寒土盆放到日照处；“有几样没能留下。能继续养的，今天还是要浇水。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1927",
          "b30_heat_partial.L1927.2"
        ]
      },
      {
        "line": 1929,
        "sceneId": "b30_heat_partial",
        "source": "梨树投入模块：纱雾检查避风坡上的覆土，不动根部；“它还在。先让它睡，不催它开花。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1929",
          "b30_heat_partial.L1929.2"
        ]
      },
      {
        "line": 1931,
        "sceneId": "b30_heat_partial",
        "source": "梨树未投入模块：璃和纱雾在旧木坐凳边停下；纱雾：“我记得它原来长在哪里。这里空了，我也还记得。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1931",
          "b30_heat_partial.L1931.2"
        ]
      },
      {
        "line": 1933,
        "sceneId": "b30_heat_partial",
        "source": "暖屋投入模块：住民关门，把刚沏的茶推给后来者；“坐下暖一会儿。下一趟车还早。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1933",
          "b30_heat_partial.L1933.2"
        ]
      },
      {
        "line": 1935,
        "sceneId": "b30_heat_partial",
        "source": "暖屋未投入模块：米露确认柴炉与日间出发安排；“屋子能挡风，柴带够。今天别拖到晚上再走。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1935",
          "b30_heat_partial.L1935.2"
        ]
      },
      {
        "line": 1937,
        "sceneId": "b30_heat_partial",
        "source": "剩余暖脂模块：实际未分配部分封存入公共急需储备。绯叶把匣子放稳：“先收在这里，用的时候再来取。”",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_heat_partial.L1937",
          "b30_heat_partial.L1937.2"
        ]
      },
      {
        "line": 1941,
        "sceneId": "b30_relationship_offer",
        "source": "（纱雾把冬衣、行李放在门边，旧冬市地图留在最上面。按约定的开课日，她该下山了。两人在屋内等货队回话。）",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1941"
        ]
      },
      {
        "line": 1943,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：我后天跟着早班下去。客舍的房间定好了，第一天先去搬土。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1943"
        ]
      },
      {
        "line": 1945,
        "sceneId": "b30_relationship_offer",
        "source": "璃：听起来你很期待搬土。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1945"
        ]
      },
      {
        "line": 1947,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：我期待知道自己搬的是什么土。以前别人一说要种什么，我就先去找哪条暖根。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1947"
        ]
      },
      {
        "line": 1949,
        "sceneId": "b30_relationship_offer",
        "source": "（她看向门外已被扫过的路。）",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1949"
        ]
      },
      {
        "line": 1951,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：你呢？",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1951"
        ]
      },
      {
        "line": 1953,
        "sceneId": "b30_relationship_offer",
        "source": "璃：米露已经找好一班人，问我愿不愿意也留一季。刚接好的那几段，我确实想多走几遍。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1953"
        ]
      },
      {
        "line": 1955,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：那你去过冬市的事，又要往后了？",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1955"
        ]
      },
      {
        "line": 1957,
        "sceneId": "b30_relationship_offer",
        "source": "璃：我也想跟你去。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1957"
        ]
      },
      {
        "line": 1959,
        "sceneId": "b30_relationship_offer",
        "source": "（纱雾把折小的地图展开，压住卷起的一角。）",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1959"
        ]
      },
      {
        "line": 1961,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：摊位我已经问清楚了。你要这次来，就跟我走。要留下，等下一趟货队下来，我也有空。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1961"
        ]
      },
      {
        "line": 1963,
        "sceneId": "b30_relationship_offer",
        "source": "璃：两次都留位置？",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1963"
        ]
      },
      {
        "line": 1965,
        "sceneId": "b30_relationship_offer",
        "source": "纱雾：（看她一眼）只给你留吃饼的位置。屋子你自己找。",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1965"
        ]
      },
      {
        "line": 1967,
        "sceneId": "b30_relationship_offer",
        "source": "（璃笑了。她们把地图转过来，一起看了一会儿。）",
        "classification": "player-text",
        "turnIds": [
          "b30_relationship_offer.L1967"
        ]
      },
      {
        "line": 1969,
        "sceneId": "b30_relationship_offer",
        "source": "【选择提示：只选璃本季行动；纱雾学习、暖点与居民计划不变。两项均为完整关系结局，无隐藏好感阈值。】",
        "classification": "production-direction",
        "turnIds": []
      },
      {
        "line": 1971,
        "sceneId": "b30_relationship_offer",
        "source": "选择一：这一程与纱雾一起下山。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1973,
        "sceneId": "b30_relationship_offer",
        "source": "选择二：留下巡路一季，与纱雾约好下一趟相见。",
        "classification": "choice-heading",
        "turnIds": []
      },
      {
        "line": 1977,
        "sceneId": "b30_end_together",
        "source": "璃：这趟我跟你走。到了河谷，先陪你放行李，再去货场找我的护送活。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1977"
        ]
      },
      {
        "line": 1979,
        "sceneId": "b30_end_together",
        "source": "纱雾：冬市那天呢？",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1979"
        ]
      },
      {
        "line": 1981,
        "sceneId": "b30_end_together",
        "source": "璃：空出来。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1981"
        ]
      },
      {
        "line": 1983,
        "sceneId": "b30_end_together",
        "source": "纱雾：不是“尽量”？",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1983"
        ]
      },
      {
        "line": 1985,
        "sceneId": "b30_end_together",
        "source": "璃：空出来。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1985"
        ]
      },
      {
        "line": 1987,
        "sceneId": "b30_end_together",
        "source": "（纱雾伸手握住她的左手。璃这次没有先转身去搬行李。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1987"
        ]
      },
      {
        "line": 1989,
        "sceneId": "b30_end_together",
        "source": "纱雾：那先走这一段。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1989"
        ]
      },
      {
        "line": 1991,
        "sceneId": "b30_end_together",
        "source": "（两日后。屋内传来穿上厚衣、收紧行囊的声音。门开了，货车铃响。镜头沿既定石路与桥面掠过，停在换班的工人旁；屋外的远行人物不作服装特写。米露将下一段巡路交给同伴，送她们到门口。）",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_end_together.L1991",
          "b30_end_together.L1991.2"
        ]
      },
      {
        "line": 1993,
        "sceneId": "b30_end_together",
        "source": "米露：到下面把路况告诉货场。还有，吃饼时别把行李丢了。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1993"
        ]
      },
      {
        "line": 1995,
        "sceneId": "b30_end_together",
        "source": "璃：知道。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1995"
        ]
      },
      {
        "line": 1997,
        "sceneId": "b30_end_together",
        "source": "（河谷，室内的客舍近景。纱雾把地图摊到桌上，璃往旁边挪开水杯，给她空出完整的一角。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1997"
        ]
      },
      {
        "line": 1999,
        "sceneId": "b30_end_together",
        "source": "纱雾：梨饼的摊从这里进去。不是后院。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L1999"
        ]
      },
      {
        "line": 2001,
        "sceneId": "b30_end_together",
        "source": "璃：我记着了。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2001"
        ]
      },
      {
        "line": 2003,
        "sceneId": "b30_end_together",
        "source": "纱雾：你以前说，等一切都准备好再带我来。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2003"
        ]
      },
      {
        "line": 2005,
        "sceneId": "b30_end_together",
        "source": "璃：今天也没有一切都准备好。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2005"
        ]
      },
      {
        "line": 2007,
        "sceneId": "b30_end_together",
        "source": "纱雾：今天已经来了。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2007"
        ]
      },
      {
        "line": 2009,
        "sceneId": "b30_end_together",
        "source": "（镜头回到山上。诺克缇娅家里开着窗，米露把巡护交给同伴，绯叶在适用的温室或普通苗圃里继续工作。古树静静立在薄雪中。）",
        "classification": "mixed-direction",
        "turnIds": [
          "b30_end_together.L2009"
        ]
      },
      {
        "line": 2011,
        "sceneId": "b30_end_together",
        "source": "（最后一个镜头：两人在客舍桌前把同一张地图转了个方向，窗外是正常冬季的光。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2011"
        ]
      },
      {
        "line": 2013,
        "sceneId": "b30_end_together",
        "source": "结束短句：这次，她们先一起走到今天。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_together.L2013"
        ]
      },
      {
        "line": 2017,
        "sceneId": "b30_end_two_ends",
        "source": "璃：我留下巡路一季。下一趟货队到下面，我跟到货场，去找你。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2017"
        ]
      },
      {
        "line": 2019,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：那我后天先走。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2019"
        ]
      },
      {
        "line": 2021,
        "sceneId": "b30_end_two_ends",
        "source": "璃：嗯。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2021"
        ]
      },
      {
        "line": 2023,
        "sceneId": "b30_end_two_ends",
        "source": "（纱雾摸了摸手里地图的折痕，抬眼看她。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2023"
        ]
      },
      {
        "line": 2025,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：我会想你。还有一点生气，明明刚回来，又要分开。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2025"
        ]
      },
      {
        "line": 2027,
        "sceneId": "b30_end_two_ends",
        "source": "璃：我也是。想跟着你，刚才还在想。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2027"
        ]
      },
      {
        "line": 2029,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：你想留下的那些路，也是真的想走吧？",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2029"
        ]
      },
      {
        "line": 2031,
        "sceneId": "b30_end_two_ends",
        "source": "璃：嗯。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2031"
        ]
      },
      {
        "line": 2033,
        "sceneId": "b30_end_two_ends",
        "source": "（纱雾向前一步抱住她，额头靠在她肩侧停了一会儿。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2033"
        ]
      },
      {
        "line": 2035,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：那你来时敲门。别像以前，站在外面觉得我忙，就自己走了。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2035"
        ]
      },
      {
        "line": 2037,
        "sceneId": "b30_end_two_ends",
        "source": "璃：好。你不在，我就问你什么时候回来。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2037"
        ]
      },
      {
        "line": 2039,
        "sceneId": "b30_end_two_ends",
        "source": "（下一趟往返。璃随货队到了河谷，在温室里看见纱雾往架上放空盆，旁边的冬苗冒出了新叶。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2039"
        ]
      },
      {
        "line": 2041,
        "sceneId": "b30_end_two_ends",
        "source": "璃：你先忙，我能等。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2041"
        ]
      },
      {
        "line": 2043,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：这一盆放好就行。今天已经有人接后面那排了。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2043"
        ]
      },
      {
        "line": 2045,
        "sceneId": "b30_end_two_ends",
        "source": "（纱雾放下土盆，洗净手，跟同伴打过招呼，走到璃身边。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2045"
        ]
      },
      {
        "line": 2047,
        "sceneId": "b30_end_two_ends",
        "source": "（在客舍桌边，璃说石阶补好了，米露下山买了自己的东西，诺克缇娅拆开了第二包茶。纱雾说，她昨天为了让苗透气，亲手开了温室的窗。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2047"
        ]
      },
      {
        "line": 2049,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：以前我总以为，走开以后，别人就接不上我留下的那一段。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2049"
        ]
      },
      {
        "line": 2051,
        "sceneId": "b30_end_two_ends",
        "source": "璃：现在有人接，也有人慢一点再接。没有你想的那么快，可在接。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2051"
        ]
      },
      {
        "line": 2053,
        "sceneId": "b30_end_two_ends",
        "source": "纱雾：那我再住一阵。春天回去试试新种法。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2053"
        ]
      },
      {
        "line": 2055,
        "sceneId": "b30_end_two_ends",
        "source": "璃：我到时去看。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2055"
        ]
      },
      {
        "line": 2057,
        "sceneId": "b30_end_two_ends",
        "source": "（纱雾把自己的杯子向璃那边碰了一下。窗边的光落在两双手上。）",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2057"
        ]
      },
      {
        "line": 2059,
        "sceneId": "b30_end_two_ends",
        "source": "结束短句：她们住在路的两端，也确实见到了彼此。",
        "classification": "player-text",
        "turnIds": [
          "b30_end_two_ends.L2059"
        ]
      }
    ]
  },
  "authoring": {
    "revision": "B-opening-r1",
    "openingScenes": [
      "b01_enter",
      "b01_pre",
      "b01_post",
      "b02_enter",
      "b02_choice"
    ],
    "openingSource": {
      "file": "production/story/b-arc-review/OPENING-PROPOSAL.md",
      "sha256": "bbb24af3f2f8418ae2e30038dc10152bfe6efc95a7ba6f7dbc2f2876d996273f",
      "clarificationPatch": {
        "file": "production/story/b-dialogue-state-review/opening-clarifications.patch",
        "sha256": "4f40c54ba47e604e5e920410eac59d74bdb728a63306f1c895a047c5ad4a7b2f"
      },
      "authorship": "new-opening-r1-not-historical-restoration",
      "inheritedChoiceSource": {
        "file": "sources/full-v1.1.md",
        "sha256": "5af55e3c0ff3d00d7653e2e36212cf1ecad8f1a3fccad13c2c634d6a258e839f"
      }
    },
    "openingTurnCount": 70,
    "currentPlayerTurns": 868,
    "legacyCoverageScope": "Unmodified historical-source ledger; first five scene turns superseded by B-opening-r1",
    "saveIdentityPreserved": true
  }
};
