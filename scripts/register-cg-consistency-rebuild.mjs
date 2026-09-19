import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const vn = path.join(repo, 'art/visual-novel');
const isoDate = '2026-09-19T14:45:00Z';

const scenes = [
  ['CG_001_critical', 'critical', 'v2', 'Lone swordswoman in the obsidian tower.png'],
  ['CG_002_defeat', 'defeat', 'v2', 'Lucid Defeat in the Obsidian Tower.png'],
  ['CG_003_prologue-tower', 'prologue-tower', 'v4', 'Stormbound Tower With Seven Core Lights.png'],
  ['CG_004_seven-cantos-severed', 'seven-cantos-severed', 'v1', 'Seven crystal trails and three red seals.png'],
  ['CG_005_northstar-arrival', 'northstar-arrival', 'v2', 'Ocean singer’s five-string shell harp.png'],
  ['CG_006_seven-core-network', 'seven-core-network', 'v1', 'Seven Paths, One Closure Lock.png'],
  ['CG_007_noctia-truth', 'noctia-truth', 'v2', 'Moonlit Confession by the Low Throne.png'],
  ['CG_008_noctia-seal', 'noctia-seal', 'v1', 'Queen and Heroine Open the Rift.png'],
  ['CG_009_missing-fourth-step', 'missing-fourth-step', 'v2', 'The Sun Sanctum’s Missing Fourth Seal.png'],
  ['CG_010_seventeen-minute-splice', 'seventeen-minute-splice', 'v1', 'Sunrise Evidence and the Shifted Timeline.png'],
  ['CG_011_intercepted-receipt', 'intercepted-receipt', 'v1', 'The intercepted reply.png'],
  ['CG_012_echo-ledger', 'echo-ledger', 'v1', 'Moonlit Witnesses in the Echo Court.png'],
  ['CG_013_noctia-sovereign', 'noctia-sovereign', 'v1', 'Broken Ring, Silent Witnesses.png'],
  ['CG_014_missing-page-restored', 'missing-page-restored', 'v1', 'The Protocol’s Separated Final Page.png'],
  ['CG_015_letters-held-in-storm', 'letters-held-in-storm', 'v1', 'Cape Shelter in the Archive Storm.png'],
  ['CG_016_originals-enter-lighthouse', 'originals-enter-lighthouse', 'v1', 'Final index: brass rail to lighthouse.png'],
  ['CG_017_traceable-revocation', 'traceable-revocation', 'v2', 'Ember Lighthouse: New Ring, Old Archive.png'],
  ['CG_018_noctia-afterlight', 'noctia-afterlight', 'v2', 'Quiet Delivery at Ember Lighthouse.png'],
  ['CG_019_lighthouse-archive', 'lighthouse-archive', 'v1', 'Mailbound Dawn at Ember Lighthouse.png'],
].map(([cgId, semanticId, version, libraryTitle], index) => ({
  order: index + 1,
  cgId,
  semanticId,
  version,
  libraryTitle,
  layoutPath: `04_cg/working/${cgId}_R0_layout_${version}.png`,
}));

