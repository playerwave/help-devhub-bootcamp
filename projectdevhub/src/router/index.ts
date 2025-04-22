//แบบเก่า

// import { defineRouter } from '#q-app/wrappers'
// import {
//   createMemoryHistory,
//   createRouter,
//   createWebHashHistory,
//   createWebHistory,
// } from 'vue-router'
// import routes from './routes'
// import { useAuthStore } from 'src/stores/authStore'

// /*
//  * If not building with SSR mode, you can
//  * directly export the Router instantiation;
//  *
//  * The function below can be async too; either use
//  * async/await or return a Promise which resolves
//  * with the Router instance.
//  */

// interface CustomRouteMeta {
//   requiresAuth?: boolean
//   roles?: string[]
// }

// export default defineRouter(function (/* { store, ssrContext } */) {
//   const createHistory = process.env.SERVER
//     ? createMemoryHistory
//     : process.env.VUE_ROUTER_MODE === 'history'
//       ? createWebHistory
//       : createWebHashHistory

//   const Router = createRouter({
//     scrollBehavior: () => ({ left: 0, top: 0 }),
//     routes,

//     // Leave this as is and make changes in quasar.conf.js instead!
//     // quasar.conf.js -> build -> vueRouterMode
//     // quasar.conf.js -> build -> publicPath
//     history: createHistory(process.env.VUE_ROUTER_BASE),
//   })
//   Router.beforeEach((to) => {
//     const authStore = useAuthStore()

//     const meta = to.meta as unknown as CustomRouteMeta

//     if (meta.requiresAuth && !authStore.isLogin) {
//       return {
//         path: '/login',
//         query: { redirect: to.fullPath },
//       }
//     }

//     if (
//       meta.roles &&
//       authStore.currentUser?.role &&
//       !meta.roles.includes(authStore.currentUser.role)
//     ) {
//       return { path: '/' }
//     }
//   })

//   return Router
// })

//แบบใหม่

import { defineRouter } from '#q-app/wrappers'
import { createMemoryHistory, createRouter } from 'vue-router' // ✨ ใช้แค่ createMemoryHistory
import routes from './routes'
import { useAuthStore } from 'src/stores/authStore'

interface CustomRouteMeta {
  requiresAuth?: boolean
  roles?: string[]
}

export default defineRouter(function (/* { store, ssrContext } */) {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createMemoryHistory(), // ✨ ใช้ Memory Router ตลอด ไม่อ่าน process.env
  })

  Router.beforeEach((to) => {
    const authStore = useAuthStore()

    const meta = to.meta as unknown as CustomRouteMeta

    if (meta.requiresAuth && !authStore.isLogin) {
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      }
    }

    if (
      meta.roles &&
      authStore.currentUser?.role &&
      !meta.roles.includes(authStore.currentUser.role)
    ) {
      return { path: '/' }
    }
  })

  return Router
})
