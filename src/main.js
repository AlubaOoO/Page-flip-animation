import { createApp } from 'vue'
import App from './App.vue'

// Don't import jQuery since we're loading it from CDN
// The global jQuery and $ are already available in the window object

createApp(App).mount('#app')
