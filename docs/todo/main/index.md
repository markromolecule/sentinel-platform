# To:do

1. Re-calibrate the
   [ ] Gaze
   [ ] Audio
    - It should properly or subtle flag the event based on how frequent the student commit

2. Re-calibrate the
   [ ] clipboard_control - Issue: The system is so sensitve marking it [High] even if the event is does not frequently
   [ ] tab_switching_monitor - The system is so sensitive marking it [High]
   [ ] right_click_disable - This is not working and its not being flag on the instructor monitoring
   [ ] full_screen_required - it being triggered after the examination because during the attempt after finalizing the exam the full_screen. will minimize now and the system considered that as a flag instead of gradually moving to the next page its being flagged by the system

3. Ensure that each event @packages/shared/src/schema/telemetry/telemetry-schema.ts should be accurate on the [occurence count]

4. Finalize the UX for the instructor flagging

5. Fix the examination lifecycle whereas
    - When the student commit multiple [high] events of flagging the exam will be closed and navigating the student back to the home page
    - The instructor should have a control whereas when the student tries to enter on the lobby again of the examination the instructor page should has a way to approve the student to retake. the exam or the exam should be considered as a [retake] in that way its more clear to the end of the user
