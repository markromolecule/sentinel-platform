# Fix

1. Admin & Superadmin from other intitution can view other institution's [offered_subjects]. It should be limited within the institution only.

2. Admin & Superadmin from other institution shouldn't view the other institutions [enrollment_requests]. It should be limited within the institution only

# Implement

1. Using [subject_classification] they can offer it [bulk] to [subject_offered] this will solved the [manual] - [offered_subjects] for e.g the superadmin / admin classify the subjects as [general_education] the [subjects] inside the [classification] can be now offered as a bulk; no more manual offering

2. Fix the [@app/sentinel-core/src/app/(protected)/subjects/_components/cards/subject-classification-card.tsx].

- Fix a better font size
- Make the card smaller in terms of width
- Ensure to not enlarge the font size for the tags
- Resolve the whitespaces
