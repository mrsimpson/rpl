import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    components: {
      default: () => import('../views/HomeView.vue'),
      footer: () => import('../views/HomeFooter.vue')
    }
  },
  {
    path: '/conversation',
    name: 'Conversation',
    components: {
      default: () => import('../views/ConversationView.vue'),
      footer: () => import('../views/ConversationFooter.vue')
    },
    props: {
      default: (route) => ({
        conversationUrl: route.query.url as string
      }),
      footer: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
