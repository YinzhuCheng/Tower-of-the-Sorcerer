import { analyzeV3C6TightBoundScreen } from '../src/analyzer/event-order-core-prefix-tight-bound-screen.js';
import { rebuildDistributedPressureV3Reference } from '../src/tuner/review-candidate-v3-rebuild.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';
function f(n,d){const p=`--${n}=`;const r=process.argv.find(a=>a.startsWith(p))?.slice(p.length);if(r==null)return d;const v=Number(r);if(!Number.isInteger(v)||v<1)throw new Error(`Invalid --${n}: ${r}`);return v;}
const rebuilt=rebuildDistributedPressureV3Reference({maxPurchasePasses:f('max-purchase-passes',12)});
const analysis=analyzeV3C6TightBoundScreen({candidate:REVIEW_CANDIDATES.distributedPressureV3,referenceWitness:rebuilt.witness,targetCores:f('target-cores',6),boundaryMaxExpanded:f('boundary-max-expanded',20000),boundaryMaxGenerated:f('boundary-max-generated',250000),boundaryMaxGoals:f('boundary-max-goals',128)});
const report={schemaVersion:1,model:'distributed-pressure-v3-c6-tight-bound-screen-v0.1',rebuild:{terminalHp:rebuilt.terminalHp,semanticFingerprint:rebuilt.semanticFingerprint},analysis};
if(process.argv.includes('--json'))process.stdout.write(`${JSON.stringify(report,null,2)}\n`);else console.log(JSON.stringify(report,null,2));
