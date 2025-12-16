<script setup>
import {onMounted, ref} from "vue";
import {apiGet, apiPost, apiDelete} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";

const loading = ref(false)
const list = ref([])
const formVisible = ref(false)
const form = ref({ name: "", desc: "" })

onMounted(() => {
  load()
})

function load() {
  loading.value = true
  apiGet("/admin/category/list").then(res => {
    list.value = res || []
  }).finally(() => loading.value = false)
}

function openAdd() {
  form.value = { name: "", desc: "" }
  formVisible.value = true
}

function save() {
  if (!form.value.name) {
    ElMessage.warning("请输入分类名称")
    return
  }
  apiPost("/admin/category/add", form.value).then(() => {
    ElMessage.success("分类已添加")
    formVisible.value = false
    load()
  })
}

function remove(row) {
  ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, "提示", { type: "warning" })
      .then(() => apiDelete(`/admin/category/delete/${row.id}`))
      .then(() => {
        ElMessage.success("已删除")
        load()
      }).catch(() => {})
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header card">
      <div>
        <div class="title">分类管理</div>
        <div class="sub">维护商城商品的分类信息</div>
      </div>
      <el-button type="primary" @click="openAdd">新增分类</el-button>
    </div>

    <div class="card table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="名称" min-width="160"/>
        <el-table-column prop="desc" label="描述" min-width="240"/>
        <el-table-column label="操作" width="120">
          <template #default="{row}">
            <el-button type="danger" link @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="formVisible" title="新增分类" width="480px">
      <el-form :model="form" label-width="80">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="50"/>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.desc" maxlength="200"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.page-header :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
</style>


