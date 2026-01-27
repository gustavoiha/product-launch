import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
  type Router,
  type RouterHistory
} from 'vue-router';
import DashboardPage from '../pages/DashboardPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import PublicWaitlistPage from '../pages/PublicWaitlistPage.vue';
import type { AuthenticationStore } from '../state/authentication';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/public/:slug',
    name: 'public',
    component: PublicWaitlistPage
  }
];

export const createAppRouter = (
  authenticationStore: AuthenticationStore,
  history: RouterHistory = createWebHashHistory()
): Router => {
  const router = createRouter({
    history,
    routes
  });

  router.beforeEach(async (to) => {
    await authenticationStore.initialize();
    if (to.meta.requiresAuth && !authenticationStore.state.isAuthenticated) {
      return { name: 'login' };
    }
    if (to.name === 'login' && authenticationStore.state.isAuthenticated) {
      return { name: 'dashboard' };
    }
    return true;
  });

  return router;
};