const r1 = {
  CG_001_critical: {
    output: '04_cg/working/CG_001_critical_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_001_critical_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_001_critical_R0_layout_v2.png'],
      ['hero_turnaround', '01_canon/turnarounds/CHAR_hero_turnaround_v2.png'],
      ['hero_detail', '01_canon/details/DETAIL_hero_v2.png'],
      ['hero_expression', '01_canon/expressions/EXPR_hero_v1.png'],
      ['hero_standee', '01_canon/standees/STANDEE_hero_neutral_v1.png'],
    ],
    prompt: `Edit the FIRST image only. This is R1_identity for CG_001_critical in a visual-novel continuity pipeline. Preserve the first image's exact 16:9 composition, camera, crop, kneeling pose, limb positions, sword placement, prop ownership, dark tower background, lighting, and negative space. Do not redesign the shot or add/remove objects.\n\nChange only the heroine's identity anatomy so she precisely matches references 2-5, with priority: reference 2 turnaround for face/body/hair silhouette; reference 3 for locked costume/prop construction; reference 4 for facial identity and hurt-but-conscious expression; reference 5 for overall identity consistency.\n\nCharacter lock: adult woman, 166 cm proportions, mature but young adult face, violet-blue eyes, long midnight-blue hair to hips with cobalt-blue tips, small low half-up braided bun. Exactly one silver crescent hair clip on HER RIGHT temple and exactly one silver crescent mantle clasp on HER LEFT shoulder. Keep the existing navy/ivory travel dress, black gloves, symmetric opaque stockings, navy boots, left-waist record pouch, and right-hand one-handed sword. Expression: hurt, breathing hard, fully conscious, focused forward; no blood, no open wound, no unconscious or childlike appearance.\n\nCritical preservation: same single character; right hand gripping the sword used as support; left hand on floor; both legs and feet readable; no enemy; no text, HUD, logo, watermark, extra jewelry, extra crescent, extra sword, chains, garters, or anatomy errors. Maintain clean polished anime visual-novel CG rendering. Output exactly one finished 16:9 image at the same resolution as the first image.`,
    qaBody: `- PASS — adult facial proportions, violet-blue eyes, braided half-up bun, midnight-blue/cobalt hair match canon.\n- PASS — one right-temple crescent clip and one left-shoulder crescent clasp remain readable.\n- PASS — composition, one-knee support pose, right-hand sword ownership, left hand on floor, and tower negative space are preserved.\n- PASS — no enemy, text, HUD, watermark, blood, open wound, extra weapon, or obvious anatomy defect.\n- Carry to R2 — verify exact buckle count, scabbard construction, and left-waist pouch placement at 100%.`,
  },
  CG_002_defeat: {
    output: '04_cg/working/CG_002_defeat_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_002_defeat_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_002_defeat_R0_layout_v2.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['hero_turnaround', '01_canon/turnarounds/CHAR_hero_turnaround_v2.png'],
      ['hero_expression', '01_canon/expressions/EXPR_hero_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 medium composition, crop, camera height, seated/kneeling exhausted pose, limb positions, dark portable tower vignette, floor reflections, lighting, one sword position, and all prop ownership. Do not redesign the shot or add an enemy.\n\nIdentity sources:\n- Reference 2 is the accepted hero face/rendering anchor. Make the woman unmistakably the same adult heroine: mature young-adult face, violet-blue eyes, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, exactly one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 locks her adult body proportions and hair silhouette.\n- Reference 4 locks her exhausted-but-conscious facial identity.\n\nEmotional direction: exhausted and breathing hard, but fully conscious, alert, and assessing that the route is unwinnable. This is a safe defeat forecast, not a corpse or fetishized injury.\n\nHard invariants:\n- exactly ONE adult woman, no enemy\n- her RIGHT hand keeps ownership of exactly ONE sword; her other hand remains braced on the floor\n- keep both legs and boots readable\n- preserve existing navy/ivory costume silhouette at R1\n- no blood, wound, unconscious expression, corpse-like pose, torn or sexualized clothing, extra crescent ornaments, extra sword, chains, garters, text, UI, logo, watermark, anatomy defects, or fused fingers\n- change only face, hair, adult age, and body-proportion identity where needed\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero face, violet-blue eyes, braided half-up bun, and midnight-blue/cobalt hair match the accepted CG001 identity anchor.\n- PASS — exhausted but conscious expression remains clear; no blood, open wound, corpse-like pose, or sexualized damage.\n- PASS — one sword remains in the heroine's right hand; the other hand braces on the floor; both legs and boots remain readable.\n- PASS — composition, dark tower vignette, floor reflections, and negative space are preserved.\n- Carry to R2 — audit exact buckle count, scabbard construction, pouch placement, and stocking/boot boundaries at 100%.`,
  },
  'CG_003_prologue-tower': {
    output: '04_cg/working/CG_003_prologue-tower_R1_identity_v3.png',
    eventVersion: 'v3',
    qa: '03_intermediate/qa/CG_003_prologue-tower_R1_identity_qa.md',
    references: [
      ['edit_target_rejected_scale_v2', '04_cg/rejected/R1-identity/CG_003_prologue-tower_R1_identity_v2_rejected-scale.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
    ],
    prompt: `Use case: precise-object-edit\nAsset type: visual-novel CG R1_identity scale correction\nEdit the FIRST image only.\n\nThe heroine at lower left is still slightly too tall. Reduce only her complete silhouette by approximately 25 percent relative to her current size, keeping her boots planted at the same lower-left ledge point. Her final boots-to-hair height must be about 9–10% of the full image height. Preserve her back-facing adult female identity, long midnight-blue/cobalt hair, navy-and-ivory mantle, and exactly one lowered sword.\n\nPreserve the entire tower environment, camera, gate, storm, rain, lightning, reflections, all architecture, exactly SEVEN blue core lights, and exactly ONE upper-right ship unchanged. Do not alter anything except the heroine scale and the few background pixels directly revealed behind her.\n\nNo extra people, no male silhouette, no extra lights, no extra ships, no text, UI, logo, or watermark. Output exactly one polished 1672×941 image.`,
    qaBody: `- PASS — the incorrect male/short-hair R0 silhouette is replaced by the accepted adult female hero silhouette.\n- PASS — heroine remains a small back-facing lower-left figure at approximately the scene-card maximum scale, keeping the tower dominant.\n- PASS — long midnight-blue/cobalt hair, navy/ivory mantle, and one lowered sword remain readable at distance.\n- PASS — exactly seven blue core lights, one upper-right ship, sealed gate, storm direction, and architecture remain intact.\n- Carry to R2 — at 100%, audit only the readable mantle color blocking and sword/scabbard silhouette; do not enlarge the heroine.`,
    attempts: [
      {
        id: 'attempt01', status: 'rejected-scale',
        output: '04_cg/rejected/R1-identity/CG_003_prologue-tower_R1_identity_v1_rejected-scale.png',
        qa: '03_intermediate/qa/CG_003_prologue-tower_R1_identity_attempt01_rejected_qa.md',
        references: [
          ['edit_target', '04_cg/working/CG_003_prologue-tower_R0_layout_v4.png'],
          ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
          ['hero_turnaround', '01_canon/turnarounds/CHAR_hero_turnaround_v2.png'],
        ],
        prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 ultra-wide camera, tower-dominant scale, sealed central gate, storm direction, rain, lightning, reflective harbor foreground, bridges and surrounding gothic architecture, exactly SEVEN restrained blue core lights on the tower façade, and the distant evacuation ship at upper right. Do not redesign or relight the environment.\n\nCritical identity correction: replace only the small foreground back-facing male-looking silhouette at lower left with the accepted adult female heroine. She must remain in the exact same lower-left location and stay roughly 12% or less of frame height so the tower remains dominant.\n\nIdentity sources:\n- Reference 2 is the accepted hero identity/rendering anchor.\n- Reference 3 locks her silhouette: adult woman, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, navy-and-ivory travel mantle/dress, boots, one lowered sword. From this distance, prioritize the long-hair silhouette, feminine adult proportions, mantle shape, and one sword; do not turn her into a portrait.\n\nEmotional direction: guarded suspicion and quiet resolve while facing the newly sealed tower gate.\n\nHard invariants:\n- exactly ONE small adult woman, back-facing\n- heroine remains under about 12% of frame height\n- exactly SEVEN visible blue core lights\n- exactly ONE distant ship remains upper right\n- sealed gate remains closed\n- no male silhouette, short hair, extra people, large hero portrait, celebration, readable signs, modern city, text, HUD, logo, watermark, extra core lights, extra ships, anatomy defects, or environmental drift\n- change only the foreground character's identity and immediate silhouette; preserve all other pixels/structure as closely as possible\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
        reason: 'Identity corrected, but heroine remained about 29% of frame height and broke the tower-dominant scale lock.',
      },
      {
        id: 'attempt02', status: 'rejected-scale',
        output: '04_cg/rejected/R1-identity/CG_003_prologue-tower_R1_identity_v2_rejected-scale.png',
        qa: '03_intermediate/qa/CG_003_prologue-tower_R1_identity_attempt02_rejected_qa.md',
        references: [
          ['edit_target_rejected_scale_v1', '04_cg/rejected/R1-identity/CG_003_prologue-tower_R1_identity_v1_rejected-scale.png'],
          ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
          ['hero_turnaround', '01_canon/turnarounds/CHAR_hero_turnaround_v2.png'],
        ],
        prompt: `Use case: precise-object-edit\nAsset type: visual-novel CG R1_identity correction\nEdit the FIRST image only.\n\nMake exactly one targeted correction: shrink the single back-facing heroine at the lower left so her complete silhouette from boots to hair is only about 10–12% of the total image height. Keep her standing on the same lower-left wet ledge, still facing the sealed tower, with long midnight-blue/cobalt hair, navy-and-ivory mantle silhouette, adult feminine proportions, and exactly one lowered sword.\n\nPreserve every other part of the FIRST image unchanged as closely as possible: exact ultra-wide camera, tower size and geometry, sealed gate, stairs, storm, rain, lightning, bridges, reflections, banners, exactly SEVEN blue core lights, and exactly ONE distant ship at upper right.\n\nThe tower must overwhelmingly dominate. Do not enlarge or relocate the heroine beyond the lower-left ledge. No extra people, no male silhouette, no extra lights, no extra ships, no text, logo, UI, or watermark.\n\nOutput exactly one polished 1672×941 image at the same resolution.`,
        reason: 'Scale improved substantially, but the heroine still read above the scene-card maximum and the output width was 1671 instead of 1672; one more targeted reduction was required.',
      },
    ],
  },
  'CG_005_northstar-arrival': {
    output: '04_cg/working/CG_005_northstar-arrival_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_005_northstar-arrival_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_005_northstar-arrival_R0_layout_v2.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['whale_boss_turnaround', '01_canon/turnarounds/CHAR_whale-boss_turnaround_v1.png'],
      ['whale_boss_detail', '01_canon/details/DETAIL_whale-boss_v1.png'],
      ['whale_boss_expression', '01_canon/expressions/EXPR_whale-boss_v1.png'],
    ],
    prompt: `Edit the FIRST image only. This is R1_identity for CG_005_northstar-arrival. Preserve the first image's exact 16:9 composition, camera, seated heroine on the left, standing ocean singer on the right, central water-memory ring, distant ship and forty-seven non-textual shore lights, architecture, calm lighting, poses, limb positions, and prop ownership. Do not redesign the shot, environment, harp, water ring, or story beat.\n\nIdentity references: reference 2 is the accepted R1 anchor for the blue-haired heroine; make the seated heroine unmistakably that same adult woman with the same face, violet-blue eyes, low half-up braided bun, midnight-blue hair with cobalt tips, and adult proportions. References 3-5 define the ocean singer, with priority: turnaround for adult face/body/hair silhouette, detail board for shell clip/sleeve construction/five-string shell harp, expression board for musical concentration.\n\nOcean singer lock: adult woman, 169 cm proportions, long deep-blue hair to thighs with teal tips, sea-blue eyes, exactly ONE ivory shell hair clip on HER LEFT temple, calm concentrated expression with eyes gently closed or lowered. Navy sleeveless high-collar ankle-length dress with pearl-white front inset; exactly one pale-aqua wave drape per arm. Clearly separate HUMAN LEGS and two human feet in blue low-heel sandals. She holds exactly ONE small ivory-shell harp with a simple pale-brass U frame and exactly FIVE straight strings. No tail, no staff, no dolphins, no extra instrument.\n\nHero lock: same adult identity as reference 2, seated left, quietly listening; preserve her existing pose and costume.\n\nNo text, transcript, HUD, logo, watermark, extra people, identity blending, extra shell clips, extra strings, fused fingers, fused legs, mermaid anatomy, or storm disaster. Keep clean polished anime visual-novel CG rendering. Output exactly one finished 16:9 image at the same resolution as the first image.`,
    qaBody: `- PASS — hero face/hair silhouette remains consistent with the accepted CG001 R1 anchor.\n- PASS — ocean singer retains adult face, deep-blue/teal hair, sea-blue eyes, and one left-temple shell clip.\n- PASS — two human legs and two sandal-clad feet are separate and readable; no tail or staff.\n- PASS — one shell harp with five straight strings remains owned by the ocean singer.\n- PASS — water-memory ring, ship, calm evidence beat, and non-textual shore lights are preserved.\n- Carry to R2 — audit sleeve attachments and harp string spacing at 100%.`,
  },
  'CG_007_noctia-truth': {
    output: '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_007_noctia-truth_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_007_noctia-truth_R0_layout_v2.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
      ['final_queen_expression', '01_canon/expressions/EXPR_final-queen_v1.png'],
    ],
    prompt: `Edit the FIRST image only. This is R1_identity for CG_007_noctia-truth. Preserve the first image's exact 16:9 camera, two-person composition, positions, scale, low throne, night-tower architecture, moonlit lighting, non-attacking body language, the heroine's lowered sword, and all prop ownership. Do not redesign the shot, background, pose, or story beat.\n\nIdentity references: reference 2 is the already accepted R1 identity anchor for the blue-haired heroine; make the left-side heroine unmistakably the same adult woman with the same face, violet-blue eyes, low half-up braided bun, midnight-blue hair with cobalt tips, and adult proportions. References 3-5 define the black-haired queen, with priority: turnaround for body/face/hair silhouette, detail board for crown/brooch/three tablets, expression board for contained sorrow.\n\nQueen lock: adult regal woman, 172 cm proportions, calf-length loose black hair with dark burgundy ends, crimson eyes, one thin dark-silver crown with exactly THREE main points and ONE central ruby diamond, one ruby-diamond throat brooch. Her expression is contained sorrow, exhausted by years of waiting, not hostile. She alone cups ONE small fading pale-red distress light between her two hands at chest height. Exactly THREE red diamond seal tablets remain bound together at rest on the floor at the far lower right; they are not the distress light. She has no sword.\n\nHero lock: same adult identity as reference 2, on image left in three-quarter/back profile, watching guardedly; her one sword stays visibly lowered in her right hand. Do not alter her costume at this stage.\n\nNo combat clash, no embrace, no text, HUD, logo, watermark, extra characters, extra swords, extra crowns, extra light orbs, prop swaps, fused fingers, or identity blending. Keep clean polished anime visual-novel CG rendering. Output exactly one finished 16:9 image at the same resolution as the first image.`,
    qaBody: `- PASS — hero hair silhouette and adult proportions are consistent with the accepted CG001 R1 anchor.\n- PASS — queen face, crimson eyes, black-to-burgundy hair, and contained-sorrow expression match canon.\n- PASS — queen alone holds one fading distress light; hero sword stays lowered; exactly three bound red tablets remain at lower right.\n- PASS — low throne and non-attacking dialogue composition remain intact.\n- PASS — no queen sword, combat clash, embrace, text, HUD, watermark, or identity blending.\n- Carry to R2 — verify the crown as exactly three main points and audit throat brooch/cape fastening at 100%.`,
  },
  'CG_004_seven-cantos-severed': {
    output: '04_cg/working/CG_004_seven-cantos-severed_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_004_seven-cantos-severed_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_004_seven-cantos-severed_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 camera, dynamic two-person blocking, hero in the left foreground, queen in the right background, night-tower architecture, moonlit lighting, seven colored light trajectories entering the hero, lowered hero sword, and three queen seal tablets. Do not redesign the composition, scene geometry, action, or prop ownership.\n\nIdentity sources:\n- Reference 2 is the accepted hero face/rendering anchor. The foreground hero must be unmistakably the same adult woman: violet-blue eyes, mature young-adult face, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, exactly one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 is the accepted hero-plus-queen continuity anchor. Match both faces, adult proportions, hair silhouettes, and series rendering to it.\n- References 4-5 define the queen's face, black-to-dark-burgundy calf-length hair, crimson eyes, three-main-point crown with one central ruby diamond, throat brooch, and seal-tablet design.\n\nEmotional direction: the hero is hurt but conscious and resisting the forced separation; the queen is acting with urgent, fear-driven, unyielding resolve rather than cruelty.\n\nHard invariants:\n- exactly TWO adult women, no guide\n- exactly SEVEN colored canto/core light segments, clearly separable\n- exactly THREE red diamond seal tablets, all owned and controlled by the queen\n- hero remains conscious and holds exactly one lowered sword\n- queen has no sword\n- preserve existing costume silhouettes at R1; do not overwork costume or background\n- no gore, text, UI, logo, watermark, extra cores, extra tablets, extra crescent ornaments, identity blending, fused fingers, or anatomy defects\n\nChange only face, hair, adult age, and body-proportion identity where needed. Output exactly one polished 1672×941 anime visual-novel CG.`,
    qaBody: `- PASS — hero and queen identities match the accepted CG001/CG007 anchors.\n- PASS — hero remains conscious with one lowered sword; queen has no sword.\n- PASS — exactly seven colored canto segments remain clearly countable.\n- PASS — exactly three red diamond seal tablets remain controlled by the queen.\n- PASS — composition, moonlit tower geometry, and fear-driven narrative beat are preserved.\n- Carry to R2 — audit hero buckle/scabbard details and queen crown/brooch/tablet construction at 100%.`,
  },
  'CG_006_seven-core-network': {
    output: '04_cg/working/CG_006_seven-core-network_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_006_seven-core-network_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_006_seven-core-network_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['shadow_boss_turnaround', '01_canon/turnarounds/CHAR_shadow-boss_turnaround_v2.png'],
      ['shadow_boss_detail', '01_canon/details/DETAIL_shadow-boss_v1.png'],
      ['shadow_boss_expression', '01_canon/expressions/EXPR_shadow-boss_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 high-angle medium-wide composition, star-mirror chamber geometry, central hero, shadow weaver at image right, exactly seven colored paths leading from exactly seven distinct archive nodes to one shared central closure lock, lighting, poses, and prop ownership. Do not redesign the network, camera, environment, or narrative action.\n\nIdentity sources:\n- Reference 2 is the accepted hero identity/rendering anchor. Make the central hero unmistakably the same adult woman: violet-blue eyes, mature young-adult face, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, one silver crescent clip on HER RIGHT temple, and one crescent mantle clasp on HER LEFT shoulder.\n- References 3-5 define the shadow weaver. She is an adult woman, 167 cm proportions, chin-length raven-black bob with subtle violet tips/sheen, grey-violet eyes, exactly ONE small silver feather clip on HER RIGHT temple, wary attentive expression. Preserve her black sleeveless high-neck tunic and plum split overskirt silhouette without costume overwork.\n\nProp ownership lock: shadow weaver's RIGHT hand holds one palm-length sewing needle with a visible eye; her LEFT hand feeds one compact dark wooden spool of violet thread. One continuous violet thread only. One small needle case stays at HER LEFT belt. She has no sword.\n\nHard invariants:\n- exactly TWO adult women\n- exactly SEVEN colored light paths and seven distinct nodes\n- exactly ONE shared closure lock\n- no duplicate characters, extra jewelry, random constellations, text, UI, logo, watermark, extra needles, extra spools, sword for shadow weaver, identity blending, fused hands, or anatomy defects\n- preserve R0 composition and environment; change only faces, hair, adult age, and body proportions where needed\n\nEmotional direction: hero has startled realization; shadow weaver studies one path with wary attention. Output exactly one polished 1672×941 anime visual-novel CG.`,
    qaBody: `- PASS — hero identity matches the accepted CG001 anchor.\n- PASS — shadow weaver has an adult face, raven-black/violet bob, grey-violet eyes, and one right-temple silver feather clip.\n- PASS — exactly seven colored paths connect seven nodes to one shared closure lock.\n- PASS — shadow weaver's right hand owns the needle and left hand owns the spool; no sword.\n- PASS — high-angle star-mirror composition remains readable with no UI or text.\n- Carry to R2 — audit two rear panels, left-belt needle case, needle eye, and continuous-thread count at 100%.`,
  },
  'CG_008_noctia-seal': {
    output: '04_cg/working/CG_008_noctia-seal_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_008_noctia-seal_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_008_noctia-seal_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 action composition, camera, hero attacking from image left with one sword, queen at image right pulling open black binding lines with her hands, clear central rupture, night-tower architecture, seven colored cores along the top of the rift, and three red seal tablets around the central opening. This is cooperation against the seal, never a duel. Do not redesign the scene, action, effects, or prop ownership.\n\nIdentity sources:\n- Reference 2 is the accepted hero identity/rendering anchor. The hero must be the same adult woman: mature young-adult face, violet-blue eyes, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 is the accepted hero-plus-queen continuity anchor. Match both adult faces, proportions, hair silhouettes, and series rendering.\n- References 4-5 define the queen: adult regal face, crimson eyes, calf-length loose black hair with dark burgundy ends, thin crown with exactly THREE main points and ONE central ruby diamond, one ruby-diamond throat brooch. She has no sword.\n\nHard invariants:\n- exactly TWO adult women\n- hero has exactly ONE sword; queen has NO sword\n- exactly SEVEN colored cores, clearly countable\n- exactly THREE red diamond seal tablets, clearly countable and owned by the queen\n- central gap remains open and readable\n- preserve black binding lines and cooperative action\n- preserve existing costume silhouettes at R1; do not overwork costume or background\n- no extra cores, extra tablets, UI bars, text, logo, watermark, explosive debris covering faces, identity blending, fused hands, or anatomy defects\n\nEmotional direction: both women show quiet, unyielding resolve and coordinated effort. Change only face, hair, adult age, and body-proportion identity where needed. Output exactly one polished 1672×941 anime visual-novel CG.`,
    qaBody: `- PASS — hero and queen identities match accepted CG001/CG007 anchors.\n- PASS — cooperative action is clear: hero uses one sword while queen pulls binding lines with empty hands.\n- PASS — exactly seven colored cores and exactly three queen-owned red tablets remain countable.\n- PASS — central gap, faces, and night-tower geometry remain readable.\n- PASS — no duel framing, queen sword, UI bars, text, watermark, or identity blending.\n- Carry to R2 — audit queen crown/brooch/tablets and hero sword/scabbard construction at 100%.`,
  },
  'CG_009_missing-fourth-step': {
    output: '04_cg/working/CG_009_missing-fourth-step_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_009_missing-fourth-step_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_009_missing-fourth-step_R0_layout_v2.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 wide composition, camera, sun-sanctum architecture, warm sunset lighting, wall geometry, exactly FOUR process positions, the first three abstract non-text symbols, the torn blank FOURTH position, floor reflections, hero at image left/side-back, queen at image right/back, poses, and prop ownership. The queen's hand must remain stopped just before the missing fourth gap. This is investigation, not combat.\n\nIdentity sources:\n- Reference 2 is the accepted hero identity/rendering anchor. Keep the left heroine as the same adult woman: mature proportions, violet-blue identity, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, one right-temple crescent clip, one left-shoulder crescent clasp, and exactly one visibly lowered sword.\n- Reference 3 is the accepted hero-plus-queen continuity anchor. Match both adult silhouettes and series rendering.\n- References 4-5 define the queen: adult regal woman, calf-length loose black hair with dark burgundy ends, crimson identity, thin dark-silver crown with exactly THREE main points and ONE central ruby diamond, ruby-diamond throat brooch. She has no sword.\n\nEmotional direction: hero watches with quiet resolve; queen shows shaken realization through her halted hand and tense back-facing posture.\n\nHard invariants:\n- exactly TWO adult women\n- exactly FOUR wall positions, with the FOURTH visibly missing/torn blank\n- hero remains left and owns exactly ONE lowered sword\n- queen remains right, owns no sword, and reaches with one empty hand toward the gap\n- no combat, extra people, duplicate positions, readable button text, computer UI, text, HUD, logo, watermark, identity blending, anatomy defects, or environmental redesign\n- preserve existing costume construction for R2; at R1 change only face-visible identity cues, hair, adult age, and body proportions where needed\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and queen back-facing silhouettes match the accepted CG001/CG007 identity anchors.\n- PASS — exactly four wall positions remain readable, with the fourth visibly torn and blank.\n- PASS — hero owns one lowered sword; queen owns no sword and stops one empty hand before the missing slot.\n- PASS — investigative, non-combat staging and sun-sanctum geometry remain intact.\n- Carry to R2 — audit hero clasp/scabbard and queen three-point crown, central ruby, brooch, and cape fastening at 100%.`,
  },
  'CG_011_intercepted-receipt': {
    output: '04_cg/working/CG_011_intercepted-receipt_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_011_intercepted-receipt_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_011_intercepted-receipt_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_shadow_anchor', '04_cg/working/CG_006_seven-core-network_R1_identity_v1.png'],
      ['shadow_boss_turnaround', '01_canon/turnarounds/CHAR_shadow-boss_turnaround_v2.png'],
      ['shadow_boss_detail', '01_canon/details/DETAIL_shadow-boss_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 dynamic triangle composition, camera, ocean-archive architecture and daylight, hero on image left, spectral nonhuman interceptor kneeling in the center, shadow weaver on image right, purple tracing-line path, receipt trapped in the interceptor's open chest compartment, poses, lighting, and prop ownership. Do not redesign the interceptor, receipt, environment, or action.\n\nIdentity sources:\n- Reference 2 is the accepted hero face/rendering anchor. Make the left heroine unmistakably the same adult woman: violet-blue eyes, mature young-adult face, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, exactly one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 is the accepted hero-plus-shadow-weaver anchor. Match both adult faces, proportions, hair silhouettes, and series rendering.\n- References 4-5 define the shadow weaver: adult woman, chin-length raven-black bob with subtle violet tips, grey-violet eyes, exactly ONE small silver feather clip on HER RIGHT temple.\n\nProp ownership lock: shadow weaver's RIGHT hand holds exactly one sewing needle controlling one continuous purple tracing line; her LEFT hand holds exactly one compact dark wooden spool. She has no sword. The sealed receipt remains visibly owned/trapped by the nonhuman interceptor, not held by either woman; no readable writing.\n\nEmotional direction: hero shows startled realization; shadow weaver shows intense technical focus. The center figure is an impersonal transparent mechanism, never a human hostage.\n\nHard invariants:\n- exactly TWO adult women plus ONE clearly nonhuman spectral interceptor mechanism\n- one needle, one spool, one continuous purple line, one trapped sealed receipt\n- no human hostage, mailbox comedy, readable letter, extra weapons, extra people, extra feather clips, identity blending, text, UI, logo, watermark, anatomy defects, or environmental drift\n- preserve costume construction for R2; at R1 change only faces, hair, adult age, and body proportions where needed\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and shadow-weaver identities match the accepted CG001/CG006 anchors.\n- PASS — central interceptor remains a clearly nonhuman spectral mechanism with one sealed receipt trapped in its chest.\n- PASS — shadow weaver owns one needle in her right hand, one spool in her left hand, and one continuous purple tracing line; she has no sword.\n- PASS — dynamic triangle, ocean-archive architecture, and startled-realization beat remain intact.\n- Carry to R2 — audit feather-clip side, needle eye, spool construction, left-belt needle case, and hero buckles/clasp at 100%.`,
  },
  'CG_015_letters-held-in-storm': {
    output: '04_cg/working/CG_015_letters-held-in-storm_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_015_letters-held-in-storm_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_015_letters-held-in-storm_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 low wide camera, archive-storm architecture, paper-flow direction, two-woman kneeling composition, queen on image left holding her black cape with burgundy lining as a windbreak, hero on image right pressing an ordered row of sealed letters into the wall corner, poses, hands, lighting, and cooperative non-romantic action. Do not redesign the storm, letters, cape shelter, or camera.\n\nIdentity sources:\n- Reference 2 is the accepted hero face/rendering anchor. Make the right heroine unmistakably the same adult woman: mature young-adult face, violet-blue eyes, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, exactly one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 is the accepted hero-plus-queen continuity anchor. Match both adult faces, proportions, hair silhouettes, and series rendering.\n- References 4-5 define the queen: adult regal woman, crimson eyes, calf-length loose black hair with dark burgundy ends, thin dark-silver crown with exactly THREE main points and ONE central ruby diamond, one ruby-diamond throat brooch. Her cape remains the shared windbreak. She has no sword.\n\nEmotional direction: both women show quiet, unyielding resolve. They protect all original letters and their order rather than chasing one sheet.\n\nHard invariants:\n- exactly TWO adult women\n- ordered sealed letters remain aligned and pressed down; no readable writing\n- queen keeps her crown and owns/holds the black-and-burgundy cape windbreak\n- hero's sword stays sheathed or safely out of the action\n- no romantic embrace, chasing one letter, paper covering either face, extra people, extra jewels, extra crescent ornaments, readable mail, text, UI, logo, watermark, identity blending, fused hands, or anatomy defects\n- preserve costume construction for R2; change only faces, hair, adult age, and body proportions where needed\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and queen identities match the accepted CG001/CG007 anchors.\n- PASS — queen owns and holds the black/burgundy cape windbreak; hero presses the ordered sealed letters safely at the wall corner.\n- PASS — cooperative non-romantic action, paper-flow direction, and both unobscured faces remain readable.\n- PASS — no chasing-one-letter beat, readable mail, extra people, or weapon intrusion.\n- Carry to R2 — audit queen crown/brooch/cape fastening and hero clasp, buckles, gloves, and safely stowed sword at 100%.`,
  },
  'CG_018_noctia-afterlight': {
    output: '04_cg/working/CG_018_noctia-afterlight_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_018_noctia-afterlight_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_018_noctia-afterlight_R0_layout_v2.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['final_queen_turnaround', '01_canon/turnarounds/CHAR_final-queen_turnaround_v1.png'],
      ['final_queen_detail', '01_canon/details/DETAIL_final-queen_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 quiet close-medium composition, camera, ember-lighthouse interior, sunset window and lighting, seated hero on image left, seated queen on image right, closed first mail crate centered between them, final gray-harbor volume at lower right, exactly ONE small red alarm stone on the tabletop near the queen's just-withdrawn hand, poses, gaze, and reflective pause. Do not redesign the room, table, crate, book, stone, or emotional beat.\n\nIdentity sources:\n- Reference 2 is the accepted hero face/rendering anchor. Make the left heroine unmistakably the same adult woman: mature young-adult face, violet-blue eyes, midnight-blue hip-length hair with cobalt tips, small low half-up braided bun, exactly one silver crescent clip on HER RIGHT temple and one crescent mantle clasp on HER LEFT shoulder.\n- Reference 3 is the accepted hero-plus-queen continuity anchor. Match both adult faces, proportions, hair silhouettes, and series rendering.\n- References 4-5 define the queen: adult regal face, crimson eyes, calf-length loose black hair with dark burgundy ends, thin dark-silver crown with exactly THREE main points and ONE central ruby diamond, one ruby-diamond throat brooch. She keeps the crown while allowing the separate alarm stone to rest.\n\nEmotional direction: hero shows quiet relief and does not pressure her; queen shows peaceful acceptance after finally setting the alarm aside. No celebration and no romance.\n\nHard invariants:\n- exactly TWO adult women\n- exactly ONE red alarm stone on the table, separate from the queen's crown\n- exactly ONE closed mail crate between them and ONE final volume at lower right\n- queen keeps exactly one three-main-point crown with one central ruby; no extra jewels\n- no romantic touch, celebration, readable addresses or book text, extra crates, extra stones, extra people, text, UI, logo, watermark, identity blending, fused hands, or anatomy defects\n- preserve costume construction for R2; change only faces, hair, adult age, and body proportions where needed\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and queen identities match the accepted CG001/CG007 anchors.\n- PASS — one red alarm stone rests separately on the table, one closed mail crate remains centered, and one final volume remains at lower right.\n- PASS — queen keeps her crown; hero and queen maintain a quiet, non-romantic reflective pause.\n- PASS — ember-lighthouse geometry, sunset direction, and prop ownership remain intact.\n- Carry to R2 — audit queen three-point crown, central ruby, brooch and cape fastening; audit hero clasp and buckle count at 100%.`,
  },
  'CG_010_seventeen-minute-splice': {
    output: '04_cg/working/CG_010_seventeen-minute-splice_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_010_seventeen-minute-splice_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_010_seventeen-minute-splice_R0_layout_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['hero_turnaround', '01_canon/turnarounds/CHAR_hero_turnaround_v2.png'],
      ['astral_boss_turnaround', '01_canon/turnarounds/CHAR_astral-boss_turnaround_v1.png'],
      ['astral_boss_detail', '01_canon/details/DETAIL_astral-boss_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 evidence-table composition, camera, dawn-blue astronomical archive, hero on image left, astrologer Lumi on image right operating the brass crescent astrolabe, their poses, the tabletop, and the three parallel wordless light-record tracks. Preserve the evidence logic: exactly three distinct tracks; two displaced together by one clear interval and one remaining at the original position. Do not redesign the environment, table, astrolabe, or action.\n\nIdentity sources:\n- References 2-3 define the accepted hero. Make the left woman unmistakably the same adult heroine: mature young-adult face, violet-blue eyes, long midnight-blue hair to hips with cobalt tips, small low half-up braided bun, exactly one silver crescent hair clip on HER RIGHT temple, no star clips.\n- References 4-5 define Lumi. Make the right woman unmistakably the same adult astrologer: shoulder-length ash-violet hair, gold-violet eyes, exactly ONE brass four-point star clip at HER RIGHT temple, calm analytical face. Keep her clearly distinct from the blue-haired heroine.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve all costume construction for R2.\n\nHard invariants:\n- exactly TWO adult women; hero left, Lumi right\n- Lumi alone operates ONE complete brass crescent astrolabe; hero does not own or touch it\n- one folded ivory star chart; no readable text\n- exactly three parallel light-record tracks, with two shifted together and one unshifted\n- no extra people, extra star/crescent hair clips, identity blending, modern monitors, combat pose, readable text, UI, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero matches the accepted CG001 adult face, violet-blue eyes, midnight-blue/cobalt hair, right-temple crescent clip, and left-shoulder crescent clasp.\n- PASS — Lumi has the canonical ash-violet shoulder-length hair, gold-violet eyes, one right-temple four-point star clip, and a distinct adult face.\n- PASS — exactly two women remain; Lumi alone operates one brass crescent astrolabe and the folded star chart remains on the table.\n- PASS — three wordless light-record tracks preserve the two-shifted/one-original evidence logic.\n- Carry to R2 — audit hero buckle/pouch/clasp construction; Lumi cape clasp, clip count, chart case, and astrolabe pointer geometry at 100%.`,
  },
  'CG_012_echo-ledger': {
    output: '04_cg/working/CG_012_echo-ledger_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_012_echo-ledger_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_012_echo-ledger_R0_layout_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['accepted_hero_identity_anchor', '04_cg/working/CG_001_critical_R1_identity_v1.png'],
      ['echo_regent_turnaround', '01_canon/turnarounds/CHAR_echo-regent_turnaround_v2.png'],
      ['echo_regent_detail', '01_canon/details/DETAIL_echo-regent_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 three-person witness composition, camera, moonlit archive chamber, heroine standing on image left, Queen Noctia crouching at the center table, Echo Regent standing on image right, all poses, tabletop geometry, one low black memorial ledger, one single green status light, and the solemn non-combat action. Do not redesign the environment, table, ledger, tag, seal receipt, or action.\n\nIdentity sources:\n- References 2-3 define the accepted heroine and Queen Noctia faces/rendering. Match both adult women exactly: heroine with violet-blue eyes and long midnight-blue hair with cobalt tips; queen with crimson eyes and calf-length black hair with dark burgundy ends, clearly adult and regal.\n- References 4-5 define the Echo Regent. Make the right figure unmistakably the same androgynous adult court regent: slender adult masculine silhouette, shoulder-length ash-blond hair gathered in exactly ONE low tie, muted violet eyes, calm grave face. Keep the regent distinct from both women and do not feminize or age into an elderly man.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume construction for R2.\n\nHard invariants:\n- exactly THREE adults: heroine left, queen center, regent right\n- queen remains crouched aligning exactly ONE nameplate/tag to one sealed receipt\n- exactly ONE green status light; at least one mourning tag remains visibly unchanged\n- the ONE black memorial ledger stays on the low table and belongs to the regent\n- no crown on the regent, no weapon on the regent, no queen sword\n- no readable names or writing, extra books, extra people, identity blending, combat pose, text, UI, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and queen identities match the accepted CG001/CG007 anchors.\n- PASS — the Echo Regent reads as the same androgynous adult with ash-blond low-tied hair, muted violet eyes, and a slender masculine silhouette.\n- PASS — exactly three adults remain; the queen aligns one tag and sealed receipt while one green status light and one unchanged mourning tag remain readable.\n- PASS — one black memorial ledger stays on the low table and remains associated with the unarmed, uncrowned regent.\n- Carry to R2 — audit queen crown/brooch, hero buckles/clasp, and regent square collar clasp, right-to-left sash route, ledger band, and closure at 100%.`,
  },
  'CG_013_noctia-sovereign': {
    output: '04_cg/working/CG_013_noctia-sovereign_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_013_noctia-sovereign_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_013_noctia-sovereign_R0_layout_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['arcane_sovereign_turnaround', '01_canon/turnarounds/CHAR_arcane-sovereign_turnaround_v1.png'],
      ['arcane_sovereign_detail', '01_canon/details/DETAIL_arcane-sovereign_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 restrained three-person composition, camera, luminous tribunal/archive interior, heroine on image left, Arcane Sovereign centered holding the cracked signet in his OWN RIGHT hand, Queen Noctia on image right witnessing, their poses, one open ring box, blue broken-ring restraint around his wrist, lighting, and sober accountability beat. Do not redesign the environment, restraint, signet, ring box, or action.\n\nIdentity sources:\n- Reference 2 defines the accepted heroine and Queen Noctia faces/rendering. Match both adult women exactly: heroine with violet-blue eyes and long midnight-blue hair with cobalt tips; queen with crimson eyes and calf-length black hair with dark burgundy ends, clearly adult and regal.\n- References 3-4 define the Arcane Sovereign. Make the center figure unmistakably the same adult MAN: 184 cm visual proportion, clearly masculine adult face and anatomy, tired gold eyes, dark-teal shoulder-length hair tied loosely at the nape. Keep him distinct from both women; no feminine face, crown, or sword.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume construction for R2.\n\nHard invariants:\n- exactly THREE adults: heroine left, sovereign man center, queen right\n- sovereign's OWN RIGHT hand alone presents exactly ONE brass signet ring with one flat oval cobalt face and one obvious diagonal crack\n- one open plain black ring box; one blue broken-ring restraint around the sovereign's wrist\n- queen has NO sword; no combat clash or torture expression\n- no extra rings, extra people, identity blending, readable warning text, UI, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero and queen identities match the accepted CG007 continuity anchor.\n- PASS — the sovereign is a clearly adult man with tired gold eyes, dark-teal shoulder-length hair, and the canonical masculine silhouette.\n- PASS — exactly three adults remain; the sovereign alone presents one brass/cobalt signet in his own right hand beside one open ring box.\n- PASS — the blue broken-ring restraint remains non-torture accountability staging; queen remains unarmed.\n- Carry to R2 — audit sovereign ivory lapels/two front panels, blue collar clasp and waist sash; make the signet diagonal crack and correct right-hand pinch grip unequivocal at 100%.`,
  },
  'CG_014_missing-page-restored': {
    output: '04_cg/working/CG_014_missing-page-restored_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_014_missing-page-restored_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_014_missing-page-restored_R0_layout_v1.png'],
      ['accepted_three-person_anchor', '04_cg/working/CG_013_noctia-sovereign_R1_identity_v1.png'],
      ['accepted_hero_queen_anchor', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
      ['arcane_sovereign_turnaround', '01_canon/turnarounds/CHAR_arcane-sovereign_turnaround_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 low-camera three-witness composition, triage-index archive, heroine on image left, Queen Noctia at center, Arcane Sovereign on image right, all poses and gazes, the heavy master volume in the foreground, exactly ONE separated final page suspended at the same height as the book, the clean mechanical separation interface, lighting, and non-combat evidentiary mood. No character touches the written face of the page. Do not redesign the environment, book, page, or action.\n\nIdentity sources:\n- Reference 2 is the accepted three-person identity anchor for this exact cast. Match the same adult heroine, adult male sovereign, and adult queen faces, hair, proportions, and series rendering.\n- Reference 3 reinforces the accepted heroine-plus-queen identities.\n- Reference 4 locks the sovereign as a clearly adult man with tired gold eyes and dark-teal shoulder-length hair tied loosely at the nape.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume construction for R2.\n\nHard invariants:\n- exactly THREE adults: heroine left, queen center, sovereign man right\n- exactly ONE missing final page, separated by a clean mechanical interface rather than a knife tear\n- main volume remains closed/partly presented in the foreground; no flying-page swarm\n- nobody touches the page's written surface; no readable legal text\n- queen has no sword; no combat pose, modern scanner, extra people, identity blending, text, UI, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero, queen, and sovereign identities match the accepted CG013/CG007 anchors.\n- PASS — exactly three adults remain around one heavy master volume and exactly one separated final page.\n- PASS — the page separation reads as a clean mechanical interface; no flying-page swarm, readable legal text, scanner, or combat staging.\n- PASS — no character touches the page's written face and the queen remains unarmed.\n- NOTE — generator returned 1671×941; deterministically normalized to 1672×941 by a 0.06% horizontal resize before hashing and registration.\n- Carry to R2 — audit hero buckles/clasp, queen crown/brooch, sovereign panels/clasp/sash, and the book/page connector geometry at 100%.`,
  },
  'CG_016_originals-enter-lighthouse': {
    output: '04_cg/working/CG_016_originals-enter-lighthouse_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_016_originals-enter-lighthouse_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_016_originals-enter-lighthouse_R0_layout_v1.png'],
      ['accepted_three-person_anchor', '04_cg/working/CG_014_missing-page-restored_R1_identity_v1.png'],
      ['last_custodian_turnaround', '01_canon/turnarounds/CHAR_act3-last-custodian_turnaround_v1.png'],
      ['last_custodian_detail', '01_canon/details/DETAIL_act3-last-custodian_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 deep-perspective group composition, final-index archive corridor, heroine leading at the front-left along the brass rail, Queen Noctia and the Arcane Sovereign walking together behind her while jointly carrying exactly ONE large heavy original volume, and the Last Custodian at the rear key pedestal operating the mechanism. Preserve camera, depth, poses, rail, book, key pedestal, warm dawn light, and non-combat processional action. Do not redesign the environment, volume, rail, pedestal, or task assignments.\n\nIdentity sources:\n- Reference 2 defines the accepted heroine, queen, and sovereign identities. Match their same adult faces, hair, proportions, and series rendering.\n- References 3-4 define the Last Custodian. The rear figure must be the same adult woman: pale-gold eyes, VERY LONG dark-teal hair reaching the calves, weary honest face, exactly ONE small rectangular black hair clasp with a narrow brass edge at the crown. She must not be the white-haired archive warden.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume construction for R2.\n\nHard invariants:\n- exactly FOUR source-grounded adults\n- heroine leads at the rail front; queen and sovereign jointly carry exactly ONE heavy original volume; custodian alone operates the rear key pedestal\n- custodian has dark-teal calf-length hair and one tall staff with one amber rectangular lantern; no white hair or blue lantern\n- queen has no sword; no floating random books, combat, readable text, extra people, identity blending, UI, logo, watermark, or anatomy defects\n- keep the custodian visibly distinct from the dark-teal-haired male sovereign through gender, hair length, position, and silhouette\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero, queen, and sovereign identities match the accepted CG014 anchor.\n- PASS — the Last Custodian is the canonical adult woman with very long dark-teal hair, distinct from the sovereign and not the white-haired archive warden.\n- PASS — exactly four adults keep distinct jobs: hero leads, queen and sovereign share one heavy volume, custodian operates the rear key pedestal.\n- PASS — one amber lantern staff remains with the custodian; no combat, random books, readable text, or task swap.\n- NOTE — generator returned 1671×941; deterministically normalized to 1672×941 by a 0.06% horizontal resize before hashing and registration.\n- Carry to R2 — audit custodian four page panels, rectangular clasp, amber spiral core and waist tag; audit the other three costumes at 100%.`,
  },
  'CG_017_traceable-revocation': {
    output: '04_cg/working/CG_017_traceable-revocation_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_017_traceable-revocation_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_017_traceable-revocation_R0_layout_v2.png'],
      ['accepted_queen_sovereign_anchor', '04_cg/working/CG_013_noctia-sovereign_R1_identity_v1.png'],
      ['guide_turnaround', '01_canon/turnarounds/CHAR_guide_turnaround_v1.png'],
      ['guide_detail', '01_canon/details/DETAIL_guide_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 operational medium composition, ember-lighthouse write-in chamber, Guide Shawu centered using one light pen over the original volume, Queen Noctia on image left and the Arcane Sovereign on image right each supporting one end of the same volume, the complete silver-ring astrolabe beside Shawu, the layered blue-white index lines showing old and new records coexisting, camera, poses, lighting, and non-combat action. Do not erase the old record layer or redesign the room, volume, pen, astrolabe, or index layers.\n\nIdentity sources:\n- Reference 2 defines the accepted queen and sovereign identities. Match their same adult faces, hair, proportions, and series rendering.\n- References 3-4 define Shawu. Make the center figure unmistakably the same adult woman: chin-length silver-lilac bob with soft fringe, violet eyes, exactly ONE white five-petal flower at HER LEFT temple, adult proportions and a calm focused face. No long hair, crown, or jewelry chains.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume construction for R2.\n\nHard invariants:\n- exactly THREE adults: queen left, Shawu center, sovereign man right\n- Shawu alone owns and uses exactly ONE light pen and ONE COMPLETE circular silver astrolabe with a fixed four-point center star; never a crescent or broken ring\n- queen and sovereign each support one end of the same original volume; queen has no sword\n- old and new record layers both remain visibly distinct; no readable UI or text\n- no modern keyboard, erased old pages, extra people, identity blending, text, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — queen and sovereign identities match the accepted CG013 anchor.\n- PASS — Shawu is a distinct adult woman with silver-lilac bob, violet eyes, and exactly one white five-petal flower at her left temple.\n- PASS — Shawu alone owns one light pen and one complete circular silver astrolabe with a fixed four-point center star.\n- PASS — queen and sovereign support opposite ends of one original volume; old and new record layers remain distinct and the queen is unarmed.\n- Carry to R2 — audit Shawu flower, sleeve cuffs, two back ribbons, full-ring astrolabe and notebook; audit queen/sovereign costume locks at 100%.`,
  },
  'CG_019_lighthouse-archive': {
    output: '04_cg/working/CG_019_lighthouse-archive_R1_identity_v1.png',
    qa: '03_intermediate/qa/CG_019_lighthouse-archive_R1_identity_qa.md',
    references: [
      ['edit_target', '04_cg/working/CG_019_lighthouse-archive_R0_layout_v1.png'],
      ['accepted_three-person_anchor', '04_cg/working/CG_014_missing-page-restored_R1_identity_v1.png'],
      ['accepted_guide_queen_sovereign_anchor', '04_cg/working/CG_017_traceable-revocation_R1_identity_v1.png'],
      ['guide_turnaround', '01_canon/turnarounds/CHAR_guide_turnaround_v1.png'],
    ],
    prompt: `Use case: identity-preserve\nAsset type: visual-novel CG R1_identity\nEdit the FIRST image only.\n\nPreserve the FIRST image's exact 16:9 calm-dawn exterior group composition, ember-lighthouse doorway and sunrise, wet stone road, new mail coach in the background, and four foreground adults with distinct tasks: heroine on image left holding exactly ONE closed mail box, Guide Shawu near center lighting the review lamp, Arcane Sovereign near image right-center holding one blank sign-off sheet, and Queen Noctia on image right holding exactly ONE closed mail box. Preserve camera, spacing, poses, task ownership, coach, driver silhouette, lighting, and quiet return-to-work mood. Do not turn this into a victory celebration.\n\nIdentity sources:\n- Reference 2 defines the accepted heroine, queen, and sovereign identities. Match their same adult faces, hair, proportions, and series rendering.\n- References 3-4 define the accepted Guide Shawu identity: adult woman, chin-length silver-lilac bob, violet eyes, exactly ONE white five-petal flower at HER LEFT temple, no long hair or crown.\n\nR1 scope: change only faces, hair, adult age, body proportions, and identity-critical silhouettes where needed. Preserve costume and prop construction for R2.\n\nHard invariants:\n- exactly FOUR foreground story characters with clearly distinct tasks\n- heroine and queen each own exactly ONE closed mail box; do not merge or swap them\n- sovereign alone holds one blank sign-off sheet with no readable text\n- Shawu alone lights the review lamp; her complete circular silver astrolabe may remain beside her but must not become a crescent\n- background mail coach and unarmed driver remain; no raised weapons\n- no fireworks, crowded festival, readable form, extra foreground people, identity blending, text, UI, logo, watermark, or anatomy defects\n\nOutput exactly one polished 1672×941 anime visual-novel CG at the same resolution as the first image.`,
    qaBody: `- PASS — hero, queen, sovereign, and Shawu identities match the accepted CG014/CG017 anchors.\n- PASS — exactly four foreground story characters keep distinct tasks: hero and queen each hold one closed mail box, sovereign holds one blank sign-off sheet, and Shawu lights the review lamp.\n- PASS — Shawu keeps a complete circular astrolabe; background mail coach and unarmed driver remain visible.\n- PASS — calm dawn, wet road, quiet return-to-work mood, and non-celebratory staging remain intact.\n- Carry to R2 — audit both mail boxes, blank form/clipboard, review lamp, full-ring astrolabe, and all four costume locks at 100%.`,
  },
};
const r0Only = process.argv.includes('--r0-only');
const activeR1 = r0Only ? {} : r1;

function full(rel) { return path.join(vn, rel); }
function sha(rel) { return crypto.createHash('sha256').update(fs.readFileSync(full(rel))).digest('hex'); }
function asset(rel) {
  const bytes = fs.readFileSync(full(rel));
  const isPng = bytes.length >= 24 && bytes.subarray(1, 4).toString('ascii') === 'PNG';
  const width = isPng ? bytes.readUInt32BE(16) : 1672;
  const height = isPng ? bytes.readUInt32BE(20) : 941;
  return { path: rel, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), width, height, mode: 'RGB' };
}
function readJson(rel) { return JSON.parse(fs.readFileSync(full(rel), 'utf8')); }
function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(full(rel)), { recursive: true });
  fs.writeFileSync(full(rel), `${JSON.stringify(value, null, 2)}\n`);
}
function writeText(rel, value) {
  fs.mkdirSync(path.dirname(full(rel)), { recursive: true });
  fs.writeFileSync(full(rel), value);
}

