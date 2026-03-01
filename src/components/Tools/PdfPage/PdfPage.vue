<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <div class="mb-3">
        <el-text type="info">对PDF文档进行页面管理：删除不需要的页面，或在指定位置插入其他PDF的页面。</el-text>
      </div>
      <div class="mb-3">
        <el-text type="info">所有操作均在浏览器本地完成，不上传服务器，保护您的隐私。</el-text>
      </div>
      <div class="flex flex-wrap gap-2 items-center mb-3">
        <el-upload
          action=""
          accept=".pdf"
          :auto-upload="false"
          :on-change="onFileChange"
          :show-file-list="false"
        >
          <el-button type="primary">选择PDF文件</el-button>
        </el-upload>
        <el-upload
          v-if="pdfDoc"
          action=""
          accept=".pdf"
          :auto-upload="false"
          :on-change="onInsertFileChange"
          :show-file-list="false"
        >
          <el-button type="success">插入PDF页面</el-button>
        </el-upload>
        <el-button v-if="pdfDoc" type="warning" @click="resetAll">重新选择</el-button>
      </div>

      <div v-if="loading" class="mt-3">
        <el-alert type="info" :title="loadingText" show-icon :closable="false" />
      </div>

      <div v-if="pdfDoc && pages.length" class="mt-3">
        <div class="flex flex-wrap gap-2 items-center mb-3">
          <el-button type="primary" @click="downloadPDF" :disabled="modifiedPages.length === 0">
            下载修改后的PDF
          </el-button>
          <el-tag type="info">共 {{ modifiedPages.length }} 页</el-tag>
          <el-tag v-if="deletedPages.length" type="danger">已删除 {{ deletedPages.length }} 页</el-tag>
          <el-tag v-if="insertedPages.length" type="success">已插入 {{ insertedPages.length }} 页</el-tag>
        </div>

        <div class="page-list">
          <div
            v-for="(page, idx) in pages"
            :key="page.id"
            class="page-item"
            :class="{ 'deleted': page.deleted, 'inserted': page.isInserted }"
          >
            <div class="page-preview">
              <img v-if="page.thumbnail" :src="page.thumbnail" :alt="'第' + (idx + 1) + '页'" />
              <div v-else class="page-loading">加载中...</div>
            </div>
            <div class="page-info">
              <span class="page-number">
                {{ page.isInserted ? '插入' : '原' }}第 {{ page.originalIndex ?? idx + 1 }} 页
              </span>
              <span v-if="page.deleted" class="deleted-tag">已删除</span>
              <span v-if="page.isInserted" class="inserted-tag">已插入</span>
            </div>
            <div class="page-actions">
              <el-button
                v-if="!page.deleted"
                type="danger"
                size="small"
                @click="deletePage(idx)"
              >删除</el-button>
              <el-button
                v-else
                type="success"
                size="small"
                @click="restorePage(idx)"
              >恢复</el-button>
              <el-button
                type="info"
                size="small"
                @click="movePageUp(idx)"
                :disabled="idx === 0"
              >上移</el-button>
              <el-button
                type="info"
                size="small"
                @click="movePageDown(idx)"
                :disabled="idx === pages.length - 1"
              >下移</el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="insertDialogVisible" class="insert-dialog-mask">
        <div class="insert-dialog">
          <div class="insert-dialog-header">
            <span>选择要插入的页面</span>
            <el-button type="info" size="small" @click="insertDialogVisible = false">取消</el-button>
          </div>
          <div class="insert-dialog-body">
            <div class="insert-position">
              <span>插入位置：</span>
              <el-select v-model="insertPosition" style="width: 150px">
                <el-option label="最前面" :value="0" />
                <el-option v-for="pos in pages.length" :key="pos" :label="`第 ${pos} 页之后`" :value="pos" />
              </el-select>
            </div>
            <div class="insert-pages">
              <div
                v-for="(page, idx) in insertPages"
                :key="'insert-' + idx"
                class="insert-page-item"
                :class="{ 'selected': selectedInsertPages.includes(idx) }"
                @click="toggleInsertPage(idx)"
              >
                <img :src="page.thumbnail" :alt="'插入页' + (idx + 1)" />
                <div class="insert-page-check" v-if="selectedInsertPages.includes(idx)">✓</div>
              </div>
            </div>
          </div>
          <div class="insert-dialog-footer">
            <el-button type="primary" @click="confirmInsert" :disabled="selectedInsertPages.length === 0">
              插入选中的 {{ selectedInsertPages.length }} 页
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </div>
    </div>

    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>选择PDF文件后，系统会显示所有页面的缩略图。</li>
          <li>点击"删除"按钮可以标记删除该页面，点击"恢复"可以取消删除。</li>
          <li>点击"插入PDF页面"可以选择另一个PDF文件，将其页面插入到当前位置。</li>
          <li>使用"上移"和"下移"按钮可以调整页面顺序。</li>
          <li>完成编辑后，点击"下载修改后的PDF"保存结果。</li>
          <li>所有操作均在浏览器本地完成，不会上传到服务器。</li>
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

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const info = reactive({
  title: "📄 PDF页面管理",
});

