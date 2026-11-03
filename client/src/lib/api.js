import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
export const taskApi = {
  list: (params = {}) => api.get("/tasks", { params }).then(r => r.data.tasks),
  create: (data) => api.post("/tasks", data).then(r => r.data.task),
  update: (id, data) => api.patch(`/tasks/${id}`, data).then(r => r.data.task),
  remove: (id) => api.delete(`/tasks/${id}`)
};
export function errorMessage(error) {
  return error?.response?.data?.message || error.message || "Something went wrong.";
}
