import { analyzeV3C7TightBoundScreen } from '../src/analyzer/event-order-core-bridge-tight-bound-screen.js';
import { rebuildDistributedPressureV3Reference } from '../src/tuner/review-candidate-v3-rebuild.js';
import { REVIEW_CANDIDATES } from '../src/tuner/review-candidates.js';

function integerFlag(name, fallback) {
  const prefix=`--${name}=`;
  const raw=process.argv.find((arg)=>arg.startsWith(prefix))?.slice(prefix.length);
  if(raw==null) return fallback;
  const value=Number(raw);
  if(!Number.isInteger(value)||value<1) throw new Error(`Invalid --${name}: ${raw}`);
  return value;
}
const json=process.argv.includes('--json');
const rebuilt=rebuildDistributedPressureV3Reference({maxPurchasePasses:integerFlag('max-purchase-passes',12)});
const analysis=analyzeV3C7TightBoundScreen({
  candidate:REVIEW_CANDIDATES.distributedPressureV3,
  referenceWitness:rebuilt.witness,
  fromCores:integerFlag('from-cores',6),toCores:integerFlag('to-cores',7),
  fromBoundaryMaxExpanded:integerFlag('from-boundary-max-expanded',8000),
  fromBoundaryMaxGenerated:integerFlag('from-boundary-max-generated',100000),
  fromBoundaryMaxGoals:integerFlag('from-boundary-max-goals',64),
  maxPrefixSeeds:integerFlag('max-prefix-seeds',3),
  bridgeMaxExpandedPerPrefix:integerFlag('bridge-max-expanded-per-prefix',6000),
  bridgeMaxGeneratedPerPrefix:integerFlag('bridge-max-generated-per-prefix',90000),
  bridgeMaxGoalsPerPrefix:integerFlag('bridge-max-goals-per-prefix',32)
});
const report={schemaVersion:1,model:'distributed-pressure-v3-c7-tight-bound-screen-v0.1',rebuild:{terminalHp:rebuilt.terminalHp,semanticFingerprint:rebuilt.semanticFingerprint},analysis};
if(json) process.stdout.write(`${JSON.stringify(report,null,2)}\n`);
else {
  console.log(`V3 tight bound screen status=${analysis.status} reference=${rebuilt.terminalHp} proofModified=${analysis.proofBoundModified}`);
  console.log(`overall=${JSON.stringify(analysis.overall)}`);
  for(const a of analysis.attempts??[]){
    console.log(`prefix=${a.prefixCertificateHash} summary=${JSON.stringify(a.summary)}`);
    for(const e of a.entries??[]) console.log(`  bridge=${e.certificateHash} p=${e.shopPurchases} hp=${e.resources?.hp} gold=${e.resources?.gold} cards=${e.resources?.sun}/${e.resources?.moon}/${e.resources?.star} old=${e.oldUpperBound} tight=${e.tightUpperBound} tightening=${e.tightening} slack=${e.tightSlack} prune=${e.prunable} zeroGold=${e.zeroDamageGold} buys=${e.bestPurchaseCount} needGold=${e.requiredEnemyGold} frac=${e.fractionalHarvestDamage} discrete=${e.discreteHarvestDamage} access=${e.accessDamageLowerBound} accessPenalty=${e.accessAdditionalPenalty}`);
  }
}
