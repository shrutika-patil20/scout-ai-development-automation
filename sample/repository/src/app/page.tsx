"use client";

import { FormEvent, useState } from "react";
import ReportHistory from "./report-history";
import { createEmployee, getProgress, getVisibleTasks, initialEmployees, toggleEmployeeTask, type Employee, type TaskFilter } from "./onboarding";

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<TaskFilter>("All tasks");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [newHire, setNewHire] = useState({ name: "", role: "", department: "", start: "" });

  const employee = employees.find((person) => person.id === selectedId) ?? employees[0];
  const doneCount = employee.tasks.filter((task) => task.done).length;
  const progress = getProgress(employee.tasks);
  const visibleTasks = getVisibleTasks(employee.tasks, filter, search);

  function toggleTask(taskId: number) {
    setEmployees((current) => toggleEmployeeTask(current, selectedId, taskId));
  }

  function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newHire.name.trim();
    if (!name) return;
    const person = createEmployee(newHire);
    setEmployees((current) => [...current, person]);
    setSelectedId(person.id);
    setShowForm(false);
    setNewHire({ name: "", role: "", department: "", start: "" });
    setNotice(`${name} was added to onboarding.`);
    window.setTimeout(() => setNotice(""), 3200);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="PeoplePath home"><span className="brand-mark">p</span><span>peoplepath</span></a>
        <div className="workspace-switch"><span className="workspace-icon">N</span><span><strong>Northstar Studio</strong><small>People workspace</small></span><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <a className="nav-item" href="#overview"><Icon name="home"/>Overview</a>
          <a className="nav-item active" href="#onboarding"><Icon name="users"/>Onboarding<span className="nav-count">{employees.length}</span></a>
          <a className="nav-item" href="#upcoming"><Icon name="calendar"/>My schedule</a>
          <a className="nav-item" href="#insights"><Icon name="chart"/>People insights</a>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-spark">✳</div><strong>Here for your people.</strong><p>Make every first day feel like the start of something good.</p><a href="#welcome">Explore the welcome guide <Icon name="arrow" size={14}/></a></div><div className="profile"><div className="avatar avatar-navy">JM</div><span><strong>Jamie Morgan</strong><small>People team</small></span><button className="icon-button" aria-label="Profile options"><Icon name="more"/></button></div></div>
      </aside>

      <section className="main-area" id="overview">
        <header className="topbar"><div className="breadcrumbs">People <span>/</span> <strong>Onboarding</strong></div><div className="top-actions"><label className="global-search"><Icon name="search"/><input aria-label="Search workspace" placeholder="Search anything"/></label><button className="icon-button notification" aria-label="Notifications"><Icon name="bell"/><i/></button><div className="avatar avatar-navy top-avatar">JM</div></div></header>
        <div className="page-content" id="onboarding">
          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> PEOPLE OPERATIONS</div><h1>Good morning, Jamie <span className="wave">✳</span></h1><p>Make every new beginning a little more thoughtful.</p></div><button className="button button-primary" onClick={() => setShowForm(true)}><Icon name="plus" size={17}/> Add a new hire</button></div>

          <section className="welcome-banner" id="welcome"><div className="banner-copy"><div className="banner-kicker"><span/> YOUR TEAM IS GROWING</div><h2>Great onboarding starts<br/>with a warm welcome.</h2><p>A few thoughtful steps can turn a first day into a belonging.</p><a href="#onboarding-list">Explore onboarding <Icon name="arrow" size={15}/></a></div><div className="banner-art" aria-hidden="true"><div className="sun-orb"/><div className="plant plant-left"><i/><i/><i/><b/></div><div className="plant plant-right"><i/><i/><i/><b/></div><div className="art-window"><div className="window-sun"/><div className="window-hill hill-one"/><div className="window-hill hill-two"/></div><div className="welcome-note"><span>✳</span><b>you belong here</b><small>let's make it official</small></div><div className="art-table"/></div></section>

          <section className="stats-grid" aria-label="Onboarding summary"><article className="stat-card"><div className="stat-icon stat-purple"><Icon name="users"/></div><div className="stat-label">New team members</div><div className="stat-value">{employees.length}<span className="stat-change">+2 this month</span></div><div className="stat-foot">Across {new Set(employees.map((person) => person.department)).size} departments</div></article><article className="stat-card"><div className="stat-icon stat-yellow"><Icon name="clock"/></div><div className="stat-label">Starting this week</div><div className="stat-value">2<span className="stat-muted"> people</span></div><div className="stat-foot">Your next welcome is Monday</div></article><article className="stat-card"><div className="stat-icon stat-green"><Icon name="check"/></div><div className="stat-label">Onboarding completion</div><div className="stat-value">86<span className="stat-percent">%</span><span className="stat-change">↑ 8%</span></div><div className="stat-foot">Team average this quarter</div></article></section>

          <div className="content-grid">
            <section className="panel onboarding-panel" id="onboarding-list"><div className="panel-heading"><div><div className="section-kicker">THE FIRST FEW WEEKS</div><h2>Onboarding journey</h2><p>Small steps, big first impressions.</p></div><button className="text-button" onClick={() => setNotice("Showing all active onboarding journeys.")}>View all <Icon name="arrow" size={15}/></button></div>
              <div className="employee-tabs">{employees.map((person) => <button key={person.id} className={`employee-tab ${person.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(person.id)}><span className={`avatar avatar-${person.color}`}>{person.initials}</span><span><strong>{person.name.split(" ")[0]}</strong><small>{person.start.startsWith("Today") ? "Starting today" : person.start}</small></span></button>)}</div>
              <div className="journey-card"><div className="journey-person"><div className={`avatar avatar-large avatar-${employee.color}`}>{employee.initials}</div><div className="person-copy"><h3>{employee.name}</h3><p>{employee.role} <span>·</span> {employee.department}</p><div className="person-meta"><span><Icon name="calendar" size={14}/>{employee.start}</span><span><span className="location-dot"/>{employee.location}</span></div></div><button className="icon-button more-button" aria-label={`More options for ${employee.name}`}><Icon name="more"/></button></div>
                <div className="progress-row"><div><strong>Onboarding progress</strong><span>{doneCount} of {employee.tasks.length} steps complete</span></div><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }}/></div>
                <div className="task-toolbar"><div className="task-tabs">{(["All tasks", "To do", "Completed"] as TaskFilter[]).map((item) => <button key={item} className={filter === item ? "chosen" : ""} onClick={() => setFilter(item)}>{item}{item === "To do" && <span>{employee.tasks.length - doneCount}</span>}</button>)}</div><label className="task-search"><Icon name="search" size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a task" aria-label="Find a task"/></label></div>
                <div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.done ? "task-done" : ""}`} key={task.id}><button className={`task-check ${task.done ? "checked" : ""}`} onClick={() => toggleTask(task.id)} aria-label={`${task.done ? "Mark incomplete" : "Mark complete"}: ${task.title}`}>{task.done && <Icon name="check" size={14}/>}</button><div className="task-copy"><div className="task-title-line"><h4>{task.title}</h4><span className={`task-category category-${task.category.toLowerCase().replaceAll(" ", "-")}`}>{task.category}</span></div><p>{task.detail}</p></div><span className={`task-due ${task.due === "Due today" && !task.done ? "due-today" : ""}`}><Icon name="clock" size={14}/>{task.done ? "Complete" : task.due}</span><button className="icon-button task-more" aria-label={`More options for ${task.title}`}><Icon name="more" size={17}/></button></article>)}{visibleTasks.length === 0 && <div className="empty-state">No tasks match this view.</div>}</div>
                <button className="add-task" onClick={() => setNotice("Task templates are ready to customize for your team.")}><Icon name="plus" size={16}/> Add a task</button>
              </div>
            </section>

            <aside className="right-column"><section className="panel people-panel"><div className="side-panel-heading"><div><div className="section-kicker">THE PEOPLE BEHIND THE WELCOME</div><h2>Your onboarding crew</h2></div><button className="icon-button" aria-label="More crew options"><Icon name="more"/></button></div><div className="crew-list"><div className="crew-person"><div className="avatar avatar-navy">JM</div><div><strong>Jamie Morgan</strong><small>People lead · You</small></div><span className="online-dot"/></div><div className="crew-person"><div className="avatar avatar-gold">JL</div><div><strong>Jordan Lee</strong><small>Design buddy</small></div><span className="online-dot"/></div><div className="crew-person"><div className="avatar avatar-sky">AK</div><div><strong>Alex Kim</strong><small>IT support</small></div><span className="online-dot"/></div></div><button className="invite-link" onClick={() => setNotice("Invite link copied to clipboard.")}>+ Invite a teammate</button></section>
              <section className="next-up-card" id="upcoming"><div className="next-up-top"><span className="next-icon"><Icon name="calendar" size={18}/></span><span>COMING UP</span><button className="icon-button" aria-label="More schedule options"><Icon name="more" size={18}/></button></div><div className="next-date"><div className="date-block"><span>NOV</span><strong>24</strong></div><div><h3>Phoenix's first day</h3><p>Monday · 9:30 AM</p></div></div><div className="next-divider"/><div className="next-footer"><span><span className="mini-avatar mini-one">PB</span><span className="mini-avatar mini-two">JM</span></span><small>3 people involved</small><button className="arrow-circle" aria-label="View upcoming event"><Icon name="arrow" size={15}/></button></div></section>
              <div className="quote-card"><span className="quote-mark">“</span><p>People may forget what you said, but they'll never forget how you made them feel.</p><div><span className="quote-line"/> Maya Angelou</div></div>
            </aside>
          </div>
          <ReportHistory />
          <footer className="page-footer"><span>Made for the moments that matter <span>✳</span></span><a id="insights" href="#overview">PeoplePath <span>·</span> 2026</a></footer>
        </div>
      </section>

      {notice && <div className="toast" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><Icon name="close" size={15}/></button></div>}
      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="section-kicker">GROWING TOGETHER</div><h2 id="modal-title">Welcome someone new</h2><p>Start a thoughtful onboarding journey.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close dialog"><Icon name="close"/></button></div><form onSubmit={addEmployee}><label>Full name<input required autoFocus value={newHire.name} onChange={(event) => setNewHire({ ...newHire, name: event.target.value })} placeholder="e.g. Taylor Reed"/></label><label>Role<input value={newHire.role} onChange={(event) => setNewHire({ ...newHire, role: event.target.value })} placeholder="e.g. Product Manager"/></label><div className="form-row"><label>Department<input value={newHire.department} onChange={(event) => setNewHire({ ...newHire, department: event.target.value })} placeholder="e.g. Product"/></label><label>Start date<input type="date" value={newHire.start} onChange={(event) => setNewHire({ ...newHire, start: event.target.value })}/></label></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button button-primary"><Icon name="plus" size={16}/> Add to onboarding</button></div></form></section></div>}
    </main>
  );
}
