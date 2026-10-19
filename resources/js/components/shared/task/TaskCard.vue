<template>
	<article class="task-card" :class="[`task-card--${tone}`, { 'task-card--compact': compact }]">
		<div class="task-card__topline">
			<span class="task-card__label">{{ task.category || 'General' }}</span>
			<button v-if="canDelete" class="task-card__delete" type="button" aria-label="Delete task" title="Delete task" @click="emit('delete-task', task.id)">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
			</button>
		</div>

		<button class="task-card__title" type="button" @click="emit('open-task', task)">
			{{ task.title }}
		</button>
		<p v-if="task.description && !compact" class="task-card__description">
			{{ task.description }}
		</p>

		<div class="task-card__footer">
			<div v-if="showAssignees && task.assignees?.length" class="task-card__assignees" aria-label="Assignees">
				<span v-for="assignee in task.assignees.slice(0, 3)" :key="assignee" class="task-card__avatar">
					{{ assignee.slice(0, 1).toUpperCase() }}
				</span>
				<span v-if="task.assignees.length > 3" class="task-card__more">+{{ task.assignees.length - 3 }}</span>
			</div>
			<label v-if="canChangeStatus" class="task-card__status-label">
				<span class="sr-only">Change task status</span>
				<select :value="displayStatus" @change="changeStatus">
					<option v-for="option in statuses" :key="option.value" :value="option.value">{{ option.label }}</option>
				</select>
			</label>
			<span v-else class="task-card__status-pill">{{ statusLabels[displayStatus] }}</span>
		</div>

		<slot name="actions" :task="task" />
	</article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	task: {
		type: Object,
		required: true,
		validator: task => task && typeof task.id === 'number' && typeof task.title === 'string'
	},
	status: { type: String, default: '' },
	compact: { type: Boolean, default: false },
	showAssignees: { type: Boolean, default: true },
	canDelete: { type: Boolean, default: true },
	canChangeStatus: { type: Boolean, default: true },
	tone: {
		type: String,
		default: 'default',
		validator: value => ['default', 'urgent'].includes(value)
	}
})

const statuses = [
	{ value: 'todo', label: 'To do' },
	{ value: 'in-progress', label: 'In progress' },
	{ value: 'review', label: 'Review' },
	{ value: 'done', label: 'Done' }
]
const statusLabels = Object.fromEntries(statuses.map(status => [status.value, status.label]))
const displayStatus = computed(() => props.status || props.task.status || 'todo')

const emit = defineEmits({
	'open-task': task => typeof task?.id === 'number',
	'change-status': payload =>
		typeof payload?.taskId === 'number' &&
		typeof payload.from === 'string' &&
		['todo', 'in-progress', 'review', 'done'].includes(payload.to),
	'delete-task': taskId => typeof taskId === 'number'
})

function changeStatus(event) {
	const to = event.target.value
	emit('change-status', {
		taskId: props.task.id,
		from: displayStatus.value,
		to
	})
}
</script>

<style scoped>
.task-card {
	padding: 15px;
	border: 1px solid #e3e7ee;
	border-radius: 8px;
	background: #fff;
	box-shadow: 0 2px 5px rgb(24 34 55 / 5%);
}

.task-card--urgent {
	border-left: 3px solid #e75b78;
}

.task-card--compact {
	padding: 11px;
}

.task-card__topline,
.task-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.task-card__label {
	max-width: 75%;
	padding: 4px 8px;
	border-radius: 5px;
	background: #e8f3f1;
	color: #167b69;
	font-size: 11px;
	font-weight: 700;
	overflow-wrap: anywhere;
}

.task-card__delete {
	display: grid;
	width: 30px;
	height: 30px;
	place-items: center;
	border: 0;
	border-radius: 5px;
	background: transparent;
	color: #77808d;
	cursor: pointer;
}

.task-card__delete:hover {
	background: #fff0f3;
	color: #c53c5b;
}

.task-card__delete svg {
	width: 16px;
	fill: none;
	stroke: currentColor;
	stroke-linecap: round;
	stroke-linejoin: round;
	stroke-width: 1.7;
}

.task-card__title {
	display: block;
	width: 100%;
	margin: 10px 0 0;
	padding: 0;
	border: 0;
	background: transparent;
	color: #202844;
	font: inherit;
	font-weight: 700;
	line-height: 1.35;
	text-align: left;
	cursor: pointer;
}

.task-card__title:hover {
	color: #4e48d8;
}

.task-card__description {
	margin: 7px 0 13px;
	color: #717988;
	font-size: 13px;
	line-height: 1.5;
	overflow-wrap: anywhere;
}

.task-card__footer {
	margin-top: 13px;
}

.task-card__assignees {
	display: flex;
	align-items: center;
}

.task-card__avatar,
.task-card__more {
	display: grid;
	width: 26px;
	height: 26px;
	margin-right: -5px;
	place-items: center;
	border: 2px solid #fff;
	border-radius: 50%;
	background: #dceaf8;
	color: #356c9c;
	font-size: 10px;
	font-weight: 700;
}

.task-card__avatar:nth-child(2n) {
	background: #fce6ed;
	color: #a94361;
}

.task-card__more {
	background: #edf0f4;
	color: #626b79;
}

.task-card__status-label select {
	max-width: 116px;
	padding: 6px 8px;
	border: 1px solid #e2e6ed;
	border-radius: 5px;
	background: #f8f9fb;
	color: #485162;
	font: inherit;
	font-size: 11px;
}

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}
</style>
