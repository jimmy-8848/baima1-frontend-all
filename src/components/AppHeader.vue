<script setup>
import {computed, ref} from "vue";
import router from "@/router/index.js";
import {logout, getTokenInfo} from "@/net/index.js";
import {Search, ShoppingCart, List, UserFilled} from "@element-plus/icons-vue";
import {ElMessageBox} from "element-plus";

const searchText = ref('');

const userName = computed(() => getTokenInfo()?.username || '用户');

function handleSearch() {
  if (!searchText.value) return;
  router.push({name: 'home', query: {keyword: searchText.value}});
}

function handleNav(path) {
  router.push(path);
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {type: 'warning'}).then(() => {
    logout(() => router.push('/welcome'));
  }).catch(() => {});
}
</script>

<template>
  <header class="header">
    <div class="header-left" @click="handleNav('/home')" style="cursor: pointer">
      <img src="/favicon.ico" alt="logo" class="logo">
      <div>
        <div class="title">Baima Mall</div>
        <div class="subtitle">轻量·简洁·好用</div>
      </div>
    </div>

    <div class="header-search">
      <el-input
          v-model="searchText"
          placeholder="搜索商品名称"
          clearable
          @keyup.enter="handleSearch"
      >
        <template #suffix>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="header-actions">
      <el-button text :icon="List" @click="handleNav('/home')">首页</el-button>
      <el-button text :icon="ShoppingCart" @click="handleNav('/cart')">购物车</el-button>
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-icon><UserFilled/></el-icon>
          <span style="margin-left: 6px">{{ userName }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleNav('/profile')">个人中心</el-dropdown-item>
            <el-dropdown-item @click="handleNav('/address')">收货地址</el-dropdown-item>
            <el-dropdown-item @click="handleNav('/orders')">我的订单</el-dropdown-item>
            <el-dropdown-item divided @click="handleNav('/home')">返回首页</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 16px 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s ease;
}

.header-left:hover {
  transform: translateX(2px);
}

.logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(76, 111, 255, 0.2);
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05) rotate(5deg);
}

.title {
  font-weight: 800;
  font-size: 20px;
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.header-search {
  flex: 1;
  padding: 0 32px;
  max-width: 600px;
}

.header-search :deep(.el-input__wrapper) {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.header-search :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(76, 111, 255, 0.15);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions :deep(.el-button) {
  font-weight: 500;
  transition: all 0.2s ease;
}

.header-actions :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.header-actions :deep(.el-dropdown-link) {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.header-actions :deep(.el-dropdown-link:hover) {
  background: #f3f4f6;
}
</style>

