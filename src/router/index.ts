import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../App.vue')
  },
  {
    path: '/conversation',
    name: 'Conversation',
    component: () => import('../App.vue'),
    props: (route) => ({
      conversationUrl: route.query.url as string
    })
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
