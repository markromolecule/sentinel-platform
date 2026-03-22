# To-Do Plan: Exam Builder Layout Fixes

## Overview
This document outlines the planned fixes for the Exam Builder form alignment and the Question Type Modal styling, tailored to the recent feedback. Following the 1-3-1 rule, I present options to fix the layout glitches.

## Investigation & 1-3-1 Analysis

### Task 1: Create Exam Form - Subject & Section Alignment
**Objective**: Ensure the Subject and Section dropdowns have equal width (matching the Date/Time fields below them) and strictly trim long text to `...` without expanding the container.
**Root Cause**: The CSS Grid (`grid-cols-2`) allows columns to expand based on their content's minimum width. Because "Data Structures and Algorithms..." is long and doesn't wrap, it pushes the grid column wider than 50%.
**Viable Options:**
- **Option 1: CSS Flexbox with Explicit Widths**
  - _Description_: Use flexbox with `w-1/2` for both elements. Add `truncate` to the values.
- **Option 2: CSS Grid with Grid Blowout Prevention (`min-w-0`)**
  - _Description_: Keep the `grid grid-cols-2 gap-6` (matching the ScheduleFields exactly) but apply `min-w-0` to the wrapper. This forces the grid to respect the 50/50 split and allows the `SelectTrigger` to properly apply its internal CSS text truncation (`...`).
- **Option 3: Hardcoded Pixel Widths**
  - _Description_: Assign a strict pixel width to the select inputs.

**Best Option & Why:**
**Option 2** is the best choice. It directly matches the structural pattern used in `ScheduleFields.tsx` (`gap-6` and grid columns). By adding `min-w-0`, we fix the root cause of the layout stretching in Tailwind grids, enabling perfect 50/50 division and proper text truncation.

### Task 2: Question Type Modal - Height and Width Proportions
**Objective**: Lessen the exaggerated vertical height, make the modal wider, and fix the squished content positioning.
**Root Cause**: The modal is stuck at a narrow width (likely defaulting to standard `max-w-lg` or lacking responsive width classes). This forces the buttons to stack vertically and squeezes the text inside them.
**Viable Options:**
- **Option 1: Hardcoded Viewport Width**
  - _Description_: Force `DialogContent` to `w-[90vw]` regardless of screen size.
- **Option 2: Explicit Responsive Max-Width Overrides**
  - _Description_: Provide an explicit, overriding responsive scale: `className="sm:max-w-4xl md:max-w-5xl w-full"`. This ensures the modal successfully breaks out of the default narrow constraint on desktops. Adjust the grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` to balance the cards layout automatically across this newly available horizontal space.
- **Option 3: Vertical List Layout**
  - _Description_: Abandon the grid and display items as full-width rows in a standard narrow modal.

**Best Option & Why:**
**Option 2** perfectly resolves the issue. By forcing the `w-full` and responsive `max-w` overrides, the modal will actually become wide on desktop as intended. The grid will naturally populate the extra width, resulting in a significantly lower height.

---

## To-Do List

- [ ] **Task 1: Subject / Section Dropdown Layout**
  - [ ] Adjust `BasicInfoFields.tsx` to use `grid grid-cols-2 gap-6` (to match the Schedule fields gap).
  - [ ] Apply `min-w-0` to the `FormItem` wrappers or grid columns to prevent grid blowout.
  - [ ] Ensure the selected value container applies strict `truncate` so long subjects become `...`.
- [ ] **Task 2: Question Type Modal Proportions**
  - [ ] Update `QuestionTypeSelectorDialog.tsx` `DialogContent` to aggressively enforce width: `sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-full`.
  - [ ] Adjust grid strictly to `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to balance cards.

## Next Steps
Awaiting your explicit instruction to proceed with coding these layout fixes.
