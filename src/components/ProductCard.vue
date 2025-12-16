<script setup>
import {computed} from "vue";
import router from "@/router/index.js";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const priceText = computed(() => {
  if (props.item.price) return `¥${props.item.price}`;
  if (props.item.minPrice) return `¥${props.item.minPrice}`;
  if (props.item.skuList && props.item.skuList.length) {
    const prices = props.item.skuList.map(s => s.price || 0);
    const min = Math.min(...prices);
    return `¥${min}`;
  }
  return '价格待定';
})

function gotoDetail() {
  router.push(`/product/${props.item.id}`);
}
</script>

<template>
  <div class="card" @click="gotoDetail">
    <div class="cover">
      <div class="placeholder">{{ item.name?.slice(0, 1) || 'P' }}</div>
    </div>
    <div class="info">
      <div class="name" :title="item.name">{{ item.name }}</div>
      <div class="desc" :title="item.description">{{ item.description || '暂无描述' }}</div>
      <div class="meta">
        <div class="price">{{ priceText }}</div>
        <el-button type="primary" size="small" @click.stop="gotoDetail">查看详情</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4c6fff, #3d5ae8);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(76, 111, 255, 0.15);
  border-color: rgba(76, 111, 255, 0.2);
}

.card:hover::before {
  transform: scaleX(1);
}

.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef3ff 0%, #e0e9ff 100%);
  border-radius: 10px;
  height: 130px;
  position: relative;
  overflow: hidden;
}

.cover::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(76, 111, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  50% { transform: translate(-50%, -50%) rotate(180deg); }
}

.placeholder {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 24px;
  color: #4c6fff;
  box-shadow: 0 4px 12px rgba(76, 111, 255, 0.2);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.card:hover .placeholder {
  transform: scale(1.1) rotate(5deg);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name {
  font-weight: 700;
  font-size: 17px;
  line-height: 1.4;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price {
  font-size: 20px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b3c, #ff8c5a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.meta :deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.meta :deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 111, 255, 0.2);
}
</style>

