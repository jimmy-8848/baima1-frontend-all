import {createRouter, createWebHistory} from "vue-router";
import {isUnauthorizedToken} from "@/net/index.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/home'
        },
        {
            path: '/welcome',
            name: 'welcome',
            component: () => import('@/views/WelcomePage.vue'),
            children: [
                {
                    path: '',
                    name: 'welcome-login',
                    component: () => import('@/views/welcome/LoginPage.vue')
                },
                {
                    path: 'register',
                    name: 'welcome-register',
                    component: () => import('@/views/welcome/RegisterPage.vue')
                },
                {
                    path: 'reset',
                    name: 'welcome-reset',
                    component: () => import('@/views/welcome/ResetPage.vue')
                }
            ]
        },
        {
            path: '/',
            component: () => import('@/layouts/UserLayout.vue'),
            meta: {requiresAuth: true},
            children: [
                {
                    path: 'home',
                    name: 'home',
                    component: () => import('@/views/user/HomePage.vue')
                },
                {
                    path: 'product/:id',
                    name: 'product-detail',
                    component: () => import('@/views/user/ProductDetailPage.vue')
                },
                {
                    path: 'cart',
                    name: 'cart',
                    component: () => import('@/views/user/CartPage.vue')
                },
                {
                    path: 'checkout',
                    name: 'checkout',
                    component: () => import('@/views/user/CheckoutPage.vue')
                },
                {
                    path: 'address',
                    name: 'address',
                    component: () => import('@/views/user/AddressPage.vue')
                },
                {
                    path: 'orders',
                    name: 'orders',
                    component: () => import('@/views/user/OrderListPage.vue')
                },
                {
                    path: 'orders/:id',
                    name: 'order-detail',
                    component: () => import('@/views/user/OrderDetailPage.vue')
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('@/views/user/UserCenterPage.vue')
                }
            ]
        },
        {
            path: '/admin',
            component: () => import('@/layouts/AdminLayout.vue'),
            meta: {requiresAuth: true},
            children: [
                {
                    path: 'categories',
                    name: 'admin-categories',
                    component: () => import('@/views/admin/CategoryAdminPage.vue')
                },
                {
                    path: 'products',
                    name: 'admin-products',
                    component: () => import('@/views/admin/ProductAdminPage.vue')
                },
                {
                    path: 'orders',
                    name: 'admin-orders',
                    component: () => import('@/views/admin/OrderAdminPage.vue')
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    if (requiresAuth && isUnauthorizedToken()) {
        next('/welcome')
    } else if (to.name && to.name.toString().startsWith('welcome') && !isUnauthorizedToken()) {
        next('/home')
    } else next()
})

export default router