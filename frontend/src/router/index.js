import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/",
    name: "Kalender",
    component: () => import("@/views/Kalender.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/views/Admin.vue"),
    meta: { requiresAuth: true, requiresBigAdmin: true },
  },
  {
    path: "/kelola-jadwal",
    name: "KelolaJadwal",
    component: () => import("@/views/KelolaJadwal.vue"),
    meta: { requiresAuth: true, excludesBigAdmin: true },
  },
  {
    path: "/anggota-divisi",
    name: "AnggotaDivisi",
    component: () => import("@/views/AnggotaDivisi.vue"),
    meta: { requiresAuth: true, requiresPic: true },
  },
  {
    path: "/tv",
    name: "TV",
    component: () => import("@/views/TV.vue"),
    // Tidak butuh login
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: "Login" });
  }
  if (to.meta.requiresBigAdmin && !auth.isBigAdmin) {
    return next({ name: "Kalender" });
  }
  if (to.meta.excludesBigAdmin && auth.isBigAdmin) {
    return next({ name: "Admin" });
  }
  if (to.meta.requiresPic && !auth.isPic) {
    return next({ name: "Kalender" });
  }
  if (to.meta.guest && auth.isLoggedIn) {
    return next({ name: "Kalender" });
  }

  next();
});

export default router;
