<script setup>
import {computed, onMounted, ref} from "vue";
import {apiGet, apiPost} from "@/net/index.js";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import dayjs from "dayjs";

const route = useRoute()
const router = useRouter()

// 商品详情与 SKU
const detail = ref(null)
const loading = ref(false)
const selectedSkuId = ref(null)
const quantity = ref(1)

const currentSku = computed(() => {
  if (!detail.value?.skuList) return null
  return detail.value.skuList.find(s => s.id === selectedSkuId.value) || null
})

const priceText = computed(() => {
  if (!detail.value) return ''
  if (currentSku.value?.price) return `¥${currentSku.value.price}`
  if (detail.value.price) return `¥${detail.value.price}`
  return '价格待定'
})

// 评论相关
const comments = ref([])
const commentLoading = ref(false)
const commentPage = ref(1)
const commentTotal = ref(0)
const commentSize = ref(5)
const canComment = ref(false)
const commentContent = ref('')
const commentRating = ref(5)
const posting = ref(false)

onMounted(() => {
  fetchDetail()
  fetchComments()
  checkCanComment()
})

function fetchDetail() {
  loading.value = true
  apiGet(`/user/product/${route.params.id}`).then(res => {
    detail.value = res
    if (res?.skuList?.length) selectedSkuId.value = res.skuList[0].id
  }).catch(() => {
    ElMessage.error('加载商品详情失败')
  }).finally(() => loading.value = false)
}

function fetchComments(page = 1) {
  if (!route.params.id) return
  commentLoading.value = true
  commentPage.value = page
  apiGet('/user/comment/page', {
    productId: route.params.id,
    pageNum: commentPage.value,
    pageSize: commentSize.value
  }).then(res => {
    comments.value = res?.records || []
    commentTotal.value = res?.total || 0
  }).finally(() => {
    commentLoading.value = false
  })
}

function checkCanComment() {
  if (!route.params.id) return
  apiGet('/user/comment/can', {productId: route.params.id}, () => {}).then(res => {
    canComment.value = !!res
  }).catch(() => {
    canComment.value = false
  })
}

function addToCart() {
  if (!selectedSkuId.value) {
    ElMessage.warning('请选择规格')
    return
  }
  apiPost('/user/shoppingCart/add', {
    productId: detail.value.id,
    skuId: selectedSkuId.value,
    quantity: quantity.value
  }).then(() => {
    ElMessage.success('已加入购物车')
  })
}

function gotoCart() {
  router.push('/cart')
}

function submitComment() {
  if (!canComment.value) {
    ElMessage.warning('仅购买过该商品的用户才能评论')
    return
  }
  if (!commentContent.value.trim()) {
    ElMessage.warning('请填写评论内容')
    return
  }
  posting.value = true
  apiPost('/user/comment', {
    productId: detail.value.id,
    rating: commentRating.value,
    content: commentContent.value.trim()
  }).then(() => {
    ElMessage.success('评论已提交')
    commentContent.value = ''
    commentRating.value = 5
    fetchComments(1)
  }).finally(() => {
    posting.value = false
  })
}
</script>

