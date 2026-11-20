export type Task = {
  id: number;
  title: string;
  detail: string;
  category: string;
  due: string;
  done: boolean;
};

export type Employee = {
  id: number;
  name: string;
  role: string;
  department: string;
  start: string;
  location: string;
  initials: string;
  color: string;
  tasks: Task[];
};

export type TaskFilter = "All tasks" | "To do" | "Completed";

export type NewEmployeeInput = {
  name: string;
  role?: string;
  department?: string;
  start?: string;
};

export const starterTasks: Task[] = [
  { id: 1, title: "Send welcome email", detail: "Share first-day details and a note from the team.", category: "Before day one", due: "Due today", done: true },
  { id: 2, title: "Prepare laptop and accounts", detail: "Laptop, email, chat, and core tools are ready.", category: "IT setup", due: "Due today", done: true },
  { id: 3, title: "Complete new hire paperwork", detail: "Review and sign the required employment forms.", category: "Paperwork", due: "Due today", done: false },
  { id: 4, title: "Meet your onboarding buddy", detail: "A relaxed introduction with Jordan Lee.", category: "Meet the team", due: "Tomorrow", done: false },
  { id: 5, title: "Review the team handbook", detail: "Get familiar with how the team works together.", category: "Getting started", due: "Friday", done: false },
];

export const initialEmployees: Employee[] = [
  { id: 1, name: "Olivia Rhye", role: "Product Designer", department: "Design", start: "Today, Nov 20", location: "New York, NY", initials: "OR", color: "lilac", tasks: starterTasks },
  { id: 2, name: "Phoenix Baker", role: "Engineering Manager", department: "Engineering", start: "Nov 24, 2026", location: "Austin, TX", initials: "PB", color: "peach", tasks: starterTasks.map((task) => ({ ...task, id: task.id + 10, done: task.id === 1 })) },
  { id: 3, name: "Lana Steiner", role: "People Partner", department: "People", start: "Dec 1, 2026", location: "Remote", initials: "LS", color: "mint", tasks: starterTasks.map((task) => ({ ...task, id: task.id + 20, done: false })) },
];

export function getVisibleTasks(tasks: Task[], filter: TaskFilter, search: string): Task[] {
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesFilter = filter === "All tasks" || (filter === "To do" ? !task.done : task.done);
    const matchesSearch = !query || `${task.title} ${task.detail} ${task.category}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

export function getProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100);
}

export function toggleEmployeeTask(employees: Employee[], employeeId: number, taskId: number): Employee[] {
  return employees.map((employee) => employee.id !== employeeId ? employee : {
    ...employee,
    tasks: employee.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task),
  });
}

export function createEmployee(input: NewEmployeeInput, id = Date.now()): Employee {
  const name = input.name.trim();
  if (!name) throw new Error("Employee name is required.");

  const start = input.start
    ? new Date(`${input.start}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Date to be confirmed";

  return {
    id,
    name,
    role: input.role?.trim() || "New team member",
    department: input.department?.trim() || "Unassigned",
    start,
    location: "Location to be confirmed",
    initials: name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
    color: "blue",
    tasks: starterTasks.map((task) => ({ ...task, id: task.id + id, done: false })),
  };
}
