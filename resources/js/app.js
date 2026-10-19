import { createApp } from 'vue'
import App from './AppRoot.vue'
import router from './router/index.js'

createApp(App).use(router).mount('#app')
