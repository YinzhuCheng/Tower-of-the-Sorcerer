import { resourceRelation } from './state.js';

export class ParetoFrontier {
  constructor({ fields = null } = {}) {
    this.fields = fields;
    this.labels = [];
  }

  insert(label) {
    const active = this.labels.filter((existing) => existing.active);
    for (const existing of active) {
      const relation = resourceRelation(existing.resources, label.resources, this.fields);
      if (relation === 'dominates' || relation === 'equal') {
        // A rejected label must not remain externally observable as active. Most
        // search callers already discard rejected labels immediately, but
        // analyzers that retain provenance arrays rely on the active bit when a
        // shared Pareto frontier later determines which witnesses still matter.
        label.active = false;
        return { accepted: false, removed: [], reason: 'dominated' };
      }
    }

    const survivors = [];
    const removed = [];
    for (const existing of active) {
      const relation = resourceRelation(existing.resources, label.resources, this.fields);
      if (relation === 'dominated') {
        existing.active = false;
        removed.push(existing);
      } else {
        survivors.push(existing);
      }
    }

    this.labels = [...survivors, label];
    return { accepted: true, removed, reason: null };
  }

  activeLabels() {
    return this.labels.filter((label) => label.active);
  }

  get size() {
    return this.activeLabels().length;
  }
}

export class FrontierIndex {
  constructor({ fields = null } = {}) {
    this.fields = fields;
    this.byKey = new Map();
    this.peakWidth = 0;
  }

  insert(key, label) {
    let frontier = this.byKey.get(key);
    if (!frontier) {
      frontier = new ParetoFrontier({ fields: this.fields });
      this.byKey.set(key, frontier);
    }
    const result = frontier.insert(label);
    this.peakWidth = Math.max(this.peakWidth, frontier.size);
    return result;
  }

  activeCount() {
    let total = 0;
    for (const frontier of this.byKey.values()) total += frontier.size;
    return total;
  }

  get structuralStates() {
    return this.byKey.size;
  }
}
