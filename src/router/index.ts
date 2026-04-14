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
      path: '/plaza',
      name: 'plaza',
      component: () => import('../views/PlazaView.vue')
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
    }
  ]
})

export default router
