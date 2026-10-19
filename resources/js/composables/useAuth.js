import { computed, reactive, ref } from 'vue'

const profileStorageKey = 'projectflow:demo-profiles:v1'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const demoUsers = reactive([
  { id: 'admin-morgan', name: 'Morgan Lee', email: 'morgan@projectflow.demo', role: 'admin', avatar: 'ML' },
  { id: 'manager-putri', name: 'Putri Hayati', email: 'putri@projectflow.demo', role: 'project-manager', avatar: 'PH' },
  { id: 'manager-other', name: 'Jules Carter', email: 'jules@projectflow.demo', role: 'project-manager', avatar: 'JC' },
  { id: 'member-alya', name: 'Alya Rahman', email: 'alya@projectflow.demo', role: 'team-member', avatar: 'AR' },
  { id: 'member-rafi', name: 'Rafi Pratama', email: 'rafi@projectflow.demo', role: 'team-member', avatar: 'RP' },
  { id: 'member-nadia', name: 'Nadia Putri', email: 'nadia@projectflow.demo', role: 'team-member', avatar: 'NP' }
])

function avatarForName(name) {
  return name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join('')
}

function restoreProfiles() {
  if (typeof localStorage === 'undefined') return

  try {
    const savedProfiles = JSON.parse(localStorage.getItem(profileStorageKey) ?? '{}')
    if (!savedProfiles || typeof savedProfiles !== 'object' || Array.isArray(savedProfiles)) return

    for (const user of demoUsers) {
      const profile = savedProfiles[user.id]
      const name = typeof profile?.name === 'string' ? profile.name.trim() : ''
      const email = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : ''
      if (name.length < 2 || !emailPattern.test(email)) continue

      const emailInUse = demoUsers.some(other =>
        other.id !== user.id && other.email.toLowerCase() === email
      )
      if (emailInUse) continue

      user.name = name
      user.email = email
      user.avatar = avatarForName(name)
    }
  } catch {
		return
  }
}

function persistProfiles() {
  if (typeof localStorage === 'undefined') return

  try {
    const profiles = Object.fromEntries(demoUsers.map(user => [user.id, {
      name: user.name,
      email: user.email
    }]))
    localStorage.setItem(profileStorageKey, JSON.stringify(profiles))
  } catch {
    return
  }
}

restoreProfiles()

export const projects = ref([
  { id: 'piper-enterprise', name: 'Piper Enterprise', ownerId: 'manager-putri', memberIds: ['manager-putri', 'member-alya', 'member-rafi', 'member-nadia'], color: 'green', description: 'Designing a clearer way to work together.' },
  { id: 'website-redesign', name: 'Website redesign', ownerId: 'manager-putri', memberIds: ['manager-putri', 'member-alya'], color: 'coral', description: 'A refreshed experience for the Piper website.' },
  { id: 'mobile-app', name: 'Mobile app', ownerId: 'manager-other', memberIds: ['manager-other', 'member-rafi'], color: 'blue', description: 'A focused companion for work on the move.' },
  { id: 'erp-development', name: 'ERP Development', ownerId: 'manager-other', memberIds: ['manager-other', 'member-nadia'], color: 'gold', description: 'Connecting core business workflows.' }
])

const currentUser = ref(null)

function canAccessProject(projectId, user = currentUser.value) {
  if (!user) return false
  const project = projects.value.find(item => item.id === projectId)
  if (!project) return false
  if (user.role === 'admin') return true
  if (user.role === 'project-manager') return project.ownerId === user.id
  return project.memberIds.includes(user.id)
}

function canManageProject(projectId, user = currentUser.value) {
  if (!user || !canAccessProject(projectId, user)) return false
  const project = projects.value.find(item => item.id === projectId)
  return user.role === 'admin' || (user.role === 'project-manager' && project.ownerId === user.id)
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const accessibleProjects = computed(() =>
    projects.value.filter(project => canAccessProject(project.id))
  )

  function login(userId) {
    const user = demoUsers.find(item => item.id === userId)
    if (!user) return false
    currentUser.value = user
    return true
  }

  function logout() {
    currentUser.value = null
  }

  function updateProfile({ name, email } = {}) {
    if (!currentUser.value) return { ok: false, reason: 'unauthenticated' }

    const normalizedName = String(name ?? '').trim()
    const normalizedEmail = String(email ?? '').trim().toLowerCase()
    if (normalizedName.length < 2 || !emailPattern.test(normalizedEmail)) {
      return { ok: false, reason: 'invalid' }
    }

    const duplicateEmail = demoUsers.some(user =>
      user.id !== currentUser.value.id && user.email.toLowerCase() === normalizedEmail
    )
    if (duplicateEmail) return { ok: false, reason: 'email-in-use' }

    currentUser.value.name = normalizedName
    currentUser.value.email = normalizedEmail
    currentUser.value.avatar = avatarForName(normalizedName)
    persistProfiles()

    return { ok: true }
  }

  function addProjectMember(projectId, userId) {
    if (!canManageProject(projectId)) return false
    const project = projects.value.find(item => item.id === projectId)
    const user = demoUsers.find(item => item.id === userId && item.role === 'team-member')
    if (!project || !user || project.memberIds.includes(user.id)) return false
    project.memberIds.push(user.id)
    return true
  }

  return {
    currentUser,
    isAuthenticated,
    accessibleProjects,
    login,
    logout,
    updateProfile,
    canAccessProject,
    canManageProject,
    addProjectMember
  }
}
