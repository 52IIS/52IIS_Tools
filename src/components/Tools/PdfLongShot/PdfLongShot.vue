<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">将PDF文档的所有页面垂直拼接成一张长截图，方便分享和查看。</el-text>
      </div>
      <div class="mb-3">
        <el-text type="info">支持本地PDF文件，所有处理均在浏览器本地完成，不上传服务器。</el-text>
      </div>
      <div class="mb-3 flex items-center gap-4 flex-wrap">
        <el-upload
          action=""
          accept=".pdf"
          :auto-upload="false"
          :on-change="onFileChange"
          :show-file-list="false"
        >
          <el-button type="primary">选择PDF文件</el-button>
        </el-upload>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">缩放比例:</span>
          <el-select v-model="scale" style="width: 100px" :disabled="loading">
            <el-option label="1x" :value="1" />
            <el-option label="1.5x" :value="1.5" />
            <el-option label="2x" :value="2" />
            <el-option label="3x" :value="3" />
          </el-select>
        </div>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="progressText" show-icon :closable="false" />
        <el-progress :percentage="progress" :stroke-width="10" class="mt-2" />
      </div>

      <div v-if="longImage" class="mt-3">
        <div class="mb-3 flex items-center gap-2 flex-wrap">
          <el-button type="success" @click="downloadImage">下载长截图</el-button>
          <el-button type="primary" @click="previewImage">预览大图</el-button>
          <el-tag type="info">{{ imageInfo }}</el-tag>
        </div>
        <div class="preview-container">
          <img :src="longImage" alt="PDF长截图" class="preview-img" @click="previewImage" />
        </div>
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </div>
    </div>

    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>选择本地PDF文件后，系统会自动将所有页面拼接成一张长截图。</li>
          <li>可以选择不同的缩放比例，比例越高图片越清晰但文件越大。</li>
          <li>支持大部分标准PDF格式，加密或损坏的PDF可能无法正常转换。</li>
          <li>转换完成后，可以下载长截图或预览大图。</li>
          <li>所有处理均在浏览器本地完成，不会上传到服务器，保护您的隐私。</li>
        </ul>
      </el-text>
    </ToolDetail>

    <div v-if="showPreview" class="preview-mask" @click.self="showPreview = false">
      <div class="preview-box">
        <img :src="longImage" />
        <el-button class="close-btn" @click="showPreview = false">×</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const info = reactive({
  title: "📄 PDF长截图",
});

const longImage = ref<string>('');
const loading = ref(false);
const errorMsg = ref('');
const showPreview = ref(false);
const scale = ref(2);
const progress = ref(0);
const totalPages = ref(0);
const currentPage = ref(0);

const progressText = computed(() => {
  if (totalPages.value > 0) {
    return `正在处理第 ${currentPage.value}/${totalPages.value} 页...`;
  }
  return '正在处理，请稍候...';
});

const imageInfo = computed(() => {
  if (!longImage.value) return '';
  const img = new Image();
  img.src = longImage.value;
  return `${img.naturalWidth} × ${img.naturalHeight} 像素`;
});

const onFileChange = async (file: any) => {
  longImage.value = '';
  errorMsg.value = '';
  progress.value = 0;
  currentPage.value = 0;
  totalPages.value = 0;

  if (!file || !file.raw) return;
  const rawFile = file.raw;
  if (rawFile.type !== 'application/pdf') {
    errorMsg.value = '请选择PDF文件';
    return;
  }

  loading.value = true;
  try {
    const arrayBuffer = await rawFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    totalPages.value = pdf.numPages;

    const pageCanvases: HTMLCanvasElement[] = [];
    let maxWidth = 0;
    let totalHeight = 0;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: scale.value });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context!, viewport, canvas }).promise;
      pageCanvases.push(canvas);
      maxWidth = Math.max(maxWidth, canvas.width);
      totalHeight += canvas.height;
      currentPage.value = i;
      progress.value = Math.round((i / pdf.numPages) * 80);
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = maxWidth;
    finalCanvas.height = totalHeight;
    const finalContext = finalCanvas.getContext('2d')!;

    finalContext.fillStyle = '#ffffff';
    finalContext.fillRect(0, 0, maxWidth, totalHeight);

    let yOffset = 0;
    for (const pageCanvas of pageCanvases) {
      const x = (maxWidth - pageCanvas.width) / 2;
      finalContext.drawImage(pageCanvas, x, yOffset);
      yOffset += pageCanvas.height;
    }

    progress.value = 100;
    longImage.value = finalCanvas.toDataURL('image/png');
  } catch (err) {
    errorMsg.value = 'PDF解析失败，请确认文件无损坏。';
    console.error(err);
  }
  loading.value = false;
};

function previewImage() {
  showPreview.value = true;
}

function downloadImage() {
  if (!longImage.value) return;
  const link = document.createElement('a');
  link.href = longImage.value;
  link.download = 'pdf-long-screenshot.png';
  link.click();
}
</script>

<style scoped>
.preview-container {
  margin-top: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fafbfc;
  max-height: 400px;
  overflow-y: auto;
}

.preview-img {
  max-width: 100%;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.preview-img:hover {
  opacity: 0.9;
}

.preview-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-box {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.preview-box img {
  max-width: 80vw;
  border-radius: 6px;
  background: #eee;
}

.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  background: #e74c3c !important;
  color: #fff !important;
  border: none !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  font-size: 22px !important;
  cursor: pointer !important;
  line-height: 32px !important;
  text-align: center !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}
</style>
