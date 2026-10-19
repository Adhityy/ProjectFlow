<template>
  <main class="login-page">
    <section class="login-intro">
      <a class="login-brand" href="/login"><span class="login-brand__mark">P</span> ProjectFlow</a>
      <div class="login-intro__content">
        <p class="login-kicker">PIPER ENTERPRISE</p>
        <h1>Work moves better when everyone knows their part.</h1>
        <div class="login-board-preview" aria-hidden="true">
          <div v-for="column in previewColumns" :key="column.name" class="preview-column">
            <span class="preview-column__heading"><i :class="`preview-dot preview-dot--${column.tone}`"></i>{{ column.name }}</span>
            <span v-for="task in column.tasks" :key="task" class="preview-task">{{ task }}</span>
          </div>
        </div>
      </div>
      <p class="login-intro__footer">A calmer view of work in progress.</p>
    </section>

    <section class="login-panel">
      <div class="login-panel__content">
        <p class="login-kicker login-kicker--green">SECURE WORKSPACE</p>
        <h2>Sign in to ProjectFlow</h2>
        <p class="login-panel__lead">Choose a demo identity to continue.</p>

        <div class="account-list" role="list" aria-label="Demo accounts">
          <button
            v-for="account in accounts"
            :key="account.id"
            class="account-option"
            :class="{ 'account-option--selected': selectedAccountId === account.id }"
            type="button"
            role="listitem"
            :aria-pressed="selectedAccountId === account.id"
            @click="selectedAccountId = account.id"
          >
            <span class="account-option__avatar" :class="`account-option__avatar--${account.role}`">{{ account.avatar }}</span>
            <span class="account-option__details">
              <strong>{{ account.name }}</strong>
              <small>{{ roleLabels[account.role] }}</small>
            </span>
            <span class="account-option__check" aria-hidden="true">{{ selectedAccountId === account.id ? '✓' : '' }}</span>
          </button>
        </div>

        <button class="login-submit" type="button" :disabled="!selectedAccountId" @click="signIn">
          Continue <span aria-hidden="true">→</span>
        </button>
        <p class="login-panel__notice">Demo identities use sample data and do not authenticate against a server.</p>
      </div>
      <footer class="login-panel__footer">PROJECTFLOW <span>•</span> PIPER ENTERPRISE</footer>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { demoUsers, useAuth } from '../composables/useAuth.js'

const accounts = demoUsers.filter(user => ['admin', 'project-manager', 'team-member'].includes(user.role))
const roleLabels = {
  admin: 'Administrator',
  'project-manager': 'Project manager',
  'team-member': 'Team member'
}
const selectedAccountId = ref('manager-putri')
const { login, accessibleProjects } = useAuth()
const route = useRoute()
const router = useRouter()

function signIn() {
  if (!login(selectedAccountId.value)) return
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect.startsWith('/projects/')) {
    router.replace(redirect)
    return
  }
  router.replace({ name: 'project', params: { projectId: accessibleProjects.value[0]?.id ?? 'piper-enterprise' } })
}

const previewColumns = [
  { name: 'TO DO', tone: 'coral', tasks: ['Wireframing', 'Design concept'] },
  { name: 'IN PROGRESS', tone: 'blue', tasks: ['Customer journey'] },
  { name: 'REVIEW', tone: 'gold', tasks: ['Competitor research'] },
  { name: 'DONE', tone: 'green', tasks: ['Branding'] }
]
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
  background: #fff;
  color: #202943;
  font-family: "DM Sans", sans-serif;
}

.login-page h1,
.login-page h2,
.login-brand {
  font-family: "Manrope", "DM Sans", sans-serif;
}

.login-intro {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  padding: 34px clamp(28px, 6vw, 88px) 28px;
  background: #f1f6f3;
}

.login-brand {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 10px;
  color: #202943;
  font-size: 17px;
  font-weight: 800;
  text-decoration: none;
}

.login-brand__mark {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 8px;
  background: #167b69;
  color: #fff;
}

