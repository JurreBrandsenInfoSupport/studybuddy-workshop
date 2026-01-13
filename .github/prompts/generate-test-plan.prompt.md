# Generate Test Plan

Generate a **comprehensive test plan** for a GitHub issue based on:
- The issue description and discussion: **${input:issue}**
- The **acceptance criteria**
- The **existing implementation on `main`** and the **new/changed implementation on a feature branch**: **${input:feature_branch}**

Assume you have access to the full codebase and Git history for the repository
`JurreBrandsenInfoSupport/studybuddy-workshop`.

The output will be used by another AI agent (and by humans) to actually execute
and/or automate the tests. **They only see the test plan you generate here**, so
you must include all relevant context, references, and details.

---

## Analysis Process

### 0. Task & Scope Analysis

- Read the GitHub issue: ${input:issue}
- Extract:
  - Problem description and background
  - Functional requirements
  - Non-functional requirements (performance, security, UX, etc.)
  - **Acceptance criteria**
- Clearly define:
  - What is **in scope** for testing
  - What is **out of scope** (if anything)

### 1. Code & Change Analysis

- On the **`main` branch**:
  - Identify the current behavior and main code paths related to this issue
  - Locate key modules, classes, functions, endpoints, and UI components involved
  - Note any existing tests (unit, integration, E2E) that already cover parts of this feature

- On the **feature branch**: ${input:feature_branch}
  - Identify all files changed (diff vs `main`)
  - Determine:
    - New behaviors
    - Changed behaviors
    - Deprecated/removed behaviors
  - Map each change to:
    - Specific acceptance criteria
    - Potential impact areas (dependencies, cross-cutting concerns)

- Summarize:
  - Which parts of the system are **directly** affected
  - Which parts are **indirectly** affected and may need regression testing

### 2. Risk & Impact Assessment

- Identify:
  - High-risk areas (complex logic, critical flows, security-sensitive code)
  - External integrations and dependencies (APIs, databases, third-party services)
  - Edge cases and failure modes suggested by the code or issue discussion
- Prioritize what needs **deeper** testing vs **sanity/regression** testing.

---

## Test Plan Structure

Your final output should be a structured test plan with the following sections.

### 1. Overview

- **Feature / Change Name**
- **GitHub Issue Link**: ${input:issue}
- **Feature Branch**: ${input:feature_branch}
- **Related Code Areas**
  - List relevant files, modules, endpoints, and components (with paths)
- **Summary of Changes**
  - Short description of how the behavior differs from `main`

### 2. Test Objectives & Strategy

- Explicitly map **acceptance criteria** to:
  - Test types (unit, integration, E2E, manual, exploratory, etc.)
  - Planned test coverage
- Describe the **overall testing strategy**, including:
  - What will be tested automatically
  - What should be tested manually
  - What will be covered by regression tests

### 3. Test Scope

- **In-Scope**
  - Functional areas and scenarios that **must** be tested
- **Out-of-Scope**
  - Scenarios explicitly not covered in this change (with rationale)

### 4. Test Types & Coverage

Break down tests by type. For each, list test areas and intent, not only examples.

#### 4.1 Unit Tests

For each changed/new function, method, or class:

- Identify:
  - The file and symbol name (e.g. `src/.../service.ts:MyService.doSomething`)
  - Its responsibility and inputs/outputs
- Define unit test categories:
  - **Happy paths**
  - **Boundary conditions**
  - **Error handling & exceptions**
  - **Invalid input / malformed data**
- Propose **concrete unit test cases**:
  - Given/When/Then or Arrange/Act/Assert style
  - Include relevant input examples and expected outcomes

#### 4.2 Integration Tests

- Identify integration points:
  - Database queries and transactions
  - External APIs / services
  - Message queues, caches, etc.
- Define test cases that:
  - Validate end-to-end behavior of changed flows
  - Confirm data persistence and retrieval
  - Verify correct interaction with external systems
- Include:
  - Setup/teardown requirements (e.g. seed data, test doubles)
  - Specific assertions on side effects

#### 4.3 End-to-End / UI / API Tests (if applicable)

- For UI:
  - User journeys impacted by the change
  - Main flows and critical alternative flows
  - Error states, validation messages, and accessibility considerations
- For API:
  - Request/response examples (status codes, body, headers)
  - Authentication/authorization behaviors
  - Idempotency and concurrency scenarios (where relevant)

---

### 5. Detailed Test Cases

Provide a **table or structured list** of concrete test cases. For each test case include:

- **ID**: `TC-###`
- **Title**
- **Related Acceptance Criteria**
- **Type**: Unit / Integration / E2E / Regression / Manual / etc.
- **Preconditions / Setup**
- **Steps**
- **Input Data / Payload**
- **Expected Result**
- **Notes** (edge cases, special environment requirements, etc.)

Make sure all acceptance criteria are covered by at least one test case and ideally multiple tests (unit + higher-level).

---

### 6. Test Data Strategy

- Describe what test data is needed:
  - Example users, roles, permissions
  - Domain objects (e.g., courses, sessions, messages, etc. for this repo)
- Clarify:
  - Can existing seed data be reused?
  - Do new fixtures or factories need to be created?
- Mention:
  - How to reset data between tests
  - Any anonymization / privacy considerations

---

### 7. Execution Instructions

Provide concrete commands and instructions for running tests locally and in CI.

- **Unit Tests**
  - e.g. `npm test`, `dotnet test`, or repo-specific commands
- **Integration / E2E Tests**
  - Commands and required services to be running (DB, localstack, etc.)
- **Linting & Static Analysis**
  - e.g. `npm run lint`, `dotnet format`, etc.

For each command, specify:

- When to use it (what it validates)
- Expected outcome if all tests pass

---

### 8. Entry & Exit Criteria

Define clear criteria for:

- **Test Entry**
  - Required setup (branch checked out, environment ready, migrations applied)
  - Minimal level of code completeness
- **Test Exit**
  - All planned tests executed
  - All acceptance criteria met
  - No unresolved high-severity defects
  - Regression suite passing

---

## Output Requirements

- Produce the test plan as a **clear, structured markdown document**.
- Ensure:
  - Every acceptance criterion from is covered.
  - Differences between `main` and ${input:feature_branch} are reflected in the test scope and test cases.
  - The plan is detailed enough for another AI agent or a human tester to execute without needing additional context.

---

## Quality Checklist

Before finishing, verify that the test plan includes:

- [ ] Clear mapping from GitHub issue and acceptance criteria to test coverage
- [ ] Explicit analysis of changes between `main` and feature branch ${input:feature_branch}
- [ ] Coverage of:
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E / UI / API tests (if applicable)
  - [ ] Regression tests for unaffected behavior
- [ ] Detailed, executable test cases with steps and expected results
- [ ] Test data requirements and strategy
- [ ] Concrete commands to run tests and quality checks
- [ ] Clear entry/exit criteria and traceability matrix
