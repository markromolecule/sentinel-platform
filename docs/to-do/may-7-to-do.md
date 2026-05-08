# Todo's and Goals

1. Room functionality

- when we assign the room to a examination
  1.1. It should be not be possible to assign the room to another examination.
  1.2. Ensure that the room is link to an exam up until the exam ends.

- update the ui of the room in the [create] exam-dialog
  1.1. How it will handle many rooms?
  1.2. Provide a better way to select/assign rooms - right now it just uses drop-down. So, what if there's a 50 rooms, the user will have a hard-time to scroll the drop-down to find the right room. Even if we add a search its still not ideal. Our goal is to provide a better option for UX

2. Add a button on the [Administrator Management] in [Sentinel Support]

- Add a button that will create a [support] account for the [institution]
  1.1. Ensure that the dialog can be similar to the [add] superadmin dialog
  1.2. Ensure that it will send an email to the [email] that will be input for the [support] account. No need for the [department] just the [institution].

- Create a sub tab for the [Administrator] management this will separate the superadmin and support accounts

3. Implement a [update] on the - [enrollment_request]

- the superadmin & admin can update the [enrollment_request] of the [instructor]
  1.1. A dialog that can update the [request] of the [instructor] in superadmin and admin account
  1.2. A dialog that can update the [request] of the [instructor] in instructor account. Wherein, the instructor can also update the request that sent to the [superadmin] / [admin].

4. With this implementation

- Ensure that the permission is updated on the [control] module
  1.1. Update the room permission
  1.2. Update the enrollment_request permission
