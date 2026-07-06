-- Clean up duplicate non-null dedupe keys
DELETE FROM flagged_incidents a
USING flagged_incidents b
WHERE a.incident_id < b.incident_id
  AND a.dedupe_key = b.dedupe_key
  AND a.dedupe_key IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "flagged_incidents_dedupe_key_unique" ON "flagged_incidents"("attempt_id", "rule_key", "platform", "dedupe_key") WHERE dedupe_key IS NOT NULL;
