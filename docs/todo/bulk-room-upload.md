# Goal

- To implement a bulk room upload

We can simplify the adding of section by inheriting the [naming_convention] when the [parent_institution] is selected then it will just ask for the range of number to use on the room date

for example

the [naming_convention] in [parent_institution] is [Room] and [RM]
it will just ask for the range and type of room it can be

- lecture room
- laboratory room
- vr room

after selection, the user can add a range of numbers for example
400 to 450 the system will generate a room for lecture room for example
RM400, RM401, RM402 ... RM450
Room 400, Room 401, Room 402 ... Room 450

- Ensure to update the backend to handle bulk upload of rooms
- Ensure to update the frontend to handle bulk upload of rooms