<template>
  <div class="page-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品详情</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton :rows="10" :loading="loading" animated style="margin-top: 12px">
      <el-empty v-if="!detail" description="未找到该商品"/>
      <div v-else>
        <div class="card detail">
          <div class="cover">
            <div class="placeholder">{{ detail.name?.slice(0,1) || 'P' }}</div>
          </div>
          <div class="info">
            <div class="title">{{ detail.name }}</div>
            <div class="meta">
              <span>商品编号：{{ detail.id }}</span>
              <span v-if="currentSku">当前规格库存：{{ currentSku.stock ?? '—' }}</span>
            </div>
            <div class="desc">{{ detail.description || '暂无描述' }}</div>
            <div class="price">{{ priceText }}</div>

            <div class="badges">
              <el-tag type="success" effect="plain">正品保障</el-tag>
              <el-tag type="info" effect="plain">极速发货</el-tag>
              <el-tag type="warning" effect="plain">七天无理由</el-tag>
            </div>

            <div class="section">
              <div class="label">规格</div>
              <el-radio-group v-model="selectedSkuId">
                <el-radio-button
                    v-for="sku in detail.skuList"
                    :key="sku.id"
                    :label="sku.id"
                >
                  {{ sku.spec }}（¥{{ sku.price }}）
                </el-radio-button>
              </el-radio-group>
            </div>

            <div class="section">
              <div class="label">数量</div>
              <el-input-number v-model="quantity" :min="1" :max="99"/>
            </div>

            <div class="actions">
              <el-button type="primary" size="large" @click="addToCart">加入购物车</el-button>
              <el-button size="large" @click="gotoCart">去购物车</el-button>
            </div>
          </div>
        </div>

        <div class="card more">
          <div class="more-title">商品详情</div>
          <p class="more-text">
            {{ detail.description || '暂无更多详情信息，后续会持续完善商品文案。' }}
          </p>
        </div>

        <div class="card comments">
          <div class="comments-header">
            <div class="comments-title">用户评价</div>
            <div class="comments-sub">真实购买用户的评分与评论</div>
          </div>

          <div v-if="canComment" class="comment-editor">
            <div class="editor-row">
              <span class="label">我的评分：</span>
              <el-rate v-model="commentRating" :max="5" />
            </div>
            <el-input
                v-model="commentContent"
                type="textarea"
                :rows="3"
                maxlength="500"
                show-word-limit
                placeholder="分享一下你的使用体验吧~ 仅购买过该商品的用户可以评价"
            />
            <div class="editor-actions">
              <el-button type="primary" :loading="posting" @click="submitComment">提交评论</el-button>
            </div>
          </div>

          <el-empty v-if="!comments.length && !commentLoading" description="暂时还没有评论"/>
          <el-skeleton v-else :loading="commentLoading" :rows="4" animated>
            <div class="comment-list">
              <div v-for="item in comments" :key="item.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-user">{{ item.username }}</span>
                  <el-rate :model-value="item.rating" :max="5" disabled class="comment-rate"/>
                  <span class="comment-time">{{ dayjs(item.createdTime).format('YYYY-MM-DD HH:mm') }}</span>
                </div>
                <div class="comment-content">{{ item.content }}</div>
              </div>
            </div>
            <div class="comment-pagination" v-if="commentTotal > commentSize">
              <el-pagination
                  layout="prev, pager, next"
                  :current-page="commentPage"
                  :page-size="commentSize"
                  :total="commentTotal"
                  @current-change="fetchComments"
              />
            </div>
          </el-skeleton>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<style scoped>
.page-container {
  width: 85%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0;
}

.page-container :deep(.el-breadcrumb) {
  margin-bottom: 20px;
}

.page-container :deep(.el-breadcrumb__inner) {
  color: #6b7280;
  font-weight: 500;
}

.page-container :deep(.el-breadcrumb__inner.is-link) {
  color: #667eea;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.detail {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 32px;
}

.cover {
  background: linear-gradient(135deg, #eef3ff 0%, #e0e9ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  position: relative;
  overflow: hidden;
}

.cover::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(76, 111, 255, 0.1) 0%, transparent 70%);
  animation: shimmer 4s infinite;
}

@keyframes shimmer {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  50% { transform: translate(-50%, -50%) rotate(180deg); }
}

.placeholder {
  width: 140px;
  height: 140px;
  border-radius: 32px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 900;
  color: #4c6fff;
  box-shadow: 0 12px 40px rgba(76, 111, 255, 0.25);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.cover:hover .placeholder {
  transform: scale(1.1) rotate(5deg);
}

.info .title {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 12px;
  color: #1f2937;
  line-height: 1.3;
}

.meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.desc {
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 20px;
  font-size: 15px;
}

.price {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, #ff6b3c, #ff8c5a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
}

.badges {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.badges :deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
  padding: 6px 12px;
}

.section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.label {
  margin-bottom: 10px;
  color: #1f2937;
  font-weight: 700;
  font-size: 15px;
}

.info :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info :deep(.el-radio-button__inner) {
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.info :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  border-color: #4c6fff;
  box-shadow: 0 2px 8px rgba(76, 111, 255, 0.3);
}

.actions {
  margin-top: 28px;
  display: flex;
  gap: 16px;
}

.actions :deep(.el-button) {
  border-radius: 10px;
  font-weight: 600;
  padding: 14px 32px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  border: none;
}

.actions :deep(.el-button:hover:not(.is-disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 111, 255, 0.3);
}

.more {
  margin-top: 20px;
}

.more-title {
  font-weight: 800;
  font-size: 20px;
  margin-bottom: 16px;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef3ff;
}

.more-text {
  color: #6b7280;
  line-height: 2;
  font-size: 15px;
  white-space: pre-wrap;
}

.comments {
  margin-top: 20px;
}

.comments-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef3ff;
}

.comments-title {
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 6px;
}

.comments-sub {
  font-size: 14px;
  color: #9ca3af;
}

.comment-editor {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #e5e7eb;
}

.editor-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.editor-row .label {
  color: #6b7280;
  font-weight: 600;
  margin: 0;
  border: none;
  padding: 0;
}

.editor-actions {
  margin-top: 12px;
  text-align: right;
}

.editor-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.comment-item:hover {
  padding-left: 8px;
  background: #f9fafb;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-user {
  font-weight: 700;
  color: #1f2937;
}

.comment-time {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
}

.comment-content {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.7;
}

.comment-pagination {
  margin-top: 20px;
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>

