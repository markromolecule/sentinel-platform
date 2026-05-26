# To-Do Plan - Search Query Support

## Progress Test Case documentation automation

Remaining items:

- [x] Create Global `useDebounce` Hook
    - [x] Implement `use-debounce.ts` in `packages/hooks/src/`
    - [x] Export hook from `packages/hooks/src/index.ts`
- [x] Implement Backend Search for Courses
    - [x] Update `courses.dto.ts` with `search` query parameter
    - [x] Update `get-courses.controller.ts` to handle `search` parameter
    - [x] Update `courses.service.ts` to pass `search` term
    - [x] Update `data/get-courses.ts` with Kysely `ilike` search logic
- [x] Implement Frontend Search with `useDebounce`
    - [x] Update `getCourses` API helper to support `search` query param
    - [x] Update `useCoursesQuery` hook to accept `search` param
    - [x] Integrate `useDebounce` and `SearchBar` in `AdminCoursesPage`
- [x] Fix Search UX and Alignment Issues
    - [x] Fix focus loss by keeping SearchBar mounted during loading
    - [x] Fix search accuracy by narrowing fields to `title` and `code`
    - [x] Align SearchBar with DataTable facets in `CourseList`
    - [x] Remove redundant SearchBar from `CourseList`
