// Original optional B prose, root-reviewed r3; no gameplay entities or effects.
export const CENWEI_CONTENT = {
  "cast": {
    "forest_cenwei": {
      "name": "岑苇",
      "portrait": "forest_cenwei",
      "expression": "neutral",
      "nameStatus": "tentative",
      "assetPolicy": "Unbound until separately reviewed; missing portrait hides cleanly and must not alias an A/B existing identity"
    }
  },
  "order": [
    "b06_cenwei_wait",
    "b05_cenwei_greeting"
  ],
  "scenes": {
    "b06_cenwei_wait": {
      "id": "b06_cenwei_wait",
      "title": "先让它过去",
      "regionId": "B-06",
      "turns": [
        {
          "id": "B.CW.R1.CW01",
          "speaker": "旁白",
          "portrait": null,
          "text": "低枝下横放着一只圆篓。篓里的干杉针动了一下，又静下来。短发女人拎住篓沿，刚提起一点，就重新放回地上。",
          "branch": "common",
          "kind": "narration",
          "sourceLine": 11
        },
        {
          "id": "B.CW.R1.CW02",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "你们站那儿就好，先别过来。里面有东西。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 13
        },
        {
          "id": "B.CW.R1.CW03",
          "speaker": "璃",
          "portrait": "hero",
          "text": "我看见耳朵了。什么时候进去的？",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 15
        },
        {
          "id": "B.CW.R1.CW04",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "我去喝了口水，回来就多了这么个客人。这只篓有人订了，我总不能连它一起交过去。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 17
        },
        {
          "id": "B.CW.R1.CW05",
          "speaker": "旁白",
          "portrait": null,
          "text": "小兽从篾条之间探出鼻尖，朝低枝下看了一眼。璃刚挪近，它便缩回去。女人脚边的布卷正好挤着篓口到草边的窄缝。",
          "branch": "common",
          "kind": "narration",
          "sourceLine": 19
        },
        {
          "id": "B.CW.R1.CW06",
          "speaker": "璃",
          "portrait": "hero",
          "text": "它一直看那边。我们站得太近了。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 21
        },
        {
          "id": "B.CW.R1.CW07",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "这布还是我放的。怕篓子滚，结果把出口塞住了。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 23
        },
        {
          "id": "B.CW.R1.CW08",
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你把布拿起来。璃，站我这边来。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 25
        },
        {
          "id": "B.CW.R1.CW09",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "我来拿。别伸手进去，里头有一根篾头翘着。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 27
        },
        {
          "id": "B.CW.R1.CW10",
          "speaker": "旁白",
          "portrait": null,
          "text": "她把布卷慢慢抱进怀里。璃和纱雾让到低枝另一侧，小兽却仍缩在篓里，只有鼻尖露在外面。",
          "branch": "common",
          "kind": "narration",
          "sourceLine": 29
        },
        {
          "id": "B.CW.R1.CW11",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "这回不挡着了吧？……怎么还不出来。",
          "branch": "common",
          "kind": "dialogue",
          "sourceLine": 31
        },
        {
          "id": "B.CW.R1.CWQ01",
          "speaker": "旁白",
          "portrait": null,
          "text": "璃在干石边蹲下来，没有再往篓里看。纱雾也收住脚步。过了一会儿，女人忽然抬起头。",
          "branch": "quiet_wait",
          "kind": "narration",
          "sourceLine": 41
        },
        {
          "id": "B.CW.R1.CWQ02",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "我快把篓底数第三遍了。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 43
        },
        {
          "id": "B.CW.R1.CWQ03",
          "speaker": "璃",
          "portrait": "hero",
          "text": "多少根？",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 45
        },
        {
          "id": "B.CW.R1.CWQ04",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "前两遍还不一样。你一问，我又忘了。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 47
        },
        {
          "id": "B.CW.R1.CWQ05",
          "speaker": "旁白",
          "portrait": null,
          "text": "她忍着笑低下头。一只前爪搭上篓口，小兽贴着草边慢慢钻出，尾巴在最后一根篾条上擦了一下。",
          "branch": "quiet_wait",
          "kind": "narration",
          "sourceLine": 49
        },
        {
          "id": "B.CW.R1.CWQ06",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "走了？",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 51
        },
        {
          "id": "B.CW.R1.CWQ07",
          "speaker": "璃",
          "portrait": "hero",
          "text": "这回真走了。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 53
        },
        {
          "id": "B.CW.R1.CWQ08",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "我叫岑苇，住溪口边。谢谢你们陪我耗这一小会儿。一个人等着，我总忍不住又去拎它。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 55
        },
        {
          "id": "B.CW.R1.CWQ09",
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "篓底还数吗？",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 57
        },
        {
          "id": "B.CW.R1.CWQ10",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "不数了。交货的人只要它不漏东西，又没叫我报数。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 59
        },
        {
          "id": "B.CW.R1.CWC01",
          "speaker": "璃",
          "portrait": "hero",
          "text": "这只篓是你自己编的？篓底看着很密。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 63
        },
        {
          "id": "B.CW.R1.CWC02",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "那当然。这一圈我拆了两回，换了细篾，装小东西才不往外漏。你摸摸，边也——",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 65
        },
        {
          "id": "B.CW.R1.CWC03",
          "speaker": "旁白",
          "portrait": null,
          "text": "她说着便伸手去提，忽然想起篓里还有住客。那只手在半空停住，改去揉自己的膝盖。",
          "branch": "soft_chat",
          "kind": "narration",
          "sourceLine": 67
        },
        {
          "id": "B.CW.R1.CWC04",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "等它走了再摸。光顾着夸篓子，差点忘了里头还有客人。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 69
        },
        {
          "id": "B.CW.R1.CWC05",
          "speaker": "璃",
          "portrait": "hero",
          "text": "我只问了第一句。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 71
        },
        {
          "id": "B.CW.R1.CWC06",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "后面那些算我送的。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 73
        },
        {
          "id": "B.CW.R1.CWC07",
          "speaker": "旁白",
          "portrait": null,
          "text": "纱雾轻轻碰了碰璃。小兽已从另一侧探出身子，贴着草边钻入低枝。两人都没再回头追着看。",
          "branch": "soft_chat",
          "kind": "narration",
          "sourceLine": 75
        },
        {
          "id": "B.CW.R1.CWC08",
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "它走了。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 77
        },
        {
          "id": "B.CW.R1.CWC09",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "真会挑时候，没听见我还有一个编得特别好的提手。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 79
        },
        {
          "id": "B.CW.R1.CWC10",
          "speaker": "旁白",
          "portrait": null,
          "text": "她捡掉篓中的杉针，朝璃推来一点，等璃轻轻摸过编口才收回。",
          "branch": "soft_chat",
          "kind": "narration",
          "sourceLine": 81
        },
        {
          "id": "B.CW.R1.CWC11",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "我叫岑苇，住溪口边。以后有空过来，夸一句也行，挑毛病也行。先等我把话说完啊。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 83
        },
        {
          "id": "B.CW.R1.CWC12",
          "speaker": "璃",
          "portrait": "hero",
          "text": "这可得看你准备说多长。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 85
        },
        {
          "id": "B.CW.R1.CWL01",
          "speaker": "璃",
          "portrait": "hero",
          "text": "我们先走了。布卷拿开以后，你也离篓口远一点，别急着提。",
          "branch": "leave",
          "kind": "dialogue",
          "sourceLine": 89
        },
        {
          "id": "B.CW.R1.CWL02",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "行，你们忙你们的。我坐这边，总等得到。",
          "branch": "leave",
          "kind": "dialogue",
          "sourceLine": 91
        },
        {
          "id": "B.CW.R1.CWL03",
          "speaker": "旁白",
          "portrait": null,
          "text": "她把布卷垫到身下，抱着膝盖坐稳。璃和纱雾沿原路走开。身后的人没有再伸手去碰篓子。",
          "branch": "leave",
          "kind": "narration",
          "sourceLine": 93
        }
      ],
      "choices": [
        {
          "id": "quiet_wait",
          "label": "安静等一会儿",
          "presentationOnly": true,
          "sourceLine": 35
        },
        {
          "id": "soft_chat",
          "label": "小声问问她的篓子",
          "presentationOnly": true,
          "sourceLine": 36
        },
        {
          "id": "leave",
          "label": "先走，让她自己慢慢等",
          "presentationOnly": true,
          "sourceLine": 37
        }
      ],
      "directives": [],
      "branches": [
        "quiet_wait",
        "soft_chat",
        "leave"
      ],
      "backdropAssetId": "B_ENV_06:cenwei-wait",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "design-original-forest-quests-20261004/design/FIRST-QUEST-FROZEN-TEXT-r3.md",
        "sha256": "c6a9b3263014805427975bb5dcd95943169b89488314ff949bd848c551c08b8e",
        "authorship": "original-B-optional-prose-draft-not-frozen-source-restoration",
        "lineNumberBasis": "actual one-based lines in the file named here, never sources/full-v1.1.md"
      }
    },
    "b05_cenwei_greeting": {
      "id": "b05_cenwei_greeting",
      "title": "溪边的圆篓",
      "regionId": "B-05",
      "turns": [
        {
          "id": "B.CW.R1.CWG00",
          "speaker": "旁白",
          "portrait": null,
          "text": "岸边晒着几只圆篓。短发女人从小盆里拎起一束篾条，弯了弯，又放回水里。看见有人走近，她用手背蹭开脸边的碎发。",
          "branch": "common",
          "kind": "narration",
          "sourceLine": 99
        },
        {
          "id": "B.CW.R1.CWGQ01",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "是你们啊。今天别陪我数，篾条都叠在一起，更数不清。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 103
        },
        {
          "id": "B.CW.R1.CWGQ02",
          "speaker": "璃",
          "portrait": "hero",
          "text": "还要等？",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 105
        },
        {
          "id": "B.CW.R1.CWGQ03",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "水凉了，得多泡一会儿。我早上急着弯，折了一根。你看，白白少一根，倒好数了。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 107
        },
        {
          "id": "B.CW.R1.CWGQ04",
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "你又开始数了。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 109
        },
        {
          "id": "B.CW.R1.CWGQ05",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "没有。这根不用数，看得见。",
          "branch": "quiet_wait",
          "kind": "dialogue",
          "sourceLine": 111
        },
        {
          "id": "B.CW.R1.CWGQ06",
          "speaker": "旁白",
          "portrait": null,
          "text": "她把断篾搁到膝边，腾出石凳的一角。三个人看了一会儿水，谁也没有去催盆里的那一束。",
          "branch": "quiet_wait",
          "kind": "narration",
          "sourceLine": 113
        },
        {
          "id": "B.CW.R1.CWGC01",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "来得正好。上次只讲了篓底，提手还没轮到。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 117
        },
        {
          "id": "B.CW.R1.CWGC02",
          "speaker": "璃",
          "portrait": "hero",
          "text": "我现在走还来得及吗？",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 119
        },
        {
          "id": "B.CW.R1.CWGC03",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "来不及，我都给你让地方了。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 121
        },
        {
          "id": "B.CW.R1.CWGC04",
          "speaker": "旁白",
          "portrait": null,
          "text": "她把身边的布卷往怀里收了收，露出石凳的一角，却没有拿起任何一只篓子。",
          "branch": "soft_chat",
          "kind": "narration",
          "sourceLine": 123
        },
        {
          "id": "B.CW.R1.CWGC05",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "坐吧。水凉以后，篾条要多泡一会儿。今天不用听我讲，陪我看一会儿水就成。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 125
        },
        {
          "id": "B.CW.R1.CWGC06",
          "speaker": "纱雾",
          "portrait": "guide",
          "text": "真不讲？",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 127
        },
        {
          "id": "B.CW.R1.CWGC07",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "先坐下。我尽量。",
          "branch": "soft_chat",
          "kind": "dialogue",
          "sourceLine": 129
        },
        {
          "id": "B.CW.R1.CWGL01",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "上回在林子里的是你们吧？我叫岑苇。那小东西后来自己走了，临走还把篓子踩翻了。",
          "branch": "leave",
          "kind": "dialogue",
          "sourceLine": 133
        },
        {
          "id": "B.CW.R1.CWGL02",
          "speaker": "璃",
          "portrait": "hero",
          "text": "篓子没坏吧？",
          "branch": "leave",
          "kind": "dialogue",
          "sourceLine": 135
        },
        {
          "id": "B.CW.R1.CWGL03",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "没坏。倒是让我找到那根翘起来的篾头了，已经压平。来，坐会儿？这回里面真是空的。",
          "branch": "leave",
          "kind": "dialogue",
          "sourceLine": 137
        },
        {
          "id": "B.CW.R1.CWGL04",
          "speaker": "旁白",
          "portrait": null,
          "text": "她拍拍石凳上的空处，又将一只晒好的篓子翻过来，仔细看了看篓底。",
          "branch": "leave",
          "kind": "narration",
          "sourceLine": 139
        },
        {
          "id": "B.CW.R1.CWGU01",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "要找取水口，再往那边。我这盆只泡篾条，不给人喝的。",
          "branch": "unmet",
          "kind": "dialogue",
          "sourceLine": 143
        },
        {
          "id": "B.CW.R1.CWGU02",
          "speaker": "璃",
          "portrait": "hero",
          "text": "我们就从这里过。",
          "branch": "unmet",
          "kind": "dialogue",
          "sourceLine": 145
        },
        {
          "id": "B.CW.R1.CWGU03",
          "speaker": "岑苇",
          "portrait": "forest_cenwei",
          "text": "那慢慢走。我叫岑苇，篓子若碰着衣角，喊我挪一下。",
          "branch": "unmet",
          "kind": "dialogue",
          "sourceLine": 147
        },
        {
          "id": "B.CW.R1.CWGU04",
          "speaker": "旁白",
          "portrait": null,
          "text": "她将摊在脚边的篾条收拢，给过路的人多让出一点地方。",
          "branch": "unmet",
          "kind": "narration",
          "sourceLine": 149
        }
      ],
      "choices": [],
      "directives": [],
      "branches": [
        "quiet_wait",
        "soft_chat",
        "leave",
        "unmet"
      ],
      "backdropAssetId": "B_ENV_05:cenwei-greeting",
      "allowLegacyBackdropFallback": false,
      "source": {
        "file": "design-original-forest-quests-20261004/design/FIRST-QUEST-FROZEN-TEXT-r3.md",
        "sha256": "c6a9b3263014805427975bb5dcd95943169b89488314ff949bd848c551c08b8e",
        "authorship": "original-B-optional-prose-draft-not-frozen-source-restoration",
        "lineNumberBasis": "actual one-based lines in the file named here, never sources/full-v1.1.md"
      }
    }
  }
};
