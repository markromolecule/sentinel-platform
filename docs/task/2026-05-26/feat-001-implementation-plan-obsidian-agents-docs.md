# feat-001 — Obsidian-Compatible `.agents/docs/` Knowledge Base

**Summary:** Consolidate all scattered project documentation into a structured `.agents/docs/` directory that serves as the single source of truth, accessible to AI agents and browsable as an Obsidian vault.

---

## Options Analysis (1-3-1 Rule)

### Option A — Flat Symbolic Layer (simple/fast)
Create `.agents/docs/` as a set of symlinks pointing at existing `docs/` files; update rule files to reference those paths.

**Tradeoff:** Zero file duplication but symlinks are fragile inside Obsidian and break on Windows clones.

### Option B — Full Physical Migration (robust/scalable) ✅ CHOSEN
Physically move/copy source docs into `.agents/docs/` under a logical hierarchy, update all rule files with relative links, and add an Obsidian `graph.json` + frontmatter to each migrated file.

**Tradeoff:** Slightly more work up front but results in a portable, self-contained vault that works natively in Obsidian and for any AI agent.

### Option C — Dual-Vault Aggregation (creative)
Keep `docs/` as-is and configure Obsidian to treat both `docs/` and `.agents/` as a single multi-root vault.

**Tradeoff:** No file moves needed but Obsidian's single-root constraint makes this brittle and confusing for agents.

**Chosen: Option B** — physically migrating documents into `.agents/docs/` gives agents and Obsidian a single, authoritative, portable vault root with proper wiki-link support and no symlink fragility.

---

## Scope

### Source Directories Being Migrated

| Source | Contains |
|---|---|
| `docs/capstone/architecture/` | 6 architecture docs (ERD, backend overview, monorepo, system) |
| `docs/capstone/audio-anomaly/` | 4 audio anomaly research docs |
| `docs/capstone/telemetry/` | 5 telemetry deep-dives |
| `docs/capstone/*.md` | 4 top-level capstone research files |
| `docs/context/` | 1 goal file |
| `.agents/rules/` | All rule files (linked, not moved) |
| `.agents/workflows/` | All workflow files (linked, not moved) |

> **Not migrated:** `docs/todo/` (174 task files — these are operational, not knowledge-base docs) and `docs/task/` (execution logs). They stay in place and are referenced via links from the vault index.

---

## Target Vault Structure Inside `.agents/docs/`

```
.agents/docs/
├── 00-index.md                        ← Vault home / navigation hub
├── architecture/
│   ├── system-overview.md
│   ├── backend-architecture.md
│   ├── monorepo-structure.md
│   ├── erd-clusters.md
│   ├── hipo-diagram.md
│   └── system_architecture.md
├── features/
│   ├── audio-anomaly/
│   │   ├── architecture-decision-record.md
│   │   ├── calibration-baseline.md
│   │   ├── false-positive-analysis.md
│   │   └── yamnet-class-mapping.md
│   └── telemetry/
│       ├── 01-telemetry-overview.md
│       ├── 02-ingestion.md
│       ├── 03-policy-rules-settings.md
│       ├── 04-redis.md
│       └── 05-storage.md
├── research/
│   ├── audio-anomaly-monitoring.md
│   ├── mediapipe-monitoring.md
│   ├── telemetry-system.md
│   └── tos-calculation.md
├── agents/
│   ├── rules-overview.md              ← Summary + links to all .agents/rules files
│   └── workflows-overview.md          ← Summary + links to all .agents/workflows files
└── .obsidian/
    └── (copy from docs/.obsidian)
```

---

## Migration Decision

**Migration required:** No Prisma migration — this is a documentation reorganization only.

---

## Phase 1: Create Vault Skeleton

**Goal:** Establish the `.agents/docs/` directory tree with placeholder README files.

- [ ] Create `.agents/docs/` directory with subdirectories: `architecture/`, `features/audio-anomaly/`, `features/telemetry/`, `research/`, `agents/`
  - Path: `.agents/docs/` (new top-level knowledge base root)
