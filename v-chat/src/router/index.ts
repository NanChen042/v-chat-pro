import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import IndexView from '../views/IndexView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexView,
      meta: { requiresAuth: true }
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/contact/ContactView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contact/search',
      name: 'search',
      component: () => import('../views/contact/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contact/pending',
      name: 'pending',
      component: () => import('../views/contact/PendingRequestsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('../views/me/MeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:id',
      name: 'chat',
      component: () => import('../views/chat/ChatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ],
})

// 路由守卫
router.beforeEach((to) => {
  const userStore = useUserStore()
  userStore.initFromStorage()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login' }
  } else if (userStore.isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    return { name: 'index' }
  }
})

export default router
