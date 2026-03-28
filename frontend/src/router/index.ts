import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { public: true },
    },

    // Restaurants list
    {
      path: '/',
      name: 'restaurants',
      component: () => import('@/views/restaurants/RestaurantsView.vue'),
    },

    // Restaurant context (all routes require a restaurantId)
    {
      path: '/r/:restaurantId',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: () => import('@/views/bookings/BookingsView.vue'),
        },
        {
          path: 'floor-plan',
          name: 'floor-plan',
          component: () => import('@/views/floorplan/FloorPlanView.vue'),
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/customers/CustomersView.vue'),
        },
        {
          path: 'stats',
          name: 'stats',
          component: () => import('@/views/stats/StatsView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
        },
      ],
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Navigation guard — redirect to login if not authenticated
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) return { name: 'login' }
})

export default router
