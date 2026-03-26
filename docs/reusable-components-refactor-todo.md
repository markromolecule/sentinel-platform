# To-Do Plan: Reusable Components Refactoring

- [ ] Define the interface for the reusable components (SearchBar, PageHeader, FacetedFilter) <!-- id: 1 -->
- [ ] Create `PageHeader` in `@sentinel/ui` by moving it from `sentinel-web` <!-- id: 2 -->
- [ ] Create `SearchBar` in `@sentinel/ui` <!-- id: 3 -->
- [ ] Create `FacetedFilter` in `@sentinel/ui` <!-- id: 4 -->
- [ ] Refactor `DataTable` to accept these components as optional slots or use them internally while exposing them <!-- id: 5 -->
- [ ] Replace hardcoded instances in `SubjectsPage` and `SubjectsTable` <!-- id: 6 -->
- [ ] Verify functionality and UI consistency across the system <!-- id: 7 -->
