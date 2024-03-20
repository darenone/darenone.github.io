import Vue from 'vue'
import VueRouter from 'vue-router'
import layout from '@/components/element-layout/layout-top.vue'

Vue.use(VueRouter)
/** 路由组件 */
const ROUTE_COMP = {
  template:
    '<div class="h-100"><transition name="move" mode="out-in"><router-view/></transition></div>'
}

const routes = [
  // {
  //   path: '/login',
  //   name: 'login',
  //   component: () => import('@/views/main/Login')
  // },
  {
    path: '',
    component: layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'home', // 首页（一级路由）
        component: () => import('@/views/home/'),
        meta: {
          title: '首页',
          icon: 'el-icon-s-home'
        }
      },
      {
        path: '/network',
        name: 'network',
        component: ROUTE_COMP,
        meta: {
          title: '拓扑图',
          icon: 'el-icon-s-grid'
        },
        children: [
          {
            path: 'antv-g6', // 拓扑展示（一级路由）
            name: 'antvG6',
            component: () => import('@/views/antv-g6/'),
            meta: {
              title: '关系图-G6',
              icon: 'el-icon-s-grid'
            }
          },
          {
            path: 'vis', // 拓扑展示（一级路由）
            name: 'vis',
            component: () => import('@/views/vis-network/'),
            meta: {
              title: '拓扑图-vis',
              icon: 'el-icon-menu'
            }
          }
        ]
      }
      // {
      //   path: '',
      //   name: 'realTimeMonitor', // 查询统计（二级嵌套路由的一级）
      //   component: ROUTE_COMP,
      //   children: [
      //     {
      //       path: '/afs/alarm/realtime', // 实时告警（二级路由）
      //       name: 'realtimeAlarm',
      //       component: () => import('@/views/module/afs/alarm/realtime')
      //     },
      //     {
      //       path: '/afs/device/info', // 设备状态（二级路由）
      //       name: 'deviceStatus',
      //       component: () => import('@/views/module/afs/device/info')
      //     }
      //   ]
      // },
      // {
      //   path: '',
      //   name: 'networkService', // 组网业务（三级嵌套路由的一级）
      //   component: ROUTE_COMP,
      //   children: [
      //     {
      //       path: '',
      //       name: 'serviceManage', // 业务管理（三级嵌套路由的二级）
      //       component: ROUTE_COMP,
      //       children: [
      //         {
      //           path: '/route/biz/route', // 路由配置（三级路由）
      //           name: 'routeConfig',
      //           component: () => import('@/views/module/route/biz/route')
      //         },
      //         {
      //           path: '/route/biz/open', // 智能开通（三级路由）
      //           name: 'serviceConfig',
      //           component: () => import('@/views/module/route/biz/open')
      //         }
      //       ]
      //     },
      //     {
      //       path: '',
      //       name: 'OTDRTest', // 链路测试
      //       component: ROUTE_COMP,
      //       children: [
      //         {
      //           path: '/route/otdr/manual', // 手动测试
      //           name: 'manualTest',
      //           component: () => import('@/views/module/route/otdr/manual')
      //         },
      //         {
      //           path: '/route/otdr/timetest', // 例行测试
      //           name: 'timeTest',
      //           component: () => import('@/views/module/route/otdr/timetest')
      //         }
      //       ]
      //     }
      //   ]
      // }
    ]
  }
]

const createRouter = (routes) => new VueRouter({
  routes
})

// 白名单，免登录验证
const whitelist = ['login', 'error401', 'error500', 'notFound', 'compatible', 'notLogin', '404', 'abnormal']

let app
const router = createRouter(routes)
router.beforeEach((to, from, next) => {
  // const isLogin = !!sessionStorage.getItem('accessToken');
  const isLogin = true

  if (isLogin) {
    if (to.name === 'login') {
      next({
        name: 'home'
      })
    } else {
      next()
    }
  } else {
    if (whitelist.indexOf(to.name) !== -1) {
      next()
    } else {
      next({
        name: 'login'
      })
    }
  }
})

// 添加tabs
router.beforeEach((to, from, next) => {
  // console.log(to, from)
  if (to.name === 'ERROR404') {
    next()
  } else {
    if (to.name && to.path) {
      // const item = {
      //   label: to.name,
      //   name: to.name,
      //   path: to.path
      // }
      // store.commit('ADD_ACTIVED_TABS', item)
    }
    next()
  }
})

router.afterEach((to, from, next) => {
  app = document.querySelector('.app-content-inner')
  app && app.scrollTo(0, 0)
})

export const resetRouter = () => {
  const newRouter = createRouter(routes)
  router.matcher = newRouter.matcher
}

export default router
