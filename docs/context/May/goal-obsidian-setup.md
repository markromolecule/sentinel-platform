# Goal

Consolidate and organize our scattered codebase documentation into a structured `.agents/docs/` directory, making it the single source of truth — accessible to AI agents and browsable as an Obsidian knowledge base.

## What we're currently doing

- Documentation is scattered across the codebase with no consistent structure or location
- `.agents/rules/implementation-plan.md` and `.agents/rules/execution-plan.md` exist but don't reference or link to any supporting docs

## What we want

- Create a `.agents/docs/` directory to house all documentation
- Migrate and consolidate scattered docs into `.agents/docs/`, organized logically
- Update `implementation-plan.md` and `execution-plan.md` to reference relevant docs in `.agents/docs/` using relative links
- Structure files so they work as an Obsidian vault (wiki-links, logical folder hierarchy, no broken references)
- AI agents reading `.agents/rules/` can follow links into `.agents/docs/` for context

## Why

- Give AI agents a reliable, navigable doc structure to reference during code tasks
- Enforce a consistent documentation standard across the team
- Make docs discoverable and interlinked via Obsidian

## Constraints

- Do not break any existing file references
- Keep the Obsidian vault structure intact (use relative `[[wiki-links]]` or markdown links compatible with Obsidian)
- No new tooling — reorganization only, using existing file structure
- Must integrate with our custom `.agents/` framework

---

A few things you should still fill in before using this prompt:

- **Which docs are being migrated?** Name the specific files or folders, or describe the pattern (e.g. `docs/`, `README.md` files in subdirectories, etc.)
- **What's the target folder structure inside `.agents/docs/`?** E.g. by feature, by layer (architecture, API, onboarding), etc.
- **Who is this prompt for?** An AI agent executing the task, a teammate, or yourself as a checklist?
