# Test Agent Workflow

```mermaid
flowchart LR
    Input1([Implementation Plan]) --> Step1
    Input2([Code Changes]) --> Step1

    Step1[1. Understand<br/>Testing requirements] --> Step2[2. Analyze Code<br/>Identify testable units]

    Step2 --> Step3[3. Study Patterns<br/>Mirror existing tests]

    Step3 --> Step4[4. Check Coverage<br/>Run existing tests]

    Step4 --> Step5[5. Write Tests<br/>Unit & integration]

    Step5 --> Validate{Coverage<br/>≥80%?}

    Validate -->|No| Step5
    Validate -->|Yes| Step6[6. Final Validation<br/>All tests pass]

    Step6 --> End([Tests Complete<br/>for Review Agent])

    style Input1 fill:#90EE90
    style Input2 fill:#90EE90

1. **Understand** - Read implementation plan for test scenarios and requirements
2. **Analyze Code** - Identify functions, branches, and error paths to test
3. **Study Patterns** - Find existing tests and mirror their conventions
4. **Check Coverage** - Run tests, generate coverage report, find gaps
5. **Write Tests** - Create unit tests (happy path, edge cases, errors) and integration tests
6. **Final Validation** - Verify all tests pass and coverage meets 80% target

## Key Loop

If coverage is below 80%, the agent loops back to write additional tests targeting uncovered code paths.

## Handoff

Outputs tested code ready for the Review Agent to validate quality and requirements.
