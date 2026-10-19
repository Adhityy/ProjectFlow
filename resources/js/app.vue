<template>
	<main class="project-flow">
		<header class="topbar">
			<a class="brand" href="#board" aria-label="ProjectFlow home">
				<span class="brand__mark">P</span>
				<span>ProjectFlow</span>
			</a>
			<div class="topbar__workspace"><span class="topbar__workspace-kicker">CURRENT PROJECT</span>{{ selectedProject?.name }}</div>
			<label class="search-box">
				<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
				<input v-model="query" type="search" placeholder="Search tasks..." aria-label="Search tasks" />
				<kbd>/</kbd>
			</label>
			<button v-if="canManageCurrentProject" class="button button--invite" type="button" @click="openMemberDialog">
				<span aria-hidden="true">+</span> Add member
			</button>
			<div class="profile-menu-wrap">
				<button class="topbar__profile" type="button" :aria-expanded="profileMenuOpen" @click="profileMenuOpen = !profileMenuOpen">
					<span class="topbar__avatar">{{ currentUser?.avatar }}</span>
					<span class="topbar__profile-copy"><strong>{{ currentUser?.name }}</strong><small>{{ roleLabels[currentUser?.role] }}</small></span>
					<span class="profile-chevron" aria-hidden="true">⌄</span>
				</button>
				<div v-if="profileMenuOpen" class="profile-menu">
					<p>Signed in as <strong>{{ currentUser?.email }}</strong></p>
					<button type="button" @click="openProfileSettings">Settings</button>
					<button type="button" @click="switchAccount">Switch demo account</button>
					<button type="button" @click="signOut">Sign out</button>
				</div>
			</div>
		</header>

		<div class="workspace">
			<aside class="sidebar" aria-label="Workspace navigation">
				<div class="sidebar__org">
					<span class="sidebar__org-mark">P</span>
					<span><strong>Piper Enterprise</strong><small>Organization</small></span>
					<span class="sidebar__org-menu" aria-hidden="true">···</span>
				</div>
				<p class="sidebar__label">WORKSPACE</p>
				<RouterLink class="sidebar__item" :to="{ name: 'project', params: { projectId: selectedProject?.id } }" aria-current="page"><span>▦</span> Projects</RouterLink>
				<a class="sidebar__item" href="#team"><span>♧</span> My tasks</a>
				<div class="sidebar__divider"></div>
				<div class="sidebar__section-heading"><p class="sidebar__label">PROJECTS</p><span>{{ accessibleProjects.length }}</span></div>
				<RouterLink
					v-for="project in accessibleProjects"
					:key="project.id"
					class="sidebar__project"
					:class="{ 'sidebar__project--active': project.id === selectedProject?.id }"
					:to="{ name: 'project', params: { projectId: project.id } }"
				>
					<span class="project-dot" :class="`project-dot--${project.color}`"></span>
					<span class="sidebar__project-name">{{ project.name }}</span>
				</RouterLink>
				<div class="sidebar__divider"></div>
				<div id="team" class="sidebar__section-heading"><p class="sidebar__label">TEAM MEMBERS</p><span>{{ projectTeam.length }}</span></div>
				<div v-for="member in projectTeam" :key="member.id" class="sidebar__member">
					<span class="sidebar__member-avatar">{{ member.avatar }}</span>
					<span class="sidebar__member-copy"><strong>{{ member.name }}</strong><small>{{ roleLabels[member.role] }}</small></span>
					<span class="presence-dot" aria-label="Available"></span>
				</div>
				<div class="sidebar__bottom">
					<span class="sidebar__help">?</span>
					<div><strong>{{ roleLabels[currentUser?.role] }}</strong><small>Role-based workspace access</small></div>
				</div>
			</aside>

			<section id="board" class="main-content">
				<div class="breadcrumb"><span>Projects</span><span>/</span><strong>{{ selectedProject?.name }}</strong><select class="project-switcher" :value="selectedProject?.id" aria-label="Switch project" @change="switchProject"><option v-for="project in accessibleProjects" :key="project.id" :value="project.id">{{ project.name }}</option></select><span class="role-chip">{{ roleLabels[currentUser?.role] }}</span></div>
				<div class="project-heading">
					<div>
						<p class="eyebrow">PROJECT BOARD</p>
						<h1>{{ selectedProject?.name }}</h1>
						<p class="project-heading__sub">{{ selectedProject?.description }}</p>
					</div>
					<div class="project-heading__actions">
						<div class="member-stack" :aria-label="`${projectTeam.length} project members`">
							<span v-for="member in projectTeam.slice(0, 4)" :key="member.id" class="member-stack__avatar" :title="member.name">{{ member.avatar }}</span>
							<span v-if="projectTeam.length > 4" class="member-stack__more">+{{ projectTeam.length - 4 }}</span>
						</div>
							<button v-if="canManageCurrentProject" class="button button--member-invite" type="button" aria-label="Add member" title="Add member" @click="openMemberDialog">+</button>
						<button v-if="canManageCurrentProject" class="button button--primary" type="button" @click="openCreateTask('todo')">
							<span aria-hidden="true">+</span> Add task
						</button>
					</div>
				</div>

				<BasePanel class="summary-panel">
					<template #header>
						<div class="summary-panel__title"><span class="summary-panel__icon">↗</span><strong>Project progress</strong></div>
						<span class="summary-panel__percent">{{ progress }}% complete</span>
					</template>
					<div class="progress-track" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" :aria-label="`Project ${progress}% complete`">
						<span :style="{ width: `${progress}%` }"></span>
					</div>
					<template #footer>
						<span>{{ filteredProjectTasks.length }} tasks across 4 stages</span>
						<span>{{ completedTasks }} completed</span>
					</template>
				</BasePanel>

				<div class="board-toolbar">
					<div class="view-tabs" aria-label="Board view">
						<button class="view-tabs__tab" type="button" disabled>Overview</button>
						<button class="view-tabs__tab view-tabs__tab--active" type="button">▦ <span>Tasks</span></button>
						<button class="view-tabs__tab" type="button" disabled>Notes</button>
						<button class="view-tabs__tab" type="button" disabled>Questions</button>
					</div>
					<div class="board-toolbar__right">
						<span class="task-total">{{ filteredTasks.length }} tasks</span>
						<span class="board-view-pill">▦ Board</span>
					</div>
				</div>

				<div v-if="notice" class="access-notice" role="status">{{ notice }}</div>
				<TaskBoard :columns="boardColumns" :can-add-task="canManageCurrentProject" @add-task="openCreateTask">
					<template #task="{ task, status }">
						<TaskCard
							:task="task"
							:status="status"
							:can-delete="canManageCurrentProject"
							:can-change-status="canChangeTaskStatus(task)"
							:tone="task.priority === 'urgent' ? 'urgent' : 'default'"
							@open-task="openTask"
							@change-status="changeTaskStatus"
							@delete-task="deleteTask"
						>
							<template #actions="{ task: slotTask }">
								<span v-if="slotTask.dueDate" class="task-card__due">Due {{ slotTask.dueDate }}</span>
							</template>
						</TaskCard>
					</template>
				</TaskBoard>

				<div v-if="filteredProjectTasks.length === 0" class="search-empty" role="status">
					{{ query.trim() ? `No tasks match “${query}”.` : 'No tasks have been added to this project yet.' }}
				</div>
				<p class="board-footnote">Project owner: {{ projectOwner?.name ?? 'Unassigned' }} <span>•</span> {{ canManageCurrentProject ? 'You can manage this project' : 'Task changes are limited to your assignments' }}</p>
			</section>
		</div>

		<TaskModal
			v-model="isModalOpen"
			:task="selectedTask"
			:initial-status="modalStatus"
			:readonly="!canManageCurrentProject"
			@save="saveTask"
		/>
		<ProfileSettingsModal
			v-model="isProfileSettingsOpen"
			:user="currentUser"
			@save="saveProfile"
		/>

		<div v-if="isMemberModalOpen" class="member-modal-backdrop" @click.self="closeMemberDialog">
			<BasePanel class="member-modal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
				<template #header>
					<div>
					<p class="member-modal__eyebrow">PROJECT ACCESS</p>
					<h2 id="member-modal-title">Add a team member</h2>
				</div>
				<button class="member-modal__close" type="button" aria-label="Close dialog" @click="closeMemberDialog">×</button>
				</template>
				<form id="member-form" class="member-form" @submit.prevent="addMember">
					<p>Grant a team member access to {{ selectedProject?.name }}.</p>
					<p v-if="availableMembers.length === 0" class="member-form__hint">All demo team members already have access to this project.</p>
					<label v-else for="member-select">Team member</label>
					<select v-if="availableMembers.length" id="member-select" v-model="selectedMemberId" required>
						<option disabled value="">Choose a team member</option>
						<option v-for="member in availableMembers" :key="member.id" :value="member.id">{{ member.name }} · Team member</option>
					</select>
					<p class="member-form__hint">Only this project manager or an administrator can change membership.</p>
				</form>
				<template #footer>
					<button class="task-modal__cancel" type="button" @click="closeMemberDialog">Cancel</button>
					<button class="task-modal__save" type="submit" form="member-form" :disabled="!selectedMemberId">Add member</button>
				</template>
			</BasePanel>
		</div>
	</main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BasePanel from './components/shared/BasePanel.vue'
