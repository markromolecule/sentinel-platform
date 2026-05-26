# Fix on the student exam page the system should k now if the exam is already taken by the student [if its already turned_in] this prevents duplicate

# We need to streamline and have a proper handle the exams I suggest:

1. Create a page for [Classroom Management] this should handle the groupings of the [Section], [Student], [Subject].

Mainly instructor will -> create a class [It can be card] -> the dialog should have a field for [offered_subject] wherein this are the subjecets that the [instructor] -> [request_subject] that has been approved. The dialog should the data of the [request_subject] this include the [departments, courses, year levels, sections] of the subjects this then with that the [instructor] can select on the [approved_requested_subject] on what he / she will create a [class] for it and indicate the name for that class and this ensure that the class is linked to a specific [section, courses, department, year levels]. Inside the classId the instructor can add a students inside [just the claimed account only] similar to the implementation on the [student] page

Just reuse all the existing logic and fully analyze the backend and ensure to have similar structure to other

Check also the prisma for any migration needed for this

This streamlines the [exam] page wherein the dialog can now remove the [subject] and [sections] and just have to fetch the [classroom] and assign a room for the exam.