interface PageItem {
  id: string;
  thumbnail: string;
  deleted: boolean;
  originalIndex: number | null;
  isInserted: boolean;
  sourcePdf?: ArrayBuffer;
  sourcePageIndex?: number;
}

const pages = ref<PageItem[]>([]);
const pdfDoc = ref<ArrayBuffer | null>(null);
const loading = ref(false);
const loadingText = ref('正在处理...');
const errorMsg = ref('');

const insertDialogVisible = ref(false);
const insertPages = ref<{ thumbnail: string; sourcePdf: ArrayBuffer; sourcePageIndex: number }[]>([]);
const insertPosition = ref(0);
const selectedInsertPages = ref<number[]>([]);

const deletedPages = computed(() => pages.value.filter(p => p.deleted));
const insertedPages = computed(() => pages.value.filter(p => p.isInserted));
const modifiedPages = computed(() => pages.value.filter(p => !p.deleted));

const onFileChange = async (file: any) => {
  if (!file || !file.raw) return;
  const rawFile = file.raw;
  if (rawFile.type !== 'application/pdf') {
    errorMsg.value = '请选择PDF文件';
    return;
  }

  loading.value = true;
  loadingText.value = '正在加载PDF...';
  errorMsg.value = '';
  pages.value = [];

  try {
    const arrayBuffer = await rawFile.arrayBuffer();
    pdfDoc.value = arrayBuffer.slice(0);
    await loadPdfPages(arrayBuffer, false);
  } catch (err) {
    errorMsg.value = 'PDF解析失败，请确认文件无损坏。';
    console.error(err);
  }
  loading.value = false;
};

const loadPdfPages = async (arrayBuffer: ArrayBuffer, isInserted: boolean) => {
  const savedBuffer = isInserted ? arrayBuffer.slice(0) : undefined;
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const newPages: PageItem[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    loadingText.value = `正在加载第 ${i}/${pdf.numPages} 页...`;
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context!, viewport, canvas }).promise;

    newPages.push({
      id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      thumbnail: canvas.toDataURL('image/png'),
      deleted: false,
      originalIndex: isInserted ? null : i,
      isInserted,
      sourcePdf: savedBuffer,
      sourcePageIndex: isInserted ? i - 1 : undefined,
    });
  }

  if (isInserted) {
    insertPages.value = newPages.map(p => ({
      thumbnail: p.thumbnail,
      sourcePdf: p.sourcePdf!,
      sourcePageIndex: p.sourcePageIndex!,
    }));
    insertPosition.value = 0;
    selectedInsertPages.value = [];
    insertDialogVisible.value = true;
  } else {
    pages.value = newPages;
  }
};

const onInsertFileChange = async (file: any) => {
  if (!file || !file.raw) return;
  const rawFile = file.raw;
  if (rawFile.type !== 'application/pdf') {
    errorMsg.value = '请选择PDF文件';
    return;
  }

  loading.value = true;
  loadingText.value = '正在加载插入的PDF...';
  errorMsg.value = '';

  try {
    const arrayBuffer = await rawFile.arrayBuffer();
    await loadPdfPages(arrayBuffer, true);
  } catch (err) {
    errorMsg.value = 'PDF解析失败，请确认文件无损坏。';
    console.error(err);
  }
  loading.value = false;
};