import TaskBoard from './components/board/TaskBoard.vue'
import TaskCard from './components/shared/task/TaskCard.vue'
import TaskModal from './components/task/TaskModal.vue'
import ProfileSettingsModal from './components/shared/ProfileSettingsModal.vue'
import { demoUsers, projects, useAuth } from './composables/useAuth.js'
import { useSearch } from './composables/useSearch.js'
import { useTasks } from './composables/useTasks.js'

const statuses = [
	{ status: 'todo', title: 'To do' },
	{ status: 'in-progress', title: 'In progress' },
	{ status: 'review', title: 'Need review' },
	{ status: 'done', title: 'Done' }
]

	const { tasks, addTask, updateTask, findTask, changeStatus, deleteTask: removeTask } = useTasks([
	{ id: 101, projectId: 'piper-enterprise', title: 'Wireframing', description: 'Create low-fidelity layouts for the key product screens.', category: 'UX stages', status: 'todo', assigneeIds: ['manager-putri', 'member-alya'], assignees: ['Putri', 'Alya'], dueDate: 'Oct 24' },
	{ id: 102, projectId: 'piper-enterprise', title: 'First design concept', description: 'Explore the visual direction for the first release.', category: 'Design', status: 'todo', assigneeIds: ['manager-putri'], assignees: ['Putri'] },
	{ id: 103, projectId: 'piper-enterprise', title: 'Customer journey mapping', description: 'Document customer touchpoints and key product paths.', category: 'UX stages', status: 'in-progress', assigneeIds: ['member-rafi', 'member-alya'], assignees: ['Rafi', 'Alya'], priority: 'urgent' },
	{ id: 104, projectId: 'piper-enterprise', title: 'Persona development', description: 'Build a shared view of the audience and their needs.', category: 'UX stages', status: 'in-progress', assigneeIds: ['manager-putri'], assignees: ['Putri'] },
	{ id: 105, projectId: 'piper-enterprise', title: 'Competitor research', description: 'Compare product patterns and identify opportunities.', category: 'UX stages', status: 'review', assigneeIds: ['member-rafi', 'member-nadia'], assignees: ['Rafi', 'Nadia'] },
	{ id: 106, projectId: 'piper-enterprise', title: 'Branding, visual identity', description: 'Create the visual identity and core brand guidelines.', category: 'Branding', status: 'done', assigneeIds: ['member-nadia'], assignees: ['Nadia'], dueDate: 'Oct 18' },
	{ id: 107, projectId: 'piper-enterprise', title: 'Marketing materials', description: 'Prepare launch assets for the website and social channels.', category: 'Branding', status: 'done', assigneeIds: ['manager-putri', 'member-nadia'], assignees: ['Putri', 'Nadia'] },
	{ id: 201, projectId: 'website-redesign', title: 'Audit current pages', description: 'Review existing content and identify outdated pages.', category: 'Planning', status: 'todo', assigneeIds: ['member-alya'], assignees: ['Alya'] },
	{ id: 202, projectId: 'website-redesign', title: 'Update design system', description: 'Align shared page components with the new brand.', category: 'Design', status: 'in-progress', assigneeIds: ['manager-putri'], assignees: ['Putri'] },
	{ id: 301, projectId: 'mobile-app', title: 'Map onboarding flow', description: 'Outline a concise first-run experience.', category: 'Product', status: 'todo', assigneeIds: ['member-rafi'], assignees: ['Rafi'] },
	{ id: 401, projectId: 'erp-development', title: 'Inventory workflow', description: 'Document the stock receiving and issue flow.', category: 'Operations', status: 'review', assigneeIds: ['member-nadia'], assignees: ['Nadia'] }
])

	const { currentUser, accessibleProjects, canAccessProject, canManageProject, addProjectMember, updateProfile, logout } = useAuth()
	const route = useRoute()
	const router = useRouter()
	const roleLabels = { admin: 'Administrator', 'project-manager': 'Project Manager', 'team-member': 'Team Member' }
	const selectedProject = computed(() => projects.value.find(project => project.id === route.params.projectId))
	const projectOwner = computed(() => demoUsers.find(user => user.id === selectedProject.value?.ownerId))
	const projectTeam = computed(() => demoUsers.filter(user => selectedProject.value?.memberIds.includes(user.id)))
	const canManageCurrentProject = computed(() => canManageProject(route.params.projectId))
	const filteredProjectTasks = computed(() => tasks.value.filter(task => task.projectId === route.params.projectId))
	const { query, filteredItems: filteredTasks } = useSearch(filteredProjectTasks, task =>
	[task.title, task.description, task.category].filter(Boolean).join(' ')
)