- [ ] Copy `.obsidian/` config from `docs/.obsidian/` into `.agents/docs/.obsidian/` to inherit Obsidian settings
  - Command: `cp -r docs/.obsidian .agents/docs/.obsidian`
- [ ] Create `.agents/docs/00-index.md` — vault navigation hub with `[[wiki-links]]` to all top-level sections
  - Frontmatter: `tags: [index, vault-root]`
- [ ] Verify `.agents/docs/` is **not** gitignored by checking `.gitignore`

**Migration required:** No

---

## Phase 2: Migrate Architecture Docs

**Goal:** Copy all architecture documentation from `docs/capstone/architecture/` into `.agents/docs/architecture/` with Obsidian-compatible frontmatter.

- [ ] Copy `docs/capstone/architecture/system-overview.md` → `.agents/docs/architecture/system-overview.md`
- [ ] Copy `docs/capstone/architecture/backend-architecture.md` → `.agents/docs/architecture/backend-architecture.md`
- [ ] Copy `docs/capstone/architecture/monorepo-structure.md` → `.agents/docs/architecture/monorepo-structure.md`
- [ ] Copy `docs/capstone/architecture/erd-clusters.md` → `.agents/docs/architecture/erd-clusters.md`
- [ ] Copy `docs/capstone/architecture/hipo-diagram.md` → `.agents/docs/architecture/hipo-diagram.md`
- [ ] Copy `docs/capstone/architecture/system_architecture.md` → `.agents/docs/architecture/system_architecture.md`
- [ ] Add YAML frontmatter to each file: `tags: [architecture]`, `source: docs/capstone/architecture/`
- [ ] Update `00-index.md` with `[[architecture/system-overview]]` and sibling links
- [ ] Add a note at the top of each original source file in `docs/capstone/architecture/`: `> **Canonical location:** [.agents/docs/architecture/...](.agents/docs/architecture/...)`

**Migration required:** No

---

## Phase 3: Migrate Feature Research Docs

**Goal:** Copy audio anomaly and telemetry feature docs into `.agents/docs/features/` with proper cross-links.

### Audio Anomaly

- [ ] Copy `docs/capstone/audio-anomaly/architecture-decision-record.md` → `.agents/docs/features/audio-anomaly/architecture-decision-record.md`
- [ ] Copy `docs/capstone/audio-anomaly/calibration-baseline.md` → `.agents/docs/features/audio-anomaly/calibration-baseline.md`
- [ ] Copy `docs/capstone/audio-anomaly/false-positive-analysis.md` → `.agents/docs/features/audio-anomaly/false-positive-analysis.md`
- [ ] Copy `docs/capstone/audio-anomaly/yamnet-class-mapping.md` → `.agents/docs/features/audio-anomaly/yamnet-class-mapping.md`
- [ ] Add frontmatter: `tags: [feature, audio-anomaly]`, `source:` original path

### Telemetry

- [ ] Copy `docs/capstone/telemetry/01-telemetry-overview.md` → `.agents/docs/features/telemetry/01-telemetry-overview.md`
- [ ] Copy `docs/capstone/telemetry/02-ingestion.md` → `.agents/docs/features/telemetry/02-ingestion.md`
- [ ] Copy `docs/capstone/telemetry/03-policy-rules-settings.md` → `.agents/docs/features/telemetry/03-policy-rules-settings.md`
- [ ] Copy `docs/capstone/telemetry/04-redis.md` → `.agents/docs/features/telemetry/04-redis.md`
- [ ] Copy `docs/capstone/telemetry/05-storage.md` → `.agents/docs/features/telemetry/05-storage.md`
- [ ] Add frontmatter: `tags: [feature, telemetry]`, `source:` original path

### Cross-links

- [ ] Update `00-index.md` with `[[features/audio-anomaly/architecture-decision-record]]` section
- [ ] Update `00-index.md` with `[[features/telemetry/01-telemetry-overview]]` section
- [ ] Add back-reference note to each original source file

**Migration required:** No

---

## Phase 4: Migrate Research / Capstone Top-Level Docs

