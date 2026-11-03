import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, ListTodo, Plus, Search, Settings, X } from "lucide-react";
import TaskModal from "./components/TaskModal";
import TaskRow from "./components/TaskRow";
import { taskApi, errorMessage } from "./lib/api";
import { startOfWeek, formatRange } from "./lib/dates";
function dateKey(date) { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function buildWeeks(tasks) { const map=new Map(); tasks.forEach(task=>{const start=startOfWeek(task.scheduledAt),key=dateKey(start);if(!map.has(key))map.set(key,{key,start,tasks:[]});map.get(key).tasks.push(task);});const today=startOfWeek(new Date()),key=dateKey(today);if(!map.has(key))map.set(key,{key,start:today,tasks:[]});return [...map.values()].sort((a,b)=>b.start-a.start); }
function StatCard({done,count}) { return <div className={`mini-stat ${done?"mini-stat-done":"mini-stat-open"}`}><div className="mini-stat-icon">{done?<Check size={14}/>:<X size={14}/>}</div><div><div className="mini-stat-label">{done?"Task Complete":"Task Pending"}</div><div className="mini-stat-number">{String(count).padStart(2,"0")} <small>This Week</small></div></div></div>; }
function Onboarding({onStart}) { return <div className="onboarding"><div className="onboard-art"><div className="art-ring"/><div className="art-wave wave-one">⌁⌁⌁</div><div className="art-wave wave-two">⌁⌁⌁</div></div><div className="onboard-copy"><h1>Manage What To Do</h1><p>The best way to manage what you have to do,<br/> don't forget your plans</p><button className="onboard-button" onClick={onStart}>Get Started</button></div></div>; }
export default function App() {
 const [tasks,setTasks]=useState([]),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[selectedDate,setSelectedDate]=useState(new Date()),[expanded,setExpanded]=useState(()=>new Set([dateKey(startOfWeek(new Date()))])),[toast,setToast]=useState(""),[error,setError]=useState(""),[onboard,setOnboard]=useState(()=>!localStorage.getItem("taskflow-onboarded")),[showAll,setShowAll]=useState(false);
 const load=useCallback(async()=>{try{setError("");setTasks(await taskApi.list(search?{search}:{}));}catch(e){setError(errorMessage(e));}finally{setLoading(false);}},[search]);useEffect(()=>{const timer=setTimeout(load,250);return()=>clearTimeout(timer);},[load]);
 const weeks=useMemo(()=>buildWeeks(tasks),[tasks]),currentWeek=weeks.find(w=>w.key===dateKey(startOfWeek(new Date())))||{tasks:[]},weekDone=currentWeek.tasks.filter(t=>t.status==="Completed").length,weekOpen=currentWeek.tasks.length-weekDone,progress=currentWeek.tasks.length?Math.round(weekDone/currentWeek.tasks.length*100):0,dayTasks=tasks.filter(t=>dateKey(t.scheduledAt)===dateKey(selectedDate)).sort((a,b)=>new Date(a.scheduledAt)-new Date(b.scheduledAt));
 const notify=message=>{setToast(message);setTimeout(()=>setToast(""),2600);};const matchesCurrentSearch = task => {
  const term = search.trim().toLowerCase();
  return !term || task.title?.toLowerCase().includes(term) || task.description?.toLowerCase().includes(term);
 };
 const upsertTask = task => setTasks(previous => {
  const withoutOld = previous.filter(item => item._id !== task._id);
  const next = matchesCurrentSearch(task) ? [...withoutOld, task] : withoutOld;
  return next.sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
 });
 const saveTask=async data=>{setSaving(true);try{
  const saved = editing ? await taskApi.update(editing._id,data) : await taskApi.create(data);
  upsertTask(saved);
  notify(editing?"Task updated":"Task created");
 }catch(e){throw new Error(errorMessage(e));}finally{setSaving(false);}};
 const toggleTask=async task=>{try{
  const updated = await taskApi.update(task._id,{status:task.status==="Completed"?"In Progress":"Completed"});
  upsertTask(updated);
 }catch(e){notify(errorMessage(e));}};
 const deleteTask=async task=>{if(!window.confirm(`Delete "${task.title}"? This cannot be undone.`))return;try{
  await taskApi.remove(task._id);
  setTasks(previous=>previous.filter(item=>item._id!==task._id));
  notify("Task deleted");
 }catch(e){notify(errorMessage(e));}};
 const openCreate=()=>{setEditing(null);setModal(true);},openEdit=task=>{setEditing(task);setModal(true);},toggleWeek=key=>setExpanded(prev=>{const next=new Set(prev);next.has(key)?next.delete(key):next.add(key);return next;});
 const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-d.getDay()+i);return d;});
 if(onboard)return <Onboarding onStart={()=>{localStorage.setItem("taskflow-onboarded","1");setOnboard(false);}}/>;
 return <div className="app-bg"><main className="mobile-app"><header className="app-header"><button className="header-icon" aria-label="Settings"><Settings size={19}/></button><div className="header-actions"><button className="header-icon" aria-label="Search" onClick={()=>{setShowAll(true);setTimeout(()=>document.getElementById("task-search")?.focus(),0);}}><Search size={20}/></button><button className="header-icon" aria-label="Notifications"><Bell size={19}/></button></div></header>
 {showAll?<section className="all-tasks-screen"><div className="screen-title-row"><button className="back-button" onClick={()=>setShowAll(false)}><ChevronLeft size={21}/></button><h1>All Tasks</h1></div><div className="search-wrap figma-search"><Search size={16}/><input id="task-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for a task"/><Search size={16}/></div><div className="all-task-list">{loading?<p className="muted center">Loading tasks…</p>:tasks.length?tasks.map(task=><TaskRow key={task._id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask}/>):<p className="muted center">No tasks found.</p>}</div></section>:<>
 <section className="date-strip">{days.map((day,i)=><button key={i} onClick={()=>setSelectedDate(day)} className={`date-cell ${dateKey(day)===dateKey(selectedDate)?"date-active":""}`}><span>{day.toLocaleDateString("en-US",{weekday:"short"})}</span><b>{day.getDate()}</b>{dateKey(day)===dateKey(selectedDate)&&<i/>}</button>)}</section>
 <section className="summary-cards"><StatCard done count={weekDone}/><StatCard count={weekOpen}/></section>
 <section className="weekly-progress"><div className="section-heading"><h2>Weekly Progress</h2><span>{progress}%</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div></section>
 <section className="today-section"><div className="section-heading"><div><h2>{dateKey(selectedDate)===dateKey(new Date())?"Tasks Today":"Tasks on "+selectedDate.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</h2><p>{dayTasks.length} scheduled {dayTasks.length===1?"task":"tasks"}</p></div><button className="view-all" onClick={()=>setShowAll(true)}>View All</button></div>{error&&<div className="error-banner">{error}<button onClick={load}>Retry</button></div>}{loading?<p className="muted center">Loading tasks…</p>:dayTasks.length?dayTasks.map(task=><TaskRow key={task._id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask}/>):<div className="empty-day"><CalendarDays size={23}/><span>No tasks scheduled for this day</span></div>}</section>
 <section className="weekly-list"><div className="section-heading"><h2>Weekly Tasks</h2><span>Monday – Sunday</span></div>{weeks.map(week=>{const open=week.tasks.filter(t=>t.status!=="Completed").length,done=week.tasks.length-open,expandedWeek=expanded.has(week.key);return <div className="week-block" key={week.key}><button className="week-header" onClick={()=>toggleWeek(week.key)}><span><b>{week.key===dateKey(startOfWeek(new Date()))?"This week":"Week of "+week.start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</b><small>{formatRange(week.start)}</small></span><span className="week-badges"><em>{open} open</em><em>{done} done</em></span>{expandedWeek?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>{expandedWeek&&<div className="week-tasks">{week.tasks.length?week.tasks.map(task=><TaskRow key={task._id} task={task} onToggle={toggleTask} onEdit={openEdit} onDelete={deleteTask}/>):<p className="muted center">Nothing scheduled this week.</p>}</div>}</div>})}</section></>}
 <button className="fab" aria-label="Add task" onClick={openCreate}><Plus size={26}/></button><nav className="bottom-nav"><button className={!showAll?"nav-active":""} onClick={()=>setShowAll(false)}><ListTodo size={19}/><span>Home</span></button><button className={showAll?"nav-active":""} onClick={()=>setShowAll(true)}><CalendarDays size={19}/><span>Tasks</span></button></nav><TaskModal open={modal} onClose={()=>setModal(false)} onSave={saveTask} task={editing} saving={saving}/>{toast&&<div role="status" className="toast">{toast}</div>}</main></div>;
}
