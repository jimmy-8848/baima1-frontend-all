<script setup>
import {computed} from "vue";
import {getTokenInfo, getUserProfile, logout} from "@/net/index.js";
import router from "@/router/index.js";
import {ElMessageBox} from "element-plus";

const tokenInfo = computed(() => getTokenInfo());
const profile = computed(() => getUserProfile());

const displayName = computed(() => profile.value?.username || tokenInfo.value?.username || '用户');
const userId = computed(() => profile.value?.userId || tokenInfo.value?.userId || '-');

function goAddress() {
  router.push('/address');
}

function goOrders() {
  router.push('/orders');
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {type: 'warning'}).then(() => {
    logout(() => router.push('/welcome'));
  }).catch(() => {});
}
</script>

<template>
  <div class="page-container">
    <div class="card profile-card">
      <div class="profile-main">
        <div class="avatar">
          <span>{{ displayName.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="info">
          <div class="name">{{ displayName }}</div>
          <div class="meta">用户ID：{{ userId }}</div>
        </div>
      </div>
      <div class="profile-actions">
        <el-button type="primary" @click="goAddress">管理收货地址</el-button>
        <el-button type="primary" plain @click="goOrders">查看我的订单</el-button>
        <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <div class="card">
      <div class="section-title">账户概览</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ displayName }}</el-descriptions-item>
        <el-descriptions-item label="登录状态">
          {{ tokenInfo ? '已登录' : '未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="Token 过期时间">
          {{ tokenInfo?.expire || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  width: 85%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.profile-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 32px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.profile-card:hover .avatar {
  transform: scale(1.05) rotate(5deg);
}

.info .name {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 6px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info .meta {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.profile-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.profile-actions :deep(.el-button--primary) {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
}

.profile-actions :deep(.el-button--primary:hover) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-actions :deep(.el-button.is-plain) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.profile-actions :deep(.el-button.is-plain:hover) {
  background: rgba(255, 255, 255, 0.25);
}

.section-title {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 20px;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef3ff;
}

.card :deep(.el-descriptions) {
  border-radius: 8px;
}

.card :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #6b7280;
}

.card :deep(.el-descriptions__content) {
  color: #1f2937;
}
</style>


