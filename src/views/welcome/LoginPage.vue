<script setup>

import {Hide, Lock, User, View} from "@element-plus/icons-vue";
import {reactive, ref} from "vue";
import {login} from "@/net/index.js";
import router from "@/router/index.js";
import {ElMessage} from "element-plus";

const form = reactive({
      username:'',
      password:'',
      remember: false
    }
)

const showPassword = ref(false)

const formRef = ref()

const rule = {
  username:[{required:true,message:'请输入用户名'}],
  password:[{required:true,message:'请输入密码'}]
}

function handlerLogin(){
  formRef.value.validate((valid)=>{
    if(valid)   login(form.username,form.password,form.remember,(user)=>{
      // 根据角色跳转：商家/管理员进入后台，普通用户进首页
      const role = user.role || ''
      const normalized = role.toLowerCase()
      const isAdminOrMerchant =
          normalized === 'admin' ||
          normalized === 'merchant' ||
          normalized === 'role_admin' ||
          normalized === 'role_merchant' ||
          normalized.includes('admin') ||
          normalized.includes('merchant')

      if (isAdminOrMerchant) {
        router.push('/admin/orders')
      } else {
        router.push('/home')
      }
    })
    else ElMessage.warning('请完整填写表单内容')
  })

}
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="login-title">欢迎回来</div>
        <div class="login-subtitle">登录您的账户以继续使用 Baima Mall</div>
      </div>
      
      <div class="login-form-wrapper">
        <el-form :model="form" ref="formRef" :rules="rule" class="login-form">
          <el-form-item prop="username">
            <el-input 
              v-model="form.username" 
              maxlength="10" 
              placeholder="用户名/邮箱" 
              type="text"
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><User/></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="form.password" 
              maxlength="20" 
              minlength="6"  
              :type="showPassword?'text':'password'" 
              placeholder="密码"
              size="large"
            >
              <template #prefix>
                <el-icon class="input-icon"><Lock/></el-icon>
              </template>
              <template #suffix>
                <el-icon @click="showPassword = !showPassword" class="password-toggle">
                  <Component :is="showPassword?View:Hide"/>
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-row :gutter="10" class="form-options">
            <el-col :span="12">
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
            </el-col>
            <el-col :span="12" class="text-right">
              <el-link @click="router.push('/reset')" class="forgot-link">忘记密码？</el-link>
            </el-col>
          </el-row>
          
          <div class="form-actions">
            <el-button 
              type="primary" 
              size="large"
              class="login-btn"
              @click="handlerLogin"
            >
              立即登录
            </el-button>
            
            <el-divider class="divider">
              <span class="divider-text">没有账号？</span>
            </el-divider>
            
            <el-button 
              type="primary" 
              plain
              size="large"
              class="register-btn"
              @click="router.push('/welcome/register')"
            >
              立即注册
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px 40px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
}

.login-form-wrapper {
  margin-top: 40px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.login-form :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.input-icon {
  color: #9ca3af;
  font-size: 18px;
}

.password-toggle {
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.form-options {
  margin-bottom: 32px;
}

.text-right {
  text-align: right;
}

.forgot-link {
  color: #667eea;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #764ba2;
}

.form-actions {
  margin-top: 40px;
}

.login-btn,
.register-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.register-btn {
  border: 2px solid #667eea;
  color: #667eea;
}

.register-btn:hover {
  background: #667eea;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.divider {
  margin: 24px 0;
}

.divider-text {
  color: #9ca3af;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
  padding: 0 12px;
}
</style>