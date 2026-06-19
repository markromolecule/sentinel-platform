# Issue

- The upload of image on the passage are successful and I already double check if the image are on the bucket and it is. But, it does not shows an image on the passage.
- When the image is uploaded the [image] is not saving nor retaining after saving.
-

# Implement

- Instead of showing [dialog] on the [edit question] on the [question bank]; it should redirect me to the [builder] page that will allow me to edit the question.

For e.g

- This is when the user edit questions
  http://localhost:3000/exams/7af13ee8-2724-4e60-bdb1-0f7ce28de3db/builder

- Meanwhile, on question bank it just opens a dialog. So, I want you to redirect it to the page this is to reduce the complexity of having a dialog for the edit of questions when we can just use the existing builder editor for the specific question. It can be like this
  http://localhost:3000/question/bank/[id]/builder

- This same goes apply to the [collection] page for editing a questions
  http://localhost:3000/question/bank/collections/d1371bc7-2d21-48ff-b212-822ec9b98be7/builder

- Also, the edit when the [questions] are generated from the [collection] page