const boardColumns = computed(() => statuses.map(column => ({
	...column,
	tasks: filteredTasks.value.filter(task => task.status === column.status)
})))
const completedTasks = computed(() => filteredProjectTasks.value.filter(task => task.status === 'done').length)
const progress = computed(() => filteredProjectTasks.value.length ? Math.round(completedTasks.value / filteredProjectTasks.value.length * 100) : 0)
const isModalOpen = ref(false)
const selectedTask = ref(null)
const modalStatus = ref('todo')
	const profileMenuOpen = ref(false)
	const isProfileSettingsOpen = ref(false)
	const isMemberModalOpen = ref(false)
	const selectedMemberId = ref('')
	const notice = ref('')
	const availableMembers = computed(() => demoUsers.filter(user =>
		user.role === 'team-member' && !selectedProject.value?.memberIds.includes(user.id)
	))

function openCreateTask(status = 'todo') {
	if (!canManageCurrentProject.value || !canAccessProject(route.params.projectId)) return
	selectedTask.value = null
	modalStatus.value = status
	isModalOpen.value = true
}

function openTask(task) {
	const foundTask = findTask(task.id)
	if (!foundTask || foundTask.projectId !== route.params.projectId || !canAccessProject(foundTask.projectId)) return
	selectedTask.value = foundTask
	modalStatus.value = selectedTask.value?.status ?? 'todo'
	isModalOpen.value = true
}

