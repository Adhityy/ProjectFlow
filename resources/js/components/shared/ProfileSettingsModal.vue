<template>
  <div v-if="modelValue" class="profile-settings__backdrop" @click.self="close">
    <BasePanel class="profile-settings" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
      <template #header>
        <div>
          <p class="profile-settings__eyebrow">ACCOUNT SETTINGS</p>
          <h2 id="profile-settings-title">Edit profile</h2>
        </div>
        <button class="profile-settings__close" type="button" aria-label="Close settings" @click="close">×</button>
      </template>

      <form id="profile-settings-form" class="profile-settings__form" @submit.prevent="save">
        <div class="profile-settings__identity">
          <span class="profile-settings__avatar">{{ initials }}</span>
          <span><strong>{{ form.name || 'Your name' }}</strong><small>{{ roleLabel }}</small></span>
        </div>
        <label>
          Full name
          <input v-model.trim="form.name" required minlength="2" maxlength="80" autocomplete="name" />
        </label>
        <label>
          Email address
          <input v-model.trim="form.email" required type="email" maxlength="120" autocomplete="email" />
        </label>
        <label>
          Role
          <input :value="roleLabel" disabled />
        </label>
        <p class="profile-settings__hint">Your avatar initials update automatically from your name.</p>
        <p v-if="errorMessage" class="profile-settings__error" role="alert">{{ errorMessage }}</p>
      </form>

      <template #footer>
        <button class="profile-settings__cancel" type="button" @click="close">Cancel</button>
        <button class="profile-settings__save" type="submit" form="profile-settings-form" :disabled="!isValid">Save changes</button>
      </template>
    </BasePanel>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BasePanel from './BasePanel.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, required: true }
})

const emit = defineEmits({
  'update:modelValue': value => typeof value === 'boolean',
  save: profile => typeof profile?.name === 'string' && typeof profile?.email === 'string'
})

const roleLabels = {
  admin: 'Administrator',
  'project-manager': 'Project Manager',
  'team-member': 'Team Member'
}
const form = reactive({ name: '', email: '' })
const errorMessage = ref('')
const initials = computed(() => form.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('') || '?')
const roleLabel = computed(() => roleLabels[props.user?.role] ?? 'Team Member')
const isValid = computed(() => form.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))

watch(
  [() => props.modelValue, () => props.user],
  ([isOpen]) => {
    if (!isOpen) return
    form.name = props.user?.name ?? ''
    form.email = props.user?.email ?? ''
    errorMessage.value = ''
  },
  { immediate: true }
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (!isValid.value) return
  emit('save', { name: form.name.trim(), email: form.email.trim() })
}
</script>

<style scoped>
.profile-settings__backdrop { position: fixed; z-index: 24; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(24 32 49 / 48%); }
.profile-settings { width: min(100%, 460px); box-shadow: 0 22px 60px rgb(22 29 48 / 24%); }
.profile-settings__eyebrow { margin: 0 0 4px; color: #167b69; font-size: 9px; font-weight: 800; }
.profile-settings h2 { margin: 0; color: #202943; font-size: 18px; }
.profile-settings__close { width: 31px; height: 31px; border: 0; border-radius: 5px; background: transparent; color: #737c89; font-size: 23px; cursor: pointer; }
.profile-settings__close:hover { background: #f0f2f6; }
.profile-settings__form { display: grid; gap: 13px; }
.profile-settings__identity { display: flex; align-items: center; gap: 11px; margin-bottom: 3px; padding: 11px; border: 1px solid #e7ebef; border-radius: 6px; background: #fafbfc; }
.profile-settings__avatar { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 50%; background: #e4f1ed; color: #167b69; font-size: 12px; font-weight: 800; }
.profile-settings__identity strong, .profile-settings__identity small { display: block; }
.profile-settings__identity strong { color: #30394b; font-size: 12px; }
.profile-settings__identity small { margin-top: 4px; color: #828b98; font-size: 10px; }
.profile-settings__form label { display: grid; gap: 6px; color: #485263; font-size: 10px; font-weight: 700; }
.profile-settings__form input { width: 100%; min-height: 39px; padding: 0 10px; border: 1px solid #dfe4eb; border-radius: 5px; background: #fff; color: #30394a; font: inherit; font-size: 11px; }
.profile-settings__form input:focus { outline: 2px solid #7774e5; outline-offset: 1px; }
.profile-settings__form input:disabled { background: #f3f5f7; color: #7c8592; }
.profile-settings__hint, .profile-settings__error { margin: 0; font-size: 9px; line-height: 1.5; }
.profile-settings__hint { color: #89919d; }
.profile-settings__error { color: #bd405d; }
.profile-settings__cancel, .profile-settings__save { min-height: 37px; padding: 0 12px; border: 1px solid #dfe4eb; border-radius: 5px; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.profile-settings__cancel { background: #fff; color: #515b69; }
.profile-settings__save { border-color: #167b69; background: #167b69; color: #fff; }
.profile-settings__save:disabled { opacity: .5; cursor: not-allowed; }
</style>
