import { createApp } from 'vue'
import Index from './Index.vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
    timeout: 3000,
    // maxToasts: 5,
};
createApp(Index).use(Toast, options).mount('#app')