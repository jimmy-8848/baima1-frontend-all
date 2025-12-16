<script setup>
import {computed} from "vue";
import router from "@/router/index.js";
import {getTokenInfo, logout} from "@/net/index.js";
import {ElMessageBox} from "element-plus";

const userName = computed(() => getTokenInfo()?.username || "商家");

function nav(path) {
  router.push(path);
}

function handleLogout() {
  ElMessageBox.confirm("确定要退出商家后台吗？", "提示", {type: "warning"}).then(() => {
    logout(() => router.push("/welcome"));
  }).catch(() => {});
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo" @click="nav('/home')">
        <span class="logo-main">Baima Mall</span>
        <span class="logo-sub">商家后台</span>
      </div>
      <el-menu class="menu" :default-active="$route.path" router>
        <el-menu-item index="/admin/products" @click="nav('/admin/products')">商品管理</el-menu-item>
        <el-menu-item index="/admin/categories" @click="nav('/admin/categories')">分类管理</el-menu-item>
        <el-menu-item index="/admin/orders" @click="nav('/admin/orders')">订单发货</el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <div class="user">{{ userName }}</div>
        <el-button text size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </aside>
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  background: radial-gradient(circle at top left, #111827, #020617);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.4);
}

.logo {
  cursor: pointer;
  margin-bottom: 20px;
}

.logo-main {
  font-weight: 700;
  font-size: 18px;
  display: block;
  letter-spacing: 0.5px;
}

.logo-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.menu {
  border-right: none;
  flex: 1;
  margin-top: 16px;
}

.sidebar-footer {
  font-size: 13px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user {
  margin-bottom: 4px;
}

.main {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  padding: 24px;
}

.menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 4px;
}

.menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  color: #fff;
}

.menu :deep(.el-menu-item:hover) {
  background: rgba(148, 163, 184, 0.25);
}
</style>


