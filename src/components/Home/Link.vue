<script setup lang="ts">
// 友情连接数据
const links = [
  {
    name: '吾爱IIS',
    url: 'https://www.52iis.com',
    description: '专注于IIS服务器、ASP.NET、.NET Core等技术分享'
  },
  {
    name: '吾爱IIS - 在线免费PS',
    url: 'https://ps.52iis.com',
    description: '一个在线轻量级ps，提供在线免费使用，无需安装、配置、维护，直接在浏览器中使用即可。'
  },
  {
    name: '奥多工具箱',
    url: 'https://www.aodo.net',
    description: '奥多工具箱，提供json格式化、json压缩、md5加密、解密、二维码、正则表达式、照片压缩、pdf合并、pdf拆分、pdf加密、pdf解密、pdf压缩、pdf解压缩、pdf转换、pdf、等工具功能'
  },
  {
    name: 'Web-Tool',
    url: 'https://tools.ranblogs.com/',
    description: 'Web-Tool在线工具箱，一个轻量的在线工具箱'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/52IIS/52IIS_Tools',
    description: '52IIS_Tools项目仓库'
  }
]

// 打开链接
const openLink = (url: string) => {
  globalThis.window.open(url, '_blank')
}
</script>

<template>
  <div class="px-4 mx-auto my-8 max-w-5xl sm:px-6 lg:px-8">
    <article class="overflow-hidden bg-white rounded-lg shadow-md">
      <!-- 头部区域 -->
      <div class="p-6 text-white bg-gradient-to-r from-blue-500 to-purple-600">
        <h1 class="text-3xl font-bold">友情连接</h1>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-6 md:p-8">
        <!-- 介绍 -->
        <section class="mb-10">
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              以下是我们的友情连接，欢迎访问这些优质网站：
            </p>
          </div>
        </section>
        
        <!-- 友情连接列表 -->
        <section class="mb-10">
          <div class="grid gap-4 md:grid-cols-2">
            <div 
              v-for="(link, index) in links" 
              :key="index"
              class="p-6 bg-gray-50 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
            >
              <h3 class="text-xl font-bold text-gray-800">
                <el-link 
                  :href="link.url" 
                  target="_blank" 
                  type="primary" 
                  class="hover:text-blue-700"
                >
                  {{ link.name }}
                </el-link>
              </h3>
              <p class="mt-2 text-gray-600">{{ link.description }}</p>
              <el-button 
                class="mt-4" 
                type="primary" 
                size="small" 
                plain
                @click="openLink(link.url)"
              >
                访问网站
              </el-button>
            </div>
          </div>
        </section>
        
        <!-- 申请友链 -->
        <section class="mb-6">
          <h2 class="flex items-center mb-4 text-2xl font-bold text-gray-800">
            申请友链
          </h2>
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              如果您希望与我们交换友情连接，请通过以下方式联系我们：
            </p>
            <div class="p-4 mt-4 bg-blue-50 rounded border-l-4 border-blue-500">
              <p class="text-blue-700">
                请发送邮件至：micz518@qq.com，主题注明「友链申请」，并提供您的网站信息。
              </p>
            </div>
          </div>
        </section>
      </div>
      
      <!-- 底部区域 -->
      <div class="p-6 bg-gray-50 border-t border-gray-200">
        <div class="flex flex-col justify-between items-center md:flex-row">
          <p class="text-sm text-gray-600">
            <el-link href="https://www.52iis.com" target="_blank" type="primary">
              吾爱IIS - 52IIS.COM
            </el-link>
            © {{ new Date().getFullYear() }}
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.prose :where(a):not(:where([class~="not-prose"] *)) {
  color: #2563eb;
  text-decoration: none;
}

.prose :where(a:hover):not(:where([class~="not-prose"] *)) {
  color: #1d4ed8;
  text-decoration: underline;
}

/* 动画效果 */
article {
  transition: box-shadow 0.3s ease;
}

article:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>