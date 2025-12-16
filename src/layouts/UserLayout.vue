<script setup>
import AppHeader from "@/components/AppHeader.vue";
</script>

<template>
  <div class="layout">
    <AppHeader/>
    <main class="layout-body">
      <router-view v-slot="{ Component }">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </main>
  </div>
  <footer class="layout-footer">
    <div>© 2025 Baima Mall · Designed for desktop users</div>
  </footer>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.layout-body {
  flex: 1;
}

.layout-footer {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 24px 0 40px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 40px;
}
</style>

