import { createApp } from "vue";
import App from "./App.vue";
import { createI18n } from "vue-i18n";
import ECharts from "vue-echarts";
import en from "./locales/en.json";

const app = createApp(App);

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  messages: { en },
});

app.use(i18n);
app.component("v-chart", ECharts);

app.mount("#app");
