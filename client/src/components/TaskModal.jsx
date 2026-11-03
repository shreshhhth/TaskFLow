import { useEffect, useState } from "react";
import { CalendarDays, Clock3, X } from "lucide-react";
import { toLocalInputValue } from "../lib/dates";
const empty = {
  title: "",
  description: "",
  scheduledAt: "",
  priority: "Medium",
};
export default function TaskModal({ open, onClose, onSave, task, saving }) {
  const [form, setForm] = useState(empty),
    [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setError("");
      setForm(
        task
          ? {
              title: task.title,
              description: task.description || "",
              scheduledAt: toLocalInputValue(task.scheduledAt),
              priority: task.priority || "Medium",
            }
          : {
              ...empty,
              scheduledAt: toLocalInputValue(new Date(Date.now() + 3600000)),
            },
      );
    }
  }, [open, task]);
  if (!open) return null;
  const change = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledAt)
      return setError("Task title and date/time are required.");
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal-panel" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <span className="modal-kicker">TASK MANAGER</span>
            <h2>{task ? "Edit Task" : "Add New Task"}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <label className="field-label">
          Task title <span>*</span>
          <input
            autoFocus
            maxLength="120"
            name="title"
            value={form.title}
            onChange={change}
            placeholder="What do you need to do?"
            required
            className="field"
          />
        </label>
        <div className="form-grid">
          <label className="field-label">
            Start time{" "}
            <div className="input-with-icon">
              <Clock3 size={14} />
              <input
                type="time"
                value={form.scheduledAt ? form.scheduledAt.slice(11, 16) : ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    scheduledAt:
                      p.scheduledAt.slice(0, 10) + "T" + e.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label className="field-label">
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={change}
              className="field"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
        </div>
        <label className="field-label">
          Set date{" "}
          <div className="input-with-icon">
            <CalendarDays size={14} />
            <input
              type="date"
              value={form.scheduledAt ? form.scheduledAt.slice(0, 10) : ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  scheduledAt:
                    e.target.value +
                    "T" +
                    (p.scheduledAt.slice(11, 16) || "09:00"),
                }))
              }
              required
            />
          </div>
        </label>
        <label className="field-label">
          Description{" "}
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            rows="4"
            maxLength="2000"
            placeholder="Add Description"
            className="field resize-none"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button disabled={saving} className="create-task-button">
          {saving ? "Saving…" : task ? "Save Changes" : "Create task"}
        </button>
      </form>
    </div>
  );
}
