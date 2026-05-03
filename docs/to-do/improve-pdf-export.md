# Improvements for export / pdf for examination

1. Don't add a wrapper card for each questions
2. Ensure that there's a settings for selecting a paper size for e.g A4
3. Use only what the exam [question_section] used don't add duplicate because right now, it has duplicate the name of the question section and the types of the question
4. On [essay] type of question remove the 1,2,3,4... numbers on each lines
5. Ensure that if the questions are limited to [selected] size of the paper then if its more longer, you should add a page wherein it will serve as the next page of the examination.
6. Ensure that the [export] of the examination will look like naturally a sample of an examination paper where university standards met
7. Ensure that it will fetch the exam instruction for each [exam_section]

## Improvements for exam builder

1. Include a description for each section, in that way the instructor can include the instruction for each section.
2. Ensure that the [exam_rules] default for [instructor_admit] are default enable, currently its default disable, check why its not showing here @app/sentinel-web/src/features/exams/config/\_components/exam-rules-section.tsx but it show on the ui that the [admin] settings are available,
3. Move the [admit_rules] @app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/\_components/exam-builder-sidebar.tsx from that to the exam-rules in that way its more cleaner also remove the description

@app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/\_components/\_constants/index.ts
@app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/builder/\_components/exam-builder-sidebar.tsx

- Ensure to update all the [schemas], [dto], [service] that we need to add the [admint] exam rules to the settings instead of manually typing it.
