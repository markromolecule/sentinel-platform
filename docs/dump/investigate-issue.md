# Issue

- The assigning a instructor is not fetching the instructor account under the

1. Institution

- When the [Instructor] sends a [request] for the [subejcts] it should create a [notification] for the administrator that [Instructor] request .... then if the [Administrator] such as [admin] or [superadmin]

1. rejects -> the notification of the [instructor] will be received is subjects rejects etc
2. accepts -> approved subjects ......

- The [superadmin] and [admin] does not have a [notification] this should shows when an [administrator] do some [CRUD] on each module for e.g add a section it will be notify the other
- For example in subjects when the [superadmin] bulk uploaded a subjects or create a new [subject_classification] it should be put in the [notification]

- Support page does not also have [notification] similar to other when it performs some CRUD or something it should show on the [notification] and it should [broadcast] to [superadmin, admin, instructor]

- Should we create a [broadcast] module in the backend? @app/sentinel-api/src/modules/infrastructure/broadcast this is for the notification feature
- The [broadcast] module will be responsible for sending notifications to the users and build how the notification will be structured like [name] creates a new department like that or whatsoever or should i just use the [notification] module? I just think for the [broadcast] module since we also need a [announcement] module in which handles the announcement of the user meanwhile [notification] just handle when something change or update on the system under the institution
