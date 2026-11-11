# voyage-tasks

## Getting started

This project uses **[pnpm](https://pnpm.io)** as its only package manager. `npm install` and `yarn install` are blocked and will fail with a "Use pnpm" message.

### Prerequisites

- [Node.js](https://nodejs.org) 22 or newer
- pnpm 10.24.x (the exact version is pinned in `package.json` under `packageManager`)

### Install pnpm

The easiest way is [Corepack](https://nodejs.org/api/corepack.html), which ships with Node and automatically uses the pinned pnpm version:

```bash
corepack enable
```

Alternatively, install pnpm globally: `npm install -g pnpm@10.24.0`

Check it worked with `pnpm -v`.

### Install dependencies

```bash
pnpm install
```

### Common commands

| Task | npm equivalent | pnpm command |
| --- | --- | --- |
| Install all dependencies | `npm install` | `pnpm install` |
| Add a dependency | `npm install <pkg>` | `pnpm add <pkg>` |
| Add a dev dependency | `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| Remove a dependency | `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| Update dependencies | `npm update` | `pnpm update` |
| Run a script | `npm run <script>` | `pnpm run <script>` (or `pnpm <script>`) |
| Run a one-off package | `npx <pkg>` | `pnpm dlx <pkg>` |

### Good to know

- Commit `pnpm-lock.yaml`. It keeps everyone on identical dependency versions.
- Never commit `node_modules/`, `package-lock.json` or `yarn.lock`.
- pnpm keeps one shared copy of each package on disk and links it into `node_modules`, so installs are fast and use less space. It is also strict: you can only import packages you declared in `package.json`.

### Troubleshooting

- **"Use "pnpm install" for installation in this project"**: you ran `npm` or `yarn`. Delete any `package-lock.json`/`yarn.lock` and `node_modules`, then run `pnpm install`.
- **`pnpm: command not found`**: run `corepack enable`, or install pnpm globally (see above).
- **Version or engine mismatch errors**: update Node to 22+ and make sure `pnpm -v` matches the version in `package.json`.
- **Odd install problems**: remove `node_modules` and run `pnpm install` again; `pnpm store prune` clears unused packages from the shared store.

## Team Documents

You may find these helpful as you work together to organize your project.

- [Team Project Ideas](./docs/team_project_ideas.md)
- [Team Decision Log](./docs/team_decision_log.md)

Meeting Agenda templates (located in the `/docs` directory in this repo):

- Meeting - Voyage Kickoff --> ./docs/meeting-voyage_kickoff.docx
- Meeting - App Vision & Feature Planning --> ./docs/meeting-vision_and_feature_planning.docx
- Meeting - Sprint Retrospective, Review, and Planning --> ./docs/meeting-sprint_retrospective_review_and_planning.docx
- Meeting - Sprint Open Topic Session --> ./docs/meeting-sprint_open_topic_session.docx

## Our Team

Everyone on your team should add their name along with a link to their GitHub
& optionally their LinkedIn profiles below. Do this in Sprint #1 to validate
your repo access and to practice PR'ing with your team *before* you start
coding!

- Fouad: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
- Teammate name #2: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)

   ...
- Teammate name #n: [GitHub](https://github.com/ghaccountname) / [LinkedIn](https://linkedin.com/in/liaccountname)
