<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const info = reactive({
  title: "Base64图片转换",
})

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']

const uploadRef = ref()
const fileList = ref()
const imagePreviewUrl = ref('')
const base64Result = ref('')
const base64Input = ref('')
const imageFromBase64 = ref('')
const errorMsg = ref('')
const activeTab = ref('imageToBase64')

const handleFileChange = (uploadFile: any) => {
  const file = uploadFile.raw
  if (!file) return

  if (!ALLOWED_FORMATS.includes(file.type)) {
    ElMessage({
      message: '不支持的文件格式，请上传图片文件',
      type: 'error',
      duration: 2000
    })
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    ElMessage({
      message: '文件大小超过限制（最大10MB）',
      type: 'error',
      duration: 2000
    })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    base64Result.value = result
    imagePreviewUrl.value = result
    errorMsg.value = ''
  }
  reader.onerror = () => {
    ElMessage({
      message: '文件读取失败',
      type: 'error',
      duration: 2000
    })
  }
  reader.readAsDataURL(file)
}

const convertBase64ToImage = () => {
  errorMsg.value = ''
  imageFromBase64.value = ''
  
  const base64Str = base64Input.value.trim()
  
  if (!base64Str) {
    ElMessage({
      message: '请输入Base64编码',
      type: 'warning',
      duration: 2000
    })
    return
  }

  try {
    if (base64Str.startsWith('data:image/')) {
      imageFromBase64.value = base64Str
    } else {
      const formattedBase64 = `data:image/png;base64,${base64Str}`
      imageFromBase64.value = formattedBase64
    }
  } catch (error) {
    errorMsg.value = 'Base64编码格式错误，请检查输入'
    ElMessage({
      message: 'Base64编码格式错误',
      type: 'error',
      duration: 2000
    })
  }
}

const copyBase64 = () => {
  if (!base64Result.value) {
    ElMessage({
      message: '暂无Base64编码可复制',
      type: 'warning',
      duration: 2000
    })
    return
  }
  copy(base64Result.value)
}

const downloadImage = (dataUrl: string, filename: string = 'image.png') => {
  if (!dataUrl) {
    ElMessage({
      message: '暂无图片可下载',
      type: 'warning',
      duration: 2000
    })
    return
  }

  try {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage({
      message: '下载成功',
      type: 'success',
      duration: 1500
    })
  } catch (error) {
    ElMessage({
      message: '下载失败',
      type: 'error',
      duration: 2000
    })
  }
}

const downloadConvertedImage = () => {
  if (!imageFromBase64.value) {
    ElMessage({
      message: '请先转换Base64编码',
      type: 'warning',
      duration: 2000
    })
    return
  }

  const mimeType = imageFromBase64.value.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png'
  const ext = mimeType.split('/')[1] || 'png'
  const filename = `converted-image.${ext}`
  downloadImage(imageFromBase64.value, filename)
}

const clearImageToBase64 = () => {
  base64Result.value = ''
  imagePreviewUrl.value = ''
  errorMsg.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const clearBase64ToImage = () => {
  base64Input.value = ''
  imageFromBase64.value = ''
  errorMsg.value = ''
}

const handleExceed = () => {
  uploadRef.value?.clearFiles()
  ElMessage({
    message: '只能上传一个文件，请先清除已上传的文件',
    type: 'warning',
    duration: 2000
  })
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="图片转Base64" name="imageToBase64">
          <div class="space-y-4">
            <div>
              <el-upload
                ref="uploadRef"
                v-model:file-list="fileList"
                class="upload-demo"
                action=""
                accept="image/*"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-exceed="handleExceed"
                :limit="1"
                :show-file-list="true"
              >
                <el-button type="primary">选择图片文件</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 JPG、PNG、GIF、WebP、BMP 格式，最大 10MB
                  </div>
                </template>
              </el-upload>
            </div>

            <div v-if="imagePreviewUrl" class="space-y-4">
              <div>
                <el-text class="font-bold">图片预览</el-text>
                <div class="mt-2 p-4 bg-gray-100 rounded-lg flex justify-center">
                  <img :src="imagePreviewUrl" alt="预览图片" class="max-w-full max-h-64 object-contain rounded border">
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-2">
                  <el-text class="font-bold">Base64编码结果</el-text>
                  <div class="flex gap-2">
                    <el-button type="primary" size="small" @click="copyBase64">复制编码</el-button>
                    <el-button type="danger" size="small" @click="clearImageToBase64">清空</el-button>
                  </div>
                </div>
                <el-input
                  v-model="base64Result"
                  type="textarea"
                  :rows="8"
                  readonly
                  placeholder="Base64编码将显示在这里"
                ></el-input>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <el-empty :image-size="150" description="请上传图片文件"></el-empty>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Base64转图片" name="base64ToImage">
          <div class="space-y-4">
            <div>
              <el-text class="font-bold">输入Base64编码</el-text>
              <div class="mt-2">
                <el-input
                  v-model="base64Input"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入Base64编码（支持带或不带 data:image/...;base64, 前缀）"
                ></el-input>
              </div>
              <div class="mt-3 flex gap-2">
                <el-button type="primary" @click="convertBase64ToImage">转换为图片</el-button>
                <el-button type="danger" @click="clearBase64ToImage">清空</el-button>
              </div>
            </div>

            <div v-if="imageFromBase64" class="space-y-4">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <el-text class="font-bold">图片预览</el-text>
                  <el-button type="success" size="small" @click="downloadConvertedImage">下载图片</el-button>
                </div>
                <div class="p-4 bg-gray-100 rounded-lg flex justify-center">
                  <img :src="imageFromBase64" alt="转换后的图片" class="max-w-full max-h-64 object-contain rounded border">
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <el-empty :image-size="150" description="请输入Base64编码并点击转换"></el-empty>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-if="errorMsg" class="mt-4">
        <el-alert type="error" :title="errorMsg" show-icon :closable="true" @close="errorMsg = ''"></el-alert>
      </div>
    </div>

    <ToolDetail title="功能说明">
      <el-text>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>图片转Base64：</strong>上传图片文件，自动转换为Base64编码字符串，支持复制和预览</li>
          <li><strong>Base64转图片：</strong>输入Base64编码字符串，转换为可预览的图片，支持下载</li>
          <li><strong>支持的格式：</strong>JPG、PNG、GIF、WebP、BMP</li>
          <li><strong>文件大小限制：</strong>最大支持10MB的图片文件</li>
          <li><strong>智能识别：</strong>自动识别带或不带 data:image/...;base64, 前缀的Base64编码</li>
        </ul>
      </el-text>
    </ToolDetail>

    <ToolDetail title="使用场景">
      <el-text>
        <ul class="list-disc pl-5 space-y-2">
          <li>在HTML/CSS中直接嵌入图片，减少HTTP请求</li>
          <li>在JSON数据中传输图片信息</li>
          <li>在移动应用开发中存储和传输图片</li>
          <li>在邮件中嵌入图片</li>
          <li>在数据URI中使用图片</li>
        </ul>
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
