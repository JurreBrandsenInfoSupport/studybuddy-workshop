# Generate Code Review Document

Generate a **complete, structured code review document** for a GitHub issue based on:
- The issue description and discussion: **${input:issue}**
- The acceptance criteria
- The **existing implementation on `main`**
- The **new/changed implementation on a feature branch**: **${input:feature_branch}**

Assume you have access to the entire repo `JurreBrandsenInfoSupport/studybuddy-workshop`, including its Git history and diffs.

**Important**:
This code review document will be used by another AI agent (and by humans) to perform or finalize the review.
**They only see what you write here**, so include all necessary technical context, references, findings, and recommendations.

---

# Analysis Process

## 0. Task & Issue Understanding

- Read the GitHub issue: ${input:issue}
- Extract:
  - Problem statement & intent
  - Functional and non-functional requirements
  - Acceptance criteria
- Identify:
  - Expected behavior vs undesired current behavior
  - Impacted user flows or system components

---

## 1. Code Change Analysis

### 1.1 Compare Main vs Feature Branch

Perform a thorough diff between:

- **main**
- **${input:feature_branch}**

Document:

- All changed files (paths + purpose)
- New files introduced
- Removed code
- Renamed/moved artifacts
(You must list these concretely in the final output.)

### 1.2 Categorize Changes

Identify and document:

- **Functional changes**
  - new logic
  - changed logic
  - removed logic
  - branching behavior changes
- **Structural changes**
  - refactors
  - reorganized modules
  - naming improvements or regressions
- **API/contract changes**
  - return types
  - input validations
  - breaking changes
- **Test changes**
  - updated unit tests
  - missing test coverage
  - outdated tests removed/not removed

### 1.3 Link Changes to Acceptance Criteria

Map each acceptance criterion to the code areas that implement it:

- Which classes/functions/modules implement each criterion
- Whether the implementation meets each criterion
- Any mismatches, missing cases, or inconsistencies
(This mapping must appear in the final output.)

---

# Code Review Document Structure

Your final output must follow this structure:

---

## 1. Overview

- **Feature Name / Issue Name**
- **GitHub Issue**: ${input:issue}
- **Feature Branch**: ${input:feature_branch}
- **Reviewer Context Summary**
  - What the issue intends to solve
  - High-level behavior changes
  - Key modules involved

---

## 2. Summary of Changes

Provide a clear breakdown of all changes grouped by category:

- **Application logic**
- **Domain/model changes**
- **API/endpoint changes** (if applicable)
- **UI changes** (if applicable)
- **Infrastructure/config changes**
- **Test suite changes**

For each file, include:

- File Path
- Brief description of what changed
- Whether the change is functional, structural, or cosmetic

---

## 3. Code Quality Evaluation

### 3.1 Correctness

Evaluate:

- Does the code actually fulfill the acceptance criteria?
- Is the logic correct and aligned with intended behavior?
- Are edge cases and failure scenarios handled?

### 3.2 Clarity & Maintainability

Check:

- Readability (naming, structure, function length)
- Consistency with existing patterns in the repo
- Duplication and opportunities for reuse
- Comments vs self-documenting code

### 3.3 Architecture & Patterns

Document:

- Whether architectural boundaries are respected
- Usage of dependency injection, services, repositories, helpers, etc.
- Conformance to existing architectural conventions in this repo

### 3.4 Error Handling & Validation

Check:

- Input validation
- Error branches
- Exception handling
- Logging
- Are the error messages helpful and consistent?

### 3.5 Tests & Coverage

Evaluate test changes:

- Coverage of new/changed behavior
- Missing unit tests
- Missing integration/E2E tests
- Redundant or obsolete tests remaining
- Consistency with existing testing approach

---

## 4. Performance & Security Considerations

Document:

- Any new potential performance bottlenecks
- Any blocking operations introduced
- Security implications:
  - Input sanitization
  - Authorization changes
  - Sensitive data handling
  - Exposure of internal details
- Whether telemetry/logging leaks any sensitive info

---

## 5. Regression & Backwards Compatibility Risks

Identify:

- Parts of the system indirectly impacted
- Business flows that might be unintentionally affected
- Any breaking API changes (internal or external)
- Whether existing data is still compatible

---

## 6. Alignment With Acceptance Criteria

Create a table or list mapping:

**Acceptance Criterion → Code Change → Pass/Fail/Escalate**

For each criterion:

- Does the new code satisfy it?
- Are there missing cases?
- Are tests proving that behavior?

Example structure:

| Acceptance Criterion | Implemented in | Status | Notes |
|---------------------|----------------|--------|--------|
| Criterion A | `src/.../Service.cs` | Pass | Behaviour fully matches spec |
| Criterion B | Missing | Fail | No test coverage, unclear logic |

---

## 7. Recommendations & Required Changes

Group findings into three categories:

### 7.1 **Must Fix**
Critical issues that block merging:
- Incorrect logic
- Missing requirements
- Security issues
- Breaking changes

### 7.2 **Should Fix**
Important improvements that increase quality but are not blockers:
- Naming
- Missing tests
- Inefficient patterns

### 7.3 **Nice to Have**
Nonessential quality improvements:
- Minor refactors
- Comments
- Code style cleanup

---

## 8. Final Verdict

Provide one of:

- **Approved**
- **Approved with comments**
- **Changes Requested**

Include a short summary explaining the verdict.

---

## Output Requirements

Your output must be:

- A fully structured markdown document
- With explicit references to:
  - Code files
  - Functions
  - Classes
  - Tests
  - Acceptance criteria
- With clear actionable findings

The document should be usable by an engineer or AI agent to complete the code review without needing any additional context.

---

## Quality Checklist

Review your final output and ensure it includes:

- [ ] Full diff analysis (main vs ${input:feature_branch})
- [ ] Coverage of all acceptance criteria
- [ ] Clear, structured breakdown of changes
- [ ] Accuracy & correctness evaluation
- [ ] Maintainability & clarity assessment
- [ ] Architecture & pattern evaluation
- [ ] Error handling coverage
- [ ] Test coverage quality review
- [ ] Risks and regressions identified
- [ ] Actionable recommendations
- [ ] Final verdict