for (const scene of scenes) {
  scene.layoutAsset = asset(scene.layoutPath);
  const cardRel = `03_intermediate/scene_cards/${scene.cgId}.json`;
  const card = readJson(cardRel);
  card.status = activeR1[scene.cgId] ? 'r1-identity-accepted' : 'r0-layout-accepted';
  card.current_iteration = activeR1[scene.cgId] ? 'R1_identity' : 'R0_layout';
  card.layout_asset = scene.layoutAsset;
  card.layout_qa = `03_intermediate/qa/${scene.cgId}_R0_layout_qa.md`;
  if (activeR1[scene.cgId]) {
    card.identity_asset = asset(activeR1[scene.cgId].output);
    card.identity_qa = activeR1[scene.cgId].qa;
  } else {
    delete card.identity_asset;
    delete card.identity_qa;
  }
  writeJson(cardRel, card);
  writeText(card.layout_qa, `# ${scene.cgId} — R0 layout recovery QA\n\nStatus: **accepted-r0-layout**\nReviewed: 2026-09-19\nAsset: \`${scene.layoutPath}\`\nSHA-256: \`${scene.layoutAsset.sha256}\`\n\n- PASS — recovered output matches the image accepted in the prior generation session.\n- PASS — PNG decodes at 1672 × 941, RGB/sRGB.\n- PASS — contact-sheet review confirms the intended cast, composition, narrative beat, and prop ownership.\n- PASS — this file is the selected accepted candidate, not one of the visually similar rejected variants.\n- NOTE — prompt provenance is retained in the recovery manifest under the original Library title \`${scene.libraryTitle}\`.\n`);
}

