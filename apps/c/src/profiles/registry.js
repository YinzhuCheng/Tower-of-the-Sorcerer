// Frozen reviewed registry. STANDARD remains the original normal identity.
import {deepFreeze} from '../core/campaign.js';
export const PROFILE_REGISTRY = deepFreeze({
  "schemaVersion": 1,
  "profileSetId": "harbor-difficulty-r1",
  "status": "offline-validated-candidate",
  "releaseReady": false,
  "baselineIdentity": {
    "campaignId": "voyage-c",
    "difficultyId": "normal",
    "contentVersion": "c-rules-prototype-v1.2-geometry",
    "rulesVersion": "fixed-campaign-v1.1",
    "contentHash": "c5a5f809d5548f36"
  },
  "canonicalization": "recursively lexicographic object keys; original array order; JSON scalars; UTF-8; SHA-256 without trailing newline",
  "profiles": [
    {
      "id": "voyage-c-standard-r1",
      "label": "STANDARD",
      "difficultyId": "normal",
      "delta": 0,
      "profileVersion": "harbor-difficulty-r1",
      "identity": {
        "campaignId": "voyage-c",
        "difficultyId": "normal",
        "contentVersion": "c-rules-prototype-v1.2-geometry",
        "rulesVersion": "fixed-campaign-v1.1",
        "contentHash": "c5a5f809d5548f36"
      },
      "specFile": "profiles/voyage-c-standard-r1.spec.json",
      "canonicalSpecSha256": "ebc0597cac88f969620eb43891a172b105bd5883144c84809dfb5a3089c04b94",
      "fileSha256": "60aa24434d53e054498d84ab48cf33a0ddf5bfd8e19b809778f92a015b010411"
    },
    {
      "id": "voyage-c-hard-r1",
      "label": "HARD",
      "difficultyId": "hard",
      "delta": 1,
      "profileVersion": "harbor-difficulty-r1",
      "identity": {
        "campaignId": "voyage-c",
        "difficultyId": "hard",
        "contentVersion": "c-rules-prototype-v1.2-geometry/harbor-difficulty-r1/hard",
        "rulesVersion": "fixed-campaign-v1.1",
        "contentHash": "4d01c76add7608e9"
      },
      "specFile": "profiles/voyage-c-hard-r1.spec.json",
      "canonicalSpecSha256": "f68f986f09e0a1bc116f0549a83f1ef7fbc3ff7f60a7718ba6b479a5dee7c0a6",
      "fileSha256": "07a2d19aabb83f7d51c479adc836dccb770db1bb6e2aa8a384cc277b3d3cb3ed"
    },
    {
      "id": "voyage-c-extreme-r1",
      "label": "EXTREME",
      "difficultyId": "extreme",
      "delta": 2,
      "profileVersion": "harbor-difficulty-r1",
      "identity": {
        "campaignId": "voyage-c",
        "difficultyId": "extreme",
        "contentVersion": "c-rules-prototype-v1.2-geometry/harbor-difficulty-r1/extreme",
        "rulesVersion": "fixed-campaign-v1.1",
        "contentHash": "bc8aa38e6d84cc01"
      },
      "specFile": "profiles/voyage-c-extreme-r1.spec.json",
      "canonicalSpecSha256": "d8875c9e4b05e3848008aee32ba2bf8036015eec5c734c9a52db3441beec0cd1",
      "fileSha256": "8fc2c6d736b8fb011f342cb8abeafb9575cd6ced6143dee0ad4541522cf77732"
    }
  ]
});
export const PROFILES = PROFILE_REGISTRY.profiles;
export const STANDARD_ID = 'voyage-c-standard-r1';
export const profileById = id => PROFILES.find(profile => profile.id === id) ?? null;
