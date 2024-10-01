import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../components/Container.vue'),
      redirect: '/users',
      children: [
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users.vue'),
        },
        {
          path: 'checks',
          name: 'checks',
          component: () => import('../views/Checks.vue'),
        },
        {
          path: 'lottery',
          name: 'lottery',
          component: () => import('../views/Lottery.vue'),
        },
        {
          path: 'locales',
          name: 'locales',
          component: () => import('../views/Locales.vue'),
        },
        {
          path: 'tickets',
          name: 'tickets',
          component: () => import('../views/Tickets.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../views/Notifications.vue'),
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
  ],
});

export default router;
