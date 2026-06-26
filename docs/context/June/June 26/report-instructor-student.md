# Feature

- To create a page that will show the [report] for the examination of each students that takes the exam. It should render:
    - The examination questions and the students answers
        - You can render it like a [google-forms] checking; It should show the [correct-answers] of the questions and for scenario for essay, it should give the rubrics breakdown.
        - Ensure our insiration for the UI/UX here is the [google-forms] in that way the instructor can easily check those answers if there's any wrong or something.
    - How the system graded the exam of the students
    - It should also allow the instructor to [override] the correct items on the examination, where instructor can adjust it whether there's a mistakes on the examination.
    - Ensure that its accessible based on who is the [assigned] instructor is

- Ensure to create another path for the [report] page
    - @app/sentinel-web/src/app/(protected)/(instructor)/exams
    - Add the new path to the sidebar layout of the exam page

- You should also create a [report] similar on the abovementioned rendering style, whereas, students can also check their
    - examination questions and their answers
    - the correct answers of the questions
    - how the system graded their exam
    - and if there's any override by the instructor on their examination
    * This should also look like a google forms

- This report page should be responsive to different screensizes

# Minor adjustment

- Adjust the [passage] view on the student during the attempt, whereas, the [passage] shows the reference instead of showing only the [passage] content since we want to create this passage cuztomizable which is already implemented but you can still check it if its working when you try to modify the passage and ensure that it will be show during the examination the modified one
