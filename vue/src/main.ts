import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import axios from './axios';
import emitter from './eventBus';
import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { createPinia } from 'pinia';
LicenseManager.setLicenseKey(
  '[v228]__MTUwNDA0NzYwMDAwMA==b6ad7a19dbec1f3b7ba7f0245269f807',
);
loadFonts();

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.use(createPinia());
app.config.globalProperties.$http = axios;
app.config.globalProperties.$emitter = emitter;

app.mount('#app');

export default app;
