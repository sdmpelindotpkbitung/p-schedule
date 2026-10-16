import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authAPI } from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  // ── State ─────────────────────────────────────────────────
  const user = ref(JSON.parse(localStorage.getItem("tpk_user") || "null"));
  const token = ref(localStorage.getItem("tpk_token") || null);

  // ── Getters ───────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isBigAdmin = computed(() => user.value?.role === "big_admin");
  const isPic = computed(() => user.value?.role === "pic");
  const userName = computed(() => user.value?.nama || "");
  const userRole = computed(() => user.value?.role || "");
  const userInitial = computed(() => userName.value?.[0]?.toUpperCase() || "?");

  // ── Actions ───────────────────────────────────────────────
  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    token.value = res.data.token;
    user.value = res.data.user;
    localStorage.setItem("tpk_token", token.value);
    localStorage.setItem("tpk_user", JSON.stringify(user.value));
    return res.data;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("tpk_token");
    localStorage.removeItem("tpk_user");
  };

  // Refresh data user dari server
  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      user.value = res.data;
      localStorage.setItem("tpk_user", JSON.stringify(res.data));
    } catch {
      logout();
    }
  };

  const divisionName = computed(() => user.value?.division_name || "");
  return {
    user,
    token,
    isLoggedIn,
    isBigAdmin,
    isPic,
    userName,
    userRole,
    userInitial,
    divisionName,
    login,
    logout,
    refreshUser,
  };
});
