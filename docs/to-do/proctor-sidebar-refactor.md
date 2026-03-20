# To-Do Plan: Proctor Sidebar Refactor

## Phase 1: Planning & Discovery
- [x] Research `SidebarProvider` and `Sidebar` component interactions in `@sentinel/ui`.
- [x] Identify how to disable the sidebar gap to allow overlapping.
- [x] Determine the best way to implement hover-based state toggling without flickering.
- [x] Define the exact behavior for "collapsed on hover" vs "expanded on hover".

## Phase 2: Implementation (Pending Approval)
- [ ] Update `ProctorLayout` to set `defaultOpen={true}` (uncollapsed).
- [ ] Modify `ProctorSidebar` or `Sidebar` component to handle `onMouseEnter` and `onMouseLeave`.
- [ ] Implement CSS changes to make the sidebar overlap (remove `sidebar-gap` width).
- [ ] Ensure `SidebarInset` does not have margins that shift with sidebar state.

## Phase 3: Verification
- [ ] Test desktop view for overlapping behavior.
- [ ] Verify hover triggers the expected state change (Expand/Collapse).
- [ ] Confirm no layout shifts occur when the sidebar state changes.
- [ ] Ensure mobile view (Sheet-based) still works as expected.
