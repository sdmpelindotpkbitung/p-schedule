import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ── Inject JWT token ke setiap request ───────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tpk_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle 401 (token expired) → redirect ke login ───────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tpk_token");
      localStorage.removeItem("tpk_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ══════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  getDivisions: () => api.get("/auth/divisions"),
  getDivisionMembers: () => api.get("/auth/division-members"),
  createDivision: (data) => api.post("/auth/divisions", data),
  updateDivision: (id, data) => api.put(`/auth/divisions/${id}`, data),
  deleteDivision: (id) => api.delete(`/auth/divisions/${id}`),
  getUsers: () => api.get("/auth/users"),
  createUser: (data) => api.post("/auth/users", data),
  updateUserPassword: (id, data) => api.put(`/auth/users/${id}/password`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ══════════════════════════════════════════════════════════════
// RUANGAN
// ══════════════════════════════════════════════════════════════
export const ruanganAPI = {
  getAll: () => api.get("/ruangan"),
  getById: (id) => api.get(`/ruangan/${id}`),
  create: (data) => api.post("/ruangan", data),
  update: (id, data) => api.put(`/ruangan/${id}`, data),
  delete: (id) => api.delete(`/ruangan/${id}`),
};

// ══════════════════════════════════════════════════════════════
// JADWAL
// ══════════════════════════════════════════════════════════════
export const jadwalAPI = {
  getAll: (params) => api.get("/jadwal", { params }), // { bulan, tanggal }
  getManaged: () => api.get("/jadwal/kelolaan"),
  getById: (id) => api.get(`/jadwal/${id}`),
  create: (data) => api.post("/jadwal", data),
  update: (id, data) => api.put(`/jadwal/${id}`, data),
  delete: (id) => api.delete(`/jadwal/${id}`),
};

export default api;
