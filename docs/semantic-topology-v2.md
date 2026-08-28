# Semantic Topology V2

## Goal

Replace coordinate-bound maze tuning with a reusable graph-driven layer that survives large floor redesigns.

The old wave-1 tuner knew facts such as “F8 (4,5) is a wall” and “F9 (6,5) is floor”. Those facts are useful only for one exact map. V2 instead derives candidates from the current map every time.

The intended pipeline is:

```text
human-authored map
  -> SemanticMapGraph
  -> cheap route / cut / corridor diagnostics
  -> graph-derived topology candidates
  -> static safety filter
  -> authoritative engine replay
  -> expert player-model gate
  -> checkpoint Pareto / route-diversity gate
  -> review candidate only
```

Generation remains heuristic. `engine.js` and replayed player policies remain authoritative. A bounded search miss is never promoted to infeasibility evidence.

## SemanticMapGraph

`src/tuner/semantic-map-graph.js` converts a rectangular tile map into an undirected graph.

Each passable tile becomes a node. Nodes retain the original token and a semantic classification:

- start / stairs
- ordinary enemy / boss
- item / shop
- card door / mechanism gate
- switch / rune
- ordinary floor

The graph computes:

- connected components
- cycle rank
- articulation points
- graph bridges
- corridor segments between meaningful anchors
- semantic landmarks
- entry and goal anchors when they can be inferred

The graph contains coordinates because the renderer and mutation layer eventually need edits, but candidate *selection* is based on graph roles rather than hard-coded coordinate names.

## Static route model

The cheap route model is deliberately not a replacement for the game engine.

Default semantic burden is a coarse non-negative proxy:

- enemy: 3
- boss: 7
- door: 2
- mechanism gate: 3
- switch / rune: 0.35
- ordinary movement: only a small step cost

Item/shop nodes are tracked as reward opportunity instead of negative path cost.

The route API accepts custom burden/reward functions. This is important for future tuning: a caller may inject state-aware approximations or exact battle previews without rewriting graph traversal.

## Route diversity and Pareto structure

A single shortest path is not enough for Magic Tower design. V2 samples several alternative routes by repeatedly penalizing already-used edges. The result is a deterministic heuristic route family, not a proof of all paths.

For each sampled route we retain:

- steps
- semantic burden
- reward opportunity
- encountered semantic event types

Routes are Pareto-filtered over:

- lower burden
- fewer steps
- greater reward opportunity

Route distance is Jaccard distance over path-edge sets. The diversity summary exposes:

- sampled route count
- Pareto route count
- mean/min pair distance
- cheapest and second-cheapest burden
- dominant-route advantage

The design objective is not “maximize route count”. A good floor should avoid one route trivially dominating all alternatives, while also avoiding a huge family of strategically equivalent noise states.

## Graph-derived mutation generation

`src/tuner/semantic-topology-mutations.js` currently generates conservative one-swap topology edits:

```text
close one ordinary floor cell
open one interior wall cell
```

The passable-tile budget therefore remains constant.

### Closure candidates

A floor cell may be considered only when:

- it is ordinary `.` floor
- it is interior
- it is not an articulation point
- it has degree 2 or 3
- it is not adjacent to progression-critical semantics

Cells on the cheapest current route receive higher priority. This targets cheap shortcuts without encoding their coordinates.

### Opening candidates

A wall may be opened only when:

- it is interior
- it touches 2–3 passable nodes
- it is not adjacent to progression-critical semantics
- it does not directly connect two cells already on the dominant route

Side-area openings receive preference because the intended operation is usually “make the cheap route pay a cost while preserving or improving meaningful alternatives”, not “close one shortcut and accidentally create a better shortcut beside it”.

### Cheap candidate prefilter

Before any expensive player simulation, the mutated map must:

- remain connected
- preserve the passable-node budget
- retain an entry-to-goal route
- not reduce the cheapest semantic burden
- stay within a bounded step increase
- avoid excessive route-diversity collapse
- avoid collapsing the sampled Pareto route family by more than one state

This prefilter exists to reduce expensive solver/player-policy calls. It is not a gameplay correctness proof.

## Authoritative gate remains unchanged

`search-demo-10f-topology.mjs` still performs the expensive gates after semantic candidate generation:

1. existing topology contract
2. expert no-shop-HP playability
3. diagnostic player policies
4. checkpoint Pareto no-regression comparison
5. final ranking

The semantic preview is only an additional ranking signal.

`productionWriteAllowed` remains `false`.

## Commands

Cheap all-floor audit:

```bash
npm run analyze:topology
```

This prints graph metrics, route diversity, and up to eight semantic mutation candidates per floor.

Existing expensive 10F topology search:

```bash
npm run search:demo10:topology
```

This still focuses on F8/F9 to keep profiling cost bounded, but its candidate generator is now map-derived.

## What survives a future 10F redesign

Reusable without coordinate rewrites:

- graph extraction
- cut/bridge/corridor analysis
- route sampling
- Pareto route filtering
- route-distance metrics
- semantic candidate generation
- authoritative player-policy gates
- checkpoint Pareto gates

Expected to be regenerated after a redesign:

- measured baseline metrics
- mutation candidate list
- accepted witnesses/certificates
- difficulty thresholds derived from the old map

That is intentional: the algorithm stays; map-specific evidence is recomputed.

## Next extension points

V2 deliberately starts conservatively. Later iterations can add semantic edit families without changing the graph layer:

- move an enemy from a side branch onto a dominant corridor
- exchange two reward nodes with different strategic roles
- move a card door closer to/farther from its payoff
- create/remove a loop while preserving progression reachability
- optimize articulation placement and reconvergence points
- use exact battle damage as the route burden callback
- combine state-space Pareto diversity with graph-route diversity in one objective

The key rule is that candidate generation may be heuristic, but final acceptance must continue to replay through the authoritative transition system.
