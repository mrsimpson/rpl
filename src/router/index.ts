import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/conversation',
    name: 'Conversation',
    component: () => import('../views/ConversationView.vue'),
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