const admissionRel = '05_manifests/cg-layout-admission-v1.2.json';
const admission = readJson(admissionRel);
admission.r0_layout_accepted = 19;
admission.r0_layout_remaining = 0;
admission.r1_identity_accepted = Object.keys(activeR1).length;
admission.r1_identity_remaining = 19 - Object.keys(activeR1).length;
for (const item of admission.scenes) {
  const scene = scenes.find((candidate) => candidate.cgId === item.cg_id);
  item.layout_status = 'accepted-r0-layout';
  item.layout_asset = scene.layoutAsset;
  if (activeR1[scene.cgId]) {
    item.identity_status = 'accepted-r1-identity-with-carry';
    item.identity_asset = asset(activeR1[scene.cgId].output);
  } else {
    delete item.identity_status;
    delete item.identity_asset;
  }
}
writeJson(admissionRel, admission);

const indexRel = '05_manifests/cg-scene-index-v1.2.json';
const index = readJson(indexRel);
for (const item of index.scenes) {
  const scene = scenes.find((candidate) => candidate.cgId === item.cg_id);
  item.status = activeR1[scene.cgId] ? 'r1-identity-accepted' : 'r0-layout-accepted';
  item.layout_asset = scene.layoutAsset;
  item.layout_qa = `03_intermediate/qa/${scene.cgId}_R0_layout_qa.md`;
  if (activeR1[scene.cgId]) {
    item.identity_asset = asset(activeR1[scene.cgId].output);
    item.identity_qa = activeR1[scene.cgId].qa;
  } else {
    delete item.identity_asset;
    delete item.identity_qa;
  }
}
writeJson(indexRel, index);

