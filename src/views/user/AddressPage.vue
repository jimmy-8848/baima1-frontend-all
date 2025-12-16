<script setup>
import {onMounted, ref} from "vue";
import {apiGet, apiPost, apiPut, apiDelete} from "@/net/index.js";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "@/router/index.js";

const loading = ref(false)
const addressList = ref([])
const dialogVisible = ref(false)
const editingAddress = ref(null)
const form = ref({
  recipientName: '',
  phone: '',
  detailAddress: '',
  isDefault: 0
})

const formRules = {
  recipientName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchAddresses()
})

function fetchAddresses() {
  loading.value = true
  apiGet('/user/address/list').then(res => {
    addressList.value = res || []
  }).catch(() => {
    ElMessage.error('获取地址列表失败')
  }).finally(() => loading.value = false)
}

function openAddDialog() {
  editingAddress.value = null
  form.value = {
    recipientName: '',
    phone: '',
    detailAddress: '',
    isDefault: 0
  }
  dialogVisible.value = true
}

function openEditDialog(address) {
  editingAddress.value = address.id
  form.value = {
    recipientName: address.recipientName,
    phone: address.phone,
    detailAddress: address.detailAddress,
    isDefault: address.isDefault || 0
  }
  dialogVisible.value = true
}

function saveAddress() {
  if (!form.value.recipientName || !form.value.phone || !form.value.detailAddress) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (editingAddress.value) {
    // 更新地址
    apiPut(`/user/address/update/${editingAddress.value}`, form.value).then(() => {
      ElMessage.success('地址更新成功')
      dialogVisible.value = false
      fetchAddresses()
    }).catch(e => {
      ElMessage.error(e.message || '更新地址失败')
    })
  } else {
    // 新增地址
    apiPost('/user/address/add', form.value).then(() => {
      ElMessage.success('地址添加成功')
      dialogVisible.value = false
      fetchAddresses()
    }).catch(e => {
      ElMessage.error(e.message || '添加地址失败')
    })
  }
}

function deleteAddress(address) {
  ElMessageBox.confirm(`确定删除地址"${address.recipientName}"吗？`, '提示', {type: 'warning'}).then(() => {
    apiDelete(`/user/address/delete/${address.id}`).then(() => {
      ElMessage.success('删除成功')
      fetchAddresses()
    }).catch(e => {
      ElMessage.error(e.message || '删除失败')
    })
  }).catch(() => {})
}

function setDefault(address) {
  apiPut(`/user/address/default/${address.id}`, {}).then(() => {
    ElMessage.success('设置默认地址成功')
    fetchAddresses()
  }).catch(e => {
    ElMessage.error(e.message || '设置失败')
  })
}
</script>

<template>
  <div class="page-container">
    <div class="card header-row">
      <div>
        <div class="title">收货地址管理</div>
        <div class="subtitle">管理您的收货地址，支持添加、编辑、删除和设置默认地址</div>
      </div>
      <el-button type="primary" @click="openAddDialog">添加地址</el-button>
    </div>

    <div class="card">
      <el-empty v-if="!addressList.length && !loading" description="暂无收货地址">
        <el-button type="primary" @click="openAddDialog">添加地址</el-button>
      </el-empty>
      
      <div v-else class="address-list">
        <div v-for="addr in addressList" :key="addr.id" class="address-card">
          <div class="address-info">
            <div class="address-header">
              <span class="recipient-name">{{ addr.recipientName }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <el-tag v-if="addr.isDefault === 1" type="danger" size="small">默认</el-tag>
            </div>
            <div class="address-detail">{{ addr.detailAddress }}</div>
          </div>
          <div class="address-actions">
            <el-button link type="primary" @click="openEditDialog(addr)">编辑</el-button>
            <el-button v-if="addr.isDefault !== 1" link type="primary" @click="setDefault(addr)">设为默认</el-button>
            <el-button link type="danger" @click="deleteAddress(addr)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="editingAddress ? '编辑地址' : '添加地址'"
        width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="收货人" required>
          <el-input v-model="form.recipientName" placeholder="请输入收货人姓名"/>
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11"/>
        </el-form-item>
        <el-form-item label="详细地址" required>
          <el-input
              v-model="form.detailAddress"
              type="textarea"
              :rows="3"
              placeholder="请输入详细地址"
              maxlength="200"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px 0;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 800;
  font-size: 20px;
}

.subtitle {
  color: #666;
  font-size: 13px;
  margin-top: 4px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.address-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipient-name {
  font-weight: 600;
  font-size: 16px;
}

.phone {
  color: #666;
}

.address-detail {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
}

.address-actions {
  display: flex;
  gap: 12px;
}
</style>

