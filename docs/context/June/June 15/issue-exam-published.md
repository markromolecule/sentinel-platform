# Issue

1. when user A creates an exam metadata, the user B should
    - can't edit the exam
    - can't update the exam
    - can't delete the exam

    * since the user A creates it

2. when user A set the exam metadata to private, the user B should
    - can't see the exam since its in private

# Implement
1. when the private exam either draft or published but the user A
    - assign it to user B that's the time where user B should have access to the exam

2. create a dialog for deleting a assign on exam
    - this is on the assignment page 
    - ensure the dialog is similar to the dialogs for delete on other components 

    * @packages/ui/src/components/ui/dialog.tsx

