<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">压缩PDF文档大小，支持批量压缩，所有操作在本地完成。</el-text>
      </div>
      <div class="mb-3">
        <el-text type="info">通过降低图片质量和移除冗余数据来减小PDF文件体积。</el-text>
      </div>

      <div class="mb-4 settings-section">
        <div class="settings-row">
          <div class="setting-item">
            <span class="setting-label">压缩质量：</span>
            <el-select v-model="compressQuality" style="width: 140px">
              <el-option label="高质量 (较小压缩)" value="high" />
              <el-option label="中等质量 (推荐)" value="medium" />
              <el-option label="低质量 (最大压缩)" value="low" />
            </el-select>
          </div>
          <div class="setting-item">
            <span class="setting-label">图片质量：</span>
            <el-slider v-model="imageQuality" :min="10" :max="100" :format-tooltip="(val: number) => `${val}%`" style="width: 200px" />
          </div>
        </div>
      </div>

      <div class="mb-3">
        <el-upload
          action=""
          accept=".pdf"
          :auto-upload="false"
          :on-change="onFileChange"
          :multiple="true"
          :show-file-list="false"
        >
          <el-button type="primary">选择PDF文件</el-button>
        </el-upload>
      </div>

      <div v-if="files.length" class="mt-3">
        <div class="mb-3">
          <el-button type="success" @click="compressAllFiles" :disabled="loading">开始压缩</el-button>
          <el-button type="warning" @click="clearFiles" :disabled="loading">清空文件</el-button>
        </div>
        <div class="file-list">
          <div v-for="(file, idx) in files" :key="file.uid" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <div class="file-sizes">
                <span class="file-size">原始: {{ formatFileSize(file.size) }}</span>
                <span v-if="file.compressedSize" class="file-size compressed">
                  压缩后: {{ formatFileSize(file.compressedSize) }}
                </span>
                <span v-if="file.compressedSize" class="file-ratio" :class="getRatioClass(file)">
                  ({{ getRatio(file) }})
                </span>
              </div>
            </div>
            <div class="file-actions">
              <el-button v-if="file.compressedUrl" type="primary" size="small" @click="downloadFile(file)">下载</el-button>
              <el-button type="danger" size="small" @click="removeFile(idx)">删除</el-button>
            </div>
            <div v-if="file.status === 'processing'" class="file-status">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>压缩中...</span>
            </div>
            <div v-else-if="file.status === 'done'" class="file-status done">
              <el-icon><CircleCheck /></el-icon>
              <span>完成</span>
            </div>
            <div v-else-if="file.status === 'error'" class="file-status error">
              <el-icon><CircleClose /></el-icon>
              <span>失败</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="loadingMsg" show-icon :closable="false" />
        <el-progress :percentage="progress" :format="() => `${progress}%`" class="mt-2" />
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </div>

      <div v-if="completedCount > 0" class="mt-3">
        <el-alert type="success" :title="`成功压缩 ${completedCount} 个文件`" show-icon :closable="false" />
        <div class="mt-3">
          <el-button type="primary" @click="downloadAllFiles">全部下载</el-button>
        </div>
      </div>
    </div>

    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>点击"选择PDF文件"按钮，选择一个或多个需要压缩的PDF文件。</li>
          <li>选择压缩质量：高质量保留更多细节，低质量压缩比更大。</li>
          <li>调整图片质量滑块，控制PDF中图片的压缩程度。</li>
          <li>点击"开始压缩"按钮开始压缩过程。</li>
          <li>压缩完成后，可以单独下载每个文件或批量下载所有文件。</li>
          <li>所有压缩操作均在本地完成，不会上传到服务器。</li>
          <li>支持大部分标准PDF格式，加密或损坏的PDF可能无法正常压缩。</li>
        </ul>
      </el-text>
    </ToolDetail>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { PDFDocument } from 'pdf-lib';
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const info = reactive({
  title: "📦 PDF压缩工具",
});

interface FileItem {
  uid: string;
  name: string;
  size: number;
  raw: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  compressedSize?: number;
  compressedUrl?: string;
  compressedBytes?: Uint8Array;
}

const files = ref<FileItem[]>([]);
const loading = ref(false);
const loadingMsg = ref('');
const progress = ref(0);
const errorMsg = ref('');
const compressQuality = ref('medium');
const imageQuality = ref(70);

const completedCount = computed(() => files.value.filter(f => f.status === 'done').length);