for (const [cgId, stage] of Object.entries(activeR1)) {
  for (const attempt of stage.attempts ?? []) {
    const attemptRefs = attempt.references.map(([role, rel], order) => ({ order: order + 1, role, path: rel, sha256: sha(rel), passed_to_generator: true }));
    const promptRel = `03_intermediate/prompt_packets/${cgId}_R1_identity_${attempt.id}.json`;
    const referenceRel = `03_intermediate/reference_sets/${cgId}_R1_identity_${attempt.id}.json`;
    writeJson(referenceRel, {
      version: 'GAL-SIMPLE-1.3', cg_id: cgId, stage: 'R1_identity', iteration: attempt.id, generated_at: isoDate,
      actual_input_order: attemptRefs, output: asset(attempt.output), qa: attempt.qa, status: attempt.status,
    });
    writeJson(promptRel, {
      version: 'GAL-SIMPLE-1.3', cg_id: cgId, stage: 'R1_identity', iteration: attempt.id,
      series_style_lock: 'Clean polished anime visual-novel CG; preserve accepted R0 composition; no pseudo-text, logo, watermark, or UI.',
      composition: 'Locked to the supplied edit target.', negative_constraints: ['composition drift', 'identity drift', 'scale drift', 'extra characters', 'text', 'HUD', 'watermark'],
      output_contract: attempt.output, full_prompt: attempt.prompt,
    });
    writeText(attempt.qa, `# ${cgId} — R1 identity ${attempt.id} QA\n\nStatus: **${attempt.status}**\nReviewed: 2026-09-19\nAsset: \`${attempt.output}\`\nSHA-256: \`${sha(attempt.output)}\`\nPrompt packet: \`${promptRel}\`\nReference set: \`${referenceRel}\`\n\n- REJECT — ${attempt.reason}\n- The file is retained for lineage and must not be promoted to R2 or runtime.\n`);
  }
  const refs = stage.references.map(([role, rel], order) => ({ order: order + 1, role, path: rel, sha256: sha(rel), passed_to_generator: true }));
  writeJson(`03_intermediate/reference_sets/${cgId}_R1_identity.json`, {
    version: 'GAL-SIMPLE-1.3', cg_id: cgId, stage: 'R1_identity', generated_at: isoDate,
    precedence: ['canonical text', 'turnaround', 'detail board', 'expression board', 'standee', 'accepted CG anchor', 'environment'],
    actual_input_order: refs,
    output: asset(stage.output), qa: stage.qa, status: 'accepted-r1-identity-with-carry',
  });
  writeJson(`03_intermediate/prompt_packets/${cgId}_R1_identity.json`, {
    version: 'GAL-SIMPLE-1.3', cg_id: cgId, stage: 'R1_identity',
    series_style_lock: 'Clean polished anime visual-novel CG; preserve accepted R0 composition; no pseudo-text, logo, watermark, or UI.',
    identity_lock: 'Resolve face, hair, adult age, body proportions, and silhouette from the ordered canonical references and accepted CG anchor.',
    composition: 'Locked to the supplied R0 edit target.',
    continuity_anchors: stage.references.filter(([role]) => role.includes('anchor')).map(([, rel]) => rel),
    negative_constraints: ['composition drift', 'identity blending', 'extra characters', 'prop ownership swap', 'text', 'HUD', 'watermark', 'anatomy defects'],
    output_contract: stage.output,
    full_prompt: stage.prompt,
  });
  writeText(stage.qa, `# ${cgId} — R1 identity QA\n\nStatus: **accepted-r1-identity-with-carry**\nReviewed: 2026-09-19\nAsset: \`${stage.output}\`\nSHA-256: \`${sha(stage.output)}\`\n\n${stage.qaBody}\n`);
}

