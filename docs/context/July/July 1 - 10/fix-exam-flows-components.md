# Issues

## Implementation Status

- Implemented on `2026-07-01` in the student lobby, student attempt, student result, and instructor builder/config flows.
- Remaining follow-up is mainly verification for DB-backed API tests and any manual QA pass.

1. [Lobby] page
    - Lobby count took too long to update
        - Should be instant / use debounce
    - Reconnect attempt not showing [how many] are the available reconnect count
    - [Continue to attempt] Button should be:
        - Not clickable state if the student is not [approved] by the [instructor]
        - Clickable if the students is already [approved]

2. [Attempt] page
    - The passage side should only show the [passage] no need to showcase the
        - Reference
        - Reference page
        - Name of the file
    - Just show the [Passage] content

3. [Result] page
    - Improve the UX of the result page
        - More neat, clean, modular
        - Follow the theme of the system
        - Modern
        - Less text
        - Natural
        - Showcase important details
    - How the [result] page will show if the [Settings] for the [Show result] is disabled wherein, it will not show the [Score] of the student
        - With this, ensure that the [exam rules] on the [exam builder] should have a setting whether the [Score] will be out after the exam immediately or when the [Instructor] finalize the [Scores]
