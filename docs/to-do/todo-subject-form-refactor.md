# Refactor SubjectFormFields

Refactor `SubjectFormFields.tsx` to improve modularity, readability, and scalability while adhering to project structure and code organization rules.

## [ ] Research & Investigation
- [x] Analyze `SubjectFormFields.tsx` current implementation.
- [x] Review `useSubjectFormFiltering` hook.
- [x] Check existing components (`SubjectSelector`, `SectionSelector`).
- [x] Verify types in `_components/forms/_types/index.ts`.

## [ ] Sub-Component Extraction
- [ ] Create `MetadataSelectors` component (Department, Course, Year Level).
- [ ] Update `SubjectSelector` to ensure it integrates seamlessly with `react-hook-form`.
- [ ] Update `SectionSelector` to wrap `FilterableCheckboxGroup` for a cleaner interface.

## [ ] Type Refinement
- [ ] Add `SubjectSelectorProps` to `_components/forms/_types/index.ts`.
- [ ] Add `MetadataSelectorsProps` to `_components/forms/_types/index.ts`.

## [ ] Main Component Refactor
- [ ] Update `SubjectFormFields.tsx` to use:
    - [ ] `SubjectSelector`
    - [ ] `MetadataSelectors`
    - [ ] `SectionSelector`
- [ ] Ensure all conditional rendering and animations are preserved.

## [ ] Verification
- [ ] Confirm form state updates correctly via `useSubjectFormFiltering`.
- [ ] Verify validation still works as expected.
- [ ] Ensure visual consistency and animations.