.login-intro__content { width: 100%; max-width: 720px; margin: 40px auto; }
.login-kicker { margin: 0 0 13px; color: #a8752f; font-size: 10px; font-weight: 800; }
.login-kicker--green { color: #167b69; }
.login-intro h1 { max-width: 610px; margin: 0; color: #202943; font-size: 46px; line-height: 1.08; }

.login-board-preview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 48px;
  padding: 14px;
  border: 1px solid #e3e9e5;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 14px 36px rgb(37 55 47 / 7%);
}

.preview-column { display: grid; align-content: start; gap: 9px; min-width: 0; }
.preview-column__heading { display: flex; align-items: center; gap: 5px; min-height: 24px; color: #687180; font-size: 9px; font-weight: 700; white-space: nowrap; }
.preview-dot { width: 6px; height: 6px; flex: 0 0 6px; border-radius: 50%; background: #dc7e73; }
.preview-dot--blue { background: #546bb5; }
.preview-dot--gold { background: #d3a833; }
.preview-dot--green { background: #278c74; }
.preview-task { min-height: 48px; padding: 8px 6px; border: 1px solid #e8ebef; border-radius: 5px; color: #354055; font-size: 10px; font-weight: 600; overflow-wrap: anywhere; }
.login-intro__footer { margin: 0; color: #7e8986; font-size: 11px; }

.login-panel { display: flex; min-height: 100vh; flex-direction: column; justify-content: center; padding: 50px clamp(28px, 5vw, 76px) 24px; }
.login-panel__content { width: 100%; max-width: 430px; margin: auto; }
.login-panel h2 { margin: 0; color: #202943; font-size: 28px; }
.login-panel__lead { margin: 8px 0 25px; color: #7e8795; font-size: 13px; }
.account-list { display: grid; gap: 9px; }

.account-option {
  display: flex;
  width: 100%;
  min-height: 70px;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border: 1px solid #e3e7ed;
  border-radius: 7px;
  background: #fff;
  color: #283148;
  text-align: left;
  cursor: pointer;
}

.account-option:hover { border-color: #a7c9bf; background: #fbfdfc; }
.account-option--selected { border-color: #167b69; box-shadow: 0 0 0 1px #167b69; }
.account-option__avatar { display: grid; width: 37px; height: 37px; flex: 0 0 37px; place-items: center; border-radius: 50%; background: #e4f1ed; color: #167b69; font-size: 11px; font-weight: 800; }
.account-option__avatar--admin { background: #e8eafa; color: #505bb0; }
.account-option__avatar--team-member { background: #fbe9ee; color: #a94c68; }
.account-option__details { display: grid; flex: 1; gap: 4px; }
.account-option__details strong { font-size: 12px; }
.account-option__details small { color: #87909c; font-size: 10px; }
.account-option__check { display: grid; width: 19px; height: 19px; place-items: center; border: 1px solid #dfe4e9; border-radius: 50%; color: #167b69; font-size: 11px; }
.account-option--selected .account-option__check { border-color: #167b69; background: #eaf4f1; }

.login-submit { display: flex; width: 100%; min-height: 44px; align-items: center; justify-content: center; gap: 9px; margin-top: 19px; border: 0; border-radius: 5px; background: #167b69; color: #fff; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.login-submit:hover { background: #106d5d; }
.login-submit:disabled { opacity: .55; cursor: not-allowed; }
.login-panel__notice { margin: 16px 0 0; color: #9199a4; font-size: 10px; line-height: 1.5; }
.login-panel__footer { margin-top: 28px; color: #929aa5; font-size: 9px; font-weight: 700; }
.login-panel__footer span { padding: 0 5px; color: #2a927c; }

@media (max-width: 780px) {
  .login-page { grid-template-columns: 1fr; }
  .login-intro { min-height: 0; padding: 22px 22px 16px; }
  .login-intro__content { margin: 34px auto 22px; }
  .login-intro h1 { max-width: 560px; font-size: 36px; }
  .login-board-preview { max-width: 560px; margin-top: 23px; }
  .login-intro__footer { display: none; }
  .login-panel { min-height: 0; padding: 34px 22px 24px; }
  .login-panel__footer { margin-top: 25px; }
}

@media (max-width: 420px) {
  .login-intro h1 { font-size: 31px; }
  .login-board-preview { gap: 5px; padding: 8px; }
  .preview-column__heading { font-size: 8px; }
  .preview-task { min-height: 44px; padding: 6px 4px; font-size: 9px; }
  .login-panel h2 { font-size: 24px; }
}
</style>
