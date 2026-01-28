<template>
  <div class="flex flex-col flex-1 mt-3">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 bg-white rounded-2xl">
      <!-- 上传区域 -->
      <div class="mb-6">
        <div class="flex gap-3 mb-2">
          <el-upload
            ref="uploadRef"
            action=""
            accept="image/*"
            :auto-upload="false"
            :on-change="onFileChange"
            :show-file-list="true"
            :limit="1"
          >
            <el-button type="primary">选择图片</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 PNG、JPG、JPEG 等格式，建议尺寸不小于 128x128px
              </div>
            </template>
          </el-upload>
          <el-button type="default" @click="resetAll">重置</el-button>
        </div>
      </div>

      <!-- 图片预览和设置 -->
      <div v-if="imageUrl" class="mb-6">
        <div class="flex flex-col gap-6 md:flex-row">
          <!-- 图片预览 -->
          <div class="flex-1">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>图片预览</span>
                </div>
              </template>
              <div class="text-center">
                <img :src="imageUrl" class="object-contain mx-auto max-w-full max-h-48 rounded border" :alt="'上传的图片'">
              </div>
            </el-card>
          </div>

          <!-- 设置选项 -->
          <div class="flex-1">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>输出设置</span>
                </div>
              </template>
              <div class="space-y-4">
                <div>
                  <el-form-item label="尺寸选择">
                    <el-select v-model="selectedSizes" multiple placeholder="选择尺寸" @change="handleSizeChange">
                      <el-option label="全部" value="all"></el-option>
                      <el-option label="16x16" value="16"></el-option>
                      <el-option label="32x32" value="32"></el-option>
                      <el-option label="48x48" value="48"></el-option>
                      <el-option label="64x64" value="64"></el-option>
                      <el-option label="128x128" value="128"></el-option>
                      <el-option label="200x200" value="200"></el-option>
                    </el-select>
                  </el-form-item>
                </div>
                <div>
                  <el-form-item label="输出格式">
                    <el-radio-group v-model="outputFormat">
                      <el-radio label="png">PNG</el-radio>
                      <el-radio label="ico">ICO</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>
                <div class="text-right">
                  <el-button type="success" @click="generateFavicon" :disabled="selectedSizes.length === 0">生成图标</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 生成结果 -->
      <div v-if="faviconImages.length" class="mb-6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>生成结果</span>
            </div>
          </template>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-6">
            <div v-for="(favicon, idx) in faviconImages" :key="idx" class="flex flex-col items-center">
              <img :src="favicon.dataUrl" :alt="favicon.size + 'x' + favicon.size" class="mb-2 rounded border" style="width: 64px; height: 64px; object-contain;">
              <span class="text-sm">{{ favicon.size }}x{{ favicon.size }}</span>
              <a :href="favicon.dataUrl" :download="'favicon-' + favicon.size + 'x' + favicon.size + '.' + outputFormat" class="mt-1">
                <el-button type="primary" size="small">下载</el-button>
              </a>
            </div>
          </div>
          <div class="flex justify-center mt-4">
            <el-button type="success" @click="downloadAll" :disabled="faviconImages.length === 0">下载全部</el-button>
          </div>
        </el-card>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="mt-3">
        <el-alert type="error" :title="errorMsg" show-icon :closable="true" @close="errorMsg = ''" />
      </div>
    </div>

    <!-- 使用说明 -->
    <ToolDetail title="使用说明">
      <el-text>
        <ul>
          <li>上传一张图片，建议尺寸不小于 128x128px，以获得最佳效果。</li>
          <li>选择需要生成的图标尺寸（16x16、32x32、48x48、64x64、128x128）。</li>
          <li>选择输出格式（PNG 或 ICO）。</li>
          <li>点击"生成图标"按钮，等待生成完成。</li>
          <li>生成后可以下载单个尺寸或全部尺寸的图标。</li>
        </ul>
      </el-text>
    </ToolDetail>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue';
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const info = reactive({
  title: "🎨 Favicon 在线制作",
});

// 图片相关
const imageUrl = ref<string>('');
const originalImage = ref<HTMLImageElement | null>(null);
const uploadRef = ref<any>(null);

