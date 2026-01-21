# Review Agent Workflow

```mermaid
flowchart LR
    Input1([GitHub Issue]) --> Step1
    Input2([Code Changes]) --> Step1
    Input3([Tests]) --> Step1

    Step1[1. Requirements<br/>Extract acceptance criteria] --> Step2[2. Verify ACs<br/>Map code to criteria]

    Step2 --> Step3[3. Scope Check<br/>Validate relevance]

    Step3 --> Step4[4. Code Quality<br/>Patterns & best practices]

    Step4 --> Step5[5. Test Review<br/>Coverage & quality]

    Step5 --> Verdict{Issues<br/>Found?}

    Verdict -->|Critical| Reject[❌ Changes Requested]
    Verdict -->|Minor| Approve[⚠️ Approved with Comments]
    Verdict -->|None| Pass[✅ Approved]

    Reject --> End([Review Complete])
    Approve --> End
    Pass --> End

    style Input1 fill:#90EE90
    style Input2 fill:#90EE90
    style Input3 fill:#90EE90
    style End fill:#90EE90
    style Verdict fill:#87CEEB
    style Pass fill:#32CD32
    style Approve fill:#FFD700
    style Reject fill:#FF6347
```

## Workflow Steps

1. **Requirements** - Fetch GitHub issue, extract acceptance criteria and scope
2. **Verify ACs** - Map each acceptance criterion to implementation code
3. **Scope Check** - Ensure all changes are relevant, no scope creep
4. **Code Quality** - Review patterns, best practices, security, performance
5. **Test Review** - Verify coverage ≥80%, test quality, AC coverage

## Verdict Outcomes

- **✅ Approved** - Ready to merge, all criteria met
- **⚠️ Approved with Comments** - Can merge after addressing minor issues
- **❌ Changes Requested** - Must fix critical issues before merge

## Output

Structured review report with AC verification, code quality score, and prioritized issues.
