<template>
  <main class="forbidden-page">
    <section class="forbidden-panel">
      <span class="forbidden-panel__icon" aria-hidden="true">!</span>
      <p class="forbidden-panel__eyebrow">ACCESS CONTROL</p>
      <h1>Project access denied</h1>
      <p>Your current role does not have access to this project.</p>
      <RouterLink v-if="accessibleProjects.length" class="forbidden-panel__action" :to="{ name: 'project', params: { projectId: accessibleProjects[0].id } }">
        Return to an available project
      </RouterLink>
      <button v-else class="forbidden-panel__action" type="button" @click="logoutAndSignIn">Sign in with another account</button>
    </section>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const { accessibleProjects, logout } = useAuth()
const router = useRouter()

function logoutAndSignIn() {
  logout()
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.forbidden-page { display: grid; min-height: 100vh; place-items: center; padding: 24px; background: #f4f6f7; color: #202943; }
.forbidden-panel { width: min(100%, 430px); padding: 32px; border: 1px solid #e3e7ed; border-radius: 8px; background: #fff; text-align: center; }
.forbidden-panel__icon { display: grid; width: 42px; height: 42px; margin: 0 auto 17px; place-items: center; border-radius: 50%; background: #fff0f2; color: #c74963; font-size: 20px; font-weight: 800; }
.forbidden-panel__eyebrow { margin: 0 0 8px; color: #b94d66; font-size: 9px; font-weight: 800; }
.forbidden-panel h1 { margin: 0; font-size: 22px; }
.forbidden-panel p:not(.forbidden-panel__eyebrow) { margin: 9px 0 22px; color: #78818f; font-size: 12px; line-height: 1.5; }
.forbidden-panel__action { display: inline-flex; min-height: 39px; align-items: center; justify-content: center; padding: 0 13px; border: 0; border-radius: 5px; background: #167b69; color: #fff; font: inherit; font-size: 11px; font-weight: 700; text-decoration: none; cursor: pointer; }
</style>
