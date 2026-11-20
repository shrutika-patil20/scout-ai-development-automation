# PeoplePath employee onboarding demo

PeoplePath is a simple single-page employee onboarding app built with Next.js. It gives a small People team a visual place to track new hires, see onboarding progress, and make the first few weeks feel organized and welcoming.

## Run locally

### Requirements

- Node.js 20.9 or later
- npm

From the repository root, install dependencies once:

```bash
npm --prefix sample/repository install
```

Then start the app with **Run Employee Onboarding (Next.js)** in VS Code's Run and Debug panel, or run it from the repository root:

```bash
npm --prefix sample/repository run dev
```

Open http://localhost:43187.

## What the demo includes

- A responsive People Operations dashboard with onboarding summary cards.
- Three example employees, selectable from the onboarding journey tabs.
- Per-employee onboarding tasks, filters, task search, progress, and task completion toggles.
- An **Add a new hire** form that adds an employee and starter checklist to the current in-memory session.
- A **Run history** section that reads dated Scout automation reports from local JSON files through a read-only API.
- A crew panel and upcoming start-date card to show related onboarding context.

Employee and task data use local in-memory state. There is no authentication, database, HR integration, or persistence for those changes; refreshing the page restores the example data. The report API only reads JSON files from `reports/` and does not start or communicate with Scout.

## Design guide

See [`docs/design/design-principles.html`](docs/design/design-principles.html) for the app's design principles, visual tokens, and interactive examples of common controls. See [`docs/design/coding-principles.md`](docs/design/coding-principles.md) for implementation guidelines and a code review checklist.

See [`docs/Requirement.md`](docs/Requirement.md) for the requirements and acceptance criteria implemented by the sample app.

## Project structure

```text
sample/repository/
├── docs/
│   ├── design/
│   │   ├── coding-principles.md
│   │   └── design-principles.html
│   ├── Requirement.md
│   ├── emails/ and meetings/ # Content templates
├── src/
│   └── app/
│       ├── layout.tsx       # Page metadata and root document
│       ├── page.tsx         # Single-page dashboard and interactions
│       ├── report-history.tsx # Dated Scout run history UI
│       ├── reports.ts       # Report validation and shared types
│       ├── api/reports/     # Read-only API for report dates and details
│       ├── onboarding.ts    # Onboarding data and pure workflow helpers
│       └── styles.css       # Responsive app styling
├── tests/
│   └── onboarding.test.ts   # Node test-runner unit tests
├── app.py                  # Existing backend patch-workflow example
├── package.json
├── package-lock.json
└── tsconfig.json
```

`app.py` remains in place because the repository's separate approval workflow uses it for its sample patch proposal.

## Main interaction flow

1. Select a new hire in the onboarding journey.
2. Review progress and filter the checklist by all, to-do, or completed tasks.
3. Search task titles, categories, and descriptions.
4. Mark tasks complete or incomplete; progress updates immediately.
5. Add a new hire to see a fresh starter checklist. This data is temporary and held in the browser session.

## Sample test cases

Run the unit tests from the repository root:

```bash
npm --prefix sample/repository test
```

The tests cover task filters and search, progress calculation, immutable task updates, new hire defaults, and blank-name validation.

## Dependencies

The app uses Next.js and React with TypeScript. It has no component library, icon package, or database dependency. See `package.json` for versions and scripts.
