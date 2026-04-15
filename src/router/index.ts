import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/demo',
      name: 'demo',
      component: () => import('../views/Demo25DView.vue')
    },
    {
      path: '/achievement',
      name: 'achievement',
      component: () => import('../views/achievement/AchievementView.vue')
    },
    {
      path: '/challenge',
      name: 'challenge',
      component: () => import('../views/ChallengeView.vue')
    },
    {
      path: '/challenge-result',
      name: 'challenge-result',
      component: () => import('../views/ChallengeResultView.vue')
    },
    {
      path: '/fragment-interior',
      name: 'fragment-interior',
      component: () => import('../views/FragmentInteriorView.vue')
    },
    {
      path: '/book-interior',
      name: 'book-interior',
      component: () => import('../views/BookInteriorView.vue')
    },
    {
      path: '/plaza-element/:type',
      name: 'plaza-element',
      component: () => import('../views/education/PlazaElementView.vue')
    },
    {
      path: '/presale/one-center-four-platforms',
      name: 'presale-one-center-four-platforms',
      component: () => import('../views/presale/one-center-four-platforms/IndexView.vue')
    },
    {
      path: '/presale/middle-platform',
      name: 'presale-middle-platform',
      component: () => import('../views/presale/middle-platform/IndexView.vue')
    },
    {
      path: '/presale/ticketing',
      name: 'presale-ticketing',
      component: () => import('../views/presale/ticketing/IndexView.vue')
    },
    {
      path: '/presale/safety-production',
      name: 'presale-safety-production',
      component: () => import('../views/presale/safety-production/IndexView.vue')
    }
  ]
})

export default router
