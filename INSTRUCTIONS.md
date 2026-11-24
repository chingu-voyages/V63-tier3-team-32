# Team Instructions

How we work on this repo. Based on the decisions in the
[Team Decision Log](./docs/team_decision_log.md).

## Workflow

1. **Every task starts as an issue** on the project board.
2. **Assign yourself** before starting, and move the card to _In Progress_.
   Keep at most **2 issues in progress** at a time.
3. **One issue = one branch = one PR.**
4. Open a PR into `main` with `Closes #<issue-number>` in the description, and
   move the card to _In Review_.
5. The PR needs **1 approval** and **green checks** (lint, typecheck, test,
   secrets).
6. The **author squash-merges** the PR.

### Branch names

`<your-name>/issue-<number>/<short-description>`

Example: `fouad/issue-30/scaffold-codebase`

### PR titles

Use a conventional-commit prefix: `feat:`, `fix:`, `docs:`, `chore:`,
`test:`, `refactor:`, `ci:`.

Example: `feat: add event creation form`

### Before you push

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Use pnpm only; npm and yarn are blocked.

## Reviewing a PR

- Check that the PR does what the linked issue asks.
- Pull the branch and run it when the change is visible in the app.
- Leave clear comments. Approve when you would be happy to maintain the code.
- AI review is allowed, but it comes after a human review and never replaces it.

## Using AI

| Allowed | Written by hand |
| :------ | :-------------- |
| Boilerplate and project setup | Component behaviour |
| Configuration | API handlers |
| Tests | Figure and metric calculations |
| Documentation | Prompt logic for the AI features |
| Code review (after a human review) | |

- AI can explain code and suggest approaches for the hand-written parts, but
  you write that code yourself.
- You must understand and be able to explain everything you commit.
- **Describe your AI use in the PR**, in the "AI usage" section of the
  template. Example: "AI: scaffolded config and tests; logic written by hand."

## Daily status

Post a short update in the team channel each working day:

- **Done:** what you finished
- **Next:** what you are working on
- **Blockers:** anything stopping you, or "none"
