---
name: issue-draft-template
description: Draft GitHub issues using the StudyBuddy+ User Story format. Use this whenever the user asks to create, draft, or refine an issue so the output always follows the same title, user story, acceptance criteria, technical notes, and testing structure.
---

# Issue Draft Template

Use this skill whenever you are drafting an issue document for this repository.

## Goal

Produce a consistent issue draft in `issues/` using a standard structure that is easy to review, test, and hand off to implementation agents.

## Workflow

1. Gather missing requirements before drafting if the request is ambiguous.
2. Draft the issue in markdown with the exact section order from this skill.
3. Save the draft under `issues/` with a short kebab-case name.
4. Present the draft to the user for approval before creating a GitHub issue.

## Title Rules

- Keep title under 60 characters.
- Start with a verb: `Add`, `Fix`, `Update`, `Implement`, `Refactor`, `Improve`.
- Make the scope specific and actionable.

## Required Output Format

Always use this exact structure:

```markdown
# <Action-oriented title>

## User Story
As a [user type],
I want [goal],
so that [benefit].

## Description
<2-3 sentences describing context, intent, dependencies, and constraints>

## Acceptance Criteria
- [ ] <Specific, testable outcome>
- [ ] <Specific, testable outcome including an edge case>
- [ ] <Specific, testable outcome including validation behavior>

## Technical Notes
- **Frontend changes:** <components/pages impacted or "None">
- **Backend changes:** <endpoints/services/models impacted or "None">
- **Database:** <schema/data migration impact or "None">
- **Dependencies:** <new packages/tools or "None">

## Testing Considerations
- Unit tests: <what logic/components/services need unit tests>
- Integration tests: <what end-to-end workflow needs integration coverage>
- Edge cases: <boundary/error/empty-state scenarios to validate>
```

## Quality Checklist

Before presenting the draft, verify:

- User story clearly states who, what, and why.
- Acceptance criteria are observable and measurable.
- Technical notes map to likely touched areas.
- Testing considerations include happy path and edge cases.
- Any unknowns are listed as explicit assumptions.

## Handling Missing Information

If details are missing, include short assumptions at the end:

```markdown
## Assumptions
- <assumption 1>
- <assumption 2>
```

Keep assumptions minimal and ask the user to confirm them during review.
