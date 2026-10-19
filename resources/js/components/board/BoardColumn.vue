<template>
  <section class="board-column" :class="`board-column--${column.status}`">
    <header class="board-column__header">
      <div class="board-column__heading">
        <span class="board-column__dot" aria-hidden="true"></span>
        <h2>{{ column.title }}</h2>
        <span class="board-column__count">{{ column.tasks.length }}</span>
      </div>
      <button
        v-if="canAddTask"
        class="board-column__add"
        type="button"
        :aria-label="`Add task to ${column.title}`"
        title="Add task"
        @click="emit('add-task', column.status)"
      >
        <span aria-hidden="true">+</span>
      </button>
    </header>

      <button v-if="canAddTask" class="board-column__quick-add" type="button" @click="emit('add-task', column.status)">
      <span aria-hidden="true">+</span> Add task
    </button>

    <div class="board-column__tasks">
      <article v-for="task in column.tasks" :key="task.id" class="board-column__task">
        <slot name="task" :task="task">
          <h3>{{ task.title }}</h3>
          <p v-if="task.description">{{ task.description }}</p>
        </slot>
      </article>
      <div v-if="column.tasks.length === 0" class="board-column__empty">
        <slot name="empty">Nothing here yet</slot>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  column: {
    type: Object,
    required: true,
    validator: column =>
      column && typeof column.status === 'string' &&
      typeof column.title === 'string' && Array.isArray(column.tasks)
  },
  canAddTask: { type: Boolean, default: true }
})

const emit = defineEmits({
  'add-task': status => ['todo', 'in-progress', 'review', 'done'].includes(status)
})
</script>

<style scoped>
.board-column {
  min-width: 0;
  padding: 13px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f5f7fa;
}

.board-column__header,
.board-column__heading {
  display: flex;
  align-items: center;
}

.board-column__header {
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
}

.board-column__heading {
  min-width: 0;
  gap: 8px;
}

.board-column__heading h2 {
  margin: 0;
  color: #283148;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.3;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.board-column__dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e78a72;
}

.board-column--in-progress .board-column__dot {
  background: #5365c9;
}

.board-column--review .board-column__dot {
  background: #d7a62b;
}

.board-column--done .board-column__dot {
  background: #27977e;
}

.board-column__count {
  display: grid;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  place-items: center;
  border-radius: 11px;
  background: #e9edf2;
  color: #657080;
  font-size: 10px;
  font-weight: 700;
}

.board-column__add {
  display: grid;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #626e7d;
  font-size: 21px;
  line-height: 1;
  cursor: pointer;
}

.board-column__add:hover,
.board-column__quick-add:hover {
  background: #e9edf3;
  color: #4846c8;
}

.board-column__quick-add {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 7px;
  margin: 8px 0 12px;
  padding: 8px 9px;
  border: 1px dashed #d8dde6;
  border-radius: 5px;
  background: transparent;
  color: #6c7584;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.board-column__quick-add span {
  font-size: 16px;
  line-height: 12px;
}

.board-column__tasks {
  display: grid;
  gap: 10px;
  min-height: 100px;
}

.board-column__task {
  min-width: 0;
}

.board-column__empty {
  display: grid;
  min-height: 78px;
  place-items: center;
  border: 1px dashed #dce1e8;
  border-radius: 6px;
  color: #9299a5;
  font-size: 12px;
}

.board-column__task :deep(.task-card) {
  width: 100%;
}
</style>