<script setup>
import {onMounted, reactive, ref} from "vue";
import {apiGet, apiPost} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";

const loading = ref(false)
const list = ref([])
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})
const query = reactive({
  status: null,
  orderNo: ""
})

onMounted(() => {
  load()
})

function load() {
  loading.value = true
  apiGet("/admin/order/page", {
    status: query.status,
    orderNo: query.orderNo || null,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }).then(res => {
    list.value = res?.records || []
    pagination.total = res?.total || 0
  }).finally(() => loading.value = false)
}

function handlePageChange(p) {
  pagination.pageNum = p
  load()
}

function ship(row) {
  ElMessageBox.confirm(`确认对订单【${row.orderNo}】发货吗？`, "提示", { type: "warning" })
      .then(() => apiPost(`/admin/order/ship/${row.id}`, {}))
      .then(() => {
        ElMessage.success("已发货")
        load()
      }).catch(() => {})
}

function statusText(status) {
  const map = {
    0: "待付款",
    1: "待发货",
    2: "待收货",
    3: "已完成",
    4: "已取消",
    5: "已退款"
  }
  return map[status] || "未知"
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header card">
      <div>
        <div class="title">订单发货</div>
        <div class="sub">查看用户订单并进行发货操作</div>
      </div>
    </div>

    <div class="card query-bar">
      <el-form :inline="true" :model="query">
        <el-form-item label="订单号">
          <el-input v-model="query.orderNo" placeholder="订单号模糊查询"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option :value="0" label="待付款"/>
            <el-option :value="1" label="待发货"/>
            <el-option :value="2" label="待收货"/>
            <el-option :value="3" label="已完成"/>
            <el-option :value="4" label="已取消"/>
            <el-option :value="5" label="已退款"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load">查询</el-button>
          <el-button @click="() => { query.orderNo=''; query.status=null; load(); }">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="orderNo" label="订单号" min-width="180"/>
        <el-table-column label="金额" min-width="120">
          <template #default="{row}">
            ¥{{ row.actualAmount || row.totalAmount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"/>
        <el-table-column label="状态" width="110">
          <template #default="{row}">
            <el-tag :type="row.status === 1 ? 'warning' : row.status === 2 ? 'primary' : 'info'">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{row}">
            {{ dayjs(row.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{row}">
            <el-button
                v-if="row.status === 1"
                type="primary"
                size="small"
                @click="ship(row)"
            >
              发货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  margin-bottom: 0;
  padding: 18px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  color: #fff;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.title {
  font-size: 20px;
  font-weight: 800;
}

.sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.query-bar {
  margin-top: 4px;
  margin-bottom: 4px;
  padding: 14px 18px;
}

.table-card {
  padding: 16px 20px 20px;
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th) {
  background: #f9fafb;
  color: #1f2937;
  font-weight: 600;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #fafbfc;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>


