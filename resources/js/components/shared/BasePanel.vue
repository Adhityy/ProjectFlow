<template>
	<section class="base-panel">
		<header v-if="$slots.header" class="base-panel__header">
			<slot name="header" />
		</header>
		<div class="base-panel__body">
			<slot />
		</div>
		<footer v-if="$slots.footer" class="base-panel__footer">
			<slot name="footer" />
		</footer>
	</section>
</template>

<style scoped>
.base-panel {
	min-width: 0;
	border: 1px solid #e2e6ed;
	border-radius: 8px;
	background: #fff;
}

.base-panel__header,
.base-panel__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 16px 18px;
}

.base-panel__header {
	border-bottom: 1px solid #edf0f4;
}

.base-panel__footer {
	justify-content: flex-end;
	border-top: 1px solid #edf0f4;
}

.base-panel__body {
	padding: 18px;
}
</style>