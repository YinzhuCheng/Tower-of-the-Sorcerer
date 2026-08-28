import { FLOORS } from '../game/data.js';
import {
  createSemanticTopologyMutationCatalog,
  describeSemanticTopologyCandidate,
  withSemanticTopologyMutation
} from './semantic-topology-mutations.js';

export function createDemoTenFloorTopologyMutationCatalog({
  floorNumbers = [8, 9],
  maxPerFloor = 16,
  routeSampleLimit = 6
} = {}) {
  return createSemanticTopologyMutationCatalog(FLOORS, {
    floorNumbers,
    maxPerFloor,
    routeSampleLimit,
    maxClosures: 14,
    maxOpenings: 14,
    minHardeningGain: 0,
    maxStepIncrease: 12,
    maxDiversityLoss: 0.18
  });
}

export function withDemoTenFloorTopologyMutation(mutation, evaluate) {
  return withSemanticTopologyMutation(FLOORS, mutation, evaluate);
}

export function describeDemoTenFloorTopologySlots(options = {}) {
  const catalog = createDemoTenFloorTopologyMutationCatalog(options);
  return Object.freeze({
    schemaVersion: 2,
    model: 'semantic-map-graph-v2',
    coordinateSlotsRequired: false,
    candidates: Object.freeze(catalog.map(describeSemanticTopologyCandidate))
  });
}
