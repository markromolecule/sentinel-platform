# Git Workflow & Commit Rules

This project enforces strict source control behaviors primarily modeled out of the [Conventional Commits](https://www.conventionalcommits.org/) standards. Maintaining a predictable, uniform history improves automated version tracking and CI/CD pipelines.

## Conventional Commits

All changes pushed to Sentinel repositories must strictly follow standard formatting criteria under the imperative phrasing, such as `"change"` instead of `"changed"`.

### Formatting Structure

```
<type>[optional scope]: <description>

[optional body explaining what and why]

[optional footer(s)]
```

### Approved Commit Types

- `feat`: Developing a brand new feature for the application.
- `fix`: Implementing a fix for a known issue or bug.
- `docs`: Modifying, updating, or adding to documentation spaces.
- `style`: Rectifying formatting, missing semi-colons, white-space checks, etc., completely without impacting code function.
- `refactor`: Structural codebase updates aiming explicitly to improve modularity and clean behavior, unrelated to new bugs/features.
- `perf`: Improving the overall speed or execution cost of the application code.
- `test`: Appending missing tests or updating preexisting integration/unit tests.
- `build`: Configurations targeting build configurations or dependencies (`npm`, `pnpm`, extensions).
- `ci`: CI tool configurations and automation workflow operations.
- `chore`: Extraneous actions like deleting dead configuration files and repository tidying.
- `revert`: Withdrawing an unstable previous internal commit.

### Style Guidelines

1. **Short Descriptions:** The first descriptive line of the commit MUST remain under 72 characters.
2. **Grammar:** Use imperative, present-tense phrasing ("add section" vs "added section").
3. **Casing:** Prevent capitalizing the primary letter in the commit description line.
4. **Punctuation:** Exclude concluding periods `(.)` at the end of the commit label.
5. **Detailed Context:** Rather than describing _"how"_ a change works computationally inside the body, explain _"what"_ and _"why"_ it was required.

### Branch Structure

We adhere to trunk-based operations branching predominantly off a primary `main` or `develop` structure. Team workflows prioritize short-lived testing branches that culminate into fast, peer-reviewed Pull Requests targeting the core branch.
