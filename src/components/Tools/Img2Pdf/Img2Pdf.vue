<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">将多张照片合并为单个PDF文件，支持自定义页面大小、方向、照片旋转和位置调整。</el-text>
      </div>

      <div class="settings-section mb-4">
        <div class="settings-row">
          <div class="setting-item">
            <span class="setting-label">页面大小：</span>
            <el-select v-model="pageSize" style="width: 120px" @change="updatePreview">
              <el-option v-for="size in pageSizes" :key="size.name" :label="size.name" :value="size.name" />
            </el-select>
          </div>
          <div class="setting-item">
            <span class="setting-label">页面方向：</span>
            <el-radio-group v-model="pageOrientation" @change="updatePreview">
              <el-radio-button label="portrait">纵向</el-radio-button>
              <el-radio-button label="landscape">横向</el-radio-button>
            </el-radio-group>
          </div>
          <div class="setting-item">
            <el-checkbox v-model="enableCustomBackground" @change="updatePreview">启用自定义背景</el-checkbox>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <el-upload
          action=""
          accept="image/*"
          :auto-upload="false"
          :on-change="onFileChange"
          :multiple="true"
          :show-file-list="false"
        >
          <el-button type="primary">选择照片文件</el-button>
        </el-upload>
        <el-button v-if="images.length" type="success" class="ml-3" @click="generatePDF" :disabled="loading || images.length === 0">
          {{ loading ? '生成中...' : '生成PDF' }}
        </el-button>
        <el-button v-if="images.length" type="warning" class="ml-3" @click="clearAll">清空全部</el-button>
      </div>

      <div v-if="images.length" class="images-section">
        <div class="images-toolbar mb-3">
          <el-text type="info">共 {{ images.length }} 张照片</el-text>
          <div class="toolbar-actions">
            <el-button size="small" @click="selectAll">全选</el-button>
            <el-button size="small" @click="deselectAll">取消选择</el-button>
            <el-button size="small" type="danger" @click="removeSelected" :disabled="selectedImages.length === 0">删除选中</el-button>
          </div>
        </div>

        <div class="images-grid">
          <div 
            v-for="(img, idx) in images" 
            :key="img.uid" 
            class="image-card"
            :class="{ selected: selectedImages.includes(idx) }"
            @click="toggleSelect(idx)"
          >
            <div class="image-preview">
              <img :src="img.url" :style="{ transform: `rotate(${img.rotation}deg)` }" />
              <div v-if="selectedImages.includes(idx)" class="selected-badge">
                <el-icon><Check /></el-icon>
              </div>
            </div>
            <div class="image-info">
              <span class="image-name" :title="img.name">{{ img.name }}</span>
              <span class="image-size">{{ formatFileSize(img.size) }}</span>
            </div>
            <div class="image-actions">
              <el-button-group size="small">
                <el-button @click.stop="rotateImage(idx, -90)" title="逆时针旋转90°">
                  <el-icon><RefreshLeft /></el-icon>
                </el-button>
                <el-button @click.stop="rotateImage(idx, 90)" title="顺时针旋转90°">
                  <el-icon><RefreshRight /></el-icon>
                </el-button>
              </el-button-group>
              <el-button size="small" @click.stop="openSizeEditor(idx)" title="调整大小和位置">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button v-if="enableCustomBackground" size="small" @click.stop="openBackgroundPicker(idx)" title="设置背景">
                <el-icon><PictureFilled /></el-icon>
              </el-button>
            </div>
            <div class="image-order">
              <el-button size="small" @click.stop="moveImage(idx, -1)" :disabled="idx === 0" title="上移">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button size="small" @click.stop="moveImage(idx, 1)" :disabled="idx === images.length - 1" title="下移">
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="loadingMsg" show-icon :closable="false" />
        <el-progress :percentage="progress" :format="() => `${progress}%`" class="mt-2" />
      </div>

      <div v-if="generatedPDF" class="mt-3">
        <el-alert type="success" title="PDF生成成功！" show-icon :closable="false" />
        <div class="mt-3">
          <el-button type="primary" @click="downloadPDF">下载PDF文件</el-button>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </div>
    </div>

    <ToolDetail title="PDF预览">
      <div v-if="images.length" class="preview-container">
        <div class="preview-pages">
          <div 
            v-for="(img, idx) in images" 
            :key="'preview-' + img.uid" 
            class="preview-page"
            :style="getPreviewPageStyle()"
          >
            <div 
              v-if="img.background" 
              class="preview-background"
              :style="{ backgroundImage: `url(${img.background})` }"
            ></div>
            <img 
              :src="img.url" 
              class="preview-image"
              :style="getPreviewImageStyle(img)"
            />
            <div class="preview-page-num">{{ idx + 1 }}</div>
          </div>
        </div>
      </div>
      <el-empty v-else description="请先上传照片" />
    </ToolDetail>

    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>点击"选择照片文件"按钮，选择多张需要转换的照片。</li>
          <li>在页面设置区域选择PDF页面大小（A4、A3等）和方向（纵向/横向）。</li>
          <li>点击照片可选中，选中后可批量删除或单独编辑。</li>
          <li>使用旋转按钮可调整照片方向（支持90°、180°、270°旋转）。</li>
          <li>点击编辑按钮可调整照片在PDF页面中的大小和位置。</li>
          <li>启用自定义背景后，可为每张照片设置独立的背景图片。</li>
          <li>使用上移/下移按钮调整照片在PDF中的顺序。</li>
          <li>点击"生成PDF"按钮生成并下载PDF文件。</li>
          <li>支持JPG、PNG、GIF、BMP等常见图片格式。</li>
        </ul>
      </el-text>
    </ToolDetail>

    <el-dialog v-model="sizeEditorVisible" title="调整照片大小和位置" width="500px">
      <div v-if="currentEditImage !== null" class="size-editor">
        <div class="editor-preview" :style="getPreviewPageStyle()">
          <div class="editor-preview-content">
            <img 
              :src="images[currentEditImage]?.url" 
              :style="getEditorPreviewStyle()"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
            />
          </div>
        </div>
        <div class="editor-controls">
          <div class="control-row">
            <span class="control-label">缩放比例：</span>
            <el-slider v-model="editScale" :min="10" :max="200" :format-tooltip="(val: number) => `${val}%`" @input="updateEditPreview" />
          </div>
          <div class="control-row">
            <span class="control-label">水平位置：</span>
            <el-slider v-model="editOffsetX" :min="-50" :max="50" :format-tooltip="(val: number) => `${val}%`" @input="updateEditPreview" />
          </div>
          <div class="control-row">
            <span class="control-label">垂直位置：</span>
            <el-slider v-model="editOffsetY" :min="-50" :max="50" :format-tooltip="(val: number) => `${val}%`" @input="updateEditPreview" />
          </div>
          <div class="control-row">
            <el-button size="small" @click="resetImageSettings">重置为默认</el-button>
            <el-button size="small" type="primary" @click="applyImageSettings">应用到当前照片</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="backgroundPickerVisible" title="设置背景图片" width="500px">
      <div v-if="currentEditImage !== null" class="background-picker">
        <div class="current-background mb-3">
          <el-text>当前背景：</el-text>
          <div v-if="images[currentEditImage]?.background" class="background-preview">
            <img :src="images[currentEditImage]?.background ?? undefined" />
            <el-button type="danger" size="small" @click="removeBackground">移除背景</el-button>
          </div>
          <el-text v-else type="info">未设置背景</el-text>
        </div>
        <el-upload
          action=""
          accept="image/*"
          :auto-upload="false"
          :on-change="onBackgroundChange"
          :show-file-list="false"
        >
          <el-button type="primary">选择背景图片</el-button>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { PDFDocument } from 'pdf-lib'