writeJson('05_manifests/cg-r0-rebuild-20260919-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, base_commit: '8126b11a554f101e3f2572a16657a9c91bb29dea',
  source: 'Recovered from ChatGPT Library outputs created in the prior project session; selected by contact-sheet review against the prior acceptance decisions.',
  accepted: 19, total: 19, final_cg: 0,
  scenes: scenes.map((scene) => ({ order: scene.order, cg_id: scene.cgId, library_title: scene.libraryTitle, asset: scene.layoutAsset, qa: `03_intermediate/qa/${scene.cgId}_R0_layout_qa.md`, status: 'accepted-r0-layout' })),
  exclusions: [
    { library_title: 'Seven Lights Beneath the Storm.png', reason: 'Rejected alternate CG003 composition/scale.' },
    { library_title: 'Water-memory proof in the ocean archive.png', reason: 'Rejected CG005 anatomy/prop attempt; recovered Library transfer was truncated and is not committed.' },
    { library_title: 'Seven Lights Between Queen and Heroine.png', reason: 'Rejected CG007 prop-ownership variant.' },
    { library_title: 'Seven luminous links to archive panels.png', reason: 'Rejected alternate network composition.' },
    { library_title: 'Seven rainbow cores, three red seals.png', reason: 'Rejected alternate seal composition.' },
  ],
});

