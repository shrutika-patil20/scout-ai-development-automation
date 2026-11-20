import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmployee,
  getProgress,
  getVisibleTasks,
  initialEmployees,
  toggleEmployeeTask,
} from "../src/app/onboarding";

test("task filters return all, incomplete, or completed tasks", () => {
  const tasks = initialEmployees[0].tasks;

  assert.equal(getVisibleTasks(tasks, "All tasks", "").length, 5);
  assert.equal(getVisibleTasks(tasks, "To do", "").length, 3);
  assert.equal(getVisibleTasks(tasks, "Completed", "").length, 2);
});

test("task search is case-insensitive and includes task details and categories", () => {
  const tasks = initialEmployees[0].tasks;

  assert.deepEqual(getVisibleTasks(tasks, "All tasks", "PAPERWORK").map((task) => task.title), [
    "Complete new hire paperwork",
  ]);
  assert.deepEqual(getVisibleTasks(tasks, "All tasks", "jordan lee").map((task) => task.title), [
    "Meet your onboarding buddy",
  ]);
});

test("progress reflects completed tasks and handles an empty checklist", () => {
  const tasks = initialEmployees[0].tasks;

  assert.equal(getProgress(tasks), 40);
  assert.equal(getProgress(tasks.map((task) => ({ ...task, done: true }))), 100);
  assert.equal(getProgress([]), 0);
});

test("toggling a task updates only the selected employee without mutating input", () => {
  const original = initialEmployees;
  const updated = toggleEmployeeTask(original, 1, 3);

  assert.notEqual(updated, original);
  assert.equal(updated[0].tasks.find((task) => task.id === 3)?.done, true);
  assert.equal(original[0].tasks.find((task) => task.id === 3)?.done, false);
  assert.equal(updated[1], original[1]);
});

test("new employee details are trimmed and get a fresh incomplete checklist", () => {
  const employee = createEmployee({ name: "  Taylor Reed ", role: "  Designer  ", department: "  Product  " }, 1000);

  assert.equal(employee.id, 1000);
  assert.equal(employee.name, "Taylor Reed");
  assert.equal(employee.initials, "TR");
  assert.equal(employee.role, "Designer");
  assert.equal(employee.department, "Product");
  assert.equal(employee.start, "Date to be confirmed");
  assert.equal(employee.tasks.length, 5);
  assert.ok(employee.tasks.every((task) => !task.done));
  assert.notEqual(employee.tasks[0], initialEmployees[0].tasks[0]);
});

test("new employee creation rejects a blank name", () => {
  assert.throws(() => createEmployee({ name: "  " }, 1001), /Employee name is required/);
});