function saveTask(payload) {
	if (!canManageCurrentProject.value || !canAccessProject(route.params.projectId)) return
	if (payload.id) {
		const existingTask = findTask(payload.id)
		if (!existingTask || existingTask.projectId !== route.params.projectId) return
		updateTask(payload.id, payload)
	} else {
		addTask({
			...payload,
			projectId: route.params.projectId,
			creatorId: currentUser.value.id,
			assigneeIds: [currentUser.value.id],
			assignees: [currentUser.value.name],
			status: payload.status || modalStatus.value
		})
	}
	isModalOpen.value = false
}

function canChangeTaskStatus(task) {
	if (!currentUser.value || task.projectId !== route.params.projectId || !canAccessProject(task.projectId)) return false
	return canManageCurrentProject.value || task.assigneeIds?.includes(currentUser.value.id) === true
}

function changeTaskStatus(payload) {
	const task = findTask(payload.taskId)
	if (!task || !canChangeTaskStatus(task)) return
	changeStatus(payload)
}

function deleteTask(taskId) {
	const task = findTask(taskId)
	if (!task || task.projectId !== route.params.projectId || !canManageCurrentProject.value) return
	removeTask(taskId)
}

function openMemberDialog() {
	if (!canManageCurrentProject.value) return
	selectedMemberId.value = availableMembers.value[0]?.id ?? ''
	isMemberModalOpen.value = true
}

function addMember() {
	if (!canManageCurrentProject.value || !selectedMemberId.value) return
	const added = addProjectMember(route.params.projectId, selectedMemberId.value)
	notice.value = added ? 'Team member added to this project.' : 'Unable to update project membership.'
	if (added) isMemberModalOpen.value = false
}

function closeMemberDialog() {
	isMemberModalOpen.value = false
	selectedMemberId.value = ''
}

