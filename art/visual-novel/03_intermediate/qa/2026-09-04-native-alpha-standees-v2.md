# Native-alpha standees v2 QA

Status: accepted for runtime and art-audit review.

- The five user-extracted PNG masters are RGBA, 1024×1536, and contain non-opaque pixels.
- Character identity order is Vela, Seph, Last Custodian, Noctia resolve, and Shawu focus.
- Runtime WebP exports preserve alpha and the full canvas; no checkerboard source is referenced by gameplay code.
- Fine hair, cloth edges, floating props, and magic effects retain semitransparent edge pixels. No additional hard-mask cleanup was applied.
- Dialogue mappings now use the new art for `palace_warden_v2:duty`, `black_seal_keeper_v2:watchful`, `act3_last_custodian:grave`, `final_queen:resolve`, and `guide:focus`.
- The art-audit version and runtime cache version were bumped to `20260904-native-alpha-standees-v2`.