import { Check, RefreshLeft, RefreshRight, Edit, ArrowUp, ArrowDown, PictureFilled } from '@element-plus/icons-vue'

const info = reactive({
  title: "📷 照片转PDF",
})

interface ImageItem {
  uid: string
  name: string
  size: number
  url: string
  rotation: number
  scale: number
  offsetX: number
  offsetY: number
  background: string | null
  raw: File
}

const pageSizes = [
  { name: 'A4', width: 210, height: 297 },
  { name: 'A3', width: 297, height: 420 },
  { name: 'A5', width: 148, height: 210 },
  { name: 'Letter', width: 216, height: 279 },
  { name: 'Legal', width: 216, height: 356 },
]

const pageSize = ref('A4')
const pageOrientation = ref<'portrait' | 'landscape'>('portrait')
const enableCustomBackground = ref(false)

const images = ref<ImageItem[]>([])
const selectedImages = ref<number[]>([])
const loading = ref(false)
const loadingMsg = ref('')
const progress = ref(0)
const errorMsg = ref('')
const generatedPDF = ref('')

const sizeEditorVisible = ref(false)
const currentEditImage = ref<number | null>(null)
const editScale = ref(100)
const editOffsetX = ref(0)
const editOffsetY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

const backgroundPickerVisible = ref(false)

const currentPageSize = computed(() => {
  const size = pageSizes.find(s => s.name === pageSize.value) || pageSizes[0]
  if (pageOrientation.value === 'landscape') {
    return { width: size.height, height: size.width }
  }
  return size
})