const onFileChange = (file: any) => {
  if (!file || !file.raw) return;
  if (file.raw.type !== 'application/pdf') {
    errorMsg.value = '请选择PDF文件';
    return;
  }
  
  errorMsg.value = '';
  const newFile: FileItem = {
    uid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    size: file.size,
    raw: file.raw,
    status: 'pending'
  };
  files.value.push(newFile);
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

const getRatio = (file: FileItem): string => {
  if (!file.compressedSize) return '';
  const ratio = ((1 - file.compressedSize / file.size) * 100).toFixed(1);
  return ratio + '% 减少';
};

const getRatioClass = (file: FileItem): string => {
  if (!file.compressedSize) return '';
  const ratio = (1 - file.compressedSize / file.size) * 100;
  if (ratio >= 50) return 'ratio-high';
  if (ratio >= 20) return 'ratio-medium';
  return 'ratio-low';
};

const removeFile = (idx: number) => {
  const file = files.value[idx];
  if (file.compressedUrl) {
    URL.revokeObjectURL(file.compressedUrl);
  }
  files.value.splice(idx, 1);
};

const clearFiles = () => {
  files.value.forEach(file => {
    if (file.compressedUrl) {
      URL.revokeObjectURL(file.compressedUrl);
    }
  });
  files.value = [];
  errorMsg.value = '';
};

const compressPDF = async (file: FileItem): Promise<void> => {
  const arrayBuffer = await file.raw.arrayBuffer();
  
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const numPages = pdfJsDoc.numPages;
  
  const newPdfDoc = await PDFDocument.create();
  
  const quality = imageQuality.value / 100;
  const scale = getScaleByQuality();
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfJsDoc.getPage(i);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;
    
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;
    
    const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
    const imgBytes = await fetch(imgDataUrl).then(r => r.arrayBuffer());
    const img = await newPdfDoc.embedJpg(imgBytes);
    
    const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(img, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }
  
  const compressedBytes = await newPdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
  });
  
  const compressedSize = compressedBytes.length;
  
  const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
  const compressedUrl = URL.createObjectURL(blob);
  
  file.compressedSize = compressedSize;
  file.compressedUrl = compressedUrl;
  file.compressedBytes = compressedBytes;
};

const getScaleByQuality = (): number => {
  switch (compressQuality.value) {
    case 'high':
      return 1.5;
    case 'low':
      return 0.8;
    case 'medium':
    default:
      return 1.2;
  }
};

const compressAllFiles = async () => {
  if (files.value.length === 0) {
    errorMsg.value = '请先选择PDF文件';
    return;
  }
  
  loading.value = true;
  errorMsg.value = '';
  progress.value = 0;
  
  const pendingFiles = files.value.filter(f => f.status === 'pending' || f.status === 'error');
  
  for (let i = 0; i < pendingFiles.length; i++) {
    const file = pendingFiles[i];
    file.status = 'processing';
    loadingMsg.value = `正在压缩: ${file.name} (${i + 1}/${pendingFiles.length})`;
    
    try {
      await compressPDF(file);
      file.status = 'done';
    } catch (err) {
      file.status = 'error';
      console.error(`压缩失败: ${file.name}`, err);
    }
    
    progress.value = Math.round(((i + 1) / pendingFiles.length) * 100);
  }
  
  loading.value = false;
  loadingMsg.value = '';
};

const downloadFile = (file: FileItem) => {
  if (!file.compressedUrl) return;
  
  const link = document.createElement('a');
  link.href = file.compressedUrl;
  const baseName = file.name.replace('.pdf', '');
  link.download = `${baseName}_compressed.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadAllFiles = async () => {
  const completedFiles = files.value.filter(f => f.status === 'done' && f.compressedBytes);
  
  if (completedFiles.length === 0) {
    errorMsg.value = '没有可下载的文件';
    return;
  }
  
  if (completedFiles.length === 1) {
    downloadFile(completedFiles[0]);
    return;
  }
  
  loading.value = true;
  loadingMsg.value = '正在打包文件...';
  
  try {
    const zip = new JSZip();
    
    completedFiles.forEach(file => {
      const baseName = file.name.replace('.pdf', '');
      zip.file(`${baseName}_compressed.pdf`, file.compressedBytes!);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'compressed_pdfs.zip');
  } catch (err) {
    errorMsg.value = '打包下载失败';
    console.error(err);
  } finally {
    loading.value = false;
    loadingMsg.value = '';
  }
};
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

.file-list {
  margin-top: 18px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
  transition: background-color 0.2s;
  flex-wrap: wrap;
  gap: 12px;
}

.file-item:hover {
  background: #f0f9ff;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
  min-width: 200px;
}

.file-name {
  font-weight: 500;
  margin-right: 18px;
}

.file-sizes {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.file-size {
  color: #666;
  font-size: 14px;
}

.file-size.compressed {
  color: #67c23a;
  font-weight: 500;
}

.file-ratio {
  font-size: 14px;
  font-weight: 500;
}

.ratio-high {
  color: #67c23a;
}

.ratio-medium {
  color: #e6a23c;
}

.ratio-low {
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.file-status.done {
  color: #67c23a;
}

.file-status.error {
  color: #f56c6c;
}

.file-status .is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}

.mt-2 {
  margin-top: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
