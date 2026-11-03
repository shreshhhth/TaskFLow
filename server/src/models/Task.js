import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  scheduledAt: { type: Date, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["In Progress", "Completed"], default: "In Progress" }
}, { timestamps: true });

taskSchema.index({ scheduledAt: 1 });
taskSchema.index({ title: "text", description: "text" });

export default mongoose.model("Task", taskSchema);
