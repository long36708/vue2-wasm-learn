import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import App from "./App.vue";
import router from "./router";
import "@/plugins";
import "./assets/main.css";

Vue.use(PiniaVuePlugin);
Vue.use(VueQueryPlugin);
new Vue({
  router,
  pinia: createPinia(),
  render: (h) => h(App),
}).$mount("#app");
