<script setup lang="ts">
import { reactive, ref } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Delete, Plus, Camera, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, type UploadFile } from 'element-plus'
import jsQR from 'jsqr'

const info = reactive({
  title: "二维码识别",
  content: '支持扫描本地图片、上传图片或输入图片URL识别二维码内容',
  fileList: <UploadFile[]>[],
  fileUrl: '',
  urlInput: '',
  qrResult: '',
  loading: false
})

const upload = ref()
const canvasRef = ref<HTMLCanvasElement | null>(null)

//上传达到上限触发
const handleExceed = () => {
  ElMessage({
    message: '上传数量已达上限，请清除后重新上传',
    type: 'warning',
  })
}

// 处理图片上传
const handleChange = (file: UploadFile) => {
  info.fileList = [file]
  info.fileUrl = file.url as string
  info.qrResult = ''
  // 延迟执行识别，确保图片已加载
  setTimeout(() => {
    decodeQRCode()
  }, 100)
}

// 处理URL识别
const handleUrlIdentify = () => {
  if (!info.urlInput.trim()) {
    ElMessage.warning('请输入图片URL')
    return
  }
  
  info.fileUrl = info.urlInput.trim()
  info.qrResult = ''
  decodeQRCode()
}

// 移除图片
const handleRemove = (file: UploadFile) => {
  info.fileList = []
  info.fileUrl = ''
  info.qrResult = ''
}

// 二维码识别核心逻辑
const decodeQRCode = async () => {
  if (!info.fileUrl || !canvasRef.value) return

  info.loading = true
  try {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = info.fileUrl

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('图片加载失败'))
    })

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸与图片一致
    canvas.width = image.width
    canvas.height = image.height

    // 绘制图片到canvas
    ctx.drawImage(image, 0, 0, image.width, image.height)

    // 获取canvas图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // 使用jsQR识别二维码，优化配置提高识别率
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
      threshold: 128
    })

    if (code) {
      info.qrResult = code.data
      ElMessage.success('二维码识别成功')
    } else {
      info.qrResult = ''
      ElMessage.warning('未识别到二维码，请检查图片是否清晰')
    }
  } catch (error) {
    console.error('识别失败:', error)
    ElMessage.error('二维码识别失败，请重试')
  } finally {
    info.loading = false
  }
}

// 清空所有内容
const clearAll = () => {
  info.fileList = []
  info.fileUrl = ''
  info.urlInput = ''
  info.qrResult = ''
  if (upload.value) {
    upload.value.clearFiles()
  }
}
</script>

<template>
  <div class="flex flex-col flex-1 mt-3 mr-3 ml-4">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 w-full bg-white rounded-2xl">
      <div class="flex flex-col items-center mb-6">
        <div class="mb-4 text-center">
          <el-text>{{ info.content }}</el-text>
        </div>
        
        <!-- 图片URL输入框 -->
        <div class="flex gap-2 mb-4 w-full max-w-2xl">
          <el-input
            v-model="info.urlInput"
            placeholder="请输入图片URL"
            class="flex-1"
          >
            <template #append>
              <el-button type="primary" @click="handleUrlIdentify">
                识别
              </el-button>
            </template>
          </el-input>
        </div>
        
        <!-- 本地图片上传 -->
        <div class="flex gap-3 mb-2">
          <el-upload 
            ref="upload"
            action="#" 
            :auto-upload="false" 
            :limit="1" 
            list-type="picture-card" 
            accept=".png,.jpg,.jpeg,.bmp,.gif"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            :file-list="info.fileList">
            <el-icon class="text-4xl"><Camera /></el-icon>
            <div class="mt-2">上传图片</div>
            <template #file="{ file }">
              <div class="w-full border-2 border-blue-400">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="二维码图片" />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>
        </div>
      </div>



      <!-- 识别结果区域 -->
      <div v-if="info.qrResult" class="mb-6">
        <div class="mb-2 text-center">
          <el-text type="success">识别结果</el-text>
        </div>
        <div class="flex justify-center">
          <div class="relative w-full max-w-2xl">
            <el-input
              v-model="info.qrResult"
              type="textarea"
              :rows="4"
              class="w-full"
              placeholder="识别到的二维码内容"
              readonly
            />
            <div 
              class="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-blue-500"
              @click="() => {
                navigator.clipboard.writeText(info.qrResult);
                ElMessage.success('复制成功');
              }"
              title="复制内容"
            >
              <el-icon class="w-5 h-5"><CopyDocument /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div v-if="info.fileUrl || info.urlInput" class="flex justify-center">
        <el-button type="default" @click="clearAll">
          重置
        </el-button>
      </div>

      <!-- 隐藏的canvas，用于二维码识别 -->
      <canvas ref="canvasRef" class="hidden"></canvas>

      <!-- 加载状态 -->
      <el-loading v-if="info.loading" target=".bg-white" fullscreen-text="识别中..." />
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        在线二维码识别工具，支持上传本地图片、输入图片URL识别二维码内容。<br>
        支持格式：PNG、JPG、JPEG、BMP、GIF等。<br>
        使用说明：<br>
        1. 方式一：点击"上传图片"按钮选择包含二维码的图片，系统自动识别<br>
        2. 方式二：在输入框中输入图片URL，点击"识别"按钮<br>
        3. 查看识别结果，可复制使用<br>
        4. 点击"重置"按钮可清除所有选择和输入
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>
</style>