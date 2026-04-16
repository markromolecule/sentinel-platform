# Subject Classification To-Do Workflow

## 1-3-1 Rule

1 goal:
Deliver a shared superadmin subject-classification workflow inside Subject Management.

3 execution checkpoints:

- Persist subject classification groups and subject assignments.
- Expose classification management through the API and shared client hooks.
- Add the superadmin UI flow with grouped cards, assignment editing, and subject-table visibility.

1 verification gate:

- Validate the shared packages, the core app, and the touched API subject module before rollout.

## Rollout Checklist

- [x] Add database support for subject classification groups and subject assignment mappings.
- [x] Extend subject responses to surface assigned classifications in the main catalog.
- [x] Add subject classification API routes for list, create, update, and delete.
- [x] Add service and hook support for the new classification workflow.
- [x] Add the superadmin Subject Classification subpage and sidebar navigation.
- [x] Add grouped classification cards with subject tables and edit/delete controls.
- [x] Add a Subject Management shortcut so superadmins can move between catalog and classifications.
- [ ] Apply the new Prisma migration in each deployed environment.
- [ ] QA the create, edit, assign, and delete flow with real superadmin accounts.