const onFileChange = (file: any) => {
  if (!file || !file.raw) return
  if (!file.raw.type.startsWith('image/')) {
    errorMsg.value = '请选择图片文件'
    return
  }

  errorMsg.value = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    const newImage: ImageItem = {
      uid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      url: e.target?.result as string,
      rotation: 0,
      scale: 100,
      offsetX: 0,
      offsetY: 0,
      background: null,
      raw: file.raw
    }
    images.value.push(newImage)
  }
  reader.readAsDataURL(file.raw)
}

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

const toggleSelect = (idx: number) => {
  const index = selectedImages.value.indexOf(idx)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
  } else {
    selectedImages.value.push(idx)
  }
}

const selectAll = () => {
  selectedImages.value = images.value.map((_, idx) => idx)
}

const deselectAll = () => {
  selectedImages.value = []
}

const removeSelected = () => {
  const toRemove = [...selectedImages.value].sort((a, b) => b - a)
  toRemove.forEach(idx => {
    images.value.splice(idx, 1)
  })
  selectedImages.value = []
}

const rotateImage = (idx: number, degrees: number) => {
  images.value[idx].rotation = (images.value[idx].rotation + degrees + 360) % 360
}

const moveImage = (idx: number, direction: number) => {
  const newIdx = idx + direction
  if (newIdx < 0 || newIdx >= images.value.length) return
  const temp = images.value[idx]
  images.value[idx] = images.value[newIdx]
  images.value[newIdx] = temp
}

const openSizeEditor = (idx: number) => {
  currentEditImage.value = idx
  editScale.value = images.value[idx].scale
  editOffsetX.value = images.value[idx].offsetX
  editOffsetY.value = images.value[idx].offsetY
  sizeEditorVisible.value = true
}

const updateEditPreview = () => {}

const getEditorPreviewStyle = () => {
  return {
    transform: `rotate(${images.value[currentEditImage.value!]?.rotation || 0}deg) scale(${editScale.value / 100})`,
    left: `calc(50% + ${editOffsetX.value}%)`,
    top: `calc(50% + ${editOffsetY.value}%)`,
    transformOrigin: 'center center',
    position: 'absolute' as const,
    translate: '-50% -50%',
    maxWidth: '90%',
    maxHeight: '90%',
    cursor: isDragging.value ? 'grabbing' : 'grab'
  }
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = e.clientX - editOffsetX.value * 2
  dragStartY.value = e.clientY - editOffsetY.value * 2
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  const deltaX = (e.clientX - dragStartX.value) / 2
  const deltaY = (e.clientY - dragStartY.value) / 2
  editOffsetX.value = Math.max(-50, Math.min(50, deltaX))
  editOffsetY.value = Math.max(-50, Math.min(50, deltaY))
}

const endDrag = () => {
  isDragging.value = false
}

const resetImageSettings = () => {
  editScale.value = 100
  editOffsetX.value = 0
  editOffsetY.value = 0
}

const applyImageSettings = () => {
  if (currentEditImage.value !== null) {
    images.value[currentEditImage.value].scale = editScale.value
    images.value[currentEditImage.value].offsetX = editOffsetX.value
    images.value[currentEditImage.value].offsetY = editOffsetY.value
  }
  sizeEditorVisible.value = false
}

const openBackgroundPicker = (idx: number) => {
  currentEditImage.value = idx
  backgroundPickerVisible.value = true
}

const onBackgroundChange = (file: any) => {
  if (!file || !file.raw) return
  if (!file.raw.type.startsWith('image/')) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (currentEditImage.value !== null) {
      images.value[currentEditImage.value].background = e.target?.result as string
    }
    backgroundPickerVisible.value = false
  }
  reader.readAsDataURL(file.raw)
}

const removeBackground = () => {
  if (currentEditImage.value !== null) {
    images.value[currentEditImage.value].background = null
  }
  backgroundPickerVisible.value = false
}

const getPreviewPageStyle = () => {
  const ratio = currentPageSize.value.width / currentPageSize.value.height
  return {
    aspectRatio: ratio.toString(),
    width: '100%',
    maxWidth: '200px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    position: 'relative' as const,
    overflow: 'hidden'
  }
}

const getPreviewImageStyle = (img: ImageItem) => {
  return {
    transform: `rotate(${img.rotation}deg) scale(${img.scale / 100})`,
    position: 'absolute' as const,
    left: `calc(50% + ${img.offsetX}%)`,
    top: `calc(50% + ${img.offsetY}%)`,
    transformOrigin: 'center center',
    translate: '-50% -50%',
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain' as const
  }
}

const updatePreview = () => {}

