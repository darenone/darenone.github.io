import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/i18n'
import '@/assets/js/elementui'
import '@/assets/css/index.scss'
import 'view-design/dist/styles/iview.css'
import './assets/css/font-icon/iconfont.css'
import { Split } from 'view-design'
import config from '@/config'
import '@/service/axios'
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  require('./mock/index') // 生产和开发环境都引入mock
}

Vue.config.productionTip = false
Vue.prototype.$config = config
Vue.component('ISplit', Split)
new Vue({
  i18n,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
