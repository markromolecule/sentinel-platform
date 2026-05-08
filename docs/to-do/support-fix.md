# Sentinel Support (Fix)

## Issues

- Improve the [Naming Conventions] on [Institution Setup]:

1. The naming convention for [section] should follow for e.g

    > BS Information Technology - it will get the [INF] which is the first 3 letters of the [course] then follow by the [year] for e.g now is [2026] so it will be [26] then follow by the increment for the section [INF261] with this - this will be the standard naming convention for the [institution]
    > Ensure that the [naming conventions] are correctly passed to the institution wherein, when the user of the system is creating a [section] it will automatically adapt the set naming conventions under the institution.
    > The add [section] dialog on the [sentinel-core] which is on the [admin] should automatically fetch the naming convention on the section name.

2. The naming convention for [room] should follow for e.g

    > The [floor] of the [room] are on the 4th floor meaning the start of the numbering is on the [display_name] -> Room -> [Floor] -> [room_number] for e.g [401] It will become Room 401. Meaning: 4th floor -> 01 is the increment of the room in that floor.
    > It should be dynamically applied when the user creates a room on the [institution setup] and on the [room management] when the dialog ask for the [institution] it will be updated.

3. Fix the hierarchy of the [institution setup]

    > Identity
    > Academic Terms
    > Naming Conventions
    > Departments
    > Courses
    > Sections
    > Review

4. Inside the [parent] page which shows the branches of the institution update the table column for parent to show the [parent_name] not the [parent_id]

5. Inside the [parent] page when adding a [branch] / [institution] it should automatically fetch that the user is creating a [branch] under the parent institution and the user should not be able to create a [parent] under a [branch] / [institution].

6. The [course] management on the [sentinel-support] when I am trying to manage [sections] on the [dialog] it does not work when I try to add a new [section] to the [course]

7. Cleanup the [sentinel-support] pages by removing the [add] button for:

    > Course Management
    > Section Management
    > Subject Management

8. On [sentinel-support] -> [Subject] management, you should add also the [subject_classification] page similar on the [sentinel-core] -> subject management page in which it classify the subjects created on the [institution] in that way it will just also inherited by the [branches] of the [institution].

9. On [sentinel-support] -> [Subject] management:
    > The [department] column on the [subject] table should show the [department_code] only not the [department_name]
