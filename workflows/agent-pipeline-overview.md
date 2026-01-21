# Agent Pipeline Overview

```mermaid
flowchart LR
    subgraph Input
        User([👤 User])
    end

    subgraph Planning ["🎯 Planning Phase"]
        Issue[🎫 Issue Creator]
        Plan[📋 Plan Agent]
    end

    subgraph Development ["⚙️ Development Phase"]
        Implement[🔧 Implementation Agent]
        Test[🧪 Test Agent]
    end

    subgraph Quality ["✅ Quality Phase"]
        Review[🔍 Review Agent]
    end

    subgraph Output
        Done([🚀 Ready to Merge])
    end

    %% Main Flow
    User -->|Request| Issue
    Issue -->|GitHub Issue| Plan
    Plan -->|Implementation Plan| Implement
    Implement -->|Code Changes| Test
    Test -->|Code + Tests| Review
    Review -->|✅ Approved| Done

    %% Human-in-the-Loop Checkpoints
    User -.->|✋ Validate Issue| Issue
    User -.->|✋ Approve Plan| Plan
    User -.->|✋ Review Code| Implement
    User -.->|✋ Verify Tests| Test
    User -.->|✋ Final Approval| Review

    %% Self-iteration loops
    Issue -->|🔄 Refine| Issue
    Plan -->|🔄 Research More| Plan
    Implement -->|🔄 Fix Issues| Implement
    Test -->|🔄 Add Tests| Test
    Review -->|🔄 Re-review| Review

    %% Feedback loops from Review
    Review -->|❌ Code Issues| Implement
    Review -->|❌ Test Gaps| Test

    style User fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
    style Issue fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style Plan fill:#E3F2FD,stroke:#2196F3,stroke-width:2px
    style Implement fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    style Test fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    style Review fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    style Done fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
```

## Pipeline Overview

This diagram shows **AI-Human collaboration** where agents assist but humans remain in control.

### Three Types of Flows

| Flow Type | Line Style | Description |
|-----------|------------|-------------|
| **Main Pipeline** | Solid arrows | Primary data flow between agents |
| **Human Checkpoints** | Dashed arrows (✋) | Human validates/approves at each step |
| **Iteration Loops** | Self-arrows (🔄) | Agent can refine its own output |

## Human-in-the-Loop Checkpoints

**Every step has human oversight:**

| Checkpoint | Human Action |
|------------|--------------|
| Issue Creator | Validate issue description, acceptance criteria |
| Plan Agent | Approve implementation approach before coding |
| Implementation Agent | Review code changes, request modifications |
| Test Agent | Verify test coverage and quality |
| Review Agent | Final approval before merge |

## Self-Iteration Loops

**Each agent can iterate on its own work:**

- **Issue Creator** 🔄 Refine issue based on feedback
- **Plan Agent** 🔄 Research more, gather additional context
- **Implementation Agent** 🔄 Fix linting issues, improve code
- **Test Agent** 🔄 Add more tests to reach coverage target
- **Review Agent** 🔄 Re-review after changes

## Feedback Loops

**Review Agent can request changes:**

- **❌ Code Issues** → Back to Implementation Agent
- **❌ Test Gaps** → Back to Test Agent

## Key Principles

### 1. AI Assists, Human Decides
Agents do the heavy lifting, but humans make final decisions at each checkpoint.

### 2. Not Everything Requires AI
- Simple issues? Human can write them directly
- Small changes? Skip the plan, implement directly
- Quick fix? Human can code without agents

### 3. Iterative Refinement
Each agent can refine its work multiple times before human approval.

### 4. Transparent Progress
Humans can observe and intervene at any point in the pipeline.

## When to Use Agents vs. Human Work

| Scenario | Recommended Approach |
|----------|---------------------|
| Complex feature with many files | Full agent pipeline |
| Simple bug fix | Human implements directly |
| Well-defined task | Plan + Implement agents |
| Exploratory work | Human + AI pair programming |
| Large refactoring | Agent for plan, human reviews carefully |

## Agent Pipeline Flow

| Stage | Agent | Input | Output | Human Checkpoint |
|-------|-------|-------|--------|------------------|
| 1 | **Issue Creator** | User request | GitHub Issue | ✋ Validate acceptance criteria |
| 2 | **Plan Agent** | GitHub Issue | Implementation Plan | ✋ Approve approach |
| 3 | **Implementation Agent** | Implementation Plan | Code changes | ✋ Review code |
| 4 | **Test Agent** | Plan + Code | Tests (≥80% coverage) | ✋ Verify coverage |
| 5 | **Review Agent** | Issue + Code + Tests | Approval/Feedback | ✋ Final sign-off |

