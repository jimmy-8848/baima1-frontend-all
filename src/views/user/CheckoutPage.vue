<script setup>
import {onMounted, ref, computed} from "vue";
import {apiGet, apiPost} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "@/router/index.js";
import {useRoute} from "vue-router";

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const cartItems = ref([])
const addressList = ref([])
const selectedAddress = ref(null)
const remark = ref('')
const payType = ref(0) // 0-微信，1-支付宝

onMounted(() => {
  const cartIds = route.query.cartIds
  if (!cartIds) {
    ElMessage.error('缺少购物车商品信息')
    router.push('/cart')
    return
  }
  fetchCartItems(cartIds.split(','))
  fetchAddresses()
})

function fetchCartItems(cartIds) {
  loading.value = true
  apiGet('/user/shoppingCart/list').then(res => {
    const allItems = res || []
    cartItems.value = allItems.filter(item => cartIds.includes(item.id))
    if (cartItems.value.length === 0) {
      ElMessage.warning('未找到选中的商品')
      router.push('/cart')
    }
  }).catch(() => {
    ElMessage.error('获取购物车信息失败')
    router.push('/cart')
  }).finally(() => loading.value = false)
}

function fetchAddresses() {
  apiGet('/user/address/list').then(res => {
    addressList.value = res || []
    // 自动选择默认地址
    const defaultAddr = addressList.value.find(addr => addr.isDefault === 1)
    if (defaultAddr) {
      selectedAddress.value = defaultAddr.id
    } else if (addressList.value.length > 0) {
      selectedAddress.value = addressList.value[0].id
    }
  }).catch(() => {
    ElMessage.error('获取地址列表失败')
  })
}

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity || 1)
  }, 0).toFixed(2)
})

function goToAddressManage() {
  router.push('/address')
}

function submitOrder() {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  
  submitting.value = true
  const orderData = {
    addressId: selectedAddress.value,
    orderSource: 0, // 0-购物车
    cartItemIds: cartItems.value.map(item => item.id),
    payType: payType.value,
    remark: remark.value
  }
  
  apiPost('/user/order/create', orderData).then(res => {
    ElMessage.success('订单创建成功')
    // 跳转到订单详情页
    router.push(`/orders/${res}`)
  }).catch(e => {
    ElMessage.error(e.message || '创建订单失败')
  }).finally(() => {
    submitting.value = false
  })
}

function getAddressText(addressId) {
  const addr = addressList.value.find(a => a.id === addressId)
  if (!addr) return ''
  return `${addr.recipientName} ${addr.phone} ${addr.detailAddress}`
}
</script>

<template>
  <div class="page-container">
    <div class="card">
      <div class="title">确认订单</div>
    </div>

    <!-- 收货地址 -->
    <div class="card">
      <div class="section-header">
        <span class="section-title">收货地址</span>
        <el-button type="primary" link @click="goToAddressManage">管理地址</el-button>
      </div>
      <div v-if="selectedAddress" class="selected-address">
        <span class="label">已选择：</span>
        <span class="value">{{ getAddressText(selectedAddress) }}</span>
      </div>
      <el-empty v-if="addressList.length === 0" description="暂无收货地址">
        <el-button type="primary" @click="goToAddressManage">添加地址</el-button>
      </el-empty>
      <div v-else class="address-list">
        <div
            v-for="addr in addressList"
            :key="addr.id"
            class="address-item"
            :class="{ active: selectedAddress === addr.id }"
            @click="selectedAddress = addr.id"
        >
          <div class="address-header">
            <span class="recipient-name">{{ addr.recipientName }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.isDefault === 1" type="danger" size="small">默认</el-tag>
          </div>
          <div class="address-detail">{{ addr.detailAddress }}</div>
        </div>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="card">
      <div class="section-title">商品信息</div>
      <el-table :data="cartItems" stripe v-loading="loading">
        <el-table-column prop="productName" label="商品" min-width="200"/>
        <el-table-column prop="spec" label="规格" min-width="120"/>
        <el-table-column prop="price" label="单价" min-width="100">
          <template #default="{row}">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" min-width="80"/>
        <el-table-column label="小计" min-width="100">
          <template #default="{row}">
            ¥{{ (row.price || 0) * (row.quantity || 1) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 支付方式和备注 -->
    <div class="card">
      <div class="section-title">支付方式</div>
      <el-radio-group v-model="payType">
        <el-radio :label="0">微信支付</el-radio>
        <el-radio :label="1">支付宝</el-radio>
      </el-radio-group>
      
      <div class="remark-section">
        <div class="section-title">订单备注</div>
        <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，可填写特殊要求"
            maxlength="200"
            show-word-limit
        />
      </div>
    </div>

    <!-- 订单汇总 -->
    <div class="card order-summary">
      <div class="summary-row">
        <span>商品合计：</span>
        <span>¥{{ totalAmount }}</span>
      </div>
      <div class="summary-row total">
        <span>应付总额：</span>
        <span class="total-amount">¥{{ totalAmount }}</span>
      </div>
      <el-button
          type="primary"
          size="large"
          :loading="submitting"
          :disabled="!selectedAddress || cartItems.length === 0"
          @click="submitOrder"
          class="submit-btn"
      >
        提交订单
      </el-button>
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
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.title {
  font-weight: 800;
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef3ff;
}

.section-title {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 20px;
  display: block;
}

.selected-address {
  margin-bottom: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eef3ff 0%, #e0e9ff 100%);
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid rgba(76, 111, 255, 0.2);
}

.selected-address .label {
  color: #6b7280;
  font-weight: 600;
}

.selected-address .value {
  margin-left: 8px;
  font-weight: 600;
  color: #1f2937;
}

.address-list {
  display: grid;
  gap: 12px;
}

.address-item {
  padding: 18px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
}

.address-item:hover {
  border-color: #4c6fff;
  box-shadow: 0 4px 12px rgba(76, 111, 255, 0.15);
  transform: translateY(-2px);
}

.address-item.active {
  border-color: #4c6fff;
  background: linear-gradient(135deg, #eef3ff 0%, #e0e9ff 100%);
  box-shadow: 0 4px 16px rgba(76, 111, 255, 0.2);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipient-name {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.phone {
  color: #6b7280;
  font-size: 14px;
}

.address-detail {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.remark-section {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.order-summary {
  position: sticky;
  bottom: 24px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 16px;
  color: #6b7280;
}

.summary-row.total {
  border-top: 2px solid #e5e7eb;
  margin-top: 16px;
  padding-top: 20px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.total-amount {
  background: linear-gradient(135deg, #ff6b3c, #ff8c5a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 28px;
  font-weight: 800;
}

.submit-btn {
  width: 100%;
  margin-top: 24px;
  height: 52px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  border: none;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(76, 111, 255, 0.4);
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
</style>