// 输出设置
const selectedSizes = ref<Array<string>>(['all']);
const outputFormat = ref('ico');
const allSizes = [16, 32, 48, 64, 128, 200];

// 处理尺寸选择变化
const handleSizeChange = () => {
  // 如果包含"全部"选项，移除其他选项
  if (selectedSizes.value.includes('all')) {
    selectedSizes.value = ['all'];
  }
};

// 生成结果
const faviconImages = ref<Array<{ size: number; dataUrl: string }>>([]);
const errorMsg = ref('');

// 重置所有状态
const resetAll = () => {
  // 清除图片相关状态
  imageUrl.value = '';
  originalImage.value = null;
  
  // 清除输出设置
  selectedSizes.value = [];
  outputFormat.value = 'png';
  
  // 清除生成结果
  faviconImages.value = [];
  
  // 清除错误提示
  errorMsg.value = '';
  
  // 清除上传组件的文件列表
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 文件上传
const onFileChange = (uploadFile: any) => {
  // Element Plus Upload组件的on-change事件参数结构
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      imageUrl.value = result;
      loadImage(result);
    };
    reader.onerror = () => {
      errorMsg.value = '文件读取失败，请重试。';
    };
    reader.readAsDataURL(file);
  }
};

// 加载图片
const loadImage = (url: string) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    originalImage.value = img;
  };
  img.onerror = (e) => {
    console.error('图片加载错误:', e);
    errorMsg.value = '图片加载失败，请重试。';
  };
  img.src = url;
};

// 生成 Favicon
const generateFavicon = async () => {
  if (!originalImage.value) {
    errorMsg.value = '请先上传图片。';
    return;
  }

  if (selectedSizes.value.length === 0) {
    errorMsg.value = '请选择至少一个尺寸。';
    return;
  }

  faviconImages.value = [];
  let sizes: number[];
  let isAll = false;
  let isSingle = false;

  // 处理尺寸选择
  if (selectedSizes.value.includes('all')) {
    sizes = allSizes;
    isAll = true;
  } else {
    sizes = selectedSizes.value.map(size => Number(size));
    isSingle = sizes.length === 1;
  }

  // 生成图标
  sizes.forEach(size => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // 清除画布
      tempCtx.clearRect(0, 0, size, size);

      // 计算图片位置和尺寸
      const img = originalImage.value!;
      const aspectRatio = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      // 保持图片比例
      if (aspectRatio > 1) {
        drawHeight = drawWidth / aspectRatio;
      } else {
        drawWidth = drawHeight * aspectRatio;
      }

      // 居中绘制
      const offsetX = (size - drawWidth) / 2;
      const offsetY = (size - drawHeight) / 2;

      // 绘制图片
      tempCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      // 生成 data URL
      const dataUrl = tempCanvas.toDataURL(`image/${outputFormat.value}`);
      faviconImages.value.push({ size, dataUrl });
    }
  });

  // 如果是全部尺寸，直接下载压缩包
  if (isAll) {
    await downloadAll();
  }
  // 如果是单个尺寸，直接下载单个文件
  else if (isSingle) {
    const favicon = faviconImages.value[0];
    if (favicon) {
      const link = document.createElement('a');
      link.href = favicon.dataUrl;
      link.download = `favicon-${favicon.size}x${favicon.size}.${outputFormat.value}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

// 下载全部
const downloadAll = async () => {
  if (faviconImages.value.length === 0) return;

  try {
    const zip = new JSZip();
    const folder = zip.folder('favicon');

    for (const favicon of faviconImages.value) {
      const filename = `favicon-${favicon.size}x${favicon.size}.${outputFormat.value}`;
      // 将 data URL 转换为 blob
      const response = await fetch(favicon.dataUrl);
      const blob = await response.blob();
      folder?.file(filename, blob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'favicon-all.zip');
  } catch (err) {
    errorMsg.value = '打包下载失败，请重试。';
    console.error(err);
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.space-y-4 > div {
  margin-bottom: 16px;
}

.space-y-4 > div:last-child {
  margin-bottom: 0;
}
</style>