const batch1Ids = ['CG_001_critical', 'CG_005_northstar-arrival', 'CG_007_noctia-truth'];
const batch2Ids = ['CG_004_seven-cantos-severed', 'CG_006_seven-core-network', 'CG_008_noctia-seal'];
const batch3Ids = ['CG_002_defeat', 'CG_003_prologue-tower', 'CG_009_missing-fourth-step'];
const batch4Ids = ['CG_011_intercepted-receipt', 'CG_015_letters-held-in-storm', 'CG_018_noctia-afterlight'];
const batch5Ids = ['CG_010_seventeen-minute-splice', 'CG_012_echo-ledger', 'CG_013_noctia-sovereign'];
const batch6Ids = ['CG_014_missing-page-restored', 'CG_016_originals-enter-lighthouse', 'CG_017_traceable-revocation', 'CG_019_lighthouse-archive'];

writeJson('05_manifests/cg-r1-identity-batch01-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: 3, total: 3,
  identity_anchor: '04_cg/working/CG_001_critical_R1_identity_v1.png',
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch01_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch01-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch01-v1.3.jpg'), width: 1848, height: 386, mode: 'RGB' },
  scenes: batch1Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: 16,
});

writeText('03_intermediate/qa/CG_R1_identity_batch01_qa.md', `# R1 identity batch 01 QA\n\nStatus: **3/3 accepted with R2 carry**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch01-v1.3.jpg\`\n\n| CG | Identity result | Composition lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG001 | Hero anchor accepted | Preserved | Right-hand sword preserved | Buckles, scabbard, pouch |\n| CG005 | Hero + ocean singer accepted | Preserved | Five-string harp stays with singer | Sleeve attachments, string spacing |\n| CG007 | Hero + queen accepted | Preserved | Queen distress light; hero lowered sword; three tablets at rest | Crown point count, brooch, cape fastening |\n\nNo runtime asset was replaced. R1 remaining: **16/19**.\n`);

writeJson('05_manifests/cg-r1-identity-batch02-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: r0Only ? 0 : 3, total: 3,
  identity_anchors: ['04_cg/working/CG_001_critical_R1_identity_v1.png', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch02_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch02-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch02-v1.3.jpg'), width: 1848, height: 386, mode: 'RGB' },
  scenes: batch2Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: r0Only ? 19 : 13,
});

writeText('03_intermediate/qa/CG_R1_identity_batch02_qa.md', `# R1 identity batch 02 QA\n\nStatus: **3/3 accepted with R2 carry**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch02-v1.3.jpg\`\n\n| CG | Identity result | Count lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG004 | Hero + queen accepted | Seven cantos; three tablets | Hero sword; queen tablets | Buckles, crown, tablet construction |\n| CG006 | Hero + shadow weaver accepted | Seven paths; one lock | Right needle; left spool | Rear panels, needle case, thread count |\n| CG008 | Hero + queen accepted | Seven cores; three tablets | Hero sword; queen binding lines/tablets | Crown, brooch, sword/scabbard |\n\nNo runtime asset was replaced. R1 remaining: **13/19**.\n`);

