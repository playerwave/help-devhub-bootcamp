import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'RootPage', component: () => import('pages/IndexPage.vue') }],
    meta: { requiresAuth: false },
  },
  {
    path: '/first-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'FirstPage', component: () => import('pages/FirstPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/pos',
    component: () => import('layouts/FullScreen.vue'),
    children: [{ path: '', name: 'PosPage', component: () => import('pages/POSPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: () => import('layouts/FullScreen.vue'),
    children: [{ path: '', name: 'LoginPage', component: () => import('pages/LoginPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/user-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'UserPage', component: () => import('pages/UserPage.vue') }],
    // meta: { requiresAuth: true },
    meta: { requiresAuth: true, roles: ['Manager', 'Owner'] }, //ให้แค่ Manager, Owner เท่านั้นที่ใช้ได้
  },
  {
    path: '/route-page/:id/:name',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'RoutePage', component: () => import('pages/RoutePage.vue') }],
    meta: { requiresAuth: false },
  },
  {
    path: '/product-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'ProductPage', component: () => import('pages/ProductPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/type-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'TypePage', component: () => import('pages/TypePage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/material-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'MaterialPage', component: () => import('pages/MaterialPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/customer-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'CustomerPage', component: () => import('pages/CustomerPage.vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/reciept-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'RecieptPage', component: () => import('pages/RecieptPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/order-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'OrderPage', component: () => import('pages/OrderPage.vue') }],
    meta: { requiresAuth: true },
  },
  {
    path: '/checkinout-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'checkinoutPage', component: () => import('pages/CheckInOutPage .vue') },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/payment-page',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'paymentPage', component: () => import('pages/PaymentPage.vue') }],
    meta: { requiresAuth: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
