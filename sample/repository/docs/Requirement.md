# Employee onboarding application requirements

## Purpose

PeoplePath is a single-page demonstration application for a People team to view sample new hires, track onboarding checklist progress, and add a new hire with a starter checklist. This document describes the behavior implemented in the current sample; it is not a specification for a production HR system.

## Users

- **People team member:** reviews onboarding journeys and adds new hires.
- **New hire:** represented by the profile and checklist being tracked. The current application does not provide a new-hire login or self-service view.

## Functional requirements

### REQ-EMP-001 — Show the onboarding overview

The application shall display a People Operations dashboard with onboarding summary cards, a welcome panel, employee onboarding journeys, an onboarding crew panel, and a sample upcoming-start card.

**Acceptance criteria**

- The page shows three sample employees when opened.
- Summary cards show sample counts and onboarding metrics.
- The dashboard includes crew and upcoming-event example content.
- The metrics and crew/event information are static demonstration content; they are not calculated from a live service.

### REQ-EMP-002 — Select an employee

The People team member shall be able to select an employee from the onboarding journey tabs.

**Acceptance criteria**

- Selecting a different employee updates the profile and checklist shown in the journey card.
- Each sample employee has a name, role, department, start date, location, initials, and color styling.

### REQ-EMP-003 — Show a starter checklist

Each sample employee shall have a checklist containing these onboarding tasks: send a welcome email, prepare laptop and accounts, complete new-hire paperwork, meet an onboarding buddy, and review the team handbook.

**Acceptance criteria**

- Each task shows a title, short description, category, and due label.
- The sample employees can have different initial task completion states.
- A task's completion state is shown in its checkbox and task styling.

### REQ-EMP-004 — Filter tasks

The People team member shall be able to view all tasks, incomplete tasks, or completed tasks for the selected employee.

**Acceptance criteria**

- **All tasks** shows every task for the selected employee.
- **To do** shows only incomplete tasks and displays the remaining task count.
- **Completed** shows only completed tasks.
- An empty filter result displays an explanatory empty-state message.

### REQ-EMP-005 — Search tasks

The People team member shall be able to search the selected employee's tasks.

**Acceptance criteria**

- Search matches task titles, descriptions, and categories.
- Matching is case-insensitive and ignores leading and trailing spaces in the query.
- Search works together with the selected task filter.
- No matches displays an explanatory empty-state message.

### REQ-EMP-006 — Update checklist completion and progress

The People team member shall be able to mark an onboarding task complete or incomplete.

**Acceptance criteria**

- Selecting a task checkbox toggles that task's completion state for the selected employee.
- Other employees' task states remain unchanged.
- The completion count and progress percentage update from the selected employee's checklist.
- Progress is zero for an empty checklist and 100 percent when every task is complete.

### REQ-EMP-007 — Add a new hire

The People team member shall be able to add a new hire using the **Add a new hire** form.

**Acceptance criteria**

- The form collects a required full name and optional role, department, and start date.
- A blank or whitespace-only name is rejected.
- The name, role, and department are trimmed before the employee is added.
- If role or department is omitted, the app uses **New team member** or **Unassigned** respectively.
- If the start date is omitted, the app shows **Date to be confirmed**.
- The app derives initials from the first two words of the name and creates five incomplete starter tasks.
- After submission, the new employee appears in the employee tabs and is selected.
- The app shows a success notification and closes the form.

### REQ-EMP-008 — Provide navigation and feedback

The application shall provide dashboard navigation links and feedback for supported actions.

**Acceptance criteria**

- Navigation links move to the corresponding sections on the page.
- The new-hire dialog can be submitted, canceled, or closed using its close button or by clicking its backdrop.
- The app displays a dismissible status notification after supported actions.

### REQ-EMP-009 — View dated Scout automation run reports

The People team member shall be able to review saved Scout workflow runs in a Reports or Run history section of the application.

**Acceptance criteria**

- The application lists report dates available under `repository/reports/YYYY/MM/YYYY-MM-DD.json` and lets the user select a date.
- Selecting a date displays each run in that date's `runs` array, including result, summary, sources and their dates, requirement IDs and statuses, changed files, actual check results, and design and coding review findings.
- The application reads report JSON through a read-only API and never accepts a filesystem path from the browser.
- The API validates the date format and reads only report files contained in `repository/reports/`.
- Loading, no-report, and error states are clear to the user.
- Invalid report data is handled without crashing the application.

## Quality requirements

- The application shall use Next.js App Router, React, and TypeScript.
- The layout shall adapt to desktop, tablet, and narrow mobile screens.
- Interactive controls shall use semantic HTML and provide accessible labels or names where needed.
- Keyboard focus shall remain visible when navigating controls.
- Task updates shall use immutable state updates and keep employee data isolated.
- The UI should follow the colors, typography, controls, and interaction guidance in [`design/design-principles.html`](design/design-principles.html) and [`design/coding-principles.md`](design/coding-principles.md).

## Current implementation boundaries

- Employee and task data are held in client-side memory. Refreshing the page restores the sample data; additions and task changes are not persisted.
- The app has no authentication, user roles, server API, database, or connection to an HR system.
- Scout run history is read from local JSON files through the sample app's read-only report API; the app does not start Scout automations or generate reports itself.
- Sample metric cards, crew members, upcoming events, and some dashboard actions are illustrative and do not represent live functionality.
- The current unit tests cover task filters and search, progress calculation, immutable task updates, employee defaults, and blank-name validation. They do not provide browser-level or end-to-end UI coverage.

## Verification

Run the sample application's tests and type check from the repository root:

```bash
npm --prefix sample/repository test
npm --prefix sample/repository run typecheck
```
