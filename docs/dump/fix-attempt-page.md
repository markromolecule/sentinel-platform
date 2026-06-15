# Issue & Implementation:

1. Some students when they commited an event then navigate back to attempt page- it won't let them or its bugging and won't let them click components inside the attempt page.

2. How the reconnect attempt works. I need a clear identifier wherein the- reconnect does actually works for e.g if I refresh my attempt page it will redirect me back to lobby before continuing again this ensure that the reconnect will count

3. Implement a way where the student can't automatically redirect to [attempt] page from [lobby]. On [instructor] monitoring page [implement] a way where the [instructor] can now let the [student] in. In addition, add a settings for examination where [instructor] can [enable] or [disable] a setting where will let the students in upon opening or as soon as the exam is [open] = [start_date] of the [examination_published] if its [enable] - it won't let the student pressed the button on the a [lobby] page to redirect to [attempt] page- and the instrucot will manually click a [button] that will let the students allow to click now the continue to [attempt] page

4. Finalize now the configuration. [exam_rules] and [system_configuration] are all working. for e.g:

- exam rules: [shuffl_questions] does it really shuffle the questions of the each students?
- system configuration: does the [monitoring_rules] are working when it toggles on and off?

5. Re-calibrate the [gaze_tracking] of mediapipe on [student]

- for students that has glasses
- for students that has low quality camera
- for mobile phones, how the system will handle it
- for low-end devices to avoid any pain points during the examination specifically on the
