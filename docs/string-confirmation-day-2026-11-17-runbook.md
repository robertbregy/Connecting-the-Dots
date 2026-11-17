# String Confirmation Day 2026 — operating runbook

Prepared before the 17 November 2026 publication window. This branch is preparatory only. The production baseline on `main` remains frozen at v0.7.112.

## 1. Frozen baseline

- Published baseline commit: `218ff4f302dd42ff7abf615cef123bc08f3bcf6b`
- Published version: `0.7.112`
- Research release: RR2 (immutable)
- Research snapshot: Reveal Day, 7 October 2026
- APS normalized CSV SHA-256: `520ea8433b96322816fb03fa66072acc29e7251e16839093b4446ada401bd887`
- APS public rows: 2,783
- Published base Application IDs: 1,614
- Replacement rows: 1,169
- Replacement rows active at the frozen observation: 442
- Replacement rows deactivated at the frozen observation: 727
- Comparable new-primary applications: 1,608
- Distinct new primary labels: 980
- Preliminary official contention sets: 263
- Applications in preliminary official contention sets: 891
- Official Reveal Day applications: 1,615
- Pending administrative-check application not present in the public export: `WDO2627T-T45217`
- .lugano application: `CDL2651T-T31516`

## 2. Authoritative sources to capture

Capture the first post-publication bytes before interpreting them.

1. APS application export  
   https://newgtldprogram-aps.icann.org/aps/applications/export/csv
2. APS application listing  
   https://newgtldprogram-aps.icann.org/applications
3. APS statistics  
   https://newgtldprogram-aps.icann.org/statistics
4. ICANN 2026 Round pre-evaluation / String Confirmation Day page  
   https://newgtldprogram.icann.org/en/application-rounds/round2/applicant-journey/pre-evaluation
5. Updated ICANN contention-set publication when exposed on the official 2026 Round site.
6. Any official ICANN announcement published for String Confirmation Day.

Record UTC retrieval time, source URL, raw file name and SHA-256 for every captured source.

## 3. APS ingest procedure

Do not overwrite the frozen Reveal Day source.

Use the existing offline observer:

```bash
python3 scripts/aps_observatory.py verify-baseline

python3 scripts/aps_observatory.py stage \
  --csv <downloaded-official-aps.csv> \
  --captured-at <ISO-8601-with-time-zone>

python3 scripts/aps_observatory.py compare \
  --after <staged-snapshot.csv> \
  --output <diff-output.json>
```

Stop for review if:
- the CSV schema changes;
- a replacement row appears without a base Application ID;
- duplicate Application IDs appear;
- the frozen baseline hash no longer verifies.

Absence from a later export is not, by itself, evidence of withdrawal or rejection.

## 4. Priority diff

Review in this order:

### A. Application universe
- base Application IDs added / no longer visible;
- official total applications;
- whether `WDO2627T-T45217` becomes public;
- any evidence explaining the historical 1,616 → 1,615 discrepancy.

### B. Replacement decisions
For each base Application ID:
- final confirmed applied-for string;
- original primary string;
- replacement string;
- replacement record status;
- whether the base record's primary label changes.

Count:
- replacements actually exercised;
- eligible replacements not exercised;
- replacement rows newly deactivated;
- newly observed replacement rows, if any.

Do not infer a switch solely from a `-R` row. Confirm through the base record and official post-String-Confirmation representation.

### C. Contention
Diff the official contention-set publication separately from the APS application export:
- set count before / after;
- application membership changes;
- sets removed;
- sets created;
- sets whose label changed because of a replacement;
- applications entering or leaving exact-string contention.

Do not use the APS `Label: In Contention` field as the sole source before String Evaluation; the frozen export itself warns against that interpretation.

### D. .lugano
Verify `CDL2651T-T31516`:
- final string;
- status;
- processing stage;
- contention membership;
- public comments / flags only if officially present after publication.

### E. .wdo
Verify `WDO2627T-T45217` separately:
- still under administrative check;
- newly visible;
- status and final string if published;
- no inferred outcome if still absent.

## 5. Editorial rules

Preserve Reveal Day as an immutable historical state. Do not replace 7 October values with 17 November values.

Any post-17 November publication should distinguish:
- Reveal Day snapshot;
- String Confirmation Day snapshot;
- later evaluation outcomes.

Use explicit labels for:
- official ICANN fact;
- project-derived calculation;
- unresolved discrepancy;
- editorial reading.

## 6. RR3 decision gate

Create an RR3 candidate only if String Confirmation Day produces a material evidence change, for example:
- exercised replacement strings;
- changed final applied-for-string inventory;
- changed contention sets;
- newly published previously missing application;
- resolved or materially narrowed 1,616 → 1,615 discrepancy;
- other official structural change to the application universe.

If the publication merely republishes the same material without substantive change, update the living technical layer without manufacturing a research milestone.

## 7. Release sequence after verification

1. Capture and hash official sources.
2. Generate APS diff.
3. Generate official contention diff.
4. Manually review every structural anomaly.
5. Produce a short evidence memo.
6. Decide RR3 yes/no.
7. Update current analytical layers while preserving RR1/RR2 and Reveal Day files.
8. Update working paper only after the evidence review, not merely because the technical dataset changed.
9. Run full release checks and browser/WCAG gates.
10. Merge only after live-surface verification.

The objective is not to publish fastest. It is to preserve a clean, reproducible transition from Reveal Day to String Confirmation Day.