function openProfileSettings() {
	profileMenuOpen.value = false
	isProfileSettingsOpen.value = true
}

function saveProfile(profile) {
	const result = updateProfile(profile)
	if (!result.ok) {
		notice.value = result.reason === 'email-in-use'
			? 'That email address is already used by another demo account.'
			: 'Check the profile name and email address, then try again.'
		return
	}

	isProfileSettingsOpen.value = false
	notice.value = 'Profile settings saved.'
}

function switchAccount() {
	logout()
	profileMenuOpen.value = false
	router.push({ name: 'login' })
}

function signOut() {
	logout()
	router.replace({ name: 'login' })
}

function switchProject(event) {
	const projectId = event.target.value
	if (canAccessProject(projectId)) router.push({ name: 'project', params: { projectId } })
}
</script>

<style>
:root {
	font-family: "DM Sans", sans-serif;
	color: #252e43;
	background: #f6f7f9;
	font-synthesis: none;
	text-rendering: optimizeLegibility;
	font-optical-sizing: auto;
	--ink: #252e43;
	--muted: #7a8290;
	--line: #e5e8ed;
	--green: #167b69;
	--navy: #202943;
	--coral: #e85e78;
}

* { box-sizing: border-box; }

body {
	min-width: 320px;
	min-height: 100vh;
	margin: 0;
}

button, input, textarea, select { font: inherit; }

h1, h2, h3, .brand, .sidebar__org strong, .task-card__title, .board-column__heading h2 {
	font-family: "Manrope", "DM Sans", sans-serif;
}

button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
	outline: 2px solid #4e70c8;
	outline-offset: 2px;
}

.project-flow { min-height: 100vh; }

.topbar {
	position: sticky;
	z-index: 5;
	top: 0;
	display: flex;
	height: 68px;
	align-items: center;
	gap: 30px;
	padding: 0 30px;
	border-bottom: 1px solid var(--line);
	background: #fff;
}

.brand {
	display: flex;
	flex: 0 0 205px;
	align-items: center;
	gap: 10px;
	color: var(--navy);
	font-size: 17px;
	font-weight: 800;
	text-decoration: none;
}

.brand__mark {
	display: grid;
	width: 31px;
	height: 31px;
	place-items: center;
	border-radius: 8px;
	background: var(--green);
	color: #fff;
	font-size: 17px;
}

.topbar__workspace {
	display: grid;
	gap: 2px;
	color: #30394b;
	font-size: 13px;
	font-weight: 700;
	white-space: nowrap;
}

