<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {apiGet, apiPost, getUserProfile} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import router from "@/router/index.js";

const loading = ref(false)
const orderList = ref([])
const pagination = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
})
const query = reactive({
  status: null
})

const userId = computed(() => getUserProfile()?.userId)

onMounted(() => {
  if (!userId.value) {
    ElMessage.warning('未找到用户信息，请重新登录')
  } else {
    fetchOrders()
  }
})

function fetchOrders() {
  if (!userId.value) return
  loading.value = true
  apiGet('/user/order/page', {
    status: query.status,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }).then(res => {
    orderList.value = res?.records || []
    pagination.total = res?.total || 0
  }).finally(() => loading.value = false)
}

function doPay(row) {
  if (!userId.value) return
  apiPost('/user/order/pay', {orderId: row.id}).then(() => {
    ElMessage.success('支付成功')
    fetchOrders()
  })
}

function doCancel(row) {
  if (!userId.value) return
  ElMessageBox.confirm('确认取消该订单吗？', '提示', {type: 'warning'}).then(() => {
    apiPost(`/user/order/cancel/${row.id}`, {}).then(() => {
      ElMessage.success('已取消')
      fetchOrders()
    })
  }).catch(() => {})
}

function doConfirm(row) {
  if (!userId.value) return
  ElMessageBox.confirm('确认收货吗？', '提示', {type: 'warning'}).then(() => {
    apiPost(`/user/order/confirm/${row.id}`, {}).then(() => {
      ElMessage.success('已确认收货')
      fetchOrders()
    })
  }).catch(() => {})
}

function statusTag(status) {
  const map = {
    0: {text: '待付款', type: 'warning'},
    1: {text: '待发货', type: 'info'},
    2: {text: '待收货', type: 'primary'},
    3: {text: '已完成', type: 'success'},
    4: {text: '已取消', type: 'info'},
    5: {text: '已退款', type: 'danger'}
  }
  return map[status] || {text: '未知', type: 'info'}
}

function handlePageChange(page) {
  pagination.pageNum = page
  fetchOrders()
}

function goDetail(row) {
  if (!row?.id) return
  router.push(`/orders/${row.id}`)
}
</script>

<template>
  <div class="page-container">
    <div class="card header-row">
      <div>
        <div class="title">我的订单</div>
        <div class="subtitle">查看、支付、取消或确认收货</div>
      </div>
      <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 160px" @change="fetchOrders">
        <el-option :value="0" label="待付款"/>
        <el-option :value="1" label="待发货"/>
        <el-option :value="2" label="待收货"/>
        <el-option :value="3" label="已完成"/>
        <el-option :value="4" label="已取消"/>
        <el-option :value="5" label="已退款"/>
      </el-select>
    </div>

    <div class="card">
      <el-empty v-if="!orderList.length" description="暂无订单"/>
      <el-table
          v-else
          :data="orderList"
          stripe
          v-loading="loading"
          @row-click="goDetail"
      >
        <el-table-column prop="orderNo" label="订单号" min-width="180"/>
        <el-table-column label="金额" min-width="120">
          <template #default="{row}">
            ¥{{ row.actualAmount || row.totalAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template #default="{row}">
            <el-tag :type="statusTag(row.status).type">{{ statusTag(row.status).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" min-width="160">
          <template #default="{row}">
            {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220">
          <template #default="{row}">
            <el-space wrap>
              <el-button
                  v-if="row.status === 0"
                  type="primary"
                  size="small"
                  @click.stop="doPay(row)"
              >支付</el-button>
              <el-button
                  v-if="row.status === 0 || row.status === 1"
                  size="small"
                  type="danger"
                  plain
                  @click.stop="doCancel(row)"
              >取消</el-button>
              <el-button
                  v-if="row.status === 2"
                  size="small"
                  type="success"
                  plain
                  @click.stop="doConfirm(row)"
              >确认收货</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            background
            layout="prev, pager, next"
            :current-page="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            @current-change="handlePageChange"
        />
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
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  margin-bottom: 6px;
}

.header-row .subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.header-row :deep(.el-select) {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 8px;
}

.header-row :deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
}

.header-row :deep(.el-input__inner) {
  color: #fff;
}

.header-row :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
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

.card :deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.card :deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.card :deep(.el-button:hover) {
  transform: translateY(-1px);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>

