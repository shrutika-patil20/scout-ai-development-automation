# PeoplePath coding principles

These principles help keep the employee onboarding sample easy to understand, safe to change, and ready to grow beyond its in-memory demo behavior.

## How we write this app

Start with the smallest readable change that supports the onboarding flow.

1. **Keep components focused.** Give each component one clear responsibility. Extract a component when it has independent behavior, repeated markup, or enough complexity to obscure the page flow.
2. **Use explicit types.** Represent employees, tasks, and UI states with TypeScript types. Avoid `any`; narrow data at boundaries instead of hiding uncertainty.
3. **Keep state changes predictable.** Update employee and task state immutably. Keep derived values, such as completion percentage, calculated from the current task list.
4. **Use semantic HTML.** Choose buttons for actions, links for navigation, labels for form fields, and headings in a meaningful order. Add accessible names to icon-only controls.
5. **Keep data boundaries visible.** This demo stores data in browser memory only. If persistence is added, isolate API and storage code from presentation components and document the data lifecycle.
6. **Keep dependencies intentional.** Prefer platform and framework capabilities already available. Add a package only when it solves a clear need; document why the app uses it.

## Recommended project boundaries

As the app grows, keep responsibilities organized along this path:

```text
App route and layout
        ↓
Onboarding UI components
        ↓
Typed employee and task state
        ↓
API and persistence, when added
```

**Current demo boundary:** the sample is intentionally a single-page, in-memory experience. Do not describe its sample records as saved employee data. Introduce a server or database only with an explicit requirement and suitable access controls.

## Example: update a task safely

Use a functional state update so changes are based on the latest state and leave other employees untouched.

```tsx
function toggleTask(employeeId: number, taskId: number) {
  setEmployees((currentEmployees) =>
    currentEmployees.map((employee) => {
      if (employee.id !== employeeId) return employee;

      return {
        ...employee,
        tasks: employee.tasks.map((task) =>
          task.id === taskId
            ? { ...task, done: !task.done }
            : task
        ),
      };
    })
  );
}
```

## Before you finish a change

- **The user flow is clear.** New hires and People team members can understand the next action.
- **Types and states are explicit.** Consider loading, empty, error, and success states when relevant.
- **Keyboard and screen reader use are supported.** Controls have labels, useful names, and visible keyboard focus.
- **The screen works at narrow widths.** Content wraps without hiding controls or creating horizontal overflow.
- **Documentation matches behavior.** Update the sample README when setup, dependencies, or app behavior changes.

Keep code straightforward, accessible, and honest about what the demo does.
