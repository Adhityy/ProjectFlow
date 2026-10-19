import { computed, ref, unref } from 'vue'

export function useSearch(items, getText = item => item?.title ?? '') {
	const query = ref('')
	const filteredItems = computed(() => {
		const source = typeof items === 'function' ? items() : unref(items)
		const normalizedQuery = query.value.trim().toLowerCase()

		if (!normalizedQuery) return source ?? []

		return (source ?? []).filter(item =>
			String(getText(item) ?? '').toLowerCase().includes(normalizedQuery)
		)
	})

	return { query, filteredItems }
}
