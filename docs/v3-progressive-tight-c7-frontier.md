# V3 progressive tight-filtered c7 frontier

A fixed `maxGoals` counts both unresolved c7 bridges and bridges that the new sound tight bound can immediately close. That wastes finite goal quota on already-resolved proof obligations.

This diagnostic leaves `collectGoalFrontier()` unchanged and instead re-runs it with geometric goal caps only when needed:

```text
32 -> 64 -> 128 -> 256
```

After each round every replay-verified c7 goal is tight-bound screened. Growth continues only while:

- the frontier is still non-exact;
- residual (not bound-closed) bridges are fewer than the requested residual quota;
- the configured safety cap has not been reached.

The default target is 32 residual bridges per representative c6 prefix. If the first 32 goals already contain 32 residuals, no larger run is launched. If tight filtering closes many of them, the cap grows only enough to replenish unresolved proof obligations.

Each later round supersedes the previous round; no partial frontier is treated as exhaustive. This is scheduling/coverage control, not a new Solver prune, and it cannot by itself produce global exact no-exploit.