# Institution Inheritance Rollout Runbook

Use this runbook only after the Phase 1 schema migration is applied and Phase 6 QA has passed in staging.

## Mapping Format

Preferred JSON:

```json
{
    "version": 1,
    "mappings": [
        {
            "parentInstitutionId": "00000000-0000-0000-0000-000000000001",
            "childInstitutionId": "00000000-0000-0000-0000-000000000002"
        }
    ]
}
```

CSV is also supported:

```csv
parent_institution_id,child_institution_id
00000000-0000-0000-0000-000000000001,00000000-0000-0000-0000-000000000002
```

## Required Order

Run against a staging database snapshot first.

1. Dry-run duplicate report:

```bash
pnpm --dir app/sentinel-api exec tsx -r dotenv/config scripts/institution-inheritance-rollout.ts --mode dry-run --mapping ./branch-mapping.json
```

2. Mark existing records local:

```bash
pnpm --dir app/sentinel-api exec tsx -r dotenv/config scripts/institution-inheritance-rollout.ts --mode mark-local --execute
```

3. Promote parents and link branches:

```bash
pnpm --dir app/sentinel-api exec tsx -r dotenv/config scripts/institution-inheritance-rollout.ts --mode apply-mapping --mapping ./branch-mapping.json --execute
```

4. Validate effective data:

```bash
pnpm --dir app/sentinel-api exec tsx -r dotenv/config scripts/institution-inheritance-rollout.ts --mode validate
```

## Duplicate Handling

The dry-run report lists child-local records that share a natural key with a parent record. These are review-required shadow candidates. The rollout script does not auto-convert duplicates because same-key academic records may still represent intentional branch differences.

For each duplicate candidate, support must choose one action:

- Keep child local record as the effective branch value.
- Convert child row to an override by setting `source_record_id` to the parent record and `inheritance_status` to `OVERRIDDEN`.
- Delete the child row only when the values are confirmed identical and branch should inherit.

## Production Gate

Do not run `--execute` against production until:

- A verified backup exists.
- The dry-run report has been reviewed.
- `--mode validate` passes on staging without errors.
- Phase 8 manual QA passes on staging.