**Goal:** Copy the four top-level `docs/capstone/*.md` research files into `.agents/docs/research/`.

- [ ] Copy `docs/capstone/audio-anomaly-monitoring.md` → `.agents/docs/research/audio-anomaly-monitoring.md`
- [ ] Copy `docs/capstone/mediapipe-monitoring.md` → `.agents/docs/research/mediapipe-monitoring.md`
- [ ] Copy `docs/capstone/telemetry-system.md` → `.agents/docs/research/telemetry-system.md`
- [ ] Copy `docs/capstone/tos-calculation.md` → `.agents/docs/research/tos-calculation.md`
- [ ] Add frontmatter: `tags: [research]`; add cross-links to related `features/` files using `[[wiki-links]]`
- [ ] Update `00-index.md` Research section with links to these files
- [ ] Add back-reference note to each original source file

**Migration required:** No

---

## Phase 5: Create Agent Rules & Workflows Overview Pages

**Goal:** Create two summary pages inside `.agents/docs/agents/` that catalogue and link every rule and workflow file so agents can navigate the full ruleset from the vault.

- [ ] Create `.agents/docs/agents/rules-overview.md`
  - Table of all rule files grouped by domain (global, api, web, mobile)
  - Each row: rule filename, one-line description, relative markdown link to the actual `.agents/rules/...` file
  - Frontmatter: `tags: [agents, rules]`
- [ ] Create `.agents/docs/agents/workflows-overview.md`
  - Table of all workflow files with slash command, description, and relative markdown link
  - Frontmatter: `tags: [agents, workflows]`
- [ ] Update `00-index.md` with `[[agents/rules-overview]]` and `[[agents/workflows-overview]]` links

**Migration required:** No

---

## Phase 6: Update `.agents/rules/implementation-plan.md` & `execution-plan.md`

**Goal:** Add contextual doc links inside the two agent rule files so agents can follow links into `.agents/docs/` for additional context.

- [ ] In `.agents/rules/implementation-plan.md`, add a `## Reference Docs` section with links to:
  - `[[../docs/agents/rules-overview|Agent Rules Overview]]`
  - `[[../docs/agents/workflows-overview|Agent Workflows Overview]]`
  - `[[../docs/architecture/system-overview|System Overview]]`
- [ ] In `.agents/rules/execution-plan.md`, add a `## Reference Docs` section with identical links
- [ ] Verify all relative markdown links resolve correctly from within Obsidian (relative to vault root `.agents/docs/`)

**Migration required:** No

---

## Phase 7: Validate Obsidian Vault Integrity

**Goal:** Confirm the vault is browsable in Obsidian with no broken links and all files are discoverable from the index.

- [ ] Open `.agents/docs/` as an Obsidian vault and verify the graph view shows all migrated files as connected nodes
- [ ] Check that all `[[wiki-links]]` in `00-index.md` resolve without the "unresolved link" warning
- [ ] Verify no original file in `docs/capstone/` or `docs/context/` was deleted — they remain in place
- [ ] Confirm `.agents/rules/` files still load correctly and new `## Reference Docs` links resolve
- [ ] Run a quick grep to ensure no broken relative paths: `grep -r "\[\[" .agents/docs/ | grep -v ".obsidian"`

**Migration required:** No

---

## Done Criteria

- [ ] `.agents/docs/` exists and contains all migrated documents
- [ ] `00-index.md` links to every section of the vault
- [ ] Every migrated file has YAML frontmatter with `tags` and `source`
- [ ] Original source files in `docs/` are untouched (no deletions, no renames)
- [ ] `.agents/rules/implementation-plan.md` and `execution-plan.md` reference relevant docs
- [ ] All `[[wiki-links]]` resolve inside Obsidian with no warnings
- [ ] No new tooling or npm dependencies were introduced

---

## Constraints Reminder

- **Do not delete** any existing files — only copy/add
- **Do not rename** any file in `docs/todo/` or `docs/task/`
- Use **relative markdown links** compatible with Obsidian (prefer `[[wiki-links]]` for vault-internal navigation)
- No new tooling — shell `cp` commands only
