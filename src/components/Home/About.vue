<script setup lang="ts">
import { Star, Cpu, Failed, Operation } from '@element-plus/icons-vue'
</script>

<template>
  <div class="px-4 mx-auto my-8 max-w-5xl sm:px-6 lg:px-8">
    <article class="overflow-hidden bg-white rounded-lg shadow-md">
      <!-- 头部区域 -->
      <div class="p-6 text-white bg-gradient-to-r from-blue-500 to-purple-600">
        <h1 class="text-3xl font-bold">关于 吾爱IIS - 52IIS.COM Tools</h1>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-6 md:p-8">
        <!-- 项目介绍 -->
        <section class="mb-10">
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              <el-link href="https://github.com/52IIS/52IIS_Tools" target="_blank" type="primary" class="font-medium text-blue-600 hover:text-blue-800">
                吾爱IIS在线工具箱
              </el-link>
              是一款免费开源的轻量在线工具箱，致力于为开发者和普通用户提供便捷、实用的在线工具集。
            </p>
            <p class="mt-4 leading-relaxed text-gray-700">
              目前已包含开发工具、文本处理、媒体转换、图表生成、生活实用、信息查询等多个分类的工具，
              持续更新中。
            </p>
            <div class="p-4 mt-6 bg-blue-50 rounded border-l-4 border-blue-500">
              <p class="text-blue-700">
                <el-icon class="mr-2"><Star /></el-icon>
                如果对您有帮助，请将其分享给您的朋友，并且添加到收藏夹中！顺便再给项目点个⭐️吧！
              </p>
            </div>
          </div>
        </section>
        
        <!-- 技术栈 -->
        <section class="mb-10">
          <h2 class="flex items-center mb-4 text-2xl font-bold text-gray-800">
            <el-icon class="mr-2 text-blue-500"><Cpu /></el-icon>
            技术栈
          </h2>
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              项目主要基于现代前端技术栈开发，确保高性能和良好的用户体验：
            </p>
            <div class="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3">
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span class="font-medium text-gray-800">框架</span>
                <p class="text-sm text-gray-600">Vue 3 + Vite</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span class="font-medium text-gray-800">UI组件</span>
                <p class="text-sm text-gray-600">Element Plus</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span class="font-medium text-gray-800">语言</span>
                <p class="text-sm text-gray-600">TypeScript</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span class="font-medium text-gray-800">样式</span>
                <p class="text-sm text-gray-600">Tailwind CSS</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span class="font-medium text-gray-800">构建</span>
                <p class="text-sm text-gray-600">Vite</p>
              </div>
            </div>
            <p class="mt-4 leading-relaxed text-gray-700">
              项目使用了多个优质的第三方开源库，您可以在仓库的 
              <el-link href="https://github.com/52IIS/52IIS_Tools/blob/main/package.json" target="_blank" type="primary">
                package.json
              </el-link> 
              文件中找到完整的依赖列表。
            </p>
          </div>
        </section>
        
        <!-- Bug反馈 -->
        <section class="mb-10">
          <h2 class="flex items-center mb-4 text-2xl font-bold text-gray-800">
            <el-icon class="mr-2 text-blue-500"><Failed /></el-icon>
            发现了 Bug？
          </h2>
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              如果您发现了 Bug，或者某些功能未能按预期工作，请在 GitHub 仓库的 
              <el-link type="primary" target="_blank" href="https://github.com/52IIS/52IIS_Tools/issues/new" class="">
                Issues
              </el-link> 
              中提交错误报告。
            </p>
            <p class="mt-2 leading-relaxed text-gray-700">
              在提交 Bug 报告时，请尽可能详细地描述问题，包括复现步骤、预期结果和实际结果，
              这将帮助我们更快地定位和修复问题。
            </p>
          </div>
        </section>
        
        <!-- 贡献指南 -->
        <section class="mb-6">
          <h2 class="flex items-center mb-4 text-2xl font-bold text-gray-800">
            <el-icon class="mr-2 text-blue-500"><Operation /></el-icon>
            贡献指南
          </h2>
          <div class="max-w-none prose">
            <p class="leading-relaxed text-gray-700">
              欢迎您参与项目的开发和维护！如果您有新功能建议或想要修复已知问题，可以通过以下方式贡献：
            </p>
            <ol class="mt-3 space-y-2 list-decimal list-inside text-gray-700">
              <li>Fork 项目到您的 GitHub 账号</li>
              <li>创建一个新的分支进行开发</li>
              <li>提交您的修改并推送到远程分支</li>
              <li>创建一个 Pull Request 描述您的修改</li>
            </ol>
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
          <div class="mt-3 md:mt-0">
            <el-button 
              type="primary" 
              plain 
              size="small"
              href="https://github.com/52IIS/52IIS_Tools" 
              target="_blank"
            >
              <el-icon><Star /></el-icon>
              GitHub 仓库
            </el-button>
          </div>
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