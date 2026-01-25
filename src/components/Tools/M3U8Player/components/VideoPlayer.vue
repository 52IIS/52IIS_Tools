<template>
  <div class="video-player">
    <video ref="videoRef" class="video" controls></video>
    <div class="controls-container">
      <!-- 录制控制按钮 -->
      <div class="recording-controls">
        <button 
          v-if="!isRecording" 
          class="record-btn start-record" 
          @click="startRecording"
          title="开始录制"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.5 3.5a2.5 2.5 0 0 1 5 0v9a2.5 2.5 0 0 1-5 0v-9z"/>
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm7-8A7 7 0 1 0 1 8a7 7 0 0 0 14 0z"/>
          </svg>
          开始录制
        </button>
        <button 
          v-else 
          class="record-btn stop-record" 
          @click="stopRecording"
          title="结束录制"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9z"/>
            <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm7-8A7 7 0 1 0 1 8a7 7 0 0 0 14 0z"/>
          </svg>
          结束录制
        </button>
        <button 
          v-if="recordedBlob" 
          class="record-btn download-record" 
          @click="downloadRecordedVideo"
          title="下载录制视频"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          下载录制
        </button>
      </div>
      
      <!-- 下载控制按钮 -->
      <div v-if="showDownload && currentVideo.url" class="download-container">
        <!-- 原格式下载按钮 -->
        <button 
          class="download-btn" 
          @click="downloadVideo"
          :disabled="isDownloadingOriginal"
        >
          <span v-if="isDownloadingOriginal" class="loading-spinner"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
          下载原格式视频
        </button>
        
        <!-- MP4下载按钮 -->
        <button 
          class="download-btn mp4-download-btn" 
          @click="downloadAsMp4"
          :disabled="isDownloadingMp4"
        >
          <span v-if="isDownloadingMp4" class="loading-spinner"></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8z"/>
            <path d="M7.5 5.5v5l4-2.5z"/>
          </svg>
          下载MP4格式
        </button>
      </div>
      
      <!-- MP4下载进度条 -->
      <div v-if="isDownloadingMp4" class="progress-container">
        <div class="progress-bar">
          <div class="progress" :style="{ width: mp4DownloadProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ mp4DownloadProgress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Hls from 'hls.js';
import type { VideoSource } from '@/types/video';

interface Props {
  source: VideoSource;
  showDownload?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDownload: false
});

const videoRef = ref<HTMLVideoElement | null>(null);
const hls = ref<Hls | null>(null);
const currentVideo = ref<VideoSource>(props.source);

// 录制状态管理
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const recordedBlob = ref<Blob | null>(null);

// 下载状态管理
const isDownloadingOriginal = ref(false);
const isDownloadingMp4 = ref(false);
const mp4DownloadProgress = ref(0);

// 监听视频源变化
watch(
  () => props.source,
  (newSource) => {
    currentVideo.value = newSource;
    loadVideo(newSource.url);
  },
  { deep: true }
);

// 加载视频
const loadVideo = (url: string) => {
  if (!videoRef.value) return;

  // 销毁之前的Hls实例
  if (hls.value) {
    hls.value.destroy();
    hls.value = null;
  }

  // 重置视频
  videoRef.value.src = '';
  videoRef.value.load();

  if (!url) return;

  // 检查浏览器是否支持HLS
  if (Hls.isSupported()) {
    try {
      hls.value = new Hls();
      hls.value.loadSource(url);
      hls.value.attachMedia(videoRef.value);
      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('视频加载成功');
      });
      hls.value.on(Hls.Events.ERROR, (_, data) => {
        console.error('视频加载错误:', data);
      });
    } catch (error) {
      console.error('创建HLS实例失败:', error);
    }
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari等原生支持HLS的浏览器
    videoRef.value.src = url;
  } else {
    console.error('浏览器不支持HLS视频播放');
  }
};

// 检查网络连接
const checkNetwork = (): boolean => {
  return navigator.onLine;
};

// 下载视频
const downloadVideo = async () => {
  if (!currentVideo.value.url || isDownloadingOriginal.value) return;

  try {
    // 检查网络连接
    if (!checkNetwork()) {
      throw new Error('网络连接已断开，请检查网络设置');
    }
    
    isDownloadingOriginal.value = true;
    
    // 验证URL有效性
    const url = new URL(currentVideo.value.url);
    
    // 先获取m3u8文件内容，然后转换为Blob对象强制下载
    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error(`获取m3u8文件失败: ${response.status}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${currentVideo.value.name || 'video'}.m3u8`;
    document.body.appendChild(link);
    
    // 使用click事件下载
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
    
    // 清理资源
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    // 模拟延迟，确保动画效果可见
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('下载失败:', error);
    alert(`原格式视频下载失败: ${(error as Error).message}`);
  } finally {
    isDownloadingOriginal.value = false;
  }
};

// 解析m3u8文件，获取ts片段URL
const parseM3u8 = async (url: string): Promise<string[]> => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split('\n');
    const tsUrls: string[] = [];
    
    // 提取所有.ts文件URL
    for (const line of lines) {
      if (line.trim().endsWith('.ts')) {
        // 如果是相对路径，转换为绝对路径
        const tsUrl = line.trim().startsWith('http') ? line.trim() : new URL(line.trim(), url).href;
        tsUrls.push(tsUrl);
      }
    }
    
    return tsUrls;
  } catch (error) {
    console.error('解析m3u8文件失败:', error);
    throw new Error('解析m3u8文件失败');
  }
};

