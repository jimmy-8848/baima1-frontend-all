<script setup>
import {onMounted, ref, computed} from "vue";
import {apiGet, apiPost, apiDelete, apiPut} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "@/router/index.js";

const loading = ref(false)
const cartList = ref([])
const togglingAll = ref(false)

const selectedCount = computed(() => {
  return cartList.value.filter(item => item.checked === 1).length
})

const totalAmount = computed(() => {
  return cartList.value
    .filter(item => item.checked === 1)
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
    .toFixed(2)
})

onMounted(() => {
  fetchCart()
})

function fetchCart() {
  loading.value = true
  apiGet('/user/shoppingCart/list').then(res => {
    cartList.value = res || []
  }).catch(() => {
    ElMessage.error('获取购物车失败')
  }).finally(() => loading.value = false)
}

function toggleChecked(row, val) {
  apiPut(`/user/shoppingCart/select?CartId=${row.id}&checked=${val ? 1 : 0}`, {})
      .then(() => {
        row.checked = val ? 1 : 0
      }).catch(() => {})
}

const allChecked = computed(() => cartList.value.length > 0 && cartList.value.every(i => i.checked === 1))

async function toggleAll() {
  if (cartList.value.length === 0) return
  togglingAll.value = true
  const target = allChecked.value ? 0 : 1
  try {
    const promises = cartList.value.map(row => 
      apiPut(`/user/shoppingCart/select?CartId=${row.id}&checked=${target}`, {})
    )
    await Promise.all(promises)
    cartList.value.forEach(row => {
      row.checked = target
    })
    ElMessage.success(target === 1 ? '已全选' : '已取消全选')
  } catch (e) {
    ElMessage.error('批量更新失败')
    fetchCart()
  } finally {
    togglingAll.value = false
  }
}

function changeQuantity(row, val) {
  if (val < 1) {
    ElMessage.warning('数量不能小于1')
    return
  }
  apiPut(`/user/shoppingCart/quantity?cartId=${row.id}&quantity=${val}`, {})
      .then(() => {
        ElMessage.success('数量已更新')
        row.quantity = val
      })
}

function removeItem(row) {
  ElMessageBox.confirm('确定删除该商品吗？', '提示', {type: 'warning'}).then(() => {
    apiDelete(`/user/shoppingCart/delete/${row.id}`).then(() => {
      ElMessage.success('已删除')
      fetchCart()
    })
  }).catch(() => {})
}

function clearCart() {
  ElMessageBox.confirm('确定清空购物车？', '提示', {type: 'warning'}).then(() => {
    apiPost('/user/shoppingCart/clear', {}).then(() => {
      ElMessage.success('已清空')
      fetchCart()
    })
  }).catch(() => {})
}

function gotoHome() {
  router.push('/home')
}

function goToCheckout() {
  const selectedItems = cartList.value.filter(item => item.checked === 1)
  if (selectedItems.length === 0) {
    ElMessage.warning('请至少选择一件商品')
    return
  }
  // 将选中的商品ID列表传递到订单确认页面
  const cartIds = selectedItems.map(item => item.id)
  router.push({
    path: '/checkout',
    query: { cartIds: cartIds.join(',') }
  })
}
</script>

<template>
  <div class="page-container">
    <div class="card header-row">
      <div>
        <div class="title">购物车</div>
        <div class="subtitle">查看已加入的商品，支持勾选、删除、清空</div>
      </div>
      <div class="actions">
        <el-button type="primary" @click="gotoHome">继续购物</el-button>
        <el-button type="danger" plain @click="clearCart">清空</el-button>
      </div>
    </div>

    <div class="card">
      <el-empty v-if="!cartList.length" description="购物车为空">
        <el-button type="primary" @click="gotoHome">去逛逛</el-button>
      </el-empty>

      <el-table v-else :data="cartList" stripe v-loading="loading">
        <el-table-column width="90" align="center">
          <template #header>
            <el-button text type="primary" :loading="togglingAll" @click="toggleAll">
              {{ allChecked ? '取消全选' : '全选' }}
            </el-button>
          </template>
          <template #default="{row}">
            <el-checkbox :model-value="row.checked === 1" @change="(val)=>toggleChecked(row,val)"/>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品" min-width="200"/>
        <el-table-column prop="spec" label="规格" min-width="120"/>
        <el-table-column prop="price" label="单价" min-width="100">
          <template #default="{row}">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" min-width="80">
          <template #default="{row}">
            <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="99"
                size="small"
                @change="(val)=>changeQuantity(row,val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" min-width="100">
          <template #default="{row}">
            ¥{{ (row.price || 0) * (row.quantity || 1) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{row}">
            <el-button type="danger" link @click="removeItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="cartList.length" class="cart-footer">
        <div class="total-info">
          <span>已选 {{ selectedCount }} 件商品，合计：</span>
          <span class="total-amount">¥{{ totalAmount }}</span>
        </div>
        <el-button type="primary" size="large" :disabled="selectedCount === 0" @click="goToCheckout">
          去结算
        </el-button>
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

.actions {
  display: flex;
  gap: 12px;
}

.actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.actions :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.total-info {
  font-size: 16px;
  color: #6b7280;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-amount {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #ff6b3c, #ff8c5a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cart-footer :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 14px 32px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.cart-footer :deep(.el-button:hover:not(.is-disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 111, 255, 0.3);
}
</style>

