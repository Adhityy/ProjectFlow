import { computed, ref } from 'vue'

const validStatuses = new Set(['todo', 'in-progress', 'review', 'done'])

export function useTasks(initialTasks = []) {
	const tasks = ref(initialTasks.map(task => ({ ...task })))
	const totalTasks = computed(() => tasks.value.length)

	function addTask(task) {
		const id = Date.now()
		const newTask = {
			...task,
			id: tasks.value.some(item => item.id === id) ? id + 1 : id,
			status: validStatuses.has(task.status) ? task.status : 'todo'
		}

		tasks.value.push(newTask)
		return newTask
	}

	function findTask(id) {
		return tasks.value.find(task => task.id === id)
	}

	function updateTask(id, updates) {
		const task = findTask(id)
		if (!task) return false

		Object.assign(task, updates, { id })
		if (!validStatuses.has(task.status)) task.status = 'todo'
		return true
	}

	function changeStatus({ taskId, to }) {
		if (!validStatuses.has(to)) return false
		return updateTask(taskId, { status: to })
	}

	function deleteTask(id) {
		const index = tasks.value.findIndex(task => task.id === id)
		if (index === -1) return false

		tasks.value.splice(index, 1)
		return true
	}

	return { tasks, totalTasks, addTask, findTask, updateTask, changeStatus, deleteTask }
}
