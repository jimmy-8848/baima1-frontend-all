<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {apiGet, apiPost} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {InfoFilled} from "@element-plus/icons-vue";

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
    // 只设置需要编辑的字段，避免携带不必要的数据
    form.id = res.id
    form.name = res.name
    form.categoryId = res.categoryId
    form.description = res.description || ""
    form.skuList = (res.skuList && res.skuList.length)
        ? res.skuList.map(s => ({ 
            spec: s.spec || "", 
            price: Number(s.price) || 0, 
            stock: Number(s.stock) || 0 
          }))
        : [{ spec: "", price: 0, stock: 0 }]
    dialogVisible.value = true
  }).catch(() => {
    // 错误已在 apiGet 中处理，这里不再重复提示
    console.error("加载商品详情失败")
  })
}

function save() {
  formRef.value.validate(valid => {
    if (!valid) return
    
    // 验证至少有一个有效的规格
    const validSkus = form.skuList.filter(s => s.spec && s.spec.trim())
    if (!validSkus.length) {
      ElMessage.warning("请至少填写一个完整的商品规格")
      return
    }
    
    // 验证每个规格的价格和库存
    for (let i = 0; i < validSkus.length; i++) {
      const sku = validSkus[i]
      if (!sku.price || sku.price <= 0) {
        ElMessage.warning(`第${i + 1}个规格的价格必须大于0`)
        return
      }
      if (sku.stock === null || sku.stock === undefined || sku.stock < 0) {
        ElMessage.warning(`第${i + 1}个规格的库存不能为负数`)
        return
      }
    }
    
    // 构建提交数据，只包含必要的字段
    const submitData = {
      id: form.id,
      name: form.name,
      categoryId: form.categoryId,
      description: form.description,
      skuList: validSkus.map(sku => ({
        spec: sku.spec.trim(),
        price: Number(sku.price),
        stock: Number(sku.stock)
      }))
    }
    
    const request = form.id
        ? apiPost("/admin/product/update", submitData)
        : apiPost("/admin/product", submitData)
        
    request.then(() => {
      ElMessage.success(form.id ? "商品更新成功" : "商品添加成功")
      dialogVisible.value = false
      loadProducts()
    }).catch(() => {
      // 错误已在 apiPost 中处理，这里不再重复提示
      console.error("保存商品失败")
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

        <el-form-item label="商品规格" required>
          <div class="sku-container">
            <div class="sku-header">
              <span class="sku-col-spec">规格名称</span>
              <span class="sku-col-price">价格(元)</span>
              <span class="sku-col-stock">库存数量</span>
              <span class="sku-col-action">操作</span>
            </div>
            <div v-for="(sku, index) in form.skuList" :key="index" class="sku-row">
              <el-input 
                v-model="sku.spec" 
                placeholder="例如：128GB 黑色" 
                class="sku-col-spec"
                clearable
              />
              <el-input-number 
                v-model="sku.price" 
                :min="0" 
                :step="0.01"
                :precision="2"
                placeholder="0.00"
                class="sku-col-price"
                controls-position="right"
              />
              <el-input-number 
                v-model="sku.stock" 
                :min="0" 
                :step="1"
                placeholder="0"
                class="sku-col-stock"
                controls-position="right"
              />
              <div class="sku-col-action">
                <el-button 
                  type="danger" 
                  text 
                  @click="removeSku(index)"
                  :disabled="form.skuList.length === 1"
                >
                  删除
                </el-button>
              </div>
            </div>
            <el-button type="primary" :icon="'Plus'" @click="addSku" class="add-sku-btn">
              添加规格
            </el-button>
            <div class="sku-tip">
              <el-icon><InfoFilled /></el-icon>
              提示：至少需要添加一个商品规格，规格名称如"红色-S码"、"128GB 黑色"等
            </div>
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

.sku-container {
  width: 100%;
}

.sku-header {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 100px;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  font-weight: 600;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.sku-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1.2fr 100px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.sku-row:last-of-type {
  border-bottom: none;
  margin-bottom: 12px;
}

.sku-col-spec {
  min-width: 0;
}

.sku-col-price {
  min-width: 0;
}

.sku-col-stock {
  min-width: 0;
}

.sku-col-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-sku-btn {
  width: 100%;
  margin-top: 8px;
  border-style: dashed;
}

.sku-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  color: #409eff;
  font-size: 13px;
  line-height: 1.5;
}

.sku-tip .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}
</style>


