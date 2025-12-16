<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {apiGet, apiPost} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";

const loading = ref(false)
const list = ref([])
const categoryList = ref([])

const dialogVisible = ref(false)
const form = reactive({
  id: null,
  name: "",
  categoryId: null,
  description: "",
  skuList: [
    { spec: "", price: 0, stock: 0 }
  ]
})

const rules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }]
}

const formRef = ref()

const dialogTitle = computed(() => form.id ? "编辑商品" : "新增商品")

onMounted(() => {
  loadCategories()
  loadProducts()
})

function loadCategories() {
  apiGet("/user/category/list").then(res => {
    categoryList.value = res || []
  })
}

function loadProducts() {
  loading.value = true
  apiGet("/user/product/page", {
    pageNum: 1,
    pageSize: 50
  }).then(res => {
    list.value = res?.records || []
  }).finally(() => loading.value = false)
}

function openAdd() {
  form.id = null
  form.name = ""
  form.categoryId = null
  form.description = ""
  form.skuList = [{ spec: "", price: 0, stock: 0 }]
  dialogVisible.value = true
}

function openEdit(row) {
  // 加载单个商品详情用于编辑
  apiGet(`/admin/product/${row.id}`).then(res => {
    form.id = res.id
    form.name = res.name
    form.categoryId = res.categoryId
    form.description = res.description
    form.skuList = (res.skuList && res.skuList.length)
        ? res.skuList.map(s => ({ spec: s.spec, price: s.price, stock: s.stock }))
        : [{ spec: "", price: 0, stock: 0 }]
    dialogVisible.value = true
  })
}

function save() {
  formRef.value.validate(valid => {
    if (!valid) return
    if (!form.skuList.length || !form.skuList[0].spec) {
      ElMessage.warning("请至少填写一个规格")
      return
    }
    const request = form.id
        ? apiPost("/admin/product/update", form)  // 更新用 POST，后端接受 ProductVO（包含 id）
        : apiPost("/admin/product", form)         // 新增用 POST
    request.then(() => {
      ElMessage.success("商品已保存")
      dialogVisible.value = false
      loadProducts()
    })
  })
}

function addSku() {
  form.skuList.push({ spec: "", price: 0, stock: 0 })
}

function removeSku(index) {
  if (form.skuList.length === 1) return
  form.skuList.splice(index, 1)
}

function toggleStatus(row, val) {
  const target = val ? 1 : 0
  apiPost("/admin/product/product/status", [{
    id: row.id,
    status: target
  }]).then(() => {
    ElMessage.success(target === 1 ? "已上架" : "已下架")
    row.status = target
  }).catch(() => {
    // 回滚 UI
    row.status = row.status === 1 ? 0 : 1
  })
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header card">
      <div>
        <div class="title">商品管理</div>
        <div class="sub">添加和维护商城商品信息</div>
      </div>
      <el-button type="primary" @click="openAdd">新增商品</el-button>
    </div>

    <div class="card table-card">
      <el-table :data="list" stripe v-loading="loading" @row-dblclick="openEdit">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="name" label="名称" min-width="160"/>
        <el-table-column prop="categoryName" label="分类" min-width="120"/>
        <el-table-column prop="price" label="最低价格" min-width="120">
          <template #default="{row}">
            ¥{{ row.minPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="160">
          <template #default="{row}">
            <el-switch
                :model-value="row.status === 1"
                active-text="上架"
                inactive-text="下架"
                @click.stop
                @change="val => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="100"/>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 240px">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="form.description" maxlength="500"/>
        </el-form-item>

        <el-form-item label="规格价格">
          <div class="sku-list">
            <div v-for="(sku, index) in form.skuList" :key="index" class="sku-row">
              <el-input v-model="sku.spec" placeholder="规格，如 128GB 黑色" style="width: 220px"/>
              <el-input-number v-model="sku.price" :min="0" :step="1" style="width: 140px" />
              <el-input-number v-model="sku.stock" :min="0" :step="1" style="width: 120px" />
              <el-button type="text" @click="removeSku(index)">删除</el-button>
            </div>
            <el-button type="primary" text @click="addSku">新增规格</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
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

.page-header .title {
  font-size: 20px;
  font-weight: 800;
}

.page-header .sub {
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

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sku-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>


