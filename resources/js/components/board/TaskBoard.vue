<template>
	<section class="task-board" aria-label="Project task board">
		<BoardColumn
			v-for="column in columns"
			:key="column.status"
			:column="column"
			:can-add-task="canAddTask"
			@add-task="emit('add-task', $event)"
		>
			<template #task="{ task }">
				<slot name="task" :task="task" :status="column.status">
					<article class="task-board__fallback-task">
						<h3>{{ task.title }}</h3>
						<p>{{ task.description }}</p>
					</article>
				</slot>
			</template>
		</BoardColumn>
	</section>
</template>

<script setup>
import BoardColumn from './BoardColumn.vue'

defineProps({
	columns: {
		type: Array,
		required: true,
		validator: columns => columns.every(column =>
			column && typeof column.status === 'string' && Array.isArray(column.tasks)
		)
	},
	canAddTask: { type: Boolean, default: true }
})

const emit = defineEmits({
	'add-task': status => typeof status === 'string'
})
</script>

<style scoped>
.task-board {
	display: grid;
	width: 100%;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 16px;
	align-items: start;
	min-width: 0;
}

.task-board__fallback-task {
	padding: 14px;
	border: 1px solid #e4e7ed;
	border-radius: 8px;
	background: #fff;
}

.task-board__fallback-task h3,
.task-board__fallback-task p {
	margin: 0;
}

.task-board__fallback-task p {
	margin-top: 8px;
	color: #6b7280;
	font-size: 13px;
}

@media (max-width: 1100px) {
	.task-board {
		grid-template-columns: repeat(2, minmax(245px, 1fr));
	}
}

@media (max-width: 620px) {
	.task-board {
		grid-template-columns: minmax(0, 1fr);
	}
}
</style>