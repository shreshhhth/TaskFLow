import mongoose from "mongoose";
import Task from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const priorities = ["Low", "Medium", "High"];
const statuses = ["In Progress", "Completed"];

function validateTask(body, partial = false) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) errors.push("Title is required.");
    else if (body.title.trim().length > 120) errors.push("Title must be 120 characters or fewer.");
  }
  if (!partial || body.scheduledAt !== undefined) {
    if (!body.scheduledAt || Number.isNaN(new Date(body.scheduledAt).getTime())) errors.push("A valid date and time is required.");
  }
  if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 2000)) errors.push("Description must be 2000 characters or fewer.");
  if (body.priority !== undefined && !priorities.includes(body.priority)) errors.push("Priority must be Low, Medium, or High.");
  if (body.status !== undefined && !statuses.includes(body.status)) errors.push("Status must be In Progress or Completed.");
  return errors;
}

export const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, from, to } = req.query;
  const filter = {};
  if (status && statuses.includes(status)) filter.status = status;
  if (priority && priorities.includes(priority)) filter.priority = priority;
  if (from || to) {
    filter.scheduledAt = {};
    if (from && !Number.isNaN(new Date(from).getTime())) filter.scheduledAt.$gte = new Date(from);
    if (to && !Number.isNaN(new Date(to).getTime())) filter.scheduledAt.$lt = new Date(to);
  }
  if (search?.trim()) {
    const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } }
    ];
  }
  const tasks = await Task.find(filter).sort({ scheduledAt: 1, createdAt: -1 }).lean();
  res.json({ count: tasks.length, tasks });
});

export const getTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task id." });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ task });
});

export const createTask = asyncHandler(async (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  const task = await Task.create({
    title: req.body.title.trim(),
    description: req.body.description?.trim() || "",
    scheduledAt: new Date(req.body.scheduledAt),
    priority: req.body.priority || "Medium",
    status: req.body.status || "In Progress"
  });
  res.status(201).json({ message: "Task created.", task });
});

export const updateTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task id." });
  const errors = validateTask(req.body, true);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  const updates = {};
  for (const key of ["title", "description", "priority", "status"]) {
    if (req.body[key] !== undefined) updates[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
  }
  if (req.body.scheduledAt !== undefined) updates.scheduledAt = new Date(req.body.scheduledAt);
  const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ message: "Task updated.", task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid task id." });
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found." });
  res.json({ message: "Task deleted." });
});
