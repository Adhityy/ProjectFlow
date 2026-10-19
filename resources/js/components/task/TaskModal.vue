<template>
	<div v-if="modelValue" class="task-modal__backdrop" @click.self="close">
		<BasePanel class="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
			<template #header>
				<div class="task-modal__heading">
					<div>
						<p class="task-modal__eyebrow">PROJECT TASK</p>
						<h2 id="task-modal-title">{{ readonly ? 'Task details' : task ? 'Edit task' : 'Create task' }}</h2>
					</div>
					<button class="task-modal__close" type="button" aria-label="Close dialog" @click="close">×</button>
				</div>
			</template>

			<form id="task-form" class="task-modal__form" @submit.prevent="save">
				<label>
					Task name
					<input v-model.trim="form.title" :disabled="readonly" required maxlength="100" autofocus placeholder="e.g. Create wireframe" />
				</label>
				<label>
					Description
					<textarea v-model.trim="form.description" :disabled="readonly" rows="3" maxlength="500" placeholder="Add a few details" />
				</label>
				<div class="task-modal__row">
					<label>
						Category
						<input v-model.trim="form.category" :disabled="readonly" maxlength="40" placeholder="Design" />
					</label>
					<label>
						Status
						<select v-model="form.status" :disabled="readonly">
							<option v-for="option in statuses" :key="option.value" :value="option.value">{{ option.label }}</option>
						</select>
					</label>
				</div>
			</form>

			<template #footer>
				<button class="task-modal__cancel" type="button" @click="close">Cancel</button>
				<button v-if="!readonly" class="task-modal__save" type="submit" form="task-form" :disabled="!form.title">{{ task ? 'Save changes' : 'Add task' }}</button>
			</template>
		</BasePanel>
	</div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import BasePanel from '../shared/BasePanel.vue'

const props = defineProps({
	modelValue: { type: Boolean, default: false },
	task: { type: Object, default: null },
	readonly: { type: Boolean, default: false },
	initialStatus: {
		type: String,
		default: 'todo',
		validator: status => ['todo', 'in-progress', 'review', 'done'].includes(status)
	}
})

const statuses = [
	{ value: 'todo', label: 'To do' },
	{ value: 'in-progress', label: 'In progress' },
	{ value: 'review', label: 'Review' },
	{ value: 'done', label: 'Done' }
]

const form = reactive({ title: '', description: '', category: '', status: 'todo' })

const emit = defineEmits({
	'update:modelValue': value => typeof value === 'boolean',
	close: () => true,
	save: payload =>
		typeof payload?.title === 'string' && payload.title.trim().length > 0 &&
		['todo', 'in-progress', 'review', 'done'].includes(payload.status)
})

watch(
	[() => props.modelValue, () => props.task, () => props.initialStatus],
	([isOpen]) => {
		if (!isOpen) return
		form.title = props.task?.title ?? ''
		form.description = props.task?.description ?? ''
		form.category = props.task?.category ?? ''
		form.status = props.task?.status ?? props.initialStatus
	},
	{ immediate: true }
)

function close() {
	emit('update:modelValue', false)
	emit('close')
}

function save() {
	const title = form.title.trim()
	if (!title) return

	emit('save', {
		...(props.task ?? {}),
		title,
		description: form.description.trim(),
		category: form.category.trim() || 'General',
		status: form.status
	})
}
</script>

<style scoped>
.task-modal__backdrop {
	position: fixed;
	z-index: 20;
	inset: 0;
	display: grid;
	place-items: center;
	padding: 20px;
	background: rgb(22 29 48 / 48%);
}

.task-modal {
	width: min(100%, 540px);
	box-shadow: 0 24px 70px rgb(22 29 48 / 25%);
}

.task-modal__heading {
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: space-between;
}

.task-modal__eyebrow {
	margin: 0 0 4px;
	color: #788190;
	font-size: 10px;
	font-weight: 800;
}

.task-modal__heading h2 {
	margin: 0;
	color: #202844;
	font-size: 19px;
}

.task-modal__close {
	width: 34px;
	height: 34px;
	border: 0;
	border-radius: 5px;
	background: transparent;
	color: #727b89;
	font-size: 25px;
	cursor: pointer;
}

.task-modal__close:hover {
	background: #f0f2f6;
}

.task-modal__form,
.task-modal__form label {
	display: grid;
	gap: 7px;
}

.task-modal__form {
	gap: 16px;
}

.task-modal__form label {
	min-width: 0;
	color: #3e4758;
	font-size: 12px;
	font-weight: 700;
}

.task-modal__form input,
.task-modal__form textarea,
.task-modal__form select {
	width: 100%;
	min-width: 0;
	padding: 10px 11px;
	border: 1px solid #dfe4eb;
	border-radius: 5px;
	background: #fff;
	color: #273148;
	font: inherit;
	font-size: 13px;
}

.task-modal__form textarea {
	resize: vertical;
}

.task-modal__form input:focus,
.task-modal__form textarea:focus,
.task-modal__form select:focus {
	outline: 2px solid #7774e5;
	outline-offset: 1px;
}

.task-modal__row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.task-modal__cancel,
.task-modal__save {
	min-height: 38px;
	padding: 0 13px;
	border: 1px solid #dfe4eb;
	border-radius: 5px;
	font: inherit;
	font-size: 12px;
	font-weight: 700;
	cursor: pointer;
}

.task-modal__cancel {
	background: #fff;
	color: #4c5666;
}

.task-modal__save {
	border-color: #4547c8;
	background: #4547c8;
	color: #fff;
}

.task-modal__save:disabled {
	opacity: 0.55;
	cursor: not-allowed;
}

@media (max-width: 480px) {
	.task-modal__backdrop {
		padding: 10px;
	}

	.task-modal__form .task-modal__row {
		grid-template-columns: 1fr;
	}
}
</style>