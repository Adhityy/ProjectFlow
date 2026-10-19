import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import LoginView from '../views/LoginView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import ProjectFlowView from '../app.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'login' } },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/projects/:projectId', name: 'project', component: ProjectFlowView, meta: { requiresAuth: true } },
    { path: '/forbidden', name: 'forbidden', component: ForbiddenView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'login' } }
  ]
})

router.beforeEach(to => {
  const auth = useAuth()

  if (to.meta.requiresAuth && !auth.currentUser.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.currentUser.value) {
    const firstProject = auth.accessibleProjects.value[0]
    return firstProject
      ? { name: 'project', params: { projectId: firstProject.id } }
      : { name: 'forbidden' }
  }

  if (to.name === 'project' && !auth.canAccessProject(to.params.projectId)) {
    const firstProject = auth.accessibleProjects.value[0]
    return firstProject
      ? { name: 'project', params: { projectId: firstProject.id } }
      : { name: 'forbidden' }
  }
})

export default router