.topbar__workspace span { color: #9aa1ad; font-size: 10px; font-weight: 500; }

.search-box {
	display: flex;
	width: min(390px, 35vw);
	height: 38px;
	align-items: center;
	gap: 9px;
	margin-left: auto;
	padding: 0 10px;
	border: 1px solid #e5e8ed;
	border-radius: 6px;
	background: #fafbfc;
	color: #8c94a0;
}

.search-box svg { width: 16px; flex: 0 0 16px; fill: none; stroke: currentColor; stroke-width: 1.8; }
.search-box input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 12px; }
.search-box input::placeholder { color: #9aa1ad; }
.search-box kbd { flex: 0 0 auto; padding: 2px 4px; border: 1px solid #e3e6eb; border-radius: 3px; color: #949ba6; font-size: 9px; }

.topbar__profile { display: flex; align-items: center; gap: 9px; color: #4a5361; font-size: 12px; font-weight: 700; white-space: nowrap; }
.topbar__avatar { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 50%; background: #f5dfe6; color: #98405c; font-size: 10px; }

.workspace { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: calc(100vh - 68px); }

.sidebar { position: relative; display: flex; flex-direction: column; gap: 7px; padding: 26px 15px; border-right: 1px solid var(--line); background: #fff; }
.sidebar__label { margin: 5px 8px 7px; color: #858e9a; font-size: 10px; font-weight: 700; }

.sidebar__item, .sidebar__project {
	display: flex;
	min-height: 37px;
	align-items: center;
	gap: 10px;
	padding: 0 9px;
	border: 0;
	border-radius: 5px;
	background: transparent;
	color: #687180;
	font: inherit;
	font-size: 12px;
	text-align: left;
	text-decoration: none;
	cursor: pointer;
}

.sidebar__item span { width: 17px; color: #808996; font-size: 16px; text-align: center; }
.sidebar__item[aria-current="page"] { background: #eaf4f1; color: #146f60; font-weight: 700; }
.sidebar__item[aria-current="page"] span { color: #167b69; }
.sidebar__divider { height: 1px; margin: 13px 8px; background: #edf0f3; }
.sidebar__project:hover { background: #f6f7f9; }
.project-dot { width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; background: #17816c; }
.project-dot--coral { background: #e87187; }
.project-dot--blue { background: #5383c4; }

.sidebar__bottom { display: flex; align-items: center; gap: 9px; margin: auto 2px 0; padding: 13px 9px; border-top: 1px solid #edf0f3; }
.sidebar__help { display: grid; width: 27px; height: 27px; place-items: center; border-radius: 50%; background: #edf0f5; color: #5f6978; font-size: 12px; font-weight: 700; }
.sidebar__bottom strong, .sidebar__bottom small { display: block; }
.sidebar__bottom strong { color: #505969; font-size: 10px; }
.sidebar__bottom small { margin-top: 3px; color: #9299a5; font-size: 9px; }

.main-content { width: 100%; min-width: 0; max-width: 1680px; margin: 0 auto; padding: 25px 32px 18px; }
.breadcrumb { display: flex; align-items: center; gap: 9px; color: #828b98; font-size: 12px; }
.breadcrumb strong { color: #5c6573; font-weight: 700; }

.project-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 24px 0 21px; }
.eyebrow { margin: 0 0 7px; color: var(--green); font-size: 10px; font-weight: 700; }
.project-heading h1 { margin: 0; color: var(--navy); font-size: 27px; font-weight: 700; line-height: 1.2; }
.project-heading__sub { margin: 6px 0 0; color: #737d8b; font-size: 13px; }

.button { display: inline-flex; min-height: 37px; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border: 1px solid transparent; border-radius: 5px; font: inherit; font-size: 11px; font-weight: 700; white-space: nowrap; cursor: pointer; }
.button--primary { background: var(--green); color: #fff; }
.button--primary:hover { background: #106d5d; }
.button--primary span, .button--quiet span { font-size: 17px; line-height: 10px; }

.summary-panel { margin-bottom: 23px; }
.summary-panel :deep(.base-panel__header) { padding: 12px 15px 8px; border-bottom: 0; }
.summary-panel :deep(.base-panel__body) { padding: 2px 15px 10px; }
.summary-panel :deep(.base-panel__footer) { padding: 8px 15px; color: #858d99; font-size: 10px; }
.summary-panel__title { display: flex; align-items: center; gap: 8px; color: #414b5c; font-size: 11px; }
.summary-panel__icon { display: grid; width: 23px; height: 23px; place-items: center; border-radius: 5px; background: #eaf4f1; color: var(--green); font-size: 14px; }
.summary-panel__percent { color: #7b8491; font-size: 10px; }
.progress-track { height: 5px; overflow: hidden; border-radius: 4px; background: #edf0f3; }
.progress-track span { display: block; height: 100%; border-radius: inherit; background: #27977e; transition: width 180ms ease; }

.board-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 0 0 13px; border-bottom: 1px solid #e3e7ed; }
.view-tabs, .board-toolbar__right { display: flex; align-items: center; gap: 8px; }
.view-tabs__tab { display: inline-flex; min-height: 38px; align-items: center; gap: 7px; padding: 0 11px; border: 0; border-bottom: 2px solid transparent; background: transparent; color: #818997; font: inherit; font-size: 11px; }
.view-tabs__tab--active { border-bottom-color: var(--green); color: var(--green); font-weight: 700; }
.view-tabs__tab:disabled { cursor: default; }
.task-total { color: #8b929e; font-size: 10px; }
.button--quiet { min-height: 31px; padding: 0 9px; border-color: #e2e6ec; background: #fff; color: #566171; }
.button--quiet:hover { background: #f7f8fa; }
.task-card__due { display: block; margin-top: 10px; color: #858d99; font-size: 10px; }
.search-empty { margin-top: 12px; padding: 13px 15px; border: 1px dashed #d9dee6; border-radius: 6px; color: #6e7785; font-size: 12px; text-align: center; }
.board-footnote { margin: 17px 0 0; color: #969da8; font-size: 10px; text-align: right; }
.board-footnote span { padding: 0 4px; color: #2e9a82; }

.topbar { gap: 21px; }
.topbar__workspace { min-width: 145px; max-width: 210px; overflow: hidden; text-overflow: ellipsis; }
.topbar__workspace-kicker { color: #858e9a !important; font-size: 9px !important; font-weight: 700 !important; }
.profile-menu-wrap { position: relative; flex: 0 0 auto; }
.topbar__profile { padding: 0; border: 0; background: transparent; cursor: pointer; }
.topbar__profile-copy { display: grid; gap: 3px; text-align: left; }
.topbar__profile-copy strong { color: #394456; font-size: 11px; }
.topbar__profile-copy small { color: #89919e; font-size: 9px; font-weight: 500; }
.profile-chevron { color: #8c94a0; font-size: 15px; }
.profile-menu { position: absolute; z-index: 12; top: calc(100% + 12px); right: 0; width: 225px; padding: 8px; border: 1px solid #e4e8ed; border-radius: 7px; background: #fff; box-shadow: 0 14px 35px rgb(29 40 60 / 14%); }
.profile-menu p { margin: 5px 7px 9px; color: #848d99; font-size: 9px; line-height: 1.5; overflow-wrap: anywhere; }
.profile-menu p strong { display: block; color: #414b5b; font-size: 10px; }
.profile-menu button { width: 100%; padding: 9px 8px; border: 0; border-radius: 4px; background: #fff; color: #596373; font: inherit; font-size: 10px; text-align: left; cursor: pointer; }
.profile-menu button:hover { background: #f3f6f5; color: #167b69; }
.button--invite { min-height: 34px; padding: 0 11px; background: #202943; color: #fff; }
.button--invite:hover { background: #303d5b; }
.button--invite span { font-size: 16px; }

.sidebar { gap: 5px; padding: 18px 12px 13px; }
.sidebar__org { display: flex; align-items: center; gap: 9px; margin: 0 1px 20px; padding: 8px 6px; }
.sidebar__org-mark { display: grid; width: 30px; height: 30px; flex: 0 0 30px; place-items: center; border-radius: 7px; background: #202943; color: #fff; font-size: 15px; font-weight: 800; }
.sidebar__org > span:nth-child(2) { display: grid; min-width: 0; gap: 3px; }
.sidebar__org strong { overflow: hidden; color: #30394b; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.sidebar__org small { color: #818b98; font-size: 10px; }
.sidebar__org-menu { margin-left: auto; color: #8a929f; }
.sidebar__section-heading { display: flex; align-items: center; justify-content: space-between; padding-right: 7px; }
.sidebar__section-heading .sidebar__label { margin-bottom: 6px; }
.sidebar__section-heading > span { color: #959daa; font-size: 9px; }
.sidebar__project { min-width: 0; }
.sidebar__project--active { background: #edf4f2; color: #196c5d; font-weight: 700; }
.sidebar__project-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-dot--gold { background: #d7a536; }
.sidebar__member { display: flex; min-width: 0; align-items: center; gap: 8px; padding: 6px 7px; }
.sidebar__member-avatar { display: grid; width: 27px; height: 27px; flex: 0 0 27px; place-items: center; border-radius: 50%; background: #e5edf7; color: #466b9b; font-size: 8px; font-weight: 800; }
.sidebar__member:nth-of-type(odd) .sidebar__member-avatar { background: #f7e7ec; color: #9a4b64; }
.sidebar__member-copy { display: grid; min-width: 0; gap: 3px; }
.sidebar__member-copy strong { overflow: hidden; color: #4b5564; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.sidebar__member-copy small { color: #858e9a; font-size: 9px; }
.presence-dot { width: 7px; height: 7px; flex: 0 0 7px; margin-left: auto; border-radius: 50%; background: #39a783; }
.sidebar__bottom { margin-top: auto; }

.role-chip { margin-left: auto; padding: 4px 7px; border-radius: 4px; background: #edf0f5; color: #586276; font-size: 9px; font-weight: 700; text-transform: uppercase; }
.project-switcher { display: none; min-width: 0; max-width: 170px; padding: 6px 7px; border: 1px solid #e1e6eb; border-radius: 4px; background: #fff; color: #465163; font-size: 10px; }
.project-heading__actions { display: flex; align-items: center; gap: 11px; }
.member-stack { display: flex; align-items: center; padding-left: 6px; }
.member-stack__avatar, .member-stack__more { display: grid; width: 29px; height: 29px; flex: 0 0 29px; margin-left: -6px; place-items: center; border: 2px solid #fff; border-radius: 50%; background: #dceaf8; color: #426b9b; font-size: 8px; font-weight: 800; }
.member-stack__avatar:nth-child(2n) { background: #f6e3e9; color: #984c63; }
.member-stack__more { background: #f1f3f6; color: #616b7b; }
.button--member-invite { width: 32px; min-height: 32px; padding: 0; border-color: #dfe4e9; background: #fff; color: #4c5969; font-size: 19px; }
.button--member-invite { display: none; }
.button--member-invite:hover { border-color: #167b69; color: #167b69; }
.board-view-pill { display: inline-flex; min-height: 30px; align-items: center; gap: 6px; padding: 0 10px; border-radius: 4px; background: #eaf1f8; color: #41678f; font-size: 10px; font-weight: 700; }
.access-notice { margin: 0 0 11px; padding: 9px 12px; border: 1px solid #cce4d8; border-radius: 5px; background: #eff8f2; color: #24745c; font-size: 11px; }
.task-card__status-pill { padding: 5px 7px; border-radius: 4px; background: #f0f2f5; color: #626d7b; font-size: 9px; font-weight: 700; }

.member-modal-backdrop { position: fixed; z-index: 22; inset: 0; display: grid; place-items: center; padding: 18px; background: rgb(24 32 49 / 48%); }
.member-modal { width: min(100%, 440px); box-shadow: 0 22px 60px rgb(22 29 48 / 24%); }
.member-modal__eyebrow { margin: 0 0 4px; color: #167b69; font-size: 9px; font-weight: 800; }
.member-modal h2 { margin: 0; color: #202943; font-size: 17px; }
.member-modal__close { width: 31px; height: 31px; border: 0; border-radius: 5px; background: transparent; color: #737c89; font-size: 23px; cursor: pointer; }
.member-form { display: grid; gap: 9px; }
.member-form p { margin: 0 0 3px; color: #707987; font-size: 11px; line-height: 1.5; }
.member-form label { color: #454f5e; font-size: 10px; font-weight: 700; }
.member-form select { width: 100%; min-height: 39px; padding: 0 10px; border: 1px solid #dfe4eb; border-radius: 5px; background: #fff; color: #30394a; font-size: 11px; }
.member-form .member-form__hint { margin-top: 3px; color: #9098a4; font-size: 9px; }

@media (max-width: 900px) {
	.topbar { gap: 12px; }
	.topbar__workspace { display: none; }
	.button--invite { display: none; }
	.button--member-invite { display: inline-flex; }
	.sidebar { display: none; }
	.workspace { display: block; }
	.main-content { padding: 22px 20px; }
	.project-switcher { display: block; margin-left: auto; }
}

@media (max-width: 900px) {
	.topbar { gap: 18px; padding: 0 18px; }
	.brand { flex-basis: auto; }
	.topbar__workspace, .sidebar { display: none; }
	.workspace { display: block; }
	.main-content { padding: 22px 20px; }
}

@media (max-width: 620px) {
	.topbar { height: 60px; gap: 12px; padding: 0 13px; }
	.brand { gap: 7px; font-size: 14px; }
	.brand__mark { width: 28px; height: 28px; }
	.search-box { width: auto; flex: 1; height: 35px; }
	.search-box kbd, .topbar__profile-copy, .profile-chevron { display: none; }
	.topbar__avatar { width: 28px; height: 28px; }
	.main-content { padding: 18px 13px; }
	.project-heading { align-items: flex-start; margin: 20px 0 16px; }
	.project-heading__actions { gap: 6px; }
	.project-heading h1 { font-size: 21px; }
	.project-heading__sub { max-width: 230px; line-height: 1.45; }
	.button--primary { min-height: 34px; padding: 0 9px; font-size: 10px; }
	.button--member-invite { width: 28px; min-height: 28px; }
	.summary-panel { margin-bottom: 17px; }
	.board-toolbar { margin-bottom: 10px; }
	.view-tabs__tab { padding: 0 7px; }
	.task-total { display: none; }
	.board-footnote { text-align: left; }
	.role-chip { display: none; }
	.project-switcher { max-width: 145px; }
}
</style>