const toggleInsertPage = (idx: number) => {
  const index = selectedInsertPages.value.indexOf(idx);
  if (index > -1) {
    selectedInsertPages.value.splice(index, 1);
  } else {
    selectedInsertPages.value.push(idx);
  }
};

const confirmInsert = async () => {
  const sortedIndexes = [...selectedInsertPages.value].sort((a, b) => a - b);
  const newPages: PageItem[] = [];

  for (const idx of sortedIndexes) {
    const pageData = insertPages.value[idx];
    newPages.push({
      id: `insert-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
      thumbnail: pageData.thumbnail,
      deleted: false,
      originalIndex: null,
      isInserted: true,
      sourcePdf: pageData.sourcePdf,
      sourcePageIndex: pageData.sourcePageIndex,
    });
  }

  pages.value.splice(insertPosition.value, 0, ...newPages);
  insertDialogVisible.value = false;
  insertPages.value = [];
  selectedInsertPages.value = [];
};

const deletePage = (idx: number) => {
  pages.value[idx].deleted = true;
};

const restorePage = (idx: number) => {
  pages.value[idx].deleted = false;
};

const movePageUp = (idx: number) => {
  if (idx > 0) {
    [pages.value[idx], pages.value[idx - 1]] = [pages.value[idx - 1], pages.value[idx]];
  }
};

const movePageDown = (idx: number) => {
  if (idx < pages.value.length - 1) {
    [pages.value[idx], pages.value[idx + 1]] = [pages.value[idx + 1], pages.value[idx]];
  }
};

const resetAll = () => {
  pages.value = [];
  pdfDoc.value = null;
  errorMsg.value = '';
};

const downloadPDF = async () => {
  const activePages = pages.value.filter(p => !p.deleted);
  if (activePages.length === 0) {
    errorMsg.value = '没有可下载的页面';
    return;
  }

  loading.value = true;
  loadingText.value = '正在生成PDF...';

  try {
    const newPdf = await PDFDocument.create();

    if (pdfDoc.value) {
      const originalPdf = await PDFDocument.load(pdfDoc.value);
      const insertedPdfs = new Map<ArrayBuffer, PDFDocument>();

      for (const page of activePages) {
        if (page.isInserted && page.sourcePdf) {
          let insertedPdf = insertedPdfs.get(page.sourcePdf);
          if (!insertedPdf) {
            insertedPdf = await PDFDocument.load(page.sourcePdf);
            insertedPdfs.set(page.sourcePdf, insertedPdf);
          }
          const [copiedPage] = await newPdf.copyPages(insertedPdf, [page.sourcePageIndex!]);
          newPdf.addPage(copiedPage);
        } else if (page.originalIndex !== null) {
          const [copiedPage] = await newPdf.copyPages(originalPdf, [page.originalIndex - 1]);
          newPdf.addPage(copiedPage);
        }
      }
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'modified.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    errorMsg.value = 'PDF生成失败，请重试。';
    console.error(err);
  }
  loading.value = false;
};
</script>

<style scoped>
.page-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.page-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fafbfc;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
  transition: all 0.2s;
  width: 160px;
}

.page-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-item.deleted {
  border-color: #f56c6c;
  background: #fef0f0;
  opacity: 0.7;
}

.page-item.inserted {
  border-color: #67c23a;
  background: #f0f9eb;
}

.page-preview {
  width: 120px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.page-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.page-loading {
  color: #999;
  font-size: 14px;
}

.page-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.page-number {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.deleted-tag {
  font-size: 12px;
  color: #f56c6c;
}

.inserted-tag {
  font-size: 12px;
  color: #67c23a;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.insert-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insert-dialog {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.insert-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: 500;
}

.insert-dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.insert-position {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.insert-pages {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.insert-page-item {
  width: 100px;
  height: 130px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  position: relative;
  transition: all 0.2s;
}

.insert-page-item:hover {
  border-color: #409eff;
}

.insert-page-item.selected {
  border-color: #67c23a;
}

.insert-page-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f5f5f5;
}

.insert-page-check {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 24px;
  height: 24px;
  background: #67c23a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.insert-dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

ul {
  padding-left: 20px;
  margin: 0;
  line-height: 1.7;
}
</style>
