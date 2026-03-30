# To-Do: Implement Select All for Sections

Implement a "Select All" feature in the instructor enrollment subjects dialog to allow instructors to quickly choose multiple sections.

- [ ] Update `filterable-checkbox-group.tsx`
    - [ ] Add `onToggleAll` prop: `(values: string[], checked: boolean) => void`.
    - [ ] Add a "Select All" toggle button in the header.
    - [ ] Integrate it with the existing search/filter logic.
- [ ] Update `subject-form-fields.tsx`
    - [ ] Implement `handleToggleAllSections` using `form.setValue`.
    - [ ] Pass the handler to `FilterableCheckboxGroup`.
- [ ] Manual testing:
    - [ ] Verify "Select All" works without search filter.
    - [ ] Verify "Select All" works WITH a search filter (only selects filtered items).
    - [ ] Verify "Deselect All" works when all visible items are selected.
