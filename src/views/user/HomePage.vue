<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {apiGet} from "@/net/index.js";
import ProductCard from "@/components/ProductCard.vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {Search} from "@element-plus/icons-vue";

const route = useRoute()
const router = useRouter()

const categories = ref([])
const loading = ref(false)
const productList = ref([])
const pagination = reactive({
  pageNum: 1,
  pageSize: 8,
  total: 0
})
const filters = reactive({
  categoryId: null,
  keyword: ''
})

onMounted(() => {
  fetchCategories()
  const kw = route.query.keyword
  if (kw) filters.keyword = kw
  fetchProducts()
})

watch(() => route.query.keyword, (val) => {
  filters.keyword = val || ''
  pagination.pageNum = 1
  fetchProducts()
})

function fetchCategories() {
  apiGet('/user/category/list').then(res => {
    categories.value = res || []
  })
}

function fetchProducts() {
  loading.value = true
  apiGet('/user/product/page', {
    categoryId: filters.categoryId,
    productName: filters.keyword,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize
  }).then(res => {
    if (res) {
      productList.value = res.records || res.records || []
      pagination.total = res.total || 0
    }
  }).catch(() => {
    ElMessage.warning('加载商品失败')
  }).finally(() => loading.value = false)
}

function handleCategoryChange(id) {
  filters.categoryId = id
  pagination.pageNum = 1
  fetchProducts()
}

function handlePageChange(page) {
  pagination.pageNum = page
  fetchProducts()
}

function clearKeyword() {
  filters.keyword = ''
  router.replace({query: {}})
  fetchProducts()
}

function handleSearch() {
  router.replace({query: {keyword: filters.keyword || undefined}})
  pagination.pageNum = 1
  fetchProducts()
}
</script>

<template>
  <div class="home-page">
    <!-- 顶部大横幅 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到 Baima Mall</h1>
        <p class="hero-sub">
          精选好物 · 合理价格 · 简洁体验，支持分类筛选与关键字搜索
        </p>
        <div class="hero-actions">
          <el-button type="primary" @click="handleCategoryChange(null)">浏览全部商品</el-button>
          <el-button @click="$router.push('/cart')">查看购物车</el-button>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-tag">今日推荐</div>
        <div class="hero-tip">从分类开始，快速找到你想要的商品。</div>
      </div>
    </section>

    <!-- 分类 + 列表 -->
    <section class="content">
      <aside class="sidebar">
        <div class="sidebar-title">商品分类</div>
        <el-menu class="category-menu" :default-active="filters.categoryId ?? 'all'">
          <el-menu-item index="all" @click="handleCategoryChange(null)">全部商品</el-menu-item>
          <el-menu-item
              v-for="c in categories"
              :key="c.id"
              :index="String(c.id)"
              @click="handleCategoryChange(c.id)"
          >
            {{ c.name }}
          </el-menu-item>
        </el-menu>
      </aside>

      <main class="main">
        <div class="card">
          <div class="card-title">
            <div>
              <div class="title">商品列表</div>
              <div class="subtitle">支持分类与搜索栏关键字组合筛选</div>
            </div>
            <div class="title-actions">
              <span class="total">共 {{ pagination.total }} 条</span>
              <el-button size="small" text type="primary" @click="clearKeyword">重置筛选</el-button>
            </div>
          </div>

          <el-skeleton :loading="loading" animated :rows="6">
            <el-empty v-if="!productList.length && !loading" description="暂无商品"/>
            <div v-else class="grid">
              <ProductCard v-for="item in productList" :key="item.id" :item="item"/>
            </div>
          </el-skeleton>

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
      </main>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 20px 0;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 12px;
  letter-spacing: -1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-sub {
  opacity: 0.95;
  font-size: 15px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.hero-actions :deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.hero-actions :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.hero-side {
  text-align: right;
  position: relative;
  z-index: 1;
}

.hero-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-tip {
  font-size: 14px;
  opacity: 0.95;
  line-height: 1.5;
}

.content {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 20px;
}

.sidebar {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 100px;
}

.sidebar-title {
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 16px;
  color: #1f2937;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef3ff;
}

.category-menu {
  border-right: none;
}

.category-menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.category-menu :deep(.el-menu-item:hover) {
  background: #eef3ff;
  color: #4c6fff;
}

.category-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #4c6fff, #3d5ae8);
  color: #fff;
  font-weight: 600;
}

.main .card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.title {
  font-weight: 800;
  font-size: 20px;
  color: #1f2937;
  margin-bottom: 4px;
}

.subtitle {
  color: #9ca3af;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>

