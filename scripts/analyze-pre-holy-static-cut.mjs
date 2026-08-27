import { provePreHolyCore6StaticCut } from '../src/analyzer/pre-holy-static-cut.js';

const json = process.argv.includes('--json');
const proof = provePreHolyCore6StaticCut();

if (json) {
  process.stdout.write(`${JSON.stringify(proof)}\n`);
} else {
  console.log('Pre-Holy core6 STATIC_CUT');
  console.log(`proven=${proof.proven} type=${proof.type} model=${proof.model}`);
  console.log(`floor=${proof.floorNumber} ${proof.floorTitle} boss=${proof.bossId}`);
  console.log(`strictReachable=${proof.strictRelaxation.reachable} reachableCells=${proof.strictRelaxation.reachableCellCount}`);
  console.log(`allowHolyReachable=${proof.minimalityWitnesses.allowHoly.reachable}`);
  console.log(`unlockUpperStairReachable=${proof.minimalityWitnesses.unlockUpperStair.reachable}`);
  console.log(`policies=${proof.appliesToPolicies.join(',')}`);
  console.log(`certificateHash=${proof.certificateHash}`);
  console.log(`interpretation=${proof.interpretation}`);
}

if (!proof.proven) process.exitCode = 2;