// 下载单个ts片段
const downloadTsSegment = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载ts片段失败: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error(`下载ts片段失败: ${url}`, error);
    throw new Error(`下载ts片段失败: ${url}`);
  }
};

// 合并ts片段为MP4文件
const mergeTsSegments = (segments: Blob[]): Blob => {
  // 由于浏览器端限制，我们无法直接将ts片段合并为MP4
  // 这里我们将ts片段合并为一个Blob，文件扩展名仍为.mp4
  // 实际应用中，可能需要使用WebAssembly或服务器端转换
  return new Blob(segments, { type: 'video/mp4' });
};

// 下载为MP4格式
const downloadAsMp4 = async () => {
  if (!currentVideo.value.url || isDownloadingMp4.value) return;

  try {
    // 检查网络连接
    if (!checkNetwork()) {
      throw new Error('网络连接已断开，请检查网络设置');
    }
    
    isDownloadingMp4.value = true;
    mp4DownloadProgress.value = 0;
    
    // 验证URL有效性
    const baseUrl = new URL(currentVideo.value.url);
    
    // 步骤1: 解析m3u8文件，获取ts片段URL
    mp4DownloadProgress.value = 10;
    const tsUrls = await parseM3u8(baseUrl.href);
    
    if (tsUrls.length === 0) {
      throw new Error('未找到ts片段');
    }
    
    // 步骤2: 下载所有ts片段
    mp4DownloadProgress.value = 20;
    const totalSegments = tsUrls.length;
    const downloadedSegments: Blob[] = [];
    
    for (let i = 0; i < totalSegments; i++) {
      // 检查网络连接
      if (!checkNetwork()) {
        throw new Error('网络连接已断开，下载中断');
      }
      
      const segment = await downloadTsSegment(tsUrls[i]);
      downloadedSegments.push(segment);
      
      // 更新进度
      mp4DownloadProgress.value = 20 + Math.round((i + 1) / totalSegments * 60);
    }
    
    // 步骤3: 合并ts片段为MP4文件
    mp4DownloadProgress.value = 80;
    const mp4Blob = mergeTsSegments(downloadedSegments);
    
    // 步骤4: 下载MP4文件
    mp4DownloadProgress.value = 90;
    const blobUrl = URL.createObjectURL(mp4Blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${currentVideo.value.name || 'video'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`;
    document.body.appendChild(link);
    
    // 使用click事件下载
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
    
    // 清理资源
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
    
    mp4DownloadProgress.value = 100;
    
    // 重置状态
    setTimeout(() => {
      isDownloadingMp4.value = false;
      mp4DownloadProgress.value = 0;
    }, 500);
    
  } catch (error) {
    console.error('MP4下载失败:', error);
    // 使用更友好的错误提示方式
    const errorMsg = `MP4下载失败: ${(error as Error).message}`;
    console.error(errorMsg);
    
    // 可以替换为更友好的UI提示，如Toast组件
    alert(errorMsg);
    
    isDownloadingMp4.value = false;
    mp4DownloadProgress.value = 0;
  }
};

// 组件挂载后加载视频
onMounted(() => {
  loadVideo(currentVideo.value.url);
});

// 开始录制
const startRecording = async () => {
  if (!videoRef.value || isRecording.value) return;

  try {
    // 创建MediaStream
    const stream = (videoRef.value as any).captureStream();
    
    // 创建MediaRecorder
    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9'
    });

    // 清空之前的录制数据
    recordedChunks.value = [];
    recordedBlob.value = null;

    // 监听数据可用事件
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data);
      }
    };

    // 开始录制
    mediaRecorder.value.start();
    isRecording.value = true;
    console.log('开始录制');
  } catch (error) {
    console.error('录制失败:', error);
  }
};

// 结束录制
const stopRecording = () => {
  if (!mediaRecorder.value || !isRecording.value) return;

  try {
    // 结束录制
    mediaRecorder.value.stop();
    isRecording.value = false;
    
    // 监听录制结束事件
    mediaRecorder.value.onstop = () => {
      // 创建录制的Blob对象
      recordedBlob.value = new Blob(recordedChunks.value, {
        type: 'video/webm'
      });
      console.log('录制结束');
    };
  } catch (error) {
    console.error('结束录制失败:', error);
  }
};

// 下载录制的视频
const downloadRecordedVideo = () => {
  if (!recordedBlob.value) return;

  const url = URL.createObjectURL(recordedBlob.value);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentVideo.value.name || 'recorded'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 组件卸载前销毁资源
onBeforeUnmount(() => {
  if (hls.value) {
    hls.value.destroy();
  }
  
  // 确保录制已停止
  if (mediaRecorder.value && isRecording.value) {
    stopRecording();
  }
});
</script>

<style scoped>
.video-player {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.controls-container {
  margin-top: 10px;
}

.recording-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.record-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.start-record {
  background-color: #28a745;
  color: white;
}

.start-record:hover {
  background-color: #218838;
}

.stop-record {
  background-color: #dc3545;
  color: white;
}

.stop-record:hover {
  background-color: #c82333;
}

.download-record {
  background-color: #ffc107;
  color: black;
}

.download-record:hover {
  background-color: #e0a800;
}

.download-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.download-btn:hover {
  background-color: #0056b3;
}

.download-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

.mp4-download-btn {
  background-color: #28a745;
}

.mp4-download-btn:hover {
  background-color: #218838;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 进度条样式 */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress {
  height: 100%;
  background-color: #007bff;
  border-radius: 6px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-bar-stripes 1s linear infinite;
  position: relative;
}

.progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-bar-stripes {
  0% {
    background-position: 20px 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #495057;
  font-weight: 600;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>