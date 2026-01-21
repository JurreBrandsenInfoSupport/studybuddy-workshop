# Implementation Agent Workflow

```mermaid
flowchart LR
    Start([IMPLEMENTATION_PLAN.md]) --> Step1[1. Load & Understand<br/>Read plan & references]

    Step1 --> Step2[2. Setup<br/>Create files & dependencies]

    Step2 --> Step3[3. Core Implementation<br/>Follow plan step-by-step]

    Step3 --> Step4[4. Integration<br/>Connect & error handling]

    Step4 --> Step5[5. Code Quality<br/>Linting & validation]

    Step5 --> Validate{Quality<br/>Checks Pass?}

    Validate -->|Issues Found| Step3
    Validate -->|All Pass| Step6[6. Final Review<br/>Verify completeness]

    Step6 --> End([Code Ready<br/>for Testing Agent])

    style Start fill:#90EE90
    style End fill:#90EE90
    style Validate fill:#87CEEB
    style Step6 fill:#FFD700
```

## Workflow Steps

1. **Load & Understand** - Read implementation plan, study code examples and referenced files
2. **Setup** - Create new files, install dependencies, configure imports
3. **Core Implementation** - Execute plan steps systematically, mirror code patterns
4. **Integration** - Connect with existing code, implement error handling
5. **Code Quality** - Run linters, formatters, and project-specific checks
6. **Final Review** - Verify completeness, mark TODOs complete, prepare for testing

## Key Loop

If code quality checks fail, the agent loops back to core implementation to fix issues before proceeding to final review.

## Handoff

The agent outputs implemented code ready for the Testing Agent to validate with comprehensive test suites.
