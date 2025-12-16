<script setup>
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {apiGet} from "@/net/index.js";
import {ElMessage} from "element-plus";
import dayjs from "dayjs";

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const order = ref(null)

onMounted(() => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('缺少订单ID')
    router.push('/orders')
    return
  }
  fetchDetail(id)
})

function fetchDetail(id) {
  loading.value = true
  apiGet(`/user/order/${id}`).then(res => {
    order.value = res || null
    if (!order.value) {
      ElMessage.warning('未找到该订单')
      router.push('/orders')
    }
  }).catch(() => {
    ElMessage.error('获取订单详情失败')
    router.push('/orders')
  }).finally(() => loading.value = false)
}

function goBack() {
  router.push('/orders')
}
</script>

<template>
  <div class="page-container" v-loading="loading">
    <div class="card header-row">
      <div>
        <div class="title">订单详情</div>
        <div class="subtitle" v-if="order">
          订单号：{{ order.orderNo }} ｜ 创建时间：{{ dayjs(order.createTime).format('YYYY-MM-DD HH:mm') }}
        </div>
      </div>
      <el-button type="primary" @click="goBack">返回订单列表</el-button>
    </div>

    <el-empty v-if="!order" description="暂无订单详情"/>

    <div v-else class="card">
      <div class="section">
        <div class="section-title">基本信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ order.statusText }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ dayjs(order.createTime).format('YYYY-MM-DD HH:mm') }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ order.payTime ? dayjs(order.payTime).format('YYYY-MM-DD HH:mm') : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ order.shipTime ? dayjs(order.shipTime).format('YYYY-MM-DD HH:mm') : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ order.completeTime ? dayjs(order.completeTime).format('YYYY-MM-DD HH:mm') : '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="商品金额">¥{{ order.productAmount || order.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="订单总额">¥{{ order.totalAmount }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section">
        <div class="section-title">商品信息</div>
        <el-table :data="order.items || []" stripe>
          <el-table-column prop="productName" label="商品" min-width="200"/>
          <el-table-column prop="skuSpecs" label="规格" min-width="160"/>
          <el-table-column label="单价" min-width="120">
            <template #default="{row}">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" min-width="80"/>
          <el-table-column label="小计" min-width="120">
            <template #default="{row}">
              ¥{{ row.totalPrice }}
            </template>
          </el-table-column>
        </el-table>
      </div>
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

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
}

.header-row .title {
  color: #fff;
  font-size: 24px;
  margin-bottom: 8px;
}

.header-row .subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-top: 4px;
}

.header-row :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.header-row :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 2px solid #eef3ff;
}

.section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-weight: 800;
  margin-bottom: 20px;
  font-size: 18px;
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
  background: #f9fafb;
}

.card :deep(.el-descriptions__content) {
  color: #1f2937;
}

.card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.card :deep(.el-table th) {
  background: #f9fafb;
  color: #1f2937;
  font-weight: 600;
}

.card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}
</style>


