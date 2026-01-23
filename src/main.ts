import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import './assets/styles/main.css'

// Create router with auto-generated routes
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.afterEach((to) => {
  const baseTitle = 'KindleHub'
  const pageTitle = to.name
    ? String(to.name).charAt(0).toUpperCase() + String(to.name).slice(1)
    : ''

  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})

// Create Pinia store
const pinia = createPinia()

import { i18n } from '@/plugins/i18n'

// Create and mount app
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)

import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()
app.config.errorHandler = (err) => {
  handleError(err)
}

app.mount('#app')
