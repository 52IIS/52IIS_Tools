<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">将PDF文档的每一页转换为一张图片，支持本地文件。</el-text>
      </div>
      <div class="mb-3">
        <el-text type="info">即通过将PDF文档转换为图片，用户可以在不打开PDF文件的情况下直接查看文档内容。</el-text>
      </div>
      <div class="mb-3">
        <el-upload
          action=""
          accept=".pdf"
          :auto-upload="false"
          :on-change="onFileChange"
          :show-file-list="false"
        >
          <el-button type="primary">选择PDF文件</el-button>
        </el-upload>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="'正在处理，请稍候...'" show-icon :closable="false" />
      </div>

      <div v-if="images.length" class="mt-3">
        <div class="mb-3">
          <el-button type="success" @click="downloadZip">全部打包下载</el-button>
        </div>
        <div class="img-list">
          <div v-for="(img, idx) in images" :key="idx" class="img-item">
            <img :src="img" :alt="'第'+(idx+1)+'页'" @click="preview(img)" />
            <div class="img-info">
              <span>第 {{ idx + 1 }} 页</span>
              <el-button type="primary" size="small" @click="downloadSingleImage(img, idx)">下载</el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>选择本地PDF文件后，系统会自动将每一页转换为图片。</li>
          <li>支持大部分标准PDF格式，加密或损坏的PDF可能无法正常转换。</li>
          <li>转换完成后，可以单独下载每页图片或打包下载所有图片。</li>
        </ul>
      </el-text>
    </ToolDetail>

    <!-- 图片预览弹窗 -->
    <div v-if="previewImg" class="preview-mask" @click.self="previewImg = ''">
      <div class="preview-box">
        <img :src="previewImg" />
        <el-button class="close-btn" @click="previewImg = ''">×</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
// import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?url';
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const info = reactive({
  title: "📄 PDF分割照片",
});

const images = ref<string[]>([]);
const loading = ref(false);
const errorMsg = ref('');
const previewImg = ref('');

const onFileChange = async (file: any) => {
  images.value = [];
  errorMsg.value = '';
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
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context!, viewport, canvas }).promise;
      images.value.push(canvas.toDataURL('image/png'));
    }
  } catch (err) {
    errorMsg.value = 'PDF解析失败，请确认文件无损坏。';
    console.error(err);
  }
  loading.value = false;
};

function preview(img: string) {
  previewImg.value = img;
}

async function downloadZip() {
  if (!images.value.length) return;
  const zip = new JSZip();
  images.value.forEach((img, idx) => {
    zip.file(`page-${idx + 1}.png`, img.split(',')[1], { base64: true });
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'pdf-images.zip');
}

function downloadSingleImage(img: string, idx: number) {
  const link = document.createElement('a');
  link.href = img;
  link.download = `page-${idx + 1}.png`;
  link.click();
}
</script>

<style scoped>
.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: flex-start;
  margin-top: 18px;
}

.img-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fafbfc;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  max-width: 200px;
}

.img-item img {
  max-width: 180px;
  max-height: 240px;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #eee;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.img-item img:hover {
  box-shadow: 0 0 0 3px #007bff55;
}

.img-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.img-info span {
  font-size: 14px;
  color: #666;
}

.preview-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
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
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-box img {
  max-width: 80vw;
  max-height: 80vh;
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