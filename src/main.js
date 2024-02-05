import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/js/elementui'
import '@/assets/css/index.scss'
import 'view-design/dist/styles/iview.css'
import { Split } from 'view-design'

Vue.config.productionTip = false
Vue.component('ISplit', Split)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