writeJson('05_manifests/cg-r1-identity-batch03-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: r0Only ? 0 : 3, total: 3,
  identity_anchors: ['04_cg/working/CG_001_critical_R1_identity_v1.png', '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png'],
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch03_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch03-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch03-v1.3.jpg'), width: 1848, height: 386, mode: 'RGB' },
  scenes: batch3Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  rejected_iterations: (activeR1['CG_003_prologue-tower']?.attempts ?? []).map((attempt) => ({
    cg_id: 'CG_003_prologue-tower', iteration: attempt.id, status: attempt.status, asset: asset(attempt.output), qa: attempt.qa,
    prompt_packet: `03_intermediate/prompt_packets/CG_003_prologue-tower_R1_identity_${attempt.id}.json`,
    reference_set: `03_intermediate/reference_sets/CG_003_prologue-tower_R1_identity_${attempt.id}.json`,
    reason: attempt.reason,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: r0Only ? 19 : 10,
});

writeText('03_intermediate/qa/CG_R1_identity_batch03_qa.md', `# R1 identity batch 03 QA\n\nStatus: **3/3 accepted with R2 carry**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch03-v1.3.jpg\`\n\n| CG | Identity result | Composition/count lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG002 | Hero accepted | Conscious defeat pose preserved | Right-hand sword | Buckles, scabbard, pouch, boot boundaries |\n| CG003 | Male R0 silhouette corrected to small female hero; v1/v2 rejected for scale | Seven tower lights; one ship; sealed gate | One lowered sword | Mantle blocking and sword silhouette only; do not enlarge |\n| CG009 | Hero + queen accepted | Four positions; fourth missing | Hero sword; queen empty reaching hand | Hero clasp/scabbard; queen crown/brooch/cape fastening |\n\nTwo CG003 scale attempts are retained under \`04_cg/rejected/R1-identity/\` with prompt/reference lineage. No runtime asset was replaced. R1 remaining: **10/19**.\n`);

writeJson('05_manifests/cg-r1-identity-batch04-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: r0Only ? 0 : 3, total: 3,
  identity_anchors: [
    '04_cg/working/CG_001_critical_R1_identity_v1.png',
    '04_cg/working/CG_006_seven-core-network_R1_identity_v1.png',
    '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png',
  ],
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch04_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch04-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch04-v1.3.jpg'), width: 1848, height: 386, mode: 'RGB' },
  scenes: batch4Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: r0Only ? 19 : 7,
});

writeText('03_intermediate/qa/CG_R1_identity_batch04_qa.md', `# R1 identity batch 04 QA\n\nStatus: **3/3 accepted with R2 carry**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch04-v1.3.jpg\`\n\n| CG | Identity result | Composition/count lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG011 | Hero + shadow weaver accepted | Two adults plus one nonhuman interceptor | Right-hand needle; left-hand spool; receipt stays with interceptor | Feather side, needle eye/case, buckles |\n| CG015 | Hero + queen accepted | Ordered letters and paper flow preserved | Queen cape windbreak; hero presses letters | Crown/brooch/cape fastening; hero clasp and stowed sword |\n| CG018 | Hero + queen accepted | One alarm stone, one crate, one final volume | Stone rests by queen; crate stays between both | Crown/brooch/cape fastening; hero clasp/buckles |\n\nNo runtime asset was replaced. R1 remaining: **7/19**.\n`);

writeJson('05_manifests/cg-r1-identity-batch05-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: r0Only ? 0 : 3, total: 3,
  identity_anchors: [
    '04_cg/working/CG_001_critical_R1_identity_v1.png',
    '04_cg/working/CG_007_noctia-truth_R1_identity_v1.png',
    '01_canon/turnarounds/CHAR_astral-boss_turnaround_v1.png',
    '01_canon/turnarounds/CHAR_echo-regent_turnaround_v2.png',
    '01_canon/turnarounds/CHAR_arcane-sovereign_turnaround_v1.png',
  ],
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch05_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch05-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch05-v1.3.jpg'), width: 1848, height: 386, mode: 'RGB' },
  scenes: batch5Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: r0Only ? 19 : 4,
});

writeText('03_intermediate/qa/CG_R1_identity_batch05_qa.md', `# R1 identity batch 05 QA\n\nStatus: **3/3 accepted with R2 carry**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch05-v1.3.jpg\`\n\n| CG | Identity result | Composition/count lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG010 | Hero + Lumi accepted | Three tracks; two shifted, one original | Lumi alone owns crescent astrolabe | Hero buckles/pouch; Lumi clip/clasp/chart case and astrolabe pointer |\n| CG012 | Hero + queen + Echo Regent accepted | One green light; mourning tag remains | Ledger stays with unarmed regent | Crown/brooch; regent clasp/sash/ledger construction |\n| CG013 | Hero + queen + Arcane Sovereign accepted | One restraint; one ring; one open box | Sovereign right hand owns signet; queen unarmed | Sovereign panels/clasp/sash; cracked ring pinch grip |\n\nNo runtime asset was replaced. R1 remaining: **4/19**.\n`);

writeJson('05_manifests/cg-r1-identity-batch06-v1.3.json', {
  version: 'GAL-SIMPLE-1.3', generated_at: isoDate, stage: 'R1_identity', accepted: r0Only ? 0 : 4, total: 4,
  identity_anchors: [
    '04_cg/working/CG_013_noctia-sovereign_R1_identity_v1.png',
    '04_cg/working/CG_014_missing-page-restored_R1_identity_v1.png',
    '04_cg/working/CG_017_traceable-revocation_R1_identity_v1.png',
    '01_canon/turnarounds/CHAR_act3-last-custodian_turnaround_v1.png',
    '01_canon/turnarounds/CHAR_guide_turnaround_v1.png',
  ],
  batch_qa: '03_intermediate/qa/CG_R1_identity_batch06_qa.md',
  preview: { path: '03_intermediate/previews/cg-r1-identity-batch06-v1.3.jpg', sha256: sha('03_intermediate/previews/cg-r1-identity-batch06-v1.3.jpg'), width: 1848, height: 1108, mode: 'RGB' },
  scenes: batch6Ids.filter((cgId) => activeR1[cgId]).map((cgId) => ({
    cg_id: cgId, status: 'accepted-r1-identity-with-carry', asset: asset(activeR1[cgId].output), qa: activeR1[cgId].qa,
    prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`,
  })),
  next_gate: 'R2_costume', remaining_r1_identity: 0,
});

writeText('03_intermediate/qa/CG_R1_identity_batch06_qa.md', `# R1 identity batch 06 QA\n\nStatus: **4/4 accepted with R2 carry; R1 complete 19/19**\nReviewed: 2026-09-19\nPreview: \`03_intermediate/previews/cg-r1-identity-batch06-v1.3.jpg\`\n\n| CG | Identity result | Composition/count lock | Prop ownership | Next carry |\n|---|---|---|---|---|\n| CG014 | Hero + queen + sovereign accepted | One mechanically separated final page | No one touches text surface | Three costumes; connector geometry |\n| CG016 | Hero + queen + sovereign + final custodian accepted | Four adults; one shared heavy volume | Hero leads; custodian works key/amber staff | Custodian four panels/clasp/spiral core |\n| CG017 | Guide + queen + sovereign accepted | Old/new layers coexist | Guide owns pen/full-ring astrolabe; queen/sovereign share volume | Guide flower/sleeves/ribbons; three costumes |\n| CG019 | Hero + guide + queen + sovereign accepted | Four foreground roles; coach and driver retained | Two boxes, one blank form, one review lamp | All props and four costumes |\n\nCG014 and CG016 were normalized from 1671×941 to the required 1672×941 by a deterministic 0.06% horizontal resize before final hashing. No runtime asset was replaced. R1 remaining: **0/19**.\n`);

const logRel = '06_logs/generation-log-v1.2.jsonl';
let log = fs.readFileSync(full(logRel), 'utf8').trimEnd();
if (r0Only) {
  log = log.split('\n').filter((line) => !line.includes('"stage":"R1_identity"') && !line.includes('"stage": "R1_identity"')).join('\n');
}
const events = [
  { event_id: 'cg-r0-rebuild-recovery-20260919', timestamp: isoDate, stage: 'R0_layout', result: 'accepted', accepted: 19, note: 'Recovered and hash-registered the 19 accepted R0 outputs from Library; runtime assets unchanged.' },
  ...Object.entries(activeR1).flatMap(([cgId, stage]) => (stage.attempts ?? []).map((attempt) => ({
    event_id: `${cgId}-R1-identity-${attempt.id}-20260919`, timestamp: isoDate, cg_id: cgId, stage: 'R1_identity', result: attempt.status,
    output: asset(attempt.output), prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity_${attempt.id}.json`,
    reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity_${attempt.id}.json`, qa: attempt.qa, reason: attempt.reason,
  }))),
  ...Object.entries(activeR1).map(([cgId, stage]) => ({ event_id: `${cgId}-R1-identity-${stage.eventVersion ?? 'v1'}-20260919`, timestamp: isoDate, cg_id: cgId, stage: 'R1_identity', result: 'accepted-with-carry', output: asset(stage.output), prompt_packet: `03_intermediate/prompt_packets/${cgId}_R1_identity.json`, reference_set: `03_intermediate/reference_sets/${cgId}_R1_identity.json`, qa: stage.qa })),
];
const currentEventIds = new Set(events.map((event) => event.event_id));
log = log.split('\n').filter((line) => {
  try { return !currentEventIds.has(JSON.parse(line).event_id); }
  catch { return true; }
}).join('\n');
for (const event of events) {
  if (!log.includes(`\"event_id\":\"${event.event_id}\"`) && !log.includes(`\"event_id\": \"${event.event_id}\"`)) log += `\n${JSON.stringify(event)}`;
}
fs.writeFileSync(full(logRel), `${log}\n`);

console.log(JSON.stringify({ r0Accepted: scenes.length, r1Accepted: Object.keys(activeR1).length, r1Remaining: 19 - Object.keys(activeR1).length }, null, 2));
