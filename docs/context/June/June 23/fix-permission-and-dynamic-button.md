# Goal

- To fix the [permission] in [role matrix], whereas, the permission are not being saved successfully and returning back to fallback.
    - Ensure that when the user disabled a [permission] it will dynamically hide the specific functionality to the page for e.g buttons that will handle the create, bulk uploads on the header of the page.

- Identify the pages from sentinel-support, sentinel-core, sentinel-web first then apply this changes for pages that handles CRUD wherein it will dynamically hide the access when the permission is not granted for that role.
    - Department page -> add department -> permission is not granted -> hide the add department button. If, update or delete, it usually place under the rows of the table on the action columns you should disable or hide it also when the permission is not granted for it
    - Analyze the structure.

You can start applying this from sentinel-support pages such as - Institutions - Departments - Courses - Sections - Rooms - Semesters - Subjects - Control - Telemetry - Analytics - Announcements - Calendar - Messages - Logs

Ensure that each page will look for the permission for the role of the current user before rendering the page.

Next phase will be focused on sentinel-core for later - Departments - Rooms - Semesters - Analytics - Announcements - Calendar - Classrooms - Courses - Exams - Logs - Messages - Question bank, Question Collection, TOS Matrix, Import - Sections - Subjects
