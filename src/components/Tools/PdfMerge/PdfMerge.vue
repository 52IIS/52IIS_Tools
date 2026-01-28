<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">将多个PDF文档合并为一个PDF文档，支持本地文件。</el-text>
      </div>
      <div class="mb-3">
        <el-text type="info">通过本工具，您可以选择多个PDF文件并按照指定顺序合并为一个完整的PDF文档。</el-text>
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
          <el-button type="success" @click="mergePDFs" :disabled="loading">合并PDF文件</el-button>
          <el-button type="warning" @click="clearFiles" :disabled="loading">清空文件</el-button>
        </div>
        <div class="file-list">
          <div v-for="(file, idx) in files" :key="file.uid" class="file-item">
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <el-button type="info" size="small" @click="moveUp(idx)" :disabled="idx === 0">上移</el-button>
              <el-button type="info" size="small" @click="moveDown(idx)" :disabled="idx === files.length - 1">下移</el-button>
              <el-button type="danger" size="small" @click="removeFile(idx)">删除</el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="'正在处理，请稍候...'" show-icon :closable="false" />
      </div>

      <div v-if="mergedPDF" class="mt-3">
        <el-alert type="success" title="PDF合并成功！" show-icon :closable="false" />
        <div class="mt-3">
          <el-button type="primary" @click="downloadMergedPDF">下载合并后的PDF</el-button>
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
          <li>点击"选择PDF文件"按钮，选择多个需要合并的PDF文件。</li>
          <li>使用"上移"和"下移"按钮调整PDF文件的合并顺序。</li>
          <li>点击"合并PDF文件"按钮开始合并过程。</li>
          <li>合并完成后，点击"下载合并后的PDF"按钮保存结果。</li>
          <li>支持大部分标准PDF格式，加密或损坏的PDF可能无法正常合并。</li>
        </ul>
      </el-text>
    </ToolDetail>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { PDFDocument } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const info = reactive({
  title: "📄 PDF合并工具",
});

interface FileItem {
  uid: string;
  name: string;
  size: number;
  raw: File;
}

const files = ref<FileItem[]>([]);
const loading = ref(false);
const errorMsg = ref('');
const mergedPDF = ref('');

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
    raw: file.raw
  };
  files.value.push(newFile);
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

const moveUp = (idx: number) => {
  if (idx > 0) {
    [files.value[idx], files.value[idx - 1]] = [files.value[idx - 1], files.value[idx]];
  }
};

const moveDown = (idx: number) => {
  if (idx < files.value.length - 1) {
    [files.value[idx], files.value[idx + 1]] = [files.value[idx + 1], files.value[idx]];
  }
};

const removeFile = (idx: number) => {
  files.value.splice(idx, 1);
};

const clearFiles = () => {
  files.value = [];
  mergedPDF.value = '';
  errorMsg.value = '';
};

const mergePDFs = async () => {
  if (files.value.length < 2) {
    errorMsg.value = '请至少选择两个PDF文件进行合并';
    return;
  }
  
  loading.value = true;
  errorMsg.value = '';
  mergedPDF.value = '';
  
  try {
    // 使用pdf-lib实现真实的PDF合并
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files.value) {
      const arrayBuffer = await file.raw.arrayBuffer();
      
      // 为pdfjs-dist创建ArrayBuffer副本
      const pdfjsBuffer = arrayBuffer.slice(0);
      // 使用pdfjs-dist验证PDF文件有效性
      await pdfjsLib.getDocument({ data: pdfjsBuffer }).promise;
      
      // 为pdf-lib创建ArrayBuffer副本
      const pdfLibBuffer = arrayBuffer.slice(0);
      // 加载PDF文档
      const pdf = await PDFDocument.load(pdfLibBuffer);
      
      // 复制所有页面到合并后的PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    // 生成合并后的PDF
    const pdfBytes = await mergedPdf.save();
    
    // 创建Blob URL
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    mergedPDF.value = URL.createObjectURL(blob);
  } catch (err) {
    errorMsg.value = 'PDF合并失败，请检查文件是否损坏';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const downloadMergedPDF = () => {
  if (!mergedPDF.value) return;
  
  const link = document.createElement('a');
  link.href = mergedPDF.value;
  link.download = 'merged.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
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
}

.file-item:hover {
  background: #f0f9ff;
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-right: 18px;
}

.file-size {
  color: #666;
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}
</style>