const clearAll = () => {
  images.value = []
  selectedImages.value = []
  generatedPDF.value = ''
  errorMsg.value = ''
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

const generatePDF = async () => {
  if (images.value.length === 0) {
    errorMsg.value = '请先上传照片'
    return
  }

  loading.value = true
  loadingMsg.value = '正在生成PDF...'
  progress.value = 0
  errorMsg.value = ''
  generatedPDF.value = ''

  try {
    const pdfDoc = await PDFDocument.create()
    const mmToPt = 2.83465
    
    const pageWidth = currentPageSize.value.width * mmToPt
    const pageHeight = currentPageSize.value.height * mmToPt

    for (let i = 0; i < images.value.length; i++) {
      const img = images.value[i]
      progress.value = Math.round((i / images.value.length) * 80)
      loadingMsg.value = `正在处理第 ${i + 1}/${images.value.length} 张照片...`

      const page = pdfDoc.addPage([pageWidth, pageHeight])

      if (enableCustomBackground.value && img.background) {
        try {
          const bgImg = await loadImage(img.background)
          const canvas = document.createElement('canvas')
          canvas.width = bgImg.width
          canvas.height = bgImg.height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(bgImg, 0, 0)
          const bgBytes = await fetch(canvas.toDataURL('image/jpeg', 0.8)).then(r => r.arrayBuffer())
          let bgEmbedded
          if (img.background.includes('png')) {
            bgEmbedded = await pdfDoc.embedPng(bgBytes)
          } else {
            bgEmbedded = await pdfDoc.embedJpg(bgBytes)
          }
          page.drawImage(bgEmbedded, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          })
        } catch (e) {
          console.warn('背景图片嵌入失败:', e)
        }
      }

      const imageImg = await loadImage(img.url)
      const canvas = document.createElement('canvas')
      
      const radians = (img.rotation * Math.PI) / 180
      const cos = Math.abs(Math.cos(radians))
      const sin = Math.abs(Math.sin(radians))
      const newWidth = imageImg.width * cos + imageImg.height * sin
      const newHeight = imageImg.width * sin + imageImg.height * cos
      
      canvas.width = newWidth
      canvas.height = newHeight
      const ctx = canvas.getContext('2d')!
      
      ctx.translate(newWidth / 2, newHeight / 2)
      ctx.rotate(radians)
      ctx.drawImage(imageImg, -imageImg.width / 2, -imageImg.height / 2)

      const imgBytes = await fetch(canvas.toDataURL('image/jpeg', 0.9)).then(r => r.arrayBuffer())
      const embeddedImg = await pdfDoc.embedJpg(imgBytes)

      const scale = img.scale / 100
      let drawWidth = embeddedImg.width * scale
      let drawHeight = embeddedImg.height * scale

      const maxWidth = pageWidth * 0.9
      const maxHeight = pageHeight * 0.9
      if (drawWidth > maxWidth || drawHeight > maxHeight) {
        const ratio = Math.min(maxWidth / drawWidth, maxHeight / drawHeight)
        drawWidth *= ratio
        drawHeight *= ratio
      }

      const offsetX = (img.offsetX / 100) * pageWidth
      const offsetY = -(img.offsetY / 100) * pageHeight
      const x = (pageWidth - drawWidth) / 2 + offsetX
      const y = (pageHeight - drawHeight) / 2 + offsetY

      page.drawImage(embeddedImg, {
        x: x,
        y: y,
        width: drawWidth,
        height: drawHeight,
      })
    }

    progress.value = 90
    loadingMsg.value = '正在生成PDF文件...'

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' })
    generatedPDF.value = URL.createObjectURL(blob)

    progress.value = 100
    loadingMsg.value = 'PDF生成完成！'
  } catch (err) {
    errorMsg.value = 'PDF生成失败，请检查照片文件是否损坏'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const downloadPDF = () => {
  if (!generatedPDF.value) return
  
  const link = document.createElement('a')
  link.href = generatedPDF.value
  link.download = `photos-${Date.now()}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

watch([pageSize, pageOrientation, enableCustomBackground], () => {
  updatePreview()
})
</script>

<style scoped>
.settings-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.images-section {
  margin-top: 16px;
}

.images-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-card {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.image-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
}

.image-card.selected {
  border-color: #67c23a;
  background: #f0f9eb;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.selected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.image-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  font-size: 12px;
  color: #909399;
}

.image-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.image-order {
  display: flex;
  gap: 4px;
}

.preview-container {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.preview-pages {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: flex-start;
}

.preview-page {
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.5;
}

.preview-image {
  pointer-events: none;
}

.preview-page-num {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.size-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-preview {
  width: 100%;
  height: 200px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  position: relative;
}

.editor-preview-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-preview-content img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.editor-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  min-width: 80px;
  font-size: 14px;
  color: #606266;
}

.background-picker {
  padding: 16px 0;
}

.current-background {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.background-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.background-preview img {
  max-width: 150px;
  max-height: 100px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #ddd;
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}

.ml-3 {
  margin-left: 12px;
}

.mt-2 {
  margin-top: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
