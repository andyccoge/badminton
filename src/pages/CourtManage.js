import { createApp } from 'vue'
import CourtManage from './CourtManage.vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../pwa.js';

const app = createApp(CourtManage);

const options = {
  timeout: 3000,
  // maxToasts: 5,
};
app.use(Toast, options);
app.use(VueSweetalert2);
app.mount('#app